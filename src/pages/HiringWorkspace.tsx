import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Pause, Play, MapPin, Calendar,
  Download, Sparkles, CheckCircle2,
  Filter, Phone, Users, AlertTriangle, FileSearch, Star,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { HiringStatusBadge, CandidateStatusBadge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CandidateFunnel } from '../components/product/CandidateFunnel';
import { ActivityItemComponent } from '../components/product/ActivityItem';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, type Column } from '../components/ui/DataTable';
import { CandidateDrawer } from '../components/product/CandidateDrawer';
import { DialerModal } from '../components/product/DialerModal';
import { ScheduleInterviewModal } from '../components/product/ScheduleInterviewModal';
import {
  useAppStore,
  useHiring,
  useHiringCandidates,
  useActivity,
  useRecruiters,
  useCalls,
} from '../store/appStore';
import { callSimulationService } from '../services/callSimulationService';
import {
  listCampaignCandidates,
  listCampaignDocumentScreenings,
  listCampaigns,
  mapCampaignCandidate,
} from '../services/campaignService';
import { LANG_ARRAY_FROM_API, listAgents } from '../services/agentService';
import { useToast } from '../components/ui/Toast';
import type { Candidate, Call } from '../types';

type WorkspaceTab = 'overview' | 'screening' | 'candidates' | 'calls' | 'results';

const HiringWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { state, dispatch } = useAppStore();

  // Honour ?tab=screening coming from ScreeningProgress redirect
  const initialTab = (searchParams.get('tab') as WorkspaceTab) || 'overview';
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [candidateFilter, setCandidateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Screening tab local filter
  const [screeningFilter, setScreeningFilter] = useState<'all' | 'compatible' | 'not_compatible'>('all');
  const [screeningSearch, setScreeningSearch] = useState('');
  const [includedOverrides, setIncludedOverrides] = useState<Record<string, boolean>>({});

  // Drawer / Modal states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialerCandidate, setDialerCandidate] = useState<{ phone: string; name?: string } | null>(null);
  const [scheduleCandidate, setScheduleCandidate] = useState<Candidate | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const hiring = useHiring(id || '');
  const hiringRef = useRef(hiring);
  const candidates = useHiringCandidates(id || '');
  const allActivity = useActivity();
  const recruiters = useRecruiters();
  const allCalls = useCalls();
  const [campaignDataLoading, setCampaignDataLoading] = useState(false);
  const [campaignDataError, setCampaignDataError] = useState('');

  useEffect(() => {
    hiringRef.current = hiring;
  }, [hiring]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setCampaignDataLoading(true);
    setCampaignDataError('');

    const loadCampaignData = async () => {
      const [campaignsResult, candidatesResult, screeningsResult, agentsResult] = await Promise.allSettled([
        listCampaigns(),
        listCampaignCandidates(id),
        listCampaignDocumentScreenings(id),
        listAgents(),
      ]);
      if (cancelled) return;

      const loadErrors: string[] = [];
      const campaign = campaignsResult.status === 'fulfilled'
        ? campaignsResult.value.find(item => item.id === id)
        : undefined;
      if (campaignsResult.status === 'rejected') {
        loadErrors.push(campaignsResult.reason instanceof Error
          ? `Campaign details: ${campaignsResult.reason.message}`
          : 'Campaign details could not be loaded.');
      }

      if (agentsResult.status === 'fulfilled') {
        const colors = ['#2563eb', '#0891b2', '#7c3aed', '#059669', '#dc2626', '#d97706'];
        agentsResult.value.forEach((agent, index) => {
          const agentData = {
            id: agent.id,
            name: agent.name,
            description: `${agent.conversation_style} tone.`,
            languages: LANG_ARRAY_FROM_API[agent.languages] ?? ['English'],
            voice: agent.voice,
            conversationStyle: agent.conversation_style,
            interviewInstructions: agent.interview_instruction,
            avatarInitial: agent.name[0]?.toUpperCase() ?? 'A',
            avatarColor: colors[index % colors.length],
          };
          dispatch({ type: 'CREATE_RECRUITER', payload: agentData });
        });
      } else {
        loadErrors.push(agentsResult.reason instanceof Error
          ? `AI agent details: ${agentsResult.reason.message}`
          : 'AI agent details could not be loaded.');
      }

      if (campaign) {
        const currentHiring = hiringRef.current;
        if (currentHiring) {
          dispatch({
            type: 'UPDATE_HIRING',
            payload: {
              id,
              updates: {
                title: campaign.title,
                ...(campaign.agent_id ? { aiRecruiterId: campaign.agent_id } : {}),
                createdAt: campaign.created_at,
              },
            },
          });
        } else {
          const now = new Date().toISOString();
          dispatch({
            type: 'CREATE_HIRING',
            payload: {
              id,
              title: campaign.title,
              location: 'Not set',
              employmentType: 'full_time',
              status: 'screening',
              ...(campaign.agent_id ? { aiRecruiterId: campaign.agent_id } : {}),
              candidateIds: [],
              candidateCount: 0,
              contacted: 0,
              connected: 0,
              interested: 0,
              shortlisted: 0,
              createdAt: campaign.created_at || now,
              updatedAt: campaign.updated_at || now,
            },
          });
        }
      } else if (campaignsResult.status === 'fulfilled' && !hiringRef.current) {
        loadErrors.push('This campaign was not found in the campaigns list.');
      }

      if (candidatesResult.status === 'fulfilled') {
        const screenings = screeningsResult.status === 'fulfilled' ? screeningsResult.value : [];
        if (screeningsResult.status === 'rejected') {
          loadErrors.push(screeningsResult.reason instanceof Error
            ? `Document screening results: ${screeningsResult.reason.message}`
            : 'Document screening results could not be loaded.');
        }
        const screeningsByCandidate = new Map(
          screenings.map(screening => [screening.candidate_id, screening]),
        );
        const mapped = candidatesResult.value.map(candidate =>
          mapCampaignCandidate(
            candidate,
            screeningsByCandidate.get(candidate.id),
            campaign?.title ?? hiringRef.current?.title ?? '',
          ),
        );
        dispatch({ type: 'ADD_CANDIDATES', payload: { hiringId: id, candidates: mapped } });
        if (mapped.length > 0 && mapped.every(candidate => candidate.matchScore !== undefined)) {
          dispatch({
            type: 'UPDATE_HIRING',
            payload: { id, updates: { status: 'screened', resumeCount: mapped.length } },
          });
        }
      } else {
        loadErrors.push(candidatesResult.reason instanceof Error
          ? `Campaign candidates: ${candidatesResult.reason.message}`
          : 'Campaign candidates could not be loaded.');
      }

      if (!cancelled && loadErrors.length > 0) {
        setCampaignDataError(loadErrors.join(' '));
      }
      if (!cancelled) setCampaignDataLoading(false);
    };

    void loadCampaignData().catch(err => {
      if (cancelled) return;
      setCampaignDataError(err instanceof Error ? err.message : 'Failed to load campaign data.');
      setCampaignDataLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id, dispatch]);

  // Auto-start simulation when workspace opens for calling hirings
  useEffect(() => {
    if (
      hiring &&
      (hiring.status === 'calling' || hiring.status === 'ready') &&
      !callSimulationService.isRunning(hiring.id)
    ) {
      const hasPending = candidates.some(c => c.status === 'added' || c.status === 'calling');
      if (hasPending) {
        dispatch({ type: 'UPDATE_HIRING', payload: { id: hiring.id, updates: { status: 'calling' } } });
        callSimulationService.start(hiring.id, state, dispatch, 350);
      }
    }
  }, [hiring?.id]);

  if (!hiring) {
    return (
      <div className="page-content">
        <EmptyState
          title="Hiring not found"
          description="This hiring campaign may have been deleted."
          action={{ label: 'Back to Hiring', onClick: () => navigate('/hiring') }}
        />
      </div>
    );
  }

  const recruiter = recruiters.find(r => r.id === hiring.aiRecruiterId);
  const hiringActivity = allActivity.filter(a => a.hiringTitle === hiring.title).slice(0, 20);
  const hiringCalls = allCalls.filter(c => c.hiringId === hiring.id);
  const screenedCandidates = candidates.filter(c =>
    c.documentScreeningId !== undefined || c.matchScore !== undefined
  );
  const pendingScreeningCount = candidates.length - screenedCandidates.length;
  const shortlistedCandidates = candidates.filter(c =>
    ['shortlisted', 'interview_scheduled', 'interview_completed', 'hired'].includes(c.status)
  );
  const hasScreeningData = screenedCandidates.length > 0;

  // ——— Screening tab helpers ———
  const compatibleCandidates = screenedCandidates.filter(c => c.compatibility === 'compatible');
  const notCompatibleCandidates = screenedCandidates.filter(c => c.compatibility === 'not_compatible');
  const screeningFiltered = screenedCandidates.filter(c => {
    const matchesFilter =
      screeningFilter === 'all' ||
      c.compatibility === screeningFilter;
    const q = screeningSearch.toLowerCase();
    const matchesSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      (c.skills || []).some(s => s.toLowerCase().includes(q)) ||
      (c.experience || '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const isIncluded = (c: Candidate) => {
    if (c.id in includedOverrides) return includedOverrides[c.id];
    return c.includedInCallList ?? c.compatibility === 'compatible';
  };

  const toggleIncluded = (c: Candidate) => {
    setIncludedOverrides(prev => ({ ...prev, [c.id]: !isIncluded(c) }));
    showToast(
      isIncluded(c)
        ? `${c.name} removed from calling list`
        : `${c.name} added to calling list`,
      'info'
    );
  };

  const handleStartCallingFromScreening = () => {
    const included = candidates.filter(c => isIncluded(c));
    if (included.length === 0) {
      showToast('No candidates included in calling list', 'error');
      return;
    }
    // Mark all included candidates as 'added' (queued for calling)
    included.forEach(c => {
      if (c.status === 'added' || c.compatibility === 'compatible') {
        dispatch({ type: 'UPDATE_CANDIDATE', payload: { id: c.id, updates: { status: 'added', includedInCallList: true } } });
      }
    });
    dispatch({ type: 'UPDATE_HIRING', payload: { id: hiring.id, updates: { status: 'calling' } } });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: `act_launch_${Date.now()}`,
        type: 'hiring_launched',
        hiringTitle: hiring.title,
        description: `${hiring.title} — ${recruiter?.name || 'AI Recruiter'} started calling ${included.length} compatible candidates`,
        timestamp: new Date().toISOString(),
        timeAgo: 'just now',
      },
    });
    showToast(`Calling started for ${included.length} candidates`, 'success');
    setActiveTab('candidates');
    setTimeout(() => {
      callSimulationService.start(hiring.id, state, dispatch, 350);
    }, 300);
  };

  // ——— Actions ———
  const handlePauseToggle = () => {
    if (hiring.status === 'calling') {
      callSimulationService.pause(hiring.id, dispatch, hiring.title);
      showToast('Calling paused', 'info');
    } else if (hiring.status === 'paused') {
      callSimulationService.resume(hiring.id, state, dispatch, hiring.title);
      showToast('Calling resumed', 'success');
    }
  };

  const handleOpenCandidate = (cand: Candidate) => {
    setSelectedCandidate(cand);
    setDrawerOpen(true);
  };

  const handleCallAgain = (cand: Candidate) => {
    setDrawerOpen(false);
    setDialerCandidate({ phone: cand.phone, name: cand.name });
    setDialerOpen(true);
  };

  const handleScheduleInterview = (cand: Candidate) => {
    setDrawerOpen(false);
    setScheduleCandidate(cand);
    setScheduleOpen(true);
  };

  const handleBulkShortlist = () => {
    selectedIds.forEach(candId => {
      dispatch({ type: 'UPDATE_CANDIDATE', payload: { id: candId, updates: { status: 'shortlisted' } } });
    });
    showToast(`${selectedIds.length} candidate(s) shortlisted`, 'success');
    setSelectedIds([]);
  };

  const handleBulkDisqualify = () => {
    selectedIds.forEach(candId => {
      dispatch({ type: 'UPDATE_CANDIDATE', payload: { id: candId, updates: { status: 'not_interested' } } });
    });
    showToast(`${selectedIds.length} candidate(s) marked not interested`, 'info');
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const exportData = candidates.filter(c => selectedIds.length === 0 || selectedIds.includes(c.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Phone,Email,Status,Experience,Location,Call Duration,Match Score,Summary']
        .concat(exportData.map(c =>
          `"${c.name}","${c.phone}","${c.email || ''}","${c.status}","${c.experience || ''}","${c.location || ''}","${c.callDuration || ''}","${c.matchScore || ''}","${(c.aiSummary || '').replace(/"/g, '""')}"`
        )).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${hiring.title.replace(/\s+/g, '_')}_candidates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${exportData.length} candidates`, 'success');
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesFilter =
      candidateFilter === 'liked'
        ? !!c.isFavorite
        : candidateFilter === 'all' || c.status === candidateFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ——— Tab config ———
  const canPause = hiring.status === 'calling' || hiring.status === 'paused';

  const workspaceTabs = [
    { id: 'overview',   label: 'Overview' },
    ...(hasScreeningData ? [{ id: 'screening', label: 'Screening Results', count: screenedCandidates.length }] : []),
    { id: 'candidates', label: 'Candidates', count: candidates.length },
    { id: 'calls',      label: 'Call Logs',  count: hiringCalls.length },
    { id: 'results',    label: 'Shortlist & Decisions', count: shortlistedCandidates.length },
  ];

  // ——— Column definitions ———
  const candidateColumns: Column<Candidate>[] = [
    {
      key: 'name', header: 'Candidate', sortable: true,
      render: (c: Candidate) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar name={c.name} size="sm" color="var(--brand-primary)" />
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{c.name}</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{c.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (c: Candidate) => <CandidateStatusBadge status={c.status} />,
    },
    {
      key: 'experience', header: 'Experience',
      render: (c: Candidate) => c.experience || '—',
    },
    {
      key: 'callDuration', header: 'Call Time',
      render: (c: Candidate) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
          {c.callDuration || '—'}
        </span>
      ),
    },
    {
      key: 'lastActivity', header: 'Last Contact',
      render: (c: Candidate) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
          {c.lastActivity || '—'}
        </span>
      ),
    },
    {
      key: 'isFavorite', header: 'Liked Profile',
      render: (c: Candidate) => (
        <button
          onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: c.id }); }}
          title={c.isFavorite ? 'Remove from favourites' : 'Mark as favourite'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '2px', display: 'flex', alignItems: 'center',
            color: c.isFavorite ? '#f59e0b' : 'var(--text-muted)',
            transition: 'color 120ms',
          }}
          onMouseEnter={e => { if (!c.isFavorite) (e.currentTarget as HTMLButtonElement).style.color = '#fbbf24'; }}
          onMouseLeave={e => { if (!c.isFavorite) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          <Star size={15} fill={c.isFavorite ? '#f59e0b' : 'none'} strokeWidth={1.75} />
        </button>
      ),
    },
    {
      key: 'actions', header: 'Action', align: 'right',
      render: (c: Candidate) => (
        <div style={{ display: 'inline-flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => handleOpenCandidate(c)}>Inspect</Button>
          {(c.status === 'shortlisted' || c.status === 'interested') && (
            <Button variant="outline" size="sm" icon={<Calendar size={13} />}
              onClick={() => handleScheduleInterview(c)}>
              Schedule
            </Button>
          )}
          <Button variant="ghost" size="sm" icon={<FileSearch size={12} />}
            onClick={() => navigate(`/screening-reports/${hiring.id}/candidate/${c.id}`)}>
            Report
          </Button>
        </div>
      ),
    },
  ];

  const callColumns: Column<Call>[] = [
    {
      key: 'candidateName', header: 'Candidate',
      render: (call: Call) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar name={call.candidateName} size="sm" color="var(--brand-primary)" />
          <span style={{ fontWeight: 600 }}>{call.candidateName}</span>
        </div>
      ),
    },
    {
      key: 'outcome', header: 'Outcome',
      render: (call: Call) => <CandidateStatusBadge status={call.outcome || 'contacted'} />,
    },
    { key: 'duration', header: 'Duration', render: (call: Call) => call.duration || '—' },
    {
      key: 'timeAgo', header: 'Time',
      render: (call: Call) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{call.timeAgo}</span>
      ),
    },
    {
      key: 'aiSummary', header: 'AI Summary',
      render: (call: Call) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: 'block', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {call.aiSummary || '—'}
        </span>
      ),
    },
    {
      key: 'isFavorite', header: 'Liked Profile',
      render: (call: Call) => {
        const cand = candidates.find(c => c.id === call.candidateId);
        if (!cand) return null;
        return (
          <button
            onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: cand.id }); }}
            title={cand.isFavorite ? 'Remove from favourites' : 'Mark as favourite'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px', display: 'flex', alignItems: 'center',
              color: cand.isFavorite ? '#f59e0b' : 'var(--text-muted)',
              transition: 'color 120ms',
            }}
            onMouseEnter={e => { if (!cand.isFavorite) (e.currentTarget as HTMLButtonElement).style.color = '#fbbf24'; }}
            onMouseLeave={e => { if (!cand.isFavorite) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <Star size={15} fill={cand.isFavorite ? '#f59e0b' : 'none'} strokeWidth={1.75} />
          </button>
        );
      },
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (call: Call) => {
        const cand = candidates.find(c => c.id === call.candidateId);
        return <Button variant="ghost" size="sm" onClick={() => cand && handleOpenCandidate(cand)}>Review</Button>;
      },
    },
  ];

  const scoreColor = (score: number) =>
    score >= 80 ? 'var(--status-success-text)' : score >= 60 ? 'var(--brand-primary)' : 'var(--status-error-text)';
  const scoreBg = (score: number) =>
    score >= 80 ? 'var(--status-success-bg)' : score >= 60 ? 'var(--brand-primary-light)' : 'var(--status-error-bg)';

  return (
    <div className="page-content animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/hiring')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
        <ArrowLeft size={14} /> Back to All Hirings
      </button>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div className="page-header__text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="page-header__title">{hiring.title}</h1>
            <HiringStatusBadge status={hiring.status} />
          </div>
          <div className="page-header__subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> {hiring.location}
            </span>
            <span>·</span>
            <span>{hiring.candidateCount} candidate pool</span>
            {hiring.resumeCount && <><span>·</span><span>{hiring.resumeCount} resumes screened</span></>}
            <span>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> Created {new Date(hiring.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="page-header__actions">
          {canPause && (
            <Button
              variant={hiring.status === 'calling' ? 'secondary' : 'primary'}
              icon={hiring.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}
              onClick={handlePauseToggle}
            >
              {hiring.status === 'paused' ? 'Resume Calling' : 'Pause Calling'}
            </Button>
          )}
          <Button variant="outline" icon={<Download size={14} />} onClick={handleExportCSV}>
            Export Pipeline
          </Button>
        </div>
      </div>

      {(campaignDataLoading || campaignDataError) && (
        <div
          role={campaignDataError ? 'alert' : 'status'}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', marginBottom: '14px',
            background: campaignDataError ? 'var(--status-warning-bg)' : 'var(--bg-subtle)',
            border: `1px solid ${campaignDataError ? 'var(--status-warning-border)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            color: campaignDataError ? 'var(--status-warning-text)' : 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {campaignDataLoading && <Sparkles size={14} />}
          {campaignDataLoading ? 'Refreshing campaign data…' : campaignDataError}
        </div>
      )}

      {/* Metric tiles */}
      <div className="metrics-row">
        <div className="metric-tile">
          <div className="metric-tile__header"><span>SCREENING PROGRESS</span></div>
          <div className="metric-tile__value">
            {screenedCandidates.length} <span style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-tertiary)', fontWeight: 500 }}>/ {candidates.length}</span>
          </div>
          <div style={{ marginTop: '4px' }}><ProgressBar value={screenedCandidates.length} total={candidates.length || 1} /></div>
          <span className="metric-tile__sub">Candidates with document-screening results</span>
        </div>
        <div className="metric-tile">
          <div className="metric-tile__header"><span>CONNECTED RATE</span></div>
          <div className="metric-tile__value">
            {hiring.contacted > 0 ? Math.round((hiring.connected / hiring.contacted) * 100) : 0}%
          </div>
          <span className="metric-tile__sub">{hiring.connected} picked up</span>
        </div>
        <div className="metric-tile">
          <div className="metric-tile__header"><span>INTERESTED</span></div>
          <div className="metric-tile__value">{hiring.interested}</div>
          <span className="metric-tile__sub">Wants to explore role</span>
        </div>
        <div className="metric-tile">
          <div className="metric-tile__header"><span>SHORTLISTED</span></div>
          <div className="metric-tile__value" style={{ color: 'var(--brand-primary)' }}>{hiring.shortlisted}</div>
          <span className="metric-tile__sub">Ready for interview</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '18px' }}>
        <Tabs
          tabs={workspaceTabs}
          activeTab={activeTab}
          onChange={t => setActiveTab(t as WorkspaceTab)}
        />
      </div>

      {/* ═══════════════ TAB: OVERVIEW ═══════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="table-container" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-primary)' }}>AI Screening Funnel</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Real-time stage transitions from import to shortlist</p>
                </div>
              </div>
              <CandidateFunnel hiring={hiring} />
            </div>
            <div className="table-container">
              <div className="table-toolbar">
                <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-primary)' }}>Screening Event Stream</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{hiringActivity.length} events</span>
              </div>
              <div style={{ padding: '8px 16px' }}>
                {hiringActivity.length === 0 ? (
                  <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                    Activity will appear as the AI Recruiter connects with candidates.
                  </p>
                ) : hiringActivity.slice(0, 8).map(item => <ActivityItemComponent key={item.id} item={item} />)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="table-container" style={{ padding: '20px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned AI Recruiter</span>
              {recruiter ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar name={recruiter.name} size="lg" color={recruiter.avatarColor} />
                    <div>
                      <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{recruiter.name}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{recruiter.conversationStyle} · {recruiter.voice}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <div><strong style={{ color: 'var(--text-primary)' }}>Languages:</strong> {recruiter.languages.join(', ')}</div>
                    {hiring.interviewInstructions && (
                      <div style={{ marginTop: '4px', padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: 'var(--font-size-xs)', lineHeight: 1.5 }}>
                        <strong style={{ display: 'block', marginBottom: '3px', color: 'var(--text-primary)' }}>Screening Instructions:</strong>
                        {hiring.interviewInstructions}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ marginTop: '8px', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>Standard screening persona.</p>
              )}
            </div>

            <div className="table-container" style={{ padding: '20px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <Button variant="secondary" size="sm" fullWidth icon={<Phone size={14} />}
                  onClick={() => { setDialerCandidate(null); setDialerOpen(true); }}>
                  Dial Specific Candidate
                </Button>
                {hasScreeningData && (
                  <Button variant="outline" size="sm" fullWidth icon={<Sparkles size={14} />}
                    onClick={() => setActiveTab('screening')}>
                    View Screening Results ({candidates.length})
                  </Button>
                )}
                <Button variant="outline" size="sm" fullWidth icon={<CheckCircle2 size={14} />}
                  onClick={() => setActiveTab('results')}>
                  Review Shortlist ({hiring.shortlisted})
                </Button>
                <Button variant="outline" size="sm" fullWidth icon={<FileSearch size={14} />}
                  onClick={() => navigate(`/screening-reports/${hiring.id}`)}>
                  Screening Reports
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: SCREENING RESULTS ═══════════════ */}
      {activeTab === 'screening' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header banner */}
          <div style={{
            padding: '16px 20px', background: 'var(--brand-primary-light)',
            border: '1px solid var(--brand-primary-border)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
          }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--brand-primary-text)' }}>
                AI Resume Screening Results
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '3px' }}>
                {screenedCandidates.length} screened · {compatibleCandidates.length} compatible ·
                {' '}{notCompatibleCandidates.length} not compatible
                {pendingScreeningCount > 0 && ` · ${pendingScreeningCount} not yet screened`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={14} />}
                onClick={handleStartCallingFromScreening}
                disabled={hiring.status === 'calling'}
              >
                {hiring.status === 'calling' ? 'Calling in progress…' : `Start Calling (${candidates.filter(c => isIncluded(c)).length} included)`}
              </Button>
            </div>
          </div>

          {/* HR control note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)',
          }}>
            <AlertTriangle size={13} style={{ color: 'var(--status-warning-text)', flexShrink: 0 }} />
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>AI recommendations are advisory.</strong>{' '}
              You can include or exclude any candidate regardless of AI compatibility score.
              Only included candidates will receive calls.
            </span>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {(['all', 'compatible', 'not_compatible'] as const).map(f => (
              <button key={f} onClick={() => setScreeningFilter(f)} style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
                fontWeight: 500, border: '1px solid', cursor: 'pointer',
                borderColor: screeningFilter === f ? 'var(--brand-primary)' : 'var(--border-default)',
                background: screeningFilter === f ? 'var(--brand-primary-light)' : 'var(--bg-white)',
                color: screeningFilter === f ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}>
                {f === 'all' ? `Screened (${screenedCandidates.length})` : f === 'compatible' ? `✓ Compatible (${compatibleCandidates.length})` : `✗ Not Compatible (${notCompatibleCandidates.length})`}
              </button>
            ))}
            <input
              value={screeningSearch}
              onChange={e => setScreeningSearch(e.target.value)}
              placeholder="Search by name or skill…"
              style={{
                padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)',
                fontSize: 'var(--font-size-xs)', background: 'var(--bg-white)', color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'var(--font-family)', marginLeft: 'auto', width: '200px',
              }}
            />
          </div>

          {/* Candidate cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {screeningFiltered.map(c => {
              const included = isIncluded(c);
              const score = c.matchScore;
              const hasCompatibility = c.compatibility !== undefined;
              return (
                <div key={c.id} className="screening-card" style={{
                  background: 'var(--bg-white)', border: `1px solid ${included ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)', padding: '16px 18px',
                  opacity: included ? 1 : 0.65,
                  transition: 'opacity var(--transition-fast)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Avatar name={c.name} size="md" color={c.compatibility === 'compatible' ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}>{c.name}</span>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: score === undefined ? 'var(--bg-subtle)' : scoreBg(score),
                          color: score === undefined ? 'var(--text-muted)' : scoreColor(score),
                        }}>
                          {score === undefined ? 'Score unavailable' : `${score}% Match`}
                        </span>
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: c.compatibility === 'compatible'
                            ? 'var(--status-success-bg)'
                            : c.compatibility === 'not_compatible'
                              ? 'var(--status-error-bg)'
                              : 'var(--bg-subtle)',
                          color: c.compatibility === 'compatible'
                            ? 'var(--status-success-text)'
                            : c.compatibility === 'not_compatible'
                              ? 'var(--status-error-text)'
                              : 'var(--text-muted)',
                        }}>
                          {c.compatibility === 'compatible'
                            ? '✓ Compatible'
                            : c.compatibility === 'not_compatible'
                              ? '✗ Not Compatible'
                              : hasCompatibility ? 'Unclassified' : 'Not scored'}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {c.experience} · {c.education || 'Not specified'}
                      </p>

                      {/* Skills */}
                      <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {(c.strongMatches || []).length > 0 && (
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--status-success-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                              ✓ Strong Matches
                            </p>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {(c.strongMatches || []).map(s => (
                                <span key={s} style={{ fontSize: '11px', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: 'var(--status-success-bg)', color: 'var(--status-success-text)', fontWeight: 500 }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {(c.missingRequirements || []).length > 0 && (
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--status-error-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                              Missing
                            </p>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {(c.missingRequirements || []).map(s => (
                                <span key={s} style={{ fontSize: '11px', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: 'var(--status-error-bg)', color: 'var(--status-error-text)', fontWeight: 500 }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {c.aiRecommendation && (
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                          AI: {c.aiRecommendation}
                        </p>
                      )}
                    </div>

                    {/* HR controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, alignItems: 'flex-end' }}>
                      <button
                        onClick={() => toggleIncluded(c)}
                        style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer',
                          border: '1px solid', transition: 'all var(--transition-fast)',
                          borderColor: included ? 'var(--status-success-border)' : 'var(--border-default)',
                          background: included ? 'var(--status-success-bg)' : 'var(--bg-subtle)',
                          color: included ? 'var(--status-success-text)' : 'var(--text-secondary)',
                        }}
                      >
                        {included ? '✓ Included' : '+ Include'}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenCandidate(c)}>
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {screeningFiltered.length === 0 && (
              <EmptyState
                icon={<Users size={24} />}
                title={screenedCandidates.length === 0 ? 'No screening results yet' : 'No candidates match this filter'}
                description={screenedCandidates.length === 0 && pendingScreeningCount > 0
                  ? `${pendingScreeningCount} candidate${pendingScreeningCount === 1 ? '' : 's'} in this campaign have not been document screened. They remain available in the Candidates tab.`
                  : 'Try a different filter or clear the search.'}
              />
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: CANDIDATES ═══════════════ */}
      {activeTab === 'candidates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <Filter size={13} /> Filter:
            </div>
            {['all', 'shortlisted', 'interested', 'connected', 'no_answer', 'added'].map(fk => (
              <button key={fk} onClick={() => setCandidateFilter(fk)} style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 500,
                border: '1px solid', cursor: 'pointer', textTransform: 'capitalize',
                borderColor: candidateFilter === fk ? 'var(--brand-primary)' : 'var(--border-default)',
                background: candidateFilter === fk ? 'var(--brand-primary-light)' : 'var(--bg-white)',
                color: candidateFilter === fk ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}>
                {fk === 'added' ? 'Queued' : fk.replace('_', ' ')}
                {fk === 'all' ? ` (${candidates.length})` : ` (${candidates.filter(c => c.status === fk).length})`}
              </button>
            ))}
            {/* Liked Profiles tab */}
            <button
              onClick={() => setCandidateFilter('liked')}
              style={{
                padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                border: '1px solid', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                borderColor: candidateFilter === 'liked' ? '#f59e0b' : 'var(--border-default)',
                background: candidateFilter === 'liked' ? '#fffbeb' : 'var(--bg-white)',
                color: candidateFilter === 'liked' ? '#b45309' : 'var(--text-secondary)',
              }}
            >
              <Star size={11} fill={candidateFilter === 'liked' ? '#f59e0b' : 'none'} strokeWidth={1.75} style={{ color: candidateFilter === 'liked' ? '#f59e0b' : 'var(--text-muted)' }} />
              Liked Profiles ({candidates.filter(c => c.isFavorite).length})
            </button>
          </div>
          <DataTable
            columns={candidateColumns}
            data={filteredCandidates}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            search={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search candidates by name, phone, or email…"
            onRowClick={handleOpenCandidate}
            batchActions={() => (
              <>
                <Button variant="secondary" size="sm" icon={<CheckCircle2 size={13} />} onClick={handleBulkShortlist}>Bulk Shortlist</Button>
                <Button variant="ghost" size="sm" onClick={handleBulkDisqualify}>Disqualify</Button>
                <Button variant="outline" size="sm" icon={<Download size={13} />} onClick={handleExportCSV}>Export CSV</Button>
              </>
            )}
            emptyTitle="No candidates match your filter"
            emptyDescription="Try selecting a different status filter or clear your search."
          />
        </div>
      )}

      {/* ═══════════════ TAB: CALL LOGS ═══════════════ */}
      {activeTab === 'calls' && (
        <DataTable
          columns={callColumns}
          data={hiringCalls}
          emptyTitle="No calls logged yet"
          emptyDescription="Once the AI Recruiter begins contacting candidates, call logs will appear here."
          onRowClick={call => {
            const cand = candidates.find(c => c.id === call.candidateId);
            if (cand) handleOpenCandidate(cand);
          }}
        />
      )}

      {/* ═══════════════ TAB: SHORTLIST & DECISIONS ═══════════════ */}
      {activeTab === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px 20px', background: 'var(--brand-primary-light)',
            border: '1px solid var(--brand-primary-border)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--brand-primary-text)' }}>
                Shortlist &amp; Hiring Decisions
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                {shortlistedCandidates.length} candidate(s) shortlisted, interview-scheduled, or hired.
              </p>
            </div>
            {shortlistedCandidates.length > 0 && (
              <Button variant="primary" size="sm" icon={<Download size={14} />} onClick={handleExportCSV}>
                Export to CSV
              </Button>
            )}
          </div>

          {shortlistedCandidates.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={24} />}
              title="No candidates shortlisted yet"
              description="Shortlist candidates from the Candidates tab or the Screening Results tab."
            />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'name', header: 'Candidate',
                  render: (c: Candidate) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={c.name} size="sm" color="var(--brand-primary)" />
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{c.name}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{c.phone}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'status', header: 'Stage',
                  render: (c: Candidate) => <CandidateStatusBadge status={c.status} />,
                },
                {
                  key: 'experience', header: 'Experience',
                  render: (c: Candidate) => c.experience || '—',
                },
                {
                  key: 'aiSummary', header: 'AI Summary',
                  render: (c: Candidate) => (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: 'block', maxWidth: '360px' }}>
                      {c.aiSummary || 'Qualified candidate.'}
                    </span>
                  ),
                },
                {
                  key: 'actions', header: 'Actions', align: 'right',
                  render: (c: Candidate) => (
                    <div style={{ display: 'inline-flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenCandidate(c)}>Inspect</Button>
                      {c.status !== 'interview_scheduled' && c.status !== 'interview_completed' && c.status !== 'hired' && (
                        <Button
                          variant="primary" size="sm"
                          icon={<Calendar size={13} />}
                          onClick={() => handleScheduleInterview(c)}
                        >
                          Schedule Interview
                        </Button>
                      )}
                      {c.status === 'interview_scheduled' && (
                        <Button variant="outline" size="sm" icon={<CheckCircle2 size={13} />}
                          onClick={() => {
                            dispatch({ type: 'UPDATE_CANDIDATE', payload: { id: c.id, updates: { status: 'interview_completed' } } });
                            showToast(`Interview completed for ${c.name}`, 'success');
                          }}>
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
              data={shortlistedCandidates}
              onRowClick={handleOpenCandidate}
            />
          )}
        </div>
      )}

      {/* Drawers / Modals */}
      <CandidateDrawer
        candidate={selectedCandidate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCallAgain={handleCallAgain}
        onScheduleInterview={handleScheduleInterview}
      />
      <DialerModal
        open={dialerOpen}
        initialPhone={dialerCandidate?.phone}
        initialCandidateName={dialerCandidate?.name}
        onClose={() => { setDialerOpen(false); setDialerCandidate(null); }}
      />
      <ScheduleInterviewModal
        open={scheduleOpen}
        candidate={scheduleCandidate}
        onClose={() => { setScheduleOpen(false); setScheduleCandidate(null); }}
      />
    </div>
  );
};

export default HiringWorkspace;
