import React, { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import { Mail, Person, Check } from '../components/Icons.jsx';

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <main id="top">
      <PageHero
        crumb="Contact Us"
        eyebrow="We're Here To Help"
        title={<>Talk to the <span className="grad-text">Mentor4Career team</span></>}
        sub="Questions about mentorship, payments or partnerships? Send us a message and we'll get back within one business day."
      />
      <section className="section-pad" style={{ paddingTop: 24 }}>
        <div className="wrap match-grid">
          <div className="card" style={{ padding: 28 }}>
            {sent ? (
              <div className="bk-success">
                <div className="bk-check"><Check width="38" height="38" /></div>
                <h3>Message sent!</h3>
                <p className="bk-ssub">Thanks for reaching out — our team will reply to your email shortly.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <h3 style={{ marginBottom: 18 }}>Send us a message</h3>
                <div className="input-wrap" style={{ marginBottom: 12 }}><Person width="24" height="24" /><input type="text" placeholder="Full name" required /></div>
                <div className="input-wrap" style={{ marginBottom: 12 }}><Mail width="24" height="24" /><input type="email" placeholder="Email address" required /></div>
                <textarea className="bk-inp" rows="5" placeholder="How can we help?" required style={{ resize: 'vertical', marginBottom: 14 }} />
                <button type="submit" className="btn btn-primary btn-lg btn-block">Send message</button>
              </form>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { t: 'Email', v: 'hello@mentor4career.in' },
              { t: 'Support hours', v: 'Mon–Sat · 9 AM to 8 PM IST' },
              { t: 'For mentors', v: 'mentors@mentor4career.in' },
              { t: 'Partnerships', v: 'partners@mentor4career.in' }
            ].map((c) => (
              <div className="card" key={c.t} style={{ padding: 20 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{c.t}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>{c.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
