import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import httpService from '../utils/apiService.tsx';

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

/* ── config ── */
const STATUS_CFG = {
  active:        { label: 'Open',        bg: '#EEF2FF', col: '#4F46E5', border: '#4F46E5', dot: '#4F46E5' },
  'in-progress': { label: 'In Progress', bg: '#FEF3DA', col: '#B45309', border: '#F59E0B', dot: '#F59E0B' },
  done:          { label: 'Resolved',    bg: '#DCFCE7', col: '#15803D', border: '#22C55E', dot: '#22C55E' },
  hold:          { label: 'On Hold',     bg: '#FEF9C3', col: '#92400E', border: '#FCD34D', dot: '#FCD34D' },
  reject:        { label: 'Rejected',    bg: '#FEE2E2', col: '#DC2626', border: '#EF4444', dot: '#EF4444' },
};
const STATUS_KEYS  = ['active','in-progress','done','hold','reject'];
const PRIORITY_CFG = {
  high:   { label: 'High',   cls: 'high',   col: '#DC2626', bg: '#FEE2E2' },
  medium: { label: 'Medium', cls: 'medium', col: '#B45309', bg: '#FEF3DA' },
  low:    { label: 'Low',    cls: 'low',    col: '#065F46', bg: '#DCFCE7' },
};
const EMPTY_FORM = { title: '', description: '', priority: 'medium' };

