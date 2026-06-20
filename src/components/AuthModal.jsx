import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo, Close, Mail, Lock, Person } from './Icons.jsx';
import httpService from '../utils/apiService.tsx';
import Cookies from 'js-cookie';

const EyeBtn = ({ shown, onClick }) => (
  <button
    type="button"
    className={`pw-toggle${shown ? ' active' : ''}`}
    onClick={onClick}
    aria-label={shown ? 'Hide password' : 'Show password'}
    aria-pressed={shown}
  >
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  </button>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const Roles = ({ value, onChange, options }) => (
  <div className="am-roles">
    {options.map((r) => (
      <button
        key={r.id}
        type="button"
        className={value === r.id ? 'active' : ''}
        aria-pressed={value === r.id}
        onClick={() => onChange(r.id)}
      >
        {r.label}
      </button>
    ))}
  </div>
);

const OtpInput = ({ value, onChange, autoFocus = false }) => {
  const refs = useRef([]);

  const handleChange = (idx, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = value.slice(0, idx) + digit + value.slice(idx + 1);
    onChange(next.slice(0, 6));
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[idx]) {
        onChange(value.slice(0, idx) + value.slice(idx + 1));
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
        onChange(value.slice(0, idx - 1) + value.slice(idx));
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="otp-boxes">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={autoFocus && i === 0}
          className={`otp-box${value[i] ? ' filled' : ''}`}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

const STUDENT_TYPES = [
  { id: 'student',   label: 'Student'    },
  { id: 'jobseeker', label: 'Job Seeker' },
  { id: 'parent',    label: 'Parent'     },
  { id: 'guardian',  label: 'Guardian'   },
];

export default function AuthModal() {
  const { authTab, authInitRole, openAuth, closeAuth, signIn } = useAuth();
  const navigate = useNavigate();

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [fe,      setFe]      = useState({});

  const [loginRole,   setLoginRole]   = useState('user');
  const [signupRole,  setSignupRole]  = useState('student');

  useEffect(() => {
    if (authTab === 'signup') setSignupRole(authInitRole ?? 'student');
  }, [authTab, authInitRole]);

  // ── Forgot password ──
  const [forgotStep,  setForgotStep]  = useState(null); // null | 'email'
  const [forgotEmail, setForgotEmail] = useState('');

  // ── Login fields ──
  const [loginOtpStep,   setLoginOtpStep]   = useState('phone');
  const [loginPhone,     setLoginPhone]     = useState('');
  const [loginOtp,       setLoginOtp]       = useState('');
  const [loginEmail,     setLoginEmail]     = useState('');
  const [loginPassword,  setLoginPassword]  = useState('');
  const [showLoginPw,    setShowLoginPw]    = useState(false);

  // ── Student signup fields ──
  const [signupOtpStep,  setSignupOtpStep]  = useState('phone'); // 'phone' | 'verify'
  const [signupFirstName,setSignupFirstName]= useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupType,     setSignupType]     = useState('student');
  const [signupPhone,    setSignupPhone]    = useState('');
  const [signupOtp,      setSignupOtp]      = useState('');

  // ── Mentor signup fields ──
  const [mentorEmail,    setMentorEmail]    = useState('');
  const [mentorPassword, setMentorPassword] = useState('');
  const [mentorContact,  setMentorContact]  = useState('');
  const [mentorGender,   setMentorGender]   = useState('male');
  const [showMentorPw,   setShowMentorPw]   = useState(false);
  // firstName / lastName shared with student signup fields above

  /* ── reset every input field ── */
  const resetAllFields = () => {
    setLoginPhone(''); setLoginOtp(''); setLoginEmail('');
    setLoginPassword(''); setShowLoginPw(false); setLoginOtpStep('phone');
    setSignupFirstName(''); setSignupLastName(''); setSignupType('student');
    setSignupPhone(''); setSignupOtp(''); setSignupOtpStep('phone');
    setMentorEmail(''); setMentorPassword(''); setMentorContact('');
    setMentorGender('male'); setShowMentorPw(false);
    setForgotStep(null); setForgotEmail('');
    setError(''); setFe({});
  };

  /* body scroll lock + Esc */
  useEffect(() => {
    if (!authTab) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [authTab, closeAuth]);

  /* reset steps when tab changes */
  useEffect(() => {
    setLoginOtpStep('phone');
    setSignupOtpStep('phone');
    setError('');
    setLoading(false);
    setFe({});
  }, [authTab]);

  /* reset login fields when login role switches */
  useEffect(() => {
    setLoginOtpStep('phone');
    setLoginPhone(''); setLoginOtp(''); setError(''); setFe({});
  }, [loginRole]);

  /* reset signup fields when signup role switches */
  useEffect(() => {
    setSignupOtpStep('phone');
    setSignupFirstName(''); setSignupLastName('');
    setSignupType('student'); setSignupPhone(''); setSignupOtp('');
    setMentorEmail(''); setMentorPassword(''); setMentorContact('');
    setMentorGender('male'); setError(''); setFe({});
  }, [signupRole]);

  if (!authTab) return null;

  const goTo = (role, name = '') => {
    resetAllFields();
    signIn(role, name);
    navigate(role === 'mentor' ? '/mentor-dashboard' : role === 'admin' ? '/admin-dashboard' : '/dashboard');
  };

  /* ══════════ LOGIN handlers ══════════ */

  const sendLoginOTP = async () => {
    const errs = {};
    if (!loginPhone.trim()) errs.phone = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(loginPhone.replace(/\D/g, ''))) errs.phone = 'Enter a valid 10-digit mobile number.';
    if (Object.keys(errs).length) { setFe(errs); return; }
    setFe({}); setError(''); setLoading(true);
    try {
      await httpService.post('/otp/sendOTP', { data: { mobile: loginPhone }, token: true });
      setLoginOtpStep('verify');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const verifyLoginOTP = async () => {
    setError(''); setLoading(true);
    try {
      const res = await httpService.post('/otp/verifyOTP', {
        data: { mobile: loginPhone, otp: loginOtp, method: 'login' },
        token: true,
      });
      const token = res?.token;
      if (token) {
        Cookies.set('token', token);
        goTo(res?.user?.type || 'student', res?.user?.name || '');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const mentorLogin = async () => {
    const errs = {};
    if (!loginEmail.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) errs.email = 'Enter a valid email address.';
    if (!loginPassword) errs.password = 'Password is required.';
    if (Object.keys(errs).length) { setFe(errs); return; }
    setFe({}); setError(''); setLoading(true);
    try {
      const res = await httpService.post('authUser/login', {
        data: { email: loginEmail, password: loginPassword },
      });
      const token = res?.token;
      if (token) {
        Cookies.set('token', token);
        goTo(res?.data?.role || 'mentor', res?.data?.name || '');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  /* ══════════ FORGOT / RESET PASSWORD handlers ══════════ */

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await httpService.post('/authUser/forgot-password', {
        data: { email: forgotEmail.trim() },
        token: false,
      });
      toast.success('Reset email has been sent to your email.');
      closeAuth();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally { setLoading(false); }
  };

  /* ══════════ STUDENT SIGNUP handlers ══════════ */

  const sendSignupOTP = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!signupFirstName.trim()) errs.firstName = 'First name is required.';
    else if (signupFirstName.trim().length < 2) errs.firstName = 'First name must be at least 2 characters.';
    if (!signupLastName.trim()) errs.lastName = 'Last name is required.';
    if (!signupPhone.trim()) errs.phone = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(signupPhone.replace(/\D/g, ''))) errs.phone = 'Enter a valid 10-digit mobile number.';
    if (Object.keys(errs).length) { setFe(errs); return; }
    setFe({}); setError(''); setLoading(true);
    try {
      await httpService.post('/otp/sendOTP', {
        data: { mobile: signupPhone, method: 'signup' },
        token: false,
      });
      setSignupOtpStep('verify');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const verifySignupOTP = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await httpService.post('/otp/verifyOTP', {
        data: {
          mobile: signupPhone,
          otp: signupOtp,
          method: 'signup',
          userData: {
            firstName: signupFirstName,
            lastName:  signupLastName,
            type:      signupType,
          },
        },
        token: false,
      });
      const token = res?.token;
      if (token) {
        Cookies.set('token', token);
        const fullName = `${signupFirstName.trim()} ${signupLastName.trim()}`;
        goTo(signupType, res?.user?.name || fullName);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally { setLoading(false); }
  };

  /* ══════════ MENTOR SIGNUP handler ══════════ */

  const handleMentorSignup = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!signupFirstName.trim()) errs.firstName = 'First name is required.';
    else if (signupFirstName.trim().length < 2) errs.firstName = 'First name too short.';
    if (!signupLastName.trim()) errs.lastName = 'Last name is required.';
    if (!mentorEmail.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mentorEmail.trim())) errs.email = 'Enter a valid email address.';
    if (!mentorPassword) errs.password = 'Password is required.';
    else if (mentorPassword.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!mentorContact.trim()) errs.contact = 'Contact number is required.';
    else if (!/^\d{10}$/.test(mentorContact.replace(/\D/g, ''))) errs.contact = 'Enter a valid 10-digit number.';
    if (Object.keys(errs).length) { setFe(errs); return; }
    setFe({}); setError(''); setLoading(true);
    try {
      /* Step 1 — create account */
      await httpService.post('/mentorProfile', {
        data: {
          firstName:     signupFirstName.trim(),
          lastName:      signupLastName.trim(),
          email:         mentorEmail.trim(),
          password:      mentorPassword,
          contactNumber: mentorContact.trim(),
          gender:        mentorGender,
          type:          'mentor',
        },
        token: false,
      });

      /* Step 2 — login with the same credentials */
      const loginRes = await httpService.post('authUser/login', {
        data: { email: mentorEmail.trim(), password: mentorPassword },
      });
      const token = loginRes?.token;
      if (token) {
        Cookies.set('token', token);
        const fullName = `${signupFirstName.trim()} ${signupLastName.trim()}`;
        goTo('mentor', loginRes?.data?.name || fullName);
      } else {
        setError('Account created but login failed. Please log in manually.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  /* ══════════ RENDER ══════════ */
  return (
    <div className="auth-modal open" aria-hidden="false">
      <div className="am-scrim" onClick={closeAuth} />
      <div className="am-dialog" role="dialog" aria-modal="true" aria-label="Sign in to Mentor4Career">
        <div className="am-bar" />
        <div className="am-inner">
          <button className="am-x" onClick={closeAuth} aria-label="Close"><Close width="20" height="20" /></button>

          <div className="am-brand">
            <span className="am-brand-icon"><Logo width="20" height="20" /></span>
            <div>
              <div className="am-brand-name">Mentor<span>4Career</span></div>
              <div className="am-brand-tagline">Your career, guided.</div>
            </div>
          </div>

          <div className="am-tabs">
            <button className={authTab === 'login'  ? 'active' : ''} onClick={() => openAuth('login')}>Log in</button>
            <button className={authTab === 'signup' ? 'active' : ''} onClick={() => openAuth('signup')}>Sign up</button>
          </div>

          {error && <div className="am-error" role="alert">{error}</div>}

          {/* ═══════════ LOGIN ═══════════ */}
          {authTab === 'login' && (
            <div className="auth-form am-pane">

              {/* ── Forgot password: email step ── */}
              {forgotStep === 'email' && (
                <form onSubmit={handleForgotPassword} className="am-form-gap">
                  <p className="am-otp-hint">Enter your registered email to receive a password reset link.</p>
                  <div className="input-wrap">
                    <Mail width="24" height="24" />
                    <input type="email" placeholder="Email address" value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)} required autoFocus />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg btn-block"
                    disabled={!forgotEmail.trim() || loading}>
                    {loading ? 'Sending…' : 'Send Reset Email'}
                  </button>
                  <button type="button" className="am-back-link"
                    onClick={() => { setForgotStep(null); setForgotEmail(''); setError(''); }}>
                    ← Back to login
                  </button>
                </form>
              )}

              {/* ── Normal login forms (hidden during forgot-password flow) ── */}
              {!forgotStep && (
                <>
                  <Roles
                    value={loginRole}
                    onChange={setLoginRole}
                    options={[
                      { id: 'user',   label: 'Student / Job Seeker' },
                      { id: 'mentor', label: 'Mentor'                },
                    ]}
                  />

                  {/* Student / Job Seeker — OTP login */}
                  {loginRole === 'user' && loginOtpStep === 'phone' && (
                    <div className="am-form-gap">
                      <div className="input-wrap">
                        <PhoneIcon />
                        <input type="tel" placeholder="Mobile number" value={loginPhone}
                          onChange={(e) => { setLoginPhone(e.target.value); setFe(f => ({ ...f, phone: '' })); }} required maxLength={15} />
                      </div>
                      {fe.phone && <div style={{ color: '#EF4444', fontSize: 12, marginTop: -4, fontWeight: 500 }}>{fe.phone}</div>}
                      <button type="button" onClick={sendLoginOTP}
                        className="btn btn-primary btn-lg btn-block"
                        disabled={!loginPhone.trim() || loading}>
                        {loading ? 'Sending…' : 'Send OTP'}
                      </button>
                    </div>
                  )}

                  {loginRole === 'user' && loginOtpStep === 'verify' && (
                    <div className="am-form-gap">
                      <p className="am-otp-hint">OTP sent to <strong>{loginPhone}</strong></p>
                      <OtpInput value={loginOtp} onChange={setLoginOtp} autoFocus />
                      <button type="button" onClick={verifyLoginOTP}
                        className="btn btn-primary btn-lg btn-block"
                        disabled={loginOtp.length !== 6 || loading}>
                        {loading ? 'Verifying…' : 'Verify OTP'}
                      </button>
                      <button type="button" className="am-back-link"
                        onClick={() => { setLoginOtpStep('phone'); setLoginOtp(''); setError(''); }}>
                        ← Change number
                      </button>
                    </div>
                  )}

                  {/* Mentor — email / password login */}
                  {loginRole === 'mentor' && (
                    <div className="am-form-gap">
                      <div className="input-wrap">
                        <Mail width="24" height="24" />
                        <input type="email" placeholder="Email address" value={loginEmail}
                          onChange={(e) => { setLoginEmail(e.target.value); setFe(f => ({ ...f, email: '' })); }} required />
                      </div>
                      {fe.email && <div style={{ color: '#EF4444', fontSize: 12, marginTop: -4, fontWeight: 500 }}>{fe.email}</div>}
                      <div className="input-wrap">
                        <Lock width="24" height="24" />
                        <input type={showLoginPw ? 'text' : 'password'} placeholder="Password"
                          value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setFe(f => ({ ...f, password: '' })); }} required />
                        <EyeBtn shown={showLoginPw} onClick={() => setShowLoginPw((v) => !v)} />
                      </div>
                      {fe.password && <div style={{ color: '#EF4444', fontSize: 12, marginTop: -4, fontWeight: 500 }}>{fe.password}</div>}
                      <div className="auth-row">
                        <label> </label>
                        <button type="button" className="am-forgot-link"
                          onClick={() => { setForgotStep('email'); setError(''); }}>
                          Forgot password?
                        </button>
                      </div>
                      <button type="button" onClick={mentorLogin}
                        className="btn btn-primary btn-lg btn-block" disabled={loading}>
                        {loading ? 'Logging in…' : 'Log in'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══════════ SIGNUP ═══════════ */}
          {authTab === 'signup' && (
            <div className="auth-form am-pane">
              <Roles
                value={signupRole}
                onChange={setSignupRole}
                options={[
                  { id: 'student', label: 'Student' },
                  { id: 'mentor',  label: 'Mentor'  },
                ]}
              />

              {/* ── STUDENT: 2-step stepper ── */}
              {signupRole === 'student' && (
                <div className="am-stepper">
                  {['phone', 'verify'].map((s, i) => {
                    const cur = ['phone', 'verify'].indexOf(signupOtpStep);
                    return (
                      <React.Fragment key={s}>
                        {i > 0 && (
                          <div className="am-step-track">
                            <div className={`am-step-fill${cur >= i ? ' filled' : ''}`} />
                          </div>
                        )}
                        <div className={`am-step-item${cur === i ? ' active' : ''}${cur > i ? ' done' : ''}`}>
                          <div className="am-step-dot">{cur > i ? '✓' : i + 1}</div>
                          <span className="am-step-label">{['Info', 'Verify'][i]}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* STUDENT Step 1 — Info */}
              {signupRole === 'student' && signupOtpStep === 'phone' && (
                <form onSubmit={sendSignupOTP} className="am-form-gap">
                  <div className="am-name-row">
                    <div className="input-wrap">
                      <Person width="24" height="24" />
                      <input type="text" placeholder="First name" value={signupFirstName}
                        onChange={(e) => { setSignupFirstName(e.target.value); setFe(f => ({ ...f, firstName: '' })); }} required />
                    </div>
                    <div className="input-wrap am-no-icon">
                      <input type="text" placeholder="Last name" value={signupLastName}
                        onChange={(e) => { setSignupLastName(e.target.value); setFe(f => ({ ...f, lastName: '' })); }} required />
                    </div>
                  </div>
                  {(fe.firstName || fe.lastName) && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontWeight: 500 }}>{fe.firstName}</div>
                      <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontWeight: 500 }}>{fe.lastName}</div>
                    </div>
                  )}
                  <div className="input-wrap">
                    <select value={signupType} onChange={(e) => setSignupType(e.target.value)}
                      required className="am-select">
                      {STUDENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="input-wrap">
                    <PhoneIcon />
                    <input type="tel" placeholder="Mobile number" value={signupPhone}
                      onChange={(e) => { setSignupPhone(e.target.value); setFe(f => ({ ...f, phone: '' })); }} required maxLength={15} />
                  </div>
                  {fe.phone && <div style={{ color: '#EF4444', fontSize: 12, marginTop: -4, fontWeight: 500 }}>{fe.phone}</div>}
                  <button type="submit" className="btn btn-primary btn-lg btn-block"
                    disabled={!signupFirstName.trim() || !signupLastName.trim() || !signupPhone.trim() || loading}>
                    {loading ? 'Sending…' : 'Send OTP'}
                  </button>
                  <p className="am-terms">By continuing you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.</p>
                </form>
              )}

              {/* STUDENT Step 2 — Verify OTP → navigate to dashboard */}
              {signupRole === 'student' && signupOtpStep === 'verify' && (
                <form onSubmit={verifySignupOTP} className="am-form-gap">
                  <p className="am-otp-hint">OTP sent to <strong>{signupPhone}</strong></p>
                  <OtpInput value={signupOtp} onChange={setSignupOtp} autoFocus />
                  <button type="submit" className="btn btn-primary btn-lg btn-block"
                    disabled={signupOtp.length !== 6 || loading}>
                    {loading ? 'Verifying…' : 'Verify & Sign up'}
                  </button>
                  <button type="button" className="am-back-link"
                    onClick={() => { setSignupOtpStep('phone'); setSignupOtp(''); setError(''); }}>
                    ← Change number
                  </button>
                </form>
              )}

              {/* ── MENTOR: single-form direct signup ── */}
              {signupRole === 'mentor' && (
                <form onSubmit={handleMentorSignup} className="am-form-gap">
                  <div className="am-name-row">
                    <div className="input-wrap">
                      <Person width="24" height="24" />
                      <input type="text" placeholder="First name" value={signupFirstName}
                        onChange={(e) => { setSignupFirstName(e.target.value); setFe(f => ({ ...f, firstName: '' })); }} required />
                    </div>
                    <div className="input-wrap am-no-icon">
                      <input type="text" placeholder="Last name" value={signupLastName}
                        onChange={(e) => { setSignupLastName(e.target.value); setFe(f => ({ ...f, lastName: '' })); }} required />
                    </div>
                  </div>
                  {(fe.firstName || fe.lastName) && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontWeight: 500 }}>{fe.firstName}</div>
                      <div style={{ flex: 1, color: '#EF4444', fontSize: 12, fontWeight: 500 }}>{fe.lastName}</div>
                    </div>
                  )}
                  <div className="input-wrap">
                    <Mail width="24" height="24" />
                    <input type="email" placeholder="Email address" value={mentorEmail}
                      onChange={(e) => { setMentorEmail(e.target.value); setFe(f => ({ ...f, email: '' })); }} required />
                  </div>
                  {fe.email && <div style={{ color: '#EF4444', fontSize: 12, marginTop: -4, fontWeight: 500 }}>{fe.email}</div>}
                  <div className="input-wrap">
                    <Lock width="24" height="24" />
                    <input type={showMentorPw ? 'text' : 'password'} placeholder="Create a password"
                      value={mentorPassword} onChange={(e) => { setMentorPassword(e.target.value); setFe(f => ({ ...f, password: '' })); }} required />
                    <EyeBtn shown={showMentorPw} onClick={() => setShowMentorPw((v) => !v)} />
                  </div>
                  {fe.password && <div style={{ color: '#EF4444', fontSize: 12, marginTop: -4, fontWeight: 500 }}>{fe.password}</div>}
                  <div className="input-wrap">
                    <PhoneIcon />
                    <input type="tel" placeholder="Contact number" value={mentorContact}
                      onChange={(e) => { setMentorContact(e.target.value); setFe(f => ({ ...f, contact: '' })); }} required maxLength={15} />
                  </div>
                  {fe.contact && <div style={{ color: '#EF4444', fontSize: 12, marginTop: -4, fontWeight: 500 }}>{fe.contact}</div>}
                  <div className="input-wrap">
                    <select value={mentorGender} onChange={(e) => setMentorGender(e.target.value)}
                      required className="am-select">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg btn-block"
                    disabled={
                      !signupFirstName.trim() || !signupLastName.trim() ||
                      !mentorEmail.trim() || !mentorPassword || !mentorContact.trim() || loading
                    }>
                    {loading ? 'Creating account…' : 'Create Mentor Account'}
                  </button>
                  <p className="am-terms">By continuing you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.</p>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
