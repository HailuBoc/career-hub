const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { subscribe } = require('../controllers/newsletter.controller');
const validate = require('../middleware/validate');

router.post('/subscribe', [body('email').isEmail().normalizeEmail()], validate, subscribe);

module.exports = router;