const TICKET_TITLES = [
  { label: 'Payment Issue',            icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { label: 'Session Booking Issue',    icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
  { label: 'Unable to Join Session',   icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
  { label: 'Mentor Assignment Issue',  icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg> },
  { label: 'Login Problem',            icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
  { label: 'OTP Not Received',         icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
  { label: 'Profile Update Issue',     icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { label: 'Website Issue',            icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
  { label: 'Technical Error',          icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
  { label: 'Package Activation Issue', icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
  { label: 'Refund Request',           icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg> },
  { label: 'General Inquiry',          icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg> },
  { label: 'Complaint',                icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { label: 'Suggestion / Feedback',    icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6"/><path d="M12 3a6 6 0 016 6c0 2.2-1.2 4.1-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z"/></svg> },
  { label: 'Other Issue',              icon: <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
];

const fmtDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const normStatus = (s) => (s in STATUS_CFG ? s : 'active');

const newestFirst = (arr) =>
  [...arr].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : (Number(a.id) || 0);
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : (Number(b.id) || 0);
    return tb - ta;
  });

export default function SupportTicketsView({ userId, userProfile = {} }) {
  const [tickets,        setTickets]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search,         setSearch]         = useState('');
  const [showForm,       setShowForm]       = useState(false);
  const [form,           setForm]           = useState(EMPTY_FORM);
  const [submitting,     setSubmitting]     = useState(false);
  const [expanded,       setExpanded]       = useState(null);
  const [page,           setPage]           = useState(1);
  const [hasMore,        setHasMore]        = useState(false);

  const loadTickets = async (pg = 1, replace = true) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10, activeOnly: true };
      if (userId) params.userId = userId;
      const res  = await httpService.get('/supportTicket', { params, token: true });
      const data = newestFirst(Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
      setTickets(prev => replace ? data : [...prev, ...data]);
      setHasMore(data.length === 10);
      setPage(pg);
    } catch { if (replace) setTickets([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { loadTickets(1, true); }, [userId]); // eslint-disable-line

  const handleSubmit = async () => {
    if (!form.title || !form.description.trim()) {
      toast.error('Please select an issue type and add a description.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await httpService.post('/supportTicket', {
        data: {
          name:        userProfile.name  || '',
          email:       userProfile.email || '',
          phone:       userProfile.phone || '',
          title:       form.title,
          description: form.description,
          priority:    form.priority,
        },
        token: true,
      });
      toast.success('Ticket raised! Our support team will respond within 24 hours.');

      const ticketCode = res?.data?.ticketCode || res?.data?.ticketId || res?.data?.id || res?.ticketCode || res?.ticketId || '';
      const codeDisplay = ticketCode ? `#${ticketCode}` : '';

      sendMail(
        [userProfile.email],
        `Support Ticket Raised${codeDisplay ? ` — ${codeDisplay}` : ''} | Mentor4Career`,
        `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1E293B">
          <h2 style="color:#4F46E5;margin-bottom:4px">We've received your support request</h2>
          <p style="color:#64748B;margin-top:0">Hi ${userProfile.name || 'there'},</p>
          <p>Your support ticket has been raised successfully. Our team will review it and get back to you within <b>24 hours</b>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#F8FAFF;border-radius:10px;overflow:hidden">
            ${codeDisplay ? `<tr><td style="padding:10px 14px;color:#6B7280;width:130px;border-bottom:1px solid #E2E8F0">Ticket ID</td><td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #E2E8F0">${codeDisplay}</td></tr>` : ''}
            <tr><td style="padding:10px 14px;color:#6B7280;border-bottom:1px solid #E2E8F0">Issue Type</td><td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #E2E8F0">${form.title}</td></tr>
            <tr><td style="padding:10px 14px;color:#6B7280;border-bottom:1px solid #E2E8F0">Priority</td><td style="padding:10px 14px;font-weight:600;text-transform:capitalize;border-bottom:1px solid #E2E8F0">${form.priority}</td></tr>
            <tr><td style="padding:10px 14px;color:#6B7280;vertical-align:top">Description</td><td style="padding:10px 14px">${form.description}</td></tr>
          </table>
          <p style="color:#6B7280;font-size:13px">You will be notified by email when our support team replies. Thank you for reaching out to Mentor4Career!</p>
        </div>`
      );

      setForm(EMPTY_FORM);
      setShowForm(false);
      loadTickets(1, true);
    } catch {}
    finally { setSubmitting(false); }
  };

  /* counts for pills */
  const statusCounts = STATUS_KEYS.reduce((acc, k) => {
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
      return (t.title||'').toLowerCase().includes(q)      ||
             (t.description||'').toLowerCase().includes(q)||
             (t.ticketCode||'').toLowerCase().includes(q);
    }
    return true;
  });

  const IS  = { width: '100%', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 13px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', outline: 'none', background: '#fff' };
  const lbl = (txt, req) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
      {txt}{req && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
  );

  return (
    <div>
      {/* ── head ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Support Tickets</h2>
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4 }}>Raise and track your support requests</p>
        </div>
        <button onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-brand)', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          Raise a Ticket
        </button>
      </div>

      {/* ── stat cards ── */}
      <div className="tc-stat-grid" style={{ marginBottom: 22 }}>
        {[
          { n: statusCounts.all,              l: 'Total',       col: 'var(--ink)' },
          { n: statusCounts.active,           l: 'Open',         col: '#4F46E5'    },
          { n: statusCounts['in-progress'],   l: 'In Progress',  col: '#B45309'    },
          { n: statusCounts.done,             l: 'Resolved',     col: '#15803D'    },
        ].map(s => (
          <div key={s.l} className="tc-stat">
            <div className="tc-stat-n" style={{ color: s.col }}>{s.n}</div>
            <div className="tc-stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── filter bar ── */}
      <div style={{ background: '#F8FAFC', border: '1.5px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
        {/* search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ color: 'var(--ink-3)', flexShrink: 0 }}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, description, ticket code…"
              style={{ border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)', background: 'transparent', width: '100%', fontFamily: 'var(--font-body)' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>}
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
            <button onClick={() => setStatusFilter('all')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 99, border: `1.5px solid ${statusFilter === 'all' ? '#4F46E5' : 'var(--border)'}`, background: statusFilter === 'all' ? '#EEF2FF' : '#fff', color: statusFilter === 'all' ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s' }}>
              All
              <span style={{ background: statusFilter === 'all' ? '#4F46E5' : '#E2E8F0', color: statusFilter === 'all' ? '#fff' : 'var(--ink-3)', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{statusCounts.all}</span>
            </button>
            {STATUS_KEYS.map(k => {
              const cfg = STATUS_CFG[k];
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
              const cfg = PRIORITY_CFG[k];
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
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1.5px dashed var(--border)', borderRadius: 'var(--r-md)', padding: '48px 32px', textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" width="44" height="44" style={{ color: '#CBD5E1', marginBottom: 14 }}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink-2)', marginBottom: 6 }}>
            {statusFilter === 'all' && priorityFilter === 'all' && !search ? 'No tickets yet' : 'No matching tickets'}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 18 }}>
            {statusFilter === 'all' && priorityFilter === 'all' && !search ? 'Have an issue? Raise a ticket and our team will help.' : 'Try adjusting your filters.'}
          </div>
          {statusFilter === 'all' && priorityFilter === 'all' && !search && (
            <button onClick={() => setShowForm(true)}
              style={{ padding: '10px 22px', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-brand)' }}>
              Raise your first ticket
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(t => {
            const st       = STATUS_CFG[normStatus(t.status)];
            const pri      = PRIORITY_CFG[t.priority] || PRIORITY_CFG.medium;
            const tid      = t.id || t._id;
            const isOpen   = expanded === tid;
            const comments = Array.isArray(t.comments) ? t.comments : (t.comments ? [t.comments] : []);

            return (
              <div key={tid} className="tc-card" style={{ borderLeft: `3.5px solid ${st.border}` }}>
                {/* ── card header row ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: 'var(--ink-3)', letterSpacing: '.03em' }}>
                    #{t.ticketCode || String(tid).slice(-5).padStart(5,'0')}
                  </span>
                  <span className={`tc-priority ${pri.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg viewBox="0 0 24 24" fill="none" width="8" height="8"><circle cx="12" cy="12" r="9" fill="currentColor"/></svg>
                    {pri.label}
                  </span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: st.bg, color: st.col, fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 100 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                    {st.label}
                  </span>
                </div>

                {/* title */}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>{t.title}</div>

                {/* description */}
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6, overflow: 'hidden', display: isOpen ? 'block' : '-webkit-box', WebkitLineClamp: isOpen ? 'unset' : 2, WebkitBoxOrient: 'vertical' }}>
                  {t.description}
                </div>

                {/* ── comments section (always visible when expanded) ── */}
                {isOpen && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                      Comments ({comments.length})
                    </div>
                    {comments.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#F8FAFC', border: '1px dashed var(--border)', borderRadius: 10 }}>
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ color: '#CBD5E1', flexShrink: 0 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>No comments from support team yet.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {comments.map((c, i) => (
                          <div key={i} style={{ background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 10, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>{c.name || 'Support'}</span>
                                {c.role && <span style={{ fontSize: 11, fontWeight: 600, background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 99 }}>{c.role}</span>}
                                {c.status && STATUS_CFG[c.status] && (
                                  <span style={{ fontSize: 11, fontWeight: 700, background: STATUS_CFG[c.status].bg, color: STATUS_CFG[c.status].col, padding: '2px 8px', borderRadius: 99 }}>
                                    {STATUS_CFG[c.status].label}
                                  </span>
                                )}
                              </div>
                              {c.createdAt && <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{fmtDate(c.createdAt)}</span>}
                            </div>
                            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{c.comment}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── footer ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-3)' }}>
                      <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      {fmtDate(t.createdAt)}
                    </span>
                    {comments.length > 0 && (
                      <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 99 }}>
                        {comments.length} comment{comments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
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
              style={{ alignSelf: 'center', padding: '9px 28px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-2)', cursor: 'pointer' }}>
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}

      {/* ── Raise Ticket modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setForm(EMPTY_FORM); } }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 720, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '96dvh', display: 'flex', flexDirection: 'column' }}>

            {/* modal header */}
            <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 24px 18px', color: '#fff', position: 'relative', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, marginBottom: 4 }}>Raise a Support Ticket</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Describe your issue — our team will respond within 24 hours.</div>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* modal body */}
            <div className="no-scrollbar" style={{ padding: '14px 20px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* user info chips */}
              {(userProfile.name || userProfile.email) && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {userProfile.name  && <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5 }}><svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{userProfile.name}</span>}
                  {userProfile.email && <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5 }}><svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{userProfile.email}</span>}
                  {userProfile.phone && <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5 }}><svg viewBox="0 0 24 24" fill="none" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.04 1.22 2 2 0 012 .04h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>{userProfile.phone}</span>}
                </div>
              )}

              {/* issue type grid */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Issue Type<span style={{ color: '#EF4444' }}> *</span>
                  </label>
                  {form.title && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>
                      <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><circle cx="12" cy="12" r="10" fill="#4F46E5"/><path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {form.title}
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                  {TICKET_TITLES.map(({ label, icon }) => {
                    const selected = form.title === label;
                    return (
                      <button key={label} type="button" onClick={() => setForm(f => ({ ...f, title: label }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, border: `1.5px solid ${selected ? '#4F46E5' : 'var(--border)'}`, background: selected ? '#EEF2FF' : '#FAFAFA', color: selected ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-body)', fontWeight: selected ? 700 : 500, fontSize: 12.5, cursor: 'pointer', transition: 'all .15s', textAlign: 'left', lineHeight: 1.3 }}>
                        <span style={{ display: 'flex', flexShrink: 0, color: selected ? '#4F46E5' : 'var(--ink-3)' }}>{icon}</span>
                        <span style={{ flex: 1 }}>{label}</span>
                        {selected && (
                          <svg viewBox="0 0 24 24" fill="none" width="13" height="13" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" fill="#4F46E5"/>
                            <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* description */}
              <div>
                {lbl('Description', true)}
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe your issue in detail — include any relevant session IDs, dates, or error messages."
                  style={{ ...IS, resize: 'none', lineHeight: 1.6 }} />
              </div>

              {/* priority */}
              <div>
                {lbl('Priority')}
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['low','medium','high']).map(v => {
                    const cfg = PRIORITY_CFG[v];
                    const active = form.priority === v;
                    return (
                      <button key={v} type="button" onClick={() => setForm(f => ({ ...f, priority: v }))}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.col : 'var(--ink-3)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? cfg.col : '#CBD5E1' }} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* submit */}
              <button onClick={handleSubmit} disabled={submitting || !form.title || !form.description.trim()}
                style={{ padding: '12px 0', background: submitting || !form.title || !form.description.trim() ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: submitting || !form.title || !form.description.trim() ? 'not-allowed' : 'pointer', boxShadow: (!submitting && form.title && form.description.trim()) ? '0 4px 14px rgba(79,70,229,.35)' : 'none', transition: 'all .2s' }}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
