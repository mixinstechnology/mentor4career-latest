import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Check, Close, Person, Calendar, Clock, Lock } from './Icons.jsx';
import httpService from '../utils/apiService.tsx';

const PLATFORM_FEE_PCT = Number(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE) || 10;
const GST_PCT          = Number(import.meta.env.VITE_GST_PERCENTAGE)          || 18;
const GATEWAY_FEE_PCT  = 2; // Razorpay standard charge (% of pre-tax total)
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const money = (n) => '₹' + n.toLocaleString('en-IN');

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtDateLabel(str) {
  const d = parseDate(str);
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
}

/* returns true if the slot time on the given date has already passed */
function isSlotPast(dateStr, label) {
  try {
    const now = new Date();
    const [y, mo, d] = dateStr.split('-').map(Number);
    const slotDay = new Date(y, mo - 1, d);
    const today   = new Date(); today.setHours(0, 0, 0, 0);
    if (slotDay < today) return true;   // whole date is in the past
    if (slotDay > today) return false;  // future date, never past
    // today — parse the time label (supports "10:30 AM" and "14:30")
    const t    = label.trim();
    const isPM = /pm/i.test(t);
    const isAM = /am/i.test(t);
    const nums = t.replace(/[^\d:]/g, '').split(':');
    let h = Number(nums[0]) || 0;
    const min = Number(nums[1]) || 0;
    if (isPM && h !== 12) h += 12;
    if (isAM && h === 12) h = 0;
    return new Date(y, mo - 1, d, h, min) <= now;
  } catch { return false; }
}

/* decode JWT payload to get logged-in user's id */
function getUserIdFromToken() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id ?? payload.userId ?? payload.authUserId ?? null;
  } catch {
    return null;
  }
}

/* load Razorpay checkout script once */
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

