import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {MENTORS}  from '../data/mentors.js';
import MentorCard from '../components/MentorCard.jsx';
import JourneyRail from '../components/JourneyRail.jsx';
import { Logo, ArrowRight, Search, Cap, Person, Doc, Brief, Webinar, Check } from '../components/Icons.jsx';
import JobAdPopup from '../components/JobAdPopup.jsx';

const HOW_IT_WORKS_STEPS = [
  {
    num: '01',
    title: 'Create Your Profile',
    desc: 'Sign up and fill in your expertise, education, experience, and set your hourly availability. It only takes a few minutes.',
    color: 'var(--indigo)',
    bg: 'linear-gradient(135deg,#EEF0FF,#E9F1FF)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Get Discovered',
    desc: 'Students find you through search filters, AI matching, and personalised recommendations based on their goals and exam.',
    color: 'var(--emerald)',
    bg: 'linear-gradient(135deg,#E7F7EF,#D9F4E8)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Conduct Sessions',
    desc: 'Accept bookings and run 1-on-1 video or chat sessions on your own schedule. You stay in full control of your calendar.',
    color: 'var(--amber)',
    bg: 'linear-gradient(135deg,#FEF3DA,#FEF0C7)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Earn & Make Impact',
    desc: 'Get paid securely for every session, build your reputation with student reviews, and watch your mentees succeed.',
    color: 'var(--violet)',
    bg: 'linear-gradient(135deg,#F0EEFF,#EAE4FF)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8L12 2z"/>
      </svg>
    ),
  },
];

function HowItWorksModal({ onClose }) {
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
    <div className="hiw-modal-overlay" onClick={onClose}>
      <div className="hiw-modal-dialog" role="dialog" aria-modal="true" aria-label="How Mentorship Works" onClick={(e) => e.stopPropagation()}>
        <button className="hiw-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div className="hiw-header">
          <span className="eyebrow"><span className="dot" /> Step-by-step</span>
          <h2 className="hiw-title">How Mentorship Works</h2>
          <p className="hiw-sub">From sign-up to your first session — here's exactly what happens.</p>
        </div>
        <div className="hiw-steps">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div className="hiw-step" key={step.num}>
              <div className="hiw-step-icon" style={{ background: step.bg, color: step.color }}>
                {step.icon}
              </div>
              <div className="hiw-step-body">
                <span className="hiw-step-num" style={{ color: step.color }}>{step.num}</span>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="hiw-footer">
          <p>Ready to start mentoring?</p>
          <button className="btn btn-primary btn-lg" onClick={onClose}>Got it — let's go!</button>
        </div>
      </div>
    </div>
  );
}

const EXAMS = ['JEE', 'NEET', 'MHT-CET', 'CAT / MBA', 'CUET'];


// const FEATURED = ['Priya Nair', 'Siddharth Iyer', 'Aarav Sharma', 'Rohit Deshmukh'];

