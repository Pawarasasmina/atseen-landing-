import crypto from 'node:crypto';

export const normalizeEmail = (value = '') => value.trim().toLowerCase();
export const hashIp = (ip = '') => crypto.createHmac('sha256', process.env.IP_HASH_SECRET || 'development-only').update(ip).digest('hex');
export const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 2 * 60 * 60 * 1000 });
