import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import httpService from '../utils/apiService.tsx';

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
  { label: 'Payment Issue',           icon: '💳' },
  { label: 'Session Booking Issue',   icon: '📅' },
  { label: 'Unable to Join Session',  icon: '🔗' },
  { label: 'Mentor Assignment Issue', icon: '👨‍🏫' },
  { label: 'Login Problem',           icon: '🔐' },
  { label: 'OTP Not Received',        icon: '📱' },
  { label: 'Profile Update Issue',    icon: '✏️'  },
  { label: 'Website Issue',           icon: '🌐' },
  { label: 'Technical Error',         icon: '⚙️'  },
  { label: 'Package Activation Issue',icon: '📦' },
  { label: 'Refund Request',          icon: '↩️'  },
  { label: 'General Inquiry',         icon: '❓' },
  { label: 'Complaint',               icon: '⚠️'  },
  { label: 'Suggestion / Feedback',   icon: '💡' },
  { label: 'Other Issue',             icon: '📝' },
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
      await httpService.post('/supportTicket', {
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
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}>

            {/* modal header */}
            <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '22px 24px 18px', color: '#fff', position: 'relative', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, marginBottom: 4 }}>Raise a Support Ticket</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Describe your issue — our team will respond within 24 hours.</div>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'grid', placeItems: 'center' }}>×</button>
            </div>

            {/* modal body */}
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* user info chips */}
              {(userProfile.name || userProfile.email) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {userProfile.name  && <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 12.5, fontWeight: 600, padding: '5px 12px', borderRadius: 99 }}>👤 {userProfile.name}</span>}
                  {userProfile.email && <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 12.5, fontWeight: 600, padding: '5px 12px', borderRadius: 99 }}>✉ {userProfile.email}</span>}
                  {userProfile.phone && <span style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 12.5, fontWeight: 600, padding: '5px 12px', borderRadius: 99 }}>📞 {userProfile.phone}</span>}
                </div>
              )}

              {/* issue type grid */}
              <div>
                {lbl('Issue Type', true)}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                  {TICKET_TITLES.map(({ label, icon }) => {
                    const selected = form.title === label;
                    return (
                      <button key={label} type="button" onClick={() => setForm(f => ({ ...f, title: label }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 11, border: `1.5px solid ${selected ? '#4F46E5' : 'var(--border)'}`, background: selected ? '#EEF2FF' : '#FAFAFA', color: selected ? '#4F46E5' : 'var(--ink-2)', fontFamily: 'var(--font-body)', fontWeight: selected ? 700 : 500, fontSize: 13.5, cursor: 'pointer', transition: 'all .15s', textAlign: 'left', lineHeight: 1.3 }}>
                        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
                        <span>{label}</span>
                        {selected && (
                          <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" fill="#4F46E5"/>
                            <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                {form.title && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#4F46E5', fontWeight: 600 }}>
                    <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><circle cx="12" cy="12" r="10" fill="#4F46E5"/><path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Selected: {form.title}
                  </div>
                )}
              </div>

              {/* description */}
              <div>
                {lbl('Description', true)}
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4} placeholder="Describe your issue in detail — include any relevant session IDs, dates, or error messages."
                  style={{ ...IS, resize: 'vertical', lineHeight: 1.6 }} />
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
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${active ? cfg.col : 'var(--border)'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.col : 'var(--ink-3)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .15s' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: active ? cfg.col : '#CBD5E1' }} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* submit */}
              <button onClick={handleSubmit} disabled={submitting || !form.title || !form.description.trim()}
                style={{ padding: '13px 0', background: submitting || !form.title || !form.description.trim() ? '#C7D2FE' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: submitting || !form.title || !form.description.trim() ? 'not-allowed' : 'pointer', boxShadow: (!submitting && form.title && form.description.trim()) ? '0 4px 14px rgba(79,70,229,.35)' : 'none', transition: 'all .2s', marginTop: 2 }}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
