import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const KPI_PALETTE = [
  { accent: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
  { accent: '#0FA968', bg: 'rgba(15,169,104,0.08)' },
  { accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  { accent: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
];

function KpiCard({ k, index }) {
  const { accent, bg } = KPI_PALETTE[index % KPI_PALETTE.length];
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface,#fff)',
        borderRadius: 16,
        padding: '20px 22px',
        border: '1.5px solid var(--border,#e2e8f0)',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.10)' : '0 2px 10px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.18s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* left accent stripe */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: accent, borderRadius: '16px 0 0 16px',
      }} />
      {/* background tint blob */}
      <div style={{
        position: 'absolute', right: -20, top: -20, width: 80, height: 80,
        borderRadius: '50%', background: bg, pointerEvents: 'none',
      }} />
      <div style={{ paddingLeft: 8, position: 'relative' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 34, color: accent, lineHeight: 1,
        }}>{k.v}</div>
        <div style={{
          color: 'var(--ink-2)', fontSize: 13, marginTop: 7,
          fontWeight: 500, letterSpacing: '0.01em',
        }}>{k.l}</div>
      </div>
    </div>
  );
}

export default function DashboardShell({
  title, subtitle, kpis = [],
  navItems = [], activeSection = 'overview', onSectionChange,
  children
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const hasNav = navItems.length > 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  const roleLabel = user?.role === 'mentor' ? 'Mentor'
    : user?.role === 'admin' ? 'Admin' : 'Student';

  const kpiBar = kpis.length > 0 && (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
      gap: 16, marginBottom: 28,
    }}>
      {kpis.map((k, i) => <KpiCard key={k.l} k={k} index={i} />)}
    </div>
  );

  const demoNote = !user && (
    <p style={{ color: 'var(--ink-3)', fontSize: 13.5, marginTop: 20 }}>
      You're viewing a demo dashboard.{' '}
      <Link to="/" style={{ color: 'var(--indigo)', fontWeight: 600 }}>Back home</Link>
    </p>
  );

  return (
    <main id="top">
      {/* ── Professional Dashboard Header ── */}
      <section style={{
        background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 40%, #7C3AED 75%, #0FA968 100%)',
        padding: '26px 0 30px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '35%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 10, left: '60%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            {/* left: greeting + title */}
            <div>
              {user && (
                <div style={{
                  color: 'rgba(255,255,255,0.72)', fontSize: 13.5, fontWeight: 500,
                  marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#86efac', display: 'inline-block', flexShrink: 0 }} />
                  {greeting()}, {user.name || roleLabel}
                </div>
              )}
              {!user && subtitle && (
                <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13.5, fontWeight: 500, marginBottom: 6 }}>
                  {subtitle}
                </div>
              )}
              <h1 style={{
                color: '#fff', margin: 0, fontSize: 'clamp(22px,4vw,30px)',
                fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15,
              }}>
                {title}
              </h1>
            </div>

            {/* right: date + role badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)',
                padding: '5px 14px', borderRadius: 20,
                color: 'rgba(255,255,255,0.9)', fontSize: 12.5, fontWeight: 500,
                letterSpacing: '0.01em',
              }}>
                {dateStr}
              </span>
              {user && (
                <span style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  padding: '5px 16px', borderRadius: 20,
                  color: '#fff', fontSize: 12.5, fontWeight: 700,
                  letterSpacing: '0.02em',
                }}>
                  {roleLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {hasNav ? (
        <div className="db-layout">
          <aside className="db-sidebar">
            <nav className="db-nav" aria-label="Dashboard navigation">
              {navItems.map((item, i) =>
                item.divider ? (
                  <div key={`div-${i}`} className="db-nav-divider" />
                ) : (
                  <button
                    key={item.id}
                    className={`db-nav-item${activeSection === item.id ? ' active' : ''}`}
                    onClick={() => onSectionChange?.(item.id)}
                  >
                    {item.icon}
                    {item.label}
                    {(item.count ?? 0) > 0 && (
                      <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 99, background: '#4F46E5', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              )}
            </nav>
            <div className="db-sidebar-footer">
              <button className="btn btn-ghost btn-sm db-logout-btn" onClick={() => { signOut(); navigate('/'); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </aside>
          <div className="db-main">
            {activeSection === 'overview' && kpiBar}
            {children}
            {demoNote}
          </div>
        </div>
      ) : (
        <section className="section-pad" style={{ paddingTop: 24 }}>
          <div className="wrap">
            {kpiBar}
            {children}
            {demoNote}
          </div>
        </section>
      )}
    </main>
  );
}
