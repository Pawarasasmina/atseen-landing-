import Lead from '../models/Lead.js';
import { randomBytes } from 'node:crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashIp, normalizeEmail } from '../utils/security.js';

const success = { success: true, message: "Thanks for applying to the founding circle of @seen." };
const resendEndpoint = 'https://api.resend.com/emails';
const confirmationEmailCopy = {
  en: {
    subject: 'We received your @Seen application',
    preheader: '${escapeHtml(copy.preheader)}',
    circle: 'Founding circle', badge: 'Application received', title: 'You’ve been seen',
    greeting: 'Hey {name}, your place in the @seen founding circle is saved.',
    notice: 'When founding registration opens, your private invitation will land in this inbox first. No further action is needed.',
    cta: 'Share your invite', helperOne: 'Know someone whose work deserves to be seen?', helperTwo: 'Share your personal invite link with them.',
    footer: 'You received this because you submitted an @Seen early-access waitlist application.',
  },
  ar: {
    subject: 'تم استلام طلبك للانضمام إلى @Seen',
    preheader: 'تم استلام طلبك لقائمة انتظار الوصول المبكر في @Seen.',
    circle: 'دائرة المؤسسين', badge: 'تم استلام الطلب', title: 'تمت رؤيتك',
    greeting: 'مرحباً {name}، تم حفظ مكانك في دائرة مؤسسي @seen.',
    notice: 'عند فتح التسجيل للمؤسسين، ستصل دعوتك الخاصة أولاً إلى صندوق الوارد هذا. لا يلزم اتخاذ أي إجراء آخر.',
    cta: 'شارك دعوتك', helperOne: 'هل تعرف شخصاً يستحق عمله أن يُرى؟', helperTwo: 'شارك معه رابط دعوتك الشخصي.',
    footer: 'تلقيت هذه الرسالة لأنك قدمت طلباً للانضمام إلى قائمة انتظار الوصول المبكر في @Seen.',
  },
  ru: {
    subject: 'Мы получили вашу заявку в @Seen',
    preheader: 'Ваша заявка в список ожидания раннего доступа @Seen получена.',
    circle: 'Круг основателей', badge: 'Заявка получена', title: 'Вас заметили',
    greeting: 'Здравствуйте, {name}! Ваше место в кругу основателей @seen сохранено.',
    notice: 'Когда откроется регистрация основателей, персональное приглашение первым придёт на этот адрес. Больше ничего делать не нужно.',
    cta: 'Поделиться приглашением', helperOne: 'Знаете автора, чьи работы заслуживают внимания?', helperTwo: 'Поделитесь с этим человеком своей персональной ссылкой-приглашением.',
    footer: 'Вы получили это письмо, потому что подали заявку в список ожидания раннего доступа @Seen.',
  },
  es: {
    subject: 'Hemos recibido tu solicitud de @Seen',
    preheader: 'Hemos recibido tu solicitud para la lista de espera de acceso anticipado de @Seen.',
    circle: 'Círculo fundador', badge: 'Solicitud recibida', title: 'Te hemos visto',
    greeting: 'Hola, {name}. Tu lugar en el círculo fundador de @seen está reservado.',
    notice: 'Cuando se abra el registro fundador, tu invitación privada llegará primero a esta bandeja de entrada. No tienes que hacer nada más.',
    cta: 'Comparte tu invitación', helperOne: '¿Conoces a alguien cuyo trabajo merezca ser visto?', helperTwo: 'Comparte con esa persona tu enlace de invitación personal.',
    footer: 'Has recibido este mensaje porque enviaste una solicitud para la lista de espera de acceso anticipado de @Seen.',
  },
  fr: {
    subject: 'Nous avons reçu votre candidature @Seen',
    preheader: 'Votre candidature à la liste d’attente d’accès anticipé de @Seen a bien été reçue.',
    circle: 'Cercle fondateur', badge: 'Candidature reçue', title: 'Votre talent a été remarqué',
    greeting: 'Bonjour {name}, votre place dans le cercle fondateur de @seen est réservée.',
    notice: 'À l’ouverture des inscriptions fondatrices, votre invitation privée arrivera en priorité dans cette boîte de réception. Aucune autre action n’est nécessaire.',
    cta: 'Partager votre invitation', helperOne: 'Vous connaissez une personne dont le travail mérite d’être remarqué ?', helperTwo: 'Partagez votre lien d’invitation personnel avec elle.',
    footer: 'Vous recevez ce message parce que vous avez candidaté à la liste d’attente d’accès anticipé de @Seen.',
  },
  pt: {
    subject: 'Recebemos sua candidatura à @Seen',
    preheader: 'Recebemos sua candidatura para a lista de espera de acesso antecipado da @Seen.',
    circle: 'Círculo fundador', badge: 'Candidatura recebida', title: 'Seu talento foi notado',
    greeting: 'Olá, {name}. Seu lugar no círculo fundador da @seen está reservado.',
    notice: 'Quando o cadastro fundador for aberto, seu convite privado chegará primeiro a esta caixa de entrada. Nenhuma outra ação será necessária.',
    cta: 'Compartilhe seu convite', helperOne: 'Conhece alguém cujo trabalho merece ser visto?', helperTwo: 'Compartilhe seu link de convite pessoal com essa pessoa.',
    footer: 'Você recebeu esta mensagem porque enviou uma candidatura para a lista de espera de acesso antecipado da @Seen.',
  },
};

