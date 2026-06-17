import React from 'react';
import { useBooking } from '../context/BookingContext.jsx';
import { AVATAR_COLORS, FOCUS_LABEL } from '../data/mentors.js';
import { Check, Star, Cap, Calendar, Clock } from './Icons.jsx';

export default function MentorCard({ mentor, colorIndex = 0 }) {
  const { openBooking } = useBooking();
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  const book = () =>
    openBooking({
      id:    mentor.id,
      init:  mentor.init,
      color,
      name:  mentor.name,
      role:  `${mentor.role} · ${mentor.org}`,
      price: mentor.price,
    });
  return (
    <div className="card card-hover mentor-card">
      <span className="verified"><Check width="14" height="14" /> Verified</span>
      <div className="m-top">
        <div className="m-av" style={{ background: color }}>{mentor.init}</div>
        <div>
          <div className="m-name">{mentor.name}</div>
          <div className="m-role">{mentor.role}</div>
          <div className="m-org"><Cap width="13" height="13" /> {mentor.org} · {mentor.typeLabel}</div>
        </div>
      </div>
      <div className="m-bio">{mentor.bio}</div>
      <div className="m-tags">
        {mentor.focus.slice(0, 3).map((f) => <span className="kv" key={f}>{FOCUS_LABEL[f]}</span>)}
      </div>
      <div className="m-meta">
        <span className="mm star">
          <Star width="14" height="14" /> {mentor.rating.toFixed(1)}{' '}
          <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>({mentor.reviews})</span>
        </span>
        <span className="mm"><Calendar width="24" height="24" /> {mentor.sessions}</span>
        <span className="mm"><Clock width="24" height="24" /> {mentor.resp}</span>
      </div>
      <div className="m-foot">
        {mentor.price === 0
          ? <div className="m-price"><span className="free">Free</span> <small>intro call</small></div>
          : <div className="m-price">₹{mentor.price} <small>/ session</small></div>}
        <button className="btn btn-primary btn-sm" onClick={book}>Book Now</button>
      </div>
    </div>
  );
}
