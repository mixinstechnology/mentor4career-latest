import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import { AVATAR_COLORS, FOCUS_LABEL } from '../data/mentors.js';
import MentorCard from '../components/MentorCard.jsx';
import JourneyRail from '../components/JourneyRail.jsx';
import { Logo, ArrowRight, Search, Cap, Person, Doc, Brief, Webinar, Check } from '../components/Icons.jsx';
import JobAdPopup from '../components/JobAdPopup.jsx';
import httpService from '../utils/apiService.tsx';

function getLoggedInUserId() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id ?? payload.userId ?? null;
  } catch { return null; }
}

const HOW_IT_WORKS_STEPS = [
  {
    num: '01',
    title: 'Create Your Profile',
    desc: 'Sign up and fill in your expertise, education, experience, and set your hourly availability. It only takes a few minutes.',
    color: 'var(--indigo)',
    bg: 'linear-gradient(135deg,#EEF0FF,#E9F1FF)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Get Discovered',
    desc: 'Students find you through search filters, AI matching, and personalised recommendations based on their goals and exam.',
    color: 'var(--emerald)',
    bg: 'linear-gradient(135deg,#E7F7EF,#D9F4E8)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Conduct Sessions',
    desc: 'Accept bookings and run 1-on-1 video or chat sessions on your own schedule. You stay in full control of your calendar.',
    color: 'var(--amber)',
    bg: 'linear-gradient(135deg,#FEF3DA,#FEF0C7)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Earn & Make Impact',
    desc: 'Get paid securely for every session, build your reputation with student reviews, and watch your mentees succeed.',
    color: 'var(--violet)',
    bg: 'linear-gradient(135deg,#F0EEFF,#EAE4FF)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8L12 2z"/>
      </svg>
    ),
  },
];

