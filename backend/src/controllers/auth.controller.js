const bcrypt = require('bcryptjs');
const { queryOne } = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Admin-only login.
 * Username is read from ADMIN_USERNAME env var.
 * Client only sends the password.
 */
const login = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return errorResponse(res, 'Password is required', 400);

    const adminUsername = process.env.ADMIN_USERNAME;
    if (!adminUsername) return errorResponse(res, 'Server misconfiguration', 500);

    const user = await queryOne(
      'SELECT * FROM users WHERE username = $1 AND role = $2',
      [adminUsername, 'ADMIN']
    );

    if (!user) return errorResponse(res, 'Invalid credentials', 401);
    if (!user.isActive) return errorResponse(res, 'Account is deactivated', 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    return successResponse(res, {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role },
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return errorResponse(res, 'Refresh token required', 400);

    const decoded = verifyRefreshToken(token);
    const user = await queryOne('SELECT id, username, role, "isActive" FROM users WHERE id = $1', [decoded.id]);
    if (!user || !user.isActive) return errorResponse(res, 'Invalid refresh token', 401);

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    return successResponse(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    if (err.name === 'TokenExpiredError') return errorResponse(res, 'Refresh token expired', 401);
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await queryOne(
      'SELECT id, username, role, "isActive" FROM users WHERE id = $1',
      [req.user.id]
    );
    return successResponse(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refreshToken, getMe };
