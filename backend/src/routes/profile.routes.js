const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar, uploadResume, completeOnboarding } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth');
const { uploadImage, uploadResume: uploadResumeMiddleware } = require('../middleware/upload');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
router.post('/avatar', authenticate, uploadImage.single('avatar'), uploadAvatar);
router.post('/resume', authenticate, uploadResumeMiddleware.single('resume'), uploadResume);
router.post('/onboarding', authenticate, completeOnboarding);

module.exports = router;
