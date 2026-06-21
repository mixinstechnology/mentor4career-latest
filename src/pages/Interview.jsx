import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import httpService from '../utils/apiService.tsx';
import { toast } from 'react-toastify';

/* ── SVG icons ── */
const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="26" height="26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 014.5 8H4a2 2 0 00-2 2v2a2 2 0 002 2h.5A2.5 2.5 0 017 16.5v1a2.5 2.5 0 002.5 2.5h5a2.5 2.5 0 002.5-2.5v-1a2.5 2.5 0 012.5-2.5H20a2 2 0 002-2v-2a2 2 0 00-2-2h-.5A2.5 2.5 0 0117 5.5v-1A2.5 2.5 0 0114.5 2h-5z"/>
  </svg>
);
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="26" height="26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const UserCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="26" height="26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
  </svg>
);
const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="26" height="26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="26" height="26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
  </svg>
);
const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="26" height="26" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .82h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const MsgIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

/* ── Data ── */
const SERVICES = [
  { icon: <VideoIcon />, color: '#4F46E5', bg: '#EEF2FF', title: 'AI Mock Interviews', desc: 'Practice realistic interview simulations with instant AI feedback on your answers, confidence, and clarity.' },
  { icon: <CodeIcon />, color: '#0891B2', bg: '#E0F7FA', title: 'Technical Interview Prep', desc: 'DSA, system design, and coding challenges with step-by-step solutions across all difficulty levels.' },
  { icon: <UserCheckIcon />, color: '#059669', bg: '#D1FAE5', title: '1-on-1 HR Round Prep', desc: 'Personal coaching from ex-recruiters and HR professionals to ace behavioral and situational questions.' },
  { icon: <DocIcon />, color: '#D97706', bg: '#FEF3C7', title: 'Resume & Profile Review', desc: 'Get a detailed review of your resume, LinkedIn and GitHub profile with actionable improvement tips.' },
  { icon: <BrainIcon />, color: '#7C3AED', bg: '#F5F3FF', title: 'Aptitude & Reasoning', desc: 'Comprehensive practice for quantitative aptitude, logical reasoning and verbal ability tests used by top companies.' },
  { icon: <TrendIcon />, color: '#DC2626', bg: '#FEE2E2', title: 'Salary Negotiation', desc: 'Learn proven techniques to negotiate your offer — from understanding market value to walking away confidently.' },
];

const HOW_IT_WORKS = [
  { num: '01', title: 'Share Your Goal', desc: 'Tell us your target company, role and current skill level so we can personalise the prep plan for you.', color: '#4F46E5' },
  { num: '02', title: 'Get a Custom Plan', desc: 'Receive a structured 2–8 week preparation roadmap covering technical, HR and aptitude rounds.', color: '#0891B2' },
  { num: '03', title: 'Practice & Improve', desc: 'Attend mock sessions, solve challenges and get expert feedback after every attempt to track growth.', color: '#059669' },
  { num: '04', title: 'Crack the Interview', desc: 'Walk in confident with real preparation behind you. Our students have placed at top MNCs and startups.', color: '#7C3AED' },
];

const TOPICS = [
  'Data Structures & Algorithms', 'System Design', 'Object Oriented Design',
  'React / Node.js / Java', 'DBMS & SQL', 'OS & Networking',
  'STAR Method for HR', 'Leadership & Teamwork', 'Conflict Resolution',
  'Case Studies (Consulting)', 'Product Sense', 'Analytical Thinking',
  'Quantitative Aptitude', 'Logical Reasoning', 'English Communication',
  'Group Discussion Tips',
];

const STATS = [
  { value: '500+', label: 'Students Placed' },
  { value: '95%', label: 'Success Rate' },
  { value: '200+', label: 'Mock Sessions/mo' },
  { value: '4.9★', label: 'Avg. Rating' },
];

