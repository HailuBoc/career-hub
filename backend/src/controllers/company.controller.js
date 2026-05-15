const prisma = require('../config/prisma');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getCompanies = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, industry } = req.query;

    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (industry) where.industry = { equals: industry, mode: 'insensitive' };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { jobs: true, reviews: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return paginatedResponse(res, companies, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getCompanyBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { status: 'ACTIVE' },
          take: 6,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { profile: { select: { firstName: true, lastName: true, avatar: true } } },
            },
          },
        },
        _count: { select: { jobs: true, reviews: true } },
      },
    });

    if (!company) return errorResponse(res, 'Company not found', 404);
    return successResponse(res, { company });
  } catch (err) {
    next(err);
  }
};

const createOrUpdateCompany = async (req, res, next) => {
  try {
    const { name, description, website, industry, size, founded, location, linkedin, twitter } = req.body;

    const existing = await prisma.company.findUnique({ where: { userId: req.user.id } });

    if (existing) {
      const updated = await prisma.company.update({
        where: { userId: req.user.id },
        data: { name, description, website, industry, size, founded: founded ? parseInt(founded) : null, location, linkedin, twitter },
      });
      return successResponse(res, { company: updated }, 'Company updated');
    }

    const baseSlug = slugify(name, { lower: true, strict: true });
    const slug = `${baseSlug}-${uuidv4().slice(0, 6)}`;

    const company = await prisma.company.create({
      data: {
        userId: req.user.id,
        name,
        slug,
        description,
        website,
        industry,
        size,
        founded: founded ? parseInt(founded) : null,
        location,
        linkedin,
        twitter,
      },
    });

    return successResponse(res, { company }, 'Company created', 201);
  } catch (err) {
    next(err);
  }
};

const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);

    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return errorResponse(res, 'Company not found', 404);

    if (company.logoPublicId) {
      await deleteFromCloudinary(company.logoPublicId).catch(console.error);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'careerhub/logos',
      transformation: [{ width: 300, height: 300, crop: 'fill' }],
    });

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { logo: result.secure_url, logoPublicId: result.public_id },
    });

    return successResponse(res, { logo: updated.logo }, 'Logo uploaded');
  } catch (err) {
    next(err);
  }
};

const getMyCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id },
      include: { _count: { select: { jobs: true, reviews: true } } },
    });
    if (!company) return errorResponse(res, 'No company profile found', 404);
    return successResponse(res, { company });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCompanies, getCompanyBySlug, createOrUpdateCompany, uploadCompanyLogo, getMyCompany };
