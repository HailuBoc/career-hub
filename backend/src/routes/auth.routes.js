const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { login, refreshToken, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Admin login — only password sent from client
router.post('/login', [
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, getMe);

module.exports = router;
