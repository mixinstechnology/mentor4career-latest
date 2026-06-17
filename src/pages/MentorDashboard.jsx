import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import DashboardShell from '../components/DashboardShell.jsx';
import { Calendar, Clock, Card, Check, Person } from '../components/Icons.jsx';
import httpService from '../utils/apiService.tsx';
import SupportTicketsView from '../components/SupportTicketsView.jsx';

/* ── inline SVG icons ── */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" width={15} height={15}>
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevRight = () => (
  <svg viewBox="0 0 24 24" fill="none" width={15} height={15}>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const RemoveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={13} height={13}>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={13} height={13} style={{ flexShrink: 0 }}>
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ── helpers ── */
function getLoggedInUserId() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id ?? payload.userId ?? null;
  } catch { return null; }
}

/* fields used for % calculation */
function calcCompletion(p) {
  if (!p) return 0;
  const checks = [
    !!p.firstName,
    !!p.lastName,
    !!p.email,
    !!p.contactNumber,
    !!p.gender,
    !!p.linkedInProfile,
    !!p.organizationName,
    !!p.jobRole,
    p.experience !== null && p.experience !== undefined && p.experience !== '',
    !!p.bio,
    !!(Array.isArray(p.languageKnown) ? p.languageKnown.length > 0 : p.languageKnown),
    p.chargePerSession !== null && p.chargePerSession !== undefined && p.chargePerSession !== '',
    !!p.admissionYear,
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

/* ── static data ── */
const REQUESTS = [
  { av: 'RD', col: 'linear-gradient(135deg,#4F46E5,#3B82F6)', name: 'Rohan D.',  when: 'Sat, 14 Jun · 06:00 PM', topic: 'Interview prep'   },
  { av: 'TA', col: 'linear-gradient(135deg,#F59E0B,#EF4444)', name: 'Tanvi A.',  when: 'Sun, 15 Jun · 12:30 PM', topic: 'Career guidance'  },
];
/* ── session helpers ── */
const SESS_GRAD = [
  'linear-gradient(135deg,#7C5CF7,#EC4899)',
  'linear-gradient(135deg,#0FA968,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#4F46E5,#3B82F6)',
  'linear-gradient(135deg,#EC4899,#F59E0B)',
  'linear-gradient(135deg,#10B981,#7C3AED)',
];
function sessNameColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return SESS_GRAD[h % SESS_GRAD.length];
}
function sessInitials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase() || '?';
}
function deriveSessStatus(s) {
  if (s.paymentStatus === 'done' && !s.isSessionDone) return 'upcoming';
  if (s.paymentStatus === 'done' &&  s.isSessionDone) return 'completed';
  if (s.paymentStatus === 'pending')                  return 'pending';
  return 'failed';
}
const SESS_BADGE = {
  upcoming:  { cls: 'upcoming',  label: 'Upcoming'  },
  completed: { cls: 'completed', label: 'Completed' },
  pending:   { cls: 'cancelled', label: 'Pending'   },
  failed:    { cls: 'cancelled', label: 'Failed'    },
};
function sessApiParam(filter) {
  if (filter === 'upcoming' || filter === 'completed') return 'done';
  if (filter === 'all') return null;
  return filter;
}
function sessClientMatch(s, filter) {
  if (filter === 'upcoming')  return !s.isSessionDone;
  if (filter === 'completed') return  s.isSessionDone;
  return true;
}
const SESS_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'pending',   label: 'Pending'   },
];

/* ── calendar constants ── */
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON_SHORT   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW_COL     = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      const hh = h % 12 === 0 ? 12 : h % 12;
      const ap = h < 12 ? 'AM' : 'PM';
      const mm = m === 0 ? '00' : '30';
      opts.push({ value: `${hh}:${mm} ${ap}`, label: `${hh}:${mm} ${ap}` });
    }
  }
  return opts;
})();

