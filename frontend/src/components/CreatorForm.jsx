import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { audiences, categories } from '../constants';

const optionalUrl = z.union([z.literal(''), z.string().url('Enter a complete URL including https://')]);
const schema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(190),
  phone: z.string().max(40),
  country: z.string().trim().min(2, 'Enter your country').max(100),
  city: z.string().max(100),
  creatorCategory: z.enum(categories, { message: 'Choose a category' }),
  mainSocialPlatform: z.string().max(80),
  socialProfileUrl: optionalUrl,
  audienceSize: z.union([z.literal(''), z.enum(audiences)]),
  creatorDescription: z.string().max(1000, 'Keep this under 1,000 characters'),
  consentGiven: z.boolean().refine(Boolean, 'Consent is required'),
  website: z.string().max(200).optional(),
});
const defaults = { fullName: '', email: '', phone: '', country: '', city: '', creatorCategory: '', mainSocialPlatform: '', socialProfileUrl: '', audienceSize: '', creatorDescription: '', consentGiven: false, website: '' };

function Field({ label, name, register, error, required, children, ...props }) {
  return <label className={props.className}><span className="label">{label}{required && ' *'}</span>{children || <input className="field" {...register(name)} {...props} />}{error && <span className="error" role="alert">{error.message}</span>}</label>;
}

export default function CreatorForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: defaults, shouldFocusError: true });

  const submit = async (data) => {
    try {
      await api.post('/leads', data);
      setSent(true);
      toast.success('You’re on the creator list.');
    } catch (error) {
      const fields = error.response?.data?.errors;
      if (fields?.length) {
        fields.forEach(({ field, message }, index) => setError(field, { type: 'server', message }, { shouldFocus: index === 0 }));
        if (!fields.some(({ field }) => field === 'email')) toast.error(error.response?.data?.message || 'Please check the highlighted fields.');
        return;
      }
      toast.error(error.response?.data?.message || 'We could not send your details. Please try again.');
    }
  };
  const invalid = (formErrors) => {
    const firstError = Object.values(formErrors)[0];
    toast.error(firstError?.message || 'Please check the highlighted fields and try again.');
  };

  if (sent) return <div className="panel flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><span className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success"><Check /></span><h3 className="mt-6 text-2xl font-semibold">Thank you. You’ve been added to the creator list.</h3><p className="mt-3 max-w-md text-white/55">We’ll be in touch when the first worlds are ready to open.</p><button className="btn btn-secondary mt-8" onClick={() => { reset(defaults); setSent(false); window.history.replaceState(null, '', '/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to home</button></div>;

  return <form onSubmit={handleSubmit(submit, invalid)} className="panel grid gap-5 p-5 md:grid-cols-2 md:p-8" noValidate>
    <div className="absolute -left-[9999px]" aria-hidden="true"><label>Leave this field empty<input tabIndex="-1" autoComplete="new-password" {...register('website')} /></label></div>
    <Field label="Full name" name="fullName" register={register} error={errors.fullName} required placeholder="Your full name" />
    <Field label="Email address" name="email" type="email" register={register} error={errors.email} required placeholder="you@example.com" />
    <Field label="Phone or WhatsApp number" name="phone" register={register} error={errors.phone} placeholder="Optional" />
    <Field label="Country" name="country" register={register} error={errors.country} required placeholder="Your country" />
    <Field label="City" name="city" register={register} error={errors.city} placeholder="Optional" />
    <Field label="Creator category" name="creatorCategory" register={register} error={errors.creatorCategory} required><select className="field" {...register('creatorCategory')}><option value="">Select category</option>{categories.map((x) => <option key={x}>{x}</option>)}</select></Field>
    <Field label="Main social platform" name="mainSocialPlatform" register={register} error={errors.mainSocialPlatform} placeholder="Optional" />
    <Field label="Social profile URL" name="socialProfileUrl" type="url" register={register} error={errors.socialProfileUrl} placeholder="https://example.com/profile" />
    <Field label="Approximate audience size" name="audienceSize" register={register} error={errors.audienceSize}><select className="field" {...register('audienceSize')}><option value="">Prefer not to say</option>{audiences.map((x) => <option key={x}>{x}</option>)}</select></Field>
    <Field label="A little about what you create" name="creatorDescription" register={register} error={errors.creatorDescription} className="md:col-span-2"><textarea className="field min-h-32 resize-y" {...register('creatorDescription')} placeholder="Optional" /></Field>
    <label className="flex items-start gap-3 text-sm text-white/60 md:col-span-2"><input type="checkbox" className="mt-1 accent-[#9CCBFF]" {...register('consentGiven')} /><span>I agree that @seen may contact me about creator opportunities. *</span></label>
    {errors.consentGiven && <p className="error md:col-span-2" role="alert">{errors.consentGiven.message}</p>}
    <button type="submit" disabled={isSubmitting} className="btn btn-primary md:col-span-2 md:justify-self-start">{isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <>Join the creator list <ArrowRight size={17} /></>}</button>
  </form>;
}
