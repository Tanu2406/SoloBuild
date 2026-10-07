// ============================================================
// ScreeningReports — Index Page
// Route: /screening-reports
// Shows a hiring-oriented list of all campaigns with screening stats.
// Filters: All | Active | Completed | Needs Review | Recently Updated
// ============================================================

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Search, Users, CheckCircle2, Phone, Loader2,
  Star, ChevronRight, AlertCircle,
} from 'lucide-react';
import { HiringStatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAppStore } from '../store/appStore';
import {
  listCampaignCandidates,
  listCampaignDocumentScreenings,
  listCampaigns,
  mapCampaignCandidate,
} from '../services/campaignService';
import type { Hiring, Candidate } from '../types';

// ─── Per-hiring aggregated stats ─────────────────────────────
interface HiringReportSummary {
  hiring: Hiring;
  totalCandidates: number | null;
  resumeScreened: number | null;
  callScreened: number | null;
  strongMatches: number | null;
  needsReview: number | null;
  shortlisted: number | null;
  lastActivity: string;
}

function buildSummary(
  hiring: Hiring,
  candidates: Candidate[],
  candidatesLoaded: boolean,
  resumeScreened: number | null,
  strongMatches: number | null,
): HiringReportSummary {
  const hc = candidates;
  const callScreened = null;
  const needsReview = null;
  const shortlisted = null;

  // last activity: most recent lastActivityAt
  const lastActivity = hiring.updatedAt ? timeAgoFromIso(hiring.updatedAt) : 'No activity';

  return {
    hiring,
    totalCandidates: candidatesLoaded ? hc.length : null,
    resumeScreened,
    callScreened,
    strongMatches,
    needsReview,
    shortlisted,
    lastActivity,
  };
}

function timeAgoFromIso(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Filter config ────────────────────────────────────────────
type FilterId = 'all' | 'active' | 'completed' | 'needs_review' | 'recently_updated';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'needs_review', label: 'Needs Review' },
  { id: 'recently_updated', label: 'Recently Updated' },
];

function matchesFilter(s: HiringReportSummary, f: FilterId): boolean {
  if (f === 'all') return true;
  if (f === 'active') return ['calling', 'paused', 'ready', 'screening'].includes(s.hiring.status);
  if (f === 'completed') return s.hiring.status === 'completed';
  if (f === 'needs_review') return (s.needsReview ?? 0) > 0;
  if (f === 'recently_updated') {
    // updated in last 24h
    const diffMs = Date.now() - new Date(s.hiring.updatedAt).getTime();
    return diffMs < 24 * 3600 * 1000;
  }
  return true;
}

