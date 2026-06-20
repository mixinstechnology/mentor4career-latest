import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import DashboardShell from '../components/DashboardShell.jsx';
import { Calendar, Person, Webinar, Doc } from '../components/Icons.jsx';
import httpService from '../utils/apiService.tsx';
import { useBooking } from '../context/BookingContext.jsx';
import SupportTicketsView from '../components/SupportTicketsView.jsx';

/* ── inline icons ── */
const TicketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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

/* sort any array newest-first; uses createdAt if present, falls back to id */
function newestFirst(arr) {
  return [...arr].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : (Number(a.id) || 0);
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : (Number(b.id) || 0);
    return tb - ta;
  });
}

/* ── Session status derivation ── */
function deriveStatus(s) {
  if (s.paymentStatus === 'done' && !s.isSessionDone) return 'upcoming';
  if (s.paymentStatus === 'done' &&  s.isSessionDone) return 'completed';
  if (s.paymentStatus === 'pending')                  return 'pending';
  return 'failed';
}
const SESSION_BADGE = {
  upcoming:  { cls: 'upcoming',  label: 'Upcoming'  },
  completed: { cls: 'completed', label: 'Completed' },
  pending:   { cls: 'cancelled', label: 'Pending'   },
  failed:    { cls: 'cancelled', label: 'Failed'    },
};
function apiPaymentStatus(filter) {
  if (filter === 'upcoming' || filter === 'completed') return 'done';
  if (filter === 'all') return null;
  return filter;
}
function matchesFilter(s, filter) {
  if (filter === 'upcoming')  return !s.isSessionDone;
  if (filter === 'completed') return  s.isSessionDone;
  return true;
}
const SESSION_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'pending',   label: 'Pending'   },
  { key: 'failed',    label: 'Failed'    },
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
  { divider: true },
  { id: 'support',      label: 'Support Tickets',  icon: <TicketIcon />  },
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
    if (photo && typeof photo === 'object' && photo.url) {
      setAvatarUrl(photo.url);
      setAvatarObject(photo);
    } else {
      setAvatarUrl(photo);
      setAvatarObject(null);
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
        profilePhoto: avatarObject     || avatarUrl || null,
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

/* ── Session card ── */
function SessionCard({ s, onReview }) {
  const col    = nameColor(s.mentorName);
  const init   = (s.mentorName || '?').split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase();
  const status = deriveStatus(s);
  const badge  = SESSION_BADGE[status];
  const hasReview = !!s.rating;

  return (
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
            /* show submitted review */
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
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SessionList — real API + infinite scroll
══════════════════════════════════════════════ */
function SessionList() {
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

  const loadPage = async (page, fil, replace) => {
    if (loadingRef.current || !userId) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const ps = apiPaymentStatus(fil);
      if (ps) params.paymentStatus = ps;

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
        ) : sessions.map(s => <SessionCard key={s.id} s={s} onReview={handleReview} />)}
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
    openBooking({ id: m.authUserId, init: initials(m.firstName, m.lastName), color: nameColor(fullName), name: fullName, role: m.jobRole || 'Mentor', price: m.chargePerSession ?? 0 });
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
  const [webinars,     setWebinars]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [hasMore,      setHasMore]      = useState(false);

  const load = async (pg = 1, replace = true, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (status !== 'all') params.status = status;
      const res   = await httpService.get('/webinar', { params, token: true });
      /* API: { success, webinars: { total, pages, webinars: [...] } } */
      const inner = res?.webinars;
      const raw   = Array.isArray(inner?.webinars) ? inner.webinars
                  : Array.isArray(inner)            ? inner
                  : Array.isArray(res)              ? res : [];
      const data  = newestFirst(raw);
      const pages = inner?.pages ?? 1;
      setWebinars(prev => replace ? data : [...prev, ...data]);
      setTotalPages(pages);
      setHasMore(pg < pages);
      setPage(pg);
    } catch { if (replace) setWebinars([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(1, true, statusFilter); }, [statusFilter]); // eslint-disable-line

  return (
    <div>
      <div className="db-section-head">
        <h2>Webinars</h2>
        <p>Browse and join upcoming webinars</p>
      </div>

      {/* status filter pills */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setStatusFilter('all')}
          style={{ padding: '7px 16px', borderRadius: 99, border: `1.5px solid ${statusFilter === 'all' ? '#4F46E5' : 'var(--border)'}`, background: statusFilter === 'all' ? '#EEF2FF' : '#fff', color: statusFilter === 'all' ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
          All
        </button>
        {WB_STATUS_KEYS.map(k => {
          const cfg    = WB_STATUS_CFG[k];
          const active = statusFilter === k;
          return (
            <button key={k} onClick={() => setStatusFilter(k)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 99, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.col : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* list */}
      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)' }}>Loading…</div>
      ) : webinars.length === 0 ? (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>📹</div>
          <h3 style={{ fontSize: 18, marginBottom: 8, fontFamily: 'var(--font-display)' }}>No webinars found</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>No webinars match the selected filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {webinars.map(w => {
            const autoStatus = w.status;
            const cfg        = WB_STATUS_CFG[autoStatus] || WB_STATUS_CFG.upcoming;
            return (
              <div key={w.id} className="card" style={{ padding: '18px 20px', borderLeft: `3.5px solid ${cfg.border}` }}>
                {/* top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{w.title}</div>
                    {w.description && <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{w.description}</div>}
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.col, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99, flexShrink: 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
                    {cfg.label}
                  </span>
                </div>

                {/* meta chips */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[
                    { ic: '👤', val: w.presenter },
                    { ic: '📅', val: fmtWbDate(w.date, w.time) },
                    { ic: '⏱',  val: w.duration ? `${w.duration} min` : null },
                    { ic: '💰', val: w.isFree ? 'Free' : (w.price ? `₹${w.price}` : null) },
                    { ic: '👥', val: w.maxRegistration ? `${w.maxRegistration} seats` : null },
                  ].filter(m => m.val).map((m, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFC', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500, padding: '4px 11px', borderRadius: 99 }}>
                      {m.ic} {m.val}
                    </span>
                  ))}
                </div>

                {/* join link — hidden for completed/cancelled/failed; non-clickable for upcoming */}
                {w.link && autoStatus !== 'completed' && autoStatus !== 'cancelled' && autoStatus !== 'failed' && (
                  <a href={autoStatus === 'upcoming' ? undefined : w.link} target="_blank" rel="noreferrer"
                    className="wb-join-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: autoStatus === 'ongoing' ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, textDecoration: 'none', boxShadow: '0 2px 8px rgba(79,70,229,.25)', ...(autoStatus === 'upcoming' && { pointerEvents: 'none', opacity: 0.55, cursor: 'default' }) }}>
                    <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {autoStatus === 'ongoing' ? 'Join Now' : 'View Link'}
                  </a>
                )}
              </div>
            );
          })}

          {/* pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
              {page > 1 && (
                <button onClick={() => load(page - 1, true, statusFilter)} disabled={loading}
                  style={{ padding: '9px 20px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                  ← Prev
                </button>
              )}
              <span style={{ padding: '9px 16px', background: '#EEF2FF', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#4F46E5' }}>
                {page} / {totalPages}
              </span>
              {hasMore && (
                <button onClick={() => load(page + 1, true, statusFilter)} disabled={loading}
                  style={{ padding: '9px 20px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                  {loading ? 'Loading…' : 'Next →'}
                </button>
              )}
            </div>
          )}
        </div>
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
          <div style={{ fontSize: 44, marginBottom: 14 }}>📄</div>
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
    httpService.get('/webinar', { params: { page: 1, limit: 200 }, token: true })
      .then(res => {
        const inner = res?.webinars;
        const rows  = Array.isArray(inner?.webinars) ? inner.webinars : Array.isArray(inner) ? inner : Array.isArray(res?.data) ? res.data : [];
        setWebinarCount(inner?.total ?? res?.total ?? rows.length);
      }).catch(() => {});

    httpService.get('/jobsInterested', { token: true })
      .then(res => {
        const rows = res?.data ?? (Array.isArray(res) ? res : []);
        setAppCount(rows.filter(a => String(a.userId) === String(userId)).length);
      }).catch(() => {});

    httpService.get('/supportTicket', { params: { activeOnly: true, userId, limit: 200 }, token: true })
      .then(res => {
        const rows = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setTicketCount(rows.length);
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
    if (item.id === 'webinars')     return { ...item, count: webinarCount };
    if (item.id === 'applications') return { ...item, count: appCount };
    if (item.id === 'support')      return { ...item, count: ticketCount };
    return item;
  }), [webinarCount, appCount, ticketCount]);

  return (
    <DashboardShell
      subtitle="Student Dashboard"
      title="Welcome back 👋"
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
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <p style={{ color: 'var(--ink-2)', marginBottom: 12 }}>No upcoming sessions yet.</p>
              <Link to="/mentors" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>Browse Mentors</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ovUpcoming.map(s => <SessionCard key={s.id} s={s} />)}
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
          <SessionList />
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

    </DashboardShell>
  );
}
