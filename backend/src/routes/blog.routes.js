const express = require('express');
const router = express.Router();
const { getPosts, getPostBySlug, createPost } = require('../controllers/blog.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', authenticate, authorize('ADMIN'), createPost);

module.exports = router;
