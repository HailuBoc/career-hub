const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyBySlug, createOrUpdateCompany, uploadCompanyLogo, getMyCompany } = require('../controllers/company.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getCompanies);
router.get('/my', authenticate, authorize('RECRUITER', 'ADMIN'), getMyCompany);
router.get('/:slug', getCompanyBySlug);
router.post('/', authenticate, authorize('RECRUITER', 'ADMIN'), createOrUpdateCompany);
router.put('/', authenticate, authorize('RECRUITER', 'ADMIN'), createOrUpdateCompany);
router.post('/logo', authenticate, authorize('RECRUITER', 'ADMIN'), uploadImage.single('logo'), uploadCompanyLogo);

module.exports = router;
