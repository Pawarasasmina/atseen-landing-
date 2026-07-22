import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[process.env.COOKIE_NAME || 'atseen_admin'];
  if (!token) throw new AppError('Authentication required', 401);
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch { throw new AppError('Authentication required', 401); }
  const admin = await Admin.findById(payload.sub);
  if (!admin?.isActive) throw new AppError('Authentication required', 401);
  req.admin = admin;
  next();
});
