import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { deleteLead, getLead, listLeads, translateDescription, updateNotes, updateStatus } from '../controllers/adminLeadController.js';
import { getStats } from '../controllers/dashboardController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CATEGORIES, LEAD_STATUSES } from '../utils/constants.js';

const router = Router();
router.use(requireAdmin);
const id = param('id').isMongoId().withMessage('Invalid lead id');
router.get('/leads', [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('search').optional().trim().isLength({ max: 200 }), query('status').optional({ checkFalsy: true }).isIn(LEAD_STATUSES), query('category').optional({ checkFalsy: true }).isIn(CATEGORIES), query('country').optional().trim().isLength({ max: 100 }), query('dateFrom').optional({ checkFalsy: true }).isISO8601(), query('dateTo').optional({ checkFalsy: true }).isISO8601()], validate, listLeads);
router.get('/leads/:id', [id], validate, getLead);
router.post('/leads/:id/translate-description', [id], validate, translateDescription);
router.patch('/leads/:id/status', [id, body('status').isIn(LEAD_STATUSES)], validate, updateStatus);
router.patch('/leads/:id/notes', [id, body('adminNotes').isString().isLength({ max: 2000 })], validate, updateNotes);
router.delete('/leads/:id', [id], validate, deleteLead);
router.get('/dashboard/stats', getStats);
export default router;
