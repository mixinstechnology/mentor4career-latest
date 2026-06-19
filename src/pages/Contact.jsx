import React, { useState } from 'react';
import PageHero from '../components/PageHero.jsx';
import { Mail, Person, Check } from '../components/Icons.jsx';
import httpService from '../utils/apiService.tsx';
import { toast } from 'react-toastify';

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .82h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', contact: '', message: '', page: 'contact' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await httpService.post('/contactus', {
        data: {
          name:    form.name,
          email:   form.email,
          contact: form.contact,
          message: form.message,
          page:    form.page,
        },
        token: false,
      });
      setSent(true);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

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
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: 18 }}>Send us a message</h3>

                <div className="input-wrap" style={{ marginBottom: 12 }}>
                  <Person width="24" height="24" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={set('name')}
                    required
                  />
                </div>

                <div className="input-wrap" style={{ marginBottom: 12 }}>
                  <Mail width="24" height="24" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={set('email')}
                    required
                  />
                </div>

                <div className="input-wrap" style={{ marginBottom: 12 }}>
                  <PhoneIcon />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={form.contact}
                    onChange={set('contact')}
                    required
                  />
                </div>
                {/* <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Title of your message</div> */}
              
                 <div className="input-wrap" style={{ marginBottom: 12 }}>
                <select
                  value={form.page}
                  onChange={set('page')}
                  className="bk-inp"
                  required
                >
                  <option value="contact">General Inquiry</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="job">Job</option>
                  <option value="interview">Interview</option>
                </select>
              </div>
                <textarea
                  className="bk-inp"
                  rows="5"
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={set('message')}
                  required
                  style={{ resize: 'vertical', marginBottom: 14 }}
                />

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={sending}
                >
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { t: 'Email',          v: 'connect@mixins.in'    },
              { t: 'Support hours',  v: 'Mon–Fri · 11 AM to 8 PM IST' },
              { t: 'For mentors',    v: 'mentors@mentor4career.in'   },
              { t: 'Partnerships',   v: 'partners@mentor4career.in'  },
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
