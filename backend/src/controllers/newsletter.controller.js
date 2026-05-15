const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) return errorResponse(res, 'Already subscribed', 409);

    await prisma.newsletter.create({ data: { email } });
    return successResponse(res, {}, 'Subscribed successfully', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribe };
