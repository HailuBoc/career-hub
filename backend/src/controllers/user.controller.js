const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const ApiResponse = require('../utils/apiResponse');
const bcrypt = require('bcryptjs');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        avatar: true, bio: true, phone: true, location: true, website: true,
        linkedIn: true, github: true, skills: true, resumeUrl: true,
        isEmailVerified: true, onboardingDone: true, createdAt: true,
        company: { select: { id: true, name: true, logo: true, slug: true, isVerified: true } },
        _count: { select: { applications: true, savedJobs: true } },
      },
    });
    return ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, phone, location, website, linkedIn, github, skills } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(linkedIn !== undefined && { linkedIn }),
        ...(github !== undefined && { github }),
        ...(skills && { skills }),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true, avatar: true,
        bio: true, phone: true, location: true, website: true, linkedIn: true,
        github: true, skills: true, resumeUrl: true,
      },
    });

    return ApiResponse.success(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

// POST /api/users/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return ApiResponse.error(res, 'No file uploaded', 400);

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'careerhub/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: result.secure_url },
      select: { id: true, avatar: true },
    });

    return ApiResponse.success(res, user, 'Avatar uploaded');
  } catch (error) {
    next(error);
  }
};

// POST /api/users/resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return ApiResponse.error(res, 'No file uploaded', 400);

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'careerhub/resumes',
      resource_type: 'raw',
    });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { resumeUrl: result.secure_url, resumePublicId: result.public_id },
      select: { id: true, resumeUrl: true },
    });

    return ApiResponse.success(res, user, 'Resume uploaded');
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return ApiResponse.error(res, 'Current password is incorrect', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    return ApiResponse.success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/onboarding
const completeOnboarding = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingDone: true },
    });
    return ApiResponse.success(res, null, 'Onboarding completed');
  } catch (error) {
    next(error);
  }
};

// GET /api/users — Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true, role: true,
          avatar: true, isActive: true, isEmailVerified: true, createdAt: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return ApiResponse.paginated(res, users, {
      page: parseInt(page), limit: parseInt(limit), total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id/status — Admin only
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return ApiResponse.error(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });

    return ApiResponse.success(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile, updateProfile, uploadAvatar, uploadResume,
  changePassword, completeOnboarding, getAllUsers, toggleUserStatus,
};
