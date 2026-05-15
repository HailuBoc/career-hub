const prisma = require('../config/prisma');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, tag } = req.query;

    const where = { isPublished: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tag) where.tags = { has: tag };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { profile: { select: { firstName: true, lastName: true, avatar: true } } } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return paginatedResponse(res, posts, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { profile: { select: { firstName: true, lastName: true, avatar: true, headline: true } } } },
      },
    });

    if (!post || !post.isPublished) return errorResponse(res, 'Post not found', 404);

    await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

    return successResponse(res, { post });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, tags, isPublished } = req.body;
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${uuidv4().slice(0, 8)}`;

    const post = await prisma.blogPost.create({
      data: {
        authorId: req.user.id,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        tags: tags || [],
        isPublished: isPublished || false,
      },
    });

    return successResponse(res, { post }, 'Post created', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPosts, getPostBySlug, createPost };
