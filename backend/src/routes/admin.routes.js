const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, toggleUserStatus, adminDeleteJob, getAllJobs } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', adminDeleteJob);

module.exports = router;
