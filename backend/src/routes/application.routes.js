const express = require('express');
const router = express.Router();
const {
  applyToJob, getMyApplications, getJobApplications,
  updateApplicationStatus, withdrawApplication,
} = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

router.get('/my', authenticate, getMyApplications);
router.post('/job/:jobId', authenticate, authorize('JOBSEEKER'), uploadResume.single('resume'), applyToJob);
router.get('/job/:jobId', authenticate, authorize('RECRUITER', 'ADMIN'), getJobApplications);
router.put('/:id/status', authenticate, authorize('RECRUITER', 'ADMIN'), updateApplicationStatus);
router.delete('/:id', authenticate, authorize('JOBSEEKER'), withdrawApplication);

module.exports = router;
