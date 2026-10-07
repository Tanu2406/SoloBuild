import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, CheckCircle2, Loader2, Sparkles, TrendingUp, X,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAppStore, useHiring, useRecruiters } from '../store/appStore';
import type { Candidate } from '../types';
import {
  getScreeningStatus,
  listCampaignCandidates,
  listCampaignDocumentScreenings,
  mapCampaignCandidate,
} from '../services/campaignService';
import type { ScreeningBatchStatus } from '../services/campaignService';

const ScreeningProgress: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dispatch } = useAppStore();
  const hiring = useHiring(id || '');
  const recruiters = useRecruiters();

  const requestedResumeCount = parseInt(searchParams.get('resumes') || '0', 10);
  const batchId = searchParams.get('batch_id');
  const missingBatchMessage = !id || !batchId
    ? 'This screening session is missing its campaign or batch ID.'
    : '';

  const [done, setDone] = useState(false);
  const [screenedCandidates, setScreenedCandidates] = useState<Candidate[]>([]);
  const [batchStatus, setBatchStatus] = useState<ScreeningBatchStatus | null>(null);
  const [error, setError] = useState('');

  const compatible = screenedCandidates.filter(c => c.compatibility === 'compatible');
  const incompatible = screenedCandidates.filter(c => c.compatibility === 'not_compatible');
  const resumeCount = done
    ? screenedCandidates.length
    : batchStatus?.total_candidates || requestedResumeCount;
  const screeningError = error || missingBatchMessage;

  useEffect(() => {
    if (!id || !batchId) return;

    let cancelled = false;
    let timer: number | undefined;

    const pollStatus = async () => {
      try {
        const status = await getScreeningStatus(id, batchId);
        if (cancelled) return;
        setBatchStatus(status);
        const normalizedStatus = status.status.toLowerCase();

        if (['failed', 'failure', 'error', 'cancelled', 'canceled'].includes(normalizedStatus)) {
          setError(`Screening ${normalizedStatus}${status.failed ? ` (${status.failed} candidate${status.failed === 1 ? '' : 's'} failed)` : ''}.`);
          return;
        }

        if (['completed', 'complete', 'success', 'succeeded', 'done'].includes(normalizedStatus)) {
          const [candidates, bulkScreenings] = await Promise.all([
            listCampaignCandidates(id),
            listCampaignDocumentScreenings(id),
          ]);
          const screeningByCandidate = new Map(
            bulkScreenings.map(screening => [screening.candidate_id, screening]),
          );
          if (cancelled) return;
          const mappedCandidates = candidates.map(candidate => mapCampaignCandidate(
            candidate,
            screeningByCandidate.get(candidate.id),
            hiring?.title ?? '',
          ));
          const results = mappedCandidates.filter(candidate =>
            candidate.documentScreeningId !== undefined || candidate.matchScore !== undefined
          );
          setScreenedCandidates(results);
          setDone(true);
          dispatch({ type: 'ADD_CANDIDATES', payload: { hiringId: id, candidates: mappedCandidates } });
          dispatch({
            type: 'UPDATE_HIRING',
            payload: { id, updates: { status: 'screened', resumeCount: results.length } },
          });
          dispatch({
            type: 'ADD_ACTIVITY',
            payload: {
              id: `act_sc_${Date.now()}`,
              type: 'screening_completed',
              hiringTitle: hiring?.title ?? '',
              description: `${results.length} resumes screened — ${results.filter(c => c.compatibility === 'compatible').length} compatible, ${results.filter(c => c.compatibility === 'not_compatible').length} not compatible`,
              timestamp: new Date().toISOString(),
              timeAgo: 'just now',
            },
          });
          return;
        }

        timer = window.setTimeout(() => { void pollStatus(); }, 1500);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve screening status.');
        }
      }
    };

    void pollStatus();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [id, batchId, requestedResumeCount, hiring?.title, dispatch]);

  const handleViewResults = () => {
    navigate(`/hiring/${id}?tab=screening`);
  };

  if (!hiring) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </div>
    );
  }

  const recruiter = recruiters.find(r => r.id === hiring.aiRecruiterId);

  return (
    <div className="screening-progress-page">
      <div className="sp-panel">
        {/* Header */}
        <div className="sp-header">
          <div className="sp-header__icon">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="sp-header__title">AI Resume Screening</h1>
            <p className="sp-header__sub">{hiring.title} · {hiring.location}</p>
          </div>
        </div>

        {/* Recruiter badge */}
        {recruiter && (
          <div className="sp-recruiter-badge">
            <Avatar name={recruiter.name} size="sm" color={recruiter.avatarColor} />
            <span>{recruiter.name} is assigned to this campaign</span>
          </div>
        )}

        {/* Backend screening status */}
        {!done && !screeningError && (
          <div className="sp-counter">
            <Loader2 size={16} className="spin" style={{ color: 'var(--brand-primary)' }} />
            <span>
              Screening status: <strong>{batchStatus?.status ?? 'Starting'}</strong>
              {batchStatus && ` · ${batchStatus.processed} of ${batchStatus.total_candidates} candidates processed`}
            </span>
          </div>
        )}

        {screeningError && (
          <div className="sp-error" role="alert">
            <AlertCircle size={16} />
            <span>{screeningError}</span>
          </div>
        )}

        {/* Results summary */}
        {done && (
          <div className="sp-results animate-fade-in">
            <div className="sp-results__summary">
              <div className="sp-results__total">
                <span className="sp-results__num">{resumeCount}</span>
                <span className="sp-results__lbl">Resumes Screened</span>
              </div>
              <div className="sp-results__split">
                <div className="sp-results__compatible">
                  <CheckCircle2 size={16} />
                  <span className="sp-results__split-num">{compatible.length}</span>
                  <span className="sp-results__split-lbl">Compatible</span>
                </div>
                <div className="sp-results__incompatible">
                  <X size={16} />
                  <span className="sp-results__split-num">{incompatible.length}</span>
                  <span className="sp-results__split-lbl">Not Compatible</span>
                </div>
              </div>
            </div>

            {/* Top compatible preview */}
            <div className="sp-top-candidates">
              <p className="sp-top-candidates__label">
                <TrendingUp size={13} /> Top compatible candidates
              </p>
              {compatible.slice(0, 3).map(c => (
                <div key={c.id} className="sp-top-candidate">
                  <Avatar name={c.name} size="sm" color="var(--brand-primary)" />
                  <div className="sp-top-candidate__info">
                    <span className="sp-top-candidate__name">{c.name}</span>
                    <span className="sp-top-candidate__exp">
                      {[c.experience, c.education].filter(Boolean).join(' · ') || c.email || 'Candidate'}
                    </span>
                  </div>
                  <div className="sp-top-candidate__score" style={{
                    color: (c.matchScore || 0) >= 80 ? 'var(--status-success-text)' : 'var(--brand-primary)',
                    background: (c.matchScore || 0) >= 80 ? 'var(--status-success-bg)' : 'var(--brand-primary-light)',
                  }}>
                    {c.matchScore}%
                  </div>
                </div>
              ))}
              {compatible.length > 3 && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'center', padding: '4px 0' }}>
                  +{compatible.length - 3} more compatible candidates
                </p>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              iconRight={<ChevronRight size={16} />}
              onClick={handleViewResults}
            >
              View Screening Results in Workspace
            </Button>
          </div>
        )}
      </div>

      {injectScreeningStyles()}
    </div>
  );
};

