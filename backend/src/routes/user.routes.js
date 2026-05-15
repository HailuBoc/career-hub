const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage, uploadResume } = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadAvatar, uploadResume: uploadResumeCtrl,
  changePassword, completeOnboarding, getAllUsers, toggleUserStatus,
} = require('../controllers/user.controller');

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', uploadImage.single('avatar'), uploadAvatar);
router.post('/resume', uploadResume.single('resume'), uploadResumeCtrl);
router.put('/change-password', changePassword);
router.put('/onboarding', completeOnboarding);

// Admin routes
router.get('/', authorize('ADMIN'), getAllUsers);
router.put('/:id/status', authorize('ADMIN'), toggleUserStatus);

module.exports = router;