const getConfirmationEmailCopy = (language) => confirmationEmailCopy[language] || confirmationEmailCopy.en;
const interpolateEmailCopy = (text, values) => Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, value), text);

const cleanHandle = (value = '') => String(value).trim().replace(/^@+/, '').slice(0, 80);
const cleanString = (value = '', max = 1000) => String(value || '').trim().slice(0, max);
const getOffset = () => Number.parseInt(process.env.APPLICATION_COUNT_OFFSET || '0', 10) || 0;
const emailDeliveryEnabled = () => Boolean(process.env.RESEND_API_KEY?.trim());

function buildApplyPayload(body, req) {
  const original = req.originalApplicationBody || body;
  const submittedOriginal = original.originalAnswers && typeof original.originalAnswers === 'object'
    ? original.originalAnswers
    : original;
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
    language: ['en', 'ar', 'ru', 'es', 'fr', 'pt'].includes(body.language) ? body.language : 'en',
    creatorCategory: primaryNiche,
    niches,
    instagram,
    tiktok,
    mainSocialPlatform: instagram ? 'Instagram' : (tiktok ? 'TikTok' : cleanString(body.mainSocialPlatform, 80)),
    socialProfileUrl: cleanString(body.socialProfileUrl, 500),
    audienceSize: cleanString(body.audience || body.audienceSize, 40),
    creatorDescription: cleanString(body.why || body.creatorDescription, 1000),
    originalAnswers: {
      fullName: String(submittedOriginal.name || submittedOriginal.fullName || '').slice(0, 120),
      email: String(submittedOriginal.email || '').slice(0, 190),
      phone: String(submittedOriginal.phone || '').slice(0, 40),
      country: String(submittedOriginal.country || '').slice(0, 100),
      city: String(submittedOriginal.city || '').slice(0, 100),
      instagram: String(submittedOriginal.instagram || '').slice(0, 80),
      tiktok: String(submittedOriginal.tiktok || '').slice(0, 80),
      socialProfileUrl: String(submittedOriginal.socialProfileUrl || '').slice(0, 500),
      creatorDescription: String(submittedOriginal.why || submittedOriginal.creatorDescription || '').slice(0, 1000),
    },
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
    ['Language', payload.language || 'en'],
    ['Niches', payload.niches.join(', ') || payload.creatorCategory],
    ['Instagram', payload.instagram ? `@${payload.instagram}` : '-'],
    ['TikTok', payload.tiktok ? `@${payload.tiktok}` : '-'],
    ['Audience', payload.audienceSize || '-'],
    ['World', payload.creatorDescription || '-'],
    ['Consent', payload.consentGiven ? '18+ and legal notices accepted' : 'Not given'],
    ['Consent time', payload.consentAt ? payload.consentAt.toISOString() : '-'],
    ['Original submission', payload.submittedAt ? new Date(payload.submittedAt).toISOString() : '-'],
    ['Latest update', payload.updatedAt ? new Date(payload.updatedAt).toISOString() : '-'],
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

export function confirmationEmail(payload, req) {
  const baseUrl = publicBaseUrl(req);
  const shareUrl = `${baseUrl}/share?ref=${encodeURIComponent(payload.referralCode)}`;
  const eyeUrl = `${baseUrl}/images/seen-eye.png`;
  const language = confirmationEmailCopy[payload.language] ? payload.language : 'en';
  const copy = getConfirmationEmailCopy(language);
  const isRtl = language === 'ar';
  const direction = isRtl ? 'rtl' : 'ltr';
  const textAlign = isRtl ? 'right' : 'left';
  const headerAlign = isRtl ? 'left' : 'right';
  const arrow = isRtl ? '&#8592;' : '&#8594;';
  const firstName = cleanString(payload.fullName?.split(/\s+/)[0], 120) || 'Creator';
  const greeting = escapeHtml(interpolateEmailCopy(copy.greeting, { name: firstName }));
  return `<!doctype html>
  <html lang="${language}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark only"><meta name="supported-color-schemes" content="dark only"><style>:root{color-scheme:dark only;supported-color-schemes:dark only}.seen-bg{background-color:#05080C!important;background-image:linear-gradient(#05080C,#05080C)!important}.seen-card{background-color:#0E151F!important;background-image:linear-gradient(#0E151F,#0E151F)!important}.seen-panel{background-color:#0A1018!important;background-image:linear-gradient(#0A1018,#0A1018)!important}.seen-white,.seen-text-fix{color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important;mso-color-alt:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important}.seen-button{background-color:#B9DCFF!important;background-image:linear-gradient(#B9DCFF,#B9DCFF)!important;color:#07101A!important;-webkit-text-fill-color:#07101A!important}@media(max-width:480px){.seen-wrap{padding:24px 12px!important}.seen-content{padding-left:24px!important;padding-right:24px!important}.seen-title{font-size:28px!important}.seen-text-fix{display:inline-block!important}.seen-white,.seen-text-fix{color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important;mso-color-alt:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important}}@media(prefers-color-scheme:dark){.seen-bg{background-color:#05080C!important;background-image:linear-gradient(#05080C,#05080C)!important}.seen-card{background-color:#0E151F!important;background-image:linear-gradient(#0E151F,#0E151F)!important}.seen-panel{background-color:#0A1018!important;background-image:linear-gradient(#0A1018,#0A1018)!important}.seen-white,.seen-text-fix{color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important;mso-color-alt:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important}.seen-button{background-color:#B9DCFF!important;background-image:linear-gradient(#B9DCFF,#B9DCFF)!important;color:#07101A!important;-webkit-text-fill-color:#07101A!important}}[data-ogsc] .seen-bg{background-color:#05080C!important;background-image:linear-gradient(#05080C,#05080C)!important}[data-ogsc] .seen-card{background-color:#0E151F!important;background-image:linear-gradient(#0E151F,#0E151F)!important}[data-ogsc] .seen-panel{background-color:#0A1018!important;background-image:linear-gradient(#0A1018,#0A1018)!important}[data-ogsc] .seen-white,.seen-text-fix{color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important;mso-color-alt:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important}.seen-button{background-color:#B9DCFF!important;background-image:linear-gradient(#B9DCFF,#B9DCFF)!important;color:#07101A!important;-webkit-text-fill-color:#07101A!important}u + .seen-body .gmail-blend-screen{background:#000;mix-blend-mode:screen}u + .seen-body .gmail-blend-difference{background:#000;mix-blend-mode:difference}u + .seen-body .gmail-blend-block{display:block!important;width:100%!important}</style></head>
  <body class="seen-body seen-bg" bgcolor="#05080C" style="margin:0;padding:0;background-color:#05080C;background-image:linear-gradient(#05080C,#05080C);">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preheader)}</div>
    <table role="presentation" class="seen-bg" bgcolor="#05080C" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#05080C;background-image:linear-gradient(#05080C,#05080C);"><tr><td class="seen-wrap" align="center" style="padding:36px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
        <tr><td style="padding:0 6px 24px;">${emailLogo(baseUrl)}</td><td align="${headerAlign}" style="padding:0 6px 24px;color:#728196;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;-webkit-text-fill-color:#728196;">${escapeHtml(copy.circle)}</td></tr>
        <tr><td class="seen-card" bgcolor="#0E151F" colspan="2" style="overflow:hidden;border:1px solid #29384B;border-radius:24px;background-color:#0E151F;background-image:linear-gradient(#0E151F,#0E151F);"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr><td style="height:5px;background:#9CCBFF;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td class="seen-content" style="padding:42px 38px 16px;text-align:${textAlign};"><div style="display:inline-block;border:1px solid #34516F;border-radius:999px;background:#142538;padding:7px 12px;color:#B9DCFF;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">${escapeHtml(copy.badge)}</div><h1 class="seen-title seen-white" style="margin:22px 0 14px;color:#FFFFFF!important;font-family:Arial,Helvetica,sans-serif;font-size:32px;line-height:1.15;letter-spacing:-0.8px;-webkit-text-fill-color:#FFFFFF!important;mso-color-alt:#FFFFFF;"><span class="gmail-blend-screen"><span class="gmail-blend-difference"><font class="seen-text-fix" color="#FFFFFF" style="color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important;mso-color-alt:#FFFFFF!important;">${escapeHtml(copy.title)}</font></span></span> <img src="${escapeHtml(eyeUrl)}" width="32" height="20" alt="" style="display:inline-block;width:32px;height:20px;border:0;vertical-align:middle;"></h1><p class="seen-white" style="margin:0;color:#FFFFFF!important;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;-webkit-text-fill-color:#FFFFFF!important;mso-color-alt:#FFFFFF;"><span class="gmail-blend-screen gmail-blend-block"><span class="gmail-blend-difference gmail-blend-block"><font class="seen-text-fix" color="#FFFFFF" style="color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important;mso-color-alt:#FFFFFF!important;">${greeting}</font></span></span></p></td></tr>
          <tr><td style="padding:20px 38px 8px;"><table role="presentation" class="seen-panel" bgcolor="#0A1018" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #243345;border-radius:16px;background-color:#0A1018;background-image:linear-gradient(#0A1018,#0A1018);"><tr><td width="44" style="padding:18px 0 18px 18px;color:#9CCBFF;font-family:Arial,Helvetica,sans-serif;font-size:24px;vertical-align:top;">&#10003;</td><td class="seen-white" style="padding:18px;color:#FFFFFF!important;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:500;line-height:1.65;text-align:${textAlign};-webkit-text-fill-color:#FFFFFF!important;mso-color-alt:#FFFFFF;"><strong class="seen-white" style="color:#FFFFFF!important;font-weight:500;-webkit-text-fill-color:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important;mso-color-alt:#FFFFFF!important;"><span class="gmail-blend-screen gmail-blend-block"><span class="gmail-blend-difference gmail-blend-block"><font class="seen-text-fix" color="#FFFFFF" style="color:#FFFFFF!important;font-weight:500;-webkit-text-fill-color:#FFFFFF!important;text-shadow:0 0 0 #FFFFFF!important;mso-color-alt:#FFFFFF!important;">${escapeHtml(copy.notice)}</font></span></span></strong></td></tr></table></td></tr>
          <tr><td align="center" style="padding:25px 38px 12px;"><a class="seen-button" href="${escapeHtml(shareUrl)}" style="display:inline-block;border-radius:999px;background-color:#B9DCFF;background-image:linear-gradient(#B9DCFF,#B9DCFF);padding:15px 25px;color:#07101A;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;text-decoration:none;-webkit-text-fill-color:#07101A;">${escapeHtml(copy.cta)} &nbsp;${arrow}</a></td></tr>
          <tr><td align="center" style="padding:0 38px 36px;color:#738196;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;">${escapeHtml(copy.helperOne)}<br>${escapeHtml(copy.helperTwo)}</td></tr>
        </table></td></tr>
        <tr><td colspan="2" align="center" style="padding:24px 10px 8px;color:#6F7E91;font-family:Arial,Helvetica,sans-serif;font-size:12px;"><a href="https://instagram.com/_atseen" style="color:#9CCBFF;text-decoration:none;">Instagram</a><span style="padding:0 9px;color:#3E4A59;">&bull;</span><a href="https://t.me/atseen" style="color:#9CCBFF;text-decoration:none;">Telegram</a></td></tr>
        <tr><td colspan="2" align="center" style="padding:4px 10px;color:#445163;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.5;">${escapeHtml(copy.footer)}</td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}
async function notifyApplication(payload, req) {
  await Promise.allSettled([
    sendEmail({ to: process.env.CREATORS_NOTIFY_EMAIL || 'creators@atseen.com', subject: `New @seen creator application: ${payload.fullName}`, html: notificationEmail(payload, req) }),
    sendEmail({ to: payload.email, subject: getConfirmationEmailCopy(payload.language).subject, html: confirmationEmail(payload, req) }),
  ]);
}

export const createApplication = asyncHandler(async (req, res) => {
  if (req.body.website) return res.status(200).json(success);
  const payload = buildApplyPayload(req.body, req);
  const existing = await Lead.findOne({ email: payload.email }).populate('referredBy', 'fullName email referralCode');
  const referrer = payload.ref ? await Lead.findOne({ referralCode: payload.ref }).select('fullName email referralCode') : null;
  const referralCode = existing?.referralCode || await createReferralCode();
  const updatePayload = Object.fromEntries(Object.entries(payload).filter(([key]) => !['status', 'ref', 'submittedAt'].includes(key)));
  const lead = await Lead.findOneAndUpdate(
    { email: payload.email },
    {
      $set: { ...updatePayload, referralCode },
      $setOnInsert: { status: 'new', ref: referrer?.referralCode || '', referredBy: referrer?._id || null, submittedAt: payload.submittedAt },
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


