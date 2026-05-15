const prisma = require('../config/prisma');
const { uploadToCloudinary } = require('../services/cloudinary.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'ACTIVE') return errorResponse(res, 'Job not found or closed', 404);

    const existing = await prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId: req.user.id } },
    });
    if (existing) return errorResponse(res, 'Already applied to this job', 409);

    let resumeUrl = null;
    let resumeName = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'careerhub/resumes',
        resource_type: 'raw',
      });
      resumeUrl = result.secure_url;
      resumeName = req.file.originalname;
    } else {
      // Use profile resume
      const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
      resumeUrl = profile?.resumeUrl;
      resumeName = profile?.resumeName;
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: req.user.id,
        coverLetter,
        resumeUrl,
        resumeName,
      },
      include: {
        job: { select: { title: true, company: { select: { name: true } } } },
      },
    });

    // Notify recruiter
    const company = await prisma.company.findUnique({ where: { id: job.companyId } });
    if (company) {
      await prisma.notification.create({
        data: {
          userId: company.userId,
          title: 'New Application',
          message: `Someone applied to your job: ${job.title}`,
          type: 'application',
          link: `/dashboard/applications/${application.id}`,
        },
      });
    }

    return successResponse(res, { application }, 'Application submitted', 201);
  } catch (err) {
    next(err);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const where = { userId: req.user.id };
    if (status) where.status = status.toUpperCase();

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true, title: true, slug: true, type: true, location: true, isRemote: true,
              company: { select: { id: true, name: true, logo: true } },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return paginatedResponse(res, applications, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    // Verify recruiter owns this job
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    const job = await prisma.job.findFirst({
      where: req.user.role === 'ADMIN' ? { id: jobId } : { id: jobId, companyId: company?.id },
    });
    if (!job) return errorResponse(res, 'Job not found or unauthorized', 404);

    const where = { jobId };
    if (status) where.status = status.toUpperCase();

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true, email: true,
              profile: { select: { firstName: true, lastName: true, avatar: true, headline: true, skills: true } },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return paginatedResponse(res, applications, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: { include: { company: true } } },
    });
    if (!application) return errorResponse(res, 'Application not found', 404);

    // Verify recruiter owns the job
    if (req.user.role !== 'ADMIN' && application.job.company.userId !== req.user.id) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: status.toUpperCase(), ...(notes !== undefined && { notes }) },
    });

    // Notify applicant
    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: 'Application Update',
        message: `Your application for ${application.job.title} has been ${status.toLowerCase()}`,
        type: 'application',
        link: `/dashboard/applications`,
      },
    });

    return successResponse(res, { application: updated }, 'Status updated');
  } catch (err) {
    next(err);
  }
};

const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!application) return errorResponse(res, 'Application not found', 404);
    if (application.status !== 'PENDING') {
      return errorResponse(res, 'Cannot withdraw a processed application', 400);
    }

    await prisma.application.delete({ where: { id } });
    return successResponse(res, {}, 'Application withdrawn');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToJob, getMyApplications, getJobApplications,
  updateApplicationStatus, withdrawApplication,
};
