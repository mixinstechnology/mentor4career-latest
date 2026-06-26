import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import PageHero from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar } from '../components/Icons.jsx';
import httpService from '../utils/apiService.tsx';

/* ── helpers ── */
function getLoggedInUserId() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const p = JSON.parse(atob(token.split('.')[1]));
    return p.id ?? p.userId ?? null;
  } catch { return null; }
}

const STATUS_CFG = {
  upcoming:  { label: 'Upcoming',  bg: '#EEF2FF', col: '#4F46E5', dot: '#4F46E5', border: '#818CF8' },
  ongoing:   { label: 'Live Now',  bg: '#DCFCE7', col: '#15803D', dot: '#22C55E', border: '#4ADE80' },
  completed: { label: 'Completed', bg: '#F3F4F6', col: '#6B7280', dot: '#9CA3AF', border: '#D1D5DB' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', col: '#DC2626', dot: '#EF4444', border: '#FCA5A5' },
};
const STATUS_KEYS = ['upcoming','ongoing','completed','cancelled'];

const BANNERS = [
  'linear-gradient(135deg,#4F46E5,#3B82F6)',
  'linear-gradient(135deg,#0FA968,#06B6D4)',
  'linear-gradient(135deg,#7C5CF7,#EC4899)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#10B981,#7C3AED)',
  'linear-gradient(135deg,#EC4899,#F59E0B)',
];

function computeStatus(w) {
  return w.status
}

function fmtDate(date, time) {
  if (!date) return '—';
  try {
    const d = new Date(`${date}T${time || '00:00'}`);
    return isNaN(d) ? date : d.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return date; }
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ══════════════════════════════════
   Register Modal
══════════════════════════════════ */
function RegisterModal({ webinar, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: user?.name || user?.firstName || '',
    contact:  user?.phone || user?.contactNumber || '',
    email:    user?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const overlayRef = useRef(null);

  const isPaid       = !webinar.isFree && Number(webinar.price) > 0;
  const PLAT_PCT     = Number(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE) || 10;
  const GST_PCT_W    = Number(import.meta.env.VITE_GST_PERCENTAGE)          || 18;
  const GATEWAY_FEE_PCT = 2;
  const webinarBase  = Number(webinar.price) || 0;
  const webinarPlat  = isPaid ? Math.round(webinarBase * PLAT_PCT / 100) : 0;
  const webinarSub   = webinarBase + webinarPlat;
  const webinarGst   = isPaid ? Math.round(webinarSub * GST_PCT_W / 100) : 0;
  const preTax       = isPaid ? webinarSub + webinarGst : 0;
  const webinarGatewayCharge = isPaid ? Math.round(preTax * GATEWAY_FEE_PCT / 100) : 0;
  const webinarTotal = isPaid ? preTax + webinarGatewayCharge : 0;
  const money        = (n) => '₹' + n.toLocaleString('en-IN');

  const IS = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: 10,
    padding: '10px 13px', fontFamily: 'var(--font-body)', fontSize: 14,
    color: 'var(--ink)', boxSizing: 'border-box', outline: 'none', background: '#fff',
  };

  /* throws on failure so callers can show refund notice */
  const doRegister = async (transactionId = null) => {
    const loggedInId = getLoggedInUserId();
    const isMentor   = user?.role === 'mentor';
    await httpService.post(`/webinar/${webinar.id}/register`, {
      data: {
        webinarId:            webinar.id,
        authUserId:           isMentor ? loggedInId : null,
        userId:               isMentor ? null : loggedInId,
        username:             form.username,
        contact:              form.contact,
        email:                form.email,
        webinarFee:           webinarBase,
        gstAmount:            webinarGst,
        paymentGatewayCharge: webinarGatewayCharge,
        discount:             0,
        totalAmount:          webinarTotal,
        couponCode:           '',
        ...(transactionId && { paymentStatus: true }),
      },
      token: true,
    });
    setDone(true);
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!isPaid) {
      try {
        await doRegister();
      } catch {
        setSubmitting(false);
      }
      return;
    }

    /* paid webinar — open Razorpay first */
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Payment service unavailable. Please try again.');
      setSubmitting(false);
      return;
    }

    /* create pending transaction — Razorpay will NOT open if this fails */
    let txnDbId = null;
    const loggedInId = getLoggedInUserId();
    const isMentor   = user?.role === 'mentor';
    try {
      const txnRes = await httpService.post('/transaction', {
        data: {
          transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          authUserId:  isMentor ? loggedInId : null,
          userId:      isMentor ? null : loggedInId,
          formType:    'webinar',
          referenceId: String(webinar.id),
          amount:      webinarTotal,
          currency:    'INR',
          status:      'created',
          gateway:     'razorpay',
          remarks:     `Webinar registration: ${webinar.title}`,
        },
        token: true,
      });
      txnDbId = txnRes?.data?.transactionId ?? txnRes?.transactionId ?? null;
    } catch {
      toast.error('Unable to initiate payment. Please try again.');
      setSubmitting(false);
      return;
    }

    const options = {
      key:         import.meta.env.VITE_RAZORPAY_TEST_KEY,
      amount:      webinarTotal * 100,
      currency:    'INR',
      name:        'Mentor4Career',
      description: `Webinar: ${webinar.title}`,
      image:       '/logo.png',
      handler: async (response) => {
        /* update transaction to success */
        if (txnDbId) {
          try {
            await httpService.put(`/transaction/status/${txnDbId}`, {
              data: { status: 'success', razorPayTransactionId: response.razorpay_payment_id },
              token: true,
            });
          } catch { /* non-critical */ }
        }
        /* register — if this fails after payment, show refund notice */
        try {
          await doRegister(response.razorpay_payment_id);
        } catch {
          toast.error('Something went wrong. If your amount was deducted, it will be refunded within 24 hours.');
          setSubmitting(false);
        }
      },
      prefill: { name: form.username, email: form.email, contact: form.contact },
      theme:   { color: '#4F46E5' },
      modal:   { ondismiss: () => setSubmitting(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async (res) => {
      if (txnDbId) {
        try {
          await httpService.put(`/transaction/${txnDbId}`, {
            data: { status: 'failed' },
            token: true,
          });
        } catch { /* non-critical */ }
      }
      toast.error('Payment failed: ' + (res.error?.description || 'Please try again.'));
      setSubmitting(false);
    });
    rzp.open();
  };

  const sCfg = STATUS_CFG[computeStatus(webinar)] || STATUS_CFG.upcoming;

  return (
    <div ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>

        {/* header */}
        <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '24px 24px 20px', color: '#fff', flexShrink: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Register</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: sCfg.bg, color: sCfg.col, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sCfg.dot }} />{sCfg.label}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.35, marginBottom: 8 }}>{webinar.title}</div>
          <div style={{ fontSize: 12.5, opacity: 0.85, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              {webinar.presenter}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {fmtDate(webinar.date, webinar.time)}
            </span>
            {webinar.duration && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                {webinar.duration} min
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {webinar.isFree
                ? <><svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg> Free</>
                : <><svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> ₹{webinar.price}</>
              }
            </span>
          </div>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* body */}
        <div style={{ padding: '22px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 24 24" fill="none" width="32" height="32"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>You're registered!</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 22 }}>
                Seat confirmed for <b>{webinar.title}</b>.<br />Check your email for details.
              </div>
              <button onClick={onClose}
                style={{ padding: '11px 32px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>Fill in your details to secure your seat.</p>

              {[
                { key: 'username', label: 'Full Name',     type: 'text',  placeholder: 'Your full name' },
                { key: 'email',    label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                { key: 'contact',  label: 'Phone Number',  type: 'tel',   placeholder: '10-digit mobile' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {label} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input required type={type} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} style={IS} />
                </div>
              ))}

              {webinar.maxRegistration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '10px 14px' }}>
                  <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style={{ color: '#4F46E5', flexShrink: 0 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg>
                  <span style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600 }}>Limited to {webinar.maxRegistration} seats</span>
                </div>
              )}

              {/* fee breakdown for paid webinars */}
              {isPaid && (
                <div style={{ background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-2)' }}>
                    <span>Webinar fee</span><span>{money(webinarBase)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-2)' }}>
                    <span>Platform + Gateway fee</span><span>{money(webinarPlat + webinarGatewayCharge)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-2)' }}>
                    <span>GST ({GST_PCT_W}%)</span><span>{money(webinarGst)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: 'var(--ink)', borderTop: '1px solid #C7D2FE', paddingTop: 6, marginTop: 2 }}>
                    <span>Total payable</span><span style={{ color: '#4F46E5' }}>{money(webinarTotal)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: '12px 0', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 2, padding: '12px 0', background: submitting ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: !submitting ? '0 4px 14px rgba(79,70,229,.35)' : 'none', transition: 'all .2s' }}>
                  {submitting
                    ? (isPaid ? 'Processing Payment…' : 'Registering…')
                    : (isPaid ? `Pay ${money(webinarTotal)} & Register` : 'Confirm Registration')}
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
   Webinar Card
══════════════════════════════════ */
function WebinarCard({ w, alreadyRegistered, idx, onRegister }) {
  const autoStatus = w.status; // computeStatus(w);
  const sCfg       = STATUS_CFG[autoStatus] || STATUS_CFG.upcoming;
  const banner     = BANNERS[idx % BANNERS.length];
  const isLive     = autoStatus === 'ongoing';
  const isDone     = autoStatus === 'completed' || autoStatus === 'cancelled';

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,.06)', transition: 'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'; }}>

      {/* banner — image if available, gradient fallback */}
      <div style={{ background: banner, position: 'relative', minHeight: 106, overflow: 'hidden' }}>
        {/* image layer */}
        {w.image?.url && (
          <img src={w.image.url} alt={w.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 0 }} />
        )}
        {/* dark gradient overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: w.image?.url
          ? 'linear-gradient(180deg,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.62) 100%)'
          : 'none', zIndex: 1 }} />

        {/* content above image */}
        <div style={{ position: 'relative', zIndex: 2, padding: '18px 18px 14px' }}>
          {isLive && (
            <span style={{ position: 'absolute', top: 0, left: 0, width: 9, height: 9, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 3px rgba(255,255,255,.3)', animation: 'wbPulse 1.2s ease-in-out infinite' }} />
          )}
          {/* top badges */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 14 }}>
            {isLive
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#DCFCE7', color: '#15803D', fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 99 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', animation: 'wbPulse 1.2s ease-in-out infinite' }} /> LIVE
                </span>
              : <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
                  {sCfg.label}
                </span>
            }
            <span style={{ background: w.isFree ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.22)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 99 }}>
              {w.isFree ? 'FREE' : `₹${w.price}`}
            </span>
          </div>

          {/* presenter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.45)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>
              {initials(w.presenter)}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{w.presenter}</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>Presenter</div>
            </div>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.4 }}>{w.title}</h3>

        {w.description && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {w.description}
          </p>
        )}

        {/* meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F1F5F9', color: 'var(--ink-2)', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 99 }}>
            <Calendar width="11" height="11" />{fmtDate(w.date, w.time)}
          </span>
          {w.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F1F5F9', color: 'var(--ink-2)', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 99 }}>
              <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              {w.duration} min
            </span>
          )}
          {w.maxRegistration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F1F5F9', color: 'var(--ink-2)', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 99 }}>
              <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              {w.maxRegistration} seats
            </span>
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          {isLive ? (
            <button onClick={() => onRegister(w)}
              style={{ width: '100%', padding: '11px 0', background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', border: 'none', borderRadius: 11, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', animation: 'wbPulse 1.2s ease-in-out infinite' }} />
              Join Live Now
            </button>
          ) : isDone ? (
            <button disabled
              style={{ width: '100%', padding: '11px 0', background: '#F3F4F6', color: '#9CA3AF', border: 'none', borderRadius: 11, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'not-allowed' }}>
              {autoStatus === 'cancelled' ? 'Cancelled' : 'Session Ended'}
            </button>
          ) : (
            <button onClick={() => onRegister(w)}
              style={alreadyRegistered.includes(w.id) ?{ width: '100%', padding: '11px 0', background: '#F3F4F6', color: '#9CA3AF', border: 'none', borderRadius: 11, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'not-allowed' }:{ width: '100%', padding: '11px 0', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 11, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,.3)' }}>
             { alreadyRegistered.includes(w.id) ? "Already Registered" : "Book Now" }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   Main Page
══════════════════════════════════ */
export default function Webinars() {
  const { openAuth, user, setPendingWebinar, pendingWebinar, setReturnPath } = useAuth();

  const [webinars,     setWebinars]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [hasMore,      setHasMore]      = useState(false);
  const [registerFor,  setRegisterFor]  = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState([]);

  const bookedwebinar = async (pendingWbn = null) => {
    const id = getLoggedInUserId();
    if (!id) return;
    try {
      const response = await httpService.get(`/webinar/my-registrations/${id}`, { token: true });
      const registered = response?.registrations?.map(r => r.webinarId) || [];
      setAlreadyRegistered(registered);
      if (pendingWbn) {
        if (registered.map(String).includes(String(pendingWbn.id))) {
          toast.info('You are already registered for this webinar.');
        } else {
          setRegisterFor(pendingWbn);
        }
        setPendingWebinar(null);
      }
    } catch {}
  };

  useEffect(() => { bookedwebinar(); }, []); // eslint-disable-line
  
  async function fetchWebinars(pg, status) {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pg, limit: 12 };
      if (status !== 'all') params.status = status;

      const res = await httpService.get('/webinar', { params, token: true });

      /* handle nested: { success, webinars: { total, pages, webinars: [] } } */
      let list  = [];
      let pages = 1;

      if (res && res.webinars && Array.isArray(res.webinars.webinars)) {
        list  = res.webinars.webinars;
        pages = res.webinars.pages ?? 1;
      } else if (res && Array.isArray(res.webinars)) {
        list  = res.webinars;
      } else if (Array.isArray(res)) {
        list  = res;
      }

      setWebinars(list);
      setPage(pg);
      setTotalPages(pages);
      setHasMore(pg < pages);
    } catch (err) {
      setError('Failed to load webinars. Please try again.');
      setWebinars([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWebinars(1, statusFilter);
  }, [statusFilter]); // eslint-disable-line

  useEffect(() => {
    if (user && pendingWebinar) {
      bookedwebinar(pendingWebinar);
    }
  }, [user, pendingWebinar]); // eslint-disable-line

  const handleRegisterClick = (w) => {
    if (!user) {
      setPendingWebinar(w);
      setReturnPath('/webinars');
      openAuth('login');
      return;
    }
    setRegisterFor(w);
  };

  return (
    <main id="top">
      <PageHero
        crumb="Webinars"
        eyebrow="Live & On-Demand"
        title={<>Learn live from <span className="grad-text">experts, toppers &amp; recruiters</span></>}
        sub="Free and premium sessions on admissions, placements, interviews and career growth — with live Q&A."
        // stats={[{ v: '120+', l: 'Sessions / mo' }, { v: '4.9/5', l: 'Avg. Rating' }, { v: '60k+', l: 'Attendees' }]}
      />

      <section className="section-pad" style={{ paddingTop: 24 }}>
        <div className="wrap">

          {/* ── filter pills ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
            <button onClick={() => setStatusFilter('all')}
              style={{ padding: '9px 22px', borderRadius: 99, border: `1.5px solid ${statusFilter === 'all' ? '#4F46E5' : 'var(--border)'}`, background: statusFilter === 'all' ? '#4F46E5' : '#fff', color: statusFilter === 'all' ? '#fff' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .18s', boxShadow: statusFilter === 'all' ? '0 4px 14px rgba(79,70,229,.3)' : 'none' }}>
              All
            </button>
            {STATUS_KEYS.map(k => {
              const cfg    = STATUS_CFG[k];
              const active = statusFilter === k;
              return (
                <button key={k} onClick={() => setStatusFilter(k)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 99, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.col : '#fff', color: active ? '#fff' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .18s', boxShadow: active ? `0 4px 14px ${cfg.dot}55` : 'none' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#fff' : cfg.dot, flexShrink: 0 }} />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* ── states ── */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
                  <div style={{ height: 106, background: 'linear-gradient(135deg,#E2E8F0,#F1F5F9)' }} />
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[85, 65, 45].map((w, j) => (
                      <div key={j} style={{ height: 12, borderRadius: 6, background: '#F1F5F9', width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <svg viewBox="0 0 24 24" fill="none" width="52" height="52" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink-2)', marginBottom: 8 }}>{error}</div>
              <button onClick={() => fetchWebinars(1, statusFilter)}
                style={{ marginTop: 8, padding: '10px 24px', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          ) : webinars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <svg viewBox="0 0 24 24" fill="none" width="60" height="60" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink-2)', marginBottom: 8 }}>No webinars found</div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Try a different filter or check back soon.</div>
            </div>
          ) : (
            <>
              {/* ── grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
                {webinars.map((w, i) => (
                  <WebinarCard key={w.id} w={w} alreadyRegistered={alreadyRegistered} idx={i} onRegister={handleRegisterClick} />
                ))}
              </div>

              {/* ── pagination ── */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 40 }}>
                  {page > 1 && (
                    <button onClick={() => fetchWebinars(page - 1, statusFilter)} disabled={loading}
                      style={{ padding: '10px 24px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                      ← Previous
                    </button>
                  )}
                  <span style={{ padding: '10px 20px', background: '#EEF2FF', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#4F46E5' }}>
                    {page} / {totalPages}
                  </span>
                  {hasMore && (
                    <button onClick={() => fetchWebinars(page + 1, statusFilter)} disabled={loading}
                      style={{ padding: '10px 24px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                      {loading ? 'Loading…' : 'Next →'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* register modal */}
      {registerFor && (
        <RegisterModal webinar={registerFor} onClose={() => setRegisterFor(null)} />
      )}

      <style>{`
        @keyframes wbPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(1.4); }
        }
      `}</style>
    </main>
  );
}
