import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import httpService from '../utils/apiService.tsx';

const STAR_PATH = 'M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.6 1-5.5-4-3.9 5.5-.8L12 3z';

function StarDisplay({ value, size = 22 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const full = value >= n;
        const half = !full && value >= n - 0.5;
        return (
          <div key={n} style={{ position: 'relative', width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d={STAR_PATH} fill="#E2E8F0" />
            </svg>
            {(full || half) && (
              <svg viewBox="0 0 24 24" width={size} height={size}
                style={{ position: 'absolute', top: 0, left: 0, clipPath: half ? 'inset(0 50% 0 0)' : undefined }}>
                <path d={STAR_PATH} fill="#FBBF24" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const SIZE = 42;

  return (
    <div style={{ display: 'flex', gap: 6 }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const full = display >= n;
        const half = !full && display >= n - 0.5;
        return (
          <div key={n} style={{ position: 'relative', width: SIZE, height: SIZE, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width={SIZE} height={SIZE} style={{ position: 'absolute', top: 0, left: 0, transition: 'filter .1s' }}
              filter={display >= n - 0.5 ? undefined : undefined}>
              <path d={STAR_PATH} fill="#E2E8F0" />
            </svg>
            {(full || half) && (
              <svg viewBox="0 0 24 24" width={SIZE} height={SIZE}
                style={{ position: 'absolute', top: 0, left: 0, clipPath: half ? 'inset(0 50% 0 0)' : undefined }}>
                <path d={STAR_PATH} fill="#FBBF24" />
              </svg>
            )}
            {/* left half → n - 0.5 */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', zIndex: 2 }}
              onMouseEnter={() => setHover(n - 0.5)}
              onClick={() => onChange(n - 0.5)} />
            {/* right half → n */}
            <div style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: '100%', zIndex: 2 }}
              onMouseEnter={() => setHover(n)}
              onClick={() => onChange(n)} />
          </div>
        );
      })}
    </div>
  );
}

function ratingLabel(r) {
  if (!r) return '';
  if (r >= 5)   return 'Excellent!';
  if (r >= 4.5) return 'Outstanding';
  if (r >= 4)   return 'Very Good';
  if (r >= 3.5) return 'Good';
  if (r >= 3)   return 'Average';
  if (r >= 2)   return 'Below Average';
  return 'Poor';
}

function fmtDate(str) {
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return str; }
}

export default function PlatformReviewView({ userId, reviewerType }) {
  const [existing,   setExisting]   = useState(null);
  const [rating,     setRating]     = useState(0);
  const [comment,    setComment]    = useState('');
  const [editing,    setEditing]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded,     setLoaded]     = useState(false);

  useEffect(() => { loadReview(); }, [userId]); // eslint-disable-line

  const loadReview = async () => {
    setLoaded(false);
    try {
      const res  = await httpService.get('/platformReview', { params: { userId }, token: true });
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
      const found = list.find(r =>
        String(r.userId) === String(userId) ||
        String(r.authUserId) === String(userId)
      );
      if (found && (found.id || found._id)) {
        setExisting(found);
        setRating(found.rating  || 0);
        setComment(found.comment || '');
      } else {
        setExisting(null);
        setRating(0);
        setComment('');
      }
    } catch {
      setExisting(null);
    } finally {
      setLoaded(true);
    }
  };

  const handleSubmit = async () => {
    if (!rating)         { toast.error('Please select a star rating.');  return; }
    if (!comment.trim()) { toast.error('Please add a comment.'); return; }
    setSubmitting(true);
    try {
      if (existing) {
        await httpService.put(`/platformReview/${existing.id || existing._id}`, {
          data: { rating, comment: comment.trim() },
          token: true,
        });
        toast.success('Review updated successfully!');
      } else {
        await httpService.post('/platformReview', {
          data: {
            reviewerType,
            userId,
            mentorAuthUserId: null,
            rating,
            comment: comment.trim(),
          },
          token: true,
        });
        toast.success('Thank you for your feedback!');
      }
      setEditing(false);
      await loadReview();
    } catch {}
    finally { setSubmitting(false); }
  };

  const startEdit = () => {
    if (existing) {
      setRating(existing.rating  || 0);
      setComment(existing.comment || '');
    }
    setEditing(true);
  };

  const showForm = !existing || editing;

  const TA_STYLE = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: 10,
    padding: '11px 13px', fontFamily: 'var(--font-body)', fontSize: 14,
    color: 'var(--ink)', boxSizing: 'border-box', outline: 'none',
    resize: 'vertical', lineHeight: 1.6, background: '#fff',
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── header ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
          Platform Review
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 5 }}>
          Share your experience using Mentor4Career
        </p>
      </div>

      {!loaded ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
      ) : (
        <>
          {/* ── existing review card (view mode) ── */}
          {existing && !editing && (
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 18, padding: '28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                    Your Review
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <StarDisplay value={existing.rating || 0} size={24} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#F59E0B', lineHeight: 1 }}>
                      {(existing.rating || 0).toFixed(1)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
                      {ratingLabel(existing.rating)}
                    </span>
                  </div>
                </div>

                <button onClick={startEdit}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--grad)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', boxShadow: 'var(--shadow-brand)', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Review
                </button>
              </div>

              <p style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.75, margin: 0, padding: '16px 20px', background: '#FAFBFF', borderRadius: 12, border: '1px solid #E0E7FF', fontStyle: 'italic' }}>
                "{existing.comment}"
              </p>

              {existing.createdAt && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12 }}>
                  Submitted on {fmtDate(existing.createdAt)}
                </div>
              )}
            </div>
          )}

          {/* ── create / edit form ── */}
          {showForm && (
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 18, padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>

              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', marginBottom: 4 }}>
                {existing ? 'Update Your Review' : 'Rate Your Experience'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 26 }}>
                {existing
                  ? 'Adjust your rating and update your comments below.'
                  : 'How has your experience been with Mentor4Career? Your honest feedback helps us grow.'}
              </div>

              {/* star rating input */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
                  Rating <span style={{ color: '#EF4444' }}>*</span>
                </div>
                <StarInput value={rating} onChange={setRating} />
                {rating > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: '#F59E0B', lineHeight: 1 }}>
                      {rating.toFixed(1)}
                    </span>
                    <span style={{ fontSize: 15, color: 'var(--ink-2)', fontWeight: 600 }}>{ratingLabel(rating)}</span>
                  </div>
                )}
              </div>

              {/* comment */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>
                  Comments <span style={{ color: '#EF4444' }}>*</span>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience — what you liked, what could be better, and how the platform helped you."
                  style={TA_STYLE}
                />
              </div>

              {/* action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSubmit}
                  disabled={submitting || !rating || !comment.trim()}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: (submitting || !rating || !comment.trim()) ? '#C7D2FE' : 'var(--grad)',
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                    cursor: (submitting || !rating || !comment.trim()) ? 'not-allowed' : 'pointer',
                    boxShadow: (!submitting && rating && comment.trim()) ? 'var(--shadow-brand)' : 'none',
                    transition: 'all .2s',
                  }}>
                  {submitting
                    ? (existing ? 'Updating…' : 'Submitting…')
                    : (existing ? 'Update Review' : 'Submit Review')}
                </button>

                {editing && (
                  <button onClick={() => setEditing(false)}
                    style={{ padding: '12px 22px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink-2)', cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* hint when no review yet */}
          {!existing && !editing && (
            <div style={{ marginTop: 18, padding: '14px 18px', background: '#F8FAFF', border: '1px solid #E0E7FF', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ color: '#4F46E5', flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                You haven't reviewed the platform yet. Your feedback is valuable and helps us improve!
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
