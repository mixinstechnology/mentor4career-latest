import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MENTORS } from '../data/mentors.js';
import MentorCard from '../components/MentorCard.jsx';
import { Chevron, Check, Search, Cap, Person, Brief, Doc } from '../components/Icons.jsx';

const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'senior', label: 'College Senior' },
  { id: 'alumni', label: 'Alumni' },
  { id: 'pro', label: 'Professional' }
];
const RATINGS = [
  { v: 0, label: 'Any' },
  { v: 4, label: '4.0+' },
  { v: 4.5, label: '4.5+' },
  { v: 4.8, label: '4.8+' }
];

export default function Mentors() {
  const [type, setType] = useState('all');
  const [stream, setStream] = useState('all');
  const [org, setOrg] = useState('all');
  const [focus, setFocus] = useState('all');
  const [price, setPrice] = useState(2000);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState('rating');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersHidden, setFiltersHidden] = useState(false);

  const reset = () => {
    setType('all'); setStream('all'); setOrg('all'); setFocus('all');
    setPrice(2000); setRating(0); setSort('rating');
  };
const mentordata =MENTORS()
  const list = useMemo(() => {
    const out = mentordata.filter((m) => {
      if (type !== 'all' && m.type !== type) return false;
      if (stream !== 'all' && m.stream !== stream) return false;
      if (org !== 'all' && m.org !== org) return false;
      if (focus !== 'all' && m.focus.indexOf(focus) === -1) return false;
      if (m.price > price) return false;
      if (m.rating < rating) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === 'sessions') return b.sessions - a.sessions;
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      return b.rating - a.rating || b.reviews - a.reviews;
    });
    return out;
  }, [type, stream, org, focus, price, rating, sort,mentordata]);

  const priceLabel = price === 0 ? 'Free' : price >= 2000 ? '₹2000' : '₹' + price;

  return (
    <main id="top">
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="wrap">
          <div className="crumb"><Link to="/">Home</Link><Chevron width="24" height="24" /><span>Mentorship</span></div>
          <span className="eyebrow"><span className="dot" /> Verified 1:1 Mentors</span>
          <h1 style={{ marginTop: 16 }}>Book a real conversation with someone who's <span className="grad-text">been there</span></h1>
          <p className="ph-sub">Talk to college seniors, alumni and working professionals — about admissions, campus life, placements, career growth or interview prep. You pick the person and the price.</p>
          {/* <div className="ph-stats">
            <div className="s"><div className="v">12,000+</div><div className="l">Verified Mentors</div></div>
            <div className="s"><div className="v">85,000+</div><div className="l">Sessions Booked</div></div>
            <div className="s"><div className="v">4.9/5</div><div className="l">Average Rating</div></div>
          </div> */}
        </div>
      </section>

      {/* TOOL */}
      <section className="section-pad" style={{ paddingTop: 18 }}>
        <div className={'wrap tool-layout' + (filtersHidden ? ' filters-hidden' : '')}>
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className={'card filters' + (filtersOpen ? ' open' : '')}>
              <div className="f-title">Filter Mentors <button onClick={reset}>Reset</button></div>

              <div className="fgroup">
                <label>Mentor Type</label>
                <div className="chip-wrap">
                  {TYPES.map((t) => (
                    <button key={t.id} className={'chip' + (type === t.id ? ' active' : '')} onClick={() => setType(t.id)}>{t.label}</button>
                  ))}
                </div>
              </div>

              <div className="fgroup">
                <label>Stream / Field</label>
                <select className="fsel" value={stream} onChange={(e) => setStream(e.target.value)}>
                  <option value="all">All Streams</option>
                  <option value="cse">Computer Science / IT</option>
                  <option value="ece">Electronics / E&amp;TC</option>
                  <option value="mech">Mechanical / Civil</option>
                  <option value="med">Medical (MBBS/BDS)</option>
                  <option value="mba">MBA / Management</option>
                  <option value="mca">MCA / BCA</option>
                </select>
              </div>

              <div className="fgroup">
                <label>University / College</label>
                <select className="fsel" value={org} onChange={(e) => setOrg(e.target.value)}>
                  <option value="all">Any College / Company</option>
                  <option value="IIT Bombay">IIT Bombay</option>
                  <option value="COEP Pune">COEP Pune</option>
                  <option value="VJTI Mumbai">VJTI Mumbai</option>
                  <option value="AIIMS Delhi">AIIMS Delhi</option>
                  <option value="IIM Indore">IIM Indore</option>
                  <option value="VIT Vellore">VIT Vellore</option>
                </select>
              </div>

              <div className="fgroup">
                <label>I Need Help With</label>
                <select className="fsel" value={focus} onChange={(e) => setFocus(e.target.value)}>
                  <option value="all">Anything</option>
                  <option value="admissions">Admissions &amp; Counselling</option>
                  <option value="campus">Campus &amp; Hostel Life</option>
                  <option value="placement">Placements &amp; Prep</option>
                  <option value="career">Career Growth</option>
                  <option value="interview">Interview Prep</option>
                </select>
              </div>

              <div className="fgroup">
                <div className="range-row"><label style={{ margin: 0 }}>Max Price / Session</label><b>{priceLabel}</b></div>
                <input type="range" min="0" max="2000" step="50" value={price} onChange={(e) => setPrice(parseInt(e.target.value))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 8 }}>
                  <span>Free</span><span>₹2000</span>
                </div>
              </div>

              <div className="fgroup">
                <label>Minimum Rating</label>
                <div className="chip-wrap">
                  {RATINGS.map((r) => (
                    <button key={r.v} className={'chip' + (rating === r.v ? ' active' : '')} onClick={() => setRating(r.v)}>{r.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RESULTS */}
          <div>
            <div className="results-bar">
              <button className="btn btn-ghost btn-sm filter-toggle" onClick={() => setFiltersOpen((v) => !v)}>
                <svg viewBox="0 0 24 24" width="18" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> Filters
              </button>
              <button className="btn btn-ghost btn-sm collapse-filters" onClick={() => setFiltersHidden((v) => !v)}>
                <svg viewBox="0 0 24 24" width="18" fill="none"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M9 4v16" stroke="currentColor" strokeWidth="1.8" /></svg>
                <span className="cf-off">Hide filters</span><span className="cf-on">Show filters</span>
              </button>
              <div className="rb-count"><b>{list.length}</b> mentors available</div>
              <div className="rb-right">
                <span className="lbl">Sort</span>
                <select className="mini-sel" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="rating">Top Rated</option>
                  <option value="sessions">Most Booked</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="mentor-grid">
              {list.length === 0 ? (
                <div className="card empty-state" style={{ gridColumn: '1/-1' }}>
                  <Search width="24" height="24" />
                  <h3>No mentors match these filters</h3>
                  <p>Try a different stream, college or raise your price range.</p>
                </div>
              ) : (
                list.map((m, i) => <MentorCard key={m.name} mentor={m} colorIndex={i} />)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MENTOR TYPES */}
      <section className="section-pad" style={{ background: '#fff', borderBlock: '1px solid var(--border)', paddingTop: 'clamp(48px,6vw,84px)' }}>
        <div className="wrap">
          <div className="section-head center reveal">
            <span className="eyebrow"><span className="dot" /> Three Kinds Of Guidance</span>
            <h2 className="section-title">Find the <span className="grad-text">right mentor</span> for your moment</h2>
          </div>
          <div className="mtype-grid">
            <div className="card mtype reveal"><span className="icon-badge"><Cap width="24" height="24" /></span><h3>College Seniors</h3><p>Currently studying. Ask about real campus life, faculty, hostel, fests and which branch actually fits you.</p></div>
            <div className="card mtype reveal"><span className="icon-badge emerald"><Person width="24" height="24" /></span><h3>Alumni</h3><p>Graduated and placed. Understand placements, the journey after college and whether a college is worth it.</p></div>
            <div className="card mtype reveal"><span className="icon-badge amber"><Brief width="24" height="24" /></span><h3>Working Professionals</h3><p>In the industry now. Get clarity on career growth, switching domains, the corporate world and future scope.</p></div>
            <div className="card mtype reveal"><span className="icon-badge pink"><Doc width="24" height="24" /></span><h3>Interview Coaches</h3><p>Recruiters &amp; SDEs who run mock interviews, review your resume and give honest, hire-grade feedback.</p></div>
          </div>
        </div>
      </section>

      {/* BECOME A MENTOR */}
      <section className="section-pad">
        <div className="wrap">
          <div className="become reveal">
            <div>
              <span className="eyebrow" style={{ background: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.16)', color: '#fff' }}><span className="dot" /> For Mentors</span>
              <h2 style={{ marginTop: 18 }}>Share what you know. Get paid for it.</h2>
              <p>Whether you're a college senior, alumnus or working professional — register, set your own per-session price, and start guiding students who need exactly your experience.</p>
              <div className="b-list">
                <span><Check width="24" height="24" /> Set your own rate</span>
                <span><Check width="24" height="24" /> Pick your slots</span>
                <span><Check width="24" height="24" /> Build your rating</span>
                <span><Check width="24" height="24" /> Weekly payouts</span>
              </div>
            </div>
            <div className="b-actions">
              <div className="earn"><div className="e-v">₹18,400</div><div className="e-l">Avg. monthly earning of an active mentor</div></div>
              <a href="#" className="btn btn-white btn-lg btn-block">Become a Mentor</a>
              <a href="#" className="btn btn-clear btn-lg btn-block" style={{ borderColor: 'rgba(255,255,255,.3)', color: '#fff', background: 'rgba(255,255,255,.08)' }}>How it works</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
