const { queryOne, queryAll, queryCount } = require('../config/db');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

const ITEMS_PER_COLUMN = 10;

const getApplicants = async (req, res, next) => {
  try {
    const acceptedPage = Math.max(1, parseInt(req.query.acceptedPage) || 1);
    const pendingPage  = Math.max(1, parseInt(req.query.pendingPage)  || 1);
    const rejectedPage = Math.max(1, parseInt(req.query.rejectedPage) || 1);
    const search = req.query.search?.trim() || '';

    const buildWhere = (status, params) => {
      let where = `a.status = $${params.length + 1}`;
      params.push(status);
      if (search) {
        where += ` AND (a."firstName" ILIKE $${params.length + 1} OR a."lastName" ILIKE $${params.length + 2} OR a."passportNo" ILIKE $${params.length + 3})`;
        const s = `%${search}%`;
        params.push(s, s, s);
      }
      return where;
    };

    const fetchColumn = async (status, page) => {
      const countParams = [];
      const countWhere = buildWhere(status, countParams);
      const total = await queryCount(
        `SELECT COUNT(*) FROM applicants a WHERE ${countWhere}`,
        countParams
      );

      const dataParams = [];
      const dataWhere = buildWhere(status, dataParams);
      dataParams.push(ITEMS_PER_COLUMN, (page - 1) * ITEMS_PER_COLUMN);
      const data = await queryAll(
        `SELECT a.*, j.title as "jobTitle", j.id as "jobId_ref"
         FROM applicants a
         LEFT JOIN jobs j ON a."jobId" = j.id
         WHERE ${dataWhere}
         ORDER BY a."createdAt" DESC
         LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
        dataParams
      );

      // Shape job relation
      const shaped = data.map((r) => ({
        ...r,
        job: r.jobId ? { id: r.jobId, title: r.jobTitle } : null,
        jobTitle: undefined,
        jobId_ref: undefined,
      }));

      return {
        data: shaped,
        total,
        page,
        totalPages: Math.ceil(total / ITEMS_PER_COLUMN) || 1,
      };
    };

    const [accepted, pending, rejected] = await Promise.all([
      fetchColumn('ACCEPTED', acceptedPage),
      fetchColumn('PENDING',  pendingPage),
      fetchColumn('REJECTED', rejectedPage),
    ]);

    return successResponse(res, { accepted, pending, rejected });
  } catch (err) {
    next(err);
  }
};

const getApplicant = async (req, res, next) => {
  try {
    const row = await queryOne(
      `SELECT a.*, j.title as "jobTitle"
       FROM applicants a LEFT JOIN jobs j ON a."jobId" = j.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!row) return errorResponse(res, 'Applicant not found', 404);
    const applicant = { ...row, job: row.jobId ? { id: row.jobId, title: row.jobTitle } : null };
    return successResponse(res, { applicant });
  } catch (err) {
    next(err);
  }
};

const createApplicant = async (req, res, next) => {
  try {
    const { firstName, lastName, age, gender, passportNo, jobId, status, notes } = req.body;

    if (!firstName || !lastName || !age || !gender || !passportNo) {
      return errorResponse(res, 'firstName, lastName, age, gender and passportNo are required', 400);
    }

    const existing = await queryOne('SELECT id FROM applicants WHERE "passportNo" = $1', [passportNo]);
    if (existing) return errorResponse(res, 'Passport number already registered', 409);

    let photo = null, photoPublicId = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'applicanthub/photos',
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
      });
      photo = result.secure_url;
      photoPublicId = result.public_id;
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const genderVal = gender.toUpperCase();
    const statusVal = (status || 'PENDING').toUpperCase();

    await queryOne(
      `INSERT INTO applicants (id, "firstName", "lastName", age, gender, "passportNo", photo, "photoPublicId", "jobId", status, notes, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [id, firstName, lastName, parseInt(age), genderVal, passportNo, photo, photoPublicId, jobId || null, statusVal, notes || null, now, now]
    );

    const applicant = await queryOne(
      `SELECT a.*, j.title as "jobTitle" FROM applicants a LEFT JOIN jobs j ON a."jobId" = j.id WHERE a.id = $1`,
      [id]
    );

    return successResponse(res, {
      applicant: { ...applicant, job: applicant.jobId ? { id: applicant.jobId, title: applicant.jobTitle } : null }
    }, 'Applicant created', 201);
  } catch (err) {
    next(err);
  }
};

const updateApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM applicants WHERE id = $1', [id]);
    if (!existing) return errorResponse(res, 'Applicant not found', 404);

    let photo = existing.photo, photoPublicId = existing.photoPublicId;
    if (req.file) {
      if (photoPublicId) await deleteFromCloudinary(photoPublicId).catch(console.error);
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'applicanthub/photos',
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
      });
      photo = result.secure_url;
      photoPublicId = result.public_id;
    }

    const { firstName, lastName, age, gender, passportNo, jobId, status, notes } = req.body;
    const now = new Date().toISOString();

    const applicant = await queryOne(
      `UPDATE applicants SET
        "firstName"     = COALESCE($1, "firstName"),
        "lastName"      = COALESCE($2, "lastName"),
        age             = COALESCE($3, age),
        gender          = COALESCE($4, gender),
        "passportNo"    = COALESCE($5, "passportNo"),
        photo           = $6,
        "photoPublicId" = $7,
        "jobId"         = $8,
        status          = COALESCE($9, status),
        notes           = $10,
        "updatedAt"     = $11
       WHERE id = $12 RETURNING *`,
      [
        firstName || null,
        lastName  || null,
        age ? parseInt(age) : null,
        gender ? gender.toUpperCase() : null,
        passportNo || null,
        photo,
        photoPublicId,
        jobId !== undefined ? (jobId || null) : existing.jobId,
        status ? status.toUpperCase() : null,
        notes !== undefined ? notes : existing.notes,
        now,
        id,
      ]
    );

    const withJob = await queryOne(
      `SELECT a.*, j.title as "jobTitle" FROM applicants a LEFT JOIN jobs j ON a."jobId" = j.id WHERE a.id = $1`,
      [id]
    );

    return successResponse(res, {
      applicant: { ...withJob, job: withJob.jobId ? { id: withJob.jobId, title: withJob.jobTitle } : null }
    }, 'Applicant updated');
  } catch (err) {
    next(err);
  }
};

const deleteApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicant = await queryOne('SELECT * FROM applicants WHERE id = $1', [id]);
    if (!applicant) return errorResponse(res, 'Applicant not found', 404);

    if (applicant.photoPublicId) {
      await deleteFromCloudinary(applicant.photoPublicId).catch(console.error);
    }

    await queryOne('DELETE FROM applicants WHERE id = $1', [id]);
    return successResponse(res, {}, 'Applicant deleted');
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const valid = ['PENDING', 'ACCEPTED', 'REJECTED'];
    if (!valid.includes(status?.toUpperCase())) {
      return errorResponse(res, 'Invalid status. Must be PENDING, ACCEPTED or REJECTED', 400);
    }

    const applicant = await queryOne(
      `UPDATE applicants SET status = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *`,
      [status.toUpperCase(), new Date().toISOString(), id]
    );
    if (!applicant) return errorResponse(res, 'Applicant not found', 404);

    return successResponse(res, { applicant }, 'Status updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getApplicants, getApplicant, createApplicant, updateApplicant, deleteApplicant, updateStatus };
