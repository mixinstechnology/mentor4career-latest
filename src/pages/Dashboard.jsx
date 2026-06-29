import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import DashboardShell from '../components/DashboardShell.jsx';
import { Calendar, Person, Webinar, Doc } from '../components/Icons.jsx';
import httpService from '../utils/apiService.tsx';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SupportTicketsView from '../components/SupportTicketsView.jsx';
import PlatformReviewView from '../components/PlatformReviewView.jsx';

/* ── inline icons ── */
const StarNavIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);
const TicketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
    <path d="M6 4h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const SLockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={13} height={13} style={{ flexShrink: 0 }}>
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const TransactionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── helpers ── */
const GRAD = [
  'linear-gradient(135deg,#7C5CF7,#EC4899)',
  'linear-gradient(135deg,#0FA968,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#4F46E5,#3B82F6)',
  'linear-gradient(135deg,#EC4899,#F59E0B)',
  'linear-gradient(135deg,#10B981,#7C3AED)',
];
function nameColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return GRAD[h % GRAD.length];
}
function initials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase() || '??';
}
function getLoggedInUserId() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id ?? payload.userId ?? null;
  } catch { return null; }
}
function getContactFromToken() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.contact ?? payload.phone ?? payload.mobile ?? payload.phoneNumber ?? null;
  } catch { return null; }
}
/* normalise any date value to YYYY-MM-DD for <input type="date"> */
function toDateInput(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch { return ''; }
}
function fmtDate(val) {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return val; }
}

/* fire-and-forget mail helper — non-fatal */
async function sendMail(to, subject, html) {
  console.log(to,subject,html)
  try {
    const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
    if (!recipients.length) return;
    await httpService.post('/contactUs/send-mail', {
      data: { to: recipients, subject, html },
      token: true,
    });
  } catch { /* non-fatal */ }
}

/* sort any array newest-first; uses createdAt if present, falls back to id */
function newestFirst(arr) {
  return [...arr].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : (Number(a.id) || 0);
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : (Number(b.id) || 0);
    return tb - ta;
  });
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

/* ── Session status derivation ── */
function deriveStatus(s) {
  if (s.isSessionCancelled === true) return 'cancelled';
  if (s.paymentStatus === 'done' && !s.isSessionDone) return 'upcoming';
  if (s.paymentStatus === 'done' &&  s.isSessionDone) return 'completed';
  if (s.paymentStatus === 'pending')                  return 'pending';
  return 'failed';
}
const SESSION_BADGE = {
  upcoming:  { cls: 'upcoming',  label: 'Upcoming'  },
  completed: { cls: 'completed', label: 'Completed' },
  cancelled: { cls: 'cancelled', label: 'Cancelled' },
  pending:   { cls: 'cancelled', label: 'Pending'   },
  // failed:    { cls: 'cancelled', label: 'Failed'    },
};
function apiPaymentStatus(filter) {
  if (filter === 'upcoming' || filter === 'completed') return 'done';
  if (filter === 'all' || filter === 'cancelled' || filter === 'failed') return null;
  return filter; // 'pending'
}
function matchesFilter(s, filter) {
  if (filter === 'all') return true;
  return deriveStatus(s) === filter;
}
const SESSION_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  // { key: 'pending',   label: 'Pending'   },
  // { key: 'failed',    label: 'Failed'    },
];

/* ── nav ── */
const NAV = [
  { id: 'overview',     label: 'Overview',        icon: <HomeIcon />    },
  { id: 'profile',      label: 'Profile',          icon: <ProfileIcon /> },
  { divider: true },
  { id: 'sessions',     label: 'Sessions',         icon: <Calendar />    },
  { id: 'mentors',      label: 'My Mentors',       icon: <Person />      },
  { id: 'webinars',     label: 'Webinars',         icon: <Webinar />     },
  { id: 'applications', label: 'Applications',     icon: <Doc />         },
  { id: 'wallet',        label: 'Wallet',        icon: <WalletIcon />       },
  { id: 'transactions', label: 'Transactions',   icon: <TransactionIcon /> },
  { divider: true },
  { id: 'support',      label: 'Support Tickets', icon: <TicketIcon />     },
  { id: 'review',       label: 'Platform Review',  icon: <StarNavIcon />     },
];

/* ══════════════════════════════════════════════
   PROFILE FORM PRIMITIVES — at module level to
   prevent focus-loss on re-render
══════════════════════════════════════════════ */
function SLockedField({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 12px', borderRadius: 9,
        background: 'var(--surface-2,#f8fafc)', border: '1.5px solid var(--border,#e2e8f0)',
        color: 'var(--ink-3)', fontSize: 14, pointerEvents: 'none', userSelect: 'none',
      }}>
        <SLockIcon />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</span>
      </div>
    </div>
  );
}

