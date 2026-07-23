import Lead from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashIp, normalizeEmail } from '../utils/security.js';

const success = { success: true, message: "Thank you. You've been added to the creator list." };
const duplicateEmail = {
  success: false,
  message: 'This email has already been used.',
  errors: [{ field: 'email', message: 'This email has already been used.' }]
};

export const createLead = asyncHandler(async (req, res) => {
  if (req.body.website) return res.status(200).json(success);

  const email = normalizeEmail(req.body.email);
  const duplicate = await Lead.exists({ email });
  if (duplicate) return res.status(409).json(duplicateEmail);

  const allowed = ['fullName', 'phone', 'country', 'city', 'creatorCategory', 'mainSocialPlatform', 'socialProfileUrl', 'audienceSize', 'creatorDescription', 'consentGiven'];
  const payload = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));

  try {
    await Lead.create({
      ...payload,
      email,
      ipHash: hashIp(req.ip),
      userAgent: String(req.get('user-agent') || '').slice(0, 300)
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.email) return res.status(409).json(duplicateEmail);
    throw error;
  }

  return res.status(201).json(success);
});
