const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return errorResponse(res, 'Job not found', 404);

    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: req.user.id, jobId } },
    });

    if (existing) {
      await prisma.savedJob.delete({ where: { id: existing.id } });
      return successResponse(res, { saved: false }, 'Job unsaved');
    }

    await prisma.savedJob.create({ data: { userId: req.user.id, jobId } });
    return successResponse(res, { saved: true }, 'Job saved');
  } catch (err) {
    next(err);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true, logo: true, location: true } },
            },
          },
        },
      }),
      prisma.savedJob.count({ where: { userId: req.user.id } }),
    ]);

    return paginatedResponse(res, savedJobs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleSaveJob, getSavedJobs };
