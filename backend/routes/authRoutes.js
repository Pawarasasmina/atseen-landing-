import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, me } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.post('/login', [body('email').isEmail(), body('password').isString().isLength({ min: 1 })], validate, login);
router.get('/me', requireAdmin, me);
router.post('/logout', requireAdmin, logout);
export default router;
