import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Icons.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand"><span className="logo"><Logo width="24" height="24" /></span> Mentor<b>4</b>Career</Link>
            <p>AI-powered career guidance, college prediction, mentorship, internships and job assistance — all in one trusted platform for students.</p>
            <div className="footer-social">
              <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2 3.77-2 4 0 4.78 2.6 4.78 6V21h-4v-5.3c0-1.27 0-2.9-1.8-2.9s-2.05 1.4-2.05 2.8V21h-4z" /></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg></a>
              <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" width="24" height="24"><rect x="2.5" y="6" width="19" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.8" /><path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" /></svg></a>
              <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M18 3h3l-7 8 8 10h-6l-5-6-5 6H3l7.5-9L3 3h6l4.5 5.5z" /></svg></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/predictor">AI Predictor</Link>
            <Link to="/mentors">Mentorship</Link>
            <Link to="/jobs">Jobs &amp; Internships</Link>
            <Link to="/webinars">Webinars</Link>
            <Link to="/interview">Interview Prep</Link>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Career Roadmaps</a>
            <a href="#">Trending Colleges</a>
            <a href="#">Career News</a>
            <a href="#">Success Stories</a>
            <Link to="/faq">FAQs</Link>
            <Link to="/support">Help &amp; Support</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <Link to="/mentors">Become a Mentor</Link>
            <Link to="/contact">Contact Us</Link>
            <a href="#">Careers</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Refund Policy</a>
            <a href="#">Trust &amp; Safety</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Mentor4Career. All rights reserved.</span>
          <div className="fb-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
