import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import PageHero from '../components/PageHero.jsx';
import httpService from '../utils/apiService.tsx';
import { useAuth } from '../context/AuthContext.jsx';

const JOBSColor = [
  'linear-gradient(135deg,#4F46E5,#3B82F6)',
  'linear-gradient(135deg,#0FA968,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#7C5CF7,#EC4899)',
  'linear-gradient(135deg,#06B6D4,#3B82F6)',
  'linear-gradient(135deg,#4F46E5,#7C5CF7)',
];

function getLoggedInUserId() {
  try {
    const token = Cookies.get('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id ?? payload.userId ?? null;
  } catch { return null; }
}

/* ── Job Detail Modal ── */
function JobDetailModal({ job, applied, applying, onApply, onClose }) {
  if (!job) return null;

  const isApplied  = applied[job.id];
  const isApplying = applying[job.id];

  const meta = [
    { label: 'Company',    value: job.companyName },
    { label: 'Location',   value: job.location    },
    { label: 'Job Type',   value: job.jobType     },
    { label: 'Experience', value: job.experience != null ? `${job.experience} yr${job.experience !== 1 ? 's' : ''}` : null },
    { label: 'Openings',   value: job.openings    },
    { label: 'Posted',     value: job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
  ].filter(m => m.value != null && m.value !== '');

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--surface,#fff)', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90dvh', display: 'flex', flexDirection: 'column', boxShadow: '0 28px 72px rgba(0,0,0,0.22)', overflow: 'hidden' }}>

        {/* ── header ── */}
        <div style={{ background: job.col, padding: '22px 24px 18px', flexShrink: 0, position: 'relative' }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 20, display: 'grid', placeItems: 'center', lineHeight: 1 }}
          >
            ×
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff', flexShrink: 0, letterSpacing: 1 }}>
              {job.logo}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.2 }}>{job.title}</div>
              {job.tag && (
                <span style={{ display: 'inline-block', marginTop: 5, fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
                  {job.tag}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>

          {/* meta chips */}
          {meta.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {meta.map(m => (
                <div key={m.label} style={{ background: 'var(--surface-2,#f8fafc)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 10, padding: '6px 12px', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{m.label}: </span>
                  <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{m.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* skills */}
          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Required Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.skills.map(s => (
                  <span key={s} style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: 12.5, fontWeight: 600, padding: '4px 11px', borderRadius: 99 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* full JD */}
          {job.description && (
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Job Description
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                {job.description}
              </div>
            </div>
          )}
        </div>

        {/* ── sticky apply footer ── */}
        <div style={{ padding: '14px 24px 20px', borderTop: '1.5px solid var(--border,#e2e8f0)', flexShrink: 0, background: 'var(--surface,#fff)' }}>
          <button
            className={`btn ${isApplied ? 'btn-soft' : 'btn-primary'}`}
            onClick={() => onApply(job)}
            disabled={isApplying || isApplied}
            style={{ width: '100%', padding: '13px 0', fontSize: 15, fontWeight: 700 }}
          >
            {isApplying ? 'Applying…' : isApplied ? 'Applied ✓' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const { user, openAuth } = useAuth();
  const [data,       setdata]       = useState([]);
  const [filter,     setFilter]     = useState('all');
  const [applying,   setApplying]   = useState({});
  const [applied,    setApplied]    = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [viewJob,    setViewJob]    = useState(null);

  const JOBS = data?.filter(item => item.active === true || item.isActive === true).map((item, id) => ({
    id:          item.id,
    logo:        item?.position?.slice(0, 2),
    col:         JOBSColor[id % 6],
    title:       item?.position,
    tag:         item?.jobType,
    tagCol:      'blue',
    co:          `${item?.companyName} · ${item?.location}`,
    skills:      Array.isArray(item?.techStack) ? item.techStack : [],
    description: item?.description || item?.jobDescription || '',
    companyName: item?.companyName  || '',
    location:    item?.location     || '',
    jobType:     item?.jobType      || '',
    experience:  item?.experience   ?? null,
    openings:    item?.openings     ?? null,
    createdAt:   item?.createdAt    || null,
  }));

  const list = JOBS.filter((j) => filter === 'all' || (filter === 'intern' ? j.tag === 'Internship' : j.tag !== 'Internship'));

  const fetchjobs = async () => {
    try {
      const res = await httpService.get('/jobs', { token: true });
      setdata(res?.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchApplied = async () => {
    const userId = getLoggedInUserId();
    if (!userId) return;
    try {
      const res = await httpService.get('/jobsInterested', { token: true });
      let raw = res?.data ?? res ?? [];
      if (!Array.isArray(raw)) raw = [];
      const alreadyApplied = {};
      raw.filter(a => String(a.userId) === String(userId))
         .forEach(a => { alreadyApplied[a.jobId] = true; });
      setApplied(alreadyApplied);
    } catch {}
  };

  useEffect(() => {
    fetchjobs();
    fetchApplied();
  }, []);

  const handleApply = async (j) => {
    if (!user) {
      toast.info('Login to continue');
      openAuth('login');
      return;
    }
    if (user.role !== 'student' && user.role !== 'jobSeeker') {
      toast.error('Only students or job seekers can apply for jobs.');
      return;
    }
    if (applied[j.id]) return;
    const userId = getLoggedInUserId();
    setApplying(prev => ({ ...prev, [j.id]: true }));
    try {
      await httpService.post('/jobsInterested', {
        data: {
          jobId:       j.id,
          userId,
          applyDate:   new Date().toISOString(),
          isEmailSent: true,
          description: `Applied for ${j.title} position`,
        },
        token: true,
      });
      setApplied(prev => ({ ...prev, [j.id]: true }));
      toast.success('Application submitted successfully!');
    } catch {}
    finally {
      setApplying(prev => ({ ...prev, [j.id]: false }));
    }
  };

  return (
    <main id="top">
      <PageHero
        crumb="Jobs"
        eyebrow="Fresh This Week"
        title={<>Internships &amp; <span className="grad-text">fresher jobs</span> worth applying to</>}
        sub="Curated openings from companies that actively hire freshers. Apply and track every application in one place."
        stats={[{ v: '2,400+', l: 'Open Roles' }, { v: '600+', l: 'Hiring Companies' }, { v: '18k', l: 'Hires Made' }]}
      />

      <section className="section-pad" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="results-bar" style={{ marginBottom: 22 }}>
            <div className="chip-wrap" style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'all', l: 'All roles' }, { id: 'job', l: 'Full-time' }, { id: 'intern', l: 'Internships' }].map((f) => (
                <button key={f.id} className={'chip' + (filter === f.id ? ' active' : '')} onClick={() => setFilter(f.id)}>{f.l}</button>
              ))}
            </div>
            <div className="rb-count"><b>{list.length}</b> openings</div>
          </div>

          <div className="jobs-2col">
            {list?.map((j, i) => {
              const isExpanded = expandedId === j.id;
              return (
                <div className="card card-hover job-card" key={i} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
                  {/* top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div className="jc-logo" style={{ background: j.col, flexShrink: 0 }}>{j.logo}</div>
                    <div className="jc-main" style={{ flex: 1, minWidth: 0 }}>
                      <div className="jc-title">
                        {j.title}{' '}
                        {j.tag && (
                          <span className="jc-new" style={j.tagCol === 'blue' ? { color: 'var(--blue)', background: '#E5EEFE' } : undefined}>
                            {j.tag}
                          </span>
                        )}
                      </div>
                      <div className="jc-co">{j.co}</div>
                      <div className="jc-tags">
                        {j.skills.map((s) => <span className="kv" key={s}>{s}</span>)}
                      </div>
                    </div>
                    {/* action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
                      <button
                        className={`btn btn-sm ${applied[j.id] ? 'btn-soft' : 'btn-primary'}`}
                        onClick={() => handleApply(j)}
                        disabled={applying[j.id]}
                        style={{ minWidth: 76 }}
                      >
                        {applying[j.id] ? 'Applying…' : applied[j.id] ? 'Applied ✓' : 'Apply'}
                      </button>
                      <button
                        className="btn btn-soft btn-sm"
                        onClick={() => setViewJob(j)}
                        style={{ minWidth: 76 }}
                      >
                        View
                      </button>
                    </div>
                  </div>

                  {/* inline JD expand */}
                  {j.description && (
                    <>
                      {isExpanded && (
                        <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--surface-2,#f8fafc)', borderRadius: 10, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                          {j.description}
                        </div>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : j.id)}
                        style={{ alignSelf: 'flex-start', marginTop: 8, background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 600, color: 'var(--indigo,#4F46E5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {isExpanded ? 'Show less ▲' : 'Show more ▼'}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Job detail modal */}
      {viewJob && (
        <JobDetailModal
          job={viewJob}
          applied={applied}
          applying={applying}
          onApply={j => { handleApply(j); }}
          onClose={() => setViewJob(null)}
        />
      )}
    </main>
  );
}
