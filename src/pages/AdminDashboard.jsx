import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext.jsx';
import httpService from '../utils/apiService.tsx';

/* ── icons ── */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
function nameColorAd(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return GRAD[h % GRAD.length];
}
function initialsAd(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase() || '??';
}
function fmtDateAd(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

const TYPE_LABEL = { student: 'Student', job_seeker: 'Job Seeker', mentor: 'Mentor', admin: 'Admin' };
const TYPE_COLOR = {
  student:   { bg: '#EEF2FF', color: '#4F46E5' },
  job_seeker:{ bg: '#FEF3C7', color: '#B45309' },
  mentor:    { bg: '#D1FAE5', color: '#065F46' },
  admin:     { bg: '#FEE2E2', color: '#DC2626' },
};

/* ── static activity / sessions (overview + sessions tab) ── */
const ACTIVITY = [
  { t: 'New mentor verified',  d: 'Meera Menon · Data Scientist, Flipkart', when: '2m ago' },
  { t: 'Payout processed',     d: '₹18,400 · Priya Nair',                  when: '1h ago' },
  { t: 'Session completed',    d: 'Rohan D. ↔ Aarav Sharma',               when: '3h ago' },
  { t: 'Refund issued',        d: '₹599 · mentor cancellation',            when: '5h ago' },
];
const ALL_SESSIONS = [
  { mentor: { av:'PN', col:'linear-gradient(135deg,#7C5CF7,#EC4899)', name:'Priya Nair'  }, student: { av:'RD', col:'linear-gradient(135deg,#4F46E5,#3B82F6)', name:'Rohan D.'  }, topic:'Interview prep',  when:'Sat, 14 Jun · 06:00 PM', duration:'45 min', amount:'₹1,199', status:'upcoming'  },
  { mentor: { av:'AS', col:'linear-gradient(135deg,#0FA968,#06B6D4)', name:'Aarav Sharma'}, student: { av:'TA', col:'linear-gradient(135deg,#F59E0B,#EF4444)', name:'Tanvi A.'  }, topic:'Career guidance', when:'Sun, 15 Jun · 12:30 PM', duration:'30 min', amount:'₹599',   status:'upcoming'  },
  { mentor: { av:'MN', col:'linear-gradient(135deg,#EC4899,#F59E0B)', name:'Meera N.'   }, student: { av:'KM', col:'linear-gradient(135deg,#0FA968,#06B6D4)', name:'Kavya M.'  }, topic:'Resume review',   when:'Thu, 05 Jun · 02:00 PM', duration:'30 min', amount:'₹599',   status:'completed' },
  { mentor: { av:'RV', col:'linear-gradient(135deg,#4F46E5,#3B82F6)', name:'Rahul V.'   }, student: { av:'PS', col:'linear-gradient(135deg,#7C5CF7,#EC4899)', name:'Preethi S.'}, topic:'DSA prep',        when:'Mon, 02 Jun · 05:30 PM', duration:'45 min', amount:'₹1,199', status:'completed' },
  { mentor: { av:'SS', col:'linear-gradient(135deg,#EC4899,#F59E0B)', name:'Sneha S.'   }, student: { av:'AK', col:'linear-gradient(135deg,#F59E0B,#EF4444)', name:'Arjun K.'  }, topic:'Mock interview',  when:'Wed, 28 May · 11:00 AM', duration:'45 min', amount:'₹1,199', status:'cancelled' },
];

const STATUS_LABEL = { upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' };

const VIEW_META = {
  overview: { title: 'Dashboard',              sub: 'Platform health at a glance'                    },
  mentors:  { title: 'Mentors',                sub: 'Manage mentor accounts and verifications'        },
  users:    { title: 'Students',               sub: 'All registered students on the platform'         },
  sessions: { title: 'Webinars',               sub: 'Platform-wide webinar and session activity'      },
  payouts:  { title: 'Mentor Payouts',         sub: 'Manage payout requests and history'              },
  jobs:     { title: 'Jobs & Internships',     sub: 'Manage all job listings on the platform'         },
  feedback: { title: 'Feedback & Ratings',     sub: 'Review mentor and session feedback'              },
  revenue:  { title: 'Revenue & Payments',     sub: 'Platform revenue and payment analytics'          },
  tickets:  { title: 'Support Tickets',        sub: 'Manage open support requests'                    },
};

/* ── pill components ── */
function StatusPill({ s }) {
  const cfg = {
    active:    { bg: '#D1FAE5', color: '#065F46', label: 'Active'    },
    inactive:  { bg: '#F3F4F6', color: '#6B7280', label: 'Inactive'  },
    pending:   { bg: '#FEF3C7', color: '#B45309', label: 'Pending'   },
    Paid:      { bg: '#D1FAE5', color: '#065F46', label: 'Paid'      },
    Processed: { bg: '#D1FAE5', color: '#065F46', label: 'Processed' },
    Pending:   { bg: '#FEF3C7', color: '#B45309', label: 'Pending'   },
  };
  const { bg, color, label } = cfg[s] || { bg: 'var(--bg-tint)', color: 'var(--ink-2)', label: s };
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: bg, color, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function VerifiedPill({ v }) {
  return v
    ? <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#EEF2FF', color: '#4F46E5', display: 'inline-flex', alignItems: 'center', gap: 4 }}><ShieldIcon />Verified</span>
    : <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#FEF3C7', color: '#B45309', whiteSpace: 'nowrap' }}>Unverified</span>;
}

function TypeBadge({ type }) {
  const { bg, color } = TYPE_COLOR[type] || { bg: 'var(--surface-2)', color: 'var(--ink-2)' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: bg, color, whiteSpace: 'nowrap' }}>
      {TYPE_LABEL[type] || type || '—'}
    </span>
  );
}

/* ── segmented filter control ── */
function SegmentFilter({ label, icon, options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
        {label}
      </span>
      <div style={{
        display: 'inline-flex', background: 'var(--surface-2,#f1f5f9)',
        borderRadius: 10, padding: 3, border: '1.5px solid var(--border,#e2e8f0)',
      }}>
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              padding: '5px 13px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: value === o.value ? 700 : 500,
              background: value === o.value ? 'var(--surface,#fff)' : 'transparent',
              color: value === o.value ? 'var(--indigo,#4F46E5)' : 'var(--ink-3)',
              boxShadow: value === o.value ? '0 1px 6px rgba(79,70,229,0.12),0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── inline toggle switch ── */
function ToggleSwitch({ value, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{
        width: 48, height: 26, borderRadius: 99, border: 'none', flexShrink: 0,
        background: value ? '#4F46E5' : 'var(--border,#e2e8f0)',
        cursor: disabled ? 'wait' : 'pointer',
        position: 'relative', transition: 'background 0.22s ease',
        boxShadow: value ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 25 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 0.22s ease',
        boxShadow: '0 1px 5px rgba(0,0,0,0.22)',
      }} />
    </button>
  );
}

/* ══════════════════════════════════════════════
   MENTOR DETAIL MODAL
══════════════════════════════════════════════ */
function MentorModal({ mentor: init, onClose, onUpdate }) {
  const [mentor,   setMentor]   = useState(init);
  const [toggling, setToggling] = useState(null);

  const toggle = async (field) => {
    setToggling(field);
    const newVal  = !mentor[field];
    const updated = { ...mentor, [field]: newVal };
    setMentor(updated);
    try {
      await httpService.put(`/mentorProfile/${mentor.id}`, {
        data: { [field]: newVal, type: 'mentor' },
        token: true,
      });
      toast.success(`${field === 'isVerified' ? 'Verification' : 'Active status'} updated!`);
      onUpdate(updated);
    } catch {
      setMentor(mentor);
    }
    finally { setToggling(null); }
  };

  const fullName = `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim() || 'Mentor';
  const col      = nameColorAd(fullName);

  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border,#e2e8f0)', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13.5, color: 'var(--ink)', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div className="d-modal open" style={{ zIndex: 8000 }}>
      <div className="dm-scrim" onClick={onClose} />
      <div className="dm-card" style={{ maxWidth: 520, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* header */}
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div className="co-mono" style={{ background: col, width: 48, height: 48, borderRadius: 14, fontSize: 16, flexShrink: 0 }}>
            {initialsAd(mentor.firstName, mentor.lastName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>{fullName}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{mentor.email || 'No email'}</div>
          </div>
          <button className="dm-x" onClick={onClose}><CloseIcon /></button>
        </div>

        {/* status toggles */}
        <div style={{ padding: '6px 24px 4px', borderBottom: '1px solid var(--border,#e2e8f0)', flexShrink: 0 }}>
          {/* Verified row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border,#e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: mentor.isVerified ? '#EEF2FF' : 'var(--surface-2,#f1f5f9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: mentor.isVerified ? '#4F46E5' : 'var(--ink-3)',
              }}>
                <ShieldIcon />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                  Verification
                  {mentor.isVerified && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: 99 }}>Verified</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>
                  {mentor.isVerified ? 'Mentor can accept bookings' : 'Enable to allow mentor to accept students'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <ToggleSwitch
                value={mentor.isVerified}
                onChange={() => toggle('isVerified')}
                disabled={toggling === 'isVerified'}
              />
              {toggling === 'isVerified' && <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Saving…</span>}
            </div>
          </div>
          {/* Active row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: mentor.isActive ? '#D1FAE5' : 'var(--surface-2,#f1f5f9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <circle cx="12" cy="12" r="9" stroke={mentor.isActive ? '#10B981' : 'var(--ink-3)'} strokeWidth="1.8" />
                  {mentor.isActive && <path d="M8 12l3 3 5-5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                  Active Status
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: mentor.isActive ? '#10B981' : '#6B7280', background: mentor.isActive ? '#D1FAE5' : '#F3F4F6', padding: '2px 8px', borderRadius: 99 }}>
                    {mentor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>
                  {mentor.isActive ? 'Profile is visible to students' : 'Profile hidden from students'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <ToggleSwitch
                value={mentor.isActive}
                onChange={() => toggle('isActive')}
                disabled={toggling === 'isActive'}
              />
              {toggling === 'isActive' && <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Saving…</span>}
            </div>
          </div>
        </div>

        {/* scrollable detail rows */}
        <div style={{ padding: '4px 24px 20px', overflowY: 'auto', flex: 1 }}>
          <div className="adm-kv" style={{ marginTop: 12 }}>
            <div><span>Contact</span><b>{mentor.contactNumber || '—'}</b></div>
            <div><span>Gender</span><b>{mentor.gender || '—'}</b></div>
            <div><span>Job Role</span><b>{mentor.jobRole || '—'}</b></div>
            <div><span>Organization</span><b>{mentor.organizationName || '—'}</b></div>
            <div><span>Experience</span><b>{mentor.experience != null ? `${mentor.experience} yrs` : '—'}</b></div>
            <div><span>Charge / session</span><b>{mentor.chargePerSession != null ? `₹${mentor.chargePerSession}` : 'Free'}</b></div>
            <div><span>Languages</span><b>{Array.isArray(mentor.languageKnown) ? mentor.languageKnown.join(', ') : mentor.languageKnown || '—'}</b></div>
            <div><span>Admission Year</span><b>{mentor.admissionYear || '—'}</b></div>
            <div><span>LinkedIn</span><b style={{ wordBreak:'break-all' }}>{mentor.linkedInProfile || '—'}</b></div>
            <div><span>Member since</span><b>{fmtDateAd(mentor.createdAt)}</b></div>
          </div>
          {mentor.bio && (
            <div style={{ marginTop: 14, padding: '13px 15px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>Bio</span>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{mentor.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MENTORS VIEW — API + filters + infinite scroll
══════════════════════════════════════════════ */
function MentorsView() {
  const [filters,  setFilters]  = useState({ status: 'all', active: 'all', charge: 'all' });
  const [search,   setSearch]   = useState('');
  const [mentors,  setMentors]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);

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
      const rows  = res?.rows ?? res?.data ?? [];
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
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
        loadPage(pageRef.current + 1, false);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []); // eslint-disable-line

  const setFilter = (key) => (val) => setFilters(prev => ({ ...prev, [key]: val }));

  const filtered = mentors.filter(m => {
    if (filters.status === 'verified'    && !m.isVerified) return false;
    if (filters.status === 'notverified' &&  m.isVerified) return false;
    if (filters.active === 'active'      && !m.isActive)   return false;
    if (filters.active === 'inactive'    &&  m.isActive)   return false;
    const charge = m.chargePerSession;
    if (filters.charge === 'free' && charge != null && charge > 0)                            return false;
    if (filters.charge === 'low'  && (charge == null || charge === 0 || charge >= 500))        return false;
    if (filters.charge === 'high' && (charge == null || charge < 500))                         return false;
    if (search.trim()) {
      const q    = search.toLowerCase();
      const name = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
      if (!name.includes(q) && !(m.email || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const updateMentor = (updated) => {
    setMentors(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelected(updated);
  };

  return (
    <div>
      {/* ── filter bar ── */}
      <div className="filter-bar">
        <div className="seg-row">
          {[
            { v: 'all',         l: 'All'        },
            { v: 'verified',    l: 'Verified'   },
            { v: 'notverified', l: 'Unverified' },
          ].map(o => (
            <button key={o.v} className={`chip${filters.status === o.v ? ' active' : ''}`} onClick={() => setFilter('status')(o.v)}>{o.l}</button>
          ))}
        </div>
        <div className="seg-row" style={{ marginLeft: 4 }}>
          {[
            { v: 'all',      l: 'All Status' },
            { v: 'active',   l: 'Active'     },
            { v: 'inactive', l: 'Inactive'   },
          ].map(o => (
            <button key={o.v} className={`chip${filters.active === o.v ? ' active' : ''}`} onClick={() => setFilter('active')(o.v)}>{o.l}</button>
          ))}
        </div>
        <div className="seg-row" style={{ marginLeft: 4 }}>
          {[
            { v: 'all',  l: 'Any charge' },
            { v: 'free', l: 'Free'       },
            { v: 'low',  l: '< ₹500'    },
            { v: 'high', l: '₹500+'     },
          ].map(o => (
            <button key={o.v} className={`chip${filters.charge === o.v ? ' active' : ''}`} onClick={() => setFilter('charge')(o.v)}>{o.l}</button>
          ))}
        </div>
        <span className="badge b-gray" style={{ marginLeft: 'auto' }}>{filtered.length} / {mentors.length}</span>
        {(filters.status !== 'all' || filters.active !== 'all' || filters.charge !== 'all') && (
          <button className="link-btn danger" onClick={() => setFilters({ status: 'all', active: 'all', charge: 'all' })}>Clear</button>
        )}
        <div className="fb-search">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input type="text" placeholder="Search name, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── mentor table ── */}
      <div className="d-table-wrap adm-table">
        <table className="d-table">
          <thead>
            <tr>
              <th>Mentor</th>
              <th>Role / Org</th>
              <th>Charge</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>No mentors match the current filters.</td></tr>
            ) : filtered.map(m => {
              const fullName = `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Mentor';
              const isFree   = m.chargePerSession == null || m.chargePerSession === 0;
              return (
                <tr key={m.id} className="adm-rowclick" onClick={() => setSelected(m)}>
                  <td>
                    <div className="u-cell">
                      <div className="u-av" style={{ background: nameColorAd(fullName) }}>{initialsAd(m.firstName, m.lastName)}</div>
                      <div>
                        <div className="u-n">{fullName}</div>
                        <div className="u-e">{m.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="td-strong">{m.jobRole || '—'}</div>
                    <div className="td-sub">{m.organizationName || ''}</div>
                  </td>
                  <td>
                    <span className={`badge ${isFree ? 'b-green' : 'b-indigo'}`}>
                      {isFree ? 'Free' : `₹${m.chargePerSession}`}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <VerifiedPill v={m.isVerified} />
                    <StatusPill s={m.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td>{fmtDateAd(m.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="ra" onClick={e => { e.stopPropagation(); setSelected(m); }}>Manage</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <div style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--ink-3)' }}>Loading more…</div>}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />

      {selected && (
        <MentorModal
          mentor={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateMentor}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   USERS VIEW — API + type filter + active toggle
══════════════════════════════════════════════ */
function UsersView() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [search,     setSearch]     = useState('');
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [types,      setTypes]      = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  const sentinelRef = useRef(null);
  const pageRef     = useRef(1);
  const hasMoreRef  = useRef(true);
  const loadingRef  = useRef(false);

  const loadPage = async (page, replace) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res   = await httpService.get('/user', { params: { page, limit: 20 }, token: true });
      const rows  = res?.rows ?? res?.data ?? (Array.isArray(res) ? res : []);
      const total = res?.count ?? rows.length;
      setUsers(prev => {
        const next = replace ? rows : [...prev, ...rows];
        const unique = [...new Set(next.map(u => u.type).filter(Boolean))];
        setTypes(unique);
        return next;
      });
      hasMoreRef.current = page * 20 < total;
      pageRef.current    = page;
    } catch {}
    finally { setLoading(false); loadingRef.current = false; }
  };

  useEffect(() => { loadPage(1, true); }, []); // eslint-disable-line

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
        loadPage(pageRef.current + 1, false);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []); // eslint-disable-line

  const toggleUserActive = async (u) => {
    const newVal  = !u.isActive;
    setTogglingId(u.id);
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: newVal } : x));
    try {
      await httpService.put(`/user/${u.id}`, {
        data: { isActive: newVal, type: u.type },
        token: true,
      });
      toast.success(`User ${newVal ? 'activated' : 'deactivated'} successfully!`);
    } catch {
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: u.isActive } : x));
    }
    finally { setTogglingId(null); }
  };

  const filtered = (typeFilter === 'all' ? users : users.filter(u => u.type === typeFilter))
    .filter(u => {
      if (!search.trim()) return true;
      const q    = search.toLowerCase();
      const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      return name.includes(q) || (u.email || '').toLowerCase().includes(q);
    });

  return (
    <div>
      {/* ── filter bar ── */}
      <div className="filter-bar">
        <div className="seg-row">
          <button className={`chip${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>All</button>
          {types.map(t => (
            <button key={t} className={`chip${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>
              {TYPE_LABEL[t] || t}
            </button>
          ))}
        </div>
        <span className="badge b-gray" style={{ marginLeft: 'auto' }}>{filtered.length} / {users.length}</span>
        <div className="fb-search">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input type="text" placeholder="Search name, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── user table ── */}
      <div className="d-table-wrap adm-table">
        <table className="d-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>No users found.</td></tr>
            ) : filtered.map(u => {
              const fullName   = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown';
              const isToggling = togglingId === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    <div className="u-cell">
                      <div className="u-av" style={{ background: nameColorAd(fullName) }}>{initialsAd(u.firstName, u.lastName)}</div>
                      <div>
                        <div className="u-n">{fullName}{u.isBlock && <span className="badge b-red" style={{ marginLeft: 6, fontSize: 10 }}>Blocked</span>}</div>
                        <div className="u-e">{u.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td><TypeBadge type={u.type} /></td>
                  <td>{u.contact || '—'}</td>
                  <td>{fmtDateAd(u.createdAt)}</td>
                  <td>{u.lastLogin ? fmtDateAd(u.lastLogin) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <ToggleSwitch value={u.isActive} onChange={() => toggleUserActive(u)} disabled={isToggling} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: u.isActive ? '#10B981' : 'var(--ink-3)' }}>
                        {isToggling ? 'Saving…' : u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <div style={{ padding: '14px 18px', fontSize: 13.5, color: 'var(--ink-3)' }}>Loading more…</div>}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}

/* ─── Webinar view ─── */
const WEBINAR_STATUS_CFG = {
  upcoming:  { label: 'Upcoming',  bg: '#EEF2FF', col: '#4F46E5', border: '#4F46E5', dot: '#4F46E5' },
  ongoing:   { label: 'Ongoing',   bg: '#DCFCE7', col: '#15803D', border: '#22C55E', dot: '#22C55E' },
  completed: { label: 'Completed', bg: '#F3F4F6', col: '#6B7280', border: '#D1D5DB', dot: '#9CA3AF' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', col: '#DC2626', border: '#EF4444', dot: '#EF4444' },
};
const WEBINAR_STATUS_KEYS = ['upcoming','ongoing','completed','cancelled'];

const WEBINAR_EMPTY = {
  title: '', description: '', presenter: '', date: '', time: '',
  link: '', isFree: false, price: '', duration: 60, maxRegistration: 100,
};

const fmtWebinarDate = (date, time) => {
  if (!date) return '—';
  try {
    const d = new Date(`${date}T${time || '00:00'}`);
    return isNaN(d) ? date : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return date; }
};

/* Auto-compute status from date/time/duration; cancelled always overrides */
function computeWebinarStatus(w) {
  if (w.status === 'cancelled') return 'cancelled';
  if (!w.date) return w.status || 'upcoming';
  try {
    const start    = new Date(`${w.date}T${w.time || '00:00'}`);
    const end      = new Date(start.getTime() + (Number(w.duration) || 60) * 60 * 1000);
    const now      = new Date();
    if (now < start) return 'upcoming';
    if (now >= start && now < end) return 'ongoing';
    return 'completed';
  } catch { return w.status || 'upcoming'; }
}

function SessionsView() {
  const [webinars,      setWebinars]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [statusFilter,  setStatusFilter]  = useState('upcoming');
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState(WEBINAR_EMPTY);
  const [submitting,    setSubmitting]    = useState(false);
  const [statusModal,   setStatusModal]   = useState(null); // { webinar, newStatus }
  const [updatingId,    setUpdatingId]    = useState(null);

  const loadWebinars = async (pg = 1, replace = true, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (status !== 'all') params.status = status;
      const res  = await httpService.get('/webinar', { params, token: true });
      /* API: { success, webinars: { total, pages, webinars: [...] } } */
      const inner = res?.webinars;
      const data  = Array.isArray(inner?.webinars) ? inner.webinars
                  : Array.isArray(inner)            ? inner
                  : Array.isArray(res)              ? res
                  : Array.isArray(res?.data)        ? res.data : [];
      const pages = inner?.pages ?? 1;
      setWebinars(prev => replace ? data : [...prev, ...data]);
      setHasMore(pg < pages);
      setPage(pg);
    } catch { if (replace) setWebinars([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { loadWebinars(1, true, statusFilter); }, [statusFilter]); // eslint-disable-line

  const handleAdd = async () => {
    if (!form.title.trim() || !form.presenter.trim() || !form.date || !form.time || !form.link.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const createdBy = getLoggedInUserId();
      await httpService.post('/webinar', {
        data: {
          title:           form.title,
          description:     form.description,
          presenter:       form.presenter,
          date:            form.date,
          time:            form.time,
          link:            form.link,
          isFree:          form.isFree,
          price:           form.isFree ? 0 : Number(form.price) || 0,
          duration:        Number(form.duration) || 60,
          maxRegistration: Number(form.maxRegistration) || 100,
          createdBy,
        },
        token: true,
      });
      toast.success('Webinar added successfully!');
      setForm(WEBINAR_EMPTY);
      setShowForm(false);
      loadWebinars(1, true, statusFilter);
    } catch {}
    finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (webinar, newStatus) => {
    setUpdatingId(webinar.id);
    try {
      await httpService.put(`/webinar/${webinar.id}/status`, {
        data: { status: newStatus },
        token: true,
      });
      toast.success(`Status updated to ${WEBINAR_STATUS_CFG[newStatus]?.label || newStatus}`);
      setStatusModal(null);
      loadWebinars(1, true, statusFilter);
    } catch {}
    finally { setUpdatingId(null); }
  };

  const IS  = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', outline: 'none', background: '#fff' };
  const LBL = (txt, req) => (
    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
      {txt}{req && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
  );

  /* counts per status from loaded list (all-statuses view isn't always loaded, so show '—' when filtered) */
  const countOf = (s) => webinars.filter(w => w.status === s).length;

  return (
    <div>
      {/* ── header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Webinars</h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4 }}>Platform-wide webinar management</p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-brand)', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          Add Webinar
        </button>
      </div>

      {/* ── status filter pills ── */}
      <div style={{ background: '#F8FAFC', border: '1.5px solid var(--border)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Filter by Status</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <button onClick={() => setStatusFilter('all')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${statusFilter === 'all' ? '#4F46E5' : 'var(--border)'}`, background: statusFilter === 'all' ? '#EEF2FF' : '#fff', color: statusFilter === 'all' ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
            All
          </button>
          {WEBINAR_STATUS_KEYS.map(k => {
            const cfg    = WEBINAR_STATUS_CFG[k];
            const active = statusFilter === k;
            return (
              <button key={k} onClick={() => setStatusFilter(k)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.col : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── list ── */}
      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)' }}>Loading…</div>
      ) : webinars.length === 0 ? (
        <div style={{ background: '#fff', border: '1.5px dashed var(--border)', borderRadius: 14, padding: '48px 32px', textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" width="44" height="44" style={{ color: '#CBD5E1', marginBottom: 14 }}><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink-2)', marginBottom: 6 }}>No webinars found</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>No webinars match the selected status filter.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {webinars.map(w => {
            /* status badge is always auto-computed; only 'cancelled' is manual */
            const autoStatus = computeWebinarStatus(w);
            const cfg        = WEBINAR_STATUS_CFG[autoStatus] || WEBINAR_STATUS_CFG.upcoming;
            const isCancelled = autoStatus === 'cancelled';
            return (
              <div key={w.id} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '18px 20px', borderLeft: `3.5px solid ${cfg.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                {/* top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{w.title}</div>
                    {w.description && (
                      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{w.description}</div>
                    )}
                  </div>
                  {/* auto status badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, color: cfg.col, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
                      {cfg.label}
                    </span>
                    {autoStatus !== 'cancelled' && (
                      <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontStyle: 'italic' }}>auto-detected</span>
                    )}
                  </div>
                </div>

                {/* meta grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '8px 20px', marginBottom: 14 }}>
                  {[
                    { ic: '👤', label: 'Presenter', val: w.presenter },
                    { ic: '📅', label: 'Date & Time', val: fmtWebinarDate(w.date, w.time) },
                    { ic: '⏱', label: 'Duration', val: w.duration ? `${w.duration} min` : '—' },
                    { ic: '💰', label: 'Price', val: w.isFree ? 'Free' : (w.price ? `₹${w.price}` : '—') },
                    { ic: '👥', label: 'Max Registrations', val: w.maxRegistration ?? '—' },
                    { ic: '🔗', label: 'Link', val: w.link || '—', link: w.link },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{m.ic} {m.label}</span>
                      {m.link
                        ? <a href={m.link} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, color: '#4F46E5', fontWeight: 600, wordBreak: 'break-all', textDecoration: 'none' }}>{m.val}</a>
                        : <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>{m.val}</span>
                      }
                    </div>
                  ))}
                </div>

                {/* tags */}
                {w.tags && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {(Array.isArray(w.tags) ? w.tags : String(w.tags).split(',')).map((tag, i) => (
                      <span key={i} style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>{String(tag).trim()}</span>
                    ))}
                  </div>
                )}

                {/* action row — only Cancel is manual */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                    {isCancelled
                      ? 'This webinar has been cancelled.'
                      : autoStatus === 'completed'
                      ? 'Webinar completed — no further actions available.'
                      : 'Status updates automatically based on date & time.'}
                  </span>
                  {!isCancelled && autoStatus !== 'completed' && (
                    <button onClick={() => setStatusModal({ webinar: w, newStatus: "cancelled" })}
                      disabled={updatingId === w.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10, border: '1.5px solid #EF4444', background: '#FFF5F5', color: '#DC2626', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: updatingId === w.id ? 'not-allowed' : 'pointer', opacity: updatingId === w.id ? 0.5 : 1, transition: 'all .15s' }}>
                      <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      Cancel Webinar
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
            {page > 1 && (
              <button onClick={() => loadWebinars(page - 1, true, statusFilter)} disabled={loading}
                style={{ padding: '9px 20px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                ← Previous
              </button>
            )}
            <span style={{ padding: '9px 16px', background: '#EEF2FF', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#4F46E5' }}>
              Page {page}
            </span>
            {hasMore && (
              <button onClick={() => loadWebinars(page + 1, true, statusFilter)} disabled={loading}
                style={{ padding: '9px 20px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                {loading ? 'Loading…' : 'Next →'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Status update confirm modal ── */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setStatusModal(null); }}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 400, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Update Status</div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 22 }}>
              Change <b>"{statusModal.webinar.title}"</b> status to{' '}
              <span style={{ fontWeight: 700, color: WEBINAR_STATUS_CFG[statusModal.newStatus]?.col }}>
                {WEBINAR_STATUS_CFG[statusModal.newStatus]?.label}
              </span>?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStatusModal(null)}
                style={{ flex: 1, padding: '11px 0', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleStatusUpdate(statusModal.webinar, statusModal.newStatus)} disabled={!!updatingId}
                style={{ flex: 2, padding: '11px 0', background: updatingId ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: updatingId ? 'not-allowed' : 'pointer' }}>
                {updatingId ? 'Updating…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Webinar modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setForm(WEBINAR_EMPTY); } }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
            {/* modal header */}
            <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 24px 18px', color: '#fff', flexShrink: 0, position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, marginBottom: 4 }}>Add New Webinar</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Fill in the details to schedule a new webinar.</div>
              <button onClick={() => { setShowForm(false); setForm(WEBINAR_EMPTY); }}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center' }}>×</button>
            </div>

            {/* modal body */}
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Title */}
              <div>
                {LBL('Title', true)}
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. How to crack FAANG interviews" style={IS} />
              </div>

              {/* Description */}
              <div>
                {LBL('Description')}
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Brief about the webinar topics, agenda, etc."
                  style={{ ...IS, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              {/* Presenter */}
              <div>
                {LBL('Presenter', true)}
                <input value={form.presenter} onChange={e => setForm(f => ({ ...f, presenter: e.target.value }))}
                  placeholder="Presenter name" style={IS} />
              </div>

              {/* Date + Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {LBL('Date', true)}
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={IS} />
                </div>
                <div>
                  {LBL('Time', true)}
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={IS} />
                </div>
              </div>

              {/* Duration + Max Registrations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {LBL('Duration (minutes)')}
                  <input type="number" min={1} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="60" style={IS} />
                </div>
                <div>
                  {LBL('Max Registrations')}
                  <input type="number" min={1} value={form.maxRegistration} onChange={e => setForm(f => ({ ...f, maxRegistration: e.target.value }))}
                    placeholder="100" style={IS} />
                </div>
              </div>

              {/* Link */}
              <div>
                {LBL('Meeting / Join Link', true)}
                <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  placeholder="https://meet.google.com/…" style={IS} />
              </div>

              {/* Pricing */}
              <div>
                {LBL('Pricing')}
                <div style={{ display: 'flex', gap: 8, marginBottom: form.isFree ? 0 : 10 }}>
                  {[{ v: true, l: 'Free' }, { v: false, l: 'Paid' }].map(({ v, l }) => (
                    <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, isFree: v }))}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${form.isFree === v ? '#4F46E5' : 'var(--border)'}`, background: form.isFree === v ? '#EEF2FF' : '#fff', color: form.isFree === v ? '#4F46E5' : 'var(--ink-3)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .15s' }}>
                      {l}
                    </button>
                  ))}
                </div>
                {!form.isFree && (
                  <input type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Price in ₹ (e.g. 99)" style={IS} />
                )}
              </div>

              {/* Submit */}
              <button onClick={handleAdd} disabled={submitting}
                style={{ padding: '13px 0', background: submitting ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: !submitting ? '0 4px 14px rgba(79,70,229,.35)' : 'none', transition: 'all .2s', marginTop: 4 }}>
                {submitting ? 'Creating…' : 'Create Webinar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Payouts view ─── */
function PayoutsView() {
  const payouts = [
    { mentor: 'Priya Nair',   amount: '₹18,400', sessions: 15, status: 'Processed', date: '01 Jun 2025' },
    { mentor: 'Aarav Sharma', amount: '₹11,970', sessions: 10, status: 'Processed', date: '01 Jun 2025' },
    { mentor: 'Rahul Verma',  amount: '₹7,190',  sessions: 6,  status: 'Pending',   date: '—' },
    { mentor: 'Sneha Singh',  amount: '₹4,790',  sessions: 4,  status: 'Pending',   date: '—' },
  ];
  return (
    <div>
      {/* summary hero */}
      <div className="payout-hero">
        {[
          { v: '₹42,350', l: 'Paid this month', ic: '💳', cls: 'b-green'  },
          { v: '₹11,980', l: 'Pending payouts', ic: '⏳', cls: 'b-amber'  },
          { v: '₹2.4Cr',  l: 'All-time GMV',    ic: '📈', cls: 'b-indigo' },
          { v: '12%',     l: 'Platform cut',    ic: '🏷',  cls: 'b-gray'   },
        ].map(k => (
          <div className="stat-card" key={k.l}>
            <div className="sc-ic" style={{ background: 'var(--bg-tint)', fontSize: 20 }}>{k.ic}</div>
            <div className="sc-n">{k.v}</div>
            <div className="sc-l">{k.l}</div>
          </div>
        ))}
      </div>

      {/* filter bar */}
      <div className="filter-bar">
        <div className="seg-row">
          {['All', 'Pending', 'Processed'].map(f => (
            <button key={f} className="chip">{f}</button>
          ))}
        </div>
        <button className="btn btn-soft btn-sm" style={{ marginLeft: 'auto' }}>Pay all pending</button>
        <div className="fb-search">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input type="text" placeholder="Search mentor…" />
        </div>
      </div>

      {/* table */}
      <div className="d-table-wrap">
        <table className="d-table">
          <thead><tr><th>Mentor</th><th>Sessions</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {payouts.map((p, i) => (
              <tr key={i}>
                <td><div className="u-cell"><div className="u-av" style={{ background: nameColorAd(p.mentor) }}>{p.mentor.split(' ').map(w=>w[0]).join('').slice(0,2)}</div><div className="u-n">{p.mentor}</div></div></td>
                <td>{p.sessions}</td>
                <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>{p.amount}</span></td>
                <td><StatusPill s={p.status} /></td>
                <td>{p.date}</td>
                <td><div className="row-actions">{p.status === 'Pending' && <button className="ra good">Pay now</button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Jobs view ─── */
function JobsView() {
  const todayISO = new Date().toISOString().split('T')[0];
  const EMPTY = {
    companyName: '', location: '', contact: '', email: '',
    techStack: [], noOfPosition: 1, jobType: 'full',
    jobCategory: 'private', hiringPersonName: '',
    qualification: [], isActive: true, position: '',
    experienceRequired: '', description: '',
    jobPostDate: todayISO,
  };

  const [view,       setView]       = useState('list');   // default = list
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editJob,    setEditJob]    = useState(null);     // job object being edited
  const [tagInput,   setTagInput]   = useState({ techStack: '', qualification: '' });
  const [submitting, setSubmitting] = useState(false);

  const isEditing = editJob !== null;
  const jobId     = (job) => job?._id ?? job?.id ?? null;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await httpService.get('/jobs', { token: true });
      setJobs(res?.data ?? (Array.isArray(res) ? res : []));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []); // eslint-disable-line

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const addTag = (field) => {
    const val = tagInput[field].trim();
    if (!val || form[field].includes(val)) return;
    setForm(f => ({ ...f, [field]: [...f[field], val] }));
    setTagInput(t => ({ ...t, [field]: '' }));
  };
  const removeTag = (field, tag) => setForm(f => ({ ...f, [field]: f[field].filter(t => t !== tag) }));
  const handleTagKey = (field, e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(field); } };

  const cancelForm = () => {
    setEditJob(null);
    setForm(EMPTY);
    setTagInput({ techStack: '', qualification: '' });
    setView('list');
  };

  const buildPayload = () => ({
    companyName:        form.companyName        || '',
    location:           form.location           || '',
    contact:            form.contact            || '',
    email:              form.email              || '',
    techStack:          Array.isArray(form.techStack)     ? form.techStack     : [],
    noOfPosition:       Number(form.noOfPosition)         || 1,
    jobPostDate:        form.jobPostDate
                          ? new Date(form.jobPostDate).toISOString()
                          : new Date().toISOString(),
    jobType:            form.jobType            || 'full',
    jobCategory:        form.jobCategory        || 'private',
    hiringPersonName:   form.hiringPersonName   || '',
    qualification:      Array.isArray(form.qualification) ? form.qualification : [],
    isActive:           Boolean(form.isActive),
    position:           form.position           || '',
    experienceRequired: form.experienceRequired || '',
    description:        form.description        || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const id      = jobId(editJob);
      if (isEditing && id) {
        const res     = await httpService.put(`/jobs/${id}`, { data: payload, token: true });
        const updated = res?.data || res;
        setJobs(prev => prev.map(j => jobId(j) === id ? { ...j, ...updated } : j));
        toast.success('Job updated successfully!');
      } else {
        const res     = await httpService.post('/jobs', { data: payload, token: true });
        const created = res?.data || res;
        setJobs(prev => [...prev, { ...payload, ...created }]);
        toast.success('Job posted successfully!');
      }
      cancelForm();
    } catch {}
    finally { setSubmitting(false); }
  };

  const startEdit = (job) => {
    const dateStr = job.jobPostDate
      ? new Date(job.jobPostDate).toISOString().split('T')[0]
      : todayISO;
    setEditJob(job);
    setForm({
      ...EMPTY, ...job,
      techStack:    Array.isArray(job.techStack)    ? job.techStack    : [],
      qualification:Array.isArray(job.qualification)? job.qualification: [],
      jobPostDate:  dateStr,
    });
    setTagInput({ techStack: '', qualification: '' });
    setView('form');
  };

  const toggleActive = async (job) => {
    const id     = jobId(job);
    const newVal = !job.isActive;
    setJobs(prev => prev.map(j => jobId(j) === id ? { ...j, isActive: newVal } : j));
    try {
      await httpService.put(`/jobs/${id}`, {
        data: {
          companyName:        job.companyName        || '',
          location:           job.location           || '',
          contact:            job.contact            || '',
          email:              job.email              || '',
          techStack:          Array.isArray(job.techStack)     ? job.techStack     : [],
          noOfPosition:       Number(job.noOfPosition)         || 1,
          jobPostDate:        job.jobPostDate
                                ? new Date(job.jobPostDate).toISOString()
                                : new Date().toISOString(),
          jobType:            job.jobType            || 'full',
          jobCategory:        job.jobCategory        || 'private',
          hiringPersonName:   job.hiringPersonName   || '',
          qualification:      Array.isArray(job.qualification) ? job.qualification : [],
          isActive:           newVal,
          position:           job.position           || '',
          experienceRequired: job.experienceRequired || '',
          description:        job.description        || '',
        },
        token: true,
      });
    } catch {
      setJobs(prev => prev.map(j => jobId(j) === id ? { ...j, isActive: job.isActive } : j));
    }
  };

  const inStyle    = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--ink)', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 5, display: 'block' };
  const fieldStyle = { display: 'flex', flexDirection: 'column' };
  const JOB_TYPE_LABEL = { full: 'Full-time', internship: 'Internship', part: 'Part-time', contract: 'Contract' };

  return (
    <div>
      {/* ── header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>
            {isEditing ? 'Edit Job' : view === 'form' ? 'Post New Job' : 'Job Listings'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>
            {isEditing
              ? 'Update the details below and save.'
              : view === 'form'
              ? 'Fill in the details to post a new job opening.'
              : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} listed on the platform.`}
          </p>
        </div>
        {view === 'list' ? (
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { setEditJob(null); setForm(EMPTY); setTagInput({ techStack: '', qualification: '' }); setView('form'); }}
          >
            <svg viewBox="0 0 24 24" fill="none" width={14} height={14}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
            Post New Job
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={cancelForm}>
            ← Back to Jobs
          </button>
        )}
      </div>

      {/* ── form ── */}
      {view === 'form' && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 18 }}>
            <div style={fieldStyle}><label style={labelStyle}>Company Name *</label><input style={inStyle} name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Mixins Technology" required /></div>
            <div style={fieldStyle}><label style={labelStyle}>Position / Role *</label><input style={inStyle} name="position" value={form.position} onChange={handleChange} placeholder="e.g. Full Stack Developer" required /></div>
            <div style={fieldStyle}><label style={labelStyle}>Location</label><input style={inStyle} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Pune, Maharashtra" /></div>
            <div style={fieldStyle}><label style={labelStyle}>Hiring Person Name</label><input style={inStyle} name="hiringPersonName" value={form.hiringPersonName} onChange={handleChange} placeholder="e.g. Dharmendra Patel" /></div>
            <div style={fieldStyle}><label style={labelStyle}>Contact Number</label><input style={inStyle} name="contact" value={form.contact} onChange={handleChange} placeholder="e.g. 9876543210" type="tel" /></div>
            <div style={fieldStyle}><label style={labelStyle}>Contact Email</label><input style={inStyle} name="email" value={form.email} onChange={handleChange} placeholder="e.g. hr@company.com" type="email" /></div>
            <div style={fieldStyle}><label style={labelStyle}>No. of Positions</label><input style={inStyle} name="noOfPosition" value={form.noOfPosition} onChange={handleChange} type="number" min="1" /></div>
            <div style={fieldStyle}><label style={labelStyle}>Experience Required</label><input style={inStyle} name="experienceRequired" value={form.experienceRequired} onChange={handleChange} placeholder="e.g. 0-1 year" /></div>
            <div style={fieldStyle}><label style={labelStyle}>Job Type</label><select style={inStyle} name="jobType" value={form.jobType} onChange={handleChange}><option value="full">Full-time</option><option value="internship">Internship</option><option value="part">Part-time</option><option value="contract">Contract</option></select></div>
            <div style={fieldStyle}><label style={labelStyle}>Job Category</label><select style={inStyle} name="jobCategory" value={form.jobCategory} onChange={handleChange}><option value="private">Private</option><option value="government">Government</option><option value="startup">Startup</option><option value="mnc">MNC</option></select></div>
            {/* Job Post Date */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Job Post Date</label>
              <input
                style={inStyle}
                name="jobPostDate"
                value={form.jobPostDate || ''}
                onChange={handleChange}
                type="date"
              />
            </div>
          </div>

          {/* Tech Stack tags */}
          <div style={{ ...fieldStyle, marginBottom: 18 }}>
            <label style={labelStyle}>Tech Stack</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: form.techStack.length ? 8 : 0 }}>
              {form.techStack.map(t => <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, padding: '3px 10px', borderRadius: 100, background: 'var(--bg-tint)', color: 'var(--ink)', fontWeight: 600 }}>{t}<button type="button" onClick={() => removeTag('techStack', t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button></span>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}><input style={{ ...inStyle, flex: 1 }} value={tagInput.techStack} onChange={e => setTagInput(t => ({ ...t, techStack: e.target.value }))} onKeyDown={e => handleTagKey('techStack', e)} placeholder="Type skill and press Enter" /><button type="button" className="btn btn-ghost btn-sm" onClick={() => addTag('techStack')}>Add</button></div>
          </div>

          {/* Qualification tags */}
          <div style={{ ...fieldStyle, marginBottom: 18 }}>
            <label style={labelStyle}>Qualification</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: form.qualification.length ? 8 : 0 }}>
              {form.qualification.map(q => <span key={q} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, padding: '3px 10px', borderRadius: 100, background: '#EEF2FF', color: 'var(--indigo)', fontWeight: 600 }}>{q}<button type="button" onClick={() => removeTag('qualification', q)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--indigo)', opacity: 0.7, padding: 0, fontSize: 14, lineHeight: 1 }}>×</button></span>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}><input style={{ ...inStyle, flex: 1 }} value={tagInput.qualification} onChange={e => setTagInput(t => ({ ...t, qualification: e.target.value }))} onKeyDown={e => handleTagKey('qualification', e)} placeholder="Type qualification and press Enter" /><button type="button" className="btn btn-ghost btn-sm" onClick={() => addTag('qualification')}>Add</button></div>
          </div>

          {/* Description */}
          <div style={{ ...fieldStyle, marginBottom: 18 }}>
            <label style={labelStyle}>Job Description</label>
            <textarea style={{ ...inStyle, minHeight: 90, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} placeholder="Describe the role, responsibilities, and requirements..." />
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <span style={{ ...labelStyle, margin: 0 }}>Active Listing</span>
            <ToggleSwitch value={form.isActive} onChange={(v) => setForm(f => ({ ...f, isActive: v }))} />
            <span style={{ fontSize: 13, color: form.isActive ? '#10B981' : 'var(--ink-3)', fontWeight: 600 }}>
              {form.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (isEditing ? 'Updating…' : 'Posting…') : (isEditing ? 'Update Job' : 'Post Job')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={cancelForm} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── list ── */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>Loading jobs…</div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
              No jobs posted yet.
              <button className="btn btn-ghost btn-sm" onClick={() => setView('form')} style={{ marginLeft: 10 }}>+ Post one</button>
            </div>
          ) : jobs.map(job => (
            <div className="card" key={jobId(job) ?? job.position} style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{job.position}</div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: job.jobType === 'internship' ? '#FEF3C7' : '#E5EEFE', color: job.jobType === 'internship' ? '#B45309' : 'var(--indigo)' }}>
                      {JOB_TYPE_LABEL[job.jobType] || job.jobType}
                    </span>
                    <StatusPill s={job.isActive ? 'active' : 'inactive'} />
                  </div>
                  {/* company + location */}
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, marginBottom: 2 }}>
                    {job.companyName}{job.location ? ` · ${job.location}` : ''}
                  </div>
                  {/* meta row */}
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 6, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {job.experienceRequired && <span>{job.experienceRequired}</span>}
                    <span>{job.noOfPosition} position{job.noOfPosition > 1 ? 's' : ''}</span>
                    {job.jobCategory && <span>{job.jobCategory}</span>}
                    {job.jobPostDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--indigo,#4F46E5)', fontWeight: 600 }}>
                        <svg viewBox="0 0 24 24" fill="none" width={12} height={12}><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        Posted {fmtDateAd(job.jobPostDate)}
                      </span>
                    )}
                  </div>
                  {/* tech stack */}
                  {job.techStack?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
                      {job.techStack.map(t => <span key={t} className="kv">{t}</span>)}
                    </div>
                  )}
                  {/* qualifications */}
                  {job.qualification?.length > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>
                      Qualifications: {job.qualification.join(', ')}
                    </div>
                  )}
                </div>

                {/* actions */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    className="btn btn-soft btn-sm"
                    style={{ fontSize: 12 }}
                    onClick={() => startEdit(job)}
                  >
                    Edit
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <ToggleSwitch value={job.isActive} onChange={() => toggleActive(job)} />
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: job.isActive ? '#10B981' : 'var(--ink-3)' }}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Feedback & Ratings ─── */

const REVIEW_DATA = [
  { sid:'DN', sname:'Diya Nair',    slevel:'Working pro', sbg:'#6366F1', mid:'RJ', mname:'Rohan Joshi',   mbg:'#8B5CF6', stars:2, comment:'Audio kept cutting and session felt wasted.',              when:'9d ago'  },
  { sid:'MD', sname:'Manav Das',    slevel:'3rd year',    sbg:'#10B981', mid:'VV', mname:'Vikram Verma',  mbg:'#14B8A6', stars:5, comment:'Explained everything so clearly, finally understood it.',  when:'11d ago' },
  { sid:'MR', sname:'Meera Roy',    slevel:'3rd year',    sbg:'#22C55E', mid:'AN', mname:'Ananya Nair',   mbg:'#10B981', stars:4, comment:'Explained everything so clearly, finally understood it.',  when:'19d ago' },
  { sid:'VJ', sname:'Veer Joshi',   slevel:'2nd year',    sbg:'#8B5CF6', mid:'VB', mname:'Veer Banerjee', mbg:'#4F46E5', stars:4, comment:'Explained everything so clearly, finally understood it.',  when:'23d ago' },
  { sid:'IR', sname:'Ira Roy',      slevel:'Graduate',    sbg:'#EF4444', mid:'RP', mname:'Rahul Pillai',  mbg:'#6366F1', stars:1, comment:'Felt unprepared and kept checking the time.',              when:'27d ago' },
  { sid:'RS', sname:'Rohan Shah',   slevel:'Graduate',    sbg:'#14B8A6', mid:'VP', mname:'Vikram Patel',  mbg:'#6366F1', stars:2, comment:'Generic advice, nothing specific to my profile.',          when:'1mo ago' },
  { sid:'RS', sname:'Riya Shah',    slevel:'Working pro', sbg:'#EC4899', mid:'TP', mname:'Tara Pillai',   mbg:'#4F46E5', stars:4, comment:'Got actionable feedback I could use right away.',          when:'1mo ago' },
  { sid:'KR', sname:'Karan Rao',    slevel:'3rd year',    sbg:'#F97316', mid:'VP', mname:'Vikram Patel',  mbg:'#6366F1', stars:1, comment:'Audio kept cutting and session felt wasted.',              when:'1mo ago' },
  { sid:'AA', sname:'Arjun Ahuja',  slevel:'Working pro', sbg:'#6366F1', mid:'NK', mname:'Neha Kumar',    mbg:'#EC4899', stars:5, comment:'Best mentoring session I have had in years.',              when:'2mo ago' },
  { sid:'PG', sname:'Priya Gupta',  slevel:'1st year',    sbg:'#10B981', mid:'RJ', mname:'Rohan Joshi',   mbg:'#8B5CF6', stars:3, comment:'Session was okay but could be more focused.',             when:'2mo ago' },
  { sid:'SB', sname:'Sneha Bhat',   slevel:'2nd year',    sbg:'#F59E0B', mid:'VB', mname:'Veer Banerjee', mbg:'#4F46E5', stars:5, comment:'Absolutely loved the structured approach.',               when:'2mo ago' },
  { sid:'RM', sname:'Rohan Mehta',  slevel:'Graduate',    sbg:'#6366F1', mid:'AN', mname:'Ananya Nair',   mbg:'#10B981', stars:2, comment:'Questions were deflected instead of answered.',           when:'2mo ago' },
  { sid:'NK', sname:'Nidhi Kapoor', slevel:'3rd year',    sbg:'#14B8A6', mid:'TP', mname:'Tara Pillai',   mbg:'#4F46E5', stars:5, comment:'The mentor went above and beyond to help.',               when:'3mo ago' },
  { sid:'AS', sname:'Aditya Sen',   slevel:'Working pro', sbg:'#EC4899', mid:'RP', mname:'Rahul Pillai',  mbg:'#6366F1', stars:4, comment:'Very insightful and practical advice.',                   when:'3mo ago' },
  { sid:'DK', sname:'Divya Kaur',   slevel:'1st year',    sbg:'#8B5CF6', mid:'VV', mname:'Vikram Verma',  mbg:'#14B8A6', stars:1, comment:'Felt like reading from a script, no real guidance.',      when:'3mo ago' },
  { sid:'MM', sname:'Mohit Mishra', slevel:'2nd year',    sbg:'#10B981', mid:'RJ', mname:'Rohan Joshi',   mbg:'#8B5CF6', stars:3, comment:'Decent session but lacked depth on key topics.',          when:'3mo ago' },
  { sid:'SJ', sname:'Shreya Jain',  slevel:'Graduate',    sbg:'#F97316', mid:'NK', mname:'Neha Kumar',    mbg:'#EC4899', stars:4, comment:'She really understood my situation and helped clearly.',   when:'3mo ago' },
  { sid:'VP', sname:'Vishal Pal',   slevel:'Working pro', sbg:'#6366F1', mid:'VB', mname:'Veer Banerjee', mbg:'#4F46E5', stars:5, comment:'Outstanding mentor, highly recommend to everyone.',        when:'4mo ago' },
  { sid:'TS', sname:'Tanvi Sharma', slevel:'3rd year',    sbg:'#14B8A6', mid:'VP', mname:'Vikram Patel',  mbg:'#6366F1', stars:2, comment:'Seemed distracted throughout the entire session.',        when:'4mo ago' },
  { sid:'KP', sname:'Kabir Patel',  slevel:'1st year',    sbg:'#EC4899', mid:'AN', mname:'Ananya Nair',   mbg:'#10B981', stars:4, comment:'Super helpful and well-structured guidance.',              when:'4mo ago' },
  { sid:'RN', sname:'Rita Nair',    slevel:'Graduate',    sbg:'#8B5CF6', mid:'TP', mname:'Tara Pillai',   mbg:'#4F46E5', stars:1, comment:'No roadmap given, just very generic suggestions.',         when:'4mo ago' },
  { sid:'VK', sname:'Vivek Kumar',  slevel:'2nd year',    sbg:'#F59E0B', mid:'RP', mname:'Rahul Pillai',  mbg:'#6366F1', stars:5, comment:'Transformed my career outlook completely.',               when:'5mo ago' },
];

function FeedbackView() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);
  const PER = 8;

  const filtered = REVIEW_DATA.filter(r => {
    if (filter === 'negative' && r.stars > 2) return false;
    if (filter === 'positive' && r.stars < 4) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.sname.toLowerCase().includes(q) && !r.mname.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER);
  const paged      = filtered.slice((page - 1) * PER, page * PER);

  const avg  = (REVIEW_DATA.reduce((s, r) => s + r.stars, 0) / REVIEW_DATA.length).toFixed(2);
  const neg  = REVIEW_DATA.filter(r => r.stars <= 2).length;
  const five = REVIEW_DATA.filter(r => r.stars === 5).length;

  const Stars = ({ n }) => (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 24 24" width="15" height="15"
          fill={i <= n ? '#F59E0B' : 'none'}
          stroke={i <= n ? '#F59E0B' : '#D1D5DB'}
          strokeWidth="1.8">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { n: avg,                    l: 'Average rating',  col: 'var(--ink)' },
          { n: REVIEW_DATA.length,     l: 'Total reviews',   col: 'var(--ink)' },
          { n: neg,                    l: 'Negative (1–2★)', col: '#DC2626'    },
          { n: five,                   l: '5★ reviews',      col: '#10B981'    },
        ].map(s => (
          <div key={s.l} className="panel" style={{ padding: '20px 22px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: s.col, lineHeight: 1, marginBottom: 6 }}>{s.n}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="seg-row">
          {[['all','All reviews'],['negative','Negative (1–2★)'],['positive','Positive (4–5★)']].map(([v,lbl]) => (
            <button key={v} className={`chip${filter===v?' active':''}`}
              onClick={() => { setFilter(v); setPage(1); }}>{lbl}</button>
          ))}
        </div>
        <div className="fb-search">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search mentor, student..."/>
        </div>
      </div>

      {/* Table */}
      <div className="d-table-wrap">
        <table className="d-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Mentor</th>
              <th>Rating</th>
              <th style={{ minWidth: 220 }}>Comment</th>
              <th>When</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r, i) => {
              const isNeg = r.stars <= 2;
              return (
                <tr key={i} style={{ background: isNeg ? '#FFF7F7' : undefined }}>
                  <td style={{ position: 'relative', paddingLeft: isNeg ? 22 : undefined }}>
                    {isNeg && (
                      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#EF4444', borderRadius: '2px 0 0 2px' }}/>
                    )}
                    <div className="u-cell">
                      <div className="u-av" style={{ background: r.sbg }}>{r.sid}</div>
                      <div className="u-n"><b>{r.sname}</b><span>{r.slevel}</span></div>
                    </div>
                  </td>
                  <td>
                    <div className="u-cell">
                      <div className="u-av" style={{ background: r.mbg }}>{r.mid}</div>
                      <div className="u-n"><b>{r.mname}</b></div>
                    </div>
                  </td>
                  <td><Stars n={r.stars}/></td>
                  <td style={{ color: isNeg ? '#C2410C' : 'var(--ink-2)', fontStyle: 'italic', maxWidth: 260, fontSize: 13 }}>
                    "{r.comment}"
                  </td>
                  <td style={{ color: 'var(--ink-3)', fontSize: 13, whiteSpace: 'nowrap' }}>{r.when}</td>
                  <td>
                    <div className="row-actions" style={{ flexDirection: 'column', gap: 5, alignItems: 'stretch' }}>
                      <button className="ra">Flag</button>
                      <button className="ra danger">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pager">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>←</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>→</button>
        <span className="pg-info">{(page-1)*PER+1}–{Math.min(page*PER, filtered.length)} of {filtered.length}</span>
      </div>
    </div>
  );
}

/* ─── Admin Support Tickets ─── */
const TICKET_STATUS_CFG = {
  active:        { label: 'Open',        bg: '#EEF2FF', col: '#4F46E5', border: '#4F46E5', dot: '#4F46E5' },
  'in-progress': { label: 'In Progress', bg: '#FEF3DA', col: '#B45309', border: '#F59E0B', dot: '#F59E0B' },
  done:          { label: 'Resolved',    bg: '#DCFCE7', col: '#15803D', border: '#22C55E', dot: '#22C55E' },
  hold:          { label: 'On Hold',     bg: '#FEF9C3', col: '#92400E', border: '#FCD34D', dot: '#FCD34D' },
  reject:        { label: 'Rejected',    bg: '#FEE2E2', col: '#DC2626', border: '#EF4444', dot: '#EF4444' },
};
const TICKET_STATUS_KEYS  = ['active','in-progress','done','hold','reject'];
const TICKET_PRIORITY_CFG = {
  high:   { label: 'High',   col: '#DC2626', bg: '#FEE2E2', cls: 'high'   },
  medium: { label: 'Medium', col: '#B45309', bg: '#FEF3DA', cls: 'medium' },
  low:    { label: 'Low',    col: '#15803D', bg: '#DCFCE7', cls: 'low'    },
};
const COMMENT_STATUSES = ['active','in-progress','done','hold','reject'];

const fmtTicketDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* decode logged-in user id from JWT */
function getLoggedInUserId() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const p = JSON.parse(atob(token.split('.')[1]));
    return p.id ?? p.userId ?? null;
  } catch { return null; }
}

/* decode logged-in admin info from JWT */
function getAdminInfo() {
  try {
    const token = Cookies.get('token');
    if (!token) return { name: 'Admin', role: 'admin' };
    const p = JSON.parse(atob(token.split('.')[1]));
    return {
      name: p.name || p.firstName || p.email || 'Admin',
      role: p.role || p.userType  || 'admin',
    };
  } catch { return { name: 'Admin', role: 'admin' }; }
}

function AdminTicketsView() {
  const adminInfo = useRef(getAdminInfo());

  const [tickets,        setTickets]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search,         setSearch]         = useState('');
  const [page,           setPage]           = useState(1);
  const [hasMore,        setHasMore]        = useState(false);
  const [expanded,       setExpanded]       = useState(null);
  const [commentTicket,  setCommentTicket]  = useState(null);
  const [commentForm,    setCommentForm]    = useState({ status: 'in-progress', name: adminInfo.current.name, comment: '' });
  const [posting,        setPosting]        = useState(false);
  const chatEndRef = useRef(null);

  const loadTickets = async (pg = 1, replace = true) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10, activeOnly: false };
      const res  = await httpService.get('/supportTicket', { params, token: true });
      const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setTickets(prev => replace ? data : [...prev, ...data]);
      setHasMore(data.length === 10);
      setPage(pg);
    } catch { if (replace) setTickets([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { loadTickets(1, true); }, []);

  const openComment = (t) => {
    const tid = t.id || t._id;
    setCommentTicket(t);
    setExpanded(tid);
    setCommentForm({ status: t.status || 'active', name: adminInfo.current.name, comment: '' });
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const handlePostComment = async () => {
    if (!commentTicket || !commentForm.comment.trim()) {
      toast.error('Please enter a comment.');
      return;
    }
    setPosting(true);
    try {
      await httpService.post(`/supportTicket/comment/${commentTicket.id || commentTicket._id}`, {
        data: {
          status:  commentForm.status,
          name:    commentForm.name,
          role:    adminInfo.current.role,
          comment: commentForm.comment,
        },
        token: true,
      });
      toast.success('Comment posted!');
      setCommentTicket(null);
      loadTickets(1, true);
    } catch {}
    finally { setPosting(false); }
  };

  /* counts per status (before status/priority filter, just from all tickets) */
  const statusCounts = TICKET_STATUS_KEYS.reduce((acc, k) => {
    acc[k] = tickets.filter(t => t.status === k).length;
    return acc;
  }, { all: tickets.length });

  const priorityCounts = ['high','medium','low'].reduce((acc, k) => {
    acc[k] = tickets.filter(t => t.priority === k).length;
    return acc;
  }, {});

  const filtered = tickets.filter(t => {
    if (statusFilter   !== 'all' && t.status   !== statusFilter)   return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (t.title||'').toLowerCase().includes(q) ||
             (t.name||'').toLowerCase().includes(q)  ||
             (t.email||'').toLowerCase().includes(q) ||
             (t.ticketCode||'').toLowerCase().includes(q);
    }
    return true;
  });

  const IS = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', outline: 'none', background: '#fff' };
  const LBL = (txt, req) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
      {txt}{req && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
  );

  return (
    <div className="panel">
      <div className="panel-head"><h2>Support Tickets</h2></div>

      {/* ── stat cards ── */}
      <div className="tc-stat-grid" style={{ marginBottom: 22 }}>
        {[
          { n: statusCounts.all,          l: 'Total',       col: 'var(--ink)' },
          { n: statusCounts.active,       l: 'Open',         col: '#4F46E5'    },
          { n: statusCounts['in-progress'],l: 'In Progress', col: '#B45309'    },
          { n: statusCounts.done,         l: 'Resolved',     col: '#15803D'    },
        ].map(s => (
          <div key={s.l} className="tc-stat">
            <div className="tc-stat-n" style={{ color: s.col }}>{s.n}</div>
            <div className="tc-stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── filter bar ── */}
      <div style={{ background: '#F8FAFC', border: '1.5px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
        {/* search row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ color: 'var(--ink-3)', flexShrink: 0 }}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, title, ticket code…"
              style={{ border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)', background: 'transparent', width: '100%', fontFamily: 'var(--font-body)' }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            )}
          </div>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
            <button onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearch(''); }}
              style={{ padding: '8px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Clear filters
            </button>
          )}
        </div>

        {/* status pills */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Status</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {/* All pill */}
            <button onClick={() => setStatusFilter('all')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${statusFilter === 'all' ? '#4F46E5' : 'var(--border)'}`, background: statusFilter === 'all' ? '#EEF2FF' : '#fff', color: statusFilter === 'all' ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
              All
              <span style={{ background: statusFilter === 'all' ? '#4F46E5' : '#E2E8F0', color: statusFilter === 'all' ? '#fff' : 'var(--ink-3)', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{statusCounts.all}</span>
            </button>
            {TICKET_STATUS_KEYS.map(k => {
              const cfg = TICKET_STATUS_CFG[k];
              const active = statusFilter === k;
              return (
                <button key={k} onClick={() => setStatusFilter(k)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.col : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                  {cfg.label}
                  <span style={{ background: active ? cfg.col : '#E2E8F0', color: active ? '#fff' : 'var(--ink-3)', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{statusCounts[k] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* priority pills */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Priority</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button onClick={() => setPriorityFilter('all')}
              style={{ padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${priorityFilter === 'all' ? '#4F46E5' : 'var(--border)'}`, background: priorityFilter === 'all' ? '#EEF2FF' : '#fff', color: priorityFilter === 'all' ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
              All
            </button>
            {['high','medium','low'].map(k => {
              const cfg = TICKET_PRIORITY_CFG[k];
              const active = priorityFilter === k;
              return (
                <button key={k} onClick={() => setPriorityFilter(k)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.col : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
                  {cfg.label}
                  <span style={{ background: active ? cfg.col : '#E2E8F0', color: active ? '#fff' : 'var(--ink-3)', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{priorityCounts[k] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* results summary */}
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>
        Showing <b style={{ color: 'var(--ink)' }}>{filtered.length}</b> ticket{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== tickets.length && <span> (filtered from {tickets.length})</span>}
      </div>

      {/* ── ticket list ── */}
      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)' }}>No tickets match the current filters.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(t => {
            const st     = TICKET_STATUS_CFG[t.status] || TICKET_STATUS_CFG.active;
            const pri    = TICKET_PRIORITY_CFG[t.priority] || TICKET_PRIORITY_CFG.medium;
            const tid    = t.id || t._id;
            const isOpen = expanded === tid;
            const comments = Array.isArray(t.comments) ? t.comments : (t.comments ? [t.comments] : []);

            return (
              <div key={tid} className="tc-card" style={{ borderLeft: `3.5px solid ${st.border}` }}>
                {/* header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.03em' }}>
                    #{t.ticketCode || String(tid).slice(-5).padStart(5,'0')}
                  </span>
                  <span className={`tc-priority ${pri.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg viewBox="0 0 24 24" fill="none" width="8" height="8"><circle cx="12" cy="12" r="9" fill="currentColor"/></svg>
                    {pri.label}
                  </span>
                  <span style={{ background: st.bg, color: st.col, fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 100, marginLeft: 'auto', border: `1px solid ${st.border}20` }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block', marginRight: 5, verticalAlign: 'middle' }} />
                    {st.label}
                  </span>
                  <button
                    onClick={() => t.status !== 'done' && openComment(t)}
                    style={{
                      padding: '5px 14px',
                      background: t.status === 'done' ? '#E5E7EB' : 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                      color: t.status === 'done' ? '#9CA3AF' : '#fff',
                      border: 'none', borderRadius: 8,
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5,
                      cursor: t.status === 'done' ? 'not-allowed' : 'pointer',
                      flexShrink: 0,
                      boxShadow: t.status === 'done' ? 'none' : '0 2px 8px rgba(79,70,229,.3)',
                      pointerEvents: t.status === 'done' ? 'none' : 'auto',
                      opacity: t.status === 'done' ? 0.6 : 1,
                    }}
                  >
                    {t.status === 'done' ? 'Reply' : 'Reply'}
                  </button>
                </div>

                {/* user info chips */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  {t.name  && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-2)', background: 'var(--surface-2)', padding: '3px 9px', borderRadius: 99 }}>👤 {t.name}</span>}
                  {t.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-2)', background: 'var(--surface-2)', padding: '3px 9px', borderRadius: 99 }}>✉ {t.email}</span>}
                  {t.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-2)', background: 'var(--surface-2)', padding: '3px 9px', borderRadius: 99 }}>📞 {t.phone}</span>}
                </div>

                {/* title + description */}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6, overflow: 'hidden', display: isOpen ? 'block' : '-webkit-box', WebkitLineClamp: isOpen ? 'unset' : 2, WebkitBoxOrient: 'vertical' }}>
                  {t.description}
                </div>

                {/* comments section — always visible when expanded */}
                {isOpen && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                      Comments ({comments.length})
                    </div>
                    {comments.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#F8FAFC', border: '1px dashed var(--border)', borderRadius: 10 }}>
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ color: '#CBD5E1', flexShrink: 0 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>No comments yet. Use Reply to respond to this ticket.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {comments.map((c, i) => (
                          <div key={i} style={{ background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>{c.name}</span>
                                {c.role && <span style={{ fontSize: 11, fontWeight: 600, background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 99 }}>{c.role}</span>}
                                {c.status && TICKET_STATUS_CFG[c.status] && (
                                  <span style={{ fontSize: 11, fontWeight: 700, background: TICKET_STATUS_CFG[c.status].bg, color: TICKET_STATUS_CFG[c.status].col, padding: '2px 8px', borderRadius: 99 }}>
                                    {TICKET_STATUS_CFG[c.status].label}
                                  </span>
                                )}
                              </div>
                              {c.createdAt && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{fmtTicketDate(c.createdAt)}</span>}
                            </div>
                            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{c.comment}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-3)' }}>
                    <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    {fmtTicketDate(t.createdAt)}
                    {comments.length > 0 && <span style={{ marginLeft: 8, background: '#EEF2FF', color: '#4F46E5', padding: '2px 7px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>}
                  </span>
                  <button onClick={() => setExpanded(prev => prev === tid ? null : tid)}
                    style={{ background: 'none', border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--indigo)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isOpen ? 'Show less' : 'View details'}
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d={isOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <button onClick={() => loadTickets(page + 1, false)} disabled={loading}
              style={{ alignSelf: 'center', padding: '9px 24px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}

      {/* ── Comment / Reply modal ── */}
      {commentTicket && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setCommentTicket(null); }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
            {/* modal header */}
            <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 24px 18px', color: '#fff', flexShrink: 0, position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Reply to Ticket</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                #{commentTicket.ticketCode || String(commentTicket.id).slice(-5).padStart(5,'0')} &nbsp;·&nbsp; {commentTicket.title}
              </div>
              <button onClick={() => setCommentTicket(null)}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center' }}>×</button>
            </div>

            {/* ── chat thread ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, background: '#F6F8FD', minHeight: 180 }}>

              {/* original ticket message — always user side */}
              {commentTicket.description && (() => {
                const initials = (commentTicket.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
                return (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#CBD5E1', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{initials}</div>
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 3 }}>{commentTicket.name || 'User'} <span style={{ fontWeight: 400, opacity: 0.7 }}>· Original</span></div>
                      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px 14px 14px 14px', padding: '10px 13px', fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                        {commentTicket.description}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{fmtTicketDate(commentTicket.createdAt)}</div>
                    </div>
                  </div>
                );
              })()}

              {/* comment thread */}
              {(Array.isArray(commentTicket.comments) ? commentTicket.comments : []).map((c, i) => {
                const isAdmin = ['admin','support'].includes((c.role||'').toLowerCase());
                const initials = (c.name || (isAdmin ? 'A' : 'U')).split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
                const statusCfg = c.status ? TICKET_STATUS_CFG[c.status] : null;
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: isAdmin ? 'row-reverse' : 'row' }}>
                    {/* avatar */}
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: isAdmin ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : '#CBD5E1', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{initials}</div>
                    {/* bubble */}
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 3, textAlign: isAdmin ? 'right' : 'left' }}>
                        {c.name}
                        <span style={{ background: isAdmin ? '#EEF2FF' : '#F1F5F9', color: isAdmin ? '#4F46E5' : 'var(--ink-3)', padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, marginLeft: 5 }}>{c.role}</span>
                      </div>
                      <div style={{ background: isAdmin ? 'linear-gradient(135deg,#4F46E5,#6D28D9)' : '#fff', border: isAdmin ? 'none' : '1px solid #E2E8F0', borderRadius: isAdmin ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '10px 13px', fontSize: 13.5, color: isAdmin ? '#fff' : 'var(--ink)', lineHeight: 1.6, boxShadow: isAdmin ? '0 2px 10px rgba(79,70,229,.25)' : '0 1px 4px rgba(0,0,0,.06)' }}>
                        {c.comment}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3, textAlign: isAdmin ? 'right' : 'left', display: 'flex', gap: 6, alignItems: 'center', justifyContent: isAdmin ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
                        {statusCfg && <span style={{ background: statusCfg.bg, color: statusCfg.col, padding: '1px 7px', borderRadius: 99, fontSize: 10.5, fontWeight: 700 }}>{statusCfg.label}</span>}
                        {fmtTicketDate(c.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* ── reply form ── */}
            <div style={{ padding: '16px 20px 20px', borderTop: '1.5px solid var(--border)', background: '#fff', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* identity row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  {LBL('Your Name')}
                  <input value={commentForm.name} onChange={e => setCommentForm(f => ({ ...f, name: e.target.value }))}
                    style={IS} placeholder="Your name" />
                </div>
                <div>
                  {LBL('Role')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', border: '1.5px solid var(--border)', borderRadius: 10, background: '#F8FAFC', userSelect: 'none' }}>
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" style={{ color: 'var(--ink-3)', flexShrink: 0 }}><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    <span style={{ fontWeight: 600, color: 'var(--ink-2)', fontSize: 14 }}>{adminInfo.current.role}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#EEF2FF', color: '#4F46E5', padding: '2px 7px', borderRadius: 99 }}>auto</span>
                  </div>
                </div>
              </div>

              {/* status pills */}
              <div>
                {LBL('Update Status')}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {COMMENT_STATUSES.map(s => {
                    const cfg = TICKET_STATUS_CFG[s];
                    const active = commentForm.status === s;
                    return (
                      <button key={s} type="button" onClick={() => setCommentForm(f => ({ ...f, status: s }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 99, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.col : 'var(--ink-3)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* message input row */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea value={commentForm.comment} onChange={e => setCommentForm(f => ({ ...f, comment: e.target.value }))}
                  rows={2} placeholder="Type your reply…"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && commentForm.comment.trim()) { e.preventDefault(); handlePostComment(); }}}
                  style={{ ...IS, resize: 'none', lineHeight: 1.6, flex: 1 }} />
                <button onClick={handlePostComment} disabled={posting || !commentForm.comment.trim()}
                  style={{ padding: '11px 16px', background: posting || !commentForm.comment.trim() ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, cursor: posting || !commentForm.comment.trim() ? 'not-allowed' : 'pointer', flexShrink: 0, display: 'grid', placeItems: 'center', boxShadow: commentForm.comment.trim() && !posting ? '0 4px 14px rgba(79,70,229,.35)' : 'none', transition: 'all .2s' }}>
                  {posting
                    ? <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.4)" strokeWidth="2"/><path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>
                    : <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: -8 }}>Press Enter to send · Shift+Enter for new line</div>

              {/* cancel */}
              <button onClick={() => setCommentTicket(null)}
                style={{ padding: '10px 0', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Chart primitives ─── */

const CHART_MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const REV_DATA     = [100, 115, 125, 135, 148, 155, 248, 293];
const SESS_DATA    = [80,  100, 130, 165, 220, 270, 340, 410];
const SIGNUP_STU   = [200, 220, 250, 290, 355, 430, 580, 730];
const SIGNUP_MEN   = [50,  60,  70,  80,  100, 120, 200, 250];

const TOP_MENTORS = [
  { name: 'Veer Banerjee', amt: '₹1.75 L', pct: 100 },
  { name: 'Tara Pillai',   amt: '₹1.72 L', pct: 98  },
  { name: 'Rahul Pillai',  amt: '₹1.68 L', pct: 96  },
  { name: 'Manav Bose',    amt: '₹1.66 L', pct: 95  },
  { name: 'Karan Kapoor',  amt: '₹1.54 L', pct: 88  },
];

const ATTENTION = [
  { bg: '#FEF3DA', col: '#B45309', ic: '★', t: '8 negative reviews',    d: 'Sessions rated 1–2★ need follow-up',       to: 'sessions' },
  { bg: '#EEF2FF', col: '#4F46E5', ic: '₹', t: '2 payouts pending',      d: 'Mentor earnings awaiting settlement',        to: 'payouts'  },
  { bg: '#FEE7E7', col: '#DC2626', ic: '!', t: '6 payouts on hold',       d: 'Resolve before releasing funds',             to: 'payouts'  },
  { bg: '#EEF2FF', col: '#4F46E5', ic: '⊙', t: '1 open ticket',          d: 'Users waiting on a reply',                   to: 'tickets'  },
  { bg: '#F0FDF4', col: '#7C3AED', ic: '✎', t: '2 unpublished drafts',   d: 'Webinars & jobs not yet live',               to: 'jobs'     },
];

function LineChart({ series, maxY, months }) {
  const W = 560, H = 140, PAD = 14;
  const step = (W - 2 * PAD) / Math.max(months.length - 1, 1);
  const [tooltip, setTooltip] = React.useState(null); // { cx, cy, label, items }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          {series.map(s => (
            <linearGradient key={s.id} id={s.id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={s.color} stopOpacity="0"/>
            </linearGradient>
          ))}
        </defs>
        {series.map(s => {
          const pts = s.data.map((v, i) => ({
            cx: PAD + i * step,
            cy: PAD + (1 - v / (maxY || 1)) * (H - 2 * PAD),
            v,
          }));
          const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(' ');
          const area = `${line} L ${pts[pts.length-1].cx.toFixed(1)} ${H} L ${pts[0].cx.toFixed(1)} ${H} Z`;
          return (
            <g key={s.id}>
              <path d={area} fill={`url(#${s.id})`}/>
              <path d={line} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx} cy={p.cy} r="5"
                  fill="#fff" stroke={s.color} strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => {
                    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
                    const circleRect = e.currentTarget.getBoundingClientRect();
                    setTooltip(prev => {
                      const existing = prev?.idx === i ? prev : { idx: i, month: months[i], items: [] };
                      const alreadyHas = existing.items.find(it => it.id === s.id);
                      return {
                        idx: i,
                        month: months[i],
                        x: ((circleRect.left + circleRect.right) / 2 - svgRect.left) / svgRect.width * 100,
                        y: (circleRect.top - svgRect.top) / svgRect.height * 100,
                        items: alreadyHas
                          ? existing.items.map(it => it.id === s.id ? { ...it, value: p.v } : it)
                          : [...existing.items, { id: s.id, color: s.color, value: p.v }],
                      };
                    });
                  }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: `${Math.min(tooltip.x, 80)}%`,
          top: `${Math.max(tooltip.y - 10, 0)}%`,
          transform: 'translate(-50%, -100%)',
          background: 'rgba(15,23,42,0.92)',
          color: '#fff',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 12.5,
          fontWeight: 600,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
          zIndex: 10,
          minWidth: 80,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {tooltip.month}
          </div>
          {tooltip.items.map(it => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: it.color, flexShrink: 0, display: 'inline-block' }}/>
              {it.value}
            </div>
          ))}
        </div>
      )}

      <div className="chart-xlabels">{months.map(m => <span key={m}>{m}</span>)}</div>
    </div>
  );
}

function DonutChart({ segments, total }) {
  let angle = 0;
  const gradient = segments.map(s => {
    const start = angle;
    const end   = angle + (s.value / total) * 360;
    angle = end;
    return `${s.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
  }).join(', ');
  return (
    <div className="donut-row">
      <div style={{ width: 132, height: 132, borderRadius: '50%', background: `conic-gradient(${gradient})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <b style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--ink)', display: 'block', lineHeight: 1 }}>{total}</b>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>total</span>
          </div>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map(s => (
          <div key={s.label} className="dl">
            <i style={{ background: s.color }}/>
            <span>{s.label}</span>
            <b>{s.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Chart helpers ─── */
function getLast8Months() {
  const now = new Date();
  const labels = [], months = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleDateString('en-IN', { month: 'short' }));
    months.push(d);
  }
  return { labels, months };
}

function countByMonth(rows, months) {
  return months.map(target =>
    rows.filter(r => {
      if (!r.createdAt) return false;
      const d = new Date(r.createdAt);
      return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
    }).length
  );
}

/* ─── Page ─── */
export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [section,       setSection]       = useState('overview');
  const [sideOpen,      setSideOpen]      = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [studentCount,      setStudentCount]      = useState(0);
  const [mentorCount,       setMentorCount]       = useState(0);
  const [webinarCount,      setWebinarCount]      = useState(0);
  const [jobCount,          setJobCount]          = useState(0);
  const [ticketCount,       setTicketCount]       = useState(0);
  const [activeMentorCount, setActiveMentorCount] = useState(0);
  const [studentStatusData, setStudentStatusData] = useState({ active: 0, inactive: 0, blocked: 0 });
  const [recentUsers,       setRecentUsers]       = useState([]);
  const [openTicketCount,   setOpenTicketCount]   = useState(0);
  const [signupMonthLabels, setSignupMonthLabels] = useState([]);
  const [signupStuData,     setSignupStuData]     = useState([0,0,0,0,0,0,0,0]);
  const [signupMenData,     setSignupMenData]     = useState([0,0,0,0,0,0,0,0]);

  useEffect(() => {
    /* Students */
    httpService.get('/user', { params: { page: 1, limit: 200 }, token: true })
      .then(res => {
        const rows  = res?.rows ?? res?.data ?? (Array.isArray(res) ? res : []);
        const count = res?.count ?? res?.total ?? res?.totalCount ?? rows.length;
        setStudentCount(count);
        const active   = rows.filter(u => u.isActive && !u.isBlock).length;
        const blocked  = rows.filter(u => u.isBlock).length;
        const inactive = Math.max(0, rows.length - active - blocked);
        setStudentStatusData({ active, inactive, blocked });
        const sorted = [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentUsers(sorted.slice(0, 5));
        const { labels, months } = getLast8Months();
        setSignupMonthLabels(labels);
        setSignupStuData(countByMonth(rows, months));
      }).catch(() => {});

    /* Mentors */
    httpService.get('/mentorProfile', { params: { page: 1, limit: 200 }, token: true })
      .then(res => {
        const rows  = res?.rows ?? res?.data ?? (Array.isArray(res) ? res : []);
        const count = res?.count ?? res?.total ?? res?.totalCount ?? rows.length;
        setMentorCount(count);
        setActiveMentorCount(rows.filter(m => m.isActive).length);
        const { months } = getLast8Months();
        setSignupMenData(countByMonth(rows, months));
      }).catch(() => {});

    /* Webinars — mirror SessionsView parsing exactly */
    httpService.get('/webinar', { params: { page: 1, limit: 200 }, token: true })
      .then(res => {
        const inner = res?.webinars;
        const rows  = Array.isArray(inner?.webinars) ? inner.webinars
                    : Array.isArray(inner)            ? inner
                    : Array.isArray(res)              ? res
                    : Array.isArray(res?.data)        ? res.data : [];
        setWebinarCount(inner?.total ?? inner?.pages * 10 ?? rows.length);
      }).catch(() => {});

    /* Jobs — count only active */
    httpService.get('/jobs', { token: true })
      .then(res => {
        const rows = res?.data ?? (Array.isArray(res) ? res : []);
        setJobCount(rows.filter(j => j.active === true || j.isActive === true).length);
      }).catch(() => {});

    /* Support Tickets — mirror AdminTicketsView: activeOnly false, no userId */
    httpService.get('/supportTicket', { params: { page: 1, limit: 200, activeOnly: false }, token: true })
      .then(res => {
        const rows = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setTicketCount(rows.length);
        setOpenTicketCount(rows.filter(t => t.status === 'active').length);
      }).catch(() => {});
  }, []);

  const meta = VIEW_META[section] || VIEW_META.overview;

  const NavBtn = ({ id, label, count, children }) => (
    <button
      className={`ds-link${section === id ? ' active' : ''}`}
      onClick={() => { setSection(id); setSideOpen(false); }}
      title={label}
    >
      {children}
      <span className="ds-label">{label}</span>
      {count > 0 && <span className="ds-count">{count}</span>}
    </button>
  );

  const handleBurger = () => {
    if (window.innerWidth > 980) {
      setSideCollapsed(v => !v);
    } else {
      setSideOpen(v => !v);
    }
  };

  return (
    <div className={`dash${sideCollapsed ? ' side-collapsed' : ''}`}>
      {/* ═══ SIDEBAR ═══ */}
      <aside className={`dash-side${sideOpen ? ' open' : ''}`}>
        <a href="/" className="brand" style={{ textDecoration: 'none' }}>
          <span className="logo">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3L3 8l9 5 9-5-9-5z" fill="currentColor"/><path d="M6 11v4.5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5V11" stroke="currentColor" strokeWidth="1.7" fill="none"/></svg>
          </span>
          <span>Mentor<b>4</b>Career</span>
        </a>

        <div className="ds-sec">Main</div>
        <NavBtn id="overview" label="Dashboard">
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.7"/><rect x="14" y="3" width="7" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.7"/><rect x="14" y="12" width="7" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.7"/><rect x="3" y="16" width="7" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.7"/></svg>
        </NavBtn>

        <div className="ds-sec">People</div>
        <NavBtn id="users"    label="Students"          count={studentCount}>
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.7"/><path d="M5 20c0-3.3 3.4-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
        </NavBtn>
        <NavBtn id="mentors"  label="Mentors"           count={mentorCount}>
          <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7"/><path d="M3 20c0-3 2.8-5.2 6-5.2S15 17 15 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M16 5.5a3 3 0 010 5.6M18 20c0-2.4-1-4.2-2.6-5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
        </NavBtn>
        <NavBtn id="feedback" label="Feedback & Ratings" count={8}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </NavBtn>

        <div className="ds-sec">Finance</div>
        <NavBtn id="payouts"  label="Mentor Payouts"    count={2}>
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2.3" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12.5" r="2.6" stroke="currentColor" strokeWidth="1.7"/></svg>
        </NavBtn>
        <NavBtn id="revenue"  label="Revenue & Payments">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.7"/><path d="M12 6v2m0 8v2M9.5 10.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2s-2.5.5-2.5 2a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
        </NavBtn>

        <div className="ds-sec">Content</div>
        <NavBtn id="sessions" label="Webinars"          count={webinarCount}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </NavBtn>
        <NavBtn id="jobs"     label="Jobs & Internships" count={jobCount}>
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="13" rx="2.3" stroke="currentColor" strokeWidth="1.7"/><path d="M8 7V5.5A2.5 2.5 0 0110.5 3h3A2.5 2.5 0 0116 5.5V7" stroke="currentColor" strokeWidth="1.7"/></svg>
        </NavBtn>

        <div className="ds-sec">Support</div>
        <NavBtn id="tickets"  label="Support Tickets"   count={ticketCount}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
        </NavBtn>

        <div className="ds-foot">
          <button className="ds-link" onClick={signOut} title="Log out">
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4M9 16l-4-4 4-4M5 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="ds-label">Log out</span>
          </button>
        </div>
      </aside>

      {sideOpen && <div className="scrim open" onClick={() => setSideOpen(false)} />}

      {/* ═══ MAIN ═══ */}
      <div className="dash-main">
        <header className="dash-top">
          <button className="dt-burger" onClick={handleBurger} title="Toggle sidebar">
            {sideOpen
              ? <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              : sideCollapsed
              ? <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </button>
          <div>
            <h1>{meta.title}</h1>
            <div className="dt-sub">{meta.sub}</div>
          </div>
          <div className="dt-right">
            <span className="badge b-indigo" style={{ padding: '7px 13px' }}>Admin</span>
            <button className="dt-icon" title="Notifications">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7"/></svg>
              <span className="dot" />
            </button>
            <div className="dt-avatar">
              {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
            </div>
          </div>
        </header>

        <div className="dash-content">
          {section === 'overview' && (
            <div>
              {/* KPI grid */}
              <div className="kpi-grid">
                {[
                  { bg: '#EEF2FF', col: 'var(--indigo)',  n: studentCount || '—',       l: 'Total Students',     delta: null, up: true,
                    svg: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8"/><path d="M5 20c0-3.3 3.4-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
                  { bg: '#E7F7EF', col: 'var(--emerald)', n: activeMentorCount || '—',  l: 'Active Mentors',     delta: null, up: true,
                    svg: <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-3 2.8-5.2 6-5.2S15 17 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 5.5a3 3 0 010 5.6M18 20c0-2.4-1-4.2-2.6-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
                  { bg: '#FEF3DA', col: 'var(--amber)',   n: webinarCount || '—',       l: 'Total Webinars',     delta: null, up: true,
                    svg: <svg viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { bg: '#FEE7E7', col: '#DC2626',        n: openTicketCount || '—',    l: 'Open Tickets',       delta: null, up: false,
                    svg: <svg viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg> },
                ].map(k => (
                  <div className="kpi" key={k.l}>
                    <div className="k-top">
                      <div className="k-ic" style={{ background: k.bg, color: k.col }}>{k.svg}</div>
                      <div className="k-l">{k.l}</div>
                    </div>
                    <div className="k-n">{k.n}</div>
                    {k.delta && (
                      <div className={`k-delta${k.up ? ' up' : ' down'}`}>
                        <svg viewBox="0 0 24 24" fill="none"><path d={k.up ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M5 12l7 7 7-7'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {k.delta} this month
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Charts row 1 */}
              <div className="chart-grid">
                <div className="panel">
                  <div className="panel-head">
                    <h2>Revenue &amp; Sessions</h2>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: '#4F46E5', display: 'inline-block' }}/>Revenue
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10B981', display: 'inline-block' }}/>Sessions
                      </span>
                    </div>
                  </div>
                  <LineChart
                    months={CHART_MONTHS}
                    maxY={500}
                    series={[
                      { id: 'lcrev',  color: '#4F46E5', data: REV_DATA  },
                      { id: 'lcsess', color: '#10B981', data: SESS_DATA },
                    ]}
                  />
                </div>

                <div className="panel">
                  <div className="panel-head"><h2>Users by Status</h2></div>
                  {(() => {
                    const stuTotal = studentStatusData.active + studentStatusData.inactive + studentStatusData.blocked;
                    return (
                      <DonutChart
                        total={stuTotal || 1}
                        segments={stuTotal > 0
                          ? [
                              { label: 'Active',   value: studentStatusData.active,   color: '#10B981' },
                              { label: 'Inactive', value: studentStatusData.inactive, color: '#F59E0B' },
                              { label: 'Blocked',  value: studentStatusData.blocked,  color: '#EF4444' },
                            ].filter(s => s.value > 0)
                          : [{ label: 'Loading…', value: 1, color: '#E2E8F0' }]
                        }
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Charts row 2 */}
              <div className="chart-grid">
                <div className="panel">
                  <div className="panel-head"><h2>Top Mentors by Earnings</h2></div>
                  <div className="barlist">
                    {TOP_MENTORS.map(m => (
                      <div key={m.name} className="bl-row">
                        <div className="bl-top">
                          <span className="bl-n">{m.name}</span>
                          <b>{m.amt}</b>
                        </div>
                        <div className="bl-track">
                          <div className="bl-fill" style={{ width: `${m.pct}%` }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-head">
                    <h2>New Signups</h2>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: '#4F46E5', display: 'inline-block' }}/>Users
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10B981', display: 'inline-block' }}/>Mentors
                      </span>
                    </div>
                  </div>
                  <LineChart
                    months={signupMonthLabels.length ? signupMonthLabels : CHART_MONTHS}
                    maxY={Math.max(10, ...signupStuData, ...signupMenData)}
                    series={[
                      { id: 'lcstu', color: '#4F46E5', data: signupStuData },
                      { id: 'lcmen', color: '#10B981', data: signupMenData },
                    ]}
                  />
                </div>
              </div>

              {/* Needs your attention */}
              <div className="panel">
                <div className="panel-head"><h2>Needs your attention</h2></div>
                <div className="adm-attn">
                  {[
                    openTicketCount > 0
                      ? { bg: '#EEF2FF', col: '#4F46E5', ic: '⊙', t: `${openTicketCount} open ticket${openTicketCount !== 1 ? 's' : ''}`, d: 'Users waiting on a reply', to: 'tickets' }
                      : null,
                    (mentorCount - activeMentorCount) > 0
                      ? { bg: '#FEE7E7', col: '#DC2626', ic: '!', t: `${mentorCount - activeMentorCount} inactive mentor${(mentorCount - activeMentorCount) !== 1 ? 's' : ''}`, d: 'Profiles hidden from students', to: 'mentors' }
                      : null,
                    studentStatusData.blocked > 0
                      ? { bg: '#FEF3DA', col: '#B45309', ic: '⊘', t: `${studentStatusData.blocked} blocked user${studentStatusData.blocked !== 1 ? 's' : ''}`, d: 'Review and take action if needed', to: 'users' }
                      : null,
                    jobCount > 0
                      ? { bg: '#F0FDF4', col: '#7C3AED', ic: '✎', t: `${jobCount} active job listing${jobCount !== 1 ? 's' : ''}`, d: 'Jobs & internships currently live', to: 'jobs' }
                      : null,
                  ].filter(Boolean).map((r, i) => (
                    <button key={i} className="attn-row" onClick={() => setSection(r.to)}>
                      <div className="attn-ic" style={{ background: r.bg, color: r.col, fontWeight: 800, fontSize: 17 }}>
                        {r.ic}
                      </div>
                      <div className="attn-tx">
                        <b>{r.t}</b>
                        <span>{r.d}</span>
                      </div>
                      <svg className="attn-arr" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Signups */}
              {recentUsers.length > 0 && (
                <div className="panel">
                  <div className="panel-head">
                    <h2>Recent Signups</h2>
                    <button className="link-btn" style={{ fontSize: 13, fontWeight: 600, color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSection('users')}>View all →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {recentUsers.map((u, i) => {
                      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown';
                      return (
                        <div key={u.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentUsers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: nameColorAd(fullName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                            {initialsAd(u.firstName, u.lastName)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</div>
                            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email || ''}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <TypeBadge type={u.type} />
                            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{fmtDateAd(u.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'sessions'  && <SessionsView />}
          {section === 'mentors'   && <MentorsView />}
          {section === 'users'     && <UsersView />}
          {section === 'payouts'   && <PayoutsView />}
          {section === 'jobs'      && <JobsView />}
          {section === 'feedback'  && <FeedbackView />}
          {section === 'revenue'   && (
            <div className="panel"><div className="panel-head"><h2>Revenue &amp; Payments</h2></div><p style={{ color: 'var(--ink-3)', padding: '16px 0' }}>Revenue analytics coming soon.</p></div>
          )}
          {section === 'tickets'   && <AdminTicketsView />}
        </div>
      </div>
    </div>
  );
}
