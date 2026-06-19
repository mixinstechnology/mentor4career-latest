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
  overview:                { title: 'Dashboard',              sub: 'Platform health at a glance'                         },
  mentors:                 { title: 'Mentors',                sub: 'Manage mentor accounts and verifications'             },
  users:                   { title: 'Students',               sub: 'All registered students on the platform'              },
  sessions:                { title: 'Webinars',               sub: 'Platform-wide webinar and session activity'           },
  payouts:                 { title: 'Mentor Payouts',         sub: 'Manage payout requests and history'                   },
  jobs:                    { title: 'Jobs & Internships',     sub: 'Manage all job listings on the platform'              },
  feedback:                { title: 'Feedback & Ratings',     sub: 'Review mentor and session feedback'                   },
  revenue:                 { title: 'Revenue & Payments',     sub: 'Platform revenue and payment analytics'               },
  tickets:                 { title: 'Support Tickets',        sub: 'Manage open support requests'                         },
  'report-mentor-payout':  { title: 'Mentor Payout Report',  sub: 'Detailed mentor payout breakdown by date range'       },
  'report-webinar-earning':{ title: 'Webinar Earning Report', sub: 'Revenue earned from webinar registrations'            },
  'report-gst':            { title: 'GST Report',             sub: 'GST collected on all platform transactions'           },
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
      {/* ── filter panel ── */}
      <div className="adm-fp">
        <div className="adm-fp-top">
          <div className="adm-fp-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Filters
          </div>
          {(filters.status !== 'all' || filters.active !== 'all' || filters.charge !== 'all' || search.trim()) && (
            <div className="adm-fp-actions">
              <span className="adm-fp-badge">
                {[filters.status !== 'all', filters.active !== 'all', filters.charge !== 'all', !!search.trim()].filter(Boolean).length} active
              </span>
              <button className="adm-fp-clear" onClick={() => { setFilters({ status: 'all', active: 'all', charge: 'all' }); setSearch(''); }}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Clear all
              </button>
            </div>
          )}
        </div>
        <div className="adm-fp-row">
          <div className="adm-fp-group">
            <div className="adm-fp-label">Verification</div>
            <div className="adm-fp-chips">
              {[
                { v: 'all', l: 'All' },
                { v: 'verified', l: 'Verified' },
                { v: 'notverified', l: 'Unverified' },
              ].map(o => (
                <button key={o.v} className={`chip${filters.status === o.v ? ' active' : ''}`} onClick={() => setFilter('status')(o.v)}>{o.l}</button>
              ))}
            </div>
          </div>
          <div className="adm-fp-divider" />
          <div className="adm-fp-group">
            <div className="adm-fp-label">Activity</div>
            <div className="adm-fp-chips">
              {[
                { v: 'all', l: 'All Status' },
                { v: 'active', l: 'Active' },
                { v: 'inactive', l: 'Inactive' },
              ].map(o => (
                <button key={o.v} className={`chip${filters.active === o.v ? ' active' : ''}`} onClick={() => setFilter('active')(o.v)}>{o.l}</button>
              ))}
            </div>
          </div>
          <div className="adm-fp-divider" />
          <div className="adm-fp-group">
            <div className="adm-fp-label">Charge</div>
            <div className="adm-fp-chips">
              {[
                { v: 'all', l: 'Any' },
                { v: 'free', l: 'Free' },
                { v: 'low', l: '< ₹500' },
                { v: 'high', l: '₹500+' },
              ].map(o => (
                <button key={o.v} className={`chip${filters.charge === o.v ? ' active' : ''}`} onClick={() => setFilter('charge')(o.v)}>{o.l}</button>
              ))}
            </div>
          </div>
          <div className="adm-fp-group" style={{ marginLeft: 'auto' }}>
            <div className="adm-fp-label">Search</div>
            <div className="adm-fp-search">
              <svg className="sp-icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <input type="text" placeholder="Name, email…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="sp-clear" onClick={() => setSearch('')}>×</button>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>
          Showing <b style={{ color: 'var(--ink)' }}>{filtered.length}</b> of <b style={{ color: 'var(--ink)' }}>{mentors.length}</b> mentors
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
      {/* ── filter panel ── */}
      <div className="adm-fp">
        <div className="adm-fp-top">
          <div className="adm-fp-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Filters
          </div>
          {(typeFilter !== 'all' || search.trim()) && (
            <div className="adm-fp-actions">
              <span className="adm-fp-badge">{[typeFilter !== 'all', !!search.trim()].filter(Boolean).length} active</span>
              <button className="adm-fp-clear" onClick={() => { setTypeFilter('all'); setSearch(''); }}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Clear all
              </button>
            </div>
          )}
        </div>
        <div className="adm-fp-row">
          <div className="adm-fp-group">
            <div className="adm-fp-label">User Type</div>
            <div className="adm-fp-chips">
              <button className={`chip${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>All</button>
              {types.map(t => (
                <button key={t} className={`chip${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>
                  {TYPE_LABEL[t] || t}
                </button>
              ))}
            </div>
          </div>
          <div className="adm-fp-group" style={{ marginLeft: 'auto' }}>
            <div className="adm-fp-label">Search</div>
            <div className="adm-fp-search">
              <svg className="sp-icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <input type="text" placeholder="Name, email…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="sp-clear" onClick={() => setSearch('')}>×</button>}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>
          Showing <b style={{ color: 'var(--ink)' }}>{filtered.length}</b> of <b style={{ color: 'var(--ink)' }}>{users.length}</b> users
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
  const [wfe,           setWfe]           = useState({});

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
    const werrs = {};
    if (!form.title.trim())     werrs.title     = 'Title is required.';
    if (!form.presenter.trim()) werrs.presenter = 'Presenter name is required.';
    if (!form.date)             werrs.date      = 'Date is required.';
    if (!form.time)             werrs.time      = 'Time is required.';
    if (!form.link.trim())      werrs.link      = 'Meeting link is required.';
    else if (!/^https?:\/\/.+/.test(form.link.trim())) werrs.link = 'Enter a valid URL (http:// or https://).';
    if (!form.isFree && (!form.price || Number(form.price) <= 0)) werrs.price = 'Enter a valid price for paid webinars.';
    if (Object.keys(werrs).length) { setWfe(werrs); return; }
    setWfe({});
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

      {/* ── status filter panel ── */}
      <div className="adm-fp">
        <div className="adm-fp-top">
          <div className="adm-fp-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Filter by Status
          </div>
          {statusFilter !== 'all' && (
            <div className="adm-fp-actions">
              <span className="adm-fp-badge">1 active</span>
              <button className="adm-fp-clear" onClick={() => setStatusFilter('all')}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Clear
              </button>
            </div>
          )}
        </div>
        <div className="adm-fp-chips">
          <button className={`chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
          {WEBINAR_STATUS_KEYS.map(k => {
            const cfg    = WEBINAR_STATUS_CFG[k];
            const active = statusFilter === k;
            return (
              <button key={k}
                onClick={() => setStatusFilter(k)}
                style={active ? { background: cfg.bg, color: cfg.col, borderColor: cfg.col, transform: 'translateY(-1px)', boxShadow: `0 4px 14px ${cfg.col}33` } : {}}
                className={`chip${active ? ' active' : ''}`}>
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
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setForm(WEBINAR_EMPTY); setWfe({}); } }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>
            {/* modal header */}
            <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 24px 18px', color: '#fff', flexShrink: 0, position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, marginBottom: 4 }}>Add New Webinar</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Fill in the details to schedule a new webinar.</div>
              <button onClick={() => { setShowForm(false); setForm(WEBINAR_EMPTY); setWfe({}); }}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center' }}>×</button>
            </div>

            {/* modal body */}
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Title */}
              <div>
                {LBL('Title', true)}
                <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setWfe(f => ({ ...f, title: '' })); }}
                  placeholder="e.g. How to crack FAANG interviews" style={{ ...IS, borderColor: wfe.title ? '#EF4444' : undefined }} />
                {wfe.title && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{wfe.title}</div>}
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
                <input value={form.presenter} onChange={e => { setForm(f => ({ ...f, presenter: e.target.value })); setWfe(f => ({ ...f, presenter: '' })); }}
                  placeholder="Presenter name" style={{ ...IS, borderColor: wfe.presenter ? '#EF4444' : undefined }} />
                {wfe.presenter && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{wfe.presenter}</div>}
              </div>

              {/* Date + Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {LBL('Date', true)}
                  <input type="date" value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setWfe(f => ({ ...f, date: '' })); }} style={{ ...IS, borderColor: wfe.date ? '#EF4444' : undefined }} />
                  {wfe.date && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{wfe.date}</div>}
                </div>
                <div>
                  {LBL('Time', true)}
                  <input type="time" value={form.time} onChange={e => { setForm(f => ({ ...f, time: e.target.value })); setWfe(f => ({ ...f, time: '' })); }} style={{ ...IS, borderColor: wfe.time ? '#EF4444' : undefined }} />
                  {wfe.time && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{wfe.time}</div>}
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
                <input value={form.link} onChange={e => { setForm(f => ({ ...f, link: e.target.value })); setWfe(f => ({ ...f, link: '' })); }}
                  placeholder="https://meet.google.com/…" style={{ ...IS, borderColor: wfe.link ? '#EF4444' : undefined }} />
                {wfe.link && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{wfe.link}</div>}
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
                  <>
                    <input type="number" min={0} value={form.price} onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setWfe(f => ({ ...f, price: '' })); }}
                      placeholder="Price in ₹ (e.g. 99)" style={{ ...IS, borderColor: wfe.price ? '#EF4444' : undefined }} />
                    {wfe.price && <div style={{ color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{wfe.price}</div>}
                  </>
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
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [total,        setTotal]        = useState(0);
  const [search,       setSearch]       = useState('');
  const [status,       setStatus]       = useState('success');
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');
  const LIMIT = 100;

  const money = (n) => '₹' + Number(n).toLocaleString('en-IN');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: LIMIT, formType: 'mentorbooking' };
      if (search.trim()) params.search    = search.trim();
      if (status)        params.status    = status;
      if (startDate)     params.startDate = startDate;
      if (endDate)       params.endDate   = endDate;
      const res   = await httpService.get('/transaction/admin/list', { params, token: true });
      const rows  = res?.data?.rows ?? [];
      const count = res?.data?.count ?? 0;
      setTransactions(rows);
      setTotal(count);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadTransactions(); }, []); // eslint-disable-line

  /* group by authUserId → per-mentor totals */
  const mentorMap = {};
  transactions.forEach(t => {
    const key = t.authUserId;
    if (!mentorMap[key]) {
      mentorMap[key] = { authUserId: key, mentor: t.authUser, sessions: 0, totalAmount: 0, latestDate: t.createdAt, txns: [] };
    }
    mentorMap[key].sessions++;
    mentorMap[key].totalAmount += Number(t.amount) || 0;
    if (new Date(t.createdAt) > new Date(mentorMap[key].latestDate)) mentorMap[key].latestDate = t.createdAt;
    mentorMap[key].txns.push(t);
  });
  const mentorRows = Object.values(mentorMap).sort((a, b) => b.totalAmount - a.totalAmount);
  const totalGMV   = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const PLATFORM_PCT = import.meta.env.VITE_PLATFORM_FEE_PERCENTAGE || 10;

  return (
    <div>
      {/* summary hero */}
      <div className="payout-hero">
        {[
          { v: money(totalGMV),          l: 'Total collected',  ic: '💳', cls: 'b-green'  },
          { v: mentorRows.length,        l: 'Mentors earning',  ic: '👨‍🏫', cls: 'b-indigo' },
          { v: total,                    l: 'Total transactions',ic: '📈', cls: 'b-amber'  },
          { v: `${PLATFORM_PCT}%`,       l: 'Platform cut',     ic: '🏷',  cls: 'b-gray'   },
        ].map(k => (
          <div className="stat-card" key={k.l}>
            <div className="sc-ic" style={{ background: 'var(--bg-tint)', fontSize: 20 }}>{k.ic}</div>
            <div className="sc-n">{k.v}</div>
            <div className="sc-l">{k.l}</div>
          </div>
        ))}
      </div>

      {/* filter panel */}
      <div className="adm-fp">
        <div className="adm-fp-top">
          <div className="adm-fp-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Filters
          </div>
          {(search || startDate || endDate || status !== 'success') && (
            <div className="adm-fp-actions">
              <span className="adm-fp-badge">
                {[status !== 'success', !!startDate, !!endDate, !!search.trim()].filter(Boolean).length} active
              </span>
              <button className="adm-fp-clear" onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); setStatus('success'); }}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Clear all
              </button>
            </div>
          )}
        </div>
        <div className="adm-fp-row" style={{ alignItems: 'flex-end' }}>
          <div className="adm-fp-group">
            <div className="adm-fp-label">Payment Status</div>
            <div className="adm-fp-chips">
              {[['success','Success'],['pending','Pending'],['failed','Failed'],['','All']].map(([v,lbl]) => (
                <button key={lbl} className={`chip${status === v ? ' active' : ''}`} onClick={() => setStatus(v)}>{lbl}</button>
              ))}
            </div>
          </div>
          <div className="adm-fp-divider" />
          <div className="adm-fp-group">
            <div className="adm-fp-label">Date Range</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="adm-date-input" title="From date" />
              <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="adm-date-input" title="To date" />
              <button className="adm-fp-apply" onClick={loadTransactions} disabled={loading}>
                {loading
                  ? <><svg viewBox="0 0 24 24" fill="none" width="13" height="13"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.4)" strokeWidth="2"/><path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>Loading</>
                  : <><svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M10 12h4M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Apply</>
                }
              </button>
            </div>
          </div>
          <div className="adm-fp-group" style={{ marginLeft: 'auto' }}>
            <div className="adm-fp-label">Search</div>
            <div className="adm-fp-search">
              <svg className="sp-icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <input type="text" placeholder="Transaction ID…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadTransactions()} />
              {search && <button className="sp-clear" onClick={() => setSearch('')}>×</button>}
            </div>
          </div>
        </div>
      </div>

      {/* per-mentor summary table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>Loading…</div>
      ) : (
        <>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Sessions</th>
                  <th>Total Collected</th>
                  <th>Last Transaction</th>
                  <th>Recent TXN IDs</th>
                </tr>
              </thead>
              <tbody>
                {mentorRows.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>No transactions found.</td></tr>
                ) : mentorRows.map(m => {
                  const fullName = `${m.mentor?.firstName || ''} ${m.mentor?.lastName || ''}`.trim() || `Mentor #${m.authUserId}`;
                  return (
                    <tr key={m.authUserId}>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(fullName) }}>{initialsAd(m.mentor?.firstName, m.mentor?.lastName)}</div>
                          <div>
                            <div className="u-n">{fullName}</div>
                            <div className="u-e">{m.mentor?.email || m.mentor?.contact || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge b-indigo">{m.sessions}</span></td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#10B981' }}>
                          {money(m.totalAmount)}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{fmtDateAd(m.latestDate)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {m.txns.slice(0, 2).map(t => (
                            <span key={t.id} style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                              {t.transactionId} · {money(t.amount)}
                            </span>
                          ))}
                          {m.txns.length > 2 && (
                            <span style={{ fontSize: 11, color: 'var(--indigo)', fontStyle: 'italic' }}>+{m.txns.length - 2} more</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 10, textAlign: 'right' }}>
              {total} total transaction{total !== 1 ? 's' : ''} (showing {transactions.length})
            </div>
          )}
        </>
      )}
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
  const [fe,         setFe]         = useState({});

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
    setFe({});
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
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = 'Company name is required.';
    if (!form.position.trim())    errs.position    = 'Position / Role is required.';
    if (form.email   && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email   = 'Enter a valid email address.';
    if (form.contact && !/^\d{10}$/.test(form.contact.replace(/\D/g, '')))
      errs.contact = 'Enter a valid 10-digit contact number.';
    if (Number(form.noOfPosition) < 1) errs.noOfPosition = 'Must be at least 1.';
    if (Object.keys(errs).length) { setFe(errs); return; }
    setFe({});
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
            <div style={fieldStyle}><label style={labelStyle}>Company Name *</label><input style={{ ...inStyle, borderColor: fe.companyName ? '#EF4444' : '' }} name="companyName" value={form.companyName} onChange={e => { handleChange(e); setFe(f => ({ ...f, companyName: '' })); }} placeholder="e.g. Mixins Technology" required />{fe.companyName && <span style={{ color: '#EF4444', fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{fe.companyName}</span>}</div>
            <div style={fieldStyle}><label style={labelStyle}>Position / Role *</label><input style={{ ...inStyle, borderColor: fe.position ? '#EF4444' : '' }} name="position" value={form.position} onChange={e => { handleChange(e); setFe(f => ({ ...f, position: '' })); }} placeholder="e.g. Full Stack Developer" required />{fe.position && <span style={{ color: '#EF4444', fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{fe.position}</span>}</div>
            <div style={fieldStyle}><label style={labelStyle}>Location</label><input style={inStyle} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Pune, Maharashtra" /></div>
            <div style={fieldStyle}><label style={labelStyle}>Hiring Person Name</label><input style={inStyle} name="hiringPersonName" value={form.hiringPersonName} onChange={handleChange} placeholder="e.g. Dharmendra Patel" /></div>
            <div style={fieldStyle}><label style={labelStyle}>Contact Number</label><input style={{ ...inStyle, borderColor: fe.contact ? '#EF4444' : '' }} name="contact" value={form.contact} onChange={e => { handleChange(e); setFe(f => ({ ...f, contact: '' })); }} placeholder="e.g. 9876543210" type="tel" />{fe.contact && <span style={{ color: '#EF4444', fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{fe.contact}</span>}</div>
            <div style={fieldStyle}><label style={labelStyle}>Contact Email</label><input style={{ ...inStyle, borderColor: fe.email ? '#EF4444' : '' }} name="email" value={form.email} onChange={e => { handleChange(e); setFe(f => ({ ...f, email: '' })); }} placeholder="e.g. hr@company.com" type="email" />{fe.email && <span style={{ color: '#EF4444', fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{fe.email}</span>}</div>
            <div style={fieldStyle}><label style={labelStyle}>No. of Positions</label><input style={{ ...inStyle, borderColor: fe.noOfPosition ? '#EF4444' : '' }} name="noOfPosition" value={form.noOfPosition} onChange={e => { handleChange(e); setFe(f => ({ ...f, noOfPosition: '' })); }} type="number" min="1" />{fe.noOfPosition && <span style={{ color: '#EF4444', fontSize: 11.5, marginTop: 2, fontWeight: 500 }}>{fe.noOfPosition}</span>}</div>
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
function FeedbackView() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 10;

  const loadSessions = async (pg = 1) => {
    setLoading(true);
    try {
      const res   = await httpService.get('/mentorSession/sessions', {
        params: { page: pg, limit: LIMIT },
        token: true,
      });
      const inner = res?.data;
      const data  = Array.isArray(inner?.data) ? inner.data : [];
      setSessions(data);
      setTotal(inner?.total ?? 0);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadSessions(1); }, []); // eslint-disable-line

  const filtered = sessions.filter(s => {
    if (filter === 'positive'  && (s.rating ?? 0) < 4) return false;
    if (filter === 'negative'  && (s.rating ?? 0) > 2) return false;
    if (filter === 'no-rating' && s.rating != null)     return false;
    if (search.trim()) {
      const q       = search.toLowerCase();
      const mentor  = `${s.authUser?.firstName || ''} ${s.authUser?.lastName || ''}`.toLowerCase();
      const student = `${s.user?.firstName    || ''} ${s.user?.lastName    || ''}`.toLowerCase();
      if (!mentor.includes(q) && !student.includes(q)) return false;
    }
    return true;
  });

  const rated      = sessions.filter(s => s.rating != null);
  const avg        = rated.length ? (rated.reduce((a, s) => a + s.rating, 0) / rated.length).toFixed(1) : '—';
  const neg        = sessions.filter(s => s.rating != null && s.rating <= 2).length;
  const five       = sessions.filter(s => s.rating === 5).length;
  const totalPages = Math.ceil(total / LIMIT);

  const Stars = ({ n }) => (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14"
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
          { n: avg,   l: 'Average rating',  col: 'var(--ink)' },
          { n: total, l: 'Total sessions',  col: 'var(--ink)' },
          { n: neg,   l: 'Negative (1–2★)', col: '#DC2626'    },
          { n: five,  l: '5★ reviews',      col: '#10B981'    },
        ].map(s => (
          <div key={s.l} className="panel" style={{ padding: '20px 22px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: s.col, lineHeight: 1, marginBottom: 6 }}>{s.n}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter panel */}
      <div className="adm-fp">
        <div className="adm-fp-top">
          <div className="adm-fp-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Filters
          </div>
          {(filter !== 'all' || search.trim()) && (
            <div className="adm-fp-actions">
              <span className="adm-fp-badge">{[filter !== 'all', !!search.trim()].filter(Boolean).length} active</span>
              <button className="adm-fp-clear" onClick={() => { setFilter('all'); setSearch(''); }}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Clear all
              </button>
            </div>
          )}
        </div>
        <div className="adm-fp-row">
          <div className="adm-fp-group">
            <div className="adm-fp-label">Rating</div>
            <div className="adm-fp-chips">
              {[
                ['all', 'All'],
                ['negative', 'Negative (1–2★)'],
                ['positive', 'Positive (4–5★)'],
                ['no-rating', 'No rating'],
              ].map(([v, lbl]) => (
                <button key={v} className={`chip${filter === v ? ' active' : ''}`} onClick={() => setFilter(v)}>{lbl}</button>
              ))}
            </div>
          </div>
          <div className="adm-fp-group" style={{ marginLeft: 'auto' }}>
            <div className="adm-fp-label">Search</div>
            <div className="adm-fp-search">
              <svg className="sp-icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mentor, student…" />
              {search && <button className="sp-clear" onClick={() => setSearch('')}>×</button>}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>Loading sessions…</div>
      ) : (
        <>
          <div className="d-table-wrap">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Mentor</th>
                  <th>Ratings</th>
                  <th style={{ minWidth: 220 }}>Feedback</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>
                      No sessions match the current filter.
                    </td>
                  </tr>
                ) : filtered.map(s => {
                  const isNeg       = s.rating != null && s.rating <= 2;
                  const mentorName  = `${s.authUser?.firstName || ''} ${s.authUser?.lastName || ''}`.trim() || '—';
                  const studentName = `${s.user?.firstName    || ''} ${s.user?.lastName    || ''}`.trim() || '—';
                  return (
                    <tr key={s.id} style={{ background: isNeg ? '#FFF7F7' : undefined }}>
                      {/* Student */}
                      <td style={{ position: 'relative', paddingLeft: isNeg ? 22 : undefined }}>
                        {isNeg && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#EF4444', borderRadius: '2px 0 0 2px' }} />}
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(studentName) }}>{initialsAd(s.user?.firstName, s.user?.lastName)}</div>
                          <div>
                            <div className="u-n">{studentName}</div>
                            <div className="u-e">{s.user?.email || s.user?.contact || '—'}</div>
                          </div>
                        </div>
                      </td>
                      {/* Mentor */}
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(mentorName) }}>{initialsAd(s.authUser?.firstName, s.authUser?.lastName)}</div>
                          <div>
                            <div className="u-n">{mentorName}</div>
                            <div className="u-e">{s.authUser?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      {/* Ratings */}
                      <td>
                        {s.rating != null ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Stars n={s.rating} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>{s.rating}/5</span>
                            </div>
                            {s.behaviorRating      != null && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Behaviour {s.behaviorRating}★</span>}
                            {s.communicationRating != null && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Comm {s.communicationRating}★</span>}
                            {s.platformRating      != null && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Platform {s.platformRating}★</span>}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>No rating</span>
                        )}
                      </td>
                      {/* Feedback */}
                      <td style={{ maxWidth: 260 }}>
                        {s.userFeedback && (
                          <div style={{ marginBottom: s.mentorFeedback ? 6 : 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', display: 'block', marginBottom: 2 }}>Student</span>
                            <span style={{ fontSize: 13, color: isNeg ? '#C2410C' : 'var(--ink-2)', fontStyle: 'italic' }}>"{s.userFeedback}"</span>
                          </div>
                        )}
                        {s.mentorFeedback && (
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', display: 'block', marginBottom: 2 }}>Mentor</span>
                            <span style={{ fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic' }}>"{s.mentorFeedback}"</span>
                          </div>
                        )}
                        {!s.userFeedback && !s.mentorFeedback && (
                          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>No feedback</span>
                        )}
                      </td>
                      {/* Date */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{s.date || '—'}</div>
                        {s.time && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{s.time}</div>}
                      </td>
                      {/* Amount */}
                      <td>
                        {s.amount != null
                          ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>₹{s.amount}</span>
                          : <span style={{ color: 'var(--ink-3)' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pager">
              <button onClick={() => loadSessions(page - 1)} disabled={page === 1 || loading}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => loadSessions(p)}>{p}</button>
              ))}
              <button onClick={() => loadSessions(page + 1)} disabled={page >= totalPages || loading}>→</button>
              <span className="pg-info">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
            </div>
          )}
        </>
      )}
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

      {/* ── filter panel ── */}
      <div className="adm-fp">
        <div className="adm-fp-top">
          <div className="adm-fp-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Filters
          </div>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || search.trim()) && (
            <div className="adm-fp-actions">
              <span className="adm-fp-badge">
                {[statusFilter !== 'all', priorityFilter !== 'all', !!search.trim()].filter(Boolean).length} active
              </span>
              <button className="adm-fp-clear" onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearch(''); }}>
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Clear all
              </button>
            </div>
          )}
        </div>
        <div className="adm-fp-row" style={{ rowGap: 14 }}>
          <div className="adm-fp-group">
            <div className="adm-fp-label">Status</div>
            <div className="adm-fp-chips">
              <button className={`chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>
                All <span className="c-badge">{statusCounts.all}</span>
              </button>
              {TICKET_STATUS_KEYS.map(k => {
                const cfg    = TICKET_STATUS_CFG[k];
                const active = statusFilter === k;
                return (
                  <button key={k}
                    className={`chip${active ? ' active' : ''}`}
                    style={active ? { background: cfg.bg, color: cfg.col, borderColor: cfg.col, transform: 'translateY(-1px)', boxShadow: `0 4px 14px ${cfg.col}33` } : {}}
                    onClick={() => setStatusFilter(k)}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                    {cfg.label}
                    <span className="c-badge">{statusCounts[k] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="adm-fp-divider" />
          <div className="adm-fp-group">
            <div className="adm-fp-label">Priority</div>
            <div className="adm-fp-chips">
              <button className={`chip${priorityFilter === 'all' ? ' active' : ''}`} onClick={() => setPriorityFilter('all')}>All</button>
              {['high','medium','low'].map(k => {
                const cfg    = TICKET_PRIORITY_CFG[k];
                const active = priorityFilter === k;
                return (
                  <button key={k}
                    className={`chip${active ? ' active' : ''}`}
                    style={active ? { background: cfg.bg, color: cfg.col, borderColor: cfg.col, transform: 'translateY(-1px)', boxShadow: `0 4px 14px ${cfg.col}33` } : {}}
                    onClick={() => setPriorityFilter(k)}>
                    {cfg.label}
                    <span className="c-badge">{priorityCounts[k] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="adm-fp-group" style={{ marginLeft: 'auto' }}>
            <div className="adm-fp-label">Search</div>
            <div className="adm-fp-search">
              <svg className="sp-icon" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, title, code…" style={{ width: 260 }} />
              {search && <button className="sp-clear" onClick={() => setSearch('')}>×</button>}
            </div>
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

/* ══════════════════════════════════════════════
   REVENUE DASHBOARD VIEW  (/report/dashboard)
══════════════════════════════════════════════ */
function RevenueDashboardView() {
  const today     = new Date().toISOString().split('T')[0];
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [fromDate,   setFromDate]   = useState(yearStart);
  const [toDate,     setToDate]     = useState(today);
  const [page,       setPage]       = useState(1);
  const LIMIT = 20;

  const m = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await httpService.get('/report/dashboard', {
        params: { fromDate, toDate, page: pg, limit: LIMIT },
        token: true,
      });
      setData(res?.data ?? res ?? null);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []); // eslint-disable-line

  const counts   = data?.counts   ?? {};
  const earnings = data?.earnings ?? {};
  const menSess  = earnings.mentorSessions ?? {};
  const web      = earnings.webinars       ?? {};
  const mentors  = data?.mentorWiseEarning ?? [];
  const pag      = data?.mentorWisePagination ?? { page: 1, totalPages: 1, totalRows: 0, limit: LIMIT };

  return (
    <div>
      {/* ── date filter ── */}
      <div className="adm-fp" style={{ marginBottom: 22 }}>
        <div className="adm-fp-top">
          <div className="adm-fp-title">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            Date Range
          </div>
        </div>
        <div className="adm-fp-row" style={{ alignItems: 'flex-end' }}>
          <div className="adm-fp-group">
            <div className="adm-fp-label">From</div>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="adm-date-input" />
          </div>
          <div className="adm-fp-group">
            <div className="adm-fp-label">To</div>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="adm-date-input" />
          </div>
          <button className="adm-fp-apply" onClick={() => load(1)} disabled={loading}>
            {loading
              ? <><svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.4)" strokeWidth="2"/><path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>Loading…</>
              : <><svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M3 6h18M10 12h4M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Apply Filter</>
            }
          </button>
        </div>
      </div>

      {/* ── count KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Mentors',      val: counts.totalMentors          ?? '—', bg: '#EEF2FF', col: '#4F46E5',
            ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-3 2.8-5.2 6-5.2S15 17 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 5.5a3 3 0 010 5.6M18 20c0-2.4-1-4.2-2.6-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
          { label: 'Active Webinars',    val: counts.activeWebinarSessions  ?? '—', bg: '#F0FDF4', col: '#15803D',
            ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          { label: 'Completed Webinars', val: counts.completedWebinars      ?? '—', bg: '#FEF3DA', col: '#B45309',
            ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg> },
          { label: 'Active Students',    val: counts.activeStudents         ?? '—', bg: '#FFF7ED', col: '#EA580C',
            ic: <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8"/><path d="M5 20c0-3.3 3.4-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,.04)', transition: 'box-shadow .2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 22px rgba(79,70,229,.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.04)'}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, color: c.col, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{c.ic}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: c.col, lineHeight: 1, marginBottom: 6 }}>{c.val}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── earnings breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
        {/* Mentor Sessions card */}
        <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 18, padding: '22px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="19" height="19" style={{ color: '#4F46E5' }}><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-3 2.8-5.2 6-5.2S15 17 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 5.5a3 3 0 010 5.6M18 20c0-2.4-1-4.2-2.6-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>Mentor Sessions</span>
          </div>
          {[
            { l: 'Total Revenue',  v: m(menSess.totalAmount),     col: '#1E1B4B', big: true },
            // { l: 'Mentor Fee',     v: m(menSess.totalMentorFee),  col: 'var(--ink-2)' },
            { l: 'Platform Fee',   v: m(menSess.totalPlatformFee),col: '#4F46E5' },
            { l: 'GST Collected',  v: m(menSess.totalGst),        col: '#B45309' },
          ].map(r => (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600 }}>{r.l}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: r.big ? 800 : 700, fontSize: r.big ? 17 : 14, color: r.col }}>{r.v}</span>
            </div>
          ))}
        </div>

        {/* Webinars card */}
        <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 18, padding: '22px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="19" height="19" style={{ color: '#15803D' }}><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>Webinars</span>
          </div>
          {[
            { l: 'Total Revenue',  v: m(web.totalAmount),    col: '#14532D', big: true },
            { l: 'Webinar Fee',    v: m(web.totalWebinarFee),col: 'var(--ink-2)' },
            { l: 'GST Collected',  v: m(web.totalGst),       col: '#B45309' },
          ].map(r => (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600 }}>{r.l}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: r.big ? 800 : 700, fontSize: r.big ? 17 : 14, color: r.col }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── total platform earning hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 18, padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28, boxShadow: '0 8px 28px rgba(79,70,229,.35)' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Total Platform Earning</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{m(earnings.totalPlatformEarning)}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 6 }}>
            Sessions: {m(menSess.totalPlatformFee)} &nbsp;·&nbsp; Webinars: {m(web.totalWebinarFee)}
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" width="56" height="56" style={{ opacity: .3 }}><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/><path d="M12 6v2m0 8v2M9 10a3 3 0 016 0c0 2-1.5 2.5-3 3s-3 1-3 3a3 3 0 006 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
      </div>

      {/* ── mentor-wise earning table ── */}
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', marginBottom: 16 }}>
        Mentor-wise Earnings
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>Loading…</div>
      ) : mentors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)', fontSize: 14 }}>No mentor earning data for the selected period.</div>
      ) : (
        <>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Sessions</th>
                  <th>Total Revenue</th>
                  <th>Mentor Fee</th>
                  <th>Platform Fee</th>
                </tr>
              </thead>
              <tbody>
                {mentors.map(mn => {
                  const fullName = `${mn.authUser?.firstName || ''} ${mn.authUser?.lastName || ''}`.trim() || `Mentor #${mn.authUserId}`;
                  return (
                    <tr key={mn.authUserId}>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(fullName) }}>{initialsAd(mn.authUser?.firstName, mn.authUser?.lastName)}</div>
                          <div>
                            <div className="u-n">{fullName}</div>
                            <div className="u-e">{mn.authUser?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge b-indigo">{mn.sessionCount}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#10B981' }}>{m(mn.totalAmount)}</span></td>
                      <td style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 600 }}>{m(mn.totalMentorFee)}</td>
                      <td><span className="badge b-indigo">{m(mn.totalPlatformFee)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {pag.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>
                Showing <b style={{ color: 'var(--ink)' }}>{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pag.totalRows)}</b> of <b style={{ color: 'var(--ink)' }}>{pag.totalRows}</b> mentors
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => load(1)} disabled={page === 1 || loading}
                  style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1 }}>«</button>
                <button onClick={() => load(page - 1)} disabled={page === 1 || loading}
                  style={{ padding: '7px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1 }}>‹ Prev</button>
                {Array.from({ length: Math.min(pag.totalPages, 5) }, (_, i) => {
                  const half  = 2;
                  const start = Math.max(1, Math.min(page - half, pag.totalPages - 4));
                  return start + i;
                }).filter(p => p >= 1 && p <= pag.totalPages).map(p => (
                  <button key={p} onClick={() => load(p)} disabled={loading}
                    style={{ padding: '7px 12px', background: page === p ? '#4F46E5' : '#fff', color: page === p ? '#fff' : 'var(--ink-2)', border: `1.5px solid ${page === p ? '#4F46E5' : 'var(--border)'}`, borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: page === p ? '0 2px 8px rgba(79,70,229,.3)' : 'none' }}>{p}</button>
                ))}
                <button onClick={() => load(page + 1)} disabled={page >= pag.totalPages || loading}
                  style={{ padding: '7px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: page >= pag.totalPages ? 'not-allowed' : 'pointer', opacity: page >= pag.totalPages ? .4 : 1 }}>Next ›</button>
                <button onClick={() => load(pag.totalPages)} disabled={page === pag.totalPages || loading}
                  style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: page === pag.totalPages ? 'not-allowed' : 'pointer', opacity: page === pag.totalPages ? .4 : 1 }}>»</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPORT HELPERS
══════════════════════════════════════════════ */
const rMoney = (n) => (n != null && n !== '' && !isNaN(Number(n))) ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00';

/* ── shared report filter bar ── */
function ReportFilterBar({ fromDate, toDate, onFromChange, onToChange, onApply, loading }) {
  return (
    <div className="adm-fp">
      <div className="adm-fp-top">
        <div className="adm-fp-title">
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
          Date Range Filter
        </div>
      </div>
      <div className="adm-fp-row" style={{ alignItems: 'flex-end' }}>
        <div className="adm-fp-group">
          <div className="adm-fp-label">From</div>
          <input type="date" value={fromDate} onChange={e => onFromChange(e.target.value)} className="adm-date-input" />
        </div>
        <div className="adm-fp-group">
          <div className="adm-fp-label">To</div>
          <input type="date" value={toDate} onChange={e => onToChange(e.target.value)} className="adm-date-input" />
        </div>
        <button className="adm-fp-apply" onClick={onApply} disabled={loading}>
          {loading
            ? <><svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.4)" strokeWidth="2"/><path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>Loading…</>
            : <><svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M3 6h18M10 12h4M6 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>Apply Filter</>
          }
        </button>
      </div>
    </div>
  );
}

/* ── summary stat cards ── */
function ReportStatCards({ cards }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 14, marginBottom: 22 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,.05)', transition: 'box-shadow .2s', cursor: 'default' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.05)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg || '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              {c.icon}
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em', lineHeight: 1.3 }}>{c.label}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: c.color || 'var(--ink)', lineHeight: 1, letterSpacing: '-.02em' }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── pagination bar ── */
function ReportPager({ page, totalPages, totalRows, limit, onPage, loading }) {
  if (!totalPages || totalPages <= 1) return null;
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end   = Math.min(totalPages, start + windowSize - 1);
  if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, totalRows);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, flexWrap: 'wrap', gap: 10 }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>
        Showing <b style={{ color: 'var(--ink)' }}>{from}–{to}</b> of <b style={{ color: 'var(--ink)' }}>{totalRows}</b> records
      </span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <button onClick={() => onPage(1)} disabled={page === 1 || loading}
          style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>«</button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1 || loading}
          style={{ padding: '7px 13px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>‹ Prev</button>
        {start > 1 && <span style={{ fontSize: 13, color: 'var(--ink-3)', padding: '0 4px' }}>…</span>}
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)} disabled={loading}
            style={{ padding: '7px 12px', background: page === p ? '#4F46E5' : '#fff', color: page === p ? '#fff' : 'var(--ink-2)', border: `1.5px solid ${page === p ? '#4F46E5' : 'var(--border)'}`, borderRadius: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: page === p ? '0 2px 8px rgba(79,70,229,.3)' : 'none' }}>
            {p}
          </button>
        ))}
        {end < totalPages && <span style={{ fontSize: 13, color: 'var(--ink-3)', padding: '0 4px' }}>…</span>}
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages || loading}
          style={{ padding: '7px 13px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>Next ›</button>
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages || loading}
          style={{ padding: '7px 11px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>»</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MENTOR PAYOUT REPORT VIEW
   API: /report/mentor-payout
   Response: { data: { summary, mentorWise[], rows[], pagination } }
══════════════════════════════════════════════ */
function MentorPayoutReportView() {
  const today = new Date().toISOString().split('T')[0];
  const [reportData, setReportData] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [fromDate,   setFromDate]   = useState('2026-01-01');
  const [toDate,     setToDate]     = useState(today);
  const [page,       setPage]       = useState(1);
  const [mPage,      setMPage]      = useState(1);
  const [activeTab,  setActiveTab]  = useState('mentor'); // 'mentor' | 'sessions'
  const LIMIT   = 10;
  const M_LIMIT = 10;

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await httpService.get('/report/mentor-payout', {
        params: { fromDate, toDate, page: pg, limit: LIMIT },
        token: true,
      });
      setReportData(res?.data ?? null);
      setPage(pg);
      setMPage(1);
    } catch { setReportData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []); // eslint-disable-line

  const summary    = reportData?.summary    ?? {};
  const mentorWise = reportData?.mentorWise ?? reportData?.mentorWiseEarning ?? reportData?.mentors ?? [];
  const rows       = reportData?.rows       ?? reportData?.sessionRows ?? [];
  const pagination = reportData?.pagination ?? reportData?.rowsPagination ?? {};
  const totalPages = pagination.totalPages  ?? 1;
  const totalRows  = pagination.totalRows   ?? rows.length;

  const mTotalPages      = Math.max(1, Math.ceil(mentorWise.length / M_LIMIT));
  const displayedMentors = mentorWise.slice((mPage - 1) * M_LIMIT, mPage * M_LIMIT);

  const TAB_BTN = (id, label, icon) => (
    <button onClick={() => setActiveTab(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s',
        background: activeTab === id ? '#4F46E5' : 'transparent',
        color: activeTab === id ? '#fff' : 'var(--ink-3)',
        boxShadow: activeTab === id ? '0 4px 14px rgba(79,70,229,.3)' : 'none',
      }}>
      {icon} {label}
    </button>
  );

  return (
    <div>
      {/* Summary stat cards */}
      <ReportStatCards cards={[
        { label: 'Total Sessions',    value: summary.totalSessions ?? '—',              icon: '📅', bg: '#EEF2FF', color: '#4F46E5'   },
        { label: 'Total Amount',      value: rMoney(summary.totalAmount),               icon: '💰', bg: '#D1FAE5', color: '#065F46'   },
        { label: 'Mentor Fee',        value: rMoney(summary.totalMentorFee),            icon: '👨‍🏫', bg: '#FEF3C7', color: '#B45309'   },
        { label: 'Platform Fee',      value: rMoney(summary.totalPlatformFee),          icon: '🏛',  bg: '#FEE2E2', color: '#DC2626'   },
        { label: 'Total GST',         value: rMoney(summary.totalGst),                 icon: '🧾', bg: '#F0FDF4', color: '#059669'   },
        { label: 'Gateway Charge',    value: rMoney(summary.totalGatewayCharge),       icon: '🔗', bg: '#F8FAFC', color: 'var(--ink)' },
      ]} />

      {/* Filter bar */}
      <ReportFilterBar
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onApply={() => load(1)} loading={loading}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: '#F1F5F9', borderRadius: 12, padding: 5, width: 'fit-content' }}>
        {TAB_BTN('mentor',   'Mentor-wise Summary', '👥')}
        {TAB_BTN('sessions', 'Session Details',     '📋')}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <svg viewBox="0 0 24 24" fill="none" width="40" height="40" style={{ marginBottom: 14, animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2.5"/><path d="M12 3a9 9 0 019 9" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"/></svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading payout data…</div>
        </div>
      ) : !reportData ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>No data available</div>
          <div style={{ fontSize: 13.5 }}>Adjust the date range and click Apply Filter.</div>
        </div>
      ) : activeTab === 'mentor' ? (
        /* ── Mentor-wise summary table ── */
        <>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mentor</th>
                  <th>Sessions</th>
                  <th>Total Amount</th>
                  <th>Mentor Fee</th>
                  <th>Platform Fee</th>
                  <th>GST</th>
                  <th>Discount</th>
                </tr>
              </thead>
              <tbody>
                {mentorWise.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>No mentor data found.</td></tr>
                ) : displayedMentors.map((m, i) => {
                  const fullName = `${m.authUser?.firstName ?? ''} ${m.authUser?.lastName ?? ''}`.trim() || `Mentor #${m.authUserId}`;
                  return (
                    <tr key={m.authUserId ?? i} style={{ cursor: 'pointer' }}
                      onClick={() => setActiveTab('sessions')}>
                      <td style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600 }}>{(mPage - 1) * M_LIMIT + i + 1}</td>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(fullName) }}>{initialsAd(m.authUser?.firstName, m.authUser?.lastName)}</div>
                          <div>
                            <div className="u-n">{fullName}</div>
                            <div className="u-e">{m.authUser?.email ?? '—'}</div>
                            {m.authUser?.contact && <div className="u-e">{m.authUser.contact}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge b-indigo">{m.sessionCount}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#10B981' }}>
                          {rMoney(m.totalAmount)}
                        </span>
                      </td>
                      <td><span style={{ fontWeight: 700, color: '#B45309' }}>{rMoney(m.totalMentorFee)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#DC2626' }}>{rMoney(m.totalPlatformFee)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#4F46E5' }}>{rMoney(m.totalGst)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)' }}>{rMoney(m.totalDiscount)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ReportPager page={mPage} totalPages={mTotalPages} totalRows={mentorWise.length} limit={M_LIMIT} onPage={setMPage} loading={loading} />
        </>
      ) : (
        /* ── Session details table ── */
        <>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mentor</th>
                  <th>Student</th>
                  <th>Date &amp; Time</th>
                  <th>Amount</th>
                  <th>Mentor Fee</th>
                  <th>Platform Fee</th>
                  <th>GST</th>
                  <th>Gateway</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>No session records found.</td></tr>
                ) : rows.map((r, i) => {
                  const mentorName  = `${r.authUser?.firstName ?? ''} ${r.authUser?.lastName ?? ''}`.trim() || `#${r.authUserId}`;
                  const studentName = `${r.user?.firstName    ?? ''} ${r.user?.lastName    ?? ''}`.trim() || `#${r.userId}`;
                  const pyStyle     = (r.paymentStatus === 'done' || r.paymentStatus === true)
                    ? { bg: '#D1FAE5', color: '#065F46', label: 'Paid' }
                    : { bg: '#FEF3C7', color: '#B45309', label: r.paymentStatus ?? '—' };
                  return (
                    <tr key={r.id ?? i}>
                      <td style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600 }}>{(page - 1) * LIMIT + i + 1}</td>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(mentorName) }}>{initialsAd(r.authUser?.firstName, r.authUser?.lastName)}</div>
                          <div>
                            <div className="u-n">{mentorName}</div>
                            <div className="u-e">{r.authUser?.email ?? r.authUser?.contact ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(studentName) }}>{initialsAd(r.user?.firstName, r.user?.lastName)}</div>
                          <div>
                            <div className="u-n">{studentName}</div>
                            <div className="u-e">{r.user?.email ?? r.user?.contact ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{r.date ?? '—'}</div>
                        {r.time && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{r.time}</div>}
                        {r.transactionId && (
                          <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#4F46E5', marginTop: 3, background: '#EEF2FF', padding: '1px 6px', borderRadius: 4, display: 'inline-block' }}>
                            {r.transactionId.length > 18 ? r.transactionId.slice(0, 16) + '…' : r.transactionId}
                          </div>
                        )}
                      </td>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#10B981' }}>{rMoney(r.amount)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#B45309', fontSize: 13 }}>{rMoney(r.mentorFee)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#DC2626', fontSize: 13 }}>{rMoney(r.platformFee)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#4F46E5', fontSize: 13 }}>{rMoney(r.gstAmount)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{rMoney(r.paymentGatewayCharge)}</span></td>
                      <td>
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: pyStyle.bg, color: pyStyle.color, whiteSpace: 'nowrap' }}>
                          {pyStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ReportPager page={page} totalPages={totalPages} totalRows={totalRows} limit={LIMIT} onPage={load} loading={loading} />
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   WEBINAR EARNING REPORT VIEW
   API: /report/webinar-earning
   Response: { data: { summary, webinarWise[], rows[], pagination } }
══════════════════════════════════════════════ */
function WebinarEarningReportView() {
  const today = new Date().toISOString().split('T')[0];
  const [reportData, setReportData] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [fromDate,   setFromDate]   = useState('2026-01-01');
  const [toDate,     setToDate]     = useState(today);
  const [page,       setPage]       = useState(1);
  const [wSumPage,   setWSumPage]   = useState(1);
  const [activeTab,  setActiveTab]  = useState('webinar'); // 'webinar' | 'registrations'
  const LIMIT       = 20;
  const W_SUM_LIMIT = 10;

  const load = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await httpService.get('/report/webinar-earning', {
        params: { fromDate, toDate, page: pg, limit: LIMIT },
        token: true,
      });
      setReportData(res?.data ?? null);
      setPage(pg);
      setWSumPage(1);
    } catch { setReportData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []); // eslint-disable-line

  const summary     = reportData?.summary    ?? {};
  const webinarWise = reportData?.webinarWise ?? reportData?.webinarWiseSummary ?? reportData?.webinars ?? [];
  const rows        = reportData?.rows        ?? reportData?.registrationRows ?? [];
  const pagination  = reportData?.pagination  ?? reportData?.rowsPagination ?? {};
  const totalPages  = pagination.totalPages   ?? 1;
  const totalRows   = pagination.totalRows    ?? rows.length;

  const wSumTotalPages   = Math.max(1, Math.ceil(webinarWise.length / W_SUM_LIMIT));
  const displayedWebinars = webinarWise.slice((wSumPage - 1) * W_SUM_LIMIT, wSumPage * W_SUM_LIMIT);

  const TAB_BTN = (id, label, icon) => (
    <button onClick={() => setActiveTab(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s',
        background: activeTab === id ? '#4F46E5' : 'transparent',
        color: activeTab === id ? '#fff' : 'var(--ink-3)',
        boxShadow: activeTab === id ? '0 4px 14px rgba(79,70,229,.3)' : 'none',
      }}>
      {icon} {label}
    </button>
  );

  const pyStatus = (r) => {
    if (r.paymentStatus === true || r.status === 'registered') return { bg: '#D1FAE5', color: '#065F46', label: 'Registered' };
    return { bg: '#FEF3C7', color: '#B45309', label: r.status ?? '—' };
  };

  return (
    <div>
      {/* Summary stat cards */}
      <ReportStatCards cards={[
        { label: 'Total Registrations', value: summary.totalRegistrations ?? '—',     icon: '🎟', bg: '#EEF2FF', color: '#4F46E5'   },
        { label: 'Total Revenue',        value: rMoney(summary.totalAmount),           icon: '💰', bg: '#D1FAE5', color: '#065F46'   },
        { label: 'Webinar Fee',          value: rMoney(summary.totalWebinarFee),       icon: '🎥', bg: '#FEF3C7', color: '#B45309'   },
        { label: 'Total GST',            value: rMoney(summary.totalGst),             icon: '🧾', bg: '#F0FDF4', color: '#059669'   },
        { label: 'Gateway Charge',       value: rMoney(summary.totalGatewayCharge),   icon: '🔗', bg: '#F8FAFC', color: 'var(--ink)' },
        { label: 'Total Discount',       value: rMoney(summary.totalDiscount),        icon: '🏷',  bg: '#FEF9C3', color: '#92400E'   },
      ]} />

      {/* Filter bar */}
      <ReportFilterBar
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onApply={() => load(1)} loading={loading}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: '#F1F5F9', borderRadius: 12, padding: 5, width: 'fit-content' }}>
        {TAB_BTN('webinar',       'Webinar-wise Summary', '📊')}
        {TAB_BTN('registrations', 'Registration Details', '📋')}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <svg viewBox="0 0 24 24" fill="none" width="40" height="40" style={{ marginBottom: 14, animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2.5"/><path d="M12 3a9 9 0 019 9" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"/></svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading webinar earnings…</div>
        </div>
      ) : !reportData ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🎬</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>No data available</div>
          <div style={{ fontSize: 13.5 }}>Adjust the date range and click Apply Filter.</div>
        </div>
      ) : activeTab === 'webinar' ? (
        /* ── Webinar-wise summary ── */
        <>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Webinar</th>
                  <th>Presenter</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Registrations</th>
                  <th>Total Revenue</th>
                  <th>Webinar Fee</th>
                  <th>GST</th>
                  <th>Discount</th>
                </tr>
              </thead>
              <tbody>
                {webinarWise.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>No webinar data found.</td></tr>
                ) : displayedWebinars.map((w, i) => {
                  const wInfo = w.Webinar ?? {};
                  return (
                    <tr key={w.webinarId ?? i} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('registrations')}>
                      <td style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600 }}>{(wSumPage - 1) * W_SUM_LIMIT + i + 1}</td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.3 }}>{wInfo.title ?? `Webinar #${w.webinarId}`}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: wInfo.isFree ? '#D1FAE5' : '#EEF2FF', color: wInfo.isFree ? '#065F46' : '#4F46E5', marginTop: 4, display: 'inline-block' }}>
                          {wInfo.isFree ? 'Free' : 'Paid'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{wInfo.presenter ?? '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{fmtDateAd(wInfo.date)}</td>
                      <td>
                        {wInfo.price != null
                          ? <span className="badge b-indigo">₹{wInfo.price}</span>
                          : <span style={{ color: 'var(--ink-3)' }}>—</span>}
                      </td>
                      <td><span className="badge b-green">{w.registrationCount}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#10B981' }}>{rMoney(w.totalAmount)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#B45309' }}>{rMoney(w.totalWebinarFee)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#4F46E5' }}>{rMoney(w.totalGst)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)' }}>{rMoney(w.totalDiscount)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ReportPager page={wSumPage} totalPages={wSumTotalPages} totalRows={webinarWise.length} limit={W_SUM_LIMIT} onPage={setWSumPage} loading={loading} />
        </>
      ) : (
        /* ── Registration details ── */
        <>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Registrant</th>
                  <th>Webinar</th>
                  <th>Presenter</th>
                  <th>Registered On</th>
                  <th>Webinar Fee</th>
                  <th>GST</th>
                  <th>Gateway</th>
                  <th>Discount</th>
                  <th>Total Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>No registrations found.</td></tr>
                ) : rows.map((r, i) => {
                  const wInfo = r.Webinar ?? {};
                  const ps    = pyStatus(r);
                  return (
                    <tr key={r.id ?? i}>
                      <td style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600 }}>{(page - 1) * LIMIT + i + 1}</td>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(r.username ?? '') }}>{(r.username ?? 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
                          <div>
                            <div className="u-n">{r.username ?? '—'}</div>
                            <div className="u-e">{r.email ?? '—'}</div>
                            {r.contact && <div className="u-e">{r.contact}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', lineHeight: 1.3 }}>{wInfo.title ?? `#${r.webinarId}`}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>Webinar date: {fmtDateAd(wInfo.date)}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{wInfo.presenter ?? '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{fmtDateAd(r.createdAt)}</td>
                      <td><span style={{ fontWeight: 700, color: '#B45309' }}>{rMoney(r.webinarFee)}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#4F46E5' }}>{rMoney(r.gstAmount)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{rMoney(r.paymentGatewayCharge)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)' }}>{rMoney(r.discount)}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#10B981' }}>{rMoney(r.totalAmount)}</span></td>
                      <td>
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: ps.bg, color: ps.color, whiteSpace: 'nowrap' }}>
                          {ps.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ReportPager page={page} totalPages={totalPages} totalRows={totalRows} limit={LIMIT} onPage={load} loading={loading} />
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   GST REPORT VIEW
   API: /report/gst
   Response: { data: { summary, mentorSessionGstRows[], mentorSessionPagination, webinarGstRows[], webinarPagination } }
══════════════════════════════════════════════ */
function GSTReportView() {
  const today = new Date().toISOString().split('T')[0];
  const [reportData,  setReportData]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [fromDate,    setFromDate]    = useState('2026-01-01');
  const [toDate,      setToDate]      = useState(today);
  const [sessionPage, setSessionPage] = useState(1);
  const [webinarPage, setWebinarPage] = useState(1);
  const [activeTab,   setActiveTab]   = useState('sessions'); // 'sessions' | 'webinar'
  const LIMIT = 20;

  const load = async (sPg = 1, wPg = 1) => {
    setLoading(true);
    try {
      const res = await httpService.get('/report/gst', {
        params: { fromDate, toDate, page: sPg, limit: LIMIT },
        token: true,
      });
      setReportData(res?.data ?? null);
      setSessionPage(sPg);
      setWebinarPage(wPg);
    } catch { setReportData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1, 1); }, []); // eslint-disable-line

  const summary     = reportData?.summary ?? {};
  const sessionRows = reportData?.mentorSessionGstRows  ?? [];
  const webinarRows = reportData?.webinarGstRows         ?? [];
  const sPagination = reportData?.mentorSessionPagination ?? {};
  const wPagination = reportData?.webinarPagination       ?? {};

  const sTotalPages = sPagination.totalPages ?? 1;
  const sTotalRows  = sPagination.totalRows  ?? sessionRows.length;
  const wTotalPages = wPagination.totalPages ?? 1;
  const wTotalRows  = wPagination.totalRows  ?? webinarRows.length;

  const mentorGst   = summary.mentorSessions         ?? {};
  const webinarGst  = summary.webinarRegistrations   ?? {};

  const TAB_BTN = (id, label, icon, count) => (
    <button onClick={() => setActiveTab(id)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s',
        background: activeTab === id ? '#4F46E5' : 'transparent',
        color: activeTab === id ? '#fff' : 'var(--ink-3)',
        boxShadow: activeTab === id ? '0 4px 14px rgba(79,70,229,.3)' : 'none',
      }}>
      {icon} {label}
      {count > 0 && (
        <span style={{ background: activeTab === id ? 'rgba(255,255,255,.25)' : '#E2E8F0', color: activeTab === id ? '#fff' : 'var(--ink-3)', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{count}</span>
      )}
    </button>
  );

  return (
    <div>
      {/* Top summary cards */}
      <ReportStatCards cards={[
        { label: 'Total GST Collected', value: rMoney(summary.totalGst),                                    icon: '🏛',  bg: '#D1FAE5', color: '#065F46' },
        { label: 'Session GST',          value: rMoney(mentorGst.totalGst),                                  icon: '📅', bg: '#EEF2FF', color: '#4F46E5' },
        { label: 'Webinar GST',          value: rMoney(webinarGst.totalGst),                                 icon: '🎥', bg: '#FEF3C7', color: '#B45309' },
        { label: 'Sessions Count',       value: mentorGst.totalSessions  ?? '—',                            icon: '📋', bg: '#F0FDF4', color: '#059669' },
        { label: 'Session Revenue',      value: rMoney(mentorGst.totalAmount),                               icon: '💳', bg: '#F8FAFC', color: 'var(--ink)' },
        { label: 'Webinar Revenue',      value: rMoney(webinarGst.totalAmount),                              icon: '💰', bg: '#FEF9C3', color: '#92400E' },
      ]} />

      {/* Filter bar */}
      <ReportFilterBar
        fromDate={fromDate} toDate={toDate}
        onFromChange={setFromDate} onToChange={setToDate}
        onApply={() => load(1, 1)} loading={loading}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: '#F1F5F9', borderRadius: 12, padding: 5, width: 'fit-content' }}>
        {TAB_BTN('sessions', 'Mentor Session GST', '📅', sessionRows.length)}
        {TAB_BTN('webinar',  'Webinar GST',        '🎥', webinarRows.length)}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <svg viewBox="0 0 24 24" fill="none" width="40" height="40" style={{ marginBottom: 14, animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" stroke="#E2E8F0" strokeWidth="2.5"/><path d="M12 3a9 9 0 019 9" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"/></svg>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Loading GST report…</div>
        </div>
      ) : !reportData ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🧾</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>No data available</div>
          <div style={{ fontSize: 13.5 }}>Adjust the date range and click Apply Filter.</div>
        </div>
      ) : activeTab === 'sessions' ? (
        /* ── Mentor Session GST table ── */
        <>
          {/* mini summary bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { label: 'Sessions',      value: mentorGst.totalSessions ?? '—',   color: '#4F46E5' },
              { label: 'Total Revenue', value: rMoney(mentorGst.totalAmount),     color: '#10B981' },
              { label: 'GST Collected', value: rMoney(mentorGst.totalGst),        color: '#DC2626' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mentor</th>
                  <th>Student</th>
                  <th>Session Date</th>
                  <th>Session ID</th>
                  <th>Amount</th>
                  <th>GST</th>
                  <th>Mentor Fee</th>
                  <th>Platform Fee</th>
                  <th>Gateway</th>
                  <th>Coupon</th>
                </tr>
              </thead>
              <tbody>
                {sessionRows.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>No session GST records found.</td></tr>
                ) : sessionRows.map((r, i) => {
                  const mentorName  = `${r.authUser?.firstName ?? ''} ${r.authUser?.lastName ?? ''}`.trim() || `#${r.authUser?.id}`;
                  const studentName = `${r.user?.firstName    ?? ''} ${r.user?.lastName    ?? ''}`.trim()   || `#${r.user?.id}`;
                  const hasGst      = Number(r.gstAmount) > 0;
                  return (
                    <tr key={r.id ?? i} style={{ background: hasGst ? '#FFFBEB' : undefined }}>
                      <td style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600 }}>{(sessionPage - 1) * LIMIT + i + 1}</td>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(mentorName) }}>{initialsAd(r.authUser?.firstName, r.authUser?.lastName)}</div>
                          <div>
                            <div className="u-n">{mentorName}</div>
                            <div className="u-e">{r.authUser?.email ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(studentName) }}>{initialsAd(r.user?.firstName, r.user?.lastName)}</div>
                          <div>
                            <div className="u-n">{studentName}</div>
                            <div className="u-e">{r.user?.email ?? r.user?.contact ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.date ?? '—'}</td>
                      <td>
                        <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#4F46E5', background: '#EEF2FF', padding: '2px 7px', borderRadius: 5, display: 'inline-block', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.sessionUniqueId ? r.sessionUniqueId.slice(0, 14) + '…' : `#${r.id}`}
                        </div>
                      </td>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#10B981' }}>{rMoney(r.amount)}</span></td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 14, color: hasGst ? '#DC2626' : 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>
                          {rMoney(r.gstAmount)}
                        </span>
                        {hasGst && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', display: 'inline-block', marginLeft: 5 }} />}
                      </td>
                      <td><span style={{ color: '#B45309', fontWeight: 700 }}>{rMoney(r.mentorFee)}</span></td>
                      <td><span style={{ color: '#4F46E5', fontWeight: 700 }}>{rMoney(r.platformFee)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{rMoney(r.paymentGatewayCharge)}</span></td>
                      <td>
                        {r.couponCode
                          ? <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: '#F0FDF4', color: '#059669', fontFamily: 'monospace' }}>{r.couponCode}</span>
                          : <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ReportPager page={sessionPage} totalPages={sTotalPages} totalRows={sTotalRows} limit={LIMIT} onPage={(pg) => { setSessionPage(pg); load(pg, webinarPage); }} loading={loading} />
        </>
      ) : (
        /* ── Webinar GST table ── */
        <>
          {/* mini summary bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { label: 'Registrations', value: webinarGst.totalRegistrations ?? '—', color: '#4F46E5' },
              { label: 'Total Revenue', value: rMoney(webinarGst.totalAmount),        color: '#10B981' },
              { label: 'GST Collected', value: rMoney(webinarGst.totalGst),           color: '#DC2626' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 14px' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
          <div className="d-table-wrap adm-table">
            <table className="d-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Registrant</th>
                  <th>Webinar</th>
                  <th>Presenter</th>
                  <th>Webinar Date</th>
                  <th>Registered On</th>
                  <th>Total Paid</th>
                  <th>GST</th>
                  <th>Webinar Fee</th>
                  <th>Gateway</th>
                  <th>Coupon</th>
                </tr>
              </thead>
              <tbody>
                {webinarRows.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)' }}>No webinar GST records found.</td></tr>
                ) : webinarRows.map((r, i) => {
                  const wInfo  = r.Webinar ?? {};
                  const hasGst = Number(r.gstAmount) > 0;
                  return (
                    <tr key={r.id ?? i} style={{ background: hasGst ? '#FFFBEB' : undefined }}>
                      <td style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600 }}>{(webinarPage - 1) * LIMIT + i + 1}</td>
                      <td>
                        <div className="u-cell">
                          <div className="u-av" style={{ background: nameColorAd(r.username ?? '') }}>{(r.username ?? 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
                          <div>
                            <div className="u-n">{r.username ?? '—'}</div>
                            <div className="u-e">{r.email ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ink)', lineHeight: 1.3 }}>{wInfo.title ?? `#${r.id}`}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{wInfo.presenter ?? '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{fmtDateAd(wInfo.date)}</td>
                      <td style={{ fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{fmtDateAd(r.createdAt)}</td>
                      <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#10B981' }}>{rMoney(r.totalAmount)}</span></td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 14, color: hasGst ? '#DC2626' : 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>
                          {rMoney(r.gstAmount)}
                        </span>
                        {hasGst && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', display: 'inline-block', marginLeft: 5 }} />}
                      </td>
                      <td><span style={{ color: '#B45309', fontWeight: 700 }}>{rMoney(r.webinarFee)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{rMoney(r.paymentGatewayCharge)}</span></td>
                      <td>
                        {r.couponCode
                          ? <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: '#F0FDF4', color: '#059669', fontFamily: 'monospace' }}>{r.couponCode}</span>
                          : <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ReportPager page={webinarPage} totalPages={wTotalPages} totalRows={wTotalRows} limit={LIMIT} onPage={(pg) => { setWebinarPage(pg); load(sessionPage, pg); }} loading={loading} />
        </>
      )}
    </div>
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
  const [revMonthData,      setRevMonthData]      = useState([0,0,0,0,0,0,0,0]);
  const [topMentorsData,    setTopMentorsData]    = useState([]);
  const [ovEarnings,        setOvEarnings]        = useState(null);
  const [ovMentors,         setOvMentors]         = useState([]);

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

    /* Transactions — revenue chart + top mentors by earnings */
    httpService.get('/transaction/admin/list', {
      params: { page: 1, limit: 500, formType: 'mentorbooking', status: 'success' },
      token: true,
    }).then(res => {
      const rows = res?.data?.rows ?? [];
      const { labels, months } = getLast8Months();
      /* monthly revenue */
      const revData = months.map(target =>
        rows
          .filter(r => {
            if (!r.createdAt) return false;
            const d = new Date(r.createdAt);
            return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
          })
          .reduce((s, r) => s + (Number(r.amount) || 0), 0)
      );
      setRevMonthData(revData);
      if (labels.length) setSignupMonthLabels(labels);
      /* top mentors */
      const mentorTotals = {};
      rows.forEach(t => {
        const k = t.authUserId;
        if (!mentorTotals[k]) mentorTotals[k] = { id: String(k), name: `${t.authUser?.firstName || ''} ${t.authUser?.lastName || ''}`.trim() || `#${k}`, email: t.authUser?.email || '', total: 0 };
        mentorTotals[k].total += Number(t.amount) || 0;
      });
      const sorted  = Object.values(mentorTotals).sort((a, b) => b.total - a.total).slice(0, 5);
      const maxAmt  = sorted[0]?.total || 1;
      setTopMentorsData(sorted.map(m => ({
        id:   m.id,
        name: m.name,
        email: m.email,
        amt:  m.total >= 100000 ? `₹${(m.total / 100000).toFixed(2)} L` : m.total >= 1000 ? `₹${(m.total / 1000).toFixed(1)}K` : `₹${m.total}`,
        pct:  Math.round((m.total / maxAmt) * 100),
      })));
    }).catch(() => {});

    /* Revenue Dashboard API — overview summary */
    const yr = new Date().getFullYear();
    httpService.get('/report/dashboard', {
      params: { fromDate: `${yr}-01-01`, toDate: new Date().toISOString().split('T')[0], page: 1, limit: 20 },
      token: true,
    }).then(res => {
      const d = res?.data ?? res ?? {};
      setOvEarnings(d.earnings ?? null);
      const ment = d.mentorWiseEarning ?? [];
      const maxA = ment.reduce((m, r) => Math.max(m, Number(r.totalAmount) || 0), 1);
      setOvMentors(ment.slice(0, 5).map(m => ({
        id:    String(m.authUserId),
        name:  `${m.authUser?.firstName || ''} ${m.authUser?.lastName || ''}`.trim() || `#${m.authUserId}`,
        email: m.authUser?.email || '',
        amt:   Number(m.totalAmount) >= 1000 ? `₹${(Number(m.totalAmount)/1000).toFixed(1)}K` : `₹${m.totalAmount}`,
        pct:   Math.round((Number(m.totalAmount) / maxA) * 100),
      })));
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
        {/* <NavBtn id="payouts"  label="Mentor Payouts"    count={2}>
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2.3" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12.5" r="2.6" stroke="currentColor" strokeWidth="1.7"/></svg>
        </NavBtn> */}
        <NavBtn id="revenue"  label="Revenue & Payments">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.7"/><path d="M12 6v2m0 8v2M9.5 10.5a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 2s-2.5.5-2.5 2a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
        </NavBtn>
        <div className="ds-sec" style={{ fontSize: 10, paddingLeft: 18, letterSpacing: '.1em', opacity: 0.75 }}>Reports</div>
        <NavBtn id="report-mentor-payout"   label="Mentor Payout">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M12 12v4m0 0l-1.5-1.5M12 16l1.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
        </NavBtn>
        <NavBtn id="report-webinar-earning" label="Webinar Earning">
          <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2.3" stroke="currentColor" strokeWidth="1.7"/><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M7 10l3 3 7-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </NavBtn>
        <NavBtn id="report-gst"             label="GST Report">
          <svg viewBox="0 0 24 24" fill="none"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
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
                    months={signupMonthLabels.length ? signupMonthLabels : CHART_MONTHS}
                    maxY={Math.max(10, ...revMonthData, ...SESS_DATA)}
                    series={[
                      { id: 'lcrev',  color: '#4F46E5', data: revMonthData.some(v => v > 0) ? revMonthData : REV_DATA  },
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

              {/* ── Earnings Overview (from /report/dashboard) ── */}
              {ovEarnings && (
                <div className="chart-grid" style={{ marginBottom: 0 }}>
                  <div className="panel">
                    <div className="panel-head"><h2>Mentor Session Earnings</h2></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {[
                        { l: 'Total Revenue',  v: rMoney(ovEarnings.mentorSessions?.totalAmount ?? 0),    col: '#1E1B4B', big: true },
                        { l: 'Mentor Fee',     v: rMoney(ovEarnings.mentorSessions?.totalMentorFee ?? 0), col: 'var(--ink-2)' },
                        { l: 'Platform Fee',   v: rMoney(ovEarnings.mentorSessions?.totalPlatformFee ?? 0), col: '#4F46E5' },
                        { l: 'GST Collected',  v: rMoney(ovEarnings.mentorSessions?.totalGst ?? 0),       col: '#B45309' },
                      ].map(r => (
                        <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                          <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600 }}>{r.l}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: r.big ? 800 : 700, fontSize: r.big ? 18 : 14, color: r.col }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 18, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>Platform Earning</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>{rMoney(ovEarnings.totalPlatformEarning ?? 0)}</span>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><h2>Webinar Earnings</h2></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {[
                        { l: 'Total Revenue', v: rMoney(ovEarnings.webinars?.totalAmount ?? 0),      col: '#14532D', big: true },
                        { l: 'Webinar Fee',   v: rMoney(ovEarnings.webinars?.totalWebinarFee ?? 0),  col: 'var(--ink-2)' },
                        { l: 'GST Collected', v: rMoney(ovEarnings.webinars?.totalGst ?? 0),         col: '#B45309' },
                      ].map(r => (
                        <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                          <span style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600 }}>{r.l}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: r.big ? 800 : 700, fontSize: r.big ? 18 : 14, color: r.col }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 18 }}>
                      <DonutChart
                        total={Math.max(1, Number(ovEarnings.webinars?.totalAmount ?? 0))}
                        segments={[
                          { label: 'Webinar Fee', value: Number(ovEarnings.webinars?.totalWebinarFee ?? 0), color: '#10B981' },
                          { label: 'GST',         value: Number(ovEarnings.webinars?.totalGst ?? 0),        color: '#F59E0B' },
                        ].filter(s => s.value > 0)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Charts row 2 */}
              <div className="chart-grid">
                <div className="panel">
                  <div className="panel-head"><h2>Top Mentors by Earnings</h2></div>
                  <div className="barlist">
                    {(ovMentors.length ? ovMentors : topMentorsData.length ? topMentorsData : TOP_MENTORS).map((m, i) => (
                      <div key={m.id ?? `${m.name}-${i}`} className="bl-row">
                        <div className="bl-top">
                          <div>
                            <span className="bl-n">{m.name}</span>
                            {m.email && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{m.email}</div>}
                          </div>
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

          {section === 'sessions'                && <SessionsView />}
          {section === 'mentors'                 && <MentorsView />}
          {section === 'users'                   && <UsersView />}
          {section === 'payouts'                 && <PayoutsView />}
          {section === 'jobs'                    && <JobsView />}
          {section === 'feedback'                && <FeedbackView />}
          {section === 'revenue'                 && <RevenueDashboardView />}
          {section === 'tickets'                 && <AdminTicketsView />}
          {section === 'report-mentor-payout'    && <MentorPayoutReportView />}
          {section === 'report-webinar-earning'  && <WebinarEarningReportView />}
          {section === 'report-gst'              && <GSTReportView />}
        </div>
      </div>
    </div>
  );
}
