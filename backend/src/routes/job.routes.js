const express = require('express');
const router = express.Router();
const { getJobs, createJob, updateJob, deleteJob } = require('../controllers/job.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', getJobs); // public — for dropdown in forms
router.post('/',    authenticate, createJob);
router.put('/:id',  authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);

module.exports = router;
