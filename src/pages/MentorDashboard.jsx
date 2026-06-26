import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import DashboardShell from '../components/DashboardShell.jsx';
import { Calendar, Clock, Card, Check, Person } from '../components/Icons.jsx';
import httpService from '../utils/apiService.tsx';
import SupportTicketsView from '../components/SupportTicketsView.jsx';

/* fire-and-forget mail helper — non-fatal */
async function sendMail(to, subject, html) {
  try {
    const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
    if (!recipients.length) return;
    await httpService.post('/contactUs/send-mail', {
      data: { to: recipients, subject, html },
      token: true,
    });
  } catch { /* non-fatal */ }
}

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

const industry=
[
  { "id": 1, "name": "Information Technology" },
  { "id": 2, "name": "Software Development" },
  { "id": 3, "name": "Artificial Intelligence" },
  { "id": 4, "name": "Data Science" },
  { "id": 5, "name": "Cyber Security" },
  { "id": 6, "name": "Cloud Computing" },
  { "id": 7, "name": "Mechanical Engineering" },
  { "id": 8, "name": "Automobile" },
  { "id": 9, "name": "Electric Vehicles" },
  { "id": 10, "name": "Civil Engineering" },
  { "id": 11, "name": "Electrical Engineering" },
  { "id": 12, "name": "Electronics & Telecommunication" },
  { "id": 13, "name": "Chemical Engineering" },
  { "id": 14, "name": "Manufacturing" },
  { "id": 15, "name": "Industrial Engineering" },
  { "id": 16, "name": "Robotics & Automation" },
  { "id": 17, "name": "Aerospace" },
  { "id": 18, "name": "Defense" },
  { "id": 19, "name": "Banking" },
  { "id": 20, "name": "Finance" },
  { "id": 21, "name": "Insurance" },
  { "id": 22, "name": "Accounting" },
  { "id": 23, "name": "Investment & Stock Market" },
  { "id": 24, "name": "Sales" },
  { "id": 25, "name": "Marketing" },
  { "id": 26, "name": "Digital Marketing" },
  { "id": 27, "name": "Advertising" },
  { "id": 28, "name": "Human Resources" },
  { "id": 29, "name": "Recruitment" },
  { "id": 30, "name": "Healthcare" },
  { "id": 31, "name": "Medical" },
  { "id": 32, "name": "Pharmaceutical" },
  { "id": 33, "name": "Biotechnology" },
  { "id": 34, "name": "Education" },
  { "id": 35, "name": "EdTech" },
  { "id": 36, "name": "Research & Development" },
  { "id": 37, "name": "Logistics" },
  { "id": 38, "name": "Supply Chain" },
  { "id": 39, "name": "Warehousing" },
  { "id": 40, "name": "Retail" },
  { "id": 41, "name": "E-Commerce" },
  { "id": 42, "name": "Hospitality" },
  { "id": 43, "name": "Tourism" },
  { "id": 44, "name": "Food & Beverage" },
  { "id": 45, "name": "Real Estate" },
  { "id": 46, "name": "Construction" },
  { "id": 47, "name": "Architecture" },
  { "id": 48, "name": "Media" },
  { "id": 49, "name": "Entertainment" },
  { "id": 50, "name": "Film & Television" },
  { "id": 51, "name": "Graphic Design" },
  { "id": 52, "name": "Animation" },
  { "id": 53, "name": "Gaming" },
  { "id": 54, "name": "Content Creation" },
  { "id": 55, "name": "Journalism" },
  { "id": 56, "name": "Legal" },
  { "id": 57, "name": "Compliance" },
  { "id": 58, "name": "Government Services" },
  { "id": 59, "name": "Public Administration" },
  { "id": 60, "name": "Agriculture" },
  { "id": 61, "name": "AgriTech" },
  { "id": 62, "name": "Renewable Energy" },
  { "id": 63, "name": "Oil & Gas" },
  { "id": 64, "name": "Mining" },
  { "id": 65, "name": "Environmental Science" },
  { "id": 66, "name": "Telecommunications" },
  { "id": 67, "name": "Blockchain" },
  { "id": 68, "name": "Web3" },
  { "id": 69, "name": "Consulting" },
  { "id": 70, "name": "Business Management" },
  { "id": 71, "name": "Operations Management" },
  { "id": 72, "name": "Quality Assurance" },
  { "id": 73, "name": "Procurement" },
  { "id": 74, "name": "Non-Profit & NGO" },
  { "id": 75, "name": "Sports & Fitness" },
  { "id": 76, "name": "Fashion & Apparel" },
  { "id": 77, "name": "Beauty & Wellness" }
]
 
const help_for =
[
  { "id": 1, "name": "Career Guidance" },
  { "id": 2, "name": "Higher Studies" },
  { "id": 3, "name": "College Admission" },
  { "id": 4, "name": "Resume Review" },
  { "id": 5, "name": "Interview Preparation" },
  { "id": 6, "name": "Job Search" },
  { "id": 7, "name": "Skill Development" },
  { "id": 8, "name": "Certification Guidance" },
  { "id": 9, "name": "Study Abroad" },
  { "id": 10, "name": "Scholarship Guidance" },
  { "id": 11, "name": "Government Exam Preparation" },
  { "id": 12, "name": "Startup Guidance" },
  { "id": 13, "name": "Business Growth" },
  { "id": 14, "name": "Personal Branding" },
  { "id": 15, "name": "LinkedIn Profile Review" },
  { "id": 16, "name": "Mock Interview" },
  { "id": 17, "name": "Career Switch" },
  { "id": 18, "name": "Leadership Development" },
  { "id": 19, "name": "Entrepreneurship" },
  { "id": 20, "name": "Industry Insights" }
]
const Language =[
  { "id": 1, "name": "English" },
  { "id": 2, "name": "Hindi" },
  { "id": 3, "name": "Marathi" },
  { "id": 4, "name": "Gujarati" },
  { "id": 5, "name": "Punjabi" },
  { "id": 6, "name": "Bengali" },
  { "id": 7, "name": "Tamil" },
  { "id": 8, "name": "Telugu" },
  { "id": 9, "name": "Kannada" },
  { "id": 10, "name": "Malayalam" }
]

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
    !!p.industry,
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
  if (s.isSessionCancelled)                            return 'cancelled';
  if (s.paymentStatus === 'done' && !s.isSessionDone) return 'upcoming';
  if (s.paymentStatus === 'done' &&  s.isSessionDone) return 'completed';
  if (s.paymentStatus === 'pending')                  return 'pending';
  return 'failed';
}
const SESS_BADGE = {
  upcoming:  { cls: 'upcoming',  label: 'Upcoming'  },
  completed: { cls: 'completed', label: 'Completed' },
  pending:   { cls: 'cancelled', label: 'Pending'   },
  cancelled: { cls: 'cancelled', label: 'Cancelled' },
  failed:    { cls: 'cancelled', label: 'Failed'    },
};
function sessApiParam(filter) {
  if (filter === 'upcoming' || filter === 'completed') return 'done';
  if (filter === 'all' || filter === 'cancelled') return null;
  return filter;
}
function sessClientMatch(s, filter) {
  if (filter === 'upcoming')  return !s.isSessionCancelled && !s.isSessionDone;
  if (filter === 'completed') return !s.isSessionCancelled &&  s.isSessionDone;
  if (filter === 'cancelled') return  !!s.isSessionCancelled;
  return true;
}
const SESS_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'pending',   label: 'Pending'   },
  { key: 'cancelled', label: 'Cancelled' },
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

const PayoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M15 9H10.5a2.5 2.5 0 000 5h3a2.5 2.5 0 010 5H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const NAV = [
  { id: 'overview',     label: 'Overview',        icon: <HomeIcon /> },
  { id: 'profile',      label: 'Profile',          icon: <Person />   },
  { divider: true },
  { id: 'sessions',     label: 'Sessions',         icon: <Calendar /> },
  { id: 'availability', label: 'Availability', icon: <Clock />    },
  { id: 'webinars',     label: 'Webinars',         icon: <WebinarIcon /> },
  { id: 'earnings',     label: 'Earnings',         icon: <Card />        },
  { id: 'payout',      label: 'Payout',           icon: <PayoutIcon /> },
  { divider: true },
  { id: 'support',     label: 'Support Tickets',  icon: <TicketIcon /> },
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79,70,229,0.32)',
            position: 'relative',
          }}>
            <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
              <circle cx="12" cy="8" r="3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 20.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* verified badge */}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 22, height: 22, borderRadius: '50%',
              background: '#10B981', border: '2.5px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 10 10" fill="none" width="11" height="11">
                <path d="M2 5.2l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
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

/* ── Tag array input ── */
function TagInput({ label, value = [], onChange, placeholder, hint }) {
  const [input, setInput] = React.useState('');
  const inputRef = React.useRef(null);

  const add = () => {
    const trimmed = input.trim().replace(/,+$/, '');
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput('');
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    else if (e.key === 'Backspace' && !input && value.length > 0) remove(value.length - 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: '7px 10px', minHeight: 44, border: '1.5px solid var(--border,#e2e8f0)', borderRadius: 9, background: 'var(--surface,#fff)', cursor: 'text', transition: 'border-color .18s' }}
        onFocus={() => {}} >
        {value.map((tag, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EEF2FF', color: '#4F46E5', borderRadius: 99, padding: '3px 10px 3px 12px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            {tag}
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.replace(/,/g, ''))}
          onKeyDown={handleKey}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : '+ Add'}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'inherit', color: 'var(--ink)', flex: 1, minWidth: 100, padding: '2px 0' }}
        />
      </div>
      {hint && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{hint}</span>}
    </div>
  );
}

/* ── Datalist single-value field ── */
function DatalistField({ label, value, onChange, options, placeholder, hint, listId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        list={listId}
        style={{
          padding: '9px 12px', borderRadius: 9, fontSize: 14,
          border: '1.5px solid var(--border,#e2e8f0)', background: 'var(--surface,#fff)',
          color: 'var(--ink)', outline: 'none', fontFamily: 'inherit',
        }}
      />
      <datalist id={listId}>
        {options?.map(opt => <option key={opt.id} value={opt.name} /> )}
      </datalist>
      {hint && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{hint}</span>}
    </div>
  );
}

/* ── Select field — stores numeric ID, shows name ── */
function SelectField({ label, value, onChange, options = [], placeholder, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
        style={{
          padding: '9px 12px', borderRadius: 9, fontSize: 14,
          border: '1.5px solid var(--border,#e2e8f0)', background: 'var(--surface,#fff)',
          color: value ? 'var(--ink)' : 'var(--ink-3)', outline: 'none', fontFamily: 'inherit',
          appearance: 'auto',
        }}
      >
        <option value="">{placeholder || '— Select —'}</option>
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
      </select>
      {hint && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{hint}</span>}
    </div>
  );
}

/* ── Datalist tag-array input ── */
function DatalistTagInput({ label, value = [], onChange, options, placeholder, hint, listId }) {
  const [input, setInput] = React.useState('');
  const inputRef = React.useRef(null);

  const add = (val) => {
    const trimmed = (val !== undefined ? val : input).trim().replace(/,+$/, '');
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput('');
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    else if (e.key === 'Backspace' && !input && value.length > 0) remove(value.length - 1);
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/,/g, '');
    const matched = options.find(o => o.name === val);
    if (matched && !value.includes(matched.name)) {
      onChange([...value, matched.name]);
      setInput('');
    } else {
      setInput(val);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      <datalist id={listId}>
        {options.filter(o => !value.includes(o.name)).map(opt => <option key={opt.id} value={opt.name} />)}
      </datalist>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: '7px 10px', minHeight: 44, border: '1.5px solid var(--border,#e2e8f0)', borderRadius: 9, background: 'var(--surface,#fff)', cursor: 'text' }}>
        {value.map((tag, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EEF2FF', color: '#4F46E5', borderRadius: 99, padding: '3px 10px 3px 12px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            {tag}
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          list={listId}
          onChange={handleChange}
          onKeyDown={handleKey}
          onBlur={() => add()}
          placeholder={value.length === 0 ? placeholder : '+ Add'}
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: 'inherit', color: 'var(--ink)', flex: 1, minWidth: 100, padding: '2px 0' }}
        />
      </div>
      {hint && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{hint}</span>}
    </div>
  );
}

