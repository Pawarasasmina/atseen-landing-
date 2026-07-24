import Lead from '../models/Lead.js';
import { randomBytes } from 'node:crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashIp, normalizeEmail } from '../utils/security.js';

const success = { success: true, message: "Thanks for applying to the founding circle of @seen." };
const resendEndpoint = 'https://api.resend.com/emails';

const cleanHandle = (value = '') => String(value).trim().replace(/^@+/, '').slice(0, 80);
const cleanString = (value = '', max = 1000) => String(value || '').trim().slice(0, max);
const getOffset = () => Number.parseInt(process.env.APPLICATION_COUNT_OFFSET || '0', 10) || 0;
const emailDeliveryEnabled = () => Boolean(process.env.RESEND_API_KEY?.trim());

function buildApplyPayload(body, req) {
  const niches = Array.isArray(body.niches) ? body.niches.map((item) => cleanString(item, 80)).filter(Boolean).slice(0, 12) : [];
  const primaryNiche = niches[0] || cleanString(body.creatorCategory, 80) || 'Content';
  const instagram = cleanHandle(body.instagram);
  const tiktok = cleanHandle(body.tiktok);

  return {
    fullName: cleanString(body.name || body.fullName, 120),
    email: normalizeEmail(body.email),
    phone: cleanString(body.phone, 40),
    country: cleanString(body.country, 100),
    city: cleanString(body.city, 100),
    creatorCategory: primaryNiche,
    niches,
    instagram,
    tiktok,
    mainSocialPlatform: instagram ? 'Instagram' : (tiktok ? 'TikTok' : cleanString(body.mainSocialPlatform, 80)),
    socialProfileUrl: cleanString(body.socialProfileUrl, 500),
    audienceSize: cleanString(body.audience || body.audienceSize, 40),
    creatorDescription: cleanString(body.why || body.creatorDescription, 1000),
    consentGiven: body.consentGiven !== false,
    ref: cleanString(body.ref, 120),
    utm: {
      source: cleanString(body.utm_source, 120),
      medium: cleanString(body.utm_medium, 120),
      campaign: cleanString(body.utm_campaign, 120),
      term: cleanString(body.utm_term, 120),
      content: cleanString(body.utm_content, 120),
    },
    status: 'new',
    source: 'landing-page',
    ipHash: hashIp(req.ip),
    userAgent: String(req.get('user-agent') || '').slice(0, 300),
    submittedAt: body.ts ? new Date(body.ts) : new Date(),
  };
}

function fieldRows(payload) {
  return [
    ['Name', payload.fullName],
    ['Email', payload.email],
    ['Phone', payload.phone || '-'],
    ['City', payload.city || '-'],
    ['Niches', payload.niches.join(', ') || payload.creatorCategory],
    ['Instagram', payload.instagram ? `@${payload.instagram}` : '-'],
    ['TikTok', payload.tiktok ? `@${payload.tiktok}` : '-'],
    ['Audience', payload.audienceSize || '-'],
    ['World', payload.creatorDescription || '-'],
    ['Ref', payload.ref || '-'],
    ['UTM source', payload.utm.source || '-'],
    ['UTM medium', payload.utm.medium || '-'],
    ['UTM campaign', payload.utm.campaign || '-'],
    ['Referral code', payload.referralCode || '-'],
    ['Referred by', payload.referredBy ? `${payload.referredBy.fullName} (${payload.referredBy.email})` : 'Direct / no referral'],
  ];
}

async function createReferralCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referralCode = `seen-${randomBytes(6).toString('hex')}`;
    const codeTaken = await Lead.exists({ referralCode });
    if (!codeTaken) return referralCode;
  }
  throw new Error('Could not generate a unique referral code');
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return;
  const response = await fetch(resendEndpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM || 'hello@atseen.com', to, subject, html }),
  });
  if (!response.ok) throw new Error(`Resend email failed with ${response.status}`);
}

