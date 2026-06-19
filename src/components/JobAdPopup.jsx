import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TECH = [
  { label: 'React.js',   color: '#61DAFB', text: '#0a2540' },
  { label: 'Next.js',    color: '#000',    text: '#fff'    },
  { label: 'Node.js',    color: '#339933', text: '#fff'    },
  { label: 'MongoDB',    color: '#47A248', text: '#fff'    },
  { label: 'Express',    color: '#4F46E5', text: '#fff'    },
  { label: 'MySQL',      color: '#4479A1', text: '#fff'    },
  { label: 'REST APIs',  color: '#7C3AED', text: '#fff'    },
  { label: 'Git',        color: '#F05032', text: '#fff'    },
  { label: 'Docker',     color: '#2496ED', text: '#fff'    },
  { label: 'JavaScript', color: '#F7DF1E', text: '#1a1a1a' },
];

const FEATURES = [
  { icon: '💻', text: 'Real project development' },
  { icon: '📚', text: 'Theory + concept learning' },
  { icon: '🏆', text: 'Portfolio-ready projects'  },
  { icon: '🤝', text: 'Placement assistance'      },
];

const STYLES = `
@keyframes jad-in {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
@keyframes jad-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(252,211,77,0.5); }
  50%      { box-shadow: 0 0 0 8px rgba(252,211,77,0);  }
}
.jad-card  { animation: jad-in .32s cubic-bezier(.22,.68,0,1.2) both; }
.jad-badge { animation: jad-pulse 2s ease infinite; }
.jad-pill:hover { transform: translateY(-2px) scale(1.06); filter: brightness(1.1); }
.jad-feat:hover { background: #f0f4ff !important; transform: translateX(3px); }
.jad-cta:hover  { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,0.5) !important; }
`;

export default function JobAdPopup({ onClose }) {
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <>
      <style>{STYLES}</style>
      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(8,12,36,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
      >
        {/* ── Card ── */}
        <div
          className="jad-card"
          style={{
            display: 'flex', width: '100%', maxWidth: 640,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
          }}
        >
          {/* ── LEFT PANEL ── */}
          <div style={{
            width: 210, flexShrink: 0,
            background: 'linear-gradient(165deg,#1e1b4b 0%,#3730a3 50%,#6d28d9 100%)',
            padding: '24px 20px', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
          }}>
            {/* blobs */}
            <div style={{ position:'absolute', top:-30, right:-30, width:110, height:110, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
            <div style={{ position:'absolute', bottom:-20, left:-20, width:90,  height:90,  borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

            <div>
              {/* pulse badge */}
              <span
                className="jad-badge"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#FCD34D', color: '#1e1b4b',
                  borderRadius: 99, padding: '3px 11px',
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '0.07em',
                  marginBottom: 14,
                }}
              >
                🎯 SPECIAL OFFER
              </span>

              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 22, color: '#fff', margin: '0 0 8px',
                lineHeight: 1.2, letterSpacing: '-0.4px',
              }}>
                Looking for<br />a <span style={{ color: '#FCD34D' }}>JOB?</span>
              </h2>

              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                Enroll in our <strong style={{ color: '#FCD34D' }}>Master Course</strong> — hands-on projects + theory concepts.
              </p>
            </div>

            {/* stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
              {[
                { v: '100+', l: 'Students placed' },
                { v: '10+',  l: 'Tech skills'     },
                { v: '100%', l: 'Project-based'   },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 16,
                    color: '#FCD34D', lineHeight: 1,
                  }}>{s.v}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ flex: 1, background: '#fff', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                Full Stack Master Course
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: 8,
                  width: 28, height: 28, cursor: 'pointer', color: '#64748b',
                  display: 'grid', placeItems: 'center', fontSize: 15,
                  flexShrink: 0, transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >✕</button>
            </div>

            {/* features 2×2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="jad-feat"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: '#f8faff', borderRadius: 10, padding: '8px 10px',
                    transition: 'background .15s, transform .15s', cursor: 'default',
                  }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.35 }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* tech stack */}
            <div>
              <div style={{
                fontSize: 10.5, fontWeight: 800, color: '#4F46E5',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
              }}>
                Tech Stack — Full Stack
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {TECH.map(t => (
                  <span
                    key={t.label}
                    className="jad-pill"
                    style={{
                      padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: t.color, color: t.text,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                      transition: 'transform .15s, filter .15s', cursor: 'default',
                      display: 'inline-block',
                    }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/contact"
              onClick={onClose}
              className="jad-cta"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                color: '#fff', borderRadius: 11, padding: '11px 18px',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13.5,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                transition: 'transform .15s, box-shadow .15s',
              }}
            >
               Enquire Now — Contact Us
            </Link>

            
          </div>
        </div>
      </div>
    </>
  );
}
