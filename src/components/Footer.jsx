import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import M4CLogo from '../utils/images/M4C_logo_transparent.png';
import { useAuth } from '../context/AuthContext.jsx';

/* ── close icon ── */
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── section heading inside modal ── */
const MH = ({ n, children }) => (
  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)', margin: '22px 0 8px', paddingBottom: 6, borderBottom: '1.5px solid #EEF2FF' }}>
    {n && <span style={{ color: '#4F46E5', marginRight: 8 }}>{n}.</span>}{children}
  </div>
);
const Sub = ({ children }) => (
  <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75, margin: '0 0 10px' }}>{children}</p>
);
const Bullets = ({ items }) => (
  <ul style={{ margin: '6px 0 12px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
    {items.map((item, i) => (
      <li key={i} style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65 }}>{item}</li>
    ))}
  </ul>
);

/* ════════════════════════════════
   MODAL SHELL
════════════════════════════════ */
function FooterModal({ title, onClose, children }) {
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
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 720, maxHeight: '90dvh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', padding: '20px 26px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>{title}</div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <XIcon />
          </button>
        </div>
        {/* scrollable body */}
        <div style={{ overflowY: 'auto', padding: '24px 28px 32px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   TERMS & CONDITIONS CONTENT
════════════════════════════════ */
function TermsContent() {
  return (
    <>
      <Sub>
        Welcome to Mentor4Career. By using our website and services, you agree to the following terms and conditions. Please read them carefully before making any purchase.
      </Sub>

      <MH n="1">Scope of Services</MH>
      <Sub>Mentor4Career provides educational and career-related guidance, including but not limited to:</Sub>
      <Bullets items={[
        'College admission counselling',
        'Branch and stream selection',
        'Cut-off analysis and college lists',
        'Webinars, counselling sessions, and resources',
        'Project support and career planning',
      ]} />
      <Sub>Our services are intended for students and parents seeking professional guidance for undergraduate education in India.</Sub>

      <MH n="2">Eligibility</MH>
      <Sub>You must be at least 13 years old or have parental consent to use our services. By accessing the site and purchasing a package, you confirm that you meet these criteria.</Sub>

      <MH n="3">User Responsibilities</MH>
      <Bullets items={[
        'Users must provide correct and complete personal, academic, and contact information.',
        'Mentor4Career will not be responsible for any issues arising due to false, outdated, or misleading information submitted by the user.',
      ]} />

      <MH n="4">Payment Terms</MH>
      <Bullets items={[
        'All services must be paid in advance using UPI, debit/credit cards, net banking, or wallets.',
        'All prices include applicable taxes unless stated otherwise.',
        'Once a package is purchased, access to relevant sessions, content, or support will be provided as per the plan details.',
      ]} />

      {/* Refund Policy */}
      <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 14, padding: '18px 20px', margin: '22px 0 10px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#92400E', marginBottom: 14 }}>
          Refund &amp; Cancellation Policy
        </div>

        <MH n="1">No Refund Policy</MH>
        <Sub>Please note that all purchases made on Mentor4Career are final and non-refundable. This includes, but is not limited to:</Sub>
        <Bullets items={[
          'Change of mind after purchase',
          'Failure to attend scheduled sessions',
          'Dissatisfaction with guidance or materials after delivery',
        ]} />

        <MH n="2">Payment Failure / Duplicate Payment</MH>
        <Sub>If your payment fails or is charged twice:</Sub>
        <Bullets items={[
          'Please raise a support ticket by emailing us at connect@mentor4career.com',
          'Include your registered email or phone number, transaction ID, and a screenshot of the payment',
          'Once verified, we will process the refund within 7–8 business days',
        ]} />

        <MH n="3">Session Rescheduling</MH>
        <Sub>If you wish to reschedule a session:</Sub>
        <Bullets items={[
          'You must notify us at least 24 hours in advance',
          'Rescheduling is subject to slot availability',
        ]} />
      </div>

      <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '14px 18px', marginTop: 18 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#4F46E5', marginBottom: 8 }}>Support Contact</div>
        <Sub>For any queries, support, or payment-related issues, contact us at:</Sub>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            connect@mentor4career.com
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            +91-7999503527
          </span>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════
   PRIVACY & PAYMENT POLICY CONTENT
════════════════════════════════ */
function PrivacyContent() {
  return (
    <>
      <Sub>
        At Mentor4career, we are committed to ensuring the privacy and security of our customers' information. This Privacy and Payment Policy explains how we collect, use, and protect your personal information when processing payments through Razorpay. By participating in our programs and making a payment, you agree to the terms outlined in this policy.
      </Sub>

      <MH n="1">Information Collection</MH>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 4px' }}>1.1 Personal Information</div>
      <Sub>When making a payment through Razorpay, we collect certain personal information, including but not limited to your name, email address, phone number, and billing address. This information is necessary to process your payment and communicate with you regarding program-related updates and activities.</Sub>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 4px' }}>1.2 Financial Information</div>
      <Sub>We do not store or process any financial information such as credit card or bank account details on our servers. All payment processing is handled securely by Razorpay, a trusted third-party payment gateway. Your financial information is directly collected and stored by Razorpay, and their privacy policy governs the use and protection of such information.</Sub>

      <MH n="2">Use of Information</MH>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 4px' }}>2.1 Payment Processing</div>
      <Sub>We use the personal information collected during the payment process to facilitate the completion of your transaction, verify your identity, and prevent fraudulent activities.</Sub>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 4px' }}>2.2 Communication</div>
      <Sub>We may use your contact information to communicate with you regarding program-related updates, schedule changes, and other relevant information. We may also send you promotional emails about future events or programs that may be of interest to you. You can opt-out of these communications at any time by following the unsubscribe instructions provided in the email.</Sub>

      <MH n="3">Data Security</MH>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 4px' }}>3.1 Security Measures</div>
      <Sub>We take reasonable and appropriate measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please note that no data transmission over the internet or electronic storage method is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.</Sub>
      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 4px' }}>3.2 Third-Party Services</div>
      <Sub>Our payment processing partner, Razorpay, maintains industry-standard security measures to protect your financial information. Their servers are encrypted and comply with the Payment Card Industry Data Security Standard (PCI DSS). We recommend reviewing Razorpay's privacy policy and terms of service for further details on their data protection practices.</Sub>

      <MH>Data Retention</MH>
      <Sub>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy unless a longer retention period is required or permitted by law. Once your payment is successfully processed, we securely store the relevant transaction details for financial and accounting purposes.</Sub>

      <MH>Disclosure of Information</MH>
      <Sub>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as necessary to process your payment or comply with applicable laws and regulations.</Sub>

      <MH>Changes to this Policy</MH>
      <Sub>We reserve the right to modify or update this Privacy and Payment Policy at any time. Any changes will be posted on our website, and we encourage you to review this policy periodically.</Sub>

      <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '14px 18px', marginTop: 18 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#4F46E5', marginBottom: 6 }}>Contact Us</div>
        <Sub>If you have any questions, concerns, or requests regarding this Privacy and Payment Policy or the processing of your personal information, please contact us at:</Sub>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          connect@mentor4career.com
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════
   ABOUT US CONTENT
════════════════════════════════ */
function AboutContent() {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'What is Mentor4Career?', a: 'Mentor4Career is a student-focused platform offering guidance, resources, and services to help students navigate their college journey and secure their first job.' },
    { q: 'Who can benefit from Mentor4Career?', a: 'Our services are designed for students at every stage, whether you\'re looking for college admission, seeking academic support, or preparing for the job market.' },
    { q: 'How does Mentor4Career assist with college admissions?', a: 'We provide personalized counseling to help you select the right college and course based on your interests, aptitude, and career goals. Our team also guides you through the admission process.' },
    { q: 'Can I get help with academic projects?', a: 'Yes, we offer guidance on academic projects, helping you create impactful and innovative work that stands out to professors and future employers.' },
    { q: 'How does the buy-and-sell gadget service work?', a: 'We connect students looking to buy or sell pre-owned gadgets. Our platform ensures quality checks and trusted transactions, making it easy to access affordable devices.' },
    { q: 'Do you help students find accommodation near their colleges?', a: 'Absolutely! We provide a curated list of verified hostels and PGs near your college, considering factors like safety, affordability, and convenience.' },
    { q: 'What kind of internships do you offer?', a: 'We partner with companies across various industries to provide internships that suit your field of study and career aspirations.' },
    { q: 'What is an off-campus drive?', a: 'An off-campus drive connects students with job opportunities outside their college placement process. We organize these drives to give you access to a wider range of career options.' },
    { q: 'How do mock interviews work?', a: 'Our mock interviews simulate real-world job interviews. Experienced professionals evaluate your performance and provide constructive feedback to improve your confidence and skills.' },
    { q: 'Are the services free or paid?', a: 'While many of our resources and basic services are free, some specialized offerings like career counselling and mock interviews may have a nominal fee. Contact us for detailed pricing.' },
    { q: 'Can I use Mentor4Career online?', a: 'Yes, all our services are accessible online. You can sign up, explore resources, and connect with mentors through our user-friendly platform.' },
    { q: 'How do I get started?', a: 'Simply sign up on our website, browse through our services, and contact us for personalized guidance. Our team will assist you every step of the way.' },
    { q: 'Is Mentor4Career available in my city?', a: 'We cater to students across India. While some services are location-specific, most are available online, ensuring accessibility no matter where you are.' },
    { q: 'Can Mentor4Career help with career changes after college?', a: 'Yes, we extend our guidance to fresh graduates and young professionals looking to switch careers or upskill for better opportunities.' },
    { q: 'How can I contact Mentor4Career for more information?', a: 'You can reach us through our website, email, or phone. Visit our "Contact Us" page for detailed information.' },
  ];

  return (
    <>
      {/* Mission */}
      <div style={{ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)', borderRadius: 14, padding: '20px 22px', marginBottom: 22 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#4F46E5', marginBottom: 8 }}>Our Mission</div>
        <Sub>Our mission is to bridge the gap between education and employment by equipping students with the tools, knowledge, and support they need to succeed in today's competitive world. We aim to simplify the complex decisions students face and make the college-to-career journey a rewarding experience.</Sub>
      </div>

      {/* What We Do */}
      <MH>What We Do</MH>
      {[
        { n: '1', title: 'College Admissions Guidance', desc: 'We help students find and secure admission to the best colleges that match their career aspirations and interests. Our counselors provide personalized support to identify colleges and courses that align with your goals.' },
        { n: '2', title: 'Academic Support Throughout College', desc: 'We offer comprehensive support during your college years, including guidance on academic projects, recommendations for industry-relevant courses and certifications, and access to study notes, books, and resources.' },
        { n: '3', title: 'Buy & Sell Pre-owned Gadgets', desc: 'Affordable and quality gadgets are essential for a smooth learning experience. Mentor4Career connects you with trusted sources to buy or sell laptops, tablets, and other necessary devices, saving you money.' },
        { n: '4', title: 'Hostel / PG Recommendations', desc: 'Finding safe, comfortable, and affordable accommodations near your college can be challenging. We simplify this process by providing a curated list of the best hostels and PGs in your area.' },
        { n: '5', title: 'Career Preparation', desc: 'Our specialized services prepare you for the professional world by offering internship opportunities, off-campus recruitment drives, and mock interviews to build confidence and sharpen your skills.' },
        { n: '6', title: 'Networking and Community', desc: 'Join a vibrant community of students, mentors, and industry professionals. Share experiences, seek advice, and grow your network to stay ahead in your career.' },
      ].map(item => (
        <div key={item.n} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>{item.n}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>{item.title}</div>
            <Sub>{item.desc}</Sub>
          </div>
        </div>
      ))}

      {/* Why Choose */}
      <MH>Why Choose Mentor4Career?</MH>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 22 }}>
        {[
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
              </svg>
            ),
            color: '#4F46E5', title: 'Comprehensive Support', desc: 'End-to-end services covering every aspect of your college and career journey.',
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/><path d="M12 17v4M8 21h8"/>
              </svg>
            ),
            color: '#0891B2', title: 'Expert Guidance', desc: 'Experienced counselors, industry professionals, and educators dedicated to your success.',
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            ),
            color: '#059669', title: 'Affordable Solutions', desc: 'Budget-friendly options and free resources accessible to all students.',
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8L12 2z"/>
              </svg>
            ),
            color: '#D97706', title: 'Customized Services', desc: 'Tailored services to match your specific needs and aspirations.',
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 21h8M12 17v4M7 4H5a2 2 0 00-2 2v5c0 3.31 2.69 6 6 6h6c3.31 0 6-2.69 6-6V6a2 2 0 00-2-2h-2"/><path d="M7 4h10"/>
              </svg>
            ),
            color: '#7C3AED', title: 'Proven Track Record', desc: 'Students placed in top colleges, dream internships, and job interviews.',
          },
        ].map(c => (
          <div key={c.title} style={{ background: '#F8FAFF', border: '1.5px solid #E8ECFF', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ color: c.color, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)', marginBottom: 4 }}>{c.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <MH>Frequently Asked Questions</MH>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: '100%', padding: '13px 16px', background: openFaq === i ? '#EEF2FF' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, textAlign: 'left' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: openFaq === i ? '#4F46E5' : 'var(--ink)' }}>
                {i + 1}. {f.q}
              </span>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ flexShrink: 0, transition: 'transform .2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {openFaq === i && (
              <div style={{ padding: '12px 16px 14px', background: '#F8FAFF', borderTop: '1px solid #E8ECFF', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Join Us */}
      <div style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 14, padding: '20px 22px', marginTop: 22, color: '#fff' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Join Us Today!</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.7, opacity: 0.92 }}>
          Start your journey with Mentor4Career and unlock a world of opportunities. Whether it's choosing the right college, excelling in academics, or landing your first job, we are here to make your aspirations a reality. Let's work together to shape your future and achieve your dreams!
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════
   FOOTER
════════════════════════════════ */
export default function Footer() {
  const [modal, setModal] = useState(null); // null | 'terms' | 'privacy' | 'about'
  const { openAuth } = useAuth();

  const open = (id) => setModal(id);
  const close = () => setModal(null);

  const linkStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--ink-3)', fontSize: 14, textAlign: 'left',
    padding: 0, fontFamily: 'inherit', transition: 'color .15s',
  };

  return (
    <>
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">

            {/* ── Brand ── */}
            <div className="footer-brand">
              <Link to="/" className="brand">
                <img src={M4CLogo} alt="Mentor4Career" style={{ width: 52, height: 52, objectFit: 'contain', display: 'block' }} /><span>Mentor<span style={{ color: "#4F46E5" }}>4</span>Career</span>
              </Link>
              <p>AI-powered career guidance, college prediction, mentorship, internships and job assistance — all in one trusted platform for students.</p>

              {/* Address */}
              <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.7, display: 'flex', gap: 8 }}>
                <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style={{ flexShrink: 0, marginTop: 2 }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span>Sector 16, Raje Shivaji Nagar, Chinchwad, Pune – 411019</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  connect@mentor4career.com
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  +91-7999503527
                </span>
              </div>

              <div className="footer-social">
                <a href="https://www.linkedin.com/company/mixins-technology-pune/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <rect width="24" height="24" rx="4" fill="#0A66C2"/>
                    <path fill="#fff" d="M7.75 5.5a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM6.25 10h3v9h-3zM11 10h2.88v1.23h.04c.4-.76 1.38-1.56 2.83-1.56 3.03 0 3.59 2 3.59 4.59V19h-3v-4.22c0-1.01-.02-2.3-1.4-2.3-1.41 0-1.63 1.1-1.63 2.23V19h-3V10z"/>
                  </svg>
                </a>
                <a href="https://wa.me/7999503527" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <svg viewBox="0 0 48 48" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#25D366" />
                    <path fill="#fff" d="M24.003 10C16.27 10 10 16.268 10 23.997c0 2.45.664 4.745 1.82 6.718L10 38l7.492-1.796A14.02 14.02 0 0024.003 38C31.732 38 38 31.73 38 24.003 38 16.27 31.732 10 24.003 10zm0 25.907a11.93 11.93 0 01-6.08-1.663l-.435-.258-4.448 1.066 1.1-4.317-.283-.442A11.876 11.876 0 0112.09 24c0-6.57 5.345-11.913 11.913-11.913S35.913 17.43 35.913 24c0 6.572-5.344 11.907-11.91 11.907zm6.533-8.924c-.358-.179-2.118-1.044-2.447-1.163-.328-.12-.567-.18-.806.18-.238.357-.924 1.163-1.133 1.402-.208.24-.418.27-.776.09-.358-.18-1.513-.558-2.88-1.775-1.065-.949-1.784-2.12-1.993-2.478-.21-.358-.023-.55.157-.728.162-.16.358-.418.537-.627.18-.21.24-.358.358-.597.12-.24.06-.449-.03-.628-.09-.18-.806-1.942-1.104-2.659-.29-.698-.587-.603-.806-.614l-.687-.012c-.239 0-.627.09-.955.448-.328.358-1.253 1.224-1.253 2.987s1.283 3.465 1.462 3.703c.18.24 2.524 3.854 6.117 5.405.854.37 1.522.59 2.04.754.858.272 1.64.234 2.256.142.688-.103 2.118-.865 2.418-1.702.298-.836.298-1.553.208-1.702-.09-.148-.327-.238-.685-.418z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* ── Platform ── */}
            <div className="footer-col">
              <h4>Platform</h4>
              {/* <Link to="/predictor">AI Predictor</Link> */}
              <Link to="/mentors">Mentorship</Link>
              <Link to="/jobs">Jobs &amp; Internships</Link>
              <Link to="/webinars">Webinars</Link>
              <Link to="/interview">Interview Prep</Link>
            </div>

            {/* ── Resources ── */}
            <div className="footer-col">
              <h4>Resources</h4>
              {/* <a href="#">Career Roadmaps</a> */}
              {/* <a href="#">Trending Colleges</a> */}
              {/* <a href="#">Career News</a> */}
              {/* <a href="#">Success Stories</a> */}
              <Link to="/faq">FAQs</Link>
              <Link to="/support">Help &amp; Support</Link>
            </div>

            {/* ── Company ── */}
            <div className="footer-col">
              <h4>Company</h4>
              <button style={linkStyle} onClick={() => open('about')} onMouseEnter={e => e.target.style.color='var(--indigo)'} onMouseLeave={e => e.target.style.color='var(--ink-3)'}>About Us</button>
              <button style={linkStyle} onClick={() => openAuth('signup', 'mentor')} onMouseEnter={e => e.target.style.color='var(--indigo)'} onMouseLeave={e => e.target.style.color='var(--ink-3)'}>Become a Mentor</button>
              <Link to="/contact">Contact Us</Link>
              {/* <a href="#">Careers</a> */}
            </div>

            {/* ── Legal ── */}
            <div className="footer-col">
              <h4>Legal</h4>
              <button style={linkStyle} onClick={() => open('privacy')} onMouseEnter={e => e.target.style.color='var(--indigo)'} onMouseLeave={e => e.target.style.color='var(--ink-3)'}>Privacy Policy</button>
              <button style={linkStyle} onClick={() => open('terms')} onMouseEnter={e => e.target.style.color='var(--indigo)'} onMouseLeave={e => e.target.style.color='var(--ink-3)'}>Terms &amp; Conditions</button>
              <button style={linkStyle} onClick={() => open('terms')} onMouseEnter={e => e.target.style.color='var(--indigo)'} onMouseLeave={e => e.target.style.color='var(--ink-3)'}>Refund Policy</button>
              {/* <a href="#">Trust &amp; Safety</a> */}
            </div>

          </div>

          <div className="footer-bottom">
            <span>© 2026 Mentor4Career. All rights reserved.</span>
            <div className="fb-links">
              <button style={{ ...linkStyle, fontSize: 13 }} onClick={() => open('privacy')} onMouseEnter={e => e.target.style.color='var(--indigo)'} onMouseLeave={e => e.target.style.color='var(--ink-3)'}>Privacy</button>
              <button style={{ ...linkStyle, fontSize: 13 }} onClick={() => open('terms')} onMouseEnter={e => e.target.style.color='var(--indigo)'} onMouseLeave={e => e.target.style.color='var(--ink-3)'}>Terms</button>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {modal === 'terms' && (
        <FooterModal title="Terms & Conditions" onClose={close}>
          <TermsContent />
        </FooterModal>
      )}
      {modal === 'privacy' && (
        <FooterModal title="Privacy & Payment Policy" onClose={close}>
          <PrivacyContent />
        </FooterModal>
      )}
      {modal === 'about' && (
        <FooterModal title="About Us" onClose={close}>
          <AboutContent />
        </FooterModal>
      )}
    </>
  );
}
