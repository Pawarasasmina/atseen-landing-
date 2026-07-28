import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://translate.google.com', 'https://translate.googleapis.com', 'https://translate-pa.googleapis.com', 'https://www.gstatic.com', 'https://static.cloudflareinsights.com'],
      connectSrc: ["'self'", 'https://translate.google.com', 'https://translate.googleapis.com', 'https://translate-pa.googleapis.com', 'https://www.google.com'],
      imgSrc: ["'self'", 'data:', 'https://translate.google.com', 'https://www.google.com', 'https://www.gstatic.com', 'https://fonts.gstatic.com'],
      frameSrc: ["'self'", 'https://translate.google.com', 'https://www.google.com'],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_URL?.split(',').map((url) => url.trim()) || 'http://localhost:5173', credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Please wait a little before trying again.' } });
const applicationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'You can submit up to 3 applications per hour. Please try again later.' } });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, skipSuccessfulRequests: true, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many login attempts. Please try again later.' } });
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() }));
app.post('/api/leads', leadLimiter);
app.post('/api/apply', applicationLimiter);
app.use('/api', publicRoutes);
app.use('/api/admin/auth/login', loginLimiter);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const frontendDist = path.resolve(currentDir, '../frontend/dist');
  app.use(express.static(frontendDist, { maxAge: '1y', index: false }));
  app.get('/{*splat}', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(frontendDist, 'index.html')));
}
app.use(notFound);
app.use(errorHandler);
export default app;
