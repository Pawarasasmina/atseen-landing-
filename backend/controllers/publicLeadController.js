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
    consentGiven: body.consentGiven === true,
    consentAt: body.consentGiven === true ? new Date() : null,
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
    ['Consent', payload.consentGiven ? '18+ and legal notices accepted' : 'Not given'],
    ['Consent time', payload.consentAt ? payload.consentAt.toISOString() : '-'],
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

function publicBaseUrl(req) {
  return (process.env.CLIENT_URL?.split(',')[0] || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function emailLogo() {
  return `<span style="font-family:Arial,Helvetica,sans-serif;font-size:25px;line-height:1;font-weight:700;letter-spacing:-1px;color:#F7FAFF;-webkit-text-fill-color:#F7FAFF;"><span style="color:#9CCBFF;-webkit-text-fill-color:#9CCBFF;">@</span>seen</span>`;
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

function notificationEmail(payload, req) {
  const baseUrl = publicBaseUrl(req);
  const rows = fieldRows(payload).map(([label, value]) => `<tr><td style="padding:11px 14px;border-bottom:1px solid #222B38;color:#8E9BAD;font-size:13px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:11px 14px;border-bottom:1px solid #222B38;color:#F0F4FA;font-size:14px;line-height:1.5;vertical-align:top;">${escapeHtml(value)}</td></tr>`).join('');
  return `<!doctype html><html><body style="margin:0;padding:0;background:#06080B;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#06080B;"><tr><td align="center" style="padding:32px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;"><tr><td style="padding:0 4px 22px;">${emailLogo(baseUrl)}</td></tr><tr><td style="border:1px solid #263345;border-radius:22px;background:#0F151E;padding:28px;"><div style="color:#9CCBFF;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">New creator application</div><h1 style="margin:10px 0 22px;color:#F7FAFF;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1.2;">${escapeHtml(payload.fullName)}</h1><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="overflow:hidden;border:1px solid #222B38;border-radius:14px;border-collapse:separate;border-spacing:0;font-family:Arial,Helvetica,sans-serif;">${rows}</table></td></tr></table></td></tr></table></body></html>`;
}

function confirmationEmail(payload, req) {
  const baseUrl = publicBaseUrl(req);
  const shareUrl = `${baseUrl}/share?ref=${encodeURIComponent(payload.referralCode)}`;
  const eyeUrl = `${baseUrl}/images/seen-eye.png`;
  const firstName = escapeHtml(payload.fullName?.split(/\s+/)[0] || 'Creator');
  return `<!doctype html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark only"><meta name="supported-color-schemes" content="dark only"><style>:root{color-scheme:dark only;supported-color-schemes:dark only}.seen-bg{background-color:#05080C!important;background-image:linear-gradient(#05080C,#05080C)!important}.seen-card{background-color:#0E151F!important;background-image:linear-gradient(#0E151F,#0E151F)!important}.seen-panel{background-color:#0A1018!important;background-image:linear-gradient(#0A1018,#0A1018)!important}.seen-button{background-color:#B9DCFF!important;background-image:linear-gradient(#B9DCFF,#B9DCFF)!important;color:#07101A!important;-webkit-text-fill-color:#07101A!important}@media(max-width:480px){.seen-wrap{padding:24px 12px!important}.seen-content{padding-left:24px!important;padding-right:24px!important}.seen-title{font-size:34px!important}}@media(prefers-color-scheme:dark){.seen-bg{background-color:#05080C!important;background-image:linear-gradient(#05080C,#05080C)!important}.seen-card{background-color:#0E151F!important;background-image:linear-gradient(#0E151F,#0E151F)!important}.seen-panel{background-color:#0A1018!important;background-image:linear-gradient(#0A1018,#0A1018)!important}.seen-button{background-color:#B9DCFF!important;background-image:linear-gradient(#B9DCFF,#B9DCFF)!important;color:#07101A!important;-webkit-text-fill-color:#07101A!important}}[data-ogsc] .seen-bg{background-color:#05080C!important;background-image:linear-gradient(#05080C,#05080C)!important}[data-ogsc] .seen-card{background-color:#0E151F!important;background-image:linear-gradient(#0E151F,#0E151F)!important}[data-ogsc] .seen-panel{background-color:#0A1018!important;background-image:linear-gradient(#0A1018,#0A1018)!important}[data-ogsc] .seen-button{background-color:#B9DCFF!important;background-image:linear-gradient(#B9DCFF,#B9DCFF)!important;color:#07101A!important;-webkit-text-fill-color:#07101A!important}</style></head>
  <body class="seen-bg" bgcolor="#05080C" style="margin:0;padding:0;background-color:#05080C;background-image:linear-gradient(#05080C,#05080C);">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your @Seen early-access waitlist application has been received.</div>
    <table role="presentation" class="seen-bg" bgcolor="#05080C" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#05080C;background-image:linear-gradient(#05080C,#05080C);"><tr><td class="seen-wrap" align="center" style="padding:36px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
        <tr><td style="padding:0 6px 24px;">${emailLogo(baseUrl)}</td><td align="right" style="padding:0 6px 24px;color:#728196;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;-webkit-text-fill-color:#728196;">Founding circle</td></tr>
        <tr><td class="seen-card" bgcolor="#0E151F" colspan="2" style="overflow:hidden;border:1px solid #29384B;border-radius:24px;background-color:#0E151F;background-image:linear-gradient(#0E151F,#0E151F);"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr><td style="height:5px;background:#9CCBFF;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td class="seen-content" style="padding:42px 38px 16px;"><div style="display:inline-block;border:1px solid #34516F;border-radius:999px;background:#142538;padding:7px 12px;color:#B9DCFF;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Application received</div><h1 class="seen-title" style="margin:22px 0 14px;color:#F7FAFF;font-family:Arial,Helvetica,sans-serif;font-size:38px;line-height:1.08;letter-spacing:-1.2px;-webkit-text-fill-color:#F7FAFF;">We received your application <img src="${escapeHtml(eyeUrl)}" width="32" height="20" alt="" style="display:inline-block;width:32px;height:20px;border:0;vertical-align:middle;"></h1><p style="margin:0 0 12px;color:#D7E0EC;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.6;-webkit-text-fill-color:#D7E0EC;">Hi ${firstName}</p><p style="margin:0 0 12px;color:#D7E0EC;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;-webkit-text-fill-color:#D7E0EC;">Thank you for applying to join the <strong style="color:#FFFFFF;-webkit-text-fill-color:#FFFFFF;">@Seen early-access waitlist</strong> &#128064;</p><p style="margin:0;color:#D7E0EC;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;-webkit-text-fill-color:#D7E0EC;">We&rsquo;ve received your application and will contact you when @Seen is ready to begin inviting creators &#128153;</p></td></tr>
          <tr><td style="padding:14px 38px 8px;"><table role="presentation" class="seen-panel" bgcolor="#0A1018" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #243345;border-radius:16px;background-color:#0A1018;background-image:linear-gradient(#0A1018,#0A1018);"><tr><td width="44" style="padding:18px 0 18px 18px;color:#9CCBFF;font-family:Arial,Helvetica,sans-serif;font-size:24px;vertical-align:top;">&#10003;</td><td style="padding:18px;color:#AAB8C9;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;-webkit-text-fill-color:#AAB8C9;"><strong style="color:#F7FAFF;-webkit-text-fill-color:#F7FAFF;">This is a waitlist confirmation, not an acceptance or invitation.</strong></td></tr></table></td></tr>
          <tr><td align="center" style="padding:25px 38px 12px;"><a class="seen-button" href="${escapeHtml(shareUrl)}" style="display:inline-block;border-radius:999px;background-color:#B9DCFF;background-image:linear-gradient(#B9DCFF,#B9DCFF);padding:15px 25px;color:#07101A;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;text-decoration:none;-webkit-text-fill-color:#07101A;">Invite a creator you rate &nbsp;&#8594;</a></td></tr>
          <tr><td align="center" style="padding:0 38px 36px;color:#738196;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;">Know someone whose work deserves to be seen?<br>Share the early-access application with them.</td></tr>
        </table></td></tr>
        <tr><td colspan="2" align="center" style="padding:24px 10px 8px;color:#6F7E91;font-family:Arial,Helvetica,sans-serif;font-size:12px;"><a href="https://instagram.com/_atseen" style="color:#9CCBFF;text-decoration:none;">Instagram</a><span style="padding:0 9px;color:#3E4A59;">&bull;</span><a href="https://t.me/atseen" style="color:#9CCBFF;text-decoration:none;">Telegram</a></td></tr>
        <tr><td colspan="2" align="center" style="padding:4px 10px;color:#445163;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.5;">You received this because you submitted an @Seen early-access waitlist application.</td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}
async function notifyApplication(payload, req) {
  await Promise.allSettled([
    sendEmail({ to: process.env.CREATORS_NOTIFY_EMAIL || 'creators@atseen.com', subject: `New @seen creator application: ${payload.fullName}`, html: notificationEmail(payload, req) }),
    sendEmail({ to: payload.email, subject: "We received your @Seen application", html: confirmationEmail(payload, req) }),
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


