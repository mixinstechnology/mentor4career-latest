import React, { useEffect, useState } from 'react';

const THEME_KEY = 'm4c_theme';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'default'; } catch { return 'default'; }
  });

  useEffect(() => {
    if (theme === 'violet') document.documentElement.setAttribute('data-theme', 'violet');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  return (
    <button
      className="theme-btn"
      aria-label="Switch colour theme"
      title="Switch colour theme"
      onClick={() => setTheme((t) => (t === 'violet' ? 'default' : 'violet'))}
    >
      <span className="tb-swatch" />
    </button>
  );
}
