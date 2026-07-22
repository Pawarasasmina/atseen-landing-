import Lead from '../models/Lead.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { escapeRegex } from '../utils/security.js';

const getLeadOrFail = async (id) => {
  const lead = await Lead.findById(id);
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
  if (category) filter.creatorCategory = category;
  if (country) filter.country = new RegExp(`^${escapeRegex(country)}$`, 'i');
  if (dateFrom || dateTo) filter.submittedAt = { ...(dateFrom ? { $gte: new Date(dateFrom) } : {}), ...(dateTo ? { $lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}) };
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const sort = ['-submittedAt', 'submittedAt', 'fullName', '-fullName'].includes(req.query.sort) ? req.query.sort : '-submittedAt';
  const [leads, total] = await Promise.all([Lead.find(filter).sort(sort).skip((page - 1) * limit).limit(limit), Lead.countDocuments(filter)]);
  res.json({ success: true, leads, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getLead = asyncHandler(async (req, res) => res.json({ success: true, lead: await getLeadOrFail(req.params.id) }));
export const updateStatus = asyncHandler(async (req, res) => { const lead = await getLeadOrFail(req.params.id); lead.status = req.body.status; await lead.save(); res.json({ success: true, lead }); });
export const updateNotes = asyncHandler(async (req, res) => { const lead = await getLeadOrFail(req.params.id); lead.adminNotes = req.body.adminNotes; await lead.save(); res.json({ success: true, lead }); });
export const deleteLead = asyncHandler(async (req, res) => { const lead = await getLeadOrFail(req.params.id); await lead.deleteOne(); res.json({ success: true, message: 'Lead deleted' }); });
