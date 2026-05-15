const prisma = require('../config/prisma');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalJobs, totalApplications, totalCompanies,
      recentUsers, recentJobs, jobsByCategory, applicationsByStatus,
      monthlySignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.company.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, createdAt: true, profile: { select: { firstName: true, lastName: true, avatar: true } } },
      }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { company: { select: { name: true } } },
      }),
      prisma.job.groupBy({ by: ['category'], _count: { category: true }, orderBy: { _count: { category: 'desc' } }, take: 8 }),
      prisma.application.groupBy({ by: ['status'], _count: { status: true } }),
      // Monthly signups for last 6 months
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
        FROM users
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    return successResponse(res, {
      stats: { totalUsers, totalJobs, totalApplications, totalCompanies },
      recentUsers,
      recentJobs,
      jobsByCategory,
      applicationsByStatus,
      monthlySignups,
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, role } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (role) where.role = role.toUpperCase();

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, isActive: true, isEmailVerified: true, createdAt: true,
          profile: { select: { firstName: true, lastName: true, avatar: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(res, users, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return errorResponse(res, 'Cannot deactivate yourself', 400);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return errorResponse(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return successResponse(res, { isActive: updated.isActive }, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};

const adminDeleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({ where: { id } });
    return successResponse(res, {}, 'Job deleted');
  } catch (err) {
    next(err);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, status } = req.query;

    const where = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (status) where.status = status.toUpperCase();

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { name: true, logo: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return paginatedResponse(res, jobs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getUsers, toggleUserStatus, adminDeleteJob, getAllJobs };