function loadRazorpayScriptHome() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function HomeWebinarRegisterModal({ webinar, onClose, onRegistered }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: user?.firstName || user?.name || '',
    contact:  user?.contactNumber || user?.phone || '',
    email:    user?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const overlayRef = useRef(null);

  const isPaid       = !webinar.isFree && Number(webinar.price) > 0;
  const PLAT_PCT     = Number(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE) || 10;
  const GST_PCT_W    = Number(import.meta.env.VITE_GST_PERCENTAGE) || 18;
  const GW_FEE_PCT   = 2;
  const base         = Number(webinar.price) || 0;
  const plat         = isPaid ? Math.round(base * PLAT_PCT / 100) : 0;
  const sub          = base + plat;
  const gst          = isPaid ? Math.round(sub * GST_PCT_W / 100) : 0;
  const preTax       = isPaid ? sub + gst : 0;
  const gw           = isPaid ? Math.round(preTax * GW_FEE_PCT / 100) : 0;
  const total        = isPaid ? preTax + gw : 0;
  const money        = (n) => '₹' + n.toLocaleString('en-IN');
  const IS = { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 13px', fontSize: 14, color: '#1e293b', boxSizing: 'border-box', outline: 'none', background: '#fff', fontFamily: 'inherit' };

  const getUserId = () => user?.id ?? user?.userId ?? null;

  const doRegister = async (txnId = null) => {
    await httpService.post(`/webinar/${webinar.id}/register`, {
      data: { webinarId: webinar.id, authUserId: null, userId: getUserId(), username: form.username, contact: form.contact, email: form.email, webinarFee: base, gstAmount: gst, paymentGatewayCharge: gw, discount: 0, totalAmount: total, couponCode: '', ...(txnId && { paymentStatus: true }) },
      token: true,
    });
    setDone(true);
    setSubmitting(false);
    onRegistered?.(webinar.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!isPaid) { try { await doRegister(); } catch { setSubmitting(false); } return; }
    const loaded = await loadRazorpayScriptHome();
    if (!loaded) { alert('Payment service unavailable.'); setSubmitting(false); return; }
    let txnDbId = null;
    try {
      const txnRes = await httpService.post('/transaction', { data: { transactionId: `TXN-${Date.now()}`, authUserId: null, userId: getUserId(), formType: 'webinar', referenceId: String(webinar.id), amount: total, currency: 'INR', status: 'created', gateway: 'razorpay', remarks: `Webinar: ${webinar.title}` }, token: true });
      txnDbId = txnRes?.data?.transactionId ?? txnRes?.transactionId ?? null;
    } catch { setSubmitting(false); return; }
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_TEST_KEY, amount: total * 100, currency: 'INR', name: 'Mentor4Career', description: webinar.title, image: '/logo.png',
      handler: async (r) => {
        if (txnDbId) try { await httpService.put(`/transaction/status/${txnDbId}`, { data: { status: 'success', razorPayTransactionId: r.razorpay_payment_id }, token: true }); } catch {}
        try { await doRegister(r.razorpay_payment_id); } catch { setSubmitting(false); }
      },
      prefill: { name: form.username, email: form.email, contact: form.contact },
      theme: { color: '#4F46E5' }, modal: { ondismiss: () => setSubmitting(false) },
    });
    rzp.open();
  };

  return (
    <div ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 22px 18px', color: '#fff', flexShrink: 0, position: 'relative' }}>
          <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.35, marginBottom: 6 }}>{webinar.title}</div>
          <div style={{ fontSize: 12.5, opacity: 0.85, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {webinar.presenter && <span>{webinar.presenter}</span>}
            <span>{webinar.isFree ? 'Free' : `₹${webinar.price}`}</span>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 18, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ padding: '20px 22px 22px', overflowY: 'auto', flex: 1 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '14px 0 4px' }}>
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>You're registered!</div>
              <div style={{ fontSize: 13.5, color: '#475569', marginBottom: 20 }}>Seat confirmed for <b>{webinar.title}</b>.</div>
              <button onClick={onClose} style={{ padding: '10px 28px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>Fill in your details to secure your seat.</p>
              {[{ key: 'username', label: 'Full Name', type: 'text', placeholder: 'Your full name' }, { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' }, { key: 'contact', label: 'Phone', type: 'tel', placeholder: '10-digit mobile' }].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label} <span style={{ color: '#EF4444' }}>*</span></label>
                  <input required type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={IS} />
                </div>
              ))}
              {isPaid && (
                <div style={{ background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[['Webinar fee', money(base)], ['Platform + Gateway', money(plat + gw)], [`GST (${GST_PCT_W}%)`, money(gst)]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}><span>{l}</span><span>{v}</span></div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 800, color: '#4F46E5', borderTop: '1px solid #C7D2FE', paddingTop: 5, marginTop: 2 }}><span>Total</span><span>{money(total)}</span></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 0', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 11, fontWeight: 700, fontSize: 13.5, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px 0', background: submitting ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 11, fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? (isPaid ? 'Processing…' : 'Registering…') : (isPaid ? `Pay ${money(total)} & Register` : 'Confirm Registration')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const WBN_GRADS = [
  'linear-gradient(135deg,#4F46E5,#7C3AED)',
  'linear-gradient(135deg,#0FA968,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#EC4899,#F59E0B)',
  'linear-gradient(135deg,#7C5CF7,#EC4899)',
  'linear-gradient(135deg,#10B981,#3B82F6)',
];

function fmtWbnDate(date, time) {
  if (!date) return '';
  try {
    const d = new Date(`${date}T${time || '00:00'}`);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      + (time ? ` · ${time}` : '');
  } catch { return date; }
}

function WebinarCard({ webinar: w, idx, isRegistered, onBook }) {
  const grad = WBN_GRADS[idx % WBN_GRADS.length];
  const isActive = !w.status || w.status === 'upcoming' || w.status === 'ongoing';
  return (
    <div className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 16 }}>
      {/* Banner — taller when image present */}
      <div style={{ position: 'relative', height: w.image?.url ? 190 : 140, flexShrink: 0, background: grad }}>
        {w.image?.url
          ? <img src={w.image.url} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="44" height="44" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 7V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
        }
        {w.image?.url && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.45) 100%)' }} />}
        <span style={{ position: 'absolute', top: 10, left: 10, background: w.isFree ? 'rgba(16,185,129,0.92)' : 'rgba(79,70,229,0.92)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '.04em', backdropFilter: 'blur(4px)' }}>
          {w.isFree ? 'FREE' : `₹${Number(w.price || 0).toLocaleString('en-IN')}`}
        </span>
        {w.duration && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
            {w.duration} min
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 4 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {w.title}
        </div>
        {w.presenter && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>{w.presenter}</div>
        )}
        {(w.date || w.time) && (
          <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            {fmtWbnDate(w.date, w.time)}
          </div>
        )}
        <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', gap: 8 }}>
          {/* Book Now / Registered */}
          {isActive ? (
            isRegistered ? (
              <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#DCFCE7', color: '#15803D', border: '1.5px solid #86EFAC', borderRadius: 9, padding: '9px 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
                <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Registered
              </span>
            ) : (
              <button onClick={() => onBook?.(w)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Book Now
              </button>
            )
          ) : (
            <span style={{ flex: 1, textAlign: 'center', padding: '9px 0', background: '#F3F4F6', color: '#9CA3AF', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
              {w.status === 'cancelled' ? 'Cancelled' : 'Ended'}
            </span>
          )}
          {/* Join if ongoing */}
          {w.link && w.status === 'ongoing' && (
            <a href={w.link} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function HowItWorksModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="hiw-modal-overlay" onClick={onClose}>
      <div className="hiw-modal-dialog" role="dialog" aria-modal="true" aria-label="How Mentorship Works" onClick={(e) => e.stopPropagation()}>
        <button className="hiw-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div className="hiw-header">
          <span className="eyebrow"><span className="dot" /> Step-by-step</span>
          <h2 className="hiw-title">How Mentorship Works</h2>
          <p className="hiw-sub">From sign-up to your first session — here's exactly what happens.</p>
        </div>
        <div className="hiw-steps">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div className="hiw-step" key={step.num}>
              <div className="hiw-step-icon" style={{ background: step.bg, color: step.color }}>
                {step.icon}
              </div>
              <div className="hiw-step-body">
                <span className="hiw-step-num" style={{ color: step.color }}>{step.num}</span>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="hiw-footer">
          <p>Ready to start mentoring?</p>
          <button className="btn btn-primary btn-lg" onClick={onClose}>Got it — let's go!</button>
        </div>
      </div>
    </div>
  );
}

const EXAMS = ['JEE', 'NEET', 'MHT-CET', 'CAT / MBA', 'CUET'];

const EMPTY_FILTERS = {
  streamId:     null,
  universityId: null,
  languages:    [],
  helpFor:      [],
  industries:   [],
  experience:   null,
  minCharge:    null,
  maxCharge:    null,
};

function mapApiMentor(item) {
  if (!item?.isVerified) return null;
  return {
    id:        item.authUserId,
    init:      (String(item.firstName || '').slice(0, 1) + String(item.lastName || '').slice(0, 1)).toUpperCase() || '??',
    name:      `${item.firstName || ''} ${item.lastName || ''}`.trim(),
    type:      item.type || 'mentor',
    typeLabel: item.type === 'alumni' ? 'Alumni' : item.type === 'pro' ? 'Professional' : 'Mentor',
    role:      item.jobRole || '',
    org:       item.organizationName || '',
    stream:    'cse',
    focus:     ['admissions', 'campus', 'placement'],
    rating:    item.rating ?? 4.9,
    reviews:   item.reviews ?? 0,
    sessions:  item.sessions ?? 0,
    price:     item.chargePerSession ?? 0,
    resp:      '~2 hrs',
    bio:       item.bio || '',
  };
}

export default function Home() {
  const { openAuth, user, setPendingWebinar, pendingWebinar, setReturnPath } = useAuth();
  const [exam, setExam] = useState('JEE');
  const [showJobAd, setShowJobAd] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  /* ── mentor filter state ── */
  const [filterOptions,  setFilterOptions]  = useState(null);
  const [filters,        setFilters]        = useState(EMPTY_FILTERS);
  const [mentors,        setMentors]        = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [filterOpen,     setFilterOpen]     = useState(false);

  /* ── webinar state ── */
  const [webinars,      setWebinars]      = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [registerFor,   setRegisterFor]   = useState(null);

  useEffect(() => {
    if (!user || !pendingWebinar) return;
    const checkAndRegister = async () => {
      const uid = getLoggedInUserId();
      if (!uid) { setRegisterFor(pendingWebinar); setPendingWebinar(null); return; }
      try {
        const res = await httpService.get(`/webinar/my-registrations/${uid}`, { params: { page: 1, limit: 200 }, token: true });
        const regs = Array.isArray(res?.registrations) ? res.registrations : [];
        const ids = regs.map(r => String(r.webinarId ?? r.webinar_id ?? r.Webinar?.id ?? r.id)).filter(Boolean);
        setRegisteredIds(new Set(ids));
        if (ids.includes(String(pendingWebinar.id))) {
          toast.info('You are already registered for this webinar.');
        } else {
          setRegisterFor(pendingWebinar);
        }
      } catch {
        setRegisterFor(pendingWebinar);
      }
      setPendingWebinar(null);
    };
    checkAndRegister();
  }, [user, pendingWebinar]); // eslint-disable-line

  /* fetch filter options once */
  useEffect(() => {
    httpService.get('/mentorProfile/filter-options', { token: false })
      .then(res => {
        setFilterOptions(res);
        /* initialise charge range from API */
        if (res?.chargeRange) {
          setFilters(f => ({ ...f, minCharge: res.chargeRange.min, maxCharge: res.chargeRange.max }));
        }
      })
      .catch(() => {});
  }, []);

  /* fetch mentors whenever filters change */
  const fetchMentors = useCallback(async (activeFilters) => {
    setMentorsLoading(true);
    try {
      const params = { page: 1, limit: 12 };
      if (activeFilters.streamId)               params.streamId      = activeFilters.streamId;
      if (activeFilters.universityId)            params.universityId  = activeFilters.universityId;
      if (activeFilters.languages.length)        params.language      = activeFilters.languages.join(',');
      if (activeFilters.helpFor.length)          params.helpFor       = activeFilters.helpFor.join(',');
      if (activeFilters.industries.length)       params.industry      = activeFilters.industries.join(',');
      if (activeFilters.experience !== null)     params.minExperience = activeFilters.experience;
      if (activeFilters.minCharge !== null)      params.minCharge     = activeFilters.minCharge;
      if (activeFilters.maxCharge !== null)      params.maxCharge     = activeFilters.maxCharge;

      const res  = await httpService.get('/mentorProfile', { params, token: false });
      const rows = res?.rows ?? res?.data ?? (Array.isArray(res) ? res : []);
      setMentors(rows.map(mapApiMentor).filter(Boolean));
    } catch {}
    finally { setMentorsLoading(false); }
  }, []);

  useEffect(() => { fetchMentors(filters); }, [filters, fetchMentors]);

  useEffect(() => {
    httpService.get('/webinar', { params: { page: 1, limit: 12 } })
      .then(res => {
        const inner = res?.webinars;
        const data  = Array.isArray(inner?.webinars) ? inner.webinars
                    : Array.isArray(inner)            ? inner
                    : Array.isArray(res)              ? res
                    : Array.isArray(res?.data)        ? res.data : [];
        const filtered = data.filter(w => !w.status || w.status === 'upcoming' || w.status === 'ongoing');
        console.log('[Home] webinar ids:', filtered.map(w => w.id));
        setWebinars(filtered);
      })
      .catch(() => {});
  }, []);

  /* load already-registered webinar IDs — fetch on mount and after login */
  const fetchRegisteredIds = useCallback(async () => {
    const uid = user?.id ?? user?.userId ?? user?._id ?? getLoggedInUserId();
    console.log('[Home] fetchRegisteredIds uid:', uid);
    if (!uid) return;
    try {
      const res  = await httpService.get(`/webinar/my-registrations/${uid}`, { params: { page: 1, limit: 200 }, token: true });
      console.log('[Home] my-registrations res:', res);
      const regs = Array.isArray(res?.registrations) ? res.registrations
                 : Array.isArray(res?.data)           ? res.data
                 : Array.isArray(res)                 ? res : [];
      const ids  = regs
        .map(r => r.webinarId ?? r.webinar_id ?? r.Webinar?.id ?? r.webinar?.id ?? r.id)
        .filter(Boolean)
        .map(String);
      console.log('[Home] registeredIds set:', ids);
      setRegisteredIds(new Set(ids));
    } catch (err) {
      console.warn('[Home] my-registrations failed:', err?.message);
    }
  }, [user]);

  useEffect(() => { fetchRegisteredIds(); }, [fetchRegisteredIds]);

  useEffect(() => {
    if (sessionStorage.getItem('jobAdSeen')) return;
    const t = setTimeout(() => {
      setShowJobAd(true);
      sessionStorage.setItem('jobAdSeen', '1');
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  /* ── derived filter helpers ── */
  const activeFilterCount = [
    filters.streamId,
    filters.universityId,
    ...filters.languages,
    ...filters.helpFor,
    ...filters.industries,
    filters.experience,
  ].filter(Boolean).length + (
    filterOptions?.chargeRange &&
    (filters.minCharge !== filterOptions.chargeRange.min || filters.maxCharge !== filterOptions.chargeRange.max)
      ? 1 : 0
  );

  const toggleMulti = (key, val) =>
    setFilters(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }));

  const toggleSingle = (key, val) =>
    setFilters(f => ({ ...f, [key]: f[key] === val ? null : val }));
  return (
    <>
      {showJobAd && <JobAdPopup onClose={() => setShowJobAd(false)} />}

      {/* <div className="announce">
        <div className="wrap">
          <span className="a-pill">NEW</span>
          <span className="a-extra">AI College Predictor 2026 is live —</span>
          <b>predict your best college free.</b>
          <Link to="/predictor">Try now <ArrowRight width="24" height="24" /></Link>
        </div>
      </div> */}

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy reveal">
              {/* <span className="eyebrow"><span className="dot" /> AI Career Guidance for Students &amp; Freshers</span> */}
              <h1 style={{ marginTop: 0 }}>Find the right college, mentor &amp; <span className="grad-text">your dream career</span></h1>
              <p className="sub">AI college predictions, verified mentors, interview prep, internships and jobs — everything you need to plan your future with confidence, in one platform.</p>

              {/* <div className="hero-search">
                <div className="hs-field">
                  <Search width="24" height="24" />
                  <input type="text" placeholder="Search colleges, exams, careers or mentors…" />
                </div>
                <button className="btn btn-primary">Search</button>
              </div> */}
              {/* <div className="exam-chips">
                <span className="lbl">Popular:</span>
                {EXAMS.map((e) => (
                  <button key={e} className={'chip' + (exam === e ? ' active' : '')} onClick={() => setExam(e)}>{e}</button>
                ))}
              </div> */}

              <div className="hero-trust">
                <div className="avatars">
                  <span style={{ background: 'linear-gradient(135deg,#4F46E5,#3B82F6)' }}>A</span>
                  <span style={{ background: 'linear-gradient(135deg,#7C5CF7,#EC4899)' }}>R</span>
                  <span style={{ background: 'linear-gradient(135deg,#0FA968,#06B6D4)' }}>S</span>
                  <span style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>M</span>
                  <span style={{ background: 'linear-gradient(135deg,#06B6D4,#3B82F6)' }}>K</span>
                </div>
                <div>
                 <small>1-1 Mentorship Guidance</small>
                  {/* <div className="stars">★★★★★ <b style={{ color: 'var(--ink)', fontSize: 14 }}>4.9/5</b></div>
                  <small>Trusted by 1,20,000+ students across India</small> */}
                </div>
              </div>
            </div>

            {/* hero visual */}
            <div className="hero-visual reveal">
              <span className="hero-blob" />
              <div className="float-card fc1">
                <span className="fc-ico" style={{ background: 'linear-gradient(135deg,#0FA968,#06B6D4)' }}><Check width="20" height="20" /></span>
                <div><div className="fc-t">Profile Verified</div><div className="fc-s">100+ mentors</div></div>
              </div>
              <div className="float-card fc2">
                <span className="fc-ring"><i>92%</i></span>
                <div><div className="fc-t">College Match</div><div className="fc-s">COEP Pune · CSE</div></div>
              </div>
              <div className="float-card fc3">
                <span className="fc-ico" style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>
                  <svg viewBox="0 0 24 24" width="20" fill="none"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8L12 3z" fill="currentColor" /></svg>
                </span>
                <div><div className="fc-t">Got my dream seat!</div><div className="fc-s">Rohan · JEE 96.4%ile</div></div>
              </div>
              <div className="hero-photo">
                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#EEF0FF,#E9F1FF)', color: 'var(--ink-3)', fontWeight: 600, fontSize: 14 }}>Student photo</div>
              </div>
            </div>
          </div>
        </section>

        {/* DOMAIN STRIP */}
        <section className="logos">
          <div className="wrap">
            <div className="lead">Expert guidance across exams, careers &amp; college admissions — all in one place</div>
            <div className="marquee">
              <div className="marquee-track">
                {(((items) => [...items, ...items])([
                  { label: 'JEE Prep', grad: 'linear-gradient(135deg,#4F46E5,#3B82F6)' },
                  { label: 'NEET Prep', grad: 'linear-gradient(135deg,#0FA968,#06B6D4)' },
                  { label: 'CAT / MBA', grad: 'linear-gradient(135deg,#7C5CF7,#EC4899)' },
                  { label: 'MHT-CET', grad: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
                  { label: 'CUET', grad: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
                  { label: 'GATE', grad: 'linear-gradient(135deg,#EC4899,#F59E0B)' },
                  { label: 'Resume Building', grad: 'linear-gradient(135deg,#4F46E5,#0FA968)' },
                  { label: 'Interview Prep', grad: 'linear-gradient(135deg,#3B82F6,#7C5CF7)' },
                  { label: 'College Admissions', grad: 'linear-gradient(135deg,#0FA968,#4F46E5)' },
                  { label: 'Coding Interviews', grad: 'linear-gradient(135deg,#EF4444,#F59E0B)' },
                  { label: 'Career Guidance', grad: 'linear-gradient(135deg,#06B6D4,#EC4899)' },
                  { label: 'Scholarship Help', grad: 'linear-gradient(135deg,#7C5CF7,#3B82F6)' },
                ])).map((item, i) => (
                  <span className="logo-chip" key={i}>
                    <span className="mark" style={{ background: item.grad }}>{item.label.slice(0, 3).toUpperCase()}</span> {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CAREER JOURNEY */}
        <section className="journey section-pad" id="journey">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow"><span className="dot" /> For Students &amp; Jobseekers</span>
              <h2 className="section-title">From first-year confusion to your <span className="grad-text">first offer</span></h2>
              <p className="section-sub">One guided flow for everyone. Students start at the very beginning; jobseekers jump straight to a mentor — and both arrive at the same place: hired.</p>
              <div className="jlegend">
                <span className="jlg jlg-student"><i /> Student — starts at the beginning</span>
                <span className="jlg jlg-job"><i /> Jobseeker — straight to a mentor</span>
              </div>
            </div>
            <JourneyRail />
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="section-pad" id="overview">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow"><span className="dot" /> One Platform, Every Step</span>
              <h2 className="section-title">Everything you need for <span className="grad-text">career success</span></h2>
              <p className="section-sub">From your first college decision to your dream job offer. Tap any card to explore.</p>
            </div>
            <div className="overview-grid">
              <Link to="/predictor" className="card card-hover overview-card reveal"><span className="icon-badge"><Cap width="24" height="24" /></span><h3>AI College Predictor</h3><p>Predict your best-fit colleges from NEET, JEE, CET or MBA scores in seconds.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <Link to="/mentors" className="card card-hover overview-card reveal"><span className="icon-badge emerald"><Person width="24" height="24" /></span><h3>Verified Mentors</h3><p>Talk 1-on-1 with college seniors, alumni and working professionals.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <Link to="/interview" className="card card-hover overview-card reveal"><span className="icon-badge amber"><Doc width="24" height="24" /></span><h3>Interview Preparation</h3><p>Mock interviews, AI practice and expert feedback that gets you hired.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <Link to="/jobs" className="card card-hover overview-card reveal"><span className="icon-badge blue"><Brief width="24" height="24" /></span><h3>Internships &amp; Jobs</h3><p>Find internships and fresher jobs, apply and track every application.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <a href="#" className="card card-hover overview-card reveal"><span className="icon-badge pink"><svg viewBox="0 0 24 24" fill="none" width="24"><path d="M3 17l5-5 4 3 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 4h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span><h3>Career Roadmaps</h3><p>See skills, salaries and growth for every path before you choose.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></a>
              <Link to="/webinars" className="card card-hover overview-card reveal"><span className="icon-badge"><Webinar width="24" height="24" /></span><h3>Live Webinars</h3><p>Free &amp; premium sessions with industry experts, toppers and recruiters.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
            </div>
          </div>
        </section>

        {/* MENTORS WITH FILTERS */}
        <section className="section-pad" id="featured-mentors">
          <div className="wrap">

            {/* ── section header ── */}
            <div className="sh-row reveal" style={{ marginBottom: 28 }}>
              <div className="sh-left">
                <span className="eyebrow"><span className="dot" /> Meet Your Mentors</span>
                <h2 className="section-title">Learn from people who've <span className="grad-text">been there</span></h2>
              </div>
              <Link to="/mentors" className="view-all">View all mentors <ArrowRight width="24" height="24" /></Link>
            </div>

            {/* ── FILTER SECTION ── */}
            {filterOptions && (
              <div style={{ marginBottom: 32 }}>

                {/* ── ROW 1: Streams (always visible, prominent tabs) ── */}
                {filterOptions.streams?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Browse by Stream</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {/* All streams chip */}
                      <button
                        onClick={() => setFilters(f => ({ ...f, streamId: null }))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 18px', borderRadius: 12,
                          border: `2px solid ${filters.streamId === null ? '#4F46E5' : 'var(--border,#e2e8f0)'}`,
                          background: filters.streamId === null ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'var(--surface,#fff)',
                          color: filters.streamId === null ? '#fff' : 'var(--ink-2)',
                          fontSize: 13.5, fontWeight: 700, cursor: 'pointer', transition: 'all .18s',
                          boxShadow: filters.streamId === null ? '0 4px 14px rgba(79,70,229,.28)' : 'none',
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" width={15} height={15} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>
                        All Streams
                      </button>
                      {filterOptions.streams.map(s => {
                        const active = filters.streamId === s.id;
                        /* use first letter as avatar since icon is a webpage URL, not an image */
                        const letter = s.name.trim().charAt(0).toUpperCase();
                        return (
                          <button key={s.id} onClick={() => toggleSingle('streamId', s.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 9,
                              padding: '10px 18px', borderRadius: 12,
                              border: `2px solid ${active ? '#4F46E5' : 'var(--border,#e2e8f0)'}`,
                              background: active ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'var(--surface,#fff)',
                              color: active ? '#fff' : 'var(--ink)',
                              fontSize: 13.5, fontWeight: active ? 700 : 600,
                              cursor: 'pointer', transition: 'all .18s',
                              boxShadow: active ? '0 4px 14px rgba(79,70,229,.28)' : '0 1px 4px rgba(0,0,0,0.06)',
                            }}>
                            <span style={{
                              width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center',
                              background: active ? 'rgba(255,255,255,0.22)' : 'linear-gradient(135deg,#EEF2FF,#E0E7FF)',
                              color: active ? '#fff' : '#4F46E5',
                              fontSize: 11, fontWeight: 800,
                            }}>{letter}</span>
                            {s.name}
                            {active && (
                              <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
                                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── ROW 2: More Filters toggle bar ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: filterOpen ? 14 : 0 }}>
                  <button
                    onClick={() => setFilterOpen(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '8px 16px', borderRadius: 10,
                      border: `1.5px solid ${filterOpen ? '#4F46E5' : 'var(--border,#e2e8f0)'}`,
                      background: filterOpen ? '#EEF2FF' : 'var(--surface,#fff)',
                      color: filterOpen ? '#4F46E5' : 'var(--ink-2)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .18s',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                    More Filters
                    {activeFilterCount > 0 && (
                      <span style={{ background: '#4F46E5', color: '#fff', fontSize: 10.5, fontWeight: 800, borderRadius: 99, padding: '1px 7px', lineHeight: 1.7, minWidth: 18, textAlign: 'center' }}>
                        {activeFilterCount}
                      </span>
                    )}
                    <svg viewBox="0 0 24 24" fill="none" width={12} height={12} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                      style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>

                  {/* active filter tags */}
                  {filters.languages.map(l => (
                    <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: '#EEF2FF', color: '#4F46E5', fontSize: 12, fontWeight: 700 }}>
                      {l}
                      <button onClick={() => toggleMulti('languages', l)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#4F46E5', lineHeight: 1, fontSize: 14 }}>×</button>
                    </span>
                  ))}
                  {filters.helpFor.map(h => (
                    <span key={h} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: '#D1FAE5', color: '#065F46', fontSize: 12, fontWeight: 700 }}>
                      {h}
                      <button onClick={() => toggleMulti('helpFor', h)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#065F46', lineHeight: 1, fontSize: 14 }}>×</button>
                    </span>
                  ))}
                  {filters.industries.map(i => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: '#EDE9FE', color: '#5B21B6', fontSize: 12, fontWeight: 700 }}>
                      {i}
                      <button onClick={() => toggleMulti('industries', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#5B21B6', lineHeight: 1, fontSize: 14 }}>×</button>
                    </span>
                  ))}
                  {filters.experience !== null && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700 }}>
                      {filters.experience}+ yrs exp
                      <button onClick={() => setFilters(f => ({ ...f, experience: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#92400E', lineHeight: 1, fontSize: 14 }}>×</button>
                    </span>
                  )}
                  {filters.universityId !== null && (() => {
                    const u = filterOptions.universities?.find(u => u.id === filters.universityId);
                    return u ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: '#FCE7F3', color: '#9D174D', fontSize: 12, fontWeight: 700 }}>
                        {u.name}
                        <button onClick={() => setFilters(f => ({ ...f, universityId: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9D174D', lineHeight: 1, fontSize: 14 }}>×</button>
                      </span>
                    ) : null;
                  })()}
                  {filterOptions.chargeRange && (
                    (filters.minCharge !== null && filters.minCharge !== filterOptions.chargeRange.min) ||
                    (filters.maxCharge !== null && filters.maxCharge !== filterOptions.chargeRange.max)
                  ) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: '#F0FDF4', color: '#166534', fontSize: 12, fontWeight: 700 }}>
                      ₹{filters.minCharge} – ₹{filters.maxCharge}
                      <button onClick={() => setFilters(f => ({ ...f, minCharge: filterOptions.chargeRange.min, maxCharge: filterOptions.chargeRange.max }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#166534', lineHeight: 1, fontSize: 14 }}>×</button>
                    </span>
                  )}

                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => setFilters({ ...EMPTY_FILTERS, minCharge: filterOptions.chargeRange?.min ?? null, maxCharge: filterOptions.chargeRange?.max ?? null })}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, border: 'none', background: 'none', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" width={11} height={11} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      Clear all
                    </button>
                  )}
                </div>

                {/* ── ROW 3: Expanded filter panel ── */}
                {filterOpen && (
                  <div style={{ background: 'var(--surface,#fff)', border: '1.5px solid var(--border,#e2e8f0)', borderRadius: 16, padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginTop: 4 }}>

                    {/* Languages */}
                    {filterOptions.languages?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
                          Language
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {filterOptions.languages.map(lang => {
                            const active = filters.languages.includes(lang);
                            return (
                              <button key={lang} onClick={() => toggleMulti('languages', lang)}
                                style={{ padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${active ? '#4F46E5' : 'var(--border,#e2e8f0)'}`, background: active ? '#4F46E5' : 'transparent', color: active ? '#fff' : 'var(--ink-2)', fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Help For */}
                    {filterOptions.helpFor?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                          I Need Help With
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {filterOptions.helpFor.map(h => {
                            const active = filters.helpFor.includes(h);
                            return (
                              <button key={h} onClick={() => toggleMulti('helpFor', h)}
                                style={{ padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${active ? '#0FA968' : 'var(--border,#e2e8f0)'}`, background: active ? '#0FA968' : 'transparent', color: active ? '#fff' : 'var(--ink-2)', fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>
                                {h}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Industries */}
                    {filterOptions.industries?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                          Industry
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {filterOptions.industries.map(ind => {
                            const active = filters.industries.includes(ind);
                            return (
                              <button key={ind} onClick={() => toggleMulti('industries', ind)}
                                style={{ padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${active ? '#7C3AED' : 'var(--border,#e2e8f0)'}`, background: active ? '#7C3AED' : 'transparent', color: active ? '#fff' : 'var(--ink-2)', fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>
                                {ind}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {filterOptions.experiences?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Min. Experience
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {filterOptions.experiences.map(exp => {
                            const active = filters.experience === exp;
                            return (
                              <button key={exp} onClick={() => toggleSingle('experience', exp)}
                                style={{ padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${active ? '#F59E0B' : 'var(--border,#e2e8f0)'}`, background: active ? '#F59E0B' : 'transparent', color: active ? '#fff' : 'var(--ink-2)', fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>
                                {exp}+ yrs
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Universities */}
                    {filterOptions.universities?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M8 21V9M16 21V9M3 9l9-6 9 6"/></svg>
                          University
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {filterOptions.universities.map(u => {
                            const active = filters.universityId === u.id;
                            return (
                              <button key={u.id} onClick={() => toggleSingle('universityId', u.id)}
                                style={{ padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${active ? '#EC4899' : 'var(--border,#e2e8f0)'}`, background: active ? '#EC4899' : 'transparent', color: active ? '#fff' : 'var(--ink-2)', fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>
                                {u.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Charge Range */}
                    {filterOptions.chargeRange && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 10.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2s-2.5.5-2.5 2a2.5 2.5 0 005 0"/></svg>
                          Session Fee (₹)
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Min</label>
                            <input
                              type="number"
                              min={filterOptions.chargeRange.min}
                              max={filters.maxCharge ?? filterOptions.chargeRange.max}
                              value={filters.minCharge ?? filterOptions.chargeRange.min}
                              onChange={e => setFilters(f => ({ ...f, minCharge: Number(e.target.value) }))}
                              style={{ width: '100%', padding: '7px 10px', border: '1.5px solid var(--border,#e2e8f0)', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#4F46E5', outline: 'none', boxSizing: 'border-box', background: 'var(--surface,#fff)' }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8, color: 'var(--ink-3)', fontSize: 13 }}>–</div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Max</label>
                            <input
                              type="number"
                              min={filters.minCharge ?? filterOptions.chargeRange.min}
                              max={filterOptions.chargeRange.max}
                              value={filters.maxCharge ?? filterOptions.chargeRange.max}
                              onChange={e => setFilters(f => ({ ...f, maxCharge: Number(e.target.value) }))}
                              style={{ width: '100%', padding: '7px 10px', border: '1.5px solid var(--border,#e2e8f0)', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#4F46E5', outline: 'none', boxSizing: 'border-box', background: 'var(--surface,#fff)' }}
                            />
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
                          Range: ₹{filterOptions.chargeRange.min} – ₹{filterOptions.chargeRange.max}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* ── MENTOR GRID ── */}
            {mentorsLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, background: 'var(--surface-2,#f1f5f9)', height: 280 }} />
                ))}
              </div>
            ) : mentors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--ink-3)' }}>
                <svg viewBox="0 0 24 24" fill="none" width={44} height={44} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.35 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>No mentors found</div>
                <div style={{ fontSize: 13 }}>Try changing or clearing your filters.</div>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters({ ...EMPTY_FILTERS, minCharge: filterOptions?.chargeRange?.min ?? null, maxCharge: filterOptions?.chargeRange?.max ?? null })}
                    style={{ marginTop: 14, padding: '9px 22px', borderRadius: 10, border: 'none', background: '#4F46E5', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="mentor-grid">
                {mentors.map((m, i) => <MentorCard key={m.id ?? i} mentor={m} colorIndex={i} />)}
              </div>
            )}

          </div>
        </section>

        {/* LIVE WEBINARS */}
        {webinars.length > 0 && (
          <section className="section-pad" id="webinars">
            <div className="wrap">
              <div className="sh-row reveal">
                <div className="sh-left">
                  <span className="eyebrow"><span className="dot" /> Live Sessions</span>
                  <h2 className="section-title">Upcoming <span className="grad-text">Webinars</span></h2>
                </div>
                <Link to="/webinars" className="view-all">View all <ArrowRight width="24" height="24" /></Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {webinars.slice(0, 6).map((w, i) => (
                  <WebinarCard
                    key={w.id ?? i}
                    webinar={w}
                    idx={i}
                    isRegistered={registeredIds.has(String(w.id))}
                    onBook={(wbn) => {
                      if (!user) { setPendingWebinar(wbn); setReturnPath(window.location.pathname); openAuth('login'); return; }
                      setRegisterFor(wbn);
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* BECOME A MENTOR */}
        <section className="section-pad mentor-cta-section" id="become-mentor">
          <div className="wrap">
            <div className="mentor-cta-grid reveal">
              <div className="mentor-cta-copy">
                <span className="eyebrow"><span className="dot" /> For Experts &amp; Alumni</span>
                <h2 className="section-title" style={{ marginTop: 16 }}>Share your knowledge.<br /><span className="grad-text">Earn on your terms.</span></h2>
                <p className="section-sub" style={{ marginTop: 14 }}>Be among the founding mentors on Mentor4Career — help students navigate college admissions, career choices, and exam prep on a schedule that works for you.</p>
                <ul className="mentor-cta-perks">
                  <li><span className="perk-dot" style={{ background: 'var(--emerald)' }} /><span>Set your own availability &amp; hourly rate</span></li>
                  <li><span className="perk-dot" style={{ background: 'var(--indigo)' }} /><span>1-on-1 video or chat sessions</span></li>
                  <li><span className="perk-dot" style={{ background: 'var(--amber)' }} /><span>Secure &amp; timely payouts every session</span></li>
                  <li><span className="perk-dot" style={{ background: 'var(--violet)' }} /><span>Build your reputation with student reviews</span></li>
                </ul>
                <div className="mentor-cta-btns">
                  <button className="btn btn-primary btn-lg" onClick={() => openAuth('signup')}>
                    Become a Mentor <ArrowRight width="20" height="20" />
                  </button>
                  <button className="btn btn-ghost btn-lg" onClick={() => setShowHowItWorks(true)}>
                    How it Works
                  </button>
                </div>
              </div>
              <div className="mentor-cta-stats">
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text">Free</div>
                  <div className="mcs-label">No cost to join the platform</div>
                </div>
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text">0%</div>
                  <div className="mcs-label">Commission for early mentors</div>
                </div>
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text">1-on-1</div>
                  <div className="mcs-label">Direct sessions with students</div>
                </div>
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text">Your Rate</div>
                  <div className="mcs-label">Set your own session price</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section-pad" id="stories">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow"><span className="dot" /> Student Success Stories</span>
              <h2 className="section-title">Real students. <span className="grad-text">Real results.</span></h2>
            </div>
            <div className="testi-grid">
              {[
                { badge: 'Admitted', text: 'The AI predictor showed me exactly which colleges I had a real shot at. I found the right engineering college and avoided a wrong admission decision.', av: 'RD', col: 'linear-gradient(135deg,#4F46E5,#3B82F6)', n: 'Rohan Deshmukh', r: 'B.Tech CSE · COEP Pune' },
                { badge: 'Hired', text: 'Mock interviews here helped me crack my first software developer job. The feedback after each round was honest and exactly what I needed to improve.', av: 'AT', col: 'linear-gradient(135deg,#0FA968,#06B6D4)', n: 'Aditi Talreja', r: 'SDE-1 · Razorpay' },
                { badge: 'Admitted', text: 'My mentor gave me complete clarity about MBA admissions and career growth. I joined my dream B-school this year with full confidence.', av: 'FM', col: 'linear-gradient(135deg,#7C5CF7,#EC4899)', n: 'Faizan Mirza', r: 'MBA · IIM Indore' }
              ].map((t, i) => (
                <div className="card testi-card reveal" key={i}>
                  <div className="testi-top">
                    <div className="stars" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} viewBox="0 0 24 24" width="15" height="15" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2l2.9 6 6.6.95-4.75 4.63 1.12 6.54L12 17.25l-5.87 3.07 1.12-6.54L2.5 8.95 9.1 8z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="badge-hired"><Check width="24" height="24" /> {t.badge}</span>
                  </div>
                  <p>{t.text}</p>
                  <div className="testi-author"><span className="ta-av" style={{ background: t.col }}>{t.av}</span><div><div className="ta-n">{t.n}</div><div className="ta-r">{t.r}</div></div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="cta-box reveal">
              <h2>Stop guessing. Start building your career.</h2>
              <p>Join 1,000+ students getting personalised guidance from verified mentors — and make your next decision with confidence.</p>
              <div className="cta-btns">
                <button className="btn btn-white btn-lg" onClick={() => openAuth('signup')}>Register Free</button>
                <Link to="/mentors" className="btn btn-clear btn-lg">Find a Mentor</Link>
                <Link to="/predictor" className="btn btn-clear btn-lg">Predict My College</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
      {registerFor && (
        <HomeWebinarRegisterModal
          webinar={registerFor}
          onClose={() => setRegisterFor(null)}
          onRegistered={(id) => {
            setRegisteredIds(prev => new Set([...prev, String(id)]));
            setRegisterFor(null);
            fetchRegisteredIds();
          }}
        />
      )}
    </>
  );
}
