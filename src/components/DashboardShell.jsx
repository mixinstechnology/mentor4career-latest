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
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: accent, borderRadius: '16px 0 0 16px',
      }} />
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

  const [sideOpen,      setSideOpen]      = React.useState(false);
  const [sideCollapsed, setSideCollapsed] = React.useState(false);

  const handleBurger = () => {
    if (window.innerWidth > 980) {
      setSideCollapsed(v => !v);
    } else {
      setSideOpen(v => !v);
    }
  };

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

  const heroBanner = (
    <section style={{
      background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 40%, #7C3AED 75%, #0FA968 100%)',
      padding: '26px clamp(20px,3vw,38px) 30px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: '35%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 10, left: '60%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
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
  );

  if (!hasNav) {
    return (
      <main id="top">
        {heroBanner}
        <section className="section-pad" style={{ paddingTop: 24 }}>
          <div className="wrap">
            {kpiBar}
            {children}
            {demoNote}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="top">
      <div className={`dash${sideCollapsed ? ' side-collapsed' : ''}`}>

        {/* ═══ SIDEBAR ═══ */}
        <aside className={`dash-side${sideOpen ? ' open' : ''}`}>
          <a href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ display: 'flex', color: 'var(--indigo,#4F46E5)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L3 8l9 5 9-5-9-5z" fill="currentColor"/>
                <path d="M6 11v4.5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5V11" stroke="currentColor" strokeWidth="1.7" fill="none"/>
              </svg>
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
              Mentor<b style={{ color: 'var(--indigo,#4F46E5)' }}>4</b>Career
            </span>
          </a>

          {navItems.map((item, i) => {
            if (item.divider) {
              return item.label
                ? <div key={`sec-${i}`} className="ds-sec">{item.label}</div>
                : <div key={`div-${i}`} style={{ height: 1, background: 'var(--border,#e2e8f0)', margin: '8px 12px' }} />;
            }
            return (
              <button
                key={item.id}
                className={`ds-link${activeSection === item.id ? ' active' : ''}`}
                onClick={() => { onSectionChange?.(item.id); setSideOpen(false); }}
                title={item.label}
              >
                {item.icon}
                <span className="ds-label">{item.label}</span>
                {(item.count ?? 0) > 0 && <span className="ds-count">{item.count}</span>}
              </button>
            );
          })}

          <div className="ds-foot">
            <button
              className="ds-link"
              onClick={() => { signOut(); navigate('/'); }}
              title="Sign out"
            >
              <svg viewBox="0 0 24 24" fill="none" width="19" height="19">
                <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4M9 16l-4-4 4-4M5 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ds-label">Sign out</span>
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
              <h1 style={{ fontSize: 20, letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
              {subtitle && <div className="dt-sub">{subtitle}</div>}
            </div>
            <div className="dt-right">
              <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500, whiteSpace: 'nowrap' }}
                className="db-topbar-title">
                {dateStr}
              </span>
              {user && (
                <span className="badge b-indigo" style={{ padding: '6px 12px', fontSize: 12 }}>
                  {roleLabel}
                </span>
              )}
            </div>
          </header>

          {heroBanner}

          <div style={{ padding: 'clamp(18px,3vw,32px)' }}>
            {activeSection === 'overview' && kpiBar}
            {children}
            {demoNote}
          </div>
        </div>

      </div>
    </main>
  );
}
