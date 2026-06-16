import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {MENTORS}  from '../data/mentors.js';
import MentorCard from '../components/MentorCard.jsx';
import JourneyRail from '../components/JourneyRail.jsx';
import httpService from '../utils/apiService.tsx'
import { Logo, ArrowRight, Search, Cap, Person, Doc, Brief, Webinar, Check } from '../components/Icons.jsx';

const EXAMS = ['JEE', 'NEET', 'MHT-CET', 'CAT / MBA', 'CUET'];
// const FEATURED = ['Priya Nair', 'Siddharth Iyer', 'Aarav Sharma', 'Rohit Deshmukh'];

export default function Home() {
  const { openAuth } = useAuth();
  const [exam, setExam] = useState('JEE');
 const mentor = MENTORS();

// console.log(mentor)
  // const featured = FEATURED.map((n) => mentor?.find((m) => m.name === n)).filter(Boolean);
const featured = mentor?.slice(0, 6) || []
  // console.log(featured)
  return (
    <>
      <div className="announce">
        <div className="wrap">
          <span className="a-pill">NEW</span>
          <span className="a-extra">AI College Predictor 2026 is live —</span>
          <b>predict your best college free.</b>
          <Link to="/predictor">Try now <ArrowRight width="24" height="24" /></Link>
        </div>
      </div>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy reveal">
              <span className="eyebrow"><span className="dot" /> AI Career Guidance for Students &amp; Freshers</span>
              <h1 style={{ marginTop: 20 }}>Find the right college, mentor &amp; <span className="grad-text">your dream career</span></h1>
              <p className="sub">AI college predictions, verified mentors, interview prep, internships and jobs — everything you need to plan your future with confidence, in one platform.</p>

              <div className="hero-search">
                <div className="hs-field">
                  <Search width="24" height="24" />
                  <input type="text" placeholder="Search colleges, exams, careers or mentors…" />
                </div>
                <button className="btn btn-primary">Search</button>
              </div>
              <div className="exam-chips">
                <span className="lbl">Popular:</span>
                {EXAMS.map((e) => (
                  <button key={e} className={'chip' + (exam === e ? ' active' : '')} onClick={() => setExam(e)}>{e}</button>
                ))}
              </div>

              <div className="hero-trust">
                <div className="avatars">
                  <span style={{ background: 'linear-gradient(135deg,#4F46E5,#3B82F6)' }}>A</span>
                  <span style={{ background: 'linear-gradient(135deg,#7C5CF7,#EC4899)' }}>R</span>
                  <span style={{ background: 'linear-gradient(135deg,#0FA968,#06B6D4)' }}>S</span>
                  <span style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>M</span>
                  <span style={{ background: 'linear-gradient(135deg,#06B6D4,#3B82F6)' }}>K</span>
                </div>
                <div>
                  <div className="stars">★★★★★ <b style={{ color: 'var(--ink)', fontSize: 14 }}>4.9/5</b></div>
                  <small>Trusted by 1,20,000+ students across India</small>
                </div>
              </div>
            </div>

            {/* hero visual */}
            <div className="hero-visual reveal">
              <span className="hero-blob" />
              <div className="float-card fc1">
                <span className="fc-ico" style={{ background: 'linear-gradient(135deg,#0FA968,#06B6D4)' }}><Check width="20" height="20" /></span>
                <div><div className="fc-t">Profile Verified</div><div className="fc-s">12,000+ mentors</div></div>
              </div>
              <div className="float-card fc2">
                <span className="fc-ring"><i>92%</i></span>
                <div><div className="fc-t">College Match</div><div className="fc-s">COEP Pune · CSE</div></div>
              </div>
              <div className="float-card fc3">
                <span className="fc-ico" style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>
                  <svg viewBox="0 0 24 24" width="20" fill="none"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8L12 3z" fill="currentColor" /></svg>
                </span>
                <div><div className="fc-t">Got my dream seat!</div><div className="fc-s">Rohan · JEE 96.4%ile</div></div>
              </div>
              <div className="hero-photo">
                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#EEF0FF,#E9F1FF)', color: 'var(--ink-3)', fontWeight: 600, fontSize: 14 }}>Student photo</div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGO STRIP */}
        <section className="logos">
          <div className="wrap">
            <div className="lead">Students mentored by &amp; placed at top colleges and companies</div>
            <div className="marquee">
              <div className="marquee-track">
                {['IIT Bombay', 'NIT Trichy', 'AIIMS Delhi', 'IIM Ahmedabad', 'TCS', 'Infosys', 'Wipro'].concat(['IIT Bombay', 'NIT Trichy', 'AIIMS Delhi', 'IIM Ahmedabad', 'TCS', 'Infosys', 'Wipro']).map((name, i) => (
                  <span className="logo-chip" key={i}>
                    <span className="mark" style={{ background: 'linear-gradient(135deg,#4F46E5,#3B82F6)' }}>{name.slice(0, 3).toUpperCase()}</span> {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CAREER JOURNEY */}
        <section className="journey section-pad" id="journey">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow"><span className="dot" /> For Students &amp; Jobseekers</span>
              <h2 className="section-title">From first-year confusion to your <span className="grad-text">first offer</span></h2>
              <p className="section-sub">One guided flow for everyone. Students start at the very beginning; jobseekers jump straight to a mentor — and both arrive at the same place: hired.</p>
              <div className="jlegend">
                <span className="jlg jlg-student"><i /> Student — starts at the beginning</span>
                <span className="jlg jlg-job"><i /> Jobseeker — straight to a mentor</span>
              </div>
            </div>
            <JourneyRail />
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="section-pad" id="overview">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow"><span className="dot" /> One Platform, Every Step</span>
              <h2 className="section-title">Everything you need for <span className="grad-text">career success</span></h2>
              <p className="section-sub">From your first college decision to your dream job offer. Tap any card to explore.</p>
            </div>
            <div className="overview-grid">
              <Link to="/predictor" className="card card-hover overview-card reveal"><span className="icon-badge"><Cap width="24" height="24" /></span><h3>AI College Predictor</h3><p>Predict your best-fit colleges from NEET, JEE, CET or MBA scores in seconds.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <Link to="/mentors" className="card card-hover overview-card reveal"><span className="icon-badge emerald"><Person width="24" height="24" /></span><h3>Verified Mentors</h3><p>Talk 1-on-1 with college seniors, alumni and working professionals.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <Link to="/interview" className="card card-hover overview-card reveal"><span className="icon-badge amber"><Doc width="24" height="24" /></span><h3>Interview Preparation</h3><p>Mock interviews, AI practice and expert feedback that gets you hired.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <Link to="/jobs" className="card card-hover overview-card reveal"><span className="icon-badge blue"><Brief width="24" height="24" /></span><h3>Internships &amp; Jobs</h3><p>Find internships and fresher jobs, apply and track every application.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
              <a href="#" className="card card-hover overview-card reveal"><span className="icon-badge pink"><svg viewBox="0 0 24 24" fill="none" width="24"><path d="M3 17l5-5 4 3 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 4h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span><h3>Career Roadmaps</h3><p>See skills, salaries and growth for every path before you choose.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></a>
              <Link to="/webinars" className="card card-hover overview-card reveal"><span className="icon-badge"><Webinar width="24" height="24" /></span><h3>Live Webinars</h3><p>Free &amp; premium sessions with industry experts, toppers and recruiters.</p><span className="go">Explore <ArrowRight width="24" height="24" /></span></Link>
            </div>
          </div>
        </section>

        {/* FEATURED MENTORS */}
        <section className="section-pad" id="featured-mentors">
          <div className="wrap">
            <div className="sh-row reveal">
              <div className="sh-left">
                <span className="eyebrow"><span className="dot" /> Meet Your Mentors</span>
                <h2 className="section-title">Learn from people who've <span className="grad-text">been there</span></h2>
              </div>
              <Link to="/mentors" className="view-all">View all mentors <ArrowRight width="24" height="24" /></Link>
            </div>
            <div className="mentor-grid">
              {featured.map((m, i) => <MentorCard key={m.name} mentor={m} colorIndex={i} />)}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section-pad" id="stories">
          <div className="wrap">
            <div className="section-head center reveal">
              <span className="eyebrow"><span className="dot" /> Student Success Stories</span>
              <h2 className="section-title">Real students. <span className="grad-text">Real results.</span></h2>
            </div>
            <div className="testi-grid">
              {[
                { stars: '★★★★★', badge: 'Admitted', text: 'The AI predictor showed me exactly which colleges I had a real shot at. I found the right engineering college and avoided a wrong admission decision.', av: 'RD', col: 'linear-gradient(135deg,#4F46E5,#3B82F6)', n: 'Rohan Deshmukh', r: 'B.Tech CSE · COEP Pune' },
                { stars: '★★★★★', badge: 'Hired', text: 'Mock interviews here helped me crack my first software developer job. The feedback after each round was honest and exactly what I needed to improve.', av: 'AT', col: 'linear-gradient(135deg,#0FA968,#06B6D4)', n: 'Aditi Talreja', r: 'SDE-1 · Razorpay' },
                { stars: '★★★★★', badge: 'Admitted', text: 'My mentor gave me complete clarity about MBA admissions and career growth. I joined my dream B-school this year with full confidence.', av: 'FM', col: 'linear-gradient(135deg,#7C5CF7,#EC4899)', n: 'Faizan Mirza', r: 'MBA · IIM Indore' }
              ].map((t, i) => (
                <div className="card testi-card reveal" key={i}>
                  <div className="testi-top"><div className="stars">{t.stars}</div><span className="badge-hired"><Check width="24" height="24" /> {t.badge}</span></div>
                  <p>{t.text}</p>
                  <div className="testi-author"><span className="ta-av" style={{ background: t.col }}>{t.av}</span><div><div className="ta-n">{t.n}</div><div className="ta-r">{t.r}</div></div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="cta-box reveal">
              <h2>Stop guessing. Start building your career.</h2>
              <p>Join 1,20,000+ students getting personalised guidance from verified mentors — and make your next decision with confidence.</p>
              <div className="cta-btns">
                <button className="btn btn-white btn-lg" onClick={() => openAuth('signup')}>Register Free</button>
                <Link to="/mentors" className="btn btn-clear btn-lg">Find a Mentor</Link>
                <Link to="/predictor" className="btn btn-clear btn-lg">Predict My College</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