export default function Home() {
  const { openAuth } = useAuth();
  const [exam, setExam] = useState('JEE');
  const [showJobAd, setShowJobAd] = useState(false);
  const[showHowItWorks, setShowHowItWorks] = useState(false);
  const mentor = MENTORS();

  useEffect(() => {
    if (sessionStorage.getItem('jobAdSeen')) return;
    const t = setTimeout(() => {
      setShowJobAd(true);
      sessionStorage.setItem('jobAdSeen', '1');
    }, 1500);
    return () => clearTimeout(t);
  }, []);

// console.log(mentor)
  // const featured = FEATURED.map((n) => mentor?.find((m) => m.name === n)).filter(Boolean);
const featured = mentor?.slice(0, 6) || []
  // console.log(featured)
  return (
    <>
      {showJobAd && <JobAdPopup onClose={() => setShowJobAd(false)} />}

      {/* <div className="announce">
        <div className="wrap">
          <span className="a-pill">NEW</span>
          <span className="a-extra">AI College Predictor 2026 is live —</span>
          <b>predict your best college free.</b>
          <Link to="/predictor">Try now <ArrowRight width="24" height="24" /></Link>
        </div>
      </div> */}

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy reveal">
              {/* <span className="eyebrow"><span className="dot" /> AI Career Guidance for Students &amp; Freshers</span> */}
              <h1 style={{ marginTop: 0 }}>Find the right college, mentor &amp; <span className="grad-text">your dream career</span></h1>
              <p className="sub">AI college predictions, verified mentors, interview prep, internships and jobs — everything you need to plan your future with confidence, in one platform.</p>

              {/* <div className="hero-search">
                <div className="hs-field">
                  <Search width="24" height="24" />
                  <input type="text" placeholder="Search colleges, exams, careers or mentors…" />
                </div>
                <button className="btn btn-primary">Search</button>
              </div> */}
              {/* <div className="exam-chips">
                <span className="lbl">Popular:</span>
                {EXAMS.map((e) => (
                  <button key={e} className={'chip' + (exam === e ? ' active' : '')} onClick={() => setExam(e)}>{e}</button>
                ))}
              </div> */}

              <div className="hero-trust">
                <div className="avatars">
                  <span style={{ background: 'linear-gradient(135deg,#4F46E5,#3B82F6)' }}>A</span>
                  <span style={{ background: 'linear-gradient(135deg,#7C5CF7,#EC4899)' }}>R</span>
                  <span style={{ background: 'linear-gradient(135deg,#0FA968,#06B6D4)' }}>S</span>
                  <span style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)' }}>M</span>
                  <span style={{ background: 'linear-gradient(135deg,#06B6D4,#3B82F6)' }}>K</span>
                </div>
                <div>
                 <small>1-1 Mentorship Guidance</small>
                  {/* <div className="stars">★★★★★ <b style={{ color: 'var(--ink)', fontSize: 14 }}>4.9/5</b></div>
                  <small>Trusted by 1,20,000+ students across India</small> */}
                </div>
              </div>
            </div>

            {/* hero visual */}
            <div className="hero-visual reveal">
              <span className="hero-blob" />
              <div className="float-card fc1">
                <span className="fc-ico" style={{ background: 'linear-gradient(135deg,#0FA968,#06B6D4)' }}><Check width="20" height="20" /></span>
                <div><div className="fc-t">Profile Verified</div><div className="fc-s">100+ mentors</div></div>
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

        {/* DOMAIN STRIP */}
        <section className="logos">
          <div className="wrap">
            <div className="lead">Expert guidance across exams, careers &amp; college admissions — all in one place</div>
            <div className="marquee">
              <div className="marquee-track">
                {(((items) => [...items, ...items])([
                  { label: 'JEE Prep', grad: 'linear-gradient(135deg,#4F46E5,#3B82F6)' },
                  { label: 'NEET Prep', grad: 'linear-gradient(135deg,#0FA968,#06B6D4)' },
                  { label: 'CAT / MBA', grad: 'linear-gradient(135deg,#7C5CF7,#EC4899)' },
                  { label: 'MHT-CET', grad: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
                  { label: 'CUET', grad: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
                  { label: 'GATE', grad: 'linear-gradient(135deg,#EC4899,#F59E0B)' },
                  { label: 'Resume Building', grad: 'linear-gradient(135deg,#4F46E5,#0FA968)' },
                  { label: 'Interview Prep', grad: 'linear-gradient(135deg,#3B82F6,#7C5CF7)' },
                  { label: 'College Admissions', grad: 'linear-gradient(135deg,#0FA968,#4F46E5)' },
                  { label: 'Coding Interviews', grad: 'linear-gradient(135deg,#EF4444,#F59E0B)' },
                  { label: 'Career Guidance', grad: 'linear-gradient(135deg,#06B6D4,#EC4899)' },
                  { label: 'Scholarship Help', grad: 'linear-gradient(135deg,#7C5CF7,#3B82F6)' },
                ])).map((item, i) => (
                  <span className="logo-chip" key={i}>
                    <span className="mark" style={{ background: item.grad }}>{item.label.slice(0, 3).toUpperCase()}</span> {item.label}
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

        {/* BECOME A MENTOR */}
        <section className="section-pad mentor-cta-section" id="become-mentor">
          <div className="wrap">
            <div className="mentor-cta-grid reveal">
              <div className="mentor-cta-copy">
                <span className="eyebrow"><span className="dot" /> For Experts &amp; Alumni</span>
                <h2 className="section-title" style={{ marginTop: 16 }}>Share your knowledge.<br /><span className="grad-text">Earn on your terms.</span></h2>
                <p className="section-sub" style={{ marginTop: 14 }}>Join 12,000+ verified mentors helping students navigate college admissions, career choices, and exam prep — on a schedule that works for you.</p>
                <ul className="mentor-cta-perks">
                  <li><span className="perk-dot" style={{ background: 'var(--emerald)' }} /><span>Set your own availability &amp; hourly rate</span></li>
                  <li><span className="perk-dot" style={{ background: 'var(--indigo)' }} /><span>1-on-1 video or chat sessions</span></li>
                  <li><span className="perk-dot" style={{ background: 'var(--amber)' }} /><span>Secure &amp; timely payouts every session</span></li>
                  <li><span className="perk-dot" style={{ background: 'var(--violet)' }} /><span>Build your reputation with student reviews</span></li>
                </ul>
                <div className="mentor-cta-btns">
                  <button className="btn btn-primary btn-lg" onClick={() => openAuth('signup')}>
                    Become a Mentor <ArrowRight width="20" height="20" />
                  </button>
                  <button className="btn btn-ghost btn-lg" onClick={() => setShowHowItWorks(true)}>
                    How it Works
                  </button>
                </div>
              </div>
              <div className="mentor-cta-stats">
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text">12,000+</div>
                  <div className="mcs-label">Active Mentors</div>
                </div>
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text">1.2L+</div>
                  <div className="mcs-label">Students Guided</div>
                </div>
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    4.9
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l2.9 6 6.6.95-4.75 4.63 1.12 6.54L12 17.25l-5.87 3.07 1.12-6.54L2.5 8.95 9.1 8z"/>
                    </svg>
                  </div>
                  <div className="mcs-label">Average Rating</div>
                </div>
                <div className="mcs-card reveal">
                  <div className="mcs-num grad-text">₹800–₹5k</div>
                  <div className="mcs-label">Earning per Hour</div>
                </div>
              </div>
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
                { badge: 'Admitted', text: 'The AI predictor showed me exactly which colleges I had a real shot at. I found the right engineering college and avoided a wrong admission decision.', av: 'RD', col: 'linear-gradient(135deg,#4F46E5,#3B82F6)', n: 'Rohan Deshmukh', r: 'B.Tech CSE · COEP Pune' },
                { badge: 'Hired', text: 'Mock interviews here helped me crack my first software developer job. The feedback after each round was honest and exactly what I needed to improve.', av: 'AT', col: 'linear-gradient(135deg,#0FA968,#06B6D4)', n: 'Aditi Talreja', r: 'SDE-1 · Razorpay' },
                { badge: 'Admitted', text: 'My mentor gave me complete clarity about MBA admissions and career growth. I joined my dream B-school this year with full confidence.', av: 'FM', col: 'linear-gradient(135deg,#7C5CF7,#EC4899)', n: 'Faizan Mirza', r: 'MBA · IIM Indore' }
              ].map((t, i) => (
                <div className="card testi-card reveal" key={i}>
                  <div className="testi-top">
                    <div className="stars" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} viewBox="0 0 24 24" width="15" height="15" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2l2.9 6 6.6.95-4.75 4.63 1.12 6.54L12 17.25l-5.87 3.07 1.12-6.54L2.5 8.95 9.1 8z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="badge-hired"><Check width="24" height="24" /> {t.badge}</span>
                  </div>
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
              <p>Join 1,000+ students getting personalised guidance from verified mentors — and make your next decision with confidence.</p>
              <div className="cta-btns">
                <button className="btn btn-white btn-lg" onClick={() => openAuth('signup')}>Register Free</button>
                <Link to="/mentors" className="btn btn-clear btn-lg">Find a Mentor</Link>
                <Link to="/predictor" className="btn btn-clear btn-lg">Predict My College</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
    </>
  );
}
