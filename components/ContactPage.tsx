import React, { useState } from 'react';
import { trackEvent } from '../services/analytics';
import { Icon } from './Icon';

interface ContactPageProps {
  navigate: (path: string) => void;
}

const SERVICES = [
  'Premium Website',
  'Landing Page (72h)',
  'Web App / SaaS',
  'Mobile App',
  'Brand Identity',
  'AI Agent System',
  'Other',
];

const BUDGETS = [
  { label: 'Under $5k', value: 'under-5k' },
  { label: '$5k – $15k', value: '5k-15k' },
  { label: '$15k – $30k', value: '15k-30k' },
  { label: '$30k – $50k', value: '30k-50k' },
  { label: '$50k+', value: '50k-plus' },
];

const TIMELINES = [
  { label: 'ASAP (< 2 weeks)', value: 'asap' },
  { label: 'Within 1 month', value: '1-month' },
  { label: '2–3 months', value: '2-3-months' },
  { label: 'Flexible', value: 'flexible' },
];

interface FormState {
  name: string;
  email: string;
  company: string;
  website: string;
  services: string[];
  vision: string;
  budget: string;
  timeline: string;
  references: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  company: '',
  website: '',
  services: [],
  vision: '',
  budget: '',
  timeline: '',
  references: '',
};

