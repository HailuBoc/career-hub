const express = require('express');
const router = express.Router();
const { toggleSaveJob, getSavedJobs } = require('../controllers/savedJob.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getSavedJobs);
router.post('/:jobId', authenticate, toggleSaveJob);

module.exports = router;