/* ── Inline avatar uploader (used in status bar) ── */
function AvatarUpload({ value, onChange }) {
  const [uploading, setUploading] = React.useState(false);
  const [hovered,   setHovered]   = React.useState(false);
  const inputRef   = React.useRef(null);
  const localUrlRef = React.useRef(null);

  /* Recursively search any nested object for a property name */
  const deepGet = (obj, prop, depth = 0) => {
    if (depth > 5 || obj === null || typeof obj !== 'object') return undefined;
    if (Array.isArray(obj)) {
      for (const item of obj) { const f = deepGet(item, prop, depth + 1); if (f) return f; }
      return undefined;
    }
    if (prop in obj && obj[prop]) return obj[prop];
    for (const val of Object.values(obj)) { const f = deepGet(val, prop, depth + 1); if (f) return f; }
    return undefined;
  };

  const extractUrlKey = (res) => {
    console.log('[upload/image response]', res);
    const url = res?.url
      ?? res?.data?.url
      ?? res?.data?.[0]?.url
      ?? res?.[0]?.url
      ?? res?.files?.[0]?.url
      ?? res?.images?.[0]?.url
      ?? res?.result?.url
      ?? res?.location
      ?? res?.fileUrl
      ?? res?.imageUrl
      ?? deepGet(res, 'url')
      ?? '';
    const key = res?.key
      ?? res?.data?.key
      ?? res?.data?.[0]?.key
      ?? res?.[0]?.key
      ?? res?.files?.[0]?.key
      ?? res?.images?.[0]?.key
      ?? res?.result?.key
      ?? deepGet(res, 'key')
      ?? '';
    console.log('[upload/image extracted]', { url, key });
    return { url, key };
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB.'); return; }

    /* show local preview immediately — this is only for display, never sent to API */
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    localUrlRef.current = localPreview;
    onChange({ url: localPreview, key: '' });

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await httpService.postFormData('/upload/image', fd, { token: true });
      const { url, key } = extractUrlKey(res);
      /* Always revoke the blob — either replace with real URL or revert to previous */
      URL.revokeObjectURL(localPreview);
      localUrlRef.current = null;
      if (url) {
        onChange({ url, key });
        toast.success('Photo updated!');
      } else {
        /* Revert avatar; blob must not reach form state */
        onChange(value ?? { url: '', key: '' });
        toast.error('Upload succeeded but could not read image URL — check console.');
      }
    } catch {
      onChange(value ?? { url: '', key: '' });
      if (localUrlRef.current) { URL.revokeObjectURL(localUrlRef.current); localUrlRef.current = null; }
      toast.error('Upload failed. Please try again.');
    }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={handleFile} style={{ display: 'none' }} />

      {/* Avatar circle */}
      <div onClick={() => !uploading && inputRef.current?.click()}
        style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', cursor: uploading ? 'not-allowed' : 'pointer', border: '2.5px solid var(--border,#e2e8f0)', background: 'var(--surface-2,#f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .18s', ...(hovered && !uploading ? { borderColor: '#4F46E5' } : {}) }}>
        {value?.url
          ? <img src={value.url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <svg viewBox="0 0 24 24" fill="none" width="30" height="30" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        }
      </div>

      {/* Camera overlay on hover / spinner on upload */}
      <div onClick={() => !uploading && inputRef.current?.click()}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'not-allowed' : 'pointer', background: uploading || hovered ? 'rgba(0,0,0,0.45)' : 'transparent', transition: 'background .18s', gap: 2 }}>
        {uploading ? (
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.4)" strokeWidth="2"/><path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>
        ) : hovered ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '.03em' }}>PHOTO</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROFILE SECTION
