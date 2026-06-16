import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Cap, Doc, Check } from './Icons.jsx';

// Inline icons specific to the journey (compass + trophy live only here).
const CompassIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);
const ChatIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" {...p}>
    <path d="M4 5h16v11H8l-4 4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const TrophyIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" {...p}>
    <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M18 5h2.5a2 2 0 01-2 4M6 5H3.5a2 2 0 002 4" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const STOPS = [
  { Icon: CompassIcon, h: 'Explore & plan', p: 'Discover the streams and careers that actually fit you.', entry: 'student' },
  { Icon: Cap, h: 'Predict college', p: 'AI finds your best-fit colleges from your real scores.' },
  { Icon: ChatIcon, h: 'Talk to a mentor', p: '1:1 guidance from seniors, alumni and professionals.', entry: 'job' },
  { Icon: Doc, h: 'Prep & practice', p: "Mock and AI interviews until you're truly ready." },
  { Icon: TrophyIcon, h: 'Get hired', p: "Land the internship or offer you've worked toward — goal achieved." }
];

export default function JourneyRail() {
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setAnimate(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setAnimate(true); io.disconnect(); } }),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="journey-rail reveal">
      <div className="jline">
        <span className={'jline-fill' + (animate ? ' jfill-anim' : '')} />
        <span className="jline-glow" />
      </div>
      <span className="jtoken jtoken-student">Student <ArrowRight width="24" height="24" /></span>
      <span className="jtoken jtoken-job">Jobseeker <ArrowRight width="24" height="24" /></span>
      <div className="jstops" ref={ref}>
        {STOPS.map((s, i) => {
          const final = i === STOPS.length - 1;
          return (
            <div
              key={i}
              className={'jstop' + (final ? ' is-final' : '') + (animate ? ' jstop-in' : '')}
              style={animate ? { animationDelay: i * 95 + 'ms' } : undefined}
            >
              {s.entry && (
                <span className={'jentry jentry-' + s.entry}>
                  {s.entry === 'student' ? 'Students start' : 'Jobseekers start'}
                </span>
              )}
              <span className="ji">
                <span className="jnum">{final ? <Check width="12" height="12" /> : i + 1}</span>
                <s.Icon width="24" height="24" />
              </span>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
