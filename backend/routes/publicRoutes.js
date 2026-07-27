import { Router } from 'express';
import { body } from 'express-validator';
import { createApplication, createLead, getApplicationCount } from '../controllers/publicLeadController.js';
import { validate } from '../middleware/validate.js';
import { AUDIENCE_SIZES, CATEGORIES } from '../utils/constants.js';

const router = Router();

const applyValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your name.'),
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 190 }).withMessage('Enter a valid email address.'),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('niches').optional().isArray({ max: 12 }).withMessage('Choose valid niches.'),
  body('niches.*').optional().isIn(CATEGORIES).withMessage('Choose valid niches.'),
  body('instagram').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('tiktok').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('audience').optional({ checkFalsy: true }).isIn(AUDIENCE_SIZES),
  body('why').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('ref').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('ts').optional({ checkFalsy: true }).isISO8601(),
  body('consentGiven').custom((value) => value === true).withMessage('You must confirm that you are 18 or older and agree to the Early Access Terms and Privacy Notice.'),
  body('utm_source').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('utm_medium').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('utm_campaign').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('utm_term').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('utm_content').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('website').optional().isString().isLength({ max: 200 }),
  body().custom((value) => {
    if (value.website) return true;
    if (!String(value.instagram || '').trim() && !String(value.tiktok || '').trim()) throw new Error('Add Instagram or TikTok.');
    return true;
  }),
];

router.get('/count', getApplicationCount);
router.post('/apply', applyValidation, validate, createApplication);
router.post('/leads', [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().normalizeEmail().isLength({ max: 190 }).withMessage('Enter a valid email address.'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 40 }),
  body('country').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('creatorCategory').isIn(CATEGORIES).withMessage('Choose a creator category.'),
  body('mainSocialPlatform').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('socialProfileUrl').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('audienceSize').optional({ checkFalsy: true }).isIn(AUDIENCE_SIZES),
  body('creatorDescription').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('consentGiven').custom((value) => value === true).withMessage('Consent is required.'),
  body('website').optional().isString().isLength({ max: 200 })
], validate, createLead);
export default router;
