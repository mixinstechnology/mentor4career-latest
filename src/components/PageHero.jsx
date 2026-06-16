import React from 'react';
import { Link } from 'react-router-dom';
import { Chevron } from './Icons.jsx';

export default function PageHero({ crumb, eyebrow, title, sub, stats }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <div className="crumb"><Link to="/">Home</Link><Chevron width="24" height="24" /><span>{crumb}</span></div>
        <span className="eyebrow"><span className="dot" /> {eyebrow}</span>
        <h1 style={{ marginTop: 16 }}>{title}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
        {stats && (
          <div className="ph-stats">
            {stats.map((s) => (
              <div className="s" key={s.l}><div className="v">{s.v}</div><div className="l">{s.l}</div></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