// ─── Main page ────────────────────────────────────────────────
const ScreeningReports: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppStore();

  const [summaries, setSummaries] = useState<HiringReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const campaigns = await listCampaigns();
      const results = await Promise.all(campaigns.map(async campaign => {
        const [candidateResult, screeningResult] = await Promise.allSettled([
          listCampaignCandidates(campaign.id),
          listCampaignDocumentScreenings(campaign.id),
        ]);
        return { campaign, candidateResult, screeningResult };
      }));
      if (cancelled) return;

      const warnings: string[] = [];
      const rows = results.map(({ campaign, candidateResult, screeningResult }) => {
        const hiring: Hiring = {
          id: campaign.id,
          title: campaign.title,
          location: '—',
          employmentType: 'full_time',
          status: screeningResult.status === 'fulfilled' &&
            screeningResult.value.some(item => item.match_score !== null) ? 'screened' : 'screening',
          candidateCount: 0,
          contacted: 0,
          connected: 0,
          interested: 0,
          shortlisted: 0,
          candidateIds: [],
          createdAt: campaign.created_at,
          backendCampaign: true,
          aiRecruiterId: campaign.agent_id || undefined,
          updatedAt: campaign.updated_at || campaign.created_at,
        };
        const apiCandidates = candidateResult.status === 'fulfilled' ? candidateResult.value : [];
        const screenings = screeningResult.status === 'fulfilled' ? screeningResult.value : [];
        if (candidateResult.status === 'rejected') {
          warnings.push(`${campaign.title}: candidate list failed${candidateResult.reason instanceof Error ? ` (${candidateResult.reason.message})` : ''}.`);
        }
        if (screeningResult.status === 'rejected') {
          warnings.push(`${campaign.title}: document screenings failed${screeningResult.reason instanceof Error ? ` (${screeningResult.reason.message})` : ''}.`);
        }
        const screeningByCandidateId = new Map(screenings.map(item => [item.candidate_id, item]));
        const mapped = apiCandidates.map(candidate =>
          mapCampaignCandidate(candidate, screeningByCandidateId.get(candidate.id), campaign.title),
        );
        if (candidateResult.status === 'fulfilled' && mapped.length > 0) {
          dispatch({ type: 'ADD_CANDIDATES', payload: { hiringId: campaign.id, candidates: mapped } });
        }
        const summary = buildSummary(
          hiring,
          mapped,
          candidateResult.status === 'fulfilled',
          screeningResult.status === 'fulfilled'
            ? screeningResult.value.filter(item => item.match_score !== null).length
            : null,
          screeningResult.status === 'fulfilled'
            ? screeningResult.value.filter(item => {
              if (item.match_score === null) return false;
              const score = item.match_score <= 1 ? item.match_score * 100 : item.match_score;
              return score >= 80;
            }).length
            : null,
        );
        return summary;
      });
      setSummaries(rows);
      setLoadError(warnings.join(' '));
      setLoading(false);
    };
    void load().catch(error => {
      if (cancelled) return;
      setLoadError(error instanceof Error ? error.message : 'Failed to load screening reports.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [dispatch]);

  const filtered = useMemo(() => {
    return summaries.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        s.hiring.title.toLowerCase().includes(q) ||
        s.hiring.location.toLowerCase().includes(q);
      return matchesSearch && matchesFilter(s, activeFilter);
    });
  }, [summaries, search, activeFilter]);

  // Aggregate header stats
  const totalCandidates = summaries.every(s => s.totalCandidates !== null)
    ? summaries.reduce((a, s) => a + (s.totalCandidates ?? 0), 0) : null;
  const totalResumeScreened = summaries.every(s => s.resumeScreened !== null)
    ? summaries.reduce((a, s) => a + (s.resumeScreened ?? 0), 0) : null;
  const totalCallScreened = null;
  const totalNeedsReview = null;

  return (
    <div className="page-content animate-fade-in">

      {/* ── Page header ── */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="page-header__text">
          <h1 className="page-header__title">Screening Reports</h1>
          <p className="page-header__subtitle">
            Resume-screening results across all campaigns.
          </p>
        </div>
      </div>

      {(loading || loadError) && (
        <div role={loadError ? 'alert' : 'status'} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
          marginBottom: '14px', borderRadius: 'var(--radius-md)',
          background: loadError ? 'var(--status-warning-bg)' : 'var(--bg-subtle)',
          color: loadError ? 'var(--status-warning-text)' : 'var(--text-secondary)',
          fontSize: 'var(--font-size-sm)',
        }}>
          {loading && <Loader2 size={14} className="spin" />}
          {loading ? 'Loading campaigns and screening results…' : loadError}
        </div>
      )}

      {/* ── Summary metric row ── */}
      <div className="metrics-row" style={{ marginBottom: '20px' }}>
        <div className="metric-tile">
          <div className="metric-tile__header"><span>TOTAL CANDIDATES</span></div>
          <div className="metric-tile__value">{totalCandidates ?? '—'}</div>
          <span className="metric-tile__sub">Across {summaries.length} campaigns</span>
        </div>
        <div className="metric-tile">
          <div className="metric-tile__header"><span>RESUME SCREENED</span></div>
          <div className="metric-tile__value">{totalResumeScreened ?? '—'}</div>
          <span className="metric-tile__sub">JD compatibility evaluated</span>
        </div>
        <div className="metric-tile">
          <div className="metric-tile__header"><span>CALL SCREENED</span></div>
          <div className="metric-tile__value">{totalCallScreened ?? '—'}</div>
          <span className="metric-tile__sub">Not available from campaign screening APIs</span>
        </div>
        <div className="metric-tile">
          <div className="metric-tile__header"><span>NEEDS REVIEW</span></div>
          <div className="metric-tile__value" style={{ color: totalNeedsReview !== null && totalNeedsReview > 0 ? 'var(--status-warning-text)' : undefined }}>
            {totalNeedsReview ?? '—'}
          </div>
          <span className="metric-tile__sub">Not available from campaign screening APIs</span>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', background: 'var(--bg-white)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          flex: 1, maxWidth: '320px',
        }}>
          <Search size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by campaign or role…"
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)',
              fontFamily: 'var(--font-family)', flex: 1,
            }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              disabled={f.id === 'completed' || f.id === 'needs_review'}
              title={f.id === 'completed' || f.id === 'needs_review'
                ? 'Campaign lifecycle and call-review data are not included in the available campaign APIs.'
                : undefined}
              style={{
                padding: '5px 14px', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)', fontWeight: 500,
                border: '1px solid',
                cursor: f.id === 'completed' || f.id === 'needs_review' ? 'not-allowed' : 'pointer',
                opacity: f.id === 'completed' || f.id === 'needs_review' ? 0.55 : 1,
                transition: 'all var(--transition-fast)',
                borderColor: activeFilter === f.id ? 'var(--brand-primary)' : 'var(--border-default)',
                background: activeFilter === f.id ? 'var(--brand-primary-light)' : 'var(--bg-white)',
                color: activeFilter === f.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
          {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Campaign list ── */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: 'var(--bg-white)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <FileText size={28} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            No campaigns match your filters
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Try adjusting the search or filter
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(s => (
            <HiringReportRow
              key={s.hiring.id}
              summary={s}
              onClick={() => navigate(`/screening-reports/${s.hiring.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Hiring row card ──────────────────────────────────────────
const HiringReportRow: React.FC<{
  summary: HiringReportSummary;
  onClick: () => void;
}> = ({ summary: s, onClick }) => {
  const { hiring } = s;

  return (
    <div
      onClick={onClick}
      className="table-container"
      style={{
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'box-shadow var(--transition-fast)',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
    >
      {/* Avatar */}
      <Avatar
        name={hiring.title}
        size="md"
        color="var(--brand-primary)"
      />

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {hiring.title}
          </span>
          <HiringStatusBadge status={hiring.status} />
          {s.needsReview !== null && s.needsReview > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '1px 8px', borderRadius: 'var(--radius-full)',
              fontSize: '10px', fontWeight: 700,
              background: 'var(--status-warning-bg)', color: 'var(--status-warning-text)',
              border: '1px solid var(--status-warning-border)',
            }}>
              <AlertCircle size={9} />
              {s.needsReview} needs review
            </span>
          )}
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '3px' }}>
          {hiring.location} · Last activity {s.lastActivity}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'flex', gap: '20px', flexShrink: 0, flexWrap: 'wrap' }}>
        <StatChip icon={<Users size={11} />} label="Candidates" value={s.totalCandidates} />
        <StatChip icon={<FileText size={11} />} label="Resume" value={s.resumeScreened} color="var(--brand-primary)" />
        <StatChip icon={<Phone size={11} />} label="Call" value={s.callScreened} color="var(--brand-primary)" />
        <StatChip icon={<Star size={11} />} label="Strong" value={s.strongMatches} color="var(--status-success-text)" />
        <StatChip icon={<CheckCircle2 size={11} />} label="Shortlisted" value={s.shortlisted} color="var(--status-success-text)" />
      </div>

      <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </div>
  );
};

const StatChip: React.FC<{ icon: React.ReactNode; label: string; value: number | null; color?: string }> = ({
  icon, label, value, color,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '44px' }}>
    <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: color ?? 'var(--text-primary)' }}>
      {value ?? '—'}
    </span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-tertiary)' }}>
      {icon}
      <span style={{ fontSize: '10px' }}>{label}</span>
    </div>
  </div>
);

export default ScreeningReports;