const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (s: string) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(s)
        ? f.services.filter(x => x !== s)
        : [...f.services, s],
    }));
  };

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required.';
    if (!form.company.trim()) return 'Company name is required.';
    if (form.services.length === 0) return 'Select at least one service.';
    return '';
  };

  const validateStep2 = () => {
    if (!form.vision.trim()) return 'Tell us your vision or story. This field is required.';
    if (!form.budget) return 'Budget range is required. Forms without a budget are discarded.';
    if (!form.timeline) return 'Timeline is required.';
    return '';
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    trackEvent('contact_form_submit', { budget: form.budget, services: form.services.join(',') });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="max-w-lg w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)' }}
          >
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1
            className="text-5xl md:text-6xl text-gray-900 dark:text-white mb-4"
            style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
          >
            WE'VE GOT IT.
          </h1>
          <p className="text-gray-900/60 dark:text-white/60 mb-8 leading-relaxed">
            Your brief is in. We'll review it and come back to you within 24 hours with a proper response, not a template.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 rounded-full font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: '#FF5630', boxShadow: '0 0 20px rgba(255,86,48,0.4)' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-32">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border mb-4"
            style={{ background: 'rgba(255,86,48,0.08)', borderColor: 'rgba(255,86,48,0.25)', color: '#FF5630' }}
          >
            Project Intake
          </span>
          <h1
            className="text-5xl md:text-6xl text-gray-900 dark:text-white leading-[0.95] mb-3"
            style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.02em' }}
          >
            LET'S BUILD<br />
            <span style={{ color: '#FF5630', textShadow: '0 0 24px rgba(255,86,48,0.5)' }}>SOMETHING REAL.</span>
          </h1>
          <p className="text-gray-900/50 dark:text-white/50 text-sm">
            Answer a few questions so we understand your project. We read every submission personally.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={
                    step >= s
                      ? { background: '#FF5630', color: '#fff', boxShadow: '0 0 12px rgba(255,86,48,0.5)' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {step > s ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                <span className={`text-xs ${step >= s ? 'text-white/80' : 'text-white/30'}`}>
                  {s === 1 ? 'About You' : 'Your Project'}
                </span>
              </div>
              {s < 2 && <div className="flex-1 h-px" style={{ background: step > 1 ? 'rgba(255,86,48,0.4)' : 'rgba(255,255,255,0.08)' }} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Your Name *" htmlFor="name">
                    <input
                      id="name"
                      type="text"
                      placeholder="Muhammad Abubakar"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full"
                    />
                  </Field>
                  <Field label="Email *" htmlFor="email">
                    <input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Company Name *" htmlFor="company">
                    <input
                      id="company"
                      type="text"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full"
                    />
                  </Field>
                  <Field label="Website or Social Link" htmlFor="website">
                    <input
                      id="website"
                      type="text"
                      placeholder="https://yoursite.com"
                      value={form.website}
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      className="w-full"
                    />
                  </Field>
                </div>

                <Field label="Services You're After *" htmlFor="services">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SERVICES.map(s => {
                      const selected = form.services.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleService(s)}
                          className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                          style={
                            selected
                              ? { background: '#FF5630', color: '#fff', boxShadow: '0 0 12px rgba(255,86,48,0.4)' }
                              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                          }
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Field label="Your Vision or Story *" htmlFor="vision">
                  <textarea
                    id="vision"
                    rows={5}
                    placeholder="Tell us the story, vision, or anything else that helps us understand your project and goals. What problem are you solving? Who's the audience? What does success look like?"
                    value={form.vision}
                    onChange={e => setForm(f => ({ ...f, vision: e.target.value }))}
                    className="w-full resize-none"
                  />
                </Field>

                <Field label="Budget Range (USD) *" htmlFor="budget">
                  <p className="text-[10px] text-red-400/70 mb-3 uppercase tracking-widest font-semibold">
                    Required. Submissions without a budget are discarded.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map(b => {
                      const selected = form.budget === b.value;
                      return (
                        <button
                          key={b.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, budget: b.value }))}
                          className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                          style={
                            selected
                              ? { background: '#FF5630', color: '#fff', boxShadow: '0 0 12px rgba(255,86,48,0.4)' }
                              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                          }
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Projected Timeline *" htmlFor="timeline">
                  <div className="flex flex-wrap gap-2">
                    {TIMELINES.map(t => {
                      const selected = form.timeline === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, timeline: t.value }))}
                          className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                          style={
                            selected
                              ? { background: '#FF5630', color: '#fff', boxShadow: '0 0 12px rgba(255,86,48,0.4)' }
                              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                          }
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Reference Links (optional)" htmlFor="references">
                  <input
                    id="references"
                    type="text"
                    placeholder="Moodboard, Figma, Drive, Pinterest: paste links here"
                    value={form.references}
                    onChange={e => setForm(f => ({ ...f, references: e.target.value }))}
                    className="w-full"
                  />
                </Field>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="mt-6 rounded-xl px-4 py-3 text-xs text-red-300"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(1); }}
                  className="px-6 py-3 rounded-full text-sm font-semibold text-gray-900/60 dark:text-white/60 hover:text-gray-900 dark:text-white transition-colors duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
                >
                  ← Back
                </button>
              ) : <div />}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3.5 rounded-full font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95 ml-auto"
                  style={{ background: '#FF5630', boxShadow: '0 0 20px rgba(255,86,48,0.4)' }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: '#FF5630', boxShadow: '0 0 20px rgba(255,86,48,0.4)' }}
                >
                  Submit Brief
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-900/25 dark:text-white/25">
          We respond within 24 hours. No sales pitch, no auto-replies.
        </p>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; htmlFor: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-900/60 dark:text-white/60 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className="[&_input]:bg-white/5 [&_input]:border [&_input]:border-white/10 [&_input]:rounded-xl [&_input]:px-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-gray-900 dark:text-white [&_input]:placeholder-white/25 [&_input]:outline-none [&_input]:focus:border-[#FF5630]/50 [&_input]:transition-colors [&_input]:duration-200 [&_textarea]:bg-white/5 [&_textarea]:border [&_textarea]:border-white/10 [&_textarea]:rounded-xl [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:text-gray-900 dark:text-white [&_textarea]:placeholder-white/25 [&_textarea]:outline-none [&_textarea]:focus:border-[#FF5630]/50 [&_textarea]:transition-colors [&_textarea]:duration-200 [&_textarea]:w-full">
      {children}
    </div>
  </div>
);

export default ContactPage;