/* warning icon */
const WarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ flexShrink: 0 }}>
    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function BookingModal() {
  const { mentor, closeBooking } = useBooking();
  const { user, openAuth }       = useAuth();
  const navigate                 = useNavigate();

  const [step,         setStep]       = useState(1);
  const [availDates,   setAvailDates] = useState([]);
  const [loadingSlots, setLoading]    = useState(false);
  const [selDate,      setSelDate]    = useState(null);
  const [selSlot,      setSelSlot]    = useState(null);
  const [paying,       setPaying]     = useState(false);
  const [bookingId,    setBookingId]  = useState('');
  /* slotIds the current user has already booked with this mentor */
  const [mySlotIds,    setMySlotIds]  = useState(new Set());

  const duration = mentor ? (mentor.price === 0 ? 20 : mentor.price >= 1000 ? 45 : 30) : 30;

  /* role guards */
  const isRestrictedRole = !!user && (user.role === 'mentor' || user.role === 'admin');
  const isAllowedRole    = !user || user.role === 'student' || user.role === 'jobSeeker';

  /* fetch availability when mentor opens */
  useEffect(() => {
    if (!mentor) return;
    setStep(1); setSelDate(null); setSelSlot(null); setPaying(false);
    setAvailDates([]); setMySlotIds(new Set());
    if (!mentor.id) return;
    setLoading(true);
    httpService
      .get('/mentorAvailability', { params: { mentorId: mentor.id }, token: true })
      .then(res => setAvailDates(res?.data ?? []))
      .catch(() => setAvailDates([]))
      .finally(() => setLoading(false));
  }, [mentor]);

  /* fetch the current user's existing sessions for this mentor so we can
     detect if they try to book the same slot a second time */
  useEffect(() => {
    setMySlotIds(new Set());
    if (!mentor?.id || !user || !isAllowedRole) return;
    const userId = getUserIdFromToken();
    if (!userId) return;
    httpService
      .get(`/mentorSession/mentor/${mentor.id}`, { token: true })
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMySlotIds(new Set(list.map(s => String(s.slotId)).filter(Boolean)));
      })
      .catch(() => {});
  }, [mentor, user]); // eslint-disable-line

  /* body scroll lock + Esc */
  useEffect(() => {
    if (!mentor) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && closeBooking();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [mentor, closeBooking]);

  if (!mentor) return null;

  const isFree      = mentor.price === 0;
  const platformFee = isFree ? 0 : Math.round(mentor.price * PLATFORM_FEE_PCT / 100);
  const subTotal    = isFree ? 0 : mentor.price + platformFee;
  const gstAmount   = isFree ? 0 : Math.round(subTotal * GST_PCT / 100);
  const preTaxTotal = isFree ? 0 : subTotal + gstAmount;
  const paymentGatewayCharge = isFree ? 0 : Math.round(preTaxTotal * GATEWAY_FEE_PCT / 100);
  const total       = isFree ? 0 : preTaxTotal + paymentGatewayCharge;
  const isMySlot    = (s) => mySlotIds.has(String(s.slotId));

  /* a slot is bookable only if it's not taken by anyone AND not already booked by this user */
  const canContinue = selDate && selSlot && !selSlot.isBooked && !isMySlot(selSlot);
  const chosen      = selDate && selSlot
    ? { dateLabel: fmtDateLabel(selDate.date), time: selSlot.label }
    : null;

  /* ── POST /mentorSession after payment — throws on failure ── */
  const bookSession = async (transactionId) => {
    const userId = getUserIdFromToken();
    await httpService.post('/mentorSession', {
      data: {
        authUserId:    mentor.id,
        userId:        userId,
        date:          selDate.date,
        slotId:        selSlot.slotId,
        time:          selSlot.label,
        description:   'Career guidance session',
        paymentStatus: 'done',
        transactionId: transactionId,
        amount:        total,
        mentorFee: mentor?.price,
        platformFee: platformFee,
        gstAmount: gstAmount,
        paymentGatewayCharge: paymentGatewayCharge,
        discount: 0,
        couponCode: ""
      },
      token: true,
    });
    const id = 'M4C-' + (Date.now() + '').slice(-6);
    setBookingId(id);
    toast.success('Session booked successfully!');
    setStep(3);
  };

  /* ── Pay button handler ── */
  const handlePayAndBook = async () => {
    setPaying(true);
    const userId = getUserIdFromToken();
    try {
      if (isFree) {
        try {
          await bookSession('FREE');
        } catch {
          toast.error('Something went wrong. Please try again.');
        } finally {
          setPaying(false);
        }
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Payment service unavailable. Please try again.');
        setPaying(false);
        return;
      }

      /* create pending transaction — Razorpay will NOT open if this fails */
      let txnDbId = null;
      try {
        const txnRes = await httpService.post('/transaction', {
          data: {
            transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            authUserId: mentor.id,
            userId,
      
            formType:    'mentorbooking',
            referenceId: selSlot.slotId,
            amount:      total,
            currency:    'INR',
            status:      'pending',
            gateway:     'razorpay',
            remarks:     `Mentor booking payment for ${mentor.name}`,
          },
          token: true,
        });
        txnDbId = txnRes?.data?.transactionId ?? txnRes?.transactionId ?? null;
      } catch {
        toast.error('Unable to initiate payment. Please try again.');
        setPaying(false);
        return;
      }

      const options = {
        key:         import.meta.env.VITE_RAZORPAY_TEST_KEY,
        amount:      total * 100,
        currency:    'INR',
        name:        'Mentor4Career',
        description: `Session with ${mentor.name}`,
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
          /* book session — if booking API fails after payment, show refund notice */
          try {
            await bookSession(response.razorpay_payment_id);
          } catch {
            toast.error('Something went wrong. If your amount was deducted, it will be refunded within 24 hours.');
            setPaying(false);
          }
        },
        prefill:  { name: user?.name || '' },
        notes: {
          'Mentor Charge':        String(mentor.price),
          'Platform + Gateway Fee': String(platformFee + paymentGatewayCharge),
          'GST':                  String(gstAmount),
        },
        theme:    { color: '#4F46E5' },
        modal:    { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (res) => {
        /* mark transaction as failed */
        if (txnDbId) {
          try {
            await httpService.put(`/transaction/${txnDbId}`, {
              data: { status: 'failed' },
              token: true,
            });
          } catch { /* non-critical */ }
        }
        toast.error('Payment failed: ' + (res.error?.description || 'Please try again.'));
        setPaying(false);
      });
      rzp.open();
    } catch {
      setPaying(false);
    }
  };

  /* ── step rail ── */
  const Rail = () => (
    <div className="bk-rail">
      <div className={'bs' + (step === 1 ? ' active' : step > 1 ? ' done' : '')}>
        <span className="bsn">{step > 1 ? <Check width="14" height="14" /> : 1}</span>
        <span className="bsl">Date &amp; Time</span>
      </div>
      <div className={'bln' + (step > 1 ? ' on' : '')}><i /></div>
      <div className={'bs' + (step === 2 ? ' active' : step > 2 ? ' done' : '')}>
        <span className="bsn">{step > 2 ? <Check width="14" height="14" /> : 2}</span>
        <span className="bsl">Payment</span>
      </div>
      <div className={'bln' + (step > 2 ? ' on' : '')}><i /></div>
      <div className={'bs' + (step === 3 ? ' active' : '')}>
        <span className="bsn">3</span>
        <span className="bsl">Confirmed</span>
      </div>
    </div>
  );

  return (
    <div className="book-modal open" aria-hidden="false">
      <div className="bk-scrim" onClick={closeBooking} />
      <div className="bk-dialog" role="dialog" aria-modal="true" aria-label="Book a session">
        <button className="bk-x" onClick={closeBooking} aria-label="Close"><Close width="17" height="17" /></button>

        {/* header */}
        <div className="bk-head">
          <div className="bk-av" style={{ background: mentor.color }}>{mentor.init}</div>
          <div className="bk-who">
            <div className="bk-name">
              <span>{mentor.name}</span>
              <span className="bk-vf"><Check width="11" height="11" /></span>
            </div>
            <div className="bk-role">{mentor.role}</div>
          </div>
          <div className="bk-price">
            {isFree
              ? <><b className="free">Free</b><small>intro call</small></>
              : <><b>{money(mentor.price)}</b><small>per session</small></>}
          </div>
        </div>

        <Rail />

        {/* body */}
        <div className="bk-body">

          {/* ── Step 1: Date & Time ── */}
          {step === 1 && (
            <div className="bk-pane active">
              <div className="bk-h">Pick a date</div>
              <div className="bk-sub">All times shown in IST · {duration}-min 1:1 video session</div>

              {loadingSlots ? (
                <div className="bk-sub" style={{ padding: '20px 0' }}>Loading available dates…</div>
              ) : (() => {
                const todayMidnight = new Date();
                todayMidnight.setHours(0, 0, 0, 0);
                const futureDates = availDates.filter(entry => {
                  const d = parseDate(entry.date);
                  if (d < todayMidnight) return false;                       // past date — hide
                  if (d > todayMidnight) return true;                        // future date — always show
                  // today — only show if at least one slot is still open and not yet passed
                  return entry.slots.some(s => !s.isBooked && !isMySlot(s) && !isSlotPast(entry.date, s.label));
                });
                if (futureDates.length === 0) {
                  return (
                    <div className="bk-sub" style={{ padding: '20px 0', color: 'var(--ink-2)' }}>
                      No upcoming availability set by this mentor yet.
                    </div>
                  );
                }
                return (
                  <div className="bk-dates">
                    {futureDates.map((entry) => {
                      const d = parseDate(entry.date);
                      const openCount = entry.slots.filter(s => !s.isBooked && !isMySlot(s) && !isSlotPast(entry.date, s.label)).length;
                      return (
                        <button
                          key={entry.id}
                          className={'bk-date' + (selDate?.id === entry.id ? ' sel' : '')}
                          disabled={openCount === 0}
                          onClick={() => { setSelDate(entry); setSelSlot(null); }}
                        >
                          <div className="bd-dow">{DOW[d.getDay()]}</div>
                          <div className="bd-day">{d.getDate()}</div>
                          <div className="bd-mon">{MON[d.getMonth()]}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="bk-slot-lbl"><Clock width="15" height="15" /> Available time slots</div>
              <div className="bk-slots">
                {!selDate ? (
                  <div className="bk-sub" style={{ gridColumn: '1/-1', margin: 0 }}>
                    Select a date to see open slots.
                  </div>
                ) : selDate.slots.map((s) => {
                  const mine   = isMySlot(s);
                  const past   = isSlotPast(selDate.date, s.label);
                  const booked = s.isBooked || mine || past;
                  return (
                    <button
                      key={s.slotId}
                      className={'bk-slot' + (booked ? ' taken' : '') + (selSlot?.slotId === s.slotId ? ' sel' : '')}
                      disabled={booked}
                      onClick={() => setSelSlot(s)}
                    >
                      {s.label}
                      <small>{mine ? 'Registered' : past ? 'Passed' : s.isBooked ? 'Booked' : 'Open'}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 2: Review & Pay ── */}
          {step === 2 && (
            <div className="bk-pane active">
              <div className="bk-h">{isFree ? 'Confirm your free intro call' : 'Review & pay'}</div>
              <div className="bk-sub">
                {isFree ? 'No payment needed — just confirm your slot.' : 'Review your booking and complete payment via Razorpay.'}
              </div>

              <div className="bk-summary">
                <div className="bk-sr"><Person width="17" height="17" /><span className="bk-sk">Mentor</span><span className="bk-sv">{mentor.name}</span></div>
                <div className="bk-sr"><Calendar width="17" height="17" /><span className="bk-sk">Date</span><span className="bk-sv">{chosen.dateLabel}</span></div>
                <div className="bk-sr"><Clock width="17" height="17" /><span className="bk-sk">Time</span><span className="bk-sv">{chosen.time} · {duration} min</span></div>
              </div>

              {isFree ? (
                <div className="bk-fees"><div className="bk-fr tot"><span>Total</span><span>Free</span></div></div>
              ) : (
                <div className="bk-fees">
                  <div className="bk-fr"><span>Mentor charge</span><span>{money(mentor.price)}</span></div>
                  <div className="bk-fr"><span>Platform + Gateway fee</span><span>{money(platformFee + paymentGatewayCharge)}</span></div>
                  <div className="bk-fr"><span>GST ({GST_PCT}%)</span><span>{money(gstAmount)}</span></div>
                  <div className="bk-fr tot"><span>Total payable</span><span>{money(total)}</span></div>
                </div>
              )}

              {!isFree && (
                <div className="bk-secure" style={{ marginTop: 8 }}>
                  <Lock width="13" height="13" /> Secured by Razorpay · 256-bit encrypted · 100% refund if mentor cancels
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Confirmed ── */}
          {step === 3 && (
            <div className="bk-pane active">
              <div className="bk-success">
                <div className="bk-check"><Check width="38" height="38" /></div>
                <h3>Seat booked!</h3>
                <p className="bk-ssub">
                  Your {duration}-min session with <b>{mentor.name}</b> is confirmed for{' '}
                  <b>{chosen.dateLabel}</b> at <b>{chosen.time}</b>.{' '}
                  {isFree ? 'Free intro call' : money(total) + ' paid'}.
                  A calendar invite &amp; video link are on the way to your email.
                </p>
                <span className="bk-id">
                  <Check width="14" height="14" /> Booking ID: {bookingId}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* footer */}
        <div className="bk-foot">
          {step === 1 && (
            /* wrapper keeps warning + button in a column without breaking bk-foot's flex layout */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              {/* role restriction notice */}
              {isRestrictedRole && (
                <div style={{
                  background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10,
                  padding: '10px 14px', fontSize: 13, color: '#9A3412', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <WarnIcon />
                  {user.role === 'mentor' ? 'Mentors' : 'Admins'} cannot book sessions. Please log in with a student account to book.
                </div>
              )}

              <button
                className="btn btn-primary btn-lg bk-next"
                style={{ width: '100%' }}
                disabled={isRestrictedRole || (!!user && !canContinue)}
                onClick={() => {
                  if (!user) {
                    openAuth('login');
                    return;
                  }
                  if (isRestrictedRole) {
                    toast.error('Only students and job seekers can book mentor sessions.');
                    return;
                  }
                  if (selSlot && isMySlot(selSlot)) {
                    toast.warning('You have already registered for this slot.');
                    return;
                  }
                  setStep(2);
                }}
              >
                {!user ? 'Login to book' : 'Continue to payment'}
              </button>
            </div>
          )}

          {step === 2 && (
            <>
              <button className="bk-back" onClick={() => setStep(1)} disabled={paying}>Back</button>
              <button
                className="btn btn-primary btn-lg bk-next"
                disabled={paying}
                onClick={handlePayAndBook}
              >
                {paying
                  ? (isFree ? 'Confirming…' : 'Processing…')
                  : (isFree ? 'Confirm booking' : `Pay ${money(total)} & book seat`)}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button className="bk-back" onClick={() => { setStep(1); setSelDate(null); setSelSlot(null); }}>
                Book another
              </button>
              <button className="btn btn-primary btn-lg bk-next" onClick={() => { closeBooking(); navigate('/dashboard'); }}>
                View my bookings
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
