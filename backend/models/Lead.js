import mongoose from 'mongoose';
import { AUDIENCE_SIZES, CATEGORIES, LEAD_STATUSES } from '../utils/constants.js';

const urlValidator = { validator: (value) => !value || /^https?:\/\/[^\s]+$/i.test(value), message: 'Enter a valid URL beginning with http:// or https://' };
const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 190, match: /^\S+@\S+\.\S+$/ },
  phone: { type: String, trim: true, maxlength: 40, default: '' },
  country: { type: String, required: true, trim: true, maxlength: 100 },
  city: { type: String, trim: true, maxlength: 100, default: '' },
  creatorCategory: { type: String, required: true, enum: CATEGORIES },
  mainSocialPlatform: { type: String, trim: true, maxlength: 80, default: '' },
  socialProfileUrl: { type: String, trim: true, maxlength: 500, validate: urlValidator, default: '' },
  audienceSize: { type: String, enum: [...AUDIENCE_SIZES, ''], default: '' },
  creatorDescription: { type: String, trim: true, maxlength: 1000, default: '' },
  consentGiven: { type: Boolean, required: true, validate: { validator: (value) => value === true, message: 'Consent is required' } },
  status: { type: String, enum: LEAD_STATUSES, default: 'new', index: true },
  adminNotes: { type: String, maxlength: 2000, default: '' },
  source: { type: String, default: 'landing-page' },
  ipHash: { type: String, select: false },
  userAgent: { type: String, maxlength: 300, select: false },
  submittedAt: { type: Date, default: Date.now, index: -1 }
}, { timestamps: true });

leadSchema.index({ creatorCategory: 1 });
leadSchema.index({ fullName: 'text', email: 'text' });
export default mongoose.model('Lead', leadSchema);
