import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { cookieOptions, normalizeEmail } from '../utils/security.js';

const publicAdmin = (admin) => ({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });

export const login = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: normalizeEmail(req.body.email) }).select('+passwordHash');
  if (!admin?.isActive || !(await bcrypt.compare(req.body.password, admin.passwordHash))) throw new AppError('Invalid email or password', 401);
  const token = jwt.sign({ sub: admin.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
  admin.lastLoginAt = new Date();
  await admin.save();
  res.cookie(process.env.COOKIE_NAME || 'atseen_admin', token, cookieOptions()).json({ success: true, admin: publicAdmin(admin) });
});

export const me = (req, res) => res.json({ success: true, admin: publicAdmin(req.admin) });
export const logout = (_req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || 'atseen_admin', { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true });
};
