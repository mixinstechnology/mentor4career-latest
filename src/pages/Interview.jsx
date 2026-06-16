import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Doc, Person, Check, Brief } from '../components/Icons.jsx';

const FEATURES = [
  { Icon: Doc, badge: '', title: 'AI Mock Interviews', text: 'Practice role-specific questions with an AI interviewer and get instant, structured feedback on every answer.' },
  { Icon: Person, badge: 'emerald', title: '1:1 with Real Recruiters', text: 'Book hire-grade mock rounds with SDEs and recruiters who tell you exactly where you stand.' },
  { Icon: Brief, badge: 'amber', title: 'Resume & Profile Review', text: 'Get your resume and LinkedIn torn down and rebuilt to pass screening at top companies.' }
];

export default function Interview() {
  const { openAuth } = useAuth();
  return (
    <main id="top">
      <PageHero
        crumb="Interview Prep"
        eyebrow="Get Hire-Ready"
        title={<>Walk into every interview <span className="grad-text">already prepared</span></>}
        sub="Mock interviews, AI practice and expert feedback that turns nervous candidates into confident hires."
      />
      <section className="section-pad" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="overview-grid">
            {FEATURES.map((f, i) => (
              <div className="card reveal" key={i} style={{ padding: 26 }}>
                <span className={'icon-badge ' + f.badge}><f.Icon width="24" height="24" /></span>
                <h3 style={{ marginTop: 14 }}>{f.title}</h3>
                <p style={{ color: 'var(--ink-2)' }}>{f.text}</p>
              </div>
            ))}
          </div>
          <div className="cta-box reveal" style={{ marginTop: 40 }}>
            <h2>Book your first mock interview</h2>
            <p>Join thousands of students who cracked their dream offer with structured practice and honest feedback.</p>
            <div className="cta-btns">
              <button className="btn btn-white btn-lg" onClick={() => openAuth('signup')}>Start practicing free</button>
              <Link to="/mentors" className="btn btn-clear btn-lg">Find an interview coach</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
