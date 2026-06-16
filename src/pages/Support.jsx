import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { Doc, Person, Mail, Webinar } from '../components/Icons.jsx';

const TOPICS = [
  { Icon: Doc, title: 'Bookings & sessions', text: 'Reschedule, cancel or get the video link for an upcoming session.' },
  { Icon: Mail, title: 'Payments & refunds', text: 'Questions about a charge, invoice or refund on your account.' },
  { Icon: Person, title: 'Account & profile', text: 'Login issues, profile changes and verification help.' },
  { Icon: Webinar, title: 'For mentors', text: 'Payouts, availability, ratings and growing your mentor profile.' }
];

export default function Support() {
  return (
    <main id="top">
      <PageHero
        crumb="Help & Support"
        eyebrow="Support Centre"
        title={<>How can we <span className="grad-text">help you today?</span></>}
        sub="Browse common topics, check the FAQs, or reach our team directly — we usually reply within a business day."
      />
      <section className="section-pad" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="overview-grid">
            {TOPICS.map((t, i) => (
              <div className="card card-hover reveal" key={i} style={{ padding: 24 }}>
                <span className="icon-badge"><t.Icon width="24" height="24" /></span>
                <h3 style={{ marginTop: 14 }}>{t.title}</h3>
                <p style={{ color: 'var(--ink-2)' }}>{t.text}</p>
              </div>
            ))}
          </div>
          <div className="cta-box reveal" style={{ marginTop: 40 }}>
            <h2>Still need a hand?</h2>
            <p>Check our frequently asked questions or send the team a message directly.</p>
            <div className="cta-btns">
              <Link to="/faq" className="btn btn-white btn-lg">Read the FAQs</Link>
              <Link to="/contact" className="btn btn-clear btn-lg">Contact support</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