function injectScreeningStyles() {
  if (typeof document !== 'undefined' && !document.getElementById('sp-styles')) {
    const s = document.createElement('style');
    s.id = 'sp-styles';
    s.textContent = `
.screening-progress-page {
  min-height: 100vh;
  background: var(--bg-app);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 24px 40px;
}
.sp-panel {
  width: 100%;
  max-width: 560px;
  background: var(--bg-white);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sp-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.sp-header__icon {
  width: 48px; height: 48px; border-radius: var(--radius-lg);
  background: var(--brand-primary); color: white;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sp-header__title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}
.sp-header__sub {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: 2px;
}
.sp-recruiter-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: 500;
  width: fit-content;
}
.sp-counter {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--font-size-sm); color: var(--text-secondary);
  padding: 10px 14px; background: var(--bg-subtle);
  border-radius: var(--radius-md);
}
.sp-error {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 12px 14px; background: var(--status-error-bg);
  border: 1px solid var(--status-error-border); border-radius: var(--radius-md);
  font-size: var(--font-size-sm); color: var(--status-error-text); line-height: 1.5;
}
.sp-results {
  display: flex; flex-direction: column; gap: 16px;
}
.sp-results__summary {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
}
.sp-results__total {
  display: flex; flex-direction: column; align-items: center;
  min-width: 80px; border-right: 1px solid var(--border-default);
  padding-right: 16px;
}
.sp-results__num { font-size: 28px; font-weight: 800; color: var(--text-primary); line-height: 1; }
.sp-results__lbl { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
.sp-results__split { display: flex; gap: 20px; flex: 1; justify-content: center; }
.sp-results__compatible, .sp-results__incompatible {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.sp-results__compatible { color: var(--status-success-text); }
.sp-results__incompatible { color: var(--status-error-text); }
.sp-results__split-num { font-size: 22px; font-weight: 700; }
.sp-results__split-lbl { font-size: 11px; font-weight: 500; }
.sp-top-candidates {
  background: var(--bg-white);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.sp-top-candidates__label {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--font-size-xs); font-weight: 700; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.05em;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-subtle);
}
.sp-top-candidate {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
}
.sp-top-candidate:last-child { border-bottom: none; }
.sp-top-candidate__info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.sp-top-candidate__name { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
.sp-top-candidate__exp { font-size: var(--font-size-xs); color: var(--text-secondary); }
.sp-top-candidate__score {
  font-size: var(--font-size-xs); font-weight: 700;
  padding: 3px 8px; border-radius: var(--radius-full);
}
    `;
    document.head.appendChild(s);
  }
  return null;
}

export default ScreeningProgress;
