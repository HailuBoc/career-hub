const prisma = require('../config/prisma');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getProfile = async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { email: true, role: true, isEmailVerified: true } } },
    });
    if (!profile) return errorResponse(res, 'Profile not found', 404);
    return successResponse(res, { profile });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName, lastName, headline, bio, phone, location,
      website, linkedin, github, skills, experience, education,
    } = req.body;

    const profile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(headline !== undefined && { headline }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(linkedin !== undefined && { linkedin }),
        ...(github !== undefined && { github }),
        ...(skills !== undefined && { skills }),
        ...(experience !== undefined && { experience }),
        ...(education !== undefined && { education }),
      },
    });

    return successResponse(res, { profile }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);

    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });

    // Delete old avatar
    if (profile?.avatarPublicId) {
      await deleteFromCloudinary(profile.avatarPublicId).catch(console.error);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'careerhub/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { avatar: result.secure_url, avatarPublicId: result.public_id },
    });

    return successResponse(res, { avatar: updated.avatar }, 'Avatar uploaded');
  } catch (err) {
    next(err);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);

    const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });

    if (profile?.resumePublicId) {
      await deleteFromCloudinary(profile.resumePublicId).catch(console.error);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'careerhub/resumes',
      resource_type: 'raw',
    });

    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        resumeUrl: result.secure_url,
        resumePublicId: result.public_id,
        resumeName: req.file.originalname,
      },
    });

    return successResponse(res, {
      resumeUrl: updated.resumeUrl,
      resumeName: updated.resumeName,
    }, 'Resume uploaded');
  } catch (err) {
    next(err);
  }
};

const completeOnboarding = async (req, res, next) => {
  try {
    const { step } = req.body;
    const isDone = step >= 3;

    const profile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { onboardingStep: step, onboardingDone: isDone },
    });

    return successResponse(res, { profile }, isDone ? 'Onboarding complete' : 'Step saved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, uploadResume, completeOnboarding };