function fmtTime(val) { return TIME_OPTIONS.find(o => o.value === val)?.label ?? val; }
function dateKey(y, m, d) { return `${y}-${m}-${d}`; }
function toMins(val) {
  if (val.includes(' ')) {
    const [time, ap] = val.split(' ');
    const [h, m] = time.split(':').map(Number);
    let hr = h;
    if (ap === 'PM' && h !== 12) hr = h + 12;
    if (ap === 'AM' && h === 12) hr = 0;
    return hr * 60 + m;
  }
  const [h, m] = val.split(':').map(Number);
  return h * 60 + m;
}
function parseApiTime(label) {
  const [time, ap] = label.trim().split(' ');
  const [h, m] = time.split(':').map(Number);
  const hh = h % 12 === 0 ? 12 : h % 12;
  const mm = m === 0 ? '00' : '30';
  return `${hh}:${mm} ${ap}`;
}
function apiDateToKey(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return dateKey(y, mo - 1, d);
}
function keyToApiDate(key) {
  const [y, mo, d] = key.split('-').map(Number);
  return `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/* ── nav ── */
const TicketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const WebinarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9.5 10.5l2-1.5v3l2-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NAV = [
  { id: 'overview',     label: 'Overview',        icon: <HomeIcon /> },
  { id: 'profile',      label: 'Profile',          icon: <Person />   },
  { divider: true },
  { id: 'sessions',     label: 'Sessions',         icon: <Calendar /> },
  { id: 'availability', label: 'Availability', icon: <Clock />    },
  { id: 'webinars',     label: 'Webinars',         icon: <WebinarIcon /> },
  { id: 'earnings',     label: 'Earnings',         icon: <Card />     },
  { divider: true },
  { id: 'support',      label: 'Support Tickets',  icon: <TicketIcon /> },
];

const STATUS_LABEL = { upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' };

/* ═══════════════════════════════════════════════════════
   PROFILE COMPLETE POPUP
═══════════════════════════════════════════════════════ */
function ProfilePopup({ pct, onComplete, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: 'var(--surface, #fff)', borderRadius: 18,
        padding: '36px 32px', maxWidth: 420, width: '90%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center',
      }}>
        <div style={{ fontSize: 42 }}>👋</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, margin: 0 }}>
          Complete your profile
        </h3>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Your profile is <b>{pct}% complete</b>. Fill in the remaining details to get verified and start accepting students.
        </p>

        {/* progress bar */}
        <div style={{ background: 'var(--border, #e2e8f0)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: 99,
            background: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#4F46E5',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'right', marginTop: -8 }}>
          {pct}% complete
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: 14 }}
            onClick={onComplete}
          >
            Complete Profile
          </button>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, fontSize: 14 }}
            onClick={onDismiss}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROFILE FORM PRIMITIVES — defined at module level so
   React never remounts them on parent re-render
═══════════════════════════════════════════════════════ */
function LockedField({ label, value }) {
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
        <LockIcon />
        <span>{value || '—'}</span>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, as, rows, hint }) {
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
    </div>
  );
}

function FormSection({ title, cols = 2, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--indigo,#4F46E5)',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
        paddingBottom: 8, borderBottom: '1.5px solid var(--border,#e2e8f0)',
      }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols === 1 ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROFILE SECTION
═══════════════════════════════════════════════════════ */
function ProfileSection({ profile, onSaved }) {
  const pct = calcCompletion(profile);
  const pctColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#4F46E5';

  const langStr = Array.isArray(profile?.languageKnown)
    ? profile.languageKnown.join(', ')
    : (profile?.languageKnown || '');

  const [form, setForm] = useState({
    password:         '',
    linkedInProfile:  profile?.linkedInProfile  || '',
    instituteName:    profile?.instituteName    || '',
    admissionYear:    profile?.admissionYear    || '',
    universityName:   profile?.universityName   || '',
    organizationName: profile?.organizationName || '',
    jobRole:          profile?.jobRole          || '',
    experience:       profile?.experience       ?? '',
    bio:              profile?.bio              || '',
    languageKnown:    langStr,
    chargePerSession: profile?.chargePerSession ?? '',
  });
  const [saving,  setSaving]  = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setIsDirty(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    try {
      const payload = {
        linkedInProfile:  form.linkedInProfile  || null,
        instituteName:    form.instituteName    || null,
        admissionYear:    form.admissionYear    || null,
        universityName:   form.universityName   || null,
        organizationName: form.organizationName || null,
        jobRole:          form.jobRole          || null,
        experience:       form.experience !== '' ? Number(form.experience)       : null,
        bio:              form.bio              || null,
        languageKnown:    form.languageKnown.split(',').map(s => s.trim()).filter(Boolean),
        chargePerSession: form.chargePerSession !== '' ? Number(form.chargePerSession) : null,
        type:             'mentor',
      };
      if (form.password) payload.password = form.password;

      await httpService.put(`/mentorProfile/${profile.id}`, { data: payload, token: true });
      toast.success('Profile updated successfully!');
      setIsDirty(false);
      onSaved?.();
    } catch { /* apiService shows toast */ }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="db-section-head">
        <h2>My Profile</h2>
        <p>Update your profile to attract more students and get verified.</p>
      </div>

      {/* ── Completion bar ── */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Profile completion</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: pctColor }}>{pct}%</span>
          </div>
          <div style={{ background: 'var(--border,#e2e8f0)', borderRadius: 99, height: 9, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: pctColor }} />
          </div>
        </div>
        <div>
          {profile?.isVerified
            ? <span style={{ fontSize: 12, fontWeight: 700, background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: 99 }}>✓ Verified</span>
            : <span style={{ fontSize: 12, fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: 99 }}>Pending verification</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Personal Info (all locked) ── */}
        <FormSection title="Personal info — from your account" cols={2}>
          <LockedField label="First name"     value={profile?.firstName}     />
          <LockedField label="Last name"      value={profile?.lastName}      />
          <LockedField label="Email"          value={profile?.email}         />
          <LockedField label="Contact number" value={profile?.contactNumber} />
          <LockedField label="Gender"         value={profile?.gender}        />
        </FormSection>

        {/* ── Security ── */}
        <FormSection title="Security" cols={1}>
          <Field label="New password" value={form.password} onChange={set('password')} type="password" placeholder="Leave blank to keep current password" hint="Only fill this if you want to change your password." />
        </FormSection>

        {/* ── Professional ── */}
        <FormSection title="Professional" cols={2}>
          <Field label="Organization / Company" value={form.organizationName}  onChange={set('organizationName')}  placeholder="e.g. Google"            />
          <Field label="Job role"               value={form.jobRole}           onChange={set('jobRole')}           placeholder="e.g. Software Engineer"  />
          <Field label="Experience (years)"     value={form.experience}        onChange={set('experience')}        type="number" placeholder="e.g. 5"    />
          <Field label="Charge per session (₹)" value={form.chargePerSession}  onChange={set('chargePerSession')}  type="number" placeholder="e.g. 499"  />
        </FormSection>

        {/* ── Education ── */}
        <FormSection title="Education" cols={2}>
          <Field label="Institute name"  value={form.instituteName}  onChange={set('instituteName')}  placeholder="e.g. IIT Bombay"        />
          <Field label="Admission year"  value={form.admissionYear}  onChange={set('admissionYear')}  placeholder="e.g. 2020"              />
          <Field label="University name" value={form.universityName} onChange={set('universityName')} placeholder="e.g. Mumbai University"  />
        </FormSection>

        {/* ── About & Links ── */}
        <FormSection title="About & Links" cols={1}>
          <Field label="Bio"              value={form.bio}             onChange={set('bio')}             as="textarea" rows={4} placeholder="Tell students about yourself, your experience and how you can help them." />
          <Field label="Languages known"  value={form.languageKnown}   onChange={set('languageKnown')}   placeholder="e.g. English, Hindi, Marathi" hint="Separate with commas." />
          <Field label="LinkedIn profile" value={form.linkedInProfile} onChange={set('linkedInProfile')} placeholder="https://linkedin.com/in/your-profile" />
        </FormSection>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
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
          {isDirty && !profile?.isVerified && (
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              Your profile will be reviewed for verification after saving.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SESSION LIST
═══════════════════════════════════════════════════════ */
/* ── session datetime helpers ── */
function parseSessDate(dateStr) {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d)) return d;
  const clean = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim();
  d = new Date(`${clean} ${new Date().getFullYear()}`);
  return isNaN(d) ? null : d;
}
function sessBadge(dateStr) {
  const d = parseSessDate(dateStr);
  if (!d) return { day: '--', mon: '---' };
  return {
    day: d.getDate().toString().padStart(2, '0'),
    mon: MON_SHORT[d.getMonth()].toUpperCase(),
  };
}
function parseSessDateTime(dateStr, timeStr) {
  const d = parseSessDate(dateStr);
  if (!d || !timeStr) return null;
  const m = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (m) {
    let h = parseInt(m[1]), min = parseInt(m[2]), ap = (m[3] || '').toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    d.setHours(h, min, 0, 0);
  }
  return d;
}
function isSessTimePast(dateStr, timeStr) {
  const d = parseSessDateTime(dateStr, timeStr);
  return d ? d < new Date() : false;
}
/* reschedule allowed when slot start is still >30 min in the future */
function canReschedule(dateStr, timeStr) {
  const d = parseSessDateTime(dateStr, timeStr);
  if (!d) return false;
  return d - new Date() > 30 * 60 * 1000;
}

/* ── star rating widget ── */
function StarPicker({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
      <span style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(i => (
          <button key={i} type="button" onClick={() => onChange(i)}
            style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', lineHeight: 1 }}>
            <svg viewBox="0 0 24 24" width="22" height="22"
              fill={i <= value ? '#F59E0B' : 'none'}
              stroke={i <= value ? '#F59E0B' : '#D1D5DB'}
              strokeWidth="1.8">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </span>
    </div>
  );
}

const EMPTY_REVIEW = { mentorFeedback: '' };

function SessionList({ authUserId }) {
  const [filter,      setFilter]      = useState('all');
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [markingId,      setMarkingId]      = useState(null);
  const [reviewSess,     setReviewSess]     = useState(null);
  const [reviewForm,     setReviewForm]     = useState(EMPTY_REVIEW);
  const [submitting,     setSubmitting]     = useState(false);
  const [rescheduleSess, setRescheduleSess] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', fromTime: '', toTime: '', reason: '' });
  const [rescheduling,   setRescheduling]   = useState(false);

  const sentinelRef = useRef(null);
  const pageRef     = useRef(1);
  const hasMoreRef  = useRef(true);
  const loadingRef  = useRef(false);
  const filterRef   = useRef('all');

  const loadPage = async (page, fil, replace) => {
    if (loadingRef.current || !authUserId) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const ps = sessApiParam(fil);
      if (ps) params.paymentStatus = ps;
      const res        = await httpService.get(`/mentorSession/mentor/${authUserId}`, { params, token: true });
      const raw        = res?.data ?? [];
      const items      = raw.filter(s => sessClientMatch(s, fil));
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

  /* mark session done → then open review modal */
  const handleMarkDone = async (s) => {
    if (markingId) return;
    setMarkingId(s.id);
    try {
      await httpService.put(`/mentorSession/status/${s.id}`, { data: { isSessionDone: true }, token: true });
      setSessions(prev => prev.map(x => x.id === s.id ? { ...x, isSessionDone: true } : x));
      toast.success('Session marked as completed!');
      setReviewForm(EMPTY_REVIEW);
      setReviewSess(s);
    } catch {}
    finally { setMarkingId(null); }
  };

  /* submit review */
  const handleSubmitReview = async () => {
    if (!reviewSess) return;
    setSubmitting(true);
    try {
      await httpService.put(`/mentorSession/${reviewSess.id}/feedback`, {
        data: {
          role:           'mentor',
          feedback: reviewForm.mentorFeedback,
        },
        token: true,
      });
      toast.success('Feedback submitted. Thank you!');
      setReviewSess(null);
    } catch {}
    finally { setSubmitting(false); }
  };

  /* open reschedule modal */
  const openReschedule = (s) => {
    setRescheduleForm({ date: '', fromTime: '', toTime: '', reason: '' });
    setRescheduleSess(s);
  };

  /* submit reschedule */
  const handleReschedule = async () => {
    if (!rescheduleSess || !rescheduleForm.date || !rescheduleForm.fromTime || !rescheduleForm.toTime) {
      toast.error('Please select a new date, from time, and to time.');
      return;
    }
    setRescheduling(true);
    try {
      await httpService.put(`/mentorSession/${rescheduleSess.id}`, {
        data: {
          date:     rescheduleForm.date,
          fromTime: rescheduleForm.fromTime,
          toTime:   rescheduleForm.toTime,
          time:     rescheduleForm.fromTime,
          reason:   rescheduleForm.reason,
        },
        token: true,
      });
      setSessions(prev => prev.map(x =>
        x.id === rescheduleSess.id
          ? { ...x, date: rescheduleForm.date, time: rescheduleForm.fromTime }
          : x
      ));
      toast.success('Session rescheduled successfully!');
      setRescheduleSess(null);
    } catch {}
    finally { setRescheduling(false); }
  };

  const upcoming  = sessions.filter(s => deriveSessStatus(s) === 'upcoming');
  const completed = sessions.filter(s => deriveSessStatus(s) === 'completed');
  const other     = sessions.filter(s => !['upcoming','completed'].includes(deriveSessStatus(s)));

  const SessionCard = ({ s }) => {
    const studentName = s.userName || s.studentName || s.name || 'Student';
    const { day, mon } = sessBadge(s.date);
    const status       = deriveSessStatus(s);
    const isPast        = isSessTimePast(s.date, s.time);
    const allowResched  = canReschedule(s.date, s.time);
    const isMarking     = markingId === s.id;

    return (
      <div className="sess-card">
        {/* date badge */}
        <div className="sess-date">
          <b>{day}</b>
          <span>{mon}</span>
        </div>

        {/* info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>
            {s.description || 'Session'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 3 }}>
            <svg viewBox="0 0 24 24" fill="none" width="13" height="13" style={{ verticalAlign: 'middle', marginRight: 4 }}>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            with {studentName}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            {s.date ? s.date.replace(/^[A-Za-z]+,\s*/, '') : ''}{s.time ? ` · ${s.time}` : ''} · Video call
            {s.amount ? ` · ₹${s.amount}` : ''}
          </div>
        </div>

        {/* actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {status === 'upcoming' && (
            <>
              <a href="#" className="btn btn-sm" style={{ background: 'var(--grad)', color: '#fff', borderColor: 'transparent', boxShadow: 'var(--shadow-brand)' }}>
                Start call
              </a>
              <button
                className="btn btn-soft btn-sm"
                onClick={() => allowResched && openReschedule(s)}
                disabled={!allowResched}
                title={allowResched ? 'Reschedule session' : 'Cannot reschedule within 30 min of start time'}
                style={{ pointerEvents: allowResched ? 'auto' : 'none', opacity: allowResched ? 1 : 0.38, cursor: allowResched ? 'pointer' : 'not-allowed' }}
              >
                Reschedule
              </button>
              <button
                className="btn btn-soft btn-sm"
                onClick={() => isPast && handleMarkDone(s)}
                disabled={!isPast || isMarking}
                style={{ pointerEvents: isPast ? 'auto' : 'none', opacity: isPast ? 1 : 0.38, cursor: isPast ? 'pointer' : 'not-allowed' }}
              >
                {isMarking ? 'Saving…' : 'Mark done'}
              </button>
            </>
          )}
          {status === 'completed' && (
            <span className="sess-badge completed" style={{ fontSize: 13, padding: '6px 14px' }}>
              <i />Completed
            </span>
          )}
          {status === 'pending' && (
            <span className="sess-badge cancelled"><i />Pending payment</span>
          )}
        </div>
      </div>
    );
  };

  const renderGroup = (list, heading) => list.length === 0 ? null : (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>{heading}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map(s => <SessionCard key={s.id} s={s} />)}
      </div>
    </div>
  );

  return (
    <>
      {/* filter tabs */}
      <div className="sess-tabs">
        {SESS_FILTERS.map(f => (
          <button key={f.key} className={'sess-tab' + (filter === f.key ? ' active' : '')} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {sessions.length === 0 && !loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>No sessions found.</div>
      ) : filter === 'all' ? (
        <>
          {renderGroup(upcoming,  'Upcoming sessions')}
          {renderGroup(completed, 'Completed sessions')}
          {renderGroup(other,     'Other')}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.map(s => <SessionCard key={s.id} s={s} />)}
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* ── Reschedule modal ── */}
      {rescheduleSess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setRescheduleSess(null); }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', position: 'relative', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
            {/* header */}
            <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 24px 18px', color: '#fff' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Reschedule Session</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                {rescheduleSess.description || 'Session'} &nbsp;·&nbsp; with {rescheduleSess.userName || rescheduleSess.studentName || rescheduleSess.name || 'Student'}
              </div>
              <button onClick={() => setRescheduleSess(null)}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center' }}>
                ×
              </button>
            </div>

            {/* current slot info */}
            <div style={{ background: '#F5F3FF', borderBottom: '1px solid #EDE9FE', padding: '12px 24px', fontSize: 13, color: '#6D28D9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Current: {rescheduleSess.date ? rescheduleSess.date.replace(/^[A-Za-z]+,\s*/, '') : '—'}{rescheduleSess.time ? ` · ${rescheduleSess.time}` : ''}
            </div>

            {/* body */}
            <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>New Date</label>
                <input
                  type="date"
                  value={rescheduleForm.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setRescheduleForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>From Time</label>
                  <input
                    type="time"
                    value={rescheduleForm.fromTime}
                    onChange={e => setRescheduleForm(f => ({ ...f, fromTime: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>To Time</label>
                  <input
                    type="time"
                    value={rescheduleForm.toTime}
                    min={rescheduleForm.fromTime || undefined}
                    onChange={e => setRescheduleForm(f => ({ ...f, toTime: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Reason <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={e => setRescheduleForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. Personal conflict, need to shift by a day…"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setRescheduleSess(null)}
                  style={{ flex: 1, padding: '12px 0', background: 'var(--surface)', color: 'var(--ink-2)', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleReschedule} disabled={rescheduling || !rescheduleForm.date || !rescheduleForm.fromTime || !rescheduleForm.toTime}
                  style={{ flex: 2, padding: '12px 0', background: (!rescheduleForm.date || !rescheduleForm.fromTime || !rescheduleForm.toTime || rescheduling) ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: (!rescheduleForm.date || !rescheduleForm.fromTime || !rescheduleForm.toTime || rescheduling) ? 'not-allowed' : 'pointer', boxShadow: (rescheduleForm.date && rescheduleForm.fromTime && rescheduleForm.toTime && !rescheduling) ? '0 4px 14px rgba(79,70,229,0.35)' : 'none', transition: 'all .2s' }}>
                  {rescheduling ? 'Rescheduling…' : 'Confirm Reschedule'}
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" width="12" height="12" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Rescheduling is only allowed more than 30 min before the session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback modal ── */}
      {reviewSess && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setReviewSess(null); }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
            {/* modal header */}
            <div style={{ background: 'var(--grad)', padding: '22px 24px 18px', color: '#fff', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Session Feedback</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                with {reviewSess.userName || reviewSess.studentName || reviewSess.name || 'Student'} &nbsp;·&nbsp; {reviewSess.description}
              </div>
              <button onClick={() => setReviewSess(null)}
                style={{ position: 'absolute', top: 18, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center' }}>
                ×
              </button>
            </div>

            {/* modal body */}
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Feedback <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                value={reviewForm.mentorFeedback}
                onChange={e => setReviewForm(f => ({ ...f, mentorFeedback: e.target.value }))}
                placeholder="Share your experience with this student — e.g. engagement, preparation, follow-through…"
                rows={5}
                style={{ width: '100%', resize: 'vertical', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none' }}
              />

              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{ marginTop: 16, width: '100%', padding: '13px 0', background: submitting ? '#C7D2FE' : 'var(--grad)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: !submitting ? 'var(--shadow-brand)' : 'none', transition: 'all .2s' }}>
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
                <svg viewBox="0 0 24 24" fill="none" width="12" height="12" style={{ verticalAlign: 'middle', marginRight: 4 }}><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Feedback is only visible to the admin team — never to the student.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   SET AVAILABILITY
═══════════════════════════════════════════════════════ */
function SetAvailability() {
  const mentorId = getLoggedInUserId();
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [viewYear,  setViewYear]  = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [selDay,    setSelDay]    = useState(null);
  const [avail,     setAvail]     = useState({});
  const [fromTime,  setFromTime]  = useState('9:00 AM');
  const [toTime,    setToTime]    = useState('9:30 AM');
  const [rangeErr,  setRangeErr]  = useState('');
  const [savedKey,  setSavedKey]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [isDirty,   setIsDirty]   = useState(false);

  const fetchSlots = () => {
    if (!mentorId) return;
    httpService.get(`/mentorAvailability?mentorId=${mentorId}`, { token: true })
      .then(res => {
        const entries = Array.isArray(res?.data) ? res.data : [];
        if (entries.length === 0) return;
        const loaded = {};
        entries.forEach(entry => {
          if (!entry?.date) return;
          const key = apiDateToKey(entry.date);
          const slots = Array.isArray(entry.slots) ? entry.slots : [];
          loaded[key] = slots.map(s => ({ from: parseApiTime(s.startTime), to: parseApiTime(s.endTime) }));
        });
        /* merge into existing state so locally-added (unsaved) slots aren't lost */
        setAvail(prev => ({ ...prev, ...loaded }));
      }).catch(() => {});
  };

  useEffect(() => { fetchSlots(); }, []); // eslint-disable-line

  const calGrid = useMemo(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const offset   = (firstDow + 6) % 7;
    const days     = new Date(viewYear, viewMonth + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [viewYear, viewMonth]);

  const validToOptions = useMemo(() => {
    const fromM = toMins(fromTime);
    return TIME_OPTIONS.filter(o => { const diff = toMins(o.value) - fromM; return diff === 30 || diff === 60; });
  }, [fromTime]);

  const selKey      = selDay ? dateKey(selDay.y, selDay.m, selDay.d) : null;
  const selSlots    = selKey ? (avail[selKey] ?? []) : [];
  const isPast      = (d) => new Date(viewYear, viewMonth, d) < today;
  const isToday     = (d) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSel       = (d) => selDay?.d === d && selDay?.m === viewMonth && selDay?.y === viewYear;
  const hasSlot     = (d) => (avail[dateKey(viewYear, viewMonth, d)] ?? []).length > 0;
  const prevMonth   = () => viewMonth === 0  ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1);
  const nextMonth   = () => viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0))  : setViewMonth(m => m + 1);
  const selectDay   = (d) => { if (isPast(d)) return; setSelDay({ y: viewYear, m: viewMonth, d }); setRangeErr(''); };

  const addSlot = () => {
    if (!selKey) return;
    const fromM = toMins(fromTime);
    const toM   = toMins(toTime);
    const dur   = toM - fromM;
    if (dur < 30) { setRangeErr('Minimum slot duration is 30 minutes.'); return; }
    if (dur > 60) { setRangeErr('Maximum slot duration is 1 hour.'); return; }
    const cur = avail[selKey] ?? [];
    const overlaps = cur.some(s => { const sf = toMins(s.from); const st = toMins(s.to); return fromM < st && sf < toM; });
    if (overlaps) { setRangeErr('This time overlaps with an existing slot on this date.'); return; }
    setRangeErr(''); setSavedKey(null);
    setAvail(prev => ({ ...prev, [selKey]: [...(prev[selKey] ?? []), { from: fromTime, to: toTime }] }));
  };

  const removeSlot = (idx) => { setSavedKey(null); setAvail(prev => ({ ...prev, [selKey]: (prev[selKey] ?? []).filter((_, i) => i !== idx) })); };

  const handleSaveDate = async () => {
    if (!selKey || selSlots.length === 0) return;
    setSaving(true);
    try {
      const payload = { mentorId, date: keyToApiDate(selKey), slots: selSlots.map(s => ({ startTime: fmtTime(s.from), endTime: fmtTime(s.to) })) };
      await httpService.post('/mentorAvailability', { data: payload, token: true });
      toast.success('Availability saved successfully!');
      setSavedKey(selKey);
      fetchSlots();
    } catch {
      toast.error('Failed to save availability. Please try again.');
    }
    finally { setSaving(false); }
  };

  const summary = useMemo(() =>
    Object.entries(avail).filter(([, arr]) => arr.length > 0)
      .filter(([key]) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m, d) >= today; })
      .map(([key, arr]) => { const [y, m, d] = key.split('-').map(Number); const dt = new Date(y, m, d); return { key, label: `${DOW_SHORT[dt.getDay()]}, ${d} ${MON_SHORT[m]}`, slots: arr }; })
      .sort((a, b) => a.key.localeCompare(b.key)),
  [avail, today]);

  const totalSlots  = summary.reduce((n, e) => n + e.slots.length, 0);
  const cellClass   = (d) => {
    if (d === null) return 'avail-day-cell is-empty';
    let c = 'avail-day-cell';
    if (isPast(d)) return c;
    if (isToday(d)) c += ' is-today';
    if (isSel(d))   c += ' is-sel';
    if (hasSlot(d)) c += ' has-slot';
    return c;
  };
  const selDateLabel = selDay ? `${DOW_SHORT[new Date(selDay.y, selDay.m, selDay.d).getDay()]}, ${selDay.d} ${MON_SHORT[selDay.m]} ${selDay.y}` : '';

  return (
    <div>
      <div className="db-section-head">
        <h2>Set Availability</h2>
        <p>Pick a date on the calendar, then define your available time window.</p>
      </div>
      <div className="avail-cal-layout">
        <div className="avail-cal-card">
          <div className="avail-cal-head">
            <button className="avail-cal-nav-btn" onClick={prevMonth}><ChevLeft /></button>
            <span className="acm-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button className="avail-cal-nav-btn" onClick={nextMonth}><ChevRight /></button>
          </div>
          <div className="avail-cal-body">
            <div className="avail-dow-hdr">{DOW_COL.map(d => <span key={d}>{d}</span>)}</div>
            <div className="avail-days-grid">
              {calGrid.map((d, i) => d === null
                ? <div key={`e-${i}`} className="avail-day-cell is-empty" />
                : <button key={d} className={cellClass(d)} disabled={isPast(d)} onClick={() => selectDay(d)}>{d}</button>
              )}
            </div>
          </div>
          <div className="avail-cal-legend">
            <span><span style={{ width:8,height:8,borderRadius:'50%',background:'var(--emerald)',display:'inline-block' }} /> Has slots</span>
            <span><span style={{ width:14,height:14,borderRadius:5,background:'var(--grad)',display:'inline-block' }} /> Selected</span>
          </div>
        </div>

        <div className="avail-time-panel">
          {!selDay ? (
            <div className="avail-empty-hint">
              <div className="aeh-emoji">📅</div>
              <h4>No date selected</h4>
              <p>Click any date on the calendar to set your available hours for that day.</p>
            </div>
          ) : (
            <>
              <div className="avail-panel-date">{selDateLabel}</div>
              <div className="avail-panel-sub">Define one or more time windows when you're available</div>
              <div className="avail-range-row">
                <div className="avail-range-field">
                  <label>From</label>
                  <select className="avail-range-sel" value={fromTime} onChange={e => {
                    const nf = e.target.value; setFromTime(nf); setRangeErr('');
                    const fm = toMins(nf); const diff = toMins(toTime) - fm;
                    if (diff !== 30 && diff !== 60) {
                      const t30 = TIME_OPTIONS.find(o => toMins(o.value) === fm + 30);
                      setToTime(t30?.value ?? TIME_OPTIONS.find(o => toMins(o.value) === fm + 60)?.value ?? toTime);
                    }
                  }}>
                    {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="avail-range-dash">—</div>
                <div className="avail-range-field">
                  <label>To</label>
                  <select className="avail-range-sel" value={toTime} onChange={e => { setToTime(e.target.value); setRangeErr(''); }}>
                    {validToOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary btn-sm avail-add-btn" onClick={addSlot}>+ Add slot</button>
              </div>
              {rangeErr && <div className="avail-range-err">{rangeErr}</div>}
              {selSlots.length > 0 ? (
                <div className="avail-added-list">
                  {selSlots.map((s, i) => (
                    <div key={i} className="avail-added-item">
                      <div className="avail-added-icon"><Clock width={15} height={15} /></div>
                      <div className="avail-added-label">{fmtTime(s.from)} – {fmtTime(s.to)}</div>
                      <button className="avail-rm" onClick={() => removeSlot(i)}><RemoveIcon /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="avail-no-slots">No time slots added yet — add a window above.</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveDate} disabled={selSlots.length === 0 || saving}>
                  {saving ? 'Saving…' : savedKey === selKey ? <><Check width={13} height={13} /> Saved</> : 'Save this date'}
                </button>
                {savedKey === selKey && <span className="avail-saved-msg"><Check width={13} height={13} />Saved successfully</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {summary.length > 0 && (
        <div className="avail-summary">
          <div className="avail-summary-hd">Configured availability — {totalSlots} slot{totalSlots !== 1 ? 's' : ''} across {summary.length} date{summary.length !== 1 ? 's' : ''}</div>
          {summary.map(e => (
            <div key={e.key} className="avail-summary-row">
              <div className="avail-summary-date">{e.label}</div>
              <div className="avail-summary-chips">
                {e.slots.map((s, i) => <span key={i} className="avail-summary-chip">{fmtTime(s.from)} – {fmtTime(s.to)}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MENTOR WEBINARS
═══════════════════════════════════════════════════════ */
function fmtWebinarDate(dateStr, timeStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dow  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()];
  const mon  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
  let timeLabel = '';
  if (timeStr) {
    const [hh, mm] = timeStr.split(':').map(Number);
    const ap  = hh < 12 ? 'AM' : 'PM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    timeLabel = ` · ${h12}:${mm === 0 ? '00' : mm} ${ap}`;
  }
  return `${dow}, ${d} ${mon} ${y}${timeLabel}`;
}

const WB_STATUS_BADGE = {
  upcoming:  { cls: 'upcoming',  label: 'Upcoming'  },
  live:      { cls: 'upcoming',  label: 'Live'       },
  completed: { cls: 'completed', label: 'Completed'  },
  cancelled: { cls: 'cancelled', label: 'Cancelled'  },
};
const WB_PAY_BADGE = {
  true:  { cls: 'completed', label: 'Paid'    },
  false: { cls: 'cancelled', label: 'Unpaid'  },
};

function WebinarCard({ reg }) {
  const wb = reg.Webinar || {};
  const statusBadge  = WB_STATUS_BADGE[wb.status] || { cls: 'cancelled', label: wb.status || '—' };
  const payBadge     = WB_PAY_BADGE[String(reg.paymentStatus)];

  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* top row: title + badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', lineHeight: 1.3 }}>{wb.title || '—'}</div>
          {wb.description && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>{wb.description}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
          <span className={`sess-badge ${statusBadge.cls}`}><i />{statusBadge.label}</span>
          <span className={`sess-badge ${payBadge.cls}`}><i />{payBadge.label}</span>
        </div>
      </div>

      {/* meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          {wb.presenter}
        </span>
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          {fmtWebinarDate(wb.date, wb.time)}
        </span>
        {wb.duration && (
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            {wb.duration} min
          </span>
        )}
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          {wb.isFree ? 'Free' : `₹${wb.price}`}
        </span>
      </div>

      {/* join link */}
      {wb.link && (wb.status === 'upcoming' || wb.status === 'live') && (
        <div>
          <a
            href={wb.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" width={13} height={13} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            {wb.status === 'live' ? 'Join Now' : 'View Link'}
          </a>
        </div>
      )}
    </div>
  );
}

function MentorWebinars({ userId }) {
  const [regs,       setRegs]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const fetchPage = async (pg) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await httpService.get(
        `/webinar/my-registrations/${userId}`,
        { params: { page: pg, limit: LIMIT }, token: true }
      );
      setRegs(res?.registrations ?? []);
      setTotalPages(res?.totalPages ?? 1);
      setPage(pg);
    } catch { setRegs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPage(1); }, [userId]); // eslint-disable-line

  return (
    <div>
      <div className="db-section-head">
        <h2>My Webinars</h2>
        <p>All webinars you have registered for</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
      )}

      {!loading && regs.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
          No webinar registrations found.
        </div>
      )}

      {!loading && regs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {regs.map(reg => <WebinarCard key={reg.id} reg={reg} />)}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page <= 1 || loading}
            onClick={() => fetchPage(page - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ChevLeft /> Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
            <button
              key={pg}
              onClick={() => fetchPage(pg)}
              disabled={loading}
              style={{
                width: 34, height: 34, borderRadius: 8,
                border: pg === page ? '2px solid var(--indigo,#4F46E5)' : '1.5px solid var(--border,#e2e8f0)',
                background: pg === page ? 'var(--indigo,#4F46E5)' : 'var(--surface,#fff)',
                color: pg === page ? '#fff' : 'var(--ink)',
                fontWeight: pg === page ? 700 : 400,
                fontSize: 13, cursor: loading ? 'default' : 'pointer',
              }}
            >
              {pg}
            </button>
          ))}

          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= totalPages || loading}
            onClick={() => fetchPage(page + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            Next <ChevRight />
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EARNINGS
═══════════════════════════════════════════════════════ */
function Earnings() {
  const payouts = [
    { name: 'Kavya M.',   topic: 'Resume review',      when: 'Thu, 05 Jun', amount: '₹599',   status: 'Paid'    },
    { name: 'Preethi S.', topic: 'DSA prep session',   when: 'Mon, 02 Jun', amount: '₹1,199', status: 'Paid'    },
    { name: 'Neha J.',    topic: 'Placement strategy',  when: 'Mon, 26 May', amount: '₹599',   status: 'Paid'    },
    { name: 'Rohan D.',   topic: 'Interview prep',      when: 'Sat, 14 Jun', amount: '₹1,199', status: 'Pending' },
    { name: 'Tanvi A.',   topic: 'Career guidance',     when: 'Sun, 15 Jun', amount: '₹599',   status: 'Pending' },
  ];
  return (
    <div>
      <div className="db-section-head"><h2>Earnings</h2><p>Track your session revenue and payout history</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 24 }}>
        {[{ v: '₹18,400', l: 'This month' },{ v: '₹2,397', l: 'Pending payout' },{ v: '296', l: 'Total sessions' },{ v: '₹1,24,800', l: 'All time' }].map(k => (
          <div className="card" key={k.l} style={{ padding: 18 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--indigo)' }}>{k.v}</div>
            <div style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 4 }}>{k.l}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 12 }}>Recent transactions</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {payouts.map((p, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{p.topic} · {p.when}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>{p.amount}</div>
            <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: p.status === 'Paid' ? 'var(--emerald-soft)' : 'var(--amber-soft)', color: p.status === 'Paid' ? 'var(--emerald)' : '#B45309' }}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function MentorDashboard() {
  const [section,      setSection]      = useState('overview');
  const [myProfile,    setMyProfile]    = useState(null);
  const [showPopup,    setShowPopup]    = useState(false);
  const popupShownRef  = useRef(false);

  /* sidebar counts */
  const [webinarCount,     setWebinarCount]     = useState(0);
  const [ticketCount,      setTicketCount]      = useState(0);
  const [sessionCount,     setSessionCount]     = useState(0);
  const [availCount,       setAvailCount]       = useState(0);
  /* overview */
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  /* kpi */
  const [sessionsDone,     setSessionsDone]     = useState(0);

  /* fetch mentor profile on mount */
  useEffect(() => {
    const userId = getLoggedInUserId();
    if (!userId) return;

    httpService
      .get('/mentorProfile', { params: { page: 1, limit: 50 }, token: true })
      .then(res => {
        const all    = res?.rows ?? [];
        const found  = all.find(m => m.authUserId === userId);
        if (!found) return;
        setMyProfile(found);

        /* show popup once if not verified and profile is incomplete */
        if (!found.isVerified && calcCompletion(found) < 80 && !popupShownRef.current) {
          popupShownRef.current = true;
          setShowPopup(true);
        }
      })
      .catch(() => {});

    /* Webinars — count only this mentor's registrations */
    httpService.get(`/webinar/my-registrations/${userId}`, { params: { page: 1, limit: 200 }, token: true })
      .then(res => {
        const rows = Array.isArray(res?.registrations) ? res.registrations : [];
        const total = res?.total ?? res?.totalCount ?? (res?.totalPages ? res.totalPages * 200 : rows.length);
        setWebinarCount(rows.length > 0 ? total : rows.length);
      }).catch(() => {});

    /* Sessions — total count + upcoming for overview */
    httpService.get(`/mentorSession/mentor/${userId}`, { params: { page: 1, limit: 20, paymentStatus: 'done' }, token: true })
      .then(res => {
        const rows  = Array.isArray(res?.data) ? res.data : [];
        const total = res?.pagination?.total ?? res?.pagination?.totalPages ?? rows.length;
        setSessionCount(total);
        const done     = rows.filter(s => s.isSessionDone).length;
        setSessionsDone(done);
        const upcoming = rows.filter(s => s.paymentStatus === 'done' && !s.isSessionDone);
        setUpcomingSessions(upcoming.slice(0, 3));
      }).catch(() => {});

    /* Availability — count future dates (>= today) that have slots set */
    httpService.get(`/mentorAvailability?mentorId=${userId}`, { token: true })
      .then(res => {
        const entries = Array.isArray(res?.data) ? res.data : [];
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        setAvailCount(entries.filter(e => {
          if (!e.date || !Array.isArray(e.slots) || e.slots.length === 0) return false;
          return new Date(e.date) >= todayStart;
        }).length);
      }).catch(() => {});

    /* Support Tickets */
    httpService.get('/supportTicket', { params: { activeOnly: true, userId, limit: 200 }, token: true })
      .then(res => {
        const rows = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setTicketCount(rows.length);
      }).catch(() => {});
  }, []); // eslint-disable-line

  /* called after profile save — re-fetch to update */
  const refreshProfile = () => {
    const userId = getLoggedInUserId();
    if (!userId) return;
    httpService
      .get('/mentorProfile', { params: { page: 1, limit: 50 }, token: true })
      .then(res => {
        const all   = res?.rows ?? [];
        const found = all.find(m => m.authUserId === userId);
        if (found) setMyProfile(found);
      })
      .catch(() => {});
  };

  return (
    <>
      {/* Profile complete popup */}
      {showPopup && myProfile && (
        <ProfilePopup
          pct={calcCompletion(myProfile)}
          onComplete={() => { setShowPopup(false); setSection('profile'); }}
          onDismiss={() => setShowPopup(false)}
        />
      )}

      <DashboardShell
        subtitle="Mentor Dashboard"
        title="Your mentoring hub"
        kpis={[
          { v: sessionCount > 0 ? sessionCount : '0', l: 'Sessions booked'  },
          { v: sessionsDone > 0 ? sessionsDone : '0', l: 'Sessions done'    },
          { v: availCount   > 0 ? availCount   : '0', l: 'Available dates'  },
          { v: myProfile ? `${calcCompletion(myProfile)}%` : '…', l: 'Profile complete' },
        ]}
        navItems={NAV.map(item => {
          if (item.divider) return item;
          if (item.id === 'webinars')     return { ...item, count: webinarCount };
          if (item.id === 'support')      return { ...item, count: ticketCount };
          if (item.id === 'sessions')     return { ...item, count: sessionCount };
          if (item.id === 'availability') return { ...item, count: availCount };
          return item;
        })}
        activeSection={section}
        onSectionChange={setSection}
      >
        {section === 'overview' && (
          <div>
            <h2 className="section-title" style={{ fontSize: 22, marginBottom: 16 }}>Upcoming bookings</h2>
            {upcomingSessions.length === 0 ? (
              <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                No upcoming sessions scheduled.
                <button className="btn btn-soft btn-sm" style={{ marginLeft: 10 }} onClick={() => setSection('sessions')}>
                  View all sessions
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcomingSessions.map((s, i) => {
                  const studentName = s.userName || s.studentName || s.name || 'Student';
                  const when = [s.date, s.time].filter(Boolean).join(' · ');
                  return (
                    <div className="card db-card-row" key={i}>
                      <div className="m-av" style={{ background: sessNameColor(studentName), width: 46, height: 46 }}>
                        {sessInitials(studentName)}
                      </div>
                      <div className="db-card-body">
                        <div className="m-name">{studentName}</div>
                        <div className="m-role">{s.description || 'Session'}</div>
                      </div>
                      <div className="db-card-end">
                        <div className="db-card-when">{when || '—'}</div>
                        <a href="#" className="btn btn-soft btn-sm">Start call</a>
                      </div>
                    </div>
                  );
                })}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                  onClick={() => setSection('sessions')}
                >
                  View all sessions →
                </button>
              </div>
            )}
          </div>
        )}

        {section === 'sessions' && (
          <div>
            <div className="db-section-head"><h2>All Sessions</h2><p>View and manage all your student sessions</p></div>
            <SessionList authUserId={myProfile?.authUserId} />
          </div>
        )}

        {section === 'availability' && <SetAvailability />}

        {section === 'webinars' && (
          <MentorWebinars userId={myProfile?.authUserId} />
        )}

        {section === 'earnings' && <Earnings />}

        {section === 'profile' && (
          <ProfileSection
            profile={myProfile}
            onSaved={refreshProfile}
          />
        )}

        {section === 'support' && (
          <SupportTicketsView
            userId={myProfile?.authUserId}
            userProfile={{
              name:  [myProfile?.firstName, myProfile?.lastName].filter(Boolean).join(' '),
              email: myProfile?.email        || '',
              phone: myProfile?.contactNumber || '',
            }}
          />
        )}
      </DashboardShell>
    </>
  );
}
