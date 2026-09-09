import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { UserMaster, SessionMaster } from '../models/index.js';
import { env } from '../config/env.js';

export const loginAdmin = async ({ identifier, password, ip }) => {
  const cleanId = (identifier || '').trim();
  const digitsOnly = cleanId.replace(/\D/g, '');

  // Look up user by email OR mobile (exact or trailing 10 digits)
  const whereConditions = [
    { email: cleanId.toLowerCase() },
    { mobile: cleanId },
  ];

  if (digitsOnly.length >= 10) {
    whereConditions.push({
      mobile: { [Op.like]: `%${digitsOnly.slice(-10)}%` },
    });
  }

  const user = await UserMaster.findOne({
    where: {
      [Op.or]: whereConditions,
    },
  });

  if (!user) {
    const error = new Error('Invalid email, mobile number, or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email, mobile number, or password.');
    error.statusCode = 401;
    throw error;
  }

  // Generate tokens
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
    env.JWT.SECRET,
    { expiresIn: env.JWT.EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT.REFRESH_SECRET,
    { expiresIn: env.JWT.REFRESH_EXPIRES_IN }
  );

  // Track session in session_master
  await SessionMaster.create({
    user_id: user.id,
    access_token: accessToken,
    refresh_token: refreshToken,
    ip: ip || '127.0.0.1',
  });

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

export const getAdminProfile = async (userId) => {
  return UserMaster.findByPk(userId, {
    attributes: ['id', 'full_name', 'email', 'mobile', 'role', 'createdAt'],
  });
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  const tokenClean = refreshToken.replace(/^Bearer\s+/i, '').trim();

  let decoded;
  try {
    decoded = jwt.verify(tokenClean, env.JWT.REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const session = await SessionMaster.findOne({
    where: { refresh_token: tokenClean },
  });

  if (!session) {
    const error = new Error('Session not found or has been revoked');
    error.statusCode = 401;
    throw error;
  }

  const user = await UserMaster.findByPk(decoded.id);
  if (!user) {
    const error = new Error('User no longer exists');
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
    env.JWT.SECRET,
    { expiresIn: env.JWT.EXPIRES_IN }
  );

  await session.update({ access_token: newAccessToken });

  return {
    access_token: newAccessToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
  };
};

export const logoutAdmin = async ({ userId, token, refreshToken }) => {
  const where = {};
  if (token) where.access_token = token.replace(/^Bearer\s+/i, '').trim();
  if (refreshToken) where.refresh_token = refreshToken.replace(/^Bearer\s+/i, '').trim();
  if (!token && !refreshToken && userId) where.user_id = userId;

  if (Object.keys(where).length > 0) {
    await SessionMaster.destroy({ where });
  }

  return { message: 'Logged out successfully' };
};