function SField({ label, value, onChange, type = 'text', placeholder, as, rows, hint, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 3}
          style={{
            padding: '9px 12px', borderRadius: 9, fontSize: 14, resize: 'vertical',
            border: '1.5px solid var(--border,#e2e8f0)', background: 'var(--surface,#fff)',
            color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            padding: '9px 12px', borderRadius: 9, fontSize: 14,
            border: '1.5px solid var(--border,#e2e8f0)', background: 'var(--surface,#fff)',
            color: 'var(--ink)', outline: 'none', fontFamily: 'inherit',
          }}
        />
      )}
      {hint && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{hint}</span>}
      {error && <span style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

function SFormSection({ title, cols = 2, children }) {
  const minCell = cols === 1 ? '100%' : cols >= 3 ? '130px' : '170px';
  const tplCols = cols === 1 ? '1fr' : `repeat(auto-fit, minmax(min(${minCell}, 100%), 1fr))`;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--indigo,#4F46E5)',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
        paddingBottom: 8, borderBottom: '1.5px solid var(--border,#e2e8f0)',
      }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: tplCols, gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function SToggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0' }}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 99, flexShrink: 0,
          background: value ? 'var(--indigo,#4F46E5)' : 'var(--border,#e2e8f0)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
      <span style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ── profile completion ──
   sd  = saved studentDetails
   fd  = live form values (overrides sd so % updates as user types)
   jp  = saved jobProfile                                          */
function calcStudentCompletion(p, jp, sd, fd) {
  if (!p) return 0;
  const v = (sdKey, fdKey) => !!(fd?.[fdKey || sdKey] || sd?.[sdKey] || p?.[sdKey]);
  const checks = [
    /* user profile — from API */
    !!(p.firstName || fd?.firstName),
    !!(p.lastName  || fd?.lastName),
    !!(p.email     || fd?.email),
    !!(p.contact   || getContactFromToken()),
    /* student details — live form wins */
    v('dob'),
    v('education'),
    v('address'),
    v('city'),
    v('district'),
    v('state'),
    !!(fd?.profilePhoto || sd?.profilePhoto || p.profilePhoto || p.profileImage),
    /* job profile */
    !!(Array.isArray(jp?.techStack) ? jp.techStack.length > 0 : jp?.techStack),
    !!jp?.education,
    !!(Array.isArray(jp?.preferredLocation) ? jp.preferredLocation.length > 0 : jp?.preferredLocation),
    !!jp?.resume,
    jp?.experience !== undefined && jp?.experience !== null && jp?.experience !== '',
    !!jp?.headLine,
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

/* ══════════════════════════════════════════════
   STUDENT PROFILE SECTION
══════════════════════════════════════════════ */
function StudentProfileSection({ userId, profile, loading, onSaved }) {
  /* ── user profile form ── */
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    dob: '', education: '', address: '',
    city: '', district: '', state: '',
  });
  const [avatarUrl,    setAvatarUrl]    = useState(null);
  const [avatarObject, setAvatarObject] = useState(null);
  const [avatarHover,  setAvatarHover]  = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [isDirty,     setIsDirty]     = useState(false);
  const fileRef = useRef(null);

  /* ── student details (persisted via /studentDetails) ── */
  const [studentDetails, setStudentDetails] = useState(null);

  /* ── job profile form ── */
  const [jobProfile, setJobProfile] = useState(null);
  const [jobForm, setJobForm] = useState({
    headLine: '', education: '', experience: '',
    techStack: '', preferredLocation: '', resume: '',
  });
  const [jobSaving, setJobSaving] = useState(false);
  const [jobDirty,  setJobDirty]  = useState(false);
  const [fe,        setFe]        = useState({});

  const pct      = calcStudentCompletion(profile, jobProfile, studentDetails, form);
  const pctColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#4F46E5';

  /* populate user form when profile arrives */
  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName  || '',
      lastName:  profile.lastName   || '',
      email:     profile.email      || '',
      dob:       toDateInput(profile.dob),
      education: profile.education  || '',
      address:   profile.address    || '',
      city:      profile.city       || '',
      district:  profile.district   || '',
      state:     profile.state      || '',
    });
    const photo = profile.profilePhoto || profile.profileImage || null;
    if (photo) {
      // only update avatar when the refreshed profile actually has a photo —
      // don't reset to null (listing endpoint may omit profilePhoto)
      if (typeof photo === 'object' && photo.url) {
        setAvatarUrl(photo.url);
        setAvatarObject(photo);
      } else {
        setAvatarUrl(photo);
        setAvatarObject(null);
      }
    }
    setIsDirty(false);
  }, [profile]);

  /* fetch existing student details on mount */
  useEffect(() => {
    if (!userId) return;
    httpService.get('/studentDetails', { params: { authId: userId }, token: true })
      .then(res => {
        let raw = res;
        if (raw && !Array.isArray(raw) && raw.data !== undefined) raw = raw.data;
        if (Array.isArray(raw)) {
          raw = raw.find(d => String(d.authId) === String(userId) || String(d.userId) === String(userId)) ?? raw[0] ?? null;
        }
        const sd = (raw && typeof raw === 'object') ? raw : null;
        if (!sd) return;
        setStudentDetails(sd);
        setForm(f => ({
          ...f,
          firstName: sd.firstName  || f.firstName,
          lastName:  sd.lastName   || f.lastName,
          email:     sd.email      || f.email,
          dob:       toDateInput(sd.dob || sd.dateOfBirth) || f.dob,
          education: sd.education  || f.education,
          address:   sd.address    || f.address,
          city:      sd.city       || f.city,
          district:  sd.district   || f.district,
          state:     sd.state      || f.state,
        }));
        if (sd.profilePhoto) {
          if (typeof sd.profilePhoto === 'object' && sd.profilePhoto.url) {
            setAvatarUrl(sd.profilePhoto.url);
            setAvatarObject(sd.profilePhoto);
          } else {
            setAvatarUrl(sd.profilePhoto);
          }
        }
        setIsDirty(false);
      })
      .catch(() => {});
  }, [userId]); // eslint-disable-line

  /* fetch job profile once on mount — filter by authId */
  useEffect(() => {
    if (!userId) return;
    httpService.get('/jobProfile', { params: { authId: userId }, token: true })
      .then(res => {
        /* API may return: array, { data: [...] }, { data: {...} }, or plain object */
        let raw = res;
        if (raw && typeof raw === 'object' && !Array.isArray(raw) && raw.data !== undefined) {
          raw = raw.data;
        }
        /* if still an array, pick the entry matching this user's authId */
        if (Array.isArray(raw)) {
          raw = raw.find(j => String(j.authId) === String(userId) || String(j.userId) === String(userId)) ?? raw[0] ?? null;
        }
        const jp = (raw && typeof raw === 'object') ? raw : null;
        if (!jp) return;

        setJobProfile(jp);
        setJobForm({
          headLine:          jp.headLine          || '',
          education:         jp.education         || '',
          experience:        jp.experience !== undefined && jp.experience !== null ? String(jp.experience) : '',
          techStack:         Array.isArray(jp.techStack)         ? jp.techStack.join(', ')         : (jp.techStack         || ''),
          preferredLocation: Array.isArray(jp.preferredLocation) ? jp.preferredLocation.join(', ') : (jp.preferredLocation || ''),
          resume:            jp.resume            || '',
        });
        setJobDirty(false);
      })
      .catch(() => {});
  }, [userId]); // eslint-disable-line

  const set    = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setIsDirty(true); setFe(f => ({ ...f, [k]: '' })); };
  const setJob = (k) => (v) => { setJobForm(f => ({ ...f, [k]: v })); setJobDirty(true); setFe(f => ({ ...f, [k]: '' })); };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await httpService.postFormData('/upload/image', fd, { token: true });
      const obj = res?.uploaded?.[0] ?? null;
      if (obj?.url) { setAvatarUrl(obj.url); setAvatarObject(obj); setIsDirty(true); }
    } catch { /* apiService shows toast */ }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (Object.keys(errs).length) { setFe(errs); return; }
    setFe({});
    setSaving(true);
    try {
      const payload = {
        firstName:    form.firstName  || null,
        lastName:     form.lastName   || null,
        email:        form.email      || null,
        dob:          toDateInput(form.dob) || null,
        education:    form.education  || null,
        address:      form.address    || null,
        city:         form.city       || null,
        district:     form.district   || null,
        state:        form.state      || null,
        profilePhoto: avatarObject
          ? avatarObject
          : avatarUrl
            ? { url: avatarUrl, key: '' }
            : null,
      };

      await httpService.post('/studentDetails', { data: payload, token: true });
      setStudentDetails(payload);
      toast.success('Profile updated successfully!');
      setIsDirty(false);
      onSaved?.();
    } catch { /* apiService shows toast */ }
    finally { setSaving(false); }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    const errs = {};
    if (jobForm.experience !== '' && (isNaN(Number(jobForm.experience)) || Number(jobForm.experience) < 0))
      errs.experience = 'Enter a valid number (0 or more).';
    if (jobForm.resume && !/^https?:\/\/.+/.test(jobForm.resume.trim()))
      errs.resume = 'Enter a valid URL starting with http:// or https://';
    if (Object.keys(errs).length) { setFe(errs); return; }
    setFe({});
    setJobSaving(true);
    try {
      const payload = {
        headLine:          jobForm.headLine || null,
        education:         jobForm.education || null,
        experience:        jobForm.experience !== '' ? Number(jobForm.experience) : null,
        techStack:         jobForm.techStack.split(',').map(s => s.trim()).filter(Boolean),
        preferredLocation: jobForm.preferredLocation.split(',').map(s => s.trim()).filter(Boolean),
        resume:            jobForm.resume || null,
      };
      await httpService.post('/jobProfile', { data: payload, token: true });
      setJobProfile(payload);
      setJobDirty(false);
      toast.success('Job profile saved!');
    } catch { /* apiService shows toast */ }
    finally { setJobSaving(false); }
  };

  if (loading) {
    return (
      <div>
        <div className="db-section-head">
          <h2>My Profile</h2>
          <p>Manage your personal information and preferences.</p>
        </div>
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
          Loading profile…
        </div>
      </div>
    );
  }

  const initStr = ((profile?.firstName?.[0] || '') + (profile?.lastName?.[0] || '')).toUpperCase() || 'S';

  return (
    <div>
      <div className="db-section-head">
        <h2>My Profile</h2>
        <p>Manage your personal information and preferences.</p>
      </div>

      {/* ── Avatar + Completion bar ── */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '3px solid var(--indigo,#4F46E5)',
              overflow: 'hidden', cursor: uploading ? 'wait' : 'pointer',
              position: 'relative', flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: nameColor(profile?.firstName || 'S'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 28, color: '#fff', fontFamily: 'var(--font-display)',
              }}>
                {initStr}
              </div>
            )}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'rgba(0,0,0,0.5)',
              opacity: avatarHover || uploading ? 1 : 0,
              transition: 'opacity 0.15s',
            }}>
              <CameraIcon />
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>{uploading ? 'Uploading…' : 'Change'}</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </div>

        {/* completion bar */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Profile completion</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: pctColor }}>{pct}%</span>
          </div>
          <div style={{ background: 'var(--border,#e2e8f0)', borderRadius: 99, height: 9, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: pctColor, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
            {pct < 100
              ? 'Complete your profile to get the most out of Mentor4Career.'
              : 'Your profile is fully complete!'}
          </div>
        </div>
      </div>

      {/* ════════════════════════════
          USER PROFILE FORM
      ════════════════════════════ */}
      <form onSubmit={handleSubmit}>

        {/* ── Account info ── */}
        <SFormSection title="Account info" cols={2}>
          <SField label="First name" value={form.firstName} onChange={set('firstName')} placeholder="e.g. Mohit" error={fe.firstName} />
          <SField label="Last name"  value={form.lastName}  onChange={set('lastName')}  placeholder="e.g. Patel" error={fe.lastName} />
          <SField label="Email"      value={form.email}     onChange={set('email')}     type="email" placeholder="you@example.com" error={fe.email} />
          <SLockedField label="Contact" value={getContactFromToken() || profile?.contact} />
          <SField label="Date of birth" value={form.dob}      onChange={set('dob')}      type="date" />
          <SField label="Education"     value={form.education} onChange={set('education')} placeholder="e.g. B.Sc. Computer Science" />
        </SFormSection>

        {/* ── Address ── */}
        <SFormSection title="Address" cols={1}>
          <SField label="Address" value={form.address}  onChange={set('address')}  placeholder="e.g. 123 Main St, Downtown" />
        </SFormSection>
        <SFormSection title="" cols={3}>
          <SField label="City"     value={form.city}     onChange={set('city')}     placeholder="e.g. Pune"        />
          <SField label="District" value={form.district} onChange={set('district')} placeholder="e.g. Pune"        />
          <SField label="State"    value={form.state}    onChange={set('state')}    placeholder="e.g. Maharashtra" />
        </SFormSection>

        {/* ── Save user profile ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, marginBottom: 36 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{
              minWidth: 150,
              pointerEvents: isDirty ? 'auto' : 'none',
              opacity: isDirty ? 1 : 0.4,
              cursor: isDirty ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {!isDirty && !saving && (
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              Edit any field above to enable saving.
            </span>
          )}
        </div>
      </form>

      {/* ════════════════════════════
          JOB PROFILE FORM
      ════════════════════════════ */}
      <div style={{ borderTop: '2px solid var(--border,#e2e8f0)', paddingTop: 28, marginTop: 4 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)', marginBottom: 4 }}>
            Job Profile
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            Add your career details to help recruiters and mentors find you.
          </div>
        </div>

        <form onSubmit={handleJobSubmit}>

          <SFormSection title="Professional info" cols={1}>
            <SField
              label="Headline"
              value={jobForm.headLine}
              onChange={setJob('headLine')}
              placeholder="e.g. Full Stack Developer with 2 years of experience"
            />
          </SFormSection>

          <SFormSection title="Education & Experience" cols={2}>
            <SField
              label="Education"
              value={jobForm.education}
              onChange={setJob('education')}
              placeholder="e.g. B.Tech in Computer Science"
            />
            <SField
              label="Years of experience"
              value={jobForm.experience}
              onChange={setJob('experience')}
              type="number"
              placeholder="e.g. 2"
              error={fe.experience}
            />
          </SFormSection>

          <SFormSection title="Skills & Location" cols={1}>
            <SField
              label="Tech stack"
              value={jobForm.techStack}
              onChange={setJob('techStack')}
              placeholder="e.g. React, Node.js, TypeScript"
              hint="Separate technologies with commas."
            />
            <SField
              label="Preferred location"
              value={jobForm.preferredLocation}
              onChange={setJob('preferredLocation')}
              placeholder="e.g. Pune, Remote"
              hint="Separate locations with commas."
            />
          </SFormSection>

          <SFormSection title="Resume" cols={1}>
            <SField
              label="Resume URL"
              value={jobForm.resume}
              onChange={setJob('resume')}
              type="url"
              placeholder="e.g. https://drive.google.com/your-resume"
              hint="Paste a public link to your resume (Google Drive, Notion, etc.)"
              error={fe.resume}
            />
          </SFormSection>

          {/* ── Save job profile ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={jobSaving}
              style={{
                minWidth: 170,
                pointerEvents: jobDirty ? 'auto' : 'none',
                opacity: jobDirty ? 1 : 0.4,
                cursor: jobDirty ? 'pointer' : 'not-allowed',
              }}
            >
              {jobSaving ? 'Saving…' : 'Save job profile'}
            </button>
            {!jobDirty && !jobSaving && (
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                Edit any field above to enable saving.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Inline star display (read-only) ── */
function StarRow({ rating, small }) {
  const sz = small ? 13 : 15;
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} viewBox="0 0 20 20" width={sz} height={sz}
          fill={i <= rating ? '#F59E0B' : 'none'}
          stroke={i <= rating ? '#F59E0B' : '#D1D5DB'}
          strokeWidth="1.2">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════
   RaiseTicketModal — POST /supportTicket
   Used by cancelled sessions & webinars
══════════════════════════════════════════════ */
function RaiseTicketModal({ itemTitle, itemType, details = {}, onClose, onSuccess }) {
  const userId = getLoggedInUserId();
  const [form,     setForm]     = useState({ name: sessionStorage.getItem('m4c_firstName') + ' ' + sessionStorage.getItem('m4c_lastName'), email: sessionStorage.getItem('m4c_email'), phone: sessionStorage.getItem('m4c_contact'), description: '' });
  const [fetching, setFetching] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [copied,   setCopied]   = useState(false);

  const fld = (key, val) => setForm(f => ({ ...f, [key]: val }));

  /* Appends hidden system details to the description before sending */
  const buildDescription = () => {
    const userText  = form.description.trim() || `Payment issue with cancelled ${itemType}: ${itemTitle}`;
    const pad       = (label) => label.padEnd(20, ' ');
    const isWebinar = itemType === 'Webinar';
    const rows = [
      /* ID — labelled differently per type */
      details.id && `${pad(isWebinar ? 'Webinar ID' : 'Session ID')} : ${details.id}`,
      /* Webinar-specific fields */
      isWebinar && details.title     && `${pad('Title')}      : ${details.title}`,
      isWebinar && details.date      && `${pad('Date')}       : ${details.date}`,
      isWebinar && details.presenter && `${pad('Presenter')}  : ${details.presenter}`,
      isWebinar && details.price != null && `${pad('Price')}  : ${details.isFree ? 'Free' : `₹${details.price}`}`,
      /* Common fields */
      (details.userId ?? details.authUserId ?? userId) != null
                                     && `${pad('User ID')}    : ${details.userId ?? details.authUserId ?? userId}`,
      userId                         && `${pad('Auth User ID')}: ${userId}`,
      /* Session-specific fields */
      !isWebinar && details.transactionId         && `${pad('Transaction ID')} : ${details.transactionId}`,
      !isWebinar && details.razorPayTransactionId && `${pad('Razorpay Txn ID')} : ${details.razorPayTransactionId}`,
      !isWebinar && details.amount                && `${pad('Amount')} : ₹${details.amount}`,
      !isWebinar && details.mentorName            && `${pad('Mentor')} : ${details.mentorName}`,
      !isWebinar && details.mentorFeedback        && `${pad('Mentor Feedback')} : ${details.mentorFeedback}`,
    ].filter(Boolean);
    const userSection = `[ USER COMMENT ]\n${'─'}\n${userText}`;
    if (!rows.length) return userSection;
    const sysSection  = `[ SYSTEM DETAILS ]\n${'─'}\n${rows.join('\n')}`;
    return `${userSection}\n\n${sysSection}`;
  };

  const submit = async () => {
    setSaving(true);
    try {
      const res = await httpService.post('/supportTicket', {
        data: {
          name:        form.name || 'Student',
          email:       form.email,
          phone:       form.phone,
          title:       'Payment Issue',
          description: buildDescription(),
          priority:    'high',
          ...(details.id != null && { sessionId: details.id }),
        },
        token: true,
      });
      const tid = res?.data?.ticketCode ?? res?.data?.ticketId ?? res?.data?.id ?? res?.ticketCode ?? res?.ticketId ?? res?.id ?? 'SAVED';
      setTicketId(tid);
    } catch {}
    finally { setSaving(false); }
  };

  const handleDone = () => { onSuccess?.(ticketId); onClose(); };

  const copyId = () => {
    navigator.clipboard.writeText(String(ticketId)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  };

  /* ── Success screen ── */
  if (ticketId) {
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.55)', zIndex:1000, display:'grid', placeItems:'center', padding:16 }}>
        <div style={{ background:'var(--surface,#fff)', borderRadius:20, padding:'32px 28px 26px', width:'100%', maxWidth:420, boxShadow:'0 20px 60px rgba(0,0,0,.22)', textAlign:'center' }}>
          <div style={{ width:68, height:68, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', margin:'0 auto 18px', display:'grid', placeItems:'center', boxShadow:'0 6px 20px rgba(16,185,129,.35)' }}>
            <svg viewBox="0 0 24 24" fill="none" width="32" height="32" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:20, color:'var(--ink)', marginBottom:6 }}>Ticket Raised!</div>
          <div style={{ fontSize:13.5, color:'var(--ink-3)', lineHeight:1.55, marginBottom:22 }}>Our support team will review your issue and get back to you shortly.</div>

          <div style={{ background:'#F0FDF4', border:'1.5px solid #BBF7D0', borderRadius:14, padding:'16px 18px', marginBottom:22, textAlign:'left' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#059669', marginBottom:8, textTransform:'uppercase', letterSpacing:.8 }}>Your Ticket ID</div>
            <div style={{ fontFamily:'monospace', fontSize:24, fontWeight:900, color:'#064E3B', letterSpacing:1.5, wordBreak:'break-all' }}>{ticketId}</div>
            <div style={{ fontSize:12.5, color:'#047857', marginTop:8, lineHeight:1.5 }}>
              Save this ID to track the status of your ticket. You can use it to follow up with our support team.
            </div>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={copyId}
              style={{ flex:1, padding:'11px 0', background: copied ? '#DCFCE7' : '#F0FDF4', color:'#059669', border:'1.5px solid #BBF7D0', borderRadius:11, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, cursor:'pointer', transition:'background .2s' }}>
              {copied ? '✓ Copied!' : 'Copy ID'}
            </button>
            <button onClick={handleDone}
              style={{ flex:2, padding:'11px 0', background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff', border:'none', borderRadius:11, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:'0 4px 14px rgba(16,185,129,.32)' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.55)', zIndex:1000, display:'grid', placeItems:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && !saving && onClose()}>
      <div style={{ background:'var(--surface,#fff)', borderRadius:20, padding:'26px 26px 22px', width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,.22)' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#EF4444,#DC2626)', display:'grid', placeItems:'center', flexShrink:0 }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z"/></svg>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color:'var(--ink)' }}>Raise Support Ticket</div>
            <div style={{ fontSize:12.5, color:'var(--ink-3)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {itemType}: {itemTitle}
            </div>
          </div>
          <button onClick={() => !saving && onClose()} style={{ background:'#F1F5F9', border:'none', borderRadius:8, width:32, height:32, display:'grid', placeItems:'center', cursor: saving ? 'not-allowed' : 'pointer', color:'var(--ink-2)', flexShrink:0 }}>
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Fixed info strip */}
        <div style={{ display:'flex', gap:8, marginBottom:18 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#FEE2E2', color:'#DC2626', fontSize:11.5, fontWeight:700, padding:'4px 10px', borderRadius:8 }}>
            <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            Payment Issue
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#FEF3C7', color:'#B45309', fontSize:11.5, fontWeight:700, padding:'4px 10px', borderRadius:8 }}>
            High Priority
          </span>
        </div>

        {fetching ? (
          <div style={{ textAlign:'center', padding:'24px 0', color:'var(--ink-3)', fontSize:13 }}>Loading…</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>

            {/* Auto-filled row — Name + Phone side by side */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {/* Name */}
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:700, color:'var(--ink-3)', marginBottom:5 }}>
                  Full Name
                  <span style={{ fontSize:10, fontWeight:700, background:'#EEF2FF', color:'#4F46E5', borderRadius:5, padding:'1px 6px', letterSpacing:.3 }}>Auto</span>
                </label>
                <input readOnly value={form.name || '—'} tabIndex={-1}
                  style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:9, fontSize:13.5, color:'var(--ink-2)', background:'#F8FAFC', outline:'none', pointerEvents:'none', cursor:'default' }} />
              </div>
              {/* Phone */}
              <div>
                <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:700, color:'var(--ink-3)', marginBottom:5 }}>
                  Contact
                  <span style={{ fontSize:10, fontWeight:700, background:'#EEF2FF', color:'#4F46E5', borderRadius:5, padding:'1px 6px', letterSpacing:.3 }}>Auto</span>
                </label>
                <input readOnly value={form.phone || '—'} tabIndex={-1} type="tel"
                  style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:9, fontSize:13.5, color:'var(--ink-2)', background:'#F8FAFC', outline:'none', pointerEvents:'none', cursor:'default' }} />
              </div>
            </div>

            {/* Email — auto from sessionStorage */}
            <div>
              <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5, fontWeight:700, color:'var(--ink-3)', marginBottom:5 }}>
                Registered Email
                {/* <span style={{ fontSize:10, fontWeight:700, background:'#EEF2FF', color:'#4F46E5', borderRadius:5, padding:'1px 6px', letterSpacing:.3 }}>Auto</span> */}
              </label>
              <input  value={form.email}  type="email"
              placeholder='abc234@gmail.com'
              onChange={e => fld('email', e.target.value)}
                style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:9, fontSize:13.5, color:'var(--ink-2)', background:'var(--surface)', outline:'none', cursor:'' }} />
            </div>

            {/* Description — only editable field */}
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:700, color:'var(--ink-3)', marginBottom:5 }}>Describe Your Issue</label>
              <textarea value={form.description} onChange={e => fld('description', e.target.value)}
                placeholder="Payment deducted but session/webinar not confirmed…"
                rows={3}
                style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:9, fontSize:13.5, color:'var(--ink)', background:'var(--surface)', outline:'none', resize:'vertical', fontFamily:'inherit', lineHeight:1.5 }} />
            </div>
          </div>
        )}

        {/* Actions */}
        {!fetching && (
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button onClick={() => !saving && onClose()} disabled={saving}
              style={{ flex:1, padding:'11px 0', background:'#F1F5F9', color:'var(--ink-2)', border:'none', borderRadius:11, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, cursor: saving ? 'not-allowed' : 'pointer' }}>
              Cancel
            </button>
            <button onClick={submit} disabled={saving || fetching}
              style={{ flex:2, padding:'11px 0', background: saving ? '#FCA5A5' : 'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', borderRadius:11, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, cursor: saving ? 'wait' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 14px rgba(239,68,68,.3)', transition:'all .2s' }}>
              {saving
                ? <><svg viewBox="0 0 24 24" fill="none" width="15" height="15"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.4)" strokeWidth="2"/><path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>Submitting…</>
                : <><svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z"/></svg>Raise Ticket</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Session card ── */
function SessionCard({ s, onReview, ticketCode = null, onTicketRaised }) {
  const col    = nameColor(s.mentorName);
  const init   = (s.mentorName || '?').split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase();
  const status = deriveStatus(s);
  const badge  = SESSION_BADGE[status];
  const hasReview = !!s.rating;
  const [ticketOpen,   setTicketOpen]   = useState(false);
  const [codeCopied,   setCodeCopied]   = useState(false);

  const copyTicketCode = () => {
    navigator.clipboard?.writeText(String(ticketCode)).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="card db-card-row" key={s.id}>
        <div className="m-av" style={{ background: col, width: 46, height: 46 }}>{init}</div>
        <div className="db-card-body">
          <div className="m-name">{s.mentorName}</div>
          <div className="m-role">{s.description}</div>
          <div className="db-card-sub">₹{s.amount}&nbsp;·&nbsp;{s.time}</div>
        </div>
        <div className="db-card-end">
          <div className="db-card-when">{s.date}</div>
          <span className={`sess-badge ${badge.cls}`}><i />{badge.label}</span>
          {status === 'upcoming' && <a href="#" className="btn btn-soft btn-sm">Join</a>}
          {status === 'completed' && (
            hasReview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <StarRow rating={s.rating} small />
                {s.userFeedback && (
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.userFeedback}
                  </span>
                )}
              </div>
            ) : (
              onReview && (
                <button className="btn btn-primary btn-sm" onClick={() => onReview(s)}>
                  Leave Rating
                </button>
              )
            )
          )}
          {status === 'cancelled' && (
            ticketCode ? (
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#EEF2FF', border:'1px solid #C7D2FE', borderRadius:7, padding:'3px 8px' }}>
                  <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#4F46E5', letterSpacing:.4 }}>{"Track-"+" "+ "#"}{ticketCode}</span>
                  <button onClick={copyTicketCode} title="Copy ticket code"
                    style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', color: codeCopied ? '#10B981' : '#6366F1' }}>
                    {codeCopied
                      ? <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    }
                  </button>
                </div>
                
                
                <button disabled
                  style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 13px', background:'#D1FAE5', color:'#059669', border:'1.5px solid #A7F3D0', borderRadius:9, fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, cursor:'not-allowed', whiteSpace:'nowrap' }}>
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Ticket Raised
                </button>
       
              </div>
            ) : (
              <button
                onClick={() => setTicketOpen(true)}
                style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 13px', background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', borderRadius:9, fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, cursor:'pointer', boxShadow:'0 2px 8px rgba(239,68,68,.28)', whiteSpace:'nowrap' }}>
                <svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z"/></svg>
                Raise Ticket
              </button>
            )
          )}
        </div>
      </div>
      {ticketOpen && (
        <RaiseTicketModal
          itemTitle={s.mentorName || 'Session'}
          itemType="Mentor Session"
          details={s}
          onClose={() => setTicketOpen(false)}
          onSuccess={(code) => { onTicketRaised?.(s.id, code); setTicketOpen(false); }}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════
   SessionList — real API + infinite scroll
══════════════════════════════════════════════ */
function SessionList({ raisedSessIds = new Map(), onTicketRaised }) {
  const [filter,     setFilter]     = useState('all');
  const [sessions,   setSessions]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [reviewSess, setReviewSess] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, behaviorRating: 0, communicationRating: 0, platformRating: 0, userFeedback: '' });
  const [submitting, setSubmitting] = useState(false);

  const sentinelRef = useRef(null);
  const pageRef     = useRef(1);
  const hasMoreRef  = useRef(true);
  const loadingRef  = useRef(false);
  const filterRef   = useRef('all');
  const userId      = getLoggedInUserId();

  const handleTicketRaised = useCallback((sessId, code) => {
    onTicketRaised?.(sessId, code);
  }, [onTicketRaised]);

  const loadPage = async (page, fil, replace) => {
    if (loadingRef.current || !userId) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const ps = apiPaymentStatus(fil);
      if (ps) params.paymentStatus = ps;
      if (fil === 'cancelled') params.isSessionCancelled = true;

      const res        = await httpService.get(`/mentorSession/user/${userId}`, { params, token: true });
      const raw        = res?.data ?? [];
      const items      = newestFirst(raw.filter(s => matchesFilter(s, fil)));
      const totalPages = res?.pagination?.totalPages ?? 1;

      setSessions(prev => replace ? items : [...prev, ...items]);
      hasMoreRef.current = page < totalPages;
      pageRef.current    = page;
    } catch {}
    finally { setLoading(false); loadingRef.current = false; }
  };

  useEffect(() => {
    filterRef.current  = filter;
    pageRef.current    = 1;
    hasMoreRef.current = true;
    setSessions([]);
    loadPage(1, filter, true);
  }, [filter]); // eslint-disable-line

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
        loadPage(pageRef.current + 1, filterRef.current, false);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []); // eslint-disable-line

  const handleReview = (s) => {
    setReviewSess(s);
    setReviewForm({ rating: 0, behaviorRating: 0, communicationRating: 0, platformRating: 0, userFeedback: '' });
  };

  const handleSubmitReview = async () => {
    if (!reviewSess || reviewForm.rating === 0) {
      toast.error('Please give a rating before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await httpService.put(`/mentorSession/${reviewSess.id}/feedback`, {
        data: {
          role:                'user',
          rating:              reviewForm.rating,
          behaviorRating:      reviewForm.behaviorRating,
          communicationRating: reviewForm.communicationRating,
          platformRating:      reviewForm.platformRating,
          feedback:        reviewForm.userFeedback,
        },
        token: true,
      });
      setSessions(prev =>
        prev.map(s =>
          s.id === reviewSess.id
            ? { ...s, rating: reviewForm.rating, userFeedback: reviewForm.userFeedback }
            : s
        )
      );
      toast.success('Review submitted. Thank you!');
      setReviewSess(null);
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <>
      {/* ── Rating modal ── */}
      {reviewSess && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: 16, overflowY: 'auto',
          }}
          onClick={e => { if (e.target === e.currentTarget) setReviewSess(null); }}
        >
          <div style={{
            background: 'var(--surface,#fff)', borderRadius: 20,
            width: '100%', maxWidth: 460,
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            overflow: 'hidden', margin: 'auto',
          }}>
            {/* header */}
            <div style={{ background: 'var(--grad)', padding: '22px 24px 18px', color: '#fff', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
                Rate your session
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>with {reviewSess.mentorName}</div>
              <button onClick={() => setReviewSess(null)}
                style={{ position: 'absolute', top: 16, right: 18, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center' }}>
                ×
              </button>
            </div>

            {/* body */}
            <div style={{ padding: '22px 24px 24px' }}>
              {/* rating rows */}
              {[
                { label: 'Mentor Behaviour',      key: 'behaviorRating'      },
                { label: 'Communication',         key: 'communicationRating' },
                { label: 'Platform Experience',   key: 'platformRating'      },
                { label: 'Overall Rating',       key: 'rating'              },
              ].map(({ label, key }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border,#e2e8f0)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewForm(f => ({ ...f, [key]: i }))}
                        style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', transition: 'transform 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                      >
                        <svg viewBox="0 0 20 20" width={26} height={26}
                          fill={i <= reviewForm[key] ? '#F59E0B' : 'none'}
                          stroke={i <= reviewForm[key] ? '#F59E0B' : '#D1D5DB'}
                          strokeWidth="1.2">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Feedback textarea */}
              <div style={{ marginTop: 18, marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>
                  Feedback 
                </label>
                <textarea
                  value={reviewForm.userFeedback}
                  onChange={e => setReviewForm(f => ({ ...f, userFeedback: e.target.value }))}
                  placeholder="Share your experience with this mentor…"
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 13px',
                    border: '1.5px solid var(--border,#e2e8f0)',
                    borderRadius: 10, fontSize: 14,
                    color: 'var(--ink)', background: 'var(--surface-2,#f8fafc)',
                    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit', lineHeight: 1.5,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--indigo,#4F46E5)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border,#e2e8f0)'; }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setReviewSess(null)}
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={submitting || reviewForm.rating === 0}
                  onClick={handleSubmitReview}
                  style={{ flex: 2 }}
                >
                  {submitting ? 'Submitting…' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sess-tabs">
        {SESSION_FILTERS.map(f => (
          <button
            key={f.key}
            className={'sess-tab' + (filter === f.key ? ' active' : '')}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sessions.length === 0 && !loading ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
            No sessions found.
          </div>
        ) : sessions.map(s => (
          <SessionCard
            key={s.id}
            s={s}
            onReview={handleReview}
            ticketCode={raisedSessIds.get(String(s.id)) ?? null}
            onTicketRaised={handleTicketRaised}
          />
        ))}
      </div>
      {loading && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
      )}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  );
}

/* ══════════════════════════════════════════════
   MentorSection — verified only, infinite scroll
══════════════════════════════════════════════ */
function MentorSection() {
  const { openBooking } = useBooking();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);

  const sentinelRef = useRef(null);
  const pageRef     = useRef(1);
  const hasMoreRef  = useRef(true);
  const loadingRef  = useRef(false);

  const loadPage = async (page, replace) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res   = await httpService.get('/mentorProfile', { params: { page, limit: 10 }, token: true });
      const rows  = newestFirst((res?.rows ?? []).filter(m => m.isVerified));
      const total = res?.count ?? 0;
      setMentors(prev => replace ? rows : [...prev, ...rows]);
      hasMoreRef.current = page * 10 < total;
      pageRef.current    = page;
    } catch {}
    finally { setLoading(false); loadingRef.current = false; }
  };

  useEffect(() => { loadPage(1, true); }, []); // eslint-disable-line

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
        loadPage(pageRef.current + 1, false);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []); // eslint-disable-line

  const handleBook = (m) => {
    const fullName = `${m.firstName} ${m.lastName}`.trim();
    openBooking({ id: m.authUserId, init: initials(m.firstName, m.lastName), color: nameColor(fullName), name: fullName, role: m.jobRole || 'Mentor', price: m.chargePerSession ?? 0, email: m.email || null });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {mentors.length === 0 && !loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
          No verified mentors found.
        </div>
      ) : mentors.map((m) => {
        const fullName = `${m.firstName} ${m.lastName}`.trim();
        const rating   = m.rating ?? null;
        return (
          <div className="card db-card-row mentor-card-row" key={m.id}>
            <div className="m-av" style={{ background: nameColor(fullName), width: 46, height: 46, flexShrink: 0 }}>
              {initials(m.firstName, m.lastName)}
            </div>
            <div className="db-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div className="m-name">{fullName}</div>
                <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--surface-2,#f1f5f9)', color: 'var(--ink-2)', padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>
                  Verified
                </span>
              </div>
              <div className="m-role">
                {m.jobRole ? `${m.jobRole}${m.organizationName ? ' at ' + m.organizationName : ''}` : 'Mentor'}
              </div>
              {m.bio && (
                <div className="db-card-sub" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.bio}
                </div>
              )}
              <div className="db-card-sub" style={{ marginTop: 4 }}>
                {m.chargePerSession ? `₹${m.chargePerSession}/session` : 'Free'}
              </div>
            </div>
            <div className="db-card-end ">
              {/* <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: rating ? '#F59E0B' : 'var(--ink-3)' }}>
                <StarIcon /><span>{rating ? rating.toFixed(1) : '—'}</span>
              </div> */}
              <button className="btn btn-primary btn-sm" onClick={() => handleBook(m)}>
                Book Now
              </button>
            </div>
          </div>
        );
      })}
      {loading && <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   Webinar Register Modal
══════════════════════════════════════════════ */
function WebinarRegisterModal({ webinar, user,onClose, onRegistered }) {


  const [form, setForm] = useState({
    username: user?.firstName || user?.name || '',
    contact:  user?.contactNumber || user?.phone || '',
    email:    user?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const overlayRef = useRef(null);

  const isPaid          = !webinar.isFree && Number(webinar.price) > 0;
  const PLAT_PCT        = Number(import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE) || 10;
  const GST_PCT_W       = Number(import.meta.env.VITE_GST_PERCENTAGE) || 18;
  const GATEWAY_FEE_PCT = 2;
  const webinarBase     = Number(webinar.price) || 0;
  const webinarPlat     = isPaid ? Math.round(webinarBase * PLAT_PCT / 100) : 0;
  const webinarSub      = webinarBase + webinarPlat;
  const webinarGst      = isPaid ? Math.round(webinarSub * GST_PCT_W / 100) : 0;
  const preTax          = isPaid ? webinarSub + webinarGst : 0;
  const webinarGW       = isPaid ? Math.round(preTax * GATEWAY_FEE_PCT / 100) : 0;
  const webinarTotal    = isPaid ? preTax + webinarGW : 0;
  const money           = (n) => '₹' + n.toLocaleString('en-IN');

  const IS = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', outline: 'none', background: '#fff' };

  const doRegister = async (transactionId = null) => {
    const loggedInId = getLoggedInUserId();
    await httpService.post(`/webinar/${webinar.id}/register`, {
      data: {
        webinarId: webinar.id, authUserId: null, userId: loggedInId,
        username: form.username, contact: form.contact, email: form.email,
        webinarFee: webinarBase, gstAmount: webinarGst, paymentGatewayCharge: webinarGW,
        discount: 0, totalAmount: webinarTotal, couponCode: '',
        ...(transactionId && { paymentStatus: true }),
      },
      token: true,
    });
    setDone(true);
    setSubmitting(false);
    onRegistered?.(webinar.id);
    /* ── send webinar registration confirmation email ── */
    sendMail(
      [form.email],
      `Webinar Registration Confirmed – ${webinar.title}`,
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#4F46E5">You're Registered!</h2>
        <p>Hi ${form.username || 'there'},</p>
        <p>Your seat for <b>${webinar.title}</b> has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${webinar.presenter ? `<tr><td style="padding:8px 0;color:#6B7280;width:120px">Presenter</td><td style="padding:8px 0;font-weight:600">${webinar.presenter}</td></tr>` : ''}
          ${webinar.date ? `<tr><td style="padding:8px 0;color:#6B7280">Date &amp; Time</td><td style="padding:8px 0;font-weight:600">${fmtWbDate(webinar.date, webinar.time)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#6B7280">Amount Paid</td><td style="padding:8px 0;font-weight:600">${webinar.isFree ? 'Free' : '₹' + webinarTotal}</td></tr>
        </table>
        <p style="color:#6B7280;font-size:13px">A joining link will be shared before the webinar. Thank you for registering with Mentor4Career!</p>
      </div>`
    );
  };

  useEffect(() => {
  
console.log(form)
   sendMail(
      [form.email],
      `Webinar Registration Confirmed – ${webinar.title}`,
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2 style="color:#4F46E5">You're Registered!</h2>
        <p>Hi ${form.username || 'there'},</p>
        <p>Your seat for <b>${webinar.title}</b> has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${webinar.presenter ? `<tr><td style="padding:8px 0;color:#6B7280;width:120px">Presenter</td><td style="padding:8px 0;font-weight:600">${webinar.presenter}</td></tr>` : ''}
          ${webinar.date ? `<tr><td style="padding:8px 0;color:#6B7280">Date &amp; Time</td><td style="padding:8px 0;font-weight:600">${fmtWbDate(webinar.date, webinar.time)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#6B7280">Amount Paid</td><td style="padding:8px 0;font-weight:600">${webinar.isFree ? 'Free' : '₹' + webinarTotal}</td></tr>
        </table>
        <p style="color:#6B7280;font-size:13px">A joining link will be shared before the webinar. Thank you for registering with Mentor4Career!</p>
      </div>`
    );
  },[])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!isPaid) { try { await doRegister(); } catch { setSubmitting(false); } return; }
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Payment service unavailable.'); setSubmitting(false); return; }
    let txnDbId = null;
    const loggedInId = getLoggedInUserId();
    try {
      const txnRes = await httpService.post('/transaction', {
        data: { transactionId: `TXN-${Date.now()}-${Math.floor(Math.random()*1000)}`, authUserId: null, userId: loggedInId, formType: 'webinar', referenceId: String(webinar.id), amount: webinarTotal, currency: 'INR', status: 'created', gateway: 'razorpay', remarks: `Webinar: ${webinar.title}` },
        token: true,
      });
      txnDbId = txnRes?.data?.transactionId ?? txnRes?.transactionId ?? null;
    } catch { toast.error('Unable to initiate payment.'); setSubmitting(false); return; }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_TEST_KEY, amount: webinarTotal * 100, currency: 'INR',
      name: 'Mentor4Career', description: `Webinar: ${webinar.title}`, image: '/logo.png',
      handler: async (response) => {
        if (txnDbId) {
          try { await httpService.put(`/transaction/status/${txnDbId}`, { data: { status: 'success', razorPayTransactionId: response.razorpay_payment_id }, token: true }); } catch {}
        }
        try { await doRegister(response.razorpay_payment_id); }
        catch { toast.error('Payment done but registration failed. Contact support.'); setSubmitting(false); }
      },
      prefill: { name: form.username, email: form.email, contact: form.contact },
      theme: { color: '#4F46E5' }, modal: { ondismiss: () => setSubmitting(false) },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async (res) => {
      if (txnDbId) { try { await httpService.put(`/transaction/${txnDbId}`, { data: { status: 'failed' }, token: true }); } catch {} }
      toast.error('Payment failed: ' + (res.error?.description || 'Please try again.'));
      setSubmitting(false);
    });
    rzp.open();
  };

  return (
    <div ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 22px 18px', color: '#fff', flexShrink: 0, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, lineHeight: 1.35, marginBottom: 6 }}>{webinar.title}</div>
          <div style={{ fontSize: 12.5, opacity: 0.85, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {webinar.presenter && <span>{webinar.presenter}</span>}
            {webinar.date && <span>{fmtWbDate(webinar.date, webinar.time)}</span>}
            <span>{webinar.isFree ? 'Free' : `₹${webinar.price}`}</span>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 18, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="no-scrollbar" style={{ padding: '20px 22px 22px', overflowY: 'auto', flex: 1 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '14px 0 4px' }}>
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: 'var(--ink)', marginBottom: 6 }}>You're registered!</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 20 }}>Your seat is confirmed for <b>{webinar.title}</b>.</div>
              <button onClick={onClose} style={{ padding: '10px 28px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)' }}>Fill in your details to secure your seat.</p>
              {[
                { key: 'username', label: 'Full Name',    type: 'text',  placeholder: 'Your full name'  },
                { key: 'email',    label: 'Email',        type: 'email', placeholder: 'you@example.com' },
                { key: 'contact',  label: 'Phone Number', type: 'tel',   placeholder: '10-digit mobile' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label} <span style={{ color: '#EF4444' }}>*</span></label>
                  <input required type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={IS} />
                </div>
              ))}
              {isPaid && (
                <div style={{ background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[['Webinar fee', money(webinarBase)], ['Platform + Gateway', money(webinarPlat + webinarGW)], [`GST (${GST_PCT_W}%)`, money(webinarGst)]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-2)' }}><span>{l}</span><span>{v}</span></div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 800, color: '#4F46E5', borderTop: '1px solid #C7D2FE', paddingTop: 5, marginTop: 2 }}><span>Total</span><span>{money(webinarTotal)}</span></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 0', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 11, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink-2)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 2, padding: '11px 0', background: submitting ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 11, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
                  {submitting ? (isPaid ? 'Processing…' : 'Registering…') : (isPaid ? `Pay ${money(webinarTotal)} & Register` : 'Confirm Registration')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Webinars View
══════════════════════════════════════════════ */
const WB_STATUS_CFG = {
  upcoming:  { label: 'Upcoming',  bg: '#EEF2FF', col: '#4F46E5', border: '#4F46E5', dot: '#4F46E5' },
  ongoing:   { label: 'Ongoing',   bg: '#DCFCE7', col: '#15803D', border: '#22C55E', dot: '#22C55E' },
  completed: { label: 'Completed', bg: '#F3F4F6', col: '#6B7280', border: '#D1D5DB', dot: '#9CA3AF' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', col: '#DC2626', border: '#EF4444', dot: '#EF4444' },
};
const WB_STATUS_KEYS = ['upcoming','ongoing','completed','cancelled'];

function fmtWbDate(date, time) {
  if (!date) return '—';
  try {
    const d = new Date(`${date}T${time || '00:00'}`);
    return isNaN(d) ? date : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return date; }
}

function computeWbStatus(w) {
  // if (w.status === 'cancelled') return 'cancelled';
  // if (!w.date) return w.status || 'upcoming';
  // try {
  //   const start = new Date(`${w.date}T${w.time || '00:00'}`);
  //   const end   = new Date(start.getTime() + (Number(w.duration) || 60) * 60 * 1000);
  //   const now   = new Date();
    
  //   return w.status
  // } catch { return w.status || 'upcoming'; }
  return w.status || 'upcoming';
}

function WebinarsView() {
  const userId = getLoggedInUserId();

  /* ── My Bookings state ── */
  const [myRegs,       setMyRegs]       = useState([]);
  const [myLoading,    setMyLoading]    = useState(false);
  const [myPage,       setMyPage]       = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [wbTicket,    setWbTicket]    = useState(null); // { title, details } | null
  const [raisedWbIds, setRaisedWbIds] = useState(new Map()); // Map<wbId, ticketCode>
  const [copiedWbId,  setCopiedWbId]  = useState(null);

  /* Fetch raised tickets — parse Webinar ID + ticketCode from description */
  useEffect(() => {
    if (!userId) return;
    httpService.get('/supportTicket', { params: { page: 1, limit: 10, activeOnly: true, userId }, token: true })
      .then(res => {
        const raw     = res?.data;
        const tickets = Array.isArray(raw)          ? raw
                      : Array.isArray(raw?.data)    ? raw.data
                      : Array.isArray(raw?.tickets) ? raw.tickets
                      : Array.isArray(raw?.rows)    ? raw.rows
                      : Array.isArray(res)          ? res
                      : [];
        const RE = /Webinar ID\s*:\s*(\S+)/;
        const wbMap = new Map(
          tickets
            .map(t => {
              const m = (t.description || '').match(RE);
              return m ? [m[1], t.ticketCode ?? t.id ?? 'TICKET'] : null;
            })
            .filter(Boolean)
        );
        setRaisedWbIds(wbMap);
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  const copyWbTicketCode = (wbId, code) => {
    navigator.clipboard?.writeText(String(code)).then(() => {
      setCopiedWbId(String(wbId));
      setTimeout(() => setCopiedWbId(null), 2000);
    });
  };

  /* fetch my booked webinars */
  const loadMyBookings = async (pg = 1, replace = true) => {
    if (!userId) return;
    setMyLoading(true);
    try {
      const res  = await httpService.get(`/webinar/my-registrations/${userId}`, { params: { page: pg, limit: 10 }, token: true });
      const regs = Array.isArray(res?.registrations) ? res.registrations
                 : Array.isArray(res?.data)           ? res.data
                 : Array.isArray(res)                 ? res : [];
      const pages = res?.pagination?.totalPages ?? res?.totalPages ?? 1;
      setMyRegs(prev => replace ? regs : [...prev, ...regs]);
      setMyTotalPages(pages);
      setMyPage(pg);
    } catch { if (replace) setMyRegs([]); }
    finally { setMyLoading(false); }
  };

  useEffect(() => { loadMyBookings(1, true); }, []); // eslint-disable-line

  /* ── webinar card shared renderer ── */
  const renderWebinarCard = (w, isBooked) => {
    const autoStatus = w.status || 'upcoming';
    const cfg        = WB_STATUS_CFG[autoStatus] || WB_STATUS_CFG.upcoming;
    const isActive   = autoStatus === 'upcoming' || autoStatus === 'ongoing';
    return (
      <div key={w.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `3.5px solid ${cfg.border}` }}>
        {w.image?.url && (
          <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#1e1b4b' }}>
            <img src={w.image.url} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.45) 100%)' }} />
            <span style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.col, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />{cfg.label}
            </span>
            <span style={{ position: 'absolute', top: 10, left: 10, background: w.isFree ? 'rgba(16,185,129,0.9)' : 'rgba(79,70,229,0.9)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
              {w.isFree ? 'FREE' : `₹${w.price}`}
            </span>
          </div>
        )}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{w.title}</div>
              {w.description && <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{w.description}</div>}
            </div>
            {!w.image?.url && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.col, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99, flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />{cfg.label}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { ic: <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>, val: w.presenter },
              { ic: <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>, val: fmtWbDate(w.date, w.time) },
              { ic: <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>, val: w.duration ? `${w.duration} min` : null },
              { ic: <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, val: w.isFree ? 'Free' : (w.price ? `₹${w.price}` : null) },
              { ic: <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, val: w.maxRegistration ? `${w.maxRegistration} seats` : null },
            ].filter(m => m.val).map((m, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFC', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500, padding: '4px 11px', borderRadius: 99 }}>
                {m.ic} {m.val}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {isActive ? (
              isBooked ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#DCFCE7', color: '#15803D', border: '1.5px solid #86EFAC', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Registered
                </span>
              ) : (
                <button onClick={() => setRegisterFor(w)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,.3)' }}>
                  <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Book Now
                </button>
              )
            ) : (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F3F4F6', color: '#9CA3AF', borderRadius: 10, padding: '8px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
                  {autoStatus === 'cancelled' ? 'Cancelled' : 'Session Ended'}
                </span>
                {autoStatus === 'cancelled' && (
                  raisedWbIds.has(String(w.id)) ? (
                    <div style={{ display:'flex', justifyItems:"center", alignItems:'center', gap:5 }}>
                      <button disabled
                        style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 15px', background:'#D1FAE5', color:'#059669', border:'1.5px solid #A7F3D0', borderRadius:10, fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, cursor:'not-allowed', whiteSpace:'nowrap' }}>
                        <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Ticket Raised
                      </button>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#EEF2FF', border:'1px solid #C7D2FE', borderRadius:7, padding:'3px 9px' }}>
                        <span style={{ fontFamily:'monospace', fontSize:11.5, fontWeight:700, color:'#4F46E5', letterSpacing:.4 }}>{"Track-"+" "+ "#"}{raisedWbIds.get(String(w.id))}</span>
                        <button onClick={() => copyWbTicketCode(w.id, raisedWbIds.get(String(w.id)))} title="Copy ticket code"
                          style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', color: copiedWbId === String(w.id) ? '#10B981' : '#6366F1' }}>
                          {copiedWbId === String(w.id)
                            ? <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                          }
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setWbTicket({ title: w.title || 'Webinar', details: w })}
                      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'8px 15px', background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', borderRadius:10, fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 2px 8px rgba(239,68,68,.28)', whiteSpace:'nowrap' }}>
                      <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z"/></svg>
                      Raise Ticket
                    </button>
                  )
                )}
              </div>
            )}
            {w.link && autoStatus !== 'completed' && autoStatus !== 'cancelled' && (
              <a href={autoStatus === 'ongoing' ? w.link : undefined} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: autoStatus === 'ongoing' ? 'linear-gradient(135deg,#10B981,#059669)' : '#fff', color: autoStatus === 'ongoing' ? '#fff' : 'var(--ink-2)', border: autoStatus === 'ongoing' ? 'none' : '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, textDecoration: 'none', boxShadow: autoStatus === 'ongoing' ? '0 2px 8px rgba(16,185,129,.3)' : 'none', ...(autoStatus === 'upcoming' && { pointerEvents: 'none', opacity: 0.5, cursor: 'default' }) }}>
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {autoStatus === 'ongoing' ? 'Join Now' : 'View Link'}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── pagination bar ── */
  const Pagination = ({ current, total, onPrev, onNext, disabled }) => total <= 1 ? null : (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
      {current > 1 && (
        <button onClick={onPrev} disabled={disabled}
          style={{ padding: '9px 20px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
          ← Prev
        </button>
      )}
      <span style={{ padding: '9px 16px', background: '#EEF2FF', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#4F46E5' }}>
        {current} / {total}
      </span>
      {current < total && (
        <button onClick={onNext} disabled={disabled}
          style={{ padding: '9px 20px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
          {disabled ? 'Loading…' : 'Next →'}
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="db-section-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2>My Registered Webinars</h2>
          <p>Webinars you have registered for</p>
        </div>
        <Link to="/webinars"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 2px 8px rgba(79,70,229,.3)', textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          Browse Webinars
        </Link>
      </div>

      {myLoading && myPage === 1 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)' }}>Loading…</div>
      ) : myRegs.length === 0 ? (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <svg viewBox="0 0 24 24" fill="none" width="52" height="52" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 8, fontFamily: 'var(--font-display)' }}>No registrations yet</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>You haven't registered for any webinars yet.</p>
          <Link to="/webinars"
            style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Browse All Webinars
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {myRegs.map((reg, idx) => {
            /* API returns nested as "Webinar" (capital W) */
            const w = reg.Webinar ?? reg.webinar ?? reg;
            if (!w?.title) return null;
            return <React.Fragment key={reg.id ?? w.id ?? idx}>{renderWebinarCard(w, true)}</React.Fragment>;
          })}
          <Pagination
            current={myPage} total={myTotalPages} disabled={myLoading}
            onPrev={() => loadMyBookings(myPage - 1, true)}
            onNext={() => loadMyBookings(myPage + 1, true)}
          />
        </div>
      )}

      {/* Raise Ticket modal for cancelled webinar */}
      {wbTicket && (
        <RaiseTicketModal
          itemTitle={wbTicket.title}
          itemType="Webinar"
          details={wbTicket.details ?? {}}
          onClose={() => setWbTicket(null)}
          onSuccess={(code) => {
            const wid = wbTicket.details?.id;
            if (wid != null) {
              setRaisedWbIds(prev => new Map([...prev, [String(wid), code ?? 'TICKET']]));
            }
            setWbTicket(null);
          }}
        />
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════
   ApplicationsView — real API
══════════════════════════════════════════════ */
function ApplicationsView() {
  const userId = getLoggedInUserId();
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [editApp,      setEditApp]      = useState(null);
  const [editForm,     setEditForm]     = useState({ description: '' });
  const [saving,       setSaving]       = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await httpService.get('/jobsInterested', { token: true });
      let raw = res?.data ?? res ?? [];
      if (!Array.isArray(raw)) raw = [];
      setApplications(newestFirst(raw.filter(a => String(a.userId) === String(userId))));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchApplications();
  }, []); // eslint-disable-line

  const handleEdit = (app) => {
    setEditApp(app);
    setEditForm({ description: app.description || '' });
  };

  const handleUpdate = async () => {
    if (!editApp) return;
    setSaving(true);
    try {
      await httpService.put(`/jobsInterested/${editApp.id}`, {
        data: {
          jobId:       editApp.jobId,
          userId:      editApp.userId,
          applyDate:   editApp.applyDate,
          isEmailSent: editApp.isEmailSent,
          description: editForm.description,
        },
        token: true,
      });
      setApplications(prev =>
        prev.map(a => a.id === editApp.id ? { ...a, description: editForm.description } : a)
      );
      toast.success('Application updated!');
      setEditApp(null);
    } catch {}
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontSize: 14 }}>
        Loading applications…
      </div>
    );
  }

  return (
    <div>
      {/* ── Edit modal ── */}
      {editApp && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setEditApp(null); }}
        >
          <div style={{ background: 'var(--surface,#fff)', borderRadius: 18, padding: '28px 28px 24px', maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)', marginBottom: 4 }}>Edit Application</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>Job ID: {editApp.jobId}</div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 7 }}>
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 14, border: '1.5px solid var(--border,#e2e8f0)', background: 'var(--surface-2,#f8fafc)', resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                onFocus={e => { e.target.style.borderColor = 'var(--indigo,#4F46E5)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border,#e2e8f0)'; }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditApp(null)} disabled={saving} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving} style={{ flex: 2 }}>{saving ? 'Saving…' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {applications.length === 0 ? (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <svg viewBox="0 0 24 24" fill="none" width="52" height="52" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
          </div>
          <h3 style={{ fontSize: 20, marginBottom: 8, fontFamily: 'var(--font-display)' }}>No applications yet</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>Browse jobs and apply to track your applications here.</p>
          <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: 18, display: 'inline-flex' }}>Browse Jobs</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {applications.map(app => (
            <div key={app.id} className="card" style={{ padding: '18px 22px', borderLeft: '3.5px solid var(--indigo,#4F46E5)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 5 }}>
                    Job #{app.jobId}
                  </div>
                  {app.description && (
                    <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 10, lineHeight: 1.5 }}>
                      {app.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Applied: {fmtDate(app.applyDate)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#DCFCE7', color: '#15803D' }}>
                      {app.status || 'Applied'}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-soft btn-sm"
                  onClick={() => handleEdit(app)}
                  style={{ flexShrink: 0 }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   WalletView
══════════════════════════════════════════════ */
function loadRazorpayScriptWallet() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function WalletView() {
  const userId = getLoggedInUserId();

  const [balance,    setBalance]    = useState(null);
  const [balLoading, setBalLoading] = useState(true);
  const [txns,       setTxns]       = useState([]);
  const [txnLoading, setTxnLoading] = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /* filters */
  const [typeFilter, setTypeFilter] = useState('all');   // 'all' | 'credit' | 'debit'
  const [catFilter,  setCatFilter]  = useState('all');

  const [detailsTx,  setDetailsTx]  = useState(null);   // transaction to show in details modal

  const TXN_TYPE = {
    credit: { label: 'Credit', bg: '#DCFCE7', col: '#15803D', sign: '+' },
    debit:  { label: 'Debit',  bg: '#FEE2E2', col: '#DC2626', sign: '-' },
  };
  const CATEGORY_LABEL = {
    manual_add:      'Wallet Top-up',
    session_payment: 'Session Payment',
    refund:          'Refund',
    admin_credit:    'Admin Credit',
    withdrawal:      'Withdrawal',
    booking:         'Booking',
  };
  const ALL_CATEGORIES = ['manual_add', 'session_payment', 'refund', 'admin_credit', 'withdrawal', 'booking'];

  const fetchBalance = async () => {
    if (!userId) return;
    setBalLoading(true);
    try {
      const res = await httpService.get(`/wallet/balance/${userId}`, { token: true });
      setBalance(res?.data?.walletAmount ?? res?.walletAmount ?? 0);
    } catch {} finally { setBalLoading(false); }
  };

  const fetchTxns = async (pg = 1, type = typeFilter, cat = catFilter) => {
    if (!userId) return;
    setTxnLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (type !== 'all') params.type     = type;
      if (cat  !== 'all') params.category = cat;
      const res = await httpService.get(`/wallet/transactions/${userId}`, { params, token: true });
      setTxns(Array.isArray(res?.rows) ? res.rows : []);
      setTotalPages(res?.totalPages ?? 1);
      setTotalCount(res?.count ?? 0);
      setPage(pg);
    } catch { setTxns([]); } finally { setTxnLoading(false); }
  };

  useEffect(() => { fetchBalance(); fetchTxns(1, 'all', 'all'); }, []); // eslint-disable-line

  /* when filter changes, reset to page 1 */
  const applyFilter = (type, cat) => {
    setTypeFilter(type);
    setCatFilter(cat);
    fetchTxns(1, type, cat);
  };

  /* ── page number bar (max 5 buttons) ── */
  const pageNums = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  })();

  const activeFilters = (typeFilter !== 'all' ? 1 : 0) + (catFilter !== 'all' ? 1 : 0);

  return (
    <div>
      <div className="db-section-head">
        <h2>Wallet</h2>
        <p>Manage your balance and transaction history</p>
      </div>

      {/* ── Balance card ── */}
      <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 18, padding: '28px 28px 24px', color: '#fff', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Available Balance</div>
        <div style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>
          {balLoading ? '…' : `₹${Number(balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        </div>
      </div>

      {/* ── Transaction Details modal ── */}
      {detailsTx && (() => {
        const tx  = detailsTx;
        const cfg = TXN_TYPE[tx.type] || TXN_TYPE.credit;
        const amt = Number(tx.amount || 0);
        const cat = CATEGORY_LABEL[tx.category] || tx.category || '—';
        const rows = [
          { l: 'Transaction ID',  v: `#${tx.id}` },
          { l: 'Type',            v: <span style={{ display:'inline-flex',alignItems:'center',gap:5,background:cfg.bg,color:cfg.col,borderRadius:99,padding:'2px 10px',fontWeight:700,fontSize:12 }}>{cfg.label}</span> },
          { l: 'Category',        v: cat },
          { l: 'Amount',          v: <span style={{ color:cfg.col,fontWeight:800 }}>{cfg.sign}₹{amt.toLocaleString('en-IN',{minimumFractionDigits:2})}</span> },
          { l: 'Balance Before',  v: tx.balanceBefore != null ? `₹${Number(tx.balanceBefore).toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—' },
          { l: 'Balance After',   v: tx.balanceAfter  != null ? `₹${Number(tx.balanceAfter).toLocaleString('en-IN',{minimumFractionDigits:2})}` : '—' },
          { l: 'Reference Type',  v: tx.referenceType || '—' },
          { l: 'Reference ID',    v: tx.referenceId   != null ? String(tx.referenceId) : '—' },
          { l: 'Description',     v: tx.description   || '—' },
          { l: 'Date',            v: fmtDate(tx.createdAt) },
        ];
        return (
          <div onClick={e => e.target === e.currentTarget && setDetailsTx(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 660, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
              {/* header — amount inline */}
              <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '14px 20px', color: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>Transaction Details</div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{cat} · {fmtDate(tx.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: tx.type === 'debit' ? '#FCA5A5' : '#86EFAC', letterSpacing: '-0.5px' }}>
                    {cfg.sign}₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => setDetailsTx(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              {/* 2-column detail grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '14px 20px 6px', gap: '0 16px' }}>
                {rows.map(({ l, v }) => (
                  <div key={l} style={{ padding: '9px 0', borderBottom: '1px solid var(--border,#f1f5f9)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600, wordBreak: 'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* footer */}
              <div style={{ padding: '12px 20px 16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setDetailsTx(null)}
                  style={{ padding: '9px 28px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Transaction History header + filters ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)' }}>
          Transaction History
          {totalCount > 0 && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600, color: 'var(--ink-3)' }}>({totalCount} total)</span>}
        </div>
        {activeFilters > 0 && (
          <button onClick={() => applyFilter('all', 'all')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 99, border: 'none', background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {/* Type filter */}
        {['all', 'credit', 'debit'].map(t => {
          const active = typeFilter === t;
          const col = t === 'credit' ? '#15803D' : t === 'debit' ? '#DC2626' : '#4F46E5';
          const bg  = t === 'credit' ? '#DCFCE7' : t === 'debit' ? '#FEE2E2' : '#EEF2FF';
          return (
            <button key={t} onClick={() => applyFilter(t, catFilter)}
              style={{ padding: '7px 16px', borderRadius: 99, border: `1.5px solid ${active ? col : 'var(--border,#e2e8f0)'}`, background: active ? bg : '#fff', color: active ? col : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: 'all .15s' }}>
              {t === 'all' ? 'All' : t === 'credit' ? '↑ Credit' : '↓ Debit'}
            </button>
          );
        })}

        {/* Category filter */}
        <select value={catFilter} onChange={e => applyFilter(typeFilter, e.target.value)}
          style={{ padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${catFilter !== 'all' ? '#4F46E5' : 'var(--border,#e2e8f0)'}`, background: catFilter !== 'all' ? '#EEF2FF' : '#fff', color: catFilter !== 'all' ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', outline: 'none' }}>
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c] || c}</option>)}
        </select>
      </div>

      {/* Transaction list */}
      {txnLoading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>Loading…</div>
      ) : txns.length === 0 ? (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 14px' }}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="15" r="1.5" fill="#94A3B8"/></svg>
          <h3 style={{ fontSize: 17, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            {activeFilters > 0 ? 'No transactions match filters' : 'No transactions yet'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            {activeFilters > 0 ? 'Try changing or clearing your filters.' : 'Add money to your wallet to get started.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {txns.map(tx => {
            const cfg = TXN_TYPE[tx.type] || TXN_TYPE.credit;
            const amt = Number(tx.amount || 0);
            const cat = CATEGORY_LABEL[tx.category] || tx.category || '—';
            return (
              <div key={tx.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* type icon */}
                <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {tx.type === 'credit'
                    ? <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 19V5M5 12l7-7 7 7" stroke={cfg.col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 5v14M5 12l7 7 7-7" stroke={cfg.col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </div>
                {/* info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.description || cat}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ background: cfg.bg, color: cfg.col, borderRadius: 99, padding: '1px 8px', fontWeight: 700, fontSize: 11 }}>{cfg.label}</span>
                    <span>{cat}</span>
                    <span>·</span>
                    <span>{fmtDate(tx.createdAt)}</span>
                  </div>
                </div>
                {/* amount + details btn */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: cfg.col }}>
                    {cfg.sign}₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <button onClick={() => setDetailsTx(tx)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', border: '1.5px solid var(--border,#e2e8f0)', borderRadius: 8, background: '#F8FAFC', color: 'var(--ink-2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Details
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <button onClick={() => fetchTxns(1, typeFilter, catFilter)} disabled={page === 1 || txnLoading}
                style={{ padding: '8px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === 1 ? '#CBD5E1' : 'var(--ink-2)', cursor: page === 1 ? 'default' : 'pointer' }}>
                «
              </button>
              <button onClick={() => fetchTxns(page - 1, typeFilter, catFilter)} disabled={page === 1 || txnLoading}
                style={{ padding: '8px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === 1 ? '#CBD5E1' : 'var(--ink-2)', cursor: page === 1 ? 'default' : 'pointer' }}>
                ‹ Prev
              </button>
              {pageNums.map(n => (
                <button key={n} onClick={() => fetchTxns(n, typeFilter, catFilter)} disabled={txnLoading}
                  style={{ padding: '8px 13px', background: n === page ? '#4F46E5' : '#fff', border: `1.5px solid ${n === page ? '#4F46E5' : 'var(--border)'}`, borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: n === page ? '#fff' : 'var(--ink-2)', cursor: 'pointer', minWidth: 38, textAlign: 'center' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => fetchTxns(page + 1, typeFilter, catFilter)} disabled={page === totalPages || txnLoading}
                style={{ padding: '8px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === totalPages ? '#CBD5E1' : 'var(--ink-2)', cursor: page === totalPages ? 'default' : 'pointer' }}>
                Next ›
              </button>
              <button onClick={() => fetchTxns(totalPages, typeFilter, catFilter)} disabled={page === totalPages || txnLoading}
                style={{ padding: '8px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === totalPages ? '#CBD5E1' : 'var(--ink-2)', cursor: page === totalPages ? 'default' : 'pointer' }}>
                »
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   TransactionsView — payment history
══════════════════════════════════════════════ */
function TransactionsView() {
  const userId = getLoggedInUserId();

  const [txns,         setTxns]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [statFilter,   setStatFilter]   = useState('all');
  const [search,       setSearch]       = useState('');
  const [searchFocus,  setSearchFocus]  = useState(false);

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const STATUS_CFG = {
    success: { bg: '#DCFCE7', col: '#15803D', dot: '#10B981', label: 'Success' },
    created: { bg: '#FEF3C7', col: '#92400E', dot: '#F59E0B', label: 'Pending'  },
    failed:  { bg: '#FEE2E2', col: '#DC2626', dot: '#EF4444', label: 'Failed'   },
  };
  const TYPE_CFG = {
    mentorbooking: { bg: '#EDE9FE', col: '#7C3AED', label: 'Mentor Booking' },
    webinar:       { bg: '#E0E7FF', col: '#4338CA', label: 'Webinar'        },
  };
  const statusCfg = s => STATUS_CFG[s]   ?? { bg: '#F1F5F9', col: '#64748B', dot: '#94A3B8', label: s };
  const typeCfg   = t => TYPE_CFG[t]     ?? { bg: '#F1F5F9', col: '#64748B', label: t };

  const fetchTxns = useCallback(async (pg, type, stat) => {
    if (!userId) return;
    setLoading(true);
    try {
      const params = { page: pg, limit: LIMIT, userId };
      if (type !== 'all') params.formType = type;
      if (stat !== 'all') params.status   = stat;
      const res  = await httpService.get('/transaction/admin/list', { params, token: true });
      const rows = (res?.data?.rows ?? []).filter(tx => String(tx.userId) === String(userId));
      setTxns(rows);
      setTotalCount(res?.data?.count ?? 0);
    } catch { setTxns([]); setTotalCount(0); }
    finally { setLoading(false); }
  }, [userId]); // eslint-disable-line

  useEffect(() => { fetchTxns(1, 'all', 'all'); }, [fetchTxns]);

  const applyFilter = (type, stat) => {
    setTypeFilter(type); setStatFilter(stat); setPage(1); setSearch('');
    fetchTxns(1, type, stat);
  };
  const gotoPage = pg => { setPage(pg); setSearch(''); fetchTxns(pg, typeFilter, statFilter); };

  /* client-side search within the loaded page */
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return txns;
    return txns.filter(tx =>
      (tx.remarks             || '').toLowerCase().includes(q) ||
      (tx.transactionId       || '').toLowerCase().includes(q) ||
      (tx.razorPayTransactionId || '').toLowerCase().includes(q) ||
      (tx.formType            || '').toLowerCase().includes(q)
    );
  }, [txns, search]);

  const pageWindow = () => {
    const w = 5, half = Math.floor(w / 2);
    let s = Math.max(1, page - half);
    let e = Math.min(totalPages, s + w - 1);
    if (e - s < w - 1) s = Math.max(1, e - w + 1);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  };

  const hasFilters = typeFilter !== 'all' || statFilter !== 'all';

  return (
    <div>
      <div className="db-section-head">
        <h2>Transactions</h2>
        <p>Your complete payment history</p>
      </div>

      {/* ── Top bar: search + count ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {/* Search input */}
        <div style={{
          flex: 1, minWidth: 220, maxWidth: 380, position: 'relative',
          borderRadius: 12,
          boxShadow: searchFocus ? '0 0 0 3px rgba(79,70,229,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
          transition: 'box-shadow .2s',
        }}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke={searchFocus ? '#4F46E5' : '#94A3B8'} strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', transition: 'stroke .2s', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by remarks, TXN ID, Razorpay ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: 38, paddingRight: search ? 38 : 14,
              paddingTop: 10, paddingBottom: 10,
              border: `1.5px solid ${searchFocus ? '#4F46E5' : 'var(--border,#e2e8f0)'}`,
              borderRadius: 12, fontSize: 13.5, color: 'var(--ink)',
              background: 'var(--surface,#fff)', outline: 'none',
              transition: 'border-color .2s',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: '#E2E8F0', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#64748B' }}>
              <svg viewBox="0 0 24 24" fill="none" width="10" height="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Count chip */}
        <div style={{ fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
          {search
            ? <><b style={{ color: 'var(--ink-2)' }}>{displayed.length}</b> of {txns.length} shown</>
            : <><b style={{ color: 'var(--ink-2)' }}>{totalCount}</b> transaction{totalCount !== 1 ? 's' : ''}</>}
        </div>
      </div>

      {/* ── Filter pills row ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
        {/* Type pills */}
        <div style={{ display: 'flex', gap: 5, background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 5px' }}>
          {[
            { key: 'all',           label: 'All Types'      },
            { key: 'mentorbooking', label: 'Mentor Booking' },
            { key: 'webinar',       label: 'Webinar'        },
          ].map(o => (
            <button key={o.key} onClick={() => applyFilter(o.key, statFilter)}
              style={{ padding: '5px 13px', borderRadius: 7, border: 'none', background: typeFilter === o.key ? '#4F46E5' : 'transparent', color: typeFilter === o.key ? '#fff' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 5, background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 5px' }}>
          {[
            { key: 'all',     label: 'All Status' },
            { key: 'success', label: 'Success'    },
            { key: 'created', label: 'Pending'    },
            { key: 'failed',  label: 'Failed'     },
          ].map(o => (
            <button key={o.key} onClick={() => applyFilter(typeFilter, o.key)}
              style={{ padding: '5px 13px', borderRadius: 7, border: 'none', background: statFilter === o.key ? '#4F46E5' : 'transparent', color: statFilter === o.key ? '#fff' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s' }}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Clear filters badge */}
        {hasFilters && (
          <button onClick={() => applyFilter('all', 'all')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" width="11" height="11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Clear
          </button>
        )}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '60%', height: 14, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', marginBottom: 8 }} />
                <div style={{ width: '40%', height: 11, borderRadius: 6, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)' }} />
              </div>
              <div style={{ width: 80, height: 32, borderRadius: 8, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)' }} />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card" style={{ padding: '44px 32px', textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" width="52" height="52" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 14px' }}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>
          <h3 style={{ fontSize: 18, marginBottom: 8, fontFamily: 'var(--font-display)' }}>
            {search ? 'No matches found' : 'No transactions found'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
            {search ? `No results for "${search}".` : 'Try adjusting the filters above.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              style={{ marginTop: 14, padding: '8px 20px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map(tx => {
            const sc = statusCfg(tx.status);
            const tc = typeCfg(tx.formType);
            return (
              <div key={tx.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                      {tx.remarks || tx.transactionId}
                    </span>
                    <span style={{ background: tc.bg, color: tc.col, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{tc.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-3)', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{tx.transactionId}</span>
                    {tx.razorPayTransactionId && (
                      <><span style={{ opacity: 0.4 }}>·</span><span style={{ fontFamily: 'monospace', fontSize: 11.5 }}>{tx.razorPayTransactionId}</span></>
                    )}
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{fmtDate(tx.createdAt)}</span>
                  </div>
                </div>

                {/* Amount + status */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)', marginBottom: 5 }}>
                    ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc.bg, color: sc.col, fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                    {sc.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !search && totalPages > 1 && (
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* Page info strip */}
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            Page <b style={{ color: 'var(--ink-2)' }}>{page}</b> of <b style={{ color: 'var(--ink-2)' }}>{totalPages}</b>
            &nbsp;·&nbsp;<b style={{ color: 'var(--ink-2)' }}>{totalCount}</b> total
          </div>
          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => gotoPage(1)} disabled={page === 1}
              style={{ padding: '8px 12px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === 1 ? '#CBD5E1' : 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all .15s' }}>«</button>
            <button onClick={() => gotoPage(page - 1)} disabled={page === 1}
              style={{ padding: '8px 12px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === 1 ? '#CBD5E1' : 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', transition: 'all .15s' }}>‹</button>
            {pageWindow().map(p => (
              <button key={p} onClick={() => gotoPage(p)}
                style={{ minWidth: 36, padding: '8px 10px', background: p === page ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : '#fff', border: `1.5px solid ${p === page ? 'transparent' : 'var(--border)'}`, borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: p === page ? '#fff' : 'var(--ink-2)', cursor: 'pointer', transition: 'all .15s', boxShadow: p === page ? '0 2px 8px rgba(79,70,229,.3)' : 'none' }}>
                {p}
              </button>
            ))}
            <button onClick={() => gotoPage(page + 1)} disabled={page === totalPages}
              style={{ padding: '8px 12px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === totalPages ? '#CBD5E1' : 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all .15s' }}>›</button>
            <button onClick={() => gotoPage(totalPages)} disabled={page === totalPages}
              style={{ padding: '8px 12px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, color: page === totalPages ? '#CBD5E1' : 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', transition: 'all .15s' }}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Dashboard Page
══════════════════════════════════════════════ */
export default function Dashboard() {
  const [section, setSection] = useState('overview');

  /* overview KPIs */
  const [ovLoading,   setOvLoading]   = useState(true);
  const [ovUpcoming,  setOvUpcoming]  = useState([]);
  const [ovCompleted, setOvCompleted] = useState(0);
  const [ovTotal,     setOvTotal]     = useState(0);

  /* sidebar counts */
  const [webinarCount, setWebinarCount] = useState(0);
  const [appCount,     setAppCount]     = useState(0);
  const [ticketCount,  setTicketCount]  = useState(0);

  /* raised session ticket tracking — Map<sessId, ticketCode>, shared by Overview and SessionList */
  const [raisedSessIds, setRaisedSessIds] = useState(new Map());
  const handleTicketRaised = useCallback((sessId, code) => {
    setRaisedSessIds(prev => new Map([...prev, [String(sessId), code ?? 'TICKET']]));
  }, []);

  /* profile — lazy-loaded on first visit to profile tab */
  const [userProfile,    setUserProfile]    = useState(null);
  const [profileLoaded,  setProfileLoaded]  = useState(false);
  const profileFetchedRef = useRef(false);

  const userId = useMemo(() => getLoggedInUserId(), []);

  /* overview fetch */
  useEffect(() => {
    if (!userId) { setOvLoading(false); return; }
    httpService
      .get(`/mentorSession/user/${userId}`, { params: { page: 1, limit: 10, paymentStatus: 'done' }, token: true })
      .then(res => {
        const items = res?.data ?? [];
        setOvUpcoming(newestFirst(items.filter(s => !s.isSessionDone)));
        setOvCompleted(items.filter(s => s.isSessionDone).length);
        setOvTotal(res?.pagination?.total ?? items.length);
      })
      .catch(() => {})
      .finally(() => setOvLoading(false));

    /* sidebar counts */
    /* webinars — only my registrations, not all platform webinars */
    httpService.get(`/webinar/my-registrations/${userId}`, { params: { page: 1, limit: 10 }, token: true })
      .then(res => {
        const regs = Array.isArray(res?.registrations) ? res.registrations
                   : Array.isArray(res?.data)          ? res.data
                   : Array.isArray(res)                ? res : [];
        setWebinarCount(res?.totalCount ?? res?.total ?? regs.length);
      }).catch(() => {});

    httpService.get('/jobsInterested', { token: true })
      .then(res => {
        const rows = res?.data ?? (Array.isArray(res) ? res : []);
        setAppCount(rows.filter(a => String(a.userId) === String(userId)).length);
      }).catch(() => {});

    httpService.get('/supportTicket', { params: { activeOnly: true, userId, limit: 200 }, token: true })
      .then(res => {
        const rows  = Array.isArray(res)       ? res
                    : Array.isArray(res?.data) ? res.data : [];
        setTicketCount(res?.pagination?.total ?? res?.total ?? rows.length);

        /* parse Session IDs + ticketCodes from ticket descriptions to pre-mark raised tickets */
        const tickets = Array.isArray(res?.data?.data)    ? res.data.data
                      : Array.isArray(res?.data?.tickets) ? res.data.tickets
                      : Array.isArray(res?.data?.rows)    ? res.data.rows
                      : Array.isArray(res?.data)          ? res.data
                      : rows;
        const RE = /Session ID\s*:\s*(\S+)/;
        const sessMap = new Map(
          tickets
            .map(t => {
              const m = (t.description || '').match(RE);
              return m ? [m[1], t.ticketCode ?? t.id ?? 'TICKET'] : null;
            })
            .filter(Boolean)
        );
        setRaisedSessIds(sessMap);
      }).catch(() => {});
  }, []); // eslint-disable-line

  /* profile fetch — runs once when profile tab first opened */
  const fetchUserProfile = useCallback(() => {
    if (!userId) { setProfileLoaded(true); return; }
    httpService.get(`/user/${userId}`, { token: true })
      .then(res => {
        /* unwrap common API response shapes: { data:{} }, { user:{} }, or plain object */
        const user = res?.data ?? res?.user ?? res ?? {};
        setUserProfile(user);
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (section === 'profile' && !profileFetchedRef.current) {
      profileFetchedRef.current = true;
      fetchUserProfile();
    }
  }, [section, fetchUserProfile]);

  const nav = useMemo(() => NAV.map(item => {
    if (item.divider) return item;
    if (item.id === 'sessions')     return { ...item, count: ovTotal };
    if (item.id === 'webinars')     return { ...item, count: webinarCount };
    if (item.id === 'applications') return { ...item, count: appCount };
    if (item.id === 'support')      return { ...item, count: ticketCount };
    return item;
  }), [ovTotal, webinarCount, appCount, ticketCount]);

  return (
    <DashboardShell
      subtitle="Student Dashboard"
      title="Welcome back"
      kpis={[
        { v: ovLoading ? '…' : String(ovUpcoming.length), l: 'Upcoming sessions'  },
        { v: ovLoading ? '…' : String(ovCompleted),       l: 'Completed sessions' },
        { v: ovLoading ? '…' : String(ovTotal),           l: 'Sessions booked'    },
        { v: appCount > 0 ? String(appCount) : '0',        l: 'Applications'       },
      ]}
      navItems={nav}
      activeSection={section}
      onSectionChange={setSection}
    >

      {/* ── Overview ── */}
      {section === 'overview' && (
        <div>
          <div className="sh-row" style={{ marginBottom: 16 }}>
            <h2 className="section-title" style={{ fontSize: 22 }}>Upcoming sessions</h2>
            <Link to="/mentors" className="view-all">Book another</Link>
          </div>

          {ovLoading ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
          ) : ovUpcoming.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <p style={{ color: 'var(--ink-2)', marginBottom: 12 }}>No upcoming sessions yet.</p>
              <Link to="/mentors" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>Browse Mentors</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ovUpcoming.map(s => (
                <SessionCard
                  key={s.id}
                  s={s}
                  ticketCode={raisedSessIds.get(String(s.id)) ?? null}
                  onTicketRaised={handleTicketRaised}
                />
              ))}
            </div>
          )}

          {ovCompleted > 0 && (
            <div style={{ marginTop: 28 }}>
              <div className="sh-row" style={{ marginBottom: 12 }}>
                <h2 className="section-title" style={{ fontSize: 18 }}>Completed sessions</h2>
                <button className="view-all" onClick={() => setSection('sessions')}>View all</button>
              </div>
              <div className="card" style={{ padding: '14px 20px', color: 'var(--ink-2)', fontSize: 14 }}>
                {ovCompleted} session{ovCompleted !== 1 ? 's' : ''} completed.{' '}
                <button className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', marginLeft: 4 }} onClick={() => setSection('sessions')}>
                  View details
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sessions ── */}
      {section === 'sessions' && (
        <div>
          <div className="db-section-head">
            <h2>All Sessions</h2>
            <p>Your booked mentoring sessions</p>
          </div>
          <SessionList raisedSessIds={raisedSessIds} onTicketRaised={handleTicketRaised} />
        </div>
      )}

      {/* ── My Mentors ── */}
      {section === 'mentors' && (
        <div>
          <div className="db-section-head">
            <h2>My Mentors</h2>
            <p>Verified mentors available for booking</p>
          </div>
          <MentorSection />
        </div>
      )}

      {/* ── Webinars ── */}
      {section === 'webinars' && <WebinarsView />}

      {/* ── Wallet ── */}
      {section === 'wallet' && <WalletView />}

      {/* ── Transactions ── */}
      {section === 'transactions' && <TransactionsView />}

      {/* ── Applications ── */}
      {section === 'applications' && (
        <div>
          <div className="db-section-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2>Applications</h2>
              <p>Track your internship &amp; job applications</p>
            </div>
            <Link to="/jobs" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, flexShrink: 0 }}>
              Apply more +
            </Link>
          </div>
          <ApplicationsView />
        </div>
      )}

      {/* ── Profile ── */}
      {section === 'profile' && (
        <StudentProfileSection
          userId={userId}
          profile={userProfile}
          loading={!profileLoaded}
          onSaved={fetchUserProfile}
        />
      )}

      {/* ── Support Tickets ── */}
      {section === 'support' && (
        <SupportTicketsView
          userId={userId}
          userProfile={{
            name:  [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' '),
            email: userProfile?.email   || '',
            phone: userProfile?.contact || '',
          }}
        />
      )}

      {/* ── Platform Review ── */}
      {section === 'review' && (
        <PlatformReviewView
          userId={userId}
          reviewerType={userProfile?.type || 'student'}
        />
      )}

    </DashboardShell>
  );
}
