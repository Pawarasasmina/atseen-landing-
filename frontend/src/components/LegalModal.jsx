import { X } from 'lucide-react';
import { BrandName, BrandText } from './BrandName';

const notices = {
  'Privacy Notice': {
    updated: '27 July 2026',
    sections: [
      ['About this notice', '@Seen is a project currently in development. This notice explains how information submitted through the early-access application form is handled.'],
      ['Information we collect', 'We collect the details you provide in the application, including your name, contact details, creator information, audience range and social handles. We may also collect basic technical and referral information used to operate and protect the waitlist.'],
      ['How we use it', 'Your information is used to manage the @Seen early-access waitlist, review applications, prevent misuse and send essential updates about your application.'],
      ['Sharing and retention', 'Information may be handled by service providers that help us host the project, store applications or deliver email. We retain it only as reasonably needed for the early-access project, legal obligations and security.'],
      ['Your choices', 'You may ask to access, correct or delete your application information by contacting privacy@atseen.com.'],
    ],
  },
  'Early Access Terms': {
    updated: '27 July 2026',
    sections: [
      ['Development status', '@Seen is currently a project in development. The application form only collects expressions of interest for an early-access waitlist.'],
      ['No current services', 'No accounts, invitations, payments, payouts or financial services are currently being provided through this application.'],
      ['Eligibility', 'You must be at least 18 years old to submit an early-access application. You must provide accurate information and submit only on your own behalf.'],
      ['No guarantee', 'Submitting an application does not guarantee acceptance, an invitation, access, visibility, promotion, earnings or any future feature. Plans and eligibility requirements may change as the project develops.'],
      ['Updates', 'By applying, you agree that @Seen may send essential messages concerning your application and the early-access waitlist.'],
    ],
  },
};

export default function LegalModal({ type, onClose }) {
  const notice = notices[type];
  if (!notice) return null;

  return (
    <div className="legal-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="legal-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="legal-modal-panel">
        <div className="legal-modal-head">
          <div><p><BrandName /> early access</p><h2 id="legal-title">{type}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        <div className="legal-modal-copy">
          {notice.sections.map(([heading, text]) => <section key={heading}><h3>{heading}</h3><p><BrandText>{text}</BrandText></p></section>)}
          <p className="legal-contact">Privacy questions: <a href="mailto:privacy@atseen.com">privacy@atseen.com</a></p>
          <small>Last updated: {notice.updated}</small>
        </div>
      </div>
    </div>
  );
}