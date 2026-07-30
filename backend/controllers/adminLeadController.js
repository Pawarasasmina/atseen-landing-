import Lead from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { escapeRegex } from '../utils/security.js';

const getLeadOrFail = async (id) => {
  const lead = await Lead.findById(id).populate('referredBy', 'fullName email referralCode');
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
};

export const listLeads = asyncHandler(async (req, res) => {
  const { search, status, category, country, dateFrom, dateTo } = req.query;
  const filter = {};
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = ['fullName', 'email', 'phone', 'socialProfileUrl'].map((field) => ({ [field]: regex }));
  }
  if (status) filter.status = status;
  if (category) filter.$and = [{ $or: [{ niches: category }, { creatorCategory: category }] }];
  if (country) filter.country = new RegExp(`^${escapeRegex(country)}$`, 'i');
  if (dateFrom || dateTo) filter.submittedAt = { ...(dateFrom ? { $gte: new Date(dateFrom) } : {}), ...(dateTo ? { $lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}) };
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const sort = ['-submittedAt', 'submittedAt', 'fullName', '-fullName', 'country', '-country', 'creatorCategory', '-creatorCategory'].includes(req.query.sort) ? req.query.sort : '-submittedAt';
  const [leads, total, countries, availableCategories] = await Promise.all([Lead.find(filter).populate('referredBy', 'fullName email referralCode').sort(sort).skip((page - 1) * limit).limit(limit), Lead.countDocuments(filter), Lead.distinct('country', { country: { $ne: '' } }), Promise.all([Lead.distinct('niches'), Lead.distinct('creatorCategory', { creatorCategory: { $ne: '' } })])]);
  countries.sort((a, b) => a.localeCompare(b, 'en'));
  const categories = [...new Set(availableCategories.flat().filter(Boolean))].sort((a, b) => a.localeCompare(b, 'en'));
  res.json({ success: true, leads, countries, categories, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getLead = asyncHandler(async (req, res) => res.json({ success: true, lead: await getLeadOrFail(req.params.id) }));
export const updateStatus = asyncHandler(async (req, res) => { const lead = await getLeadOrFail(req.params.id); lead.status = req.body.status; await lead.save(); res.json({ success: true, lead }); });
export const updateNotes = asyncHandler(async (req, res) => { const lead = await getLeadOrFail(req.params.id); lead.adminNotes = req.body.adminNotes; await lead.save(); res.json({ success: true, lead }); });
export const deleteLead = asyncHandler(async (req, res) => { const lead = await getLeadOrFail(req.params.id); await lead.deleteOne(); res.json({ success: true, message: 'Lead deleted' }); });
const languageNames = { en: 'English', ar: 'Arabic', ru: 'Russian', es: 'Spanish', fr: 'French', pt: 'Portuguese' };

export const translateDescription = asyncHandler(async (req, res) => {
  const lead = await getLeadOrFail(req.params.id);
  const originalText = lead.originalAnswers?.creatorDescription || lead.creatorDescription || '';
  if (!originalText) throw new AppError('This application has no free-text answer to translate.', 422);

  if (lead.language === 'en') {
    return res.json({ success: true, detectedLanguage: 'English', detectedLanguageCode: 'en', translation: originalText });
  }

  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.search = new URLSearchParams({ client: 'gtx', sl: 'auto', tl: 'en', dt: 't', q: originalText }).toString();
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch {
    throw new AppError('The translation service is temporarily unavailable.', 503);
  }
  if (!response.ok) throw new AppError('The translation service could not translate this answer.', 502);
  const data = await response.json();
  const translation = Array.isArray(data?.[0]) ? data[0].map((part) => part?.[0] || '').join('') : '';
  const detectedLanguageCode = data?.[2] || lead.language || 'unknown';
  if (!translation) throw new AppError('The translation service returned an empty translation.', 502);
  return res.json({
    success: true,
    detectedLanguage: languageNames[detectedLanguageCode] || detectedLanguageCode.toUpperCase(),
    detectedLanguageCode,
    translation,
  });
});
