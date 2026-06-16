import React, { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import { Chevron } from '../components/Icons.jsx';

const FAQS = [
  { q: 'How do I book a session with a mentor?', a: 'Open any mentor card and click “Book Now”. Pick an available date and time, choose a payment method, and confirm — you’ll get a calendar invite and video link by email.' },
  { q: 'Are intro calls really free?', a: 'Yes. Mentors marked “Free intro call” offer a short 20-minute session at no cost so you can decide if they’re the right fit before booking a paid session.' },
  { q: 'What happens if a mentor cancels?', a: 'You get a 100% refund automatically, and we’ll help you rebook with the same or a similar mentor at your convenience.' },
  { q: 'How are mentors verified?', a: 'Every mentor’s college, company and identity is checked before they appear on the platform. The green “Verified” badge confirms this.' },
  { q: 'Can I become a mentor?', a: 'Absolutely. Register as a mentor, set your own per-session price and availability, and start guiding students. Payouts are weekly.' },
  { q: 'Which payment methods are supported?', a: 'UPI, credit/debit cards (Visa, Mastercard, RuPay) and netbanking from all major Indian banks.' }
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <main id="top">
      <PageHero
        crumb="FAQs"
        eyebrow="Frequently Asked"
        title={<>Questions? <span className="grad-text">We've got answers</span></>}
        sub="Everything you need to know about booking, payments, mentors and refunds."
      />
      <section className="section-pad" style={{ paddingTop: 24 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => (
              <div className="card" key={i} style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, color: 'var(--ink)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {f.q}
                  <Chevron width="20" height="20" style={{ flex: 'none', transform: open === i ? 'rotate(90deg)' : 'none', transition: 'transform .2s', color: 'var(--ink-3)' }} />
                </button>
                {open === i && (
                  <div style={{ padding: '0 22px 20px', color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.6 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
