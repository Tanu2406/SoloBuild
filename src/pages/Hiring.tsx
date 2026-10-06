import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, LayoutGrid, List, Briefcase, X } from 'lucide-react';
import { PageHeader } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { HiringCard } from '../components/product/HiringCard';
import { DataTable, type Column } from '../components/ui/DataTable';
import { HiringStatusBadge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import Candidates from './Candidates';
import { useRecruiters, useAppStore } from '../store/appStore';
import { callSimulationService } from '../services/callSimulationService';
import {
  listCampaignCandidates,
  listCampaignDocumentScreenings,
  listCampaigns,
  mapCampaignCandidate,
} from '../services/campaignService';
import { LANG_ARRAY_FROM_API, listAgents } from '../services/agentService';
import { useToast } from '../components/ui/Toast';
import type { Hiring } from '../types';

type TabId = 'all' | 'active' | 'draft' | 'completed' | 'candidates';

const HiringPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppStore();
  const { showToast } = useToast();
  const recruiters = useRecruiters();
  const stateRef = useRef(state);
  const recruitersRef = useRef(recruiters);

  const [hirings, setHirings] = useState<Hiring[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const employmentTypeUnavailable = hirings.length > 0 && hirings.every(hiring => hiring.backendCampaign);

  useEffect(() => {
    stateRef.current = state;
    recruitersRef.current = recruiters;
  }, [state, recruiters]);

  useEffect(() => {
    let cancelled = false;

    const loadCampaigns = async () => {
      const campaigns = await listCampaigns();
      const [agentsResult, campaignDataResults] = await Promise.all([
        Promise.allSettled([listAgents()]).then(results => results[0]),
        Promise.all(campaigns.map(async campaign => {
          const [candidatesResult, screeningsResult] = await Promise.allSettled([
            listCampaignCandidates(campaign.id),
            listCampaignDocumentScreenings(campaign.id),
          ]);
          return { campaign, candidatesResult, screeningsResult };
        })),
      ]);

      if (cancelled) return;

      if (agentsResult.status === 'fulfilled') {
        const colors = ['#2563eb', '#0891b2', '#7c3aed', '#059669', '#dc2626', '#d97706'];
        agentsResult.value.forEach((agent, index) => {
          const existing = recruitersRef.current.find(item => item.id === agent.id);
          const mappedAgent = {
            id: agent.id,
            name: agent.name,
            description: `${agent.conversation_style} tone.`,
            languages: LANG_ARRAY_FROM_API[agent.languages] ?? ['English'],
            voice: agent.voice,
            conversationStyle: agent.conversation_style,
            interviewInstructions: agent.interview_instruction,
            avatarInitial: agent.name[0]?.toUpperCase() ?? 'A',
            avatarColor: existing?.avatarColor ?? colors[index % colors.length],
          };
          dispatch(existing
            ? { type: 'UPDATE_RECRUITER', payload: { id: agent.id, updates: mappedAgent } }
            : { type: 'CREATE_RECRUITER', payload: mappedAgent });
        });
      }

      const now = new Date().toISOString();
      const warnings: string[] = [];
      if (agentsResult.status === 'rejected') {
        warnings.push(agentsResult.reason instanceof Error
          ? `AI agents could not be loaded: ${agentsResult.reason.message}`
          : 'AI agents could not be loaded.');
      }

      const rows = campaignDataResults.map(({ campaign, candidatesResult, screeningsResult }) => {
        const existing = stateRef.current.hirings.find(item => item.id === campaign.id);
        const apiCandidates = candidatesResult.status === 'fulfilled' ? candidatesResult.value : [];
        const screenings = screeningsResult.status === 'fulfilled' ? screeningsResult.value : [];
        if (candidatesResult.status === 'rejected') {
          warnings.push(candidatesResult.reason instanceof Error
            ? `${campaign.title}: candidates could not be loaded (${candidatesResult.reason.message})`
            : `${campaign.title}: candidates could not be loaded.`);
        }
        if (screeningsResult.status === 'rejected') {
          warnings.push(screeningsResult.reason instanceof Error
            ? `${campaign.title}: document screening results could not be loaded (${screeningsResult.reason.message})`
            : `${campaign.title}: document screening results could not be loaded.`);
        }

        const screenedById = new Map(screenings.map(result => [result.candidate_id, result]));
        const mappedCandidates = apiCandidates.map(candidate =>
          mapCampaignCandidate(candidate, screenedById.get(candidate.id), campaign.title),
        );
        if (mappedCandidates.length > 0) {
          dispatch({ type: 'ADD_CANDIDATES', payload: { hiringId: campaign.id, candidates: mappedCandidates } });
        }

        const screenedCount = screenings.filter(result => result.match_score !== null).length;
        const createdAt = campaign.created_at || now;
        const updatedAt = campaign.updated_at || createdAt;
        const hiring: Hiring = {
          id: campaign.id,
          title: campaign.title,
          location: existing?.location || '—',
          employmentType: existing?.employmentType || 'full_time',
          backendCampaign: true,
          campaignCandidatesLoaded: candidatesResult.status === 'fulfilled',
          ...(existing?.description ? { description: existing.description } : {}),
          ...(existing?.jdText ? { jdText: existing.jdText } : {}),
          status: screenedCount > 0 ? 'screened' : 'screening',
          ...(campaign.agent_id ? { aiRecruiterId: campaign.agent_id } : {}),
          ...(existing?.interviewInstructions ? { interviewInstructions: existing.interviewInstructions } : {}),
          resumeCount: screenedCount,
          candidateCount: candidatesResult.status === 'fulfilled' ? apiCandidates.length : existing?.candidateCount ?? 0,
          contacted: existing?.contacted ?? 0,
          connected: existing?.connected ?? 0,
          interested: existing?.interested ?? 0,
          shortlisted: existing?.shortlisted ?? 0,
          candidateIds: candidatesResult.status === 'fulfilled'
            ? apiCandidates.map(candidate => candidate.id)
            : existing?.candidateIds ?? [],
          createdAt,
          updatedAt,
        };
        dispatch(existing
          ? { type: 'UPDATE_HIRING', payload: { id: campaign.id, updates: hiring } }
          : { type: 'CREATE_HIRING', payload: hiring });
        return hiring;
      });

      if (!cancelled) {
        setHirings(rows);
        setLoadError(warnings.join(' '));
        setLoading(false);
      }
    };

    void loadCampaigns().catch(err => {
      if (cancelled) return;
      setLoadError(err instanceof Error ? err.message : 'Failed to load campaigns.');
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [dispatch]);

  const filtered = hirings.filter(h => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && ['screening', 'screened', 'calling', 'paused', 'ready'].includes(h.status)) ||
      (activeTab === 'draft' && h.status === 'draft') ||
      (activeTab === 'completed' && h.status === 'completed');
    const matchesSearch =
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      employmentTypeFilter === 'all' ||
      (h.backendCampaign && employmentTypeUnavailable) ||
      h.employmentType === employmentTypeFilter;
    return matchesTab && matchesSearch && matchesType;
  });

  const tabs = [
    { id: 'all', label: 'All Campaigns', count: hirings.length },
    { id: 'active', label: 'Active Screening', count: hirings.filter(h => ['screening', 'screened', 'calling', 'paused', 'ready'].includes(h.status)).length },
    { id: 'draft', label: 'Drafts', count: hirings.filter(h => h.status === 'draft').length },
    { id: 'completed', label: 'Completed', count: hirings.filter(h => h.status === 'completed').length },
    { id: 'candidates', label: 'Candidates' },
  ];

  const handlePauseCalling = (hiring: Hiring) => {
    callSimulationService.pause(hiring.id, dispatch, hiring.title);
    showToast(`Calling paused for ${hiring.title}`, 'info');
  };

  const handleResumeCalling = (hiring: Hiring) => {
    callSimulationService.resume(hiring.id, state, dispatch, hiring.title);
    showToast(`Calling resumed for ${hiring.title}`, 'success');
  };

  const columns: Column<Hiring>[] = [
    {
      key: 'title',
      header: 'Job Role & Location',
      sortable: true,
      render: (h: Hiring) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.title}</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            {h.backendCampaign
              ? `${h.location} · —`
              : `${h.location} · ${h.employmentType.replace('_', '-')}`}
          </span>
        </div>
      ),
    },
    {
      key: 'aiRecruiterId',
      header: 'Assigned AI Recruiter',
      render: (h: Hiring) => {
        const rec = recruiters.find(r => r.id === h.aiRecruiterId);
        return rec ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar name={rec.name} size="sm" color={rec.avatarColor} />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{rec.name}</span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Standard</span>
        );
      },
    },
    {
      key: 'candidateCount',
      header: 'Pool Size',
      sortable: true,
      render: (h: Hiring) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
        {h.backendCampaign && !h.campaignCandidatesLoaded ? '—' : h.candidateCount}
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'Screening Velocity',
      render: (h: Hiring) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
          <ProgressBar
            value={h.backendCampaign ? h.resumeCount ?? 0 : h.contacted}
            total={h.candidateCount || 1}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {h.backendCampaign
              ? `${h.resumeCount ?? 0} of ${h.campaignCandidatesLoaded ? h.candidateCount : '—'} screened`
              : `${h.contacted} of ${h.candidateCount} contacted (${Math.round(((h.contacted) / (h.candidateCount || 1)) * 100)}%)`}
          </span>
        </div>
      ),
    },
    {
      key: 'shortlisted',
      header: 'Shortlisted',
      align: 'center',
      sortable: true,
      render: (h: Hiring) => (
        <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: 'var(--font-size-md)' }}>
          {h.backendCampaign ? '—' : h.shortlisted}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (h: Hiring) => <HiringStatusBadge status={h.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (h: Hiring) => (
        <div style={{ display: 'inline-flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
          {h.status === 'calling' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePauseCalling(h)}
            >
              Pause
            </Button>
          ) : h.status === 'paused' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleResumeCalling(h)}
            >
              Resume
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/hiring/${h.id}`)}
          >
            Console
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-content animate-fade-in">
      <PageHeader
        title="Hiring Campaigns"
        subtitle="Manage active voice recruitment campaigns and evaluate candidate screening progress."
        actions={
          <Button icon={<Plus size={16} />} onClick={() => navigate('/hiring/create')}>
            Create Hiring
          </Button>
        }
      />

      {(loading || loadError) && (
        <div
          role={loadError ? 'alert' : 'status'}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', marginBottom: '14px',
            background: loadError ? 'var(--status-warning-bg)' : 'var(--bg-subtle)',
            border: `1px solid ${loadError ? 'var(--status-warning-border)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            color: loadError ? 'var(--status-warning-text)' : 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {loading && <Loader2 size={14} className="spin" />}
          {loading ? 'Loading campaigns…' : loadError}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <Tabs tabs={tabs} activeTab={activeTab} onChange={id => setActiveTab(id as TabId)} />

        {activeTab !== 'candidates' && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Employment type filter */}
          <select
            value={employmentTypeFilter}
            onChange={e => setEmploymentTypeFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${employmentTypeFilter !== 'all' ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              fontSize: 'var(--font-size-xs)',
              color: employmentTypeFilter !== 'all' ? 'var(--brand-primary)' : 'var(--text-primary)',
              background: employmentTypeFilter !== 'all' ? 'var(--brand-primary-light)' : 'var(--bg-white)',
              cursor: 'pointer',
            }}
            aria-label="Filter by employment type"
            disabled={employmentTypeUnavailable}
            title={employmentTypeUnavailable ? 'Employment type is not included in the campaigns list response.' : undefined}
          >
            <option value="all">All Types</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>

          {/* Clear filter chip */}
          {(employmentTypeFilter !== 'all' || search) && (
            <button
              onClick={() => { setEmploymentTypeFilter('all'); setSearch(''); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 500,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-white)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <X size={11} /> Clear
            </button>
          )}

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'var(--brand-primary-light)' : 'transparent',
                color: viewMode === 'table' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                border: 'none',
                padding: '5px 8px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--brand-primary-light)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                border: 'none',
                padding: '5px 8px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>}
      </div>

      {activeTab === 'candidates' ? (
        <Candidates embedded />
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={loading ? [] : filtered}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search campaigns by role or location…"
          onRowClick={h => navigate(`/hiring/${h.id}`)}
          emptyIcon={<Briefcase size={24} />}
          emptyTitle={search ? 'No hirings found' : 'No hirings yet'}
          emptyDescription={
            search
              ? 'Try adjusting your search query.'
              : 'Create your first hiring campaign and let your AI Recruiter begin contacting candidates.'
          }
          emptyAction={!search ? { label: 'Create Hiring', onClick: () => navigate('/hiring/create') } : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '16px' }}>
          {!loading && filtered.map(hiring => (
            <HiringCard
              key={hiring.id}
              hiring={hiring}
              onClick={() => navigate(`/hiring/${hiring.id}`)}
            />
          ))}
          {!loading && filtered.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', padding: '24px' }}>
              {loadError ? 'Campaigns could not be loaded.' : search ? 'No campaigns match your search.' : 'No campaigns yet.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HiringPage;
