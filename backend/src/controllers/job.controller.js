const { queryOne, queryAll } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { v4: uuidv4 } = require('uuid');

const getJobs = async (req, res, next) => {
  try {
    const jobs = await queryAll(
      `SELECT j.*, COUNT(a.id)::int as "applicantCount"
       FROM jobs j
       LEFT JOIN applicants a ON a."jobId" = j.id
       WHERE j."isActive" = true
       GROUP BY j.id
       ORDER BY j.title ASC`
    );
    return successResponse(res, { jobs });
  } catch (err) {
    next(err);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { title, category, description, location } = req.body;
    if (!title || !category) return errorResponse(res, 'Title and category are required', 400);

    const id = uuidv4();
    const now = new Date().toISOString();
    const job = await queryOne(
      `INSERT INTO jobs (id, title, category, description, location, "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,true,$6,$7) RETURNING *`,
      [id, title, category, description || null, location || null, now, now]
    );
    return successResponse(res, { job }, 'Job created', 201);
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, description, location, isActive } = req.body;
    const now = new Date().toISOString();

    const job = await queryOne(
      `UPDATE jobs SET
        title       = COALESCE($1, title),
        category    = COALESCE($2, category),
        description = COALESCE($3, description),
        location    = COALESCE($4, location),
        "isActive"  = COALESCE($5, "isActive"),
        "updatedAt" = $6
       WHERE id = $7 RETURNING *`,
      [title || null, category || null, description || null, location || null, isActive ?? null, now, id]
    );
    if (!job) return errorResponse(res, 'Job not found', 404);
    return successResponse(res, { job }, 'Job updated');
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await queryOne('DELETE FROM jobs WHERE id = $1 RETURNING id', [req.params.id]);
    if (!job) return errorResponse(res, 'Job not found', 404);
    return successResponse(res, {}, 'Job deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getJobs, createJob, updateJob, deleteJob };