/* ── Contact Modal ── */
function ContactModal({ onClose }) {
  const [form, setForm]     = useState({ name: '', email: '', contact: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await httpService.post('/contactus', {
        data: { ...form, page: 'interview' },
        token: false,
      });
      setSent(true);
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const IS = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: 10,
    padding: '10px 13px 10px 40px', fontFamily: 'var(--font-body)', fontSize: 14,
    color: 'var(--ink)', boxSizing: 'border-box', outline: 'none', background: '#fff',
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 24px 18px', color: '#fff', flexShrink: 0, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Get Interview Prep Help</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Our team will reach out within one business day.</div>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 18, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <XIcon />
          </button>
        </div>

        {/* body */}
        <div style={{ padding: '22px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 24 24" fill="none" width="32" height="32"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>Message Sent!</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 22 }}>
                Thanks for reaching out! Our team will contact you shortly about interview preparation.
              </div>
              <button onClick={onClose}
                style={{ padding: '11px 32px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name',    label: 'Full Name',     type: 'text',  placeholder: 'Your full name',    Icon: PersonIcon },
                { key: 'email',   label: 'Email Address', type: 'email', placeholder: 'you@example.com',   Icon: MailIcon   },
                { key: 'contact', label: 'Phone Number',  type: 'tel',   placeholder: '10-digit mobile',   Icon: PhoneIcon  },
              ].map(({ key, label, type, placeholder, Icon }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {label} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', display: 'flex' }}><Icon /></span>
                    <input required type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} style={IS} />
                  </div>
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Message <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ink-3)', display: 'flex' }}><MsgIcon /></span>
                  <textarea required rows={4} value={form.message} onChange={set('message')}
                    placeholder="Tell us your target role, company or what help you need…"
                    style={{ ...IS, padding: '10px 13px 10px 40px', resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: '12px 0', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={sending}
                  style={{ flex: 2, padding: '12px 0', background: sending ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: sending ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   Main Page
══════════════════════════════════ */
export default function Interview() {
  const [showContact, setShowContact] = useState(false);

  return (
    <main id="top">
      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 50%,#E0F2FE 100%)', padding: '72px 20px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid #C7D2FE', color: '#4F46E5', fontSize: 12.5, fontWeight: 700, padding: '5px 16px', borderRadius: 99, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '.07em' }}>
            <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Interview Preparation
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,5vw,52px)', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.12, margin: '0 0 20px' }}>
            Crack Your <span style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Interview</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: 36, maxWidth: 620, margin: '0 auto 36px' }}>
            End-to-end interview preparation — AI mock interviews, technical coaching, HR round practice and resume reviews — all designed to get you hired at top companies.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowContact(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15.5, cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,70,229,.35)', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Contact Us
            </button>
            {/* <Link to="/mentors" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#fff', color: '#4F46E5', border: '1.5px solid #C7D2FE', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'border-color .15s' }}>
              <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              Find a Mentor
            </Link> */}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      {/* <section style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '32px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 24, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, color: '#FCD34D', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 5, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── SERVICES ── */}
      <section style={{ padding: '72px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4F46E5', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F46E5', display: 'inline-block' }} /> What We Offer
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px,4vw,36px)', color: 'var(--ink)', margin: '0 0 14px' }}>
              Everything you need to <span style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>get hired</span>
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--ink-2)', maxWidth: 540, margin: '0 auto' }}>Six pillars of interview preparation — covering every stage of the hiring process.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: '24px 22px', transition: 'transform .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#F8FAFF', padding: '72px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4F46E5', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F46E5', display: 'inline-block' }} /> How It Works
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px,4vw,36px)', color: 'var(--ink)', margin: 0 }}>
              From sign-up to <span style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>offer letter</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 24 }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.num} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: '24px 20px', position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, color: step.color, opacity: 0.15, lineHeight: 1, marginBottom: 12 }}>{step.num}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)', marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65 }}>{step.desc}</div>
                <div style={{ position: 'absolute', top: 20, right: 20, width: 8, height: 8, borderRadius: '50%', background: step.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOPICS ── */}
      <section style={{ padding: '72px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4F46E5', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F46E5', display: 'inline-block' }} /> Curriculum
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px,4vw,36px)', color: 'var(--ink)', margin: 0 }}>
              Topics we <span style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>cover</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {TOPICS.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F8FAFF', border: '1.5px solid #E0E7FF', borderRadius: 99, padding: '8px 16px', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)' }}>
                <span style={{ color: '#4F46E5', display: 'flex' }}><CheckIcon /></span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '20px 20px 72px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 24, padding: '52px 40px', textAlign: 'center', boxShadow: '0 24px 64px rgba(79,70,229,.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px,4vw,34px)', color: '#fff', margin: '0 0 14px', lineHeight: 1.2, position: 'relative' }}>
            Ready to start preparing?
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px', position: 'relative' }}>
            Get in touch with our team and we'll build a personalised interview preparation plan tailored to your goals and target companies.
          </p>
          <button onClick={() => setShowContact(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 36px', background: '#fff', color: '#4F46E5', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15.5, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,.18)', transition: 'transform .15s', position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Contact Us Now
          </button>
        </div>
      </section>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </main>
  );
}
