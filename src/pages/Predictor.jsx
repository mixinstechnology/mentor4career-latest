import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import { Logo } from '../components/Icons.jsx';

const SAMPLE = [
  { rank: 1, mono: 'VJ', col: 'linear-gradient(135deg,#4F46E5,#3B82F6)', name: 'VJTI, Mumbai', meta: 'CSE · Govt. Aided', p: 94, c: 'var(--emerald)' },
  { rank: 2, mono: 'CO', col: 'linear-gradient(135deg,#7C5CF7,#EC4899)', name: 'COEP Tech, Pune', meta: 'CSE · Autonomous', p: 88, c: 'var(--emerald)' },
  { rank: 3, mono: 'PI', col: 'linear-gradient(135deg,#06B6D4,#3B82F6)', name: 'PICT, Pune', meta: 'IT · Private', p: 71, c: 'var(--amber)' },
  { rank: 4, mono: 'MI', col: 'linear-gradient(135deg,#F59E0B,#EF4444)', name: 'MIT-WPU, Pune', meta: 'AI & DS · Private', p: 52, c: 'var(--indigo)' }
];

export default function Predictor() {
  const [exam, setExam] = useState('jee');
  const [score, setScore] = useState('');
  const [show, setShow] = useState(false);

  return (
    <main id="top">
      <PageHero
        crumb="AI Predictor"
        eyebrow="AI College Predictor 2026"
        title={<>Find colleges where you'll <span className="grad-text">actually get in</span></>}
        sub="Enter your exam and score — our AI ranks the best-fit colleges by your real admission probability, not guesswork."
      />
      <section className="section-pad" style={{ paddingTop: 18 }}>
        <div className="wrap match-grid">
          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ marginBottom: 6 }}>Your details</h3>
            <p className="section-sub" style={{ margin: '0 0 20px' }}>Free &amp; unbiased — no commissions, only what's right for you.</p>
            <div className="fgroup">
              <label>Exam</label>
              <select className="fsel" value={exam} onChange={(e) => setExam(e.target.value)}>
                <option value="jee">JEE Main</option>
                <option value="neet">NEET</option>
                <option value="cet">MHT-CET</option>
                <option value="cat">CAT / MBA</option>
              </select>
            </div>
            <div className="fgroup">
              <label>Your score / percentile</label>
              <input className="bk-inp" type="text" placeholder="e.g. 96.4 %ile" value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }} onClick={() => setShow(true)}>Predict My College</button>
          </div>

          <div className="predict-card">
            <div className="pc-head">
              <span className="pc-logo"><Logo width="24" height="24" style={{ color: '#fff' }} /></span>
              <div><div className="pc-t">Your College Matches</div><div className="pc-s">{exam.toUpperCase()} · {score || '96.4 %ile'} · CSE</div></div>
              <span className="pc-live"><i /> Live</span>
            </div>
            <div className="pc-body" style={{ opacity: show ? 1 : 0.55 }}>
              <div className="pc-meta"><span>Maharashtra</span><span>B.Tech</span><span>Computer Science</span><span>28 matched</span></div>
              {SAMPLE.map((r) => (
                <div className="cr" key={r.rank}>
                  <span className="rank">{r.rank}</span>
                  <span className="mono" style={{ background: r.col }}>{r.mono}</span>
                  <div><div className="ci-name">{r.name}</div><div className="ci-meta">{r.meta}</div></div>
                  <div className="chance"><div className="p" style={{ color: r.c }}>{r.p}%</div><div className="bar"><i style={{ width: r.p + '%', background: r.c }} /></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