function notificationEmail(payload) {
  const rows = fieldRows(payload).map(([label, value]) => `<tr><td style="padding:8px 12px;color:#9AA7B8">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#F0F4FA">${escapeHtml(value)}</td></tr>`).join('');
  return `<div style="background:#06080B;color:#F0F4FA;font-family:Inter,Arial,sans-serif;padding:28px"><h1 style="margin:0 0 16px">New @seen application</h1><table style="border-collapse:collapse;width:100%;max-width:680px;background:#10141C;border:1px solid rgba(156,203,255,.18)">${rows}</table></div>`;
}

function confirmationEmail(payload, req) {
  const baseUrl = process.env.CLIENT_URL?.split(',')[0] || `${req.protocol}://${req.get('host')}`;
  const inviteUrl = `${baseUrl.replace(/\/$/, '')}/?ref=${encodeURIComponent(payload.referralCode)}`;
  return `<div style="margin:0;background:#06080B;color:#F0F4FA;font-family:Inter,Arial,sans-serif;padding:34px"><div style="max-width:620px;margin:auto;border:1px solid rgba(156,203,255,.18);border-radius:24px;background:#10141C;padding:30px"><div style="color:#9CCBFF;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase">@seen founding circle</div><h1 style="font-size:34px;line-height:1.05;margin:18px 0 14px">You've been seen âœ¦</h1><p style="color:#B8C4D3;line-height:1.7">Thanks for applying to the founding circle of @seen. Your place in line is saved. When founding registration opens, your invite lands here first.</p><a href="${escapeHtml(inviteUrl)}" style="display:inline-block;margin-top:18px;border-radius:999px;background:#9CCBFF;color:#06080B;padding:14px 22px;text-decoration:none;font-weight:800">Invite a creator you rate</a><p style="margin-top:24px;color:#6F7A8B;font-size:13px"><a href="https://instagram.com/_atseen" style="color:#9CCBFF">Instagram</a> Â· <a href="https://t.me/atseen" style="color:#9CCBFF">Telegram</a></p></div></div>`;
}

async function notifyApplication(payload, req) {
  await Promise.allSettled([
    sendEmail({ to: process.env.CREATORS_NOTIFY_EMAIL || 'creators@atseen.com', subject: `New @seen creator application: ${payload.fullName}`, html: notificationEmail(payload) }),
    sendEmail({ to: payload.email, subject: "You've been seen âœ¦", html: confirmationEmail(payload, req) }),
  ]);
}

export const createApplication = asyncHandler(async (req, res) => {
  if (req.body.website) return res.status(200).json(success);
  const payload = buildApplyPayload(req.body, req);
  const existing = await Lead.findOne({ email: payload.email }).populate('referredBy', 'fullName email referralCode');
  const referrer = payload.ref ? await Lead.findOne({ referralCode: payload.ref }).select('fullName email referralCode') : null;
  const referralCode = existing?.referralCode || await createReferralCode();
  const updatePayload = Object.fromEntries(Object.entries(payload).filter(([key]) => !['status', 'ref'].includes(key)));
  const lead = await Lead.findOneAndUpdate(
    { email: payload.email },
    {
      $set: { ...updatePayload, referralCode },
      $setOnInsert: { status: 'new', ref: referrer?.referralCode || '', referredBy: referrer?._id || null },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).populate('referredBy', 'fullName email referralCode');
  if (emailDeliveryEnabled()) await notifyApplication(lead, req);
  return res.status(existing ? 200 : 201).json({ ...success, id: lead._id, referralCode: lead.referralCode });
});

export const createLead = asyncHandler(async (req, res) => {
  req.body = {
    ...req.body,
    name: req.body.fullName,
    niches: req.body.creatorCategory ? [req.body.creatorCategory] : [],
    audience: req.body.audienceSize,
    why: req.body.creatorDescription,
    instagram: req.body.mainSocialPlatform?.toLowerCase().includes('instagram') ? req.body.socialProfileUrl : '',
  };
  return createApplication(req, res);
});

export const getApplicationCount = asyncHandler(async (_req, res) => {
  const realCount = await Lead.countDocuments();
  const offset = getOffset();
  res.json({ success: true, real_count: realCount, offset, count: realCount + offset });
});


