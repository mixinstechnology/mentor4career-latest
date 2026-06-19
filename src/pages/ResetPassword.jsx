import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Logo } from '../components/Icons.jsx';
import httpService from '../utils/apiService.tsx';

/* ── styles (self-contained) ── */
const RP_STYLES = `
  .rp-page {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #EFF6FF 100%);
    padding: 24px 16px;
  }
  .rp-card {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(79,70,229,.13), 0 4px 16px rgba(0,0,0,.06);
    padding: 36px 32px 40px;
    width: 100%;
    max-width: 430px;
    animation: rpIn .32s cubic-bezier(.34,1.3,.64,1) both;
  }
  @keyframes rpIn {
    from { opacity: 0; transform: translateY(22px) scale(.97); }
    to   { opacity: 1; transform: none; }
  }
  .rp-strength-track {
    height: 5px;
    border-radius: 99px;
    background: #F1F5F9;
    overflow: hidden;
    margin-top: 8px;
  }
  .rp-strength-fill {
    height: 100%;
    border-radius: 99px;
    transition: width .38s cubic-bezier(.34,1.3,.64,1), background .25s;
  }
  .rp-req {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: #94A3B8;
    transition: color .2s;
    line-height: 1.4;
  }
  .rp-req.ok { color: #16a34a; }
  .rp-req-dot {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    border: 1.5px solid #CBD5E1;
    background: #fff;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: background .2s, border-color .2s, transform .2s;
  }
  .rp-req.ok .rp-req-dot {
    background: #22c55e;
    border-color: #22c55e;
    transform: scale(1.08);
  }
  .rp-match {
    font-size: 12.5px;
    font-weight: 600;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color .2s;
  }
  .input-wrap.rp-valid input {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 4px rgba(34,197,94,.1) !important;
  }
  .input-wrap.rp-invalid input {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 4px rgba(239,68,68,.1) !important;
  }
  @keyframes rpSpin { to { transform: rotate(360deg); } }
`;

/* ── password strength ── */
function getStrength(pw) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { label: 'Weak',   color: '#ef4444', pct: 25  };
  if (s <= 2) return { label: 'Fair',   color: '#f59e0b', pct: 50  };
  if (s <= 3) return { label: 'Good',   color: '#3b82f6', pct: 75  };
  return              { label: 'Strong', color: '#22c55e', pct: 100 };
}

const REQS = [
  { id: 'len', label: 'At least 6 characters', check: pw => pw.length >= 6 },
  { id: 'up',  label: 'One uppercase letter',  check: pw => /[A-Z]/.test(pw) },
  { id: 'num', label: 'One number',            check: pw => /[0-9]/.test(pw) },
];

/* ── eye toggle ── */
const EyeBtn = ({ shown, onClick }) => (
  <button type="button" className={`pw-toggle${shown ? ' active' : ''}`}
    onClick={onClick} aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}>
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
      {shown ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M1 12s3.5-7 11-7 11 7 11 7-3.5 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="1.7"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/>
        </>
      )}
    </svg>
  </button>
);

/* ── brand header ── */
function Brand() {
  return (
    <div className="am-brand">
      <span className="am-brand-icon"><Logo width="20" height="20" /></span>
      <div>
        <div className="am-brand-name">Mentor<span>4Career</span></div>
        <div className="am-brand-tagline">Your career, guided.</div>
      </div>
    </div>
  );
}

/* ── main component ── */
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const urlToken       = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  const strength   = getStrength(newPassword);
  const isMatch    = confirmPw.length > 0 && newPassword === confirmPw;
  const isMismatch = confirmPw.length > 0 && newPassword !== confirmPw;
  const canSubmit  = newPassword.length >= 6 && isMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPw) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6)   { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await httpService.post(`/authUser/reset-password?token=${encodeURIComponent(urlToken)}`, {
        data: { token: urlToken, password: newPassword },
        token: false,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Password reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{RP_STYLES}</style>

      {/* ── invalid token ── */}
      {!urlToken && (
        <div className="rp-page">
          <div className="rp-card">
            <Brand />
            <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                <svg viewBox="0 0 24 24" fill="none" width="34" height="34">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.8"/>
                  <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>Invalid reset link</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                This password reset link is missing or invalid. Please request a new one.
              </p>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        </div>
      )}

      {/* ── success ── */}
      {urlToken && success && (
        <div className="rp-page">
          <div className="rp-card">
            <Brand />
            <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,.35)' }}>
                <svg viewBox="0 0 24 24" fill="none" width="34" height="34">
                  <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>Password updated!</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/')}>Go to Login</button>
            </div>
          </div>
        </div>
      )}

      {/* ── form ── */}
      {urlToken && !success && (
        <div className="rp-page">
          <div className="rp-card">
            <Brand />

            <h2 style={{ margin: '28px 0 4px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>
              Reset your password
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Enter a new secure password for your account.
            </p>

            {error && <div className="am-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* ── new password ── */}
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                New Password
              </label>
              <div className="input-wrap">
                <Lock width="24" height="24" />
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(''); }}
                  required
                  autoFocus
                />
                <EyeBtn shown={showNew} onClick={() => setShowNew(v => !v)} />
              </div>

              {/* strength bar */}
              {newPassword.length > 0 && strength && (
                <div style={{ marginTop: 10, marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Password strength</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: strength.color, transition: 'color .25s' }}>{strength.label}</span>
                  </div>
                  <div className="rp-strength-track">
                    <div className="rp-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
                  </div>
                </div>
              )}

              {/* requirements checklist */}
              {newPassword.length > 0 && (
                <div style={{ margin: '10px 0 18px', padding: '12px 14px', background: '#F8FAFF', border: '1px solid #E8ECFF', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {REQS.map(r => {
                    const ok = r.check(newPassword);
                    return (
                      <div key={r.id} className={`rp-req${ok ? ' ok' : ''}`}>
                        <span className="rp-req-dot">
                          {ok && (
                            <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
                              <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        {r.label}
                      </div>
                    );
                  })}
                </div>
              )}

              {newPassword.length === 0 && <div style={{ marginBottom: 18 }} />}

              {/* ── confirm password ── */}
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                Confirm Password
              </label>
              <div className={`input-wrap${isMatch ? ' rp-valid' : isMismatch ? ' rp-invalid' : ''}`}>
                <Lock width="24" height="24" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Verify password"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setError(''); }}
                  required
                />
                <EyeBtn shown={showConfirm} onClick={() => setShowConfirm(v => !v)} />
              </div>

              {/* match indicator */}
              {confirmPw.length > 0 && (
                <div className="rp-match" style={{ color: isMatch ? '#16a34a' : '#dc2626' }}>
                  {isMatch ? (
                    <>
                      <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                        <circle cx="8" cy="8" r="7.5" fill="#22c55e"/>
                        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Passwords match
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                        <circle cx="8" cy="8" r="7.5" fill="#ef4444"/>
                        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                      Passwords don't match
                    </>
                  )}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                style={{ marginTop: 24 }}
                disabled={!canSubmit}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      style={{ animation: 'rpSpin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.3)" strokeWidth="2.5"/>
                      <path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    Resetting…
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-3)' }}>
              Remember it?{' '}
              <button type="button" onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 13 }}>
                Back to Login
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