═══════════════════════════════════════════════════════ */
function ProfileSection({ profile, onSaved }) {
  const [form, setForm] = useState({
    password:         '',
    linkedInProfile:  profile?.linkedInProfile  || '',
    education:        profile?.education        || '',
    instituteName:    profile?.instituteName    || '',
    admissionYear:    profile?.admissionYear    || '',
    universityId:     profile?.universityId    ? Number(profile.universityId) : '',
    streamId:         profile?.streamId        ? Number(profile.streamId)     : '',
    industry:         profile?.industry         || '',
    helpFor:          Array.isArray(profile?.help_for)
                        ? profile.help_for
                        : (profile?.help_for ? String(profile.help_for).split(',').map(s => s.trim()).filter(Boolean) : []),
    jobRole:          profile?.jobRole          || '',
    experience:       profile?.experience       ?? '',
    bio:              profile?.bio              || '',
    languageKnown:    Array.isArray(profile?.languageKnown)
                        ? profile.languageKnown
                        : (profile?.languageKnown ? profile.languageKnown.split(',').map(s => s.trim()).filter(Boolean) : []),
    chargePerSession: profile?.chargePerSession ?? '',
    photo:            typeof profile?.photo === 'string'
                        ? { url: profile.photo, key: '' }
                        : (profile?.photo?.url ? profile.photo : { url: '', key: '' }),
  });
  const [saving,  setSaving]  = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /* Sync form from profile on initial load and after every save+refresh.
     Strategy: if the API returned a real value → use it;
               if the API returned null/undefined → keep what the form already has.
     This prevents listing-endpoint gaps (photo, instituteName, etc.) from
     wiping out values the user has already set. */
  useEffect(() => {
    if (!profile) return;
    const resolvedPhoto =
      typeof profile.photo === 'string' && profile.photo
        ? { url: profile.photo, key: '' }
        : profile?.photo?.url
          ? profile.photo
          : null;

    setForm(prev => ({
      ...prev,
      linkedInProfile:  profile.linkedInProfile  != null ? profile.linkedInProfile  : prev.linkedInProfile,
      education:        profile.education        != null ? profile.education        : prev.education,
      instituteName:    profile.instituteName    != null ? profile.instituteName    : prev.instituteName,
      admissionYear:    profile.admissionYear    != null ? profile.admissionYear    : prev.admissionYear,
      universityId:     profile.universityId     != null ? Number(profile.universityId) : prev.universityId,
      streamId:         profile.streamId         != null ? Number(profile.streamId)     : prev.streamId,
      industry:         profile.industry         != null ? profile.industry         : prev.industry,
      jobRole:          profile.jobRole          != null ? profile.jobRole          : prev.jobRole,
      experience:       profile.experience       != null ? profile.experience       : prev.experience,
      bio:              profile.bio              != null ? profile.bio              : prev.bio,
      chargePerSession: profile.chargePerSession != null ? profile.chargePerSession : prev.chargePerSession,
      languageKnown:    Array.isArray(profile.languageKnown) ? profile.languageKnown : prev.languageKnown,
      helpFor:          Array.isArray(profile.help_for)      ? profile.help_for      : prev.helpFor,
      photo:            resolvedPhoto ?? prev.photo,
    }));
  }, [profile?.updatedAt]); // eslint-disable-line

  /* use live form state so completion updates as user fills fields */
  const pct = calcCompletion({ ...profile, ...form });
  const pctColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#4F46E5';

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setIsDirty(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    try {
      /* Resolve photo: form photo (if valid CDN URL) → profile photo fallback → null */
      const resolvedPhoto =
        (form.photo?.url && !form.photo.url.startsWith('blob:'))
          ? form.photo
          : profile?.photo?.url
            ? profile.photo
            : typeof profile?.photo === 'string' && profile.photo
              ? { url: profile.photo, key: '' }
              : null;

      const payload = {
        linkedInProfile:  form.linkedInProfile  || profile?.linkedInProfile  || null,
        education:        form.education        || profile?.education        || null,
        instituteName:    form.instituteName    || profile?.instituteName    || null,
        admissionYear:    form.admissionYear    || profile?.admissionYear    || null,
        universityId:     form.universityId     ? Number(form.universityId)
                            : profile?.universityId ? Number(profile.universityId) : null,
        streamId:         form.streamId         ? Number(form.streamId)
                            : profile?.streamId ? Number(profile.streamId)     : null,
        industry:         form.industry         || profile?.industry         || null,
        help_for:         form.helpFor.length   ? form.helpFor
                            : (Array.isArray(profile?.help_for) ? profile.help_for : []),
        jobRole:          form.jobRole          || profile?.jobRole          || null,
        experience:       form.experience !== '' ? Number(form.experience)
                            : profile?.experience ?? null,
        bio:              form.bio              || profile?.bio              || null,
        languageKnown:    form.languageKnown.length ? form.languageKnown
                            : (Array.isArray(profile?.languageKnown) ? profile.languageKnown : []),
        chargePerSession: form.chargePerSession !== '' ? Number(form.chargePerSession)
                            : profile?.chargePerSession ?? null,
        type:             'mentor',
      };
      /* Only include photo when we have a real CDN URL.
         Sending photo:null explicitly overwrites the stored photo on the server. */
      if (resolvedPhoto?.url && !resolvedPhoto.url.startsWith('blob:')) {
        payload.photo = resolvedPhoto;
      }
      if (form.password) payload.password = form.password;

      await httpService.put(`/mentorProfile/${profile.id}`, { data: payload, token: true });
      toast.success('Profile updated successfully!');
      setIsDirty(false);
      onSaved?.();
    } catch { /* apiService shows toast */ }
    finally { setSaving(false); }
  };
const [Universitylist ,setuniversitylist]=useState()
const [Streamlist ,setstreamlist]=useState()

const fetchStreamlist=async()=>{
  try{
    const res=  await httpService.get(`/stream`,{token:true})
    setstreamlist(res?.data)
  }
  catch(err){
    // console.log(err)
  }
}
const fetchUniversitylist=async()=>{
  try{
    const res=  await httpService.get(`/universities`,{token:true})
     setuniversitylist(res?.rows)
  }
  catch(err){
    // console.log(err)
  }
}


useEffect(()=>{
fetchStreamlist()
fetchUniversitylist()
},[])


const streamOption     = (Streamlist     || []).map(item => ({ id: item.id, name: item.name }))
const UniversityOption = (Universitylist || []).map(item => ({ id: item.id, name: item.name }))
 
return (
    <div>
      <div className="db-section-head">
        <h2>My Profile</h2>
        <p>Update your profile to attract more students and get verified.</p>
      </div>

      {/* ── Status bar: avatar + completion + badge ── */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>

        {/* Avatar upload — left corner */}
        <AvatarUpload
          value={form.photo}
          onChange={(photo) => { setForm(f => ({ ...f, photo })); setIsDirty(true); }}
        />

        {/* Name + completion bar */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>
            {profile?.firstName || ''} {profile?.lastName || ''}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>
            {form.photo?.url ? 'Click photo to change' : 'Click photo to upload'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Profile completion</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: pctColor }}>{pct}%</span>
          </div>
          <div style={{ background: 'var(--border,#e2e8f0)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: pctColor, transition: 'width .4s ease' }} />
          </div>
        </div>

        {/* Verified badge */}
        <div>
          {profile?.isVerified
            ? <span style={{ fontSize: 12, fontWeight: 700, background: '#D1FAE5', color: '#065F46', padding: '5px 14px', borderRadius: 99 }}>✓ Verified</span>
            : <span style={{ fontSize: 12, fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '5px 14px', borderRadius: 99 }}>Pending verification</span>}
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
          <DatalistField
            label="Industry"
            value={form.industry}
            onChange={set('industry')}
            options={industry}
            listId="dl-industry"
            placeholder="e.g. Information Technology"
          />
          <Field label="Job role"               value={form.jobRole}           onChange={set('jobRole')}           placeholder="e.g. Software Engineer"  />
          <Field label="Experience (years)"     value={form.experience}        onChange={set('experience')}        type="number" placeholder="e.g. 5"    />
          <Field label="Charge per session (₹)" value={form.chargePerSession}  onChange={set('chargePerSession')}  type="number" placeholder="e.g. 499"  />
          <DatalistTagInput
            label="Help for"
            value={form.helpFor}
            onChange={(arr) => { setForm(f => ({ ...f, helpFor: arr })); setIsDirty(true); }}
            options={help_for}
            listId="dl-helpfor"
            placeholder="e.g. Career Guidance"
            hint="Select or type topics you can help with, press Enter to add."
          />
        </FormSection>

        {/* ── Education ── */}
        <FormSection title="Education" cols={2}>
          <Field label="Education"     value={form.education}     onChange={set('education')}     placeholder="e.g. B.Tech"           />
          <SelectField
            label="Stream"
            value={form.streamId}
            onChange={set('streamId')}
            options={streamOption}
            placeholder="— Select stream —"
          />
          <Field label="Institute name" value={form.instituteName} onChange={set('instituteName')} placeholder="e.g. IIT Bombay"        />
          <Field label="Admission year" value={form.admissionYear} onChange={set('admissionYear')} placeholder="e.g. 2020"              />
          <SelectField
            label="University"
            value={form.universityId}
            onChange={set('universityId')}
            options={UniversityOption}
            placeholder="— Select university —"
          />
        </FormSection>

        {/* ── About & Links ── */}
        <FormSection title="About & Links" cols={1}>
          <Field label="Bio"              value={form.bio}             onChange={set('bio')}             as="textarea" rows={4} placeholder="Tell students about yourself, your experience and how you can help them." />
          <DatalistTagInput
            label="Languages known"
            value={form.languageKnown}
            onChange={(arr) => { setForm(f => ({ ...f, languageKnown: arr })); setIsDirty(true); }}
            options={Language}
            listId="dl-language"
            placeholder="Select or type a language"
            hint="Select from the list or type a language and press Enter."
          />
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
  const [cancellingId,   setCancellingId]   = useState(null);
  const [confirmAction,  setConfirmAction]  = useState(null); // { type: 'done'|'cancel', sess }
  const [cancelReason,   setCancelReason]   = useState('');
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

  /* cancel session */
  const handleCancelSession = async (s, reason) => {
    if (cancellingId) return;
    setCancellingId(s.id);
    try {
      await httpService.put(`/mentorSession/status/${s.id}`, {
        data: { isSessionDone: false, feedback: reason || 'cancelled', isSessionCancelled: true },
        token: true,
      });
      setSessions(prev => prev.filter(x => x.id !== s.id));
      toast.success('Session cancelled successfully.');
      /* ── send cancellation email to student ── */
      console.log('[cancel] session object keys:', Object.keys(s), s);
      const studentName = s.userName || s.studentName || s.name || 'there';
      // try email directly on session object first, otherwise fetch from user profile
      let studentEmail = s.userEmail || s.email || s.studentEmail || null;
      if (!studentEmail) {
        const studentId = s.userId || s.user_id || null;
        if (studentId) {
          try {
            const res = await httpService.get(`/user/${studentId}`, { token: true });
            const u   = res?.data ?? res?.user ?? res ?? {};
            studentEmail = u.email || null;
          } catch { /* non-fatal */ }
        }
      }
      sendMail(
        [studentEmail],
        'Your Session Has Been Cancelled',
        `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#DC2626">Session Cancelled</h2>
          <p>Hi ${studentName},</p>
          <p>Your session scheduled for <b>${s.date || ''}${s.time ? ' at ' + s.time : ''}</b> has been cancelled.</p>
          ${reason ? `<p><b>Reason:</b> ${reason}</p>` : ''}
          <p>We apologise for the inconvenience. Please book another session at your convenience.</p>
          <p style="color:#6B7280;font-size:13px">Thank you for using Mentor4Career.</p>
        </div>`
      );
    } catch {}
    finally { setCancellingId(null); }
  };

  /* confirm-modal dispatcher */
  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, sess } = confirmAction;
    const reason = cancelReason.trim();
    setConfirmAction(null);
    setCancelReason('');
    if (type === 'done')   handleMarkDone(sess);
    if (type === 'cancel') handleCancelSession(sess, reason);
  };

  const closeConfirm = () => { setConfirmAction(null); setCancelReason(''); };

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
    const isCancelling  = cancellingId === s.id;

    return (
      <div className="sess-card" style={status === 'cancelled' ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
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
              {/* <button
                className="btn btn-soft btn-sm"
                onClick={() => allowResched && openReschedule(s)}
                disabled={!allowResched}
                title={allowResched ? 'Reschedule session' : 'Cannot reschedule within 30 min of start time'}
                style={{ pointerEvents: allowResched ? 'auto' : 'none', opacity: allowResched ? 1 : 0.38, cursor: allowResched ? 'pointer' : 'not-allowed' }}
              >
                Reschedule
              </button> */}
              <button
                className="btn btn-soft btn-sm"
                onClick={() => isPast && setConfirmAction({ type: 'done', sess: s })}
                disabled={!isPast || isMarking}
                title={isPast ? 'Mark session as completed' : 'Available after session start time'}
                style={{ pointerEvents: isPast ? 'auto' : 'none', opacity: isPast ? 1 : 0.38, cursor: isPast ? 'pointer' : 'not-allowed' }}
              >
                {isMarking ? 'Saving…' : 'Mark done'}
              </button>
              <button
                className="btn btn-sm"
                onClick={() => setConfirmAction({ type: 'cancel', sess: s })}
                disabled={isCancelling}
                style={{ background: '#FEE2E2', color: '#B91C1C', border: '1.5px solid #FECACA', fontWeight: 700, opacity: isCancelling ? 0.5 : 1 }}
              >
                {isCancelling ? 'Cancelling…' : 'Cancel session'}
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
          {status === 'cancelled' && (
            <span className="sess-badge cancelled" style={{ fontSize: 13, padding: '6px 14px' }}><i />Cancelled</span>
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
      {/* ── Confirm-action warning modal ── */}
      {confirmAction && (() => {
        const isDone   = confirmAction.type === 'done';
        const s        = confirmAction.sess;
        const name     = s.userName || s.studentName || s.name || 'Student';
        const accentBg = isDone ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#DC2626,#EF4444)';
        const iconPath = isDone
          ? <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>;
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) closeConfirm(); }}
          >
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
              {/* icon strip */}
              <div style={{ background: accentBg, padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" width="26" height="26">{iconPath}</svg>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>
                  {isDone ? 'Mark as Completed?' : 'Cancel Session?'}
                </div>
              </div>
              {/* body */}
              <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* session info pill */}
                <div style={{ background: isDone ? '#ECFDF5' : '#FEF2F2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: isDone ? '#065F46' : '#991B1B' }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{s.description || 'Session'}</div>
                  <div style={{ opacity: 0.85 }}>
                    with {name}{s.date ? ` · ${s.date.replace(/^[A-Za-z]+,\s*/, '')}` : ''}{s.time ? ` · ${s.time}` : ''}
                  </div>
                </div>
                {/* warning message */}
                <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  {isDone
                    ? 'Are you sure you want to mark this session as completed? You will be asked to leave feedback afterwards.'
                    : 'Are you sure you want to cancel this session? This action cannot be undone and the student will be notified.'}
                </p>
                {/* reason textarea — cancel only */}
                {!isDone && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Reason for cancellation <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder="e.g. Unavailable due to personal emergency…"
                      rows={3}
                      style={{ resize: 'vertical', border: '1.5px solid var(--border,#e2e8f0)', borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
                {/* actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={closeConfirm}
                    style={{ flex: 1, padding: '11px 0', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}
                  >
                    Go back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!isDone && !cancelReason.trim()}
                    style={{ flex: 1, padding: '11px 0', background: (!isDone && !cancelReason.trim()) ? '#FCA5A5' : isDone ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#DC2626,#EF4444)', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff', cursor: (!isDone && !cancelReason.trim()) ? 'not-allowed' : 'pointer', boxShadow: (isDone || cancelReason.trim()) ? (isDone ? '0 4px 14px rgba(5,150,105,0.35)' : '0 4px 14px rgba(220,38,38,0.35)') : 'none', transition: 'all .2s' }}
                  >
                    {isDone ? 'Yes, mark done' : 'Yes, cancel it'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
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
                style={{ position: 'absolute', top: 18, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
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
  const [toTime,    setToTime]    = useState('10:00 AM');
  const [rangeErr,  setRangeErr]  = useState('');
  const [savedKey,  setSavedKey]  = useState(null);
  const [saving,      setSaving]     = useState(false);
  const [isDirty,     setIsDirty]    = useState(false);
  const [clearingKey, setClearingKey] = useState(null);

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
          loaded[key] = slots
            .filter(s => s.startTime && s.endTime)
            .map(s => ({ from: parseApiTime(s.startTime), to: parseApiTime(s.endTime) }));
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

  const autoToTime = useMemo(() => {
    const fromM = toMins(fromTime);
    return TIME_OPTIONS.find(o => toMins(o.value) === fromM + 60)?.value ?? toTime;
  }, [fromTime]); // eslint-disable-line

  const selKey      = selDay ? dateKey(selDay.y, selDay.m, selDay.d) : null;
  const selSlots    = selKey ? (avail[selKey] ?? []) : [];
  const isPast      = (d) => new Date(viewYear, viewMonth, d) < today;
  const isToday     = (d) => d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const isSel       = (d) => selDay?.d === d && selDay?.m === viewMonth && selDay?.y === viewYear;
  const hasSlot     = (d) => (avail[dateKey(viewYear, viewMonth, d)] ?? []).length > 0;
  const prevMonth   = () => viewMonth === 0  ? (setViewYear(y => y - 1), setViewMonth(11)) : setViewMonth(m => m - 1);
  const nextMonth   = () => viewMonth === 11 ? (setViewYear(y => y + 1), setViewMonth(0))  : setViewMonth(m => m + 1);

  /* true when the currently selected calendar day is today */
  const isSelToday = selDay
    ? selDay.y === today.getFullYear() && selDay.m === today.getMonth() && selDay.d === today.getDate()
    : false;

  /* valid "From" options: must have a +1 hr "To" slot; on today only show times strictly after now */
  const getNowMins = () => new Date().getHours() * 60 + new Date().getMinutes();
  const fromOptions = useMemo(() => {
    const base = TIME_OPTIONS.filter(o => TIME_OPTIONS.some(x => toMins(x.value) === toMins(o.value) + 60));
    if (!isSelToday) return base;
    const nowM = getNowMins();
    return base.filter(o => toMins(o.value) > nowM);
  }, [isSelToday]); // eslint-disable-line

  const selectDay = (d) => {
    if (isPast(d)) return;
    setSelDay({ y: viewYear, m: viewMonth, d });
    setRangeErr('');
    /* when selecting today, immediately advance fromTime to first future slot if needed */
    if (isToday(d)) {
      const nowM = getNowMins();
      if (toMins(fromTime) <= nowM) {
        const first = TIME_OPTIONS
          .filter(o => TIME_OPTIONS.some(x => toMins(x.value) === toMins(o.value) + 60))
          .find(o => toMins(o.value) > nowM);
        if (first) setFromTime(first.value);
      }
    }
  };

  const addSlot = () => {
    if (!selKey) return;
    const fromM = toMins(fromTime);
    const toM   = toMins(toTime);
    const dur   = toM - fromM;
    const computedTo = autoToTime;
    const toM2 = toMins(computedTo);
    const dur2  = toM2 - fromM;
    if (dur2 !== 60) { setRangeErr('Slots must be exactly 1 hour. Please choose a different start time.'); return; }
    /* guard: reject past times for today (covers race where time passed after selecting the slot) */
    if (isSelToday && fromM <= getNowMins()) {
      setRangeErr('Cannot add a slot in the past. Please choose a future time.'); return;
    }
    const cur = avail[selKey] ?? [];
    const overlaps = cur.some(s => { const sf = toMins(s.from); const st = toMins(s.to); return fromM < st && sf < toM2; });
    if (overlaps) { setRangeErr('This time overlaps with an existing slot on this date.'); return; }
    setRangeErr(''); setSavedKey(null);
    setAvail(prev => ({ ...prev, [selKey]: [...(prev[selKey] ?? []), { from: fromTime, to: computedTo }] }));
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

  const handleClearDate = async (key) => {
    if (!key || clearingKey) return;
    setClearingKey(key);
    try {
      await httpService.post('/mentorAvailability', {
        data: { mentorId, date: keyToApiDate(key), slots: [{ startTime: '', endTime: '' }] },
        token: true,
      });
      setAvail(prev => ({ ...prev, [key]: [] }));
      if (key === selKey) setSavedKey(null);
      toast.success('Slots removed for this date.');
    } catch {
      toast.error('Failed to remove slots. Please try again.');
    }
    finally { setClearingKey(null); }
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
              <div className="aeh-emoji">
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
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
                  <select className="avail-range-sel" value={fromTime} onChange={e => { setFromTime(e.target.value); setRangeErr(''); }}>
                    {fromOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="avail-range-dash">—</div>
                <div className="avail-range-field">
                  <label>To <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-3)', textTransform: 'none', letterSpacing: 0 }}>(+1 hr)</span></label>
                  <div className="avail-range-sel" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2,#f8fafc)', color: 'var(--ink-2)', cursor: 'default', pointerEvents: 'none', userSelect: 'none' }}>
                    {autoToTime}
                  </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={handleSaveDate} disabled={selSlots.length === 0 || saving || !!clearingKey}>
                  {saving ? 'Saving…' : savedKey === selKey ? <><Check width={13} height={13} /> Saved</> : 'Save this date'}
                </button>
                {selSlots.length > 0 && (
                  <button
                    className="btn btn-sm"
                    onClick={() => handleClearDate(selKey)}
                    disabled={!!clearingKey || saving}
                    style={{ background: '#FEE2E2', color: '#B91C1C', border: '1.5px solid #FECACA', fontWeight: 700 }}
                  >
                    {clearingKey === selKey ? 'Removing…' : 'Remove all slots'}
                  </button>
                )}
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
              <button
                onClick={() => handleClearDate(e.key)}
                disabled={!!clearingKey}
                title="Remove all slots for this date"
                style={{ marginLeft: 'auto', flexShrink: 0, background: 'none', border: '1.5px solid #FECACA', borderRadius: 8, padding: '4px 10px', cursor: clearingKey ? 'not-allowed' : 'pointer', color: '#B91C1C', fontSize: 12, fontWeight: 700, opacity: clearingKey ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                {clearingKey === e.key
                  ? 'Removing…'
                  : <><RemoveIcon /> Remove</>}
              </button>
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
function Earnings({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);
  const [pag,      setPag]      = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const LIMIT = 10;

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const load = async (pg = 1) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await httpService.get(`/mentorSession/mentor/${userId}`, {
        params: { page: pg, limit: LIMIT, paymentStatus: 'done' },
        token: true,
      });
      setSessions(Array.isArray(res?.data) ? res.data : []);
      setPag(res?.pagination ?? { page: pg, limit: LIMIT, total: 0, totalPages: 1 });
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { if (userId) load(1); }, [userId]); // eslint-disable-line

  const totMentorFee  = sessions.reduce((s, r) => s + Number(r.mentorFee  || 0), 0);
  const totRevenue    = sessions.reduce((s, r) => s + Number(r.amount     || 0), 0);
  const totGst        = sessions.reduce((s, r) => s + Number(r.gstAmount  || 0), 0);
  const totPlatform   = sessions.reduce((s, r) => s + Number(r.platformFee|| 0), 0);

  const COL = '1.6fr 1fr 1fr 1fr 1fr 1fr';

  return (
    <div>
      <div className="db-section-head"><h2>Earnings</h2><p>Track your session revenue and payout history</p></div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 14, marginBottom: 26 }}>
        {[
          { v: fmt(totMentorFee), l: 'Mentor Fee Earned', ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v2m0 8v2M9 10a3 3 0 016 0c0 2-1.5 2.5-3 3s-3 1-3 3a3 3 0 006 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>, bg: '#EEF2FF', col: '#4F46E5' },
          { v: fmt(totRevenue),   l: 'Total Revenue',     ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M3 17l4-4 4 4 4-6 4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,                                  bg: '#D1FAE5', col: '#065F46' },
          { v: fmt(totGst),       l: 'GST Collected',     ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>, bg: '#FEF9C3', col: '#92400E' },
          { v: String(pag.total || 0), l: 'Paid Sessions', ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M8 15l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>, bg: '#F0FDF4', col: '#15803D' },
        ].map(k => (
          <div className="card" key={k.l} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, color: k.col, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{k.ic}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: k.col, lineHeight: 1 }}>{k.v}</div>
            <div style={{ color: 'var(--ink-3)', fontSize: 12.5, fontWeight: 600, marginTop: 6 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── table header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: 0 }}>Session Earnings</h3>
        {pag.total > 0 && (
          <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>
            Showing <b style={{ color: 'var(--ink)' }}>{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pag.total)}</b> of <b style={{ color: 'var(--ink)' }}>{pag.total}</b> sessions
          </span>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
          <svg viewBox="0 0 24 24" fill="none" width="36" height="36" style={{ marginBottom: 12 }}><circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2.5"/><path d="M12 3a9 9 0 019 9" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading earnings…</div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <svg viewBox="0 0 24 24" fill="none" width="46" height="46" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink-2)', marginBottom: 6 }}>No earnings yet</div>
          <div style={{ fontSize: 13.5 }}>Your paid session earnings will appear here.</div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 0, padding: '10px 18px', background: '#F8FAFC', borderBottom: '1.5px solid var(--border)' }}>
              {['Student & Date', 'Total Paid', 'Your Fee', 'Platform Fee', 'GST', 'Status'].map((h, i) => (
                <div key={h} style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: i > 0 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {/* Data rows */}
            {sessions.map((s, i, arr) => (
              <div key={s.id ?? i} style={{ display: 'grid', gridTemplateColumns: COL, gap: 0, padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{s.studentName || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.date}  ·  {s.time}</div>
                  {Number(s.discount) > 0 && (
                    <div style={{ fontSize: 11, color: '#059669', marginTop: 2, fontWeight: 600 }}>Discount applied: {fmt(s.discount)}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>{fmt(s.amount)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#10B981' }}>{fmt(s.mentorFee)}</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>{fmt(s.platformFee)}</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: '#B45309', fontWeight: 600 }}>{fmt(s.gstAmount)}</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: s.isSessionDone ? 'var(--emerald-soft)' : '#FEF3C7', color: s.isSessionDone ? 'var(--emerald)' : '#B45309', whiteSpace: 'nowrap' }}>
                    {s.isSessionDone ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}

            {/* Page totals footer */}
            {/* <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 0, padding: '11px 18px', background: '#F8FAFC', borderTop: '1.5px solid var(--border)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Page Total</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--ink)' }}>{fmt(totRevenue)}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: '#10B981' }}>{fmt(totMentorFee)}</div>
              <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700 }}>{fmt(totPlatform)}</div>
              <div style={{ textAlign: 'right', fontSize: 12.5, color: '#B45309', fontWeight: 700 }}>{fmt(totGst)}</div>
              <div />
            </div> */}
          </div>

          {/* ── pagination ── */}
          {pag.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
              <button onClick={() => load(1)} disabled={page === 1 || loading}
                style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, color: 'var(--ink-2)' }}>«</button>
              <button onClick={() => load(page - 1)} disabled={page === 1 || loading}
                style={{ padding: '7px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, color: 'var(--ink-2)' }}>‹ Prev</button>
              {Array.from({ length: Math.min(pag.totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, pag.totalPages - 4));
                return start + i;
              }).filter(p => p >= 1 && p <= pag.totalPages).map(p => (
                <button key={p} onClick={() => load(p)} disabled={loading}
                  style={{ padding: '7px 13px', background: page === p ? '#4F46E5' : '#fff', color: page === p ? '#fff' : 'var(--ink-2)', border: `1.5px solid ${page === p ? '#4F46E5' : 'var(--border)'}`, borderRadius: 9, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: page === p ? '0 2px 8px rgba(79,70,229,.3)' : 'none' }}>{p}</button>
              ))}
              <button onClick={() => load(page + 1)} disabled={page >= pag.totalPages || loading}
                style={{ padding: '7px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: page >= pag.totalPages ? 'not-allowed' : 'pointer', opacity: page >= pag.totalPages ? 0.4 : 1, color: 'var(--ink-2)' }}>Next ›</button>
              <button onClick={() => load(pag.totalPages)} disabled={page === pag.totalPages || loading}
                style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: page === pag.totalPages ? 'not-allowed' : 'pointer', opacity: page === pag.totalPages ? 0.4 : 1, color: 'var(--ink-2)' }}>»</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAYOUT VIEW
═══════════════════════════════════════════════════════ */
function PayoutView({ userId }) {
  const [summary,     setSummary]     = useState(null);
  const [sumLoading,  setSumLoading]  = useState(true);
  const [history,     setHistory]     = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [page,        setPage]        = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [search,      setSearch]      = useState('');
  const [expandedId,  setExpandedId]  = useState(null);

  const LIMIT = 12;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

  const fmtTs = (val) => {
    if (!val) return '—';
    try { return new Date(val).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return val; }
  };

  useEffect(() => {
    if (!userId) return;
    setSumLoading(true);
    httpService.get(`/mentorPayout/summary/${userId}`, { token: true })
      .then(res => setSummary(res?.data ?? null))
      .catch(() => {})
      .finally(() => setSumLoading(false));
  }, [userId]);

  const fetchHistory = useCallback(async (pg) => {
    if (!userId) return;
    setHistLoading(true);
    try {
      const res = await httpService.get(`/mentorPayout/history/${userId}`, {
        params: { page: pg, limit: LIMIT },
        token: true,
      });
      setHistory(res?.rows ?? []);
      setTotalCount(res?.count ?? 0);
    } catch { setHistory([]); setTotalCount(0); }
    finally { setHistLoading(false); }
  }, [userId]); // eslint-disable-line

  useEffect(() => { fetchHistory(1); }, [fetchHistory]);

  const gotoPage = (pg) => { setPage(pg); fetchHistory(pg); setExpandedId(null); };

  const filtered = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.toLowerCase();
    return history.filter(h =>
      (h.remarks || '').toLowerCase().includes(q) ||
      (h.transactionReference || '').toLowerCase().includes(q)
    );
  }, [history, search]);

  const pageWindow = () => {
    const w = 5, half = Math.floor(w / 2);
    let s = Math.max(1, page - half);
    let e = Math.min(totalPages, s + w - 1);
    if (e - s < w - 1) s = Math.max(1, e - w + 1);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  };

  const SummaryCard = ({ label, value, color, sub }) => (
    <div className="card" style={{ padding: '20px 22px', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 5 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <div className="db-section-head">
        <h2>Payout</h2>
        <p>Your earnings overview and payout history</p>
      </div>

      {/* ── Summary Cards ── */}
      {sumLoading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>Loading summary…</div>
      ) : summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 30 }}>
          <SummaryCard
            label="Total Earned" color="#10B981"
            value={`₹${Number(summary.totalEarned).toLocaleString('en-IN')}`}
            sub={`${summary.totalSessions} session${summary.totalSessions !== '1' ? 's' : ''} completed`}
          />
          <SummaryCard
            label="Total Paid Out" color="#4F46E5"
            value={`₹${Number(summary.totalPaid).toLocaleString('en-IN')}`}
            sub="Disbursed to your account"
          />
          <SummaryCard
            label="Balance" color={summary.remaining < 0 ? '#EF4444' : '#F59E0B'}
            value={`${summary.remaining < 0 ? '-' : ''}₹${Math.abs(Number(summary.remaining)).toLocaleString('en-IN')}`}
            sub={summary.remaining < 0 ? 'Advance paid out' : 'Pending payout'}
          />
          <SummaryCard
            label="Sessions" color="#F59E0B"
            value={summary.totalSessions}
            sub={summary.mentorName}
          />
        </div>
      ) : (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-3)', marginBottom: 28 }}>No summary data available.</div>
      )}

      {/* ── History header + search ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>Payout History</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
            {search ? `${filtered.length} match${filtered.length !== 1 ? 'es' : ''}` : `${totalCount} payout${totalCount !== 1 ? 's' : ''} total`}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text" placeholder="Search remarks or UTR…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34, paddingRight: search ? 34 : 14, paddingTop: 9, paddingBottom: 9, border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13.5, width: 250, outline: 'none', color: 'var(--ink)', background: 'var(--surface,#fff)' }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="13" height="13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── History list ── */}
      {histLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>Loading history…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '36px 28px', textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 12px' }}><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No payouts found</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>No records match your search.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(tx => {
            const isOpen = expandedId === tx.id;
            return (
              <div key={tx.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* ── Summary row ── */}
                <div onClick={() => setExpandedId(isOpen ? null : tx.id)}
                  style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', flexWrap: 'wrap', background: isOpen ? '#F0FDF4' : 'var(--surface,#fff)', transition: 'background .15s' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#10B981,#059669)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 3 }}>
                      {tx.remarks || 'Payout'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-3)' }}>
                      <span>UTR: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--ink-2)' }}>{tx.transactionReference || '—'}</span></span>
                      <span>· {tx.paidDate} {tx.paidTime && `at ${tx.paidTime}`}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#10B981', marginBottom: 4 }}>
                      +₹{Number(tx.paidAmount).toLocaleString('en-IN')}
                    </div>
                    <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>Paid</span>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round"
                    style={{ flexShrink: 0, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>

                {/* ── Expanded details ── */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '18px 20px', background: '#F8FAFC' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                      {[
                        { label: 'Payout ID',            value: `#${tx.id}` },
                        { label: 'Amount',               value: `₹${Number(tx.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                        { label: 'Paid Date',            value: tx.paidDate || '—' },
                        { label: 'Paid Time',            value: tx.paidTime || '—' },
                        { label: 'Transaction Ref (UTR)', value: tx.transactionReference || '—', mono: true },
                        { label: 'Remarks',              value: tx.remarks || '—' },
                        { label: 'Created At',           value: fmtTs(tx.createdAt) },
                        { label: 'Last Updated',         value: fmtTs(tx.updatedAt) },
                      ].map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>{f.label}</div>
                          <div style={{ fontSize: 13.5, color: 'var(--ink)', fontFamily: f.mono ? 'monospace' : 'inherit', fontWeight: f.mono ? 600 : 400, wordBreak: 'break-all' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination (hidden when searching) ── */}
      {!histLoading && !search && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 22, flexWrap: 'wrap' }}>
          <button onClick={() => gotoPage(1)} disabled={page === 1}
            style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 13, color: page === 1 ? '#CBD5E1' : 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>«</button>
          <button onClick={() => gotoPage(page - 1)} disabled={page === 1}
            style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 13, color: page === 1 ? '#CBD5E1' : 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>‹</button>
          {pageWindow().map(p => (
            <button key={p} onClick={() => gotoPage(p)}
              style={{ padding: '7px 12px', background: p === page ? 'linear-gradient(135deg,#10B981,#059669)' : '#fff', border: `1.5px solid ${p === page ? 'transparent' : 'var(--border)'}`, borderRadius: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: p === page ? '#fff' : 'var(--ink-2)', cursor: 'pointer' }}>
              {p}
            </button>
          ))}
          <button onClick={() => gotoPage(page + 1)} disabled={page === totalPages}
            style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 13, color: page === totalPages ? '#CBD5E1' : 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>›</button>
          <button onClick={() => gotoPage(totalPages)} disabled={page === totalPages}
            style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 13, color: page === totalPages ? '#CBD5E1' : 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>»</button>
        </div>
      )}
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
        const rows = Array.isArray(res)       ? res
                   : Array.isArray(res?.data) ? res.data : [];
        setTicketCount(res?.pagination?.total ?? res?.total ?? rows.length);
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
          { v: ticketCount > 0 ? ticketCount : '0',              l: 'Open Tickets'     },
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

        {section === 'earnings' && <Earnings userId={myProfile?.authUserId} />}

        {section === 'payout' && <PayoutView userId={myProfile?.authUserId} />}

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
