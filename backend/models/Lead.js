import mongoose from 'mongoose';
import { AUDIENCE_SIZES, CATEGORIES, LEAD_STATUSES } from '../utils/constants.js';

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 190, match: /^\S+@\S+\.\S+$/ },
  phone: { type: String, trim: true, maxlength: 40, default: '' },
  country: { type: String, trim: true, maxlength: 100, default: '' },
  city: { type: String, trim: true, maxlength: 100, default: '' },
  creatorCategory: { type: String, enum: CATEGORIES, default: 'Content' },
  niches: { type: [String], default: [], validate: { validator: (items) => items.every((item) => CATEGORIES.includes(item)), message: 'Choose valid creator niches' } },
  instagram: { type: String, trim: true, maxlength: 80, default: '' },
  tiktok: { type: String, trim: true, maxlength: 80, default: '' },
  mainSocialPlatform: { type: String, trim: true, maxlength: 80, default: '' },
  socialProfileUrl: { type: String, trim: true, maxlength: 500, default: '' },
  audienceSize: { type: String, enum: [...AUDIENCE_SIZES, ''], default: '' },
  creatorDescription: { type: String, trim: true, maxlength: 1000, default: '' },
  consentGiven: { type: Boolean, required: true, default: false },
  consentAt: { type: Date, default: null },
  ref: { type: String, trim: true, maxlength: 120, default: '' },
  referralCode: { type: String, trim: true, unique: true, sparse: true, maxlength: 32 },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true },
  utm: {
    source: { type: String, trim: true, maxlength: 120, default: '' },
    medium: { type: String, trim: true, maxlength: 120, default: '' },
    campaign: { type: String, trim: true, maxlength: 120, default: '' },
    term: { type: String, trim: true, maxlength: 120, default: '' },
    content: { type: String, trim: true, maxlength: 120, default: '' },
  },
  status: { type: String, enum: LEAD_STATUSES, default: 'new', index: true },
  adminNotes: { type: String, maxlength: 2000, default: '' },
  source: { type: String, default: 'landing-page' },
  ipHash: { type: String, select: false },
  userAgent: { type: String, maxlength: 300, select: false },
  submittedAt: { type: Date, default: Date.now, index: -1 },
}, { timestamps: true });

leadSchema.index({ creatorCategory: 1 });
leadSchema.index({ fullName: 'text', email: 'text', instagram: 'text', tiktok: 'text' });
export default mongoose.model('Lead', leadSchema);
