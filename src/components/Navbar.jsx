import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Burger, Close } from './Icons.jsx';
import M4CLogo from '../utils/images/M4C_logo_transparent.png';
import ThemeSwitcher from './ThemeSwitcher.jsx';

/* ── public nav links ── */
const LINKS = [
  // { to: '/predictor', label: 'AI Predictor' },
  { to: '/mentors',   label: 'Mentorship'          },
  { to: '/jobs',      label: 'Jobs'                },
  { to: '/webinars',  label: 'Webinars'            },
  { to: '/interview', label: 'Interview Preparation'},
  { to: '/contact',   label: 'Contact Us'          },
];

const DASHBOARD_PATHS = ['/dashboard', '/mentor-dashboard', '/admin-dashboard'];

const PAGE_TITLE = {
  '/dashboard':        'Student Dashboard',
  '/mentor-dashboard': 'Mentor Dashboard',
  '/admin-dashboard':  'Admin Dashboard',
};

/* ── icons ── */
const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" width={14} height={14} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={15} height={15} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width={15} height={15} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ── avatar ── */
function AvatarBubble({ name, role, size = 34 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : role?.[0]?.toUpperCase() || 'U';
  const COLORS = ['#4F46E5','#7C5CF7','#0FA968','#F59E0B','#EC4899'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + (name||'').charCodeAt(i)) & 0xffff;
  const bg = COLORS[h % COLORS.length];
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      fontFamily: 'var(--font-display)',
    }}>
      {initials}
    </span>
  );
}

/* ── user dropdown (dashboard only) ── */
function UserDropdown({ user, signOut, dashboardPath }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const roleLabel = user.role === 'mentor' ? 'Mentor' : user.role === 'admin' ? 'Admin' : 'Student';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: open ? 'var(--surface-2,#f1f5f9)' : 'transparent',
          border: '1.5px solid var(--border,#e2e8f0)',
          borderRadius: 40, padding: '4px 10px 4px 4px',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2,#f1f5f9)'}
        onMouseLeave={e => e.currentTarget.style.background = open ? 'var(--surface-2,#f1f5f9)' : 'transparent'}
      >
        <AvatarBubble name={user.name} role={user.role} size={30} />
        <div className="ud-name-block" style={{ textAlign: 'left', lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name || roleLabel}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{roleLabel}</div>
        </div>
        <span style={{ color: 'var(--ink-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--surface,#fff)', borderRadius: 14,
          border: '1.5px solid var(--border,#e2e8f0)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 210, zIndex: 9000, overflow: 'hidden',
        }}>
          {/* user info header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border,#e2e8f0)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AvatarBubble name={user.name} role={user.role} size={38} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{user.name || roleLabel}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{roleLabel} account</div>
            </div>
          </div>

          {/* menu items */}
          <div style={{ padding: '6px 0' }}>
            <Link
              to={dashboardPath}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', fontSize: 13.5, fontWeight: 500,
                color: 'var(--ink)', textDecoration: 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2,#f8fafc)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color: 'var(--indigo,#4F46E5)' }}><DashboardIcon /></span>
              My Dashboard
            </Link>
          </div>

          {/* logout */}
          <div style={{ padding: '6px 0 8px', borderTop: '1px solid var(--border,#e2e8f0)' }}>
            <button
              onClick={() => { setOpen(false); signOut(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', fontSize: 13.5, fontWeight: 500,
                color: '#EF4444', background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
export default function Navbar() {
  const { openAuth, user, signOut } = useAuth();
  const { pathname }  = useLocation();
  const isDashboard   = DASHBOARD_PATHS.includes(pathname);
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const dashboardPath =
    user?.role === 'mentor' ? '/mentor-dashboard'
    : user?.role === 'admin' ? '/admin-dashboard'
    : '/dashboard';

  /* ── Dashboard topbar ── */
  if (isDashboard) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: 'var(--surface,#fff)',
        borderBottom: '1.5px solid var(--border,#e2e8f0)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div className="db-topbar-inner">
          {/* logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <img src={M4CLogo} alt="Mentor4Career" style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
              Mentor<b style={{ color: 'var(--indigo,#4F46E5)' }}>4</b>Career
            </span>
          </Link>

          {/* divider + page title — hidden on mobile */}
          <div className="db-topbar-divider" />
          <span className="db-topbar-title">
            {PAGE_TITLE[pathname] || 'Dashboard'}
          </span>

          {/* spacer */}
          <div style={{ flex: 1 }} />

          {/* right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* <ThemeSwitcher /> */}


            {/* user dropdown */}
            {user ? (
              <UserDropdown user={user} signOut={signOut} dashboardPath={dashboardPath} />
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => openAuth('login')}>Login</button>
            )}
          </div>
        </div>
      </header>
    );
  }

  /* ── Public navbar ── */
  return (
    <>
      <header className={'nav' + (scrolled ? ' scrolled' : '')} id="nav">
        <div className="wrap nav-inner">
          <Link to="/" className="brand">
            <img src={M4CLogo} alt="Mentor4Career" style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }} />
            <span>Mentor<b>4</b>Career</span>
          </Link>

          <nav className="nav-links">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                style={({ isActive }) => (isActive ? { color: 'var(--indigo)', background: 'var(--bg-tint)' } : undefined)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right">
            {/* <ThemeSwitcher /> */}
            {user ? (
              <>
                <Link to={dashboardPath} className="nav-user-info">
                  <span className="nav-avatar" aria-hidden="true">
                    {user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : user.role?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="nav-user-name">{user.name || user.role}</span>
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={signOut}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm login-text" onClick={() => openAuth('login')}>Login</button>
                <button className="btn btn-primary btn-sm" onClick={() => openAuth('signup')}>Register</button>
              </>
            )}
            <button className="burger" aria-label="Menu" onClick={() => setMenuOpen(true)}><Burger width="24" height="24" /></button>
          </div>
        </div>
      </header>

      <div className={'scrim' + (menuOpen ? ' open' : '')} onClick={closeMenu} />
      <aside className={'mobile-menu' + (menuOpen ? ' open' : '')}>
        <div className="mm-head">
          <span className="brand"><img src={M4CLogo} alt="Mentor4Career" style={{ width: 48, height: 48, objectFit: 'contain', display: 'block' }} /> Mentor<b>4</b>Career</span>
          <button className="mm-close" onClick={closeMenu}><Close width="20" height="20" /></button>
        </div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={closeMenu}>{l.label}</NavLink>
        ))}
        <div className="mm-cta">
          {user ? (
            <>
              <Link to={dashboardPath} className="btn btn-ghost btn-block" onClick={closeMenu}>My Dashboard</Link>
              <button className="btn btn-primary btn-block" onClick={() => { closeMenu(); signOut(); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost btn-block" onClick={() => { closeMenu(); openAuth('login'); }}>Login</button>
              <button className="btn btn-primary btn-block" onClick={() => { closeMenu(); openAuth('signup'); }}>Register</button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
