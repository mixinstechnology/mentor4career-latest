import React from 'react';
import { Link } from 'react-router-dom';

export default function Interview() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>

        {/* icon */}
        <div style={{ width: 96, height: 96, borderRadius: 28, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 16px 48px rgba(79,70,229,.3)' }}>
          <svg viewBox="0 0 24 24" fill="none" width="46" height="46">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="#fff" strokeWidth="1.6"/>
            <path d="M12 7v5l3 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EEF2FF', color: '#4F46E5', fontSize: 12.5, fontWeight: 700, padding: '5px 14px', borderRadius: 99, marginBottom: 22, textTransform: 'uppercase', letterSpacing: '.07em' }}>
          <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
          Coming Soon
        </span>

        {/* heading */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 18 }}>
          Interview{' '}
          <span style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Preparation
          </span>
        </h1>

        {/* sub */}
        <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 36 }}>
          We're building something great for you — AI mock interviews, 1-on-1 recruiter sessions and expert feedback to help you crack your dream job. Stay tuned!
        </p>

        {/* feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
          {['AI Mock Interviews', '1:1 with Recruiters', 'Resume Review', 'Instant Feedback'].map(f => (
            <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: '1.5px solid var(--border)', borderRadius: 99, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
              <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M5 13l4 4L19 7" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link to="/mentors" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-3 2.8-5.2 6-5.2S15 17 15 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 5.5a3 3 0 010 5.6M18 20c0-2.4-1-4.2-2.6-5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Find a Mentor Instead
        </Link>
      </div>
    </main>
  );
}
