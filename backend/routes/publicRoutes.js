import { Router } from 'express';
import { body } from 'express-validator';
import { createLead } from '../controllers/publicLeadController.js';
import { validate } from '../middleware/validate.js';
import { AUDIENCE_SIZES, CATEGORIES } from '../utils/constants.js';

const router = Router();
router.post('/leads', [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 190 }).withMessage('Enter a valid email address.'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('country').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your country.'),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('creatorCategory').isIn(CATEGORIES).withMessage('Choose a creator category.'),
  body('mainSocialPlatform').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('socialProfileUrl').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).isLength({ max: 500 }).withMessage('Enter a complete profile URL.'),
  body('audienceSize').optional({ checkFalsy: true }).isIn(AUDIENCE_SIZES),
  body('creatorDescription').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('consentGiven').equals('true').withMessage('Consent is required.'),
  body('website').optional().isString().isLength({ max: 200 })
], validate, createLead);
export default router;
