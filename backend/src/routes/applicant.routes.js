const express = require('express');
const router = express.Router();
const {
  getApplicants, getApplicant, createApplicant,
  updateApplicant, deleteApplicant, updateStatus,
} = require('../controllers/applicant.controller');
const { authenticate } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/',              getApplicants);          // public — for home page stats
router.get('/:id',           authenticate, getApplicant);
router.post('/',             authenticate, uploadImage.single('photo'), createApplicant);
router.put('/:id',           authenticate, uploadImage.single('photo'), updateApplicant);
router.patch('/:id/status',  authenticate, updateStatus);
router.delete('/:id',        authenticate, deleteApplicant);

module.exports = router;
