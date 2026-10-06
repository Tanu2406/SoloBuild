import React, { useEffect, useRef, useState } from 'react';
import {
  Users, Download, CheckCircle2, Loader2,
  Filter, X, Star
} from 'lucide-react';
import { PageHeader } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { Badge, CandidateStatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { DataTable, type Column } from '../components/ui/DataTable';
import { CandidateDrawer } from '../components/product/CandidateDrawer';
import { DialerModal } from '../components/product/DialerModal';
import { useAppStore, useCandidates, useHirings } from '../store/appStore';
import {
  listCampaignCandidates,
  listCampaignDocumentScreenings,
  listCampaigns,
  mapCampaignCandidate,
} from '../services/campaignService';
import { useToast } from '../components/ui/Toast';
import type { Candidate } from '../types';

const Candidates: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { dispatch } = useAppStore();
  const { showToast } = useToast();
  const candidates = useCandidates();
  const hirings = useHirings();
  const hiringsRef = useRef(hirings);
  useEffect(() => { hiringsRef.current = hirings; }, [hirings]);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedHiringId, setSelectedHiringId] = useState<string>('all');
  const [callStatusFilter, setCallStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingCampaignCandidates, setLoadingCampaignCandidates] = useState(true);
  const [campaignsLoadedFromApi, setCampaignsLoadedFromApi] = useState(false);
  const [campaignLoadError, setCampaignLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadCampaignCandidates = async () => {
      const campaigns = await listCampaigns();
      const campaignResults = await Promise.all(campaigns.map(async campaign => {
        const [candidateResult, screeningResult] = await Promise.allSettled([
          listCampaignCandidates(campaign.id),
          listCampaignDocumentScreenings(campaign.id),
        ]);
        return { campaign, candidateResult, screeningResult };
      }));
      if (cancelled) return;

      const warnings: string[] = [];
      for (const { campaign, candidateResult, screeningResult } of campaignResults) {
        const existing = hiringsRef.current.find(hiring => hiring.id === campaign.id);
        const screenings = screeningResult.status === 'fulfilled' ? screeningResult.value : [];
        const hiring = {
          ...(existing ?? {
            id: campaign.id,
            title: campaign.title,
            status: 'screening' as const,
            location: '—',
            employmentType: 'full_time' as const,
            candidateCount: 0,
            contacted: 0,
            connected: 0,
            interested: 0,
            shortlisted: 0,
            candidateIds: [],
            createdAt: campaign.created_at,
            updatedAt: campaign.updated_at,
          }),
          id: campaign.id,
          title: campaign.title,
          status: screenings.some(result => result.match_score !== null) ? 'screened' as const : 'screening' as const,
          backendCampaign: true,
          updatedAt: campaign.updated_at || campaign.created_at,
        };
        dispatch(existing
          ? { type: 'UPDATE_HIRING', payload: { id: campaign.id, updates: hiring } }
          : { type: 'CREATE_HIRING', payload: hiring });

        if (candidateResult.status === 'rejected') {
          warnings.push(candidateResult.reason instanceof Error
            ? `${campaign.title}: candidates could not be loaded (${candidateResult.reason.message}).`
            : `${campaign.title}: candidates could not be loaded.`);
          continue;
        }
        if (screeningResult.status === 'rejected') {
          warnings.push(screeningResult.reason instanceof Error
            ? `${campaign.title}: screening results could not be loaded (${screeningResult.reason.message}).`
            : `${campaign.title}: screening results could not be loaded.`);
        }
        const screeningByCandidateId = new Map(screenings.map(result => [result.candidate_id, result]));
        const mappedCandidates = candidateResult.value.map(candidate =>
          mapCampaignCandidate(candidate, screeningByCandidateId.get(candidate.id), campaign.title),
        );
        dispatch({
          type: 'ADD_CANDIDATES',
          payload: { hiringId: campaign.id, candidates: mappedCandidates },
        });
      }
      setCampaignsLoadedFromApi(true);
      setCampaignLoadError(warnings.join(' '));
      setLoadingCampaignCandidates(false);
    };
    void loadCampaignCandidates().catch(error => {
      if (cancelled) return;
      setCampaignLoadError(error instanceof Error ? error.message : 'Failed to load campaign candidates.');
      setLoadingCampaignCandidates(false);
    });
    return () => { cancelled = true; };
  }, [dispatch]);

  // Drawer & Dialer states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [dialerCandidate, setDialerCandidate] = useState<{ phone: string; name?: string } | null>(null);

  const handleOpenCandidate = (cand: Candidate) => {
    setSelectedCandidate(cand);
    setDrawerOpen(true);
  };

  const handleCallAgain = (cand: Candidate) => {
    setDrawerOpen(false);
    setDialerCandidate({ phone: cand.phone, name: cand.name });
    setDialerOpen(true);
  };

  // Bulk actions
  const handleBulkShortlist = () => {
    selectedIds.forEach(id => {
      dispatch({
        type: 'UPDATE_CANDIDATE',
        payload: { id, updates: { status: 'shortlisted' } },
      });
    });
    showToast(`${selectedIds.length} candidate(s) shortlisted`, 'success');
    setSelectedIds([]);
  };

  const handleBulkDisqualify = () => {
    selectedIds.forEach(id => {
      dispatch({
        type: 'UPDATE_CANDIDATE',
        payload: { id, updates: { status: 'not_interested' } },
      });
    });
    showToast(`${selectedIds.length} candidate(s) marked not interested`, 'info');
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const exportData = directoryCandidates.filter(c => selectedIds.length === 0 || selectedIds.includes(c.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Phone,Email,Role,Status,Experience,Location,Call Duration,Summary']
        .concat(
          exportData.map(c =>
              `"${c.name}","${c.phone}","${c.email || ''}","${c.hiringTitle || ''}","${c.backendCampaignCandidate ? c.workflowStepStatus || '' : c.status}","${c.experience || ''}","${c.location || ''}","${c.callDuration || ''}","${(c.aiSummary || '').replace(/"/g, '""')}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SoloBuildAI_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${exportData.length} candidates to CSV`, 'success');
  };

  // Filtering
  const directoryCandidates = campaignsLoadedFromApi
    ? candidates.filter(candidate => candidate.backendCampaignCandidate)
    : candidates;
  const directoryHirings = campaignsLoadedFromApi
    ? hirings.filter(hiring => hiring.backendCampaign)
    : hirings;
  const statusFilters = ['all', 'shortlisted', 'interested', 'connected', 'contacted', 'no_answer', 'added'];
  if (directoryCandidates.some(candidate => candidate.backendCampaignCandidate)) {
    statusFilters.push('pending', 'processing', 'completed', 'failed');
  }
  const getFilterStatus = (candidate: Candidate) =>
    candidate.backendCampaignCandidate
      ? candidate.workflowStepStatus?.toLowerCase() ?? 'pending'
      : candidate.status;

  const filtered = directoryCandidates.filter(c => {
    const matchesStatus =
      activeFilter === 'liked'
        ? !!c.isFavorite
        : activeFilter === 'all' || getFilterStatus(c) === activeFilter;
    const matchesHiring =
      selectedHiringId === 'all' ||
      c.hiringId === selectedHiringId;
    const matchesCallStatus =
      callStatusFilter === 'all' ||
      (callStatusFilter === 'called' && !!c.callDuration) ||
      (callStatusFilter === 'not_called' && !c.callDuration);
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.hiringTitle || '').toLowerCase().includes(q) ||
      (c.position || '').toLowerCase().includes(q) ||
      c.phone.includes(search) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q);
    return matchesStatus && matchesHiring && matchesCallStatus && matchesSearch;
  });
  const selectedIncludesBackend = directoryCandidates.some(
    candidate => selectedIds.includes(candidate.id) && candidate.backendCampaignCandidate,
  );

  const columns: Column<Candidate>[] = [
    {
      key: 'name',
      header: 'Candidate Name',
      sortable: true,
      render: (c: Candidate) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar name={c.name} size="sm" color="var(--brand-primary)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{c.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'hiringTitle',
      header: 'Campaign / Role',
      sortable: true,
      render: (c: Candidate) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {c.hiringTitle || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Screening Status',
      sortable: true,
      render: (c: Candidate) => c.backendCampaignCandidate ? (
        <Badge variant={c.workflowStepStatus === 'COMPLETED' ? 'success' : c.workflowStepStatus === 'FAILED' ? 'error' : c.workflowStepStatus === 'PROCESSING' ? 'info' : 'neutral'}>
          {c.workflowStepStatus || c.workflowStep || 'Unavailable'}
        </Badge>
      ) : <CandidateStatusBadge status={c.status} />,
    },
    {
      key: 'experience',
      header: 'Experience',
      render: (c: Candidate) => c.experience || '—',
    },
    {
      key: 'matchScore',
      header: 'Resume Match',
      sortable: true,
      render: (c: Candidate) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
          {c.matchScore === undefined
            ? c.backendCampaignCandidate ? 'Not scored' : '—'
            : `${c.matchScore}%`}
        </span>
      ),
    },
    {
      key: 'callDuration',
      header: 'Call Duration',
      render: (c: Candidate) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
          {c.backendCampaignCandidate ? 'Unavailable' : c.callDuration || '—'}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (c: Candidate) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
          {c.backendCampaignCandidate
            ? c.candidateUpdatedAt ? new Date(c.candidateUpdatedAt).toLocaleDateString() : '—'
            : c.lastActivity || '—'}
        </span>
      ),
    },
    {
      key: 'isFavorite',
      header: 'Liked Profile',
      render: (c: Candidate) => (
        <button
          onClick={e => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: c.id }); }}
          title={c.isFavorite ? 'Remove from liked profiles' : 'Mark as liked profile'}
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
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (c: Candidate) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCandidate(c);
          }}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className={embedded ? 'animate-fade-in' : 'page-content animate-fade-in'}>
      <PageHeader
        title="Candidate Directory"
        subtitle="Global directory of all candidate profiles across active and completed hirings."
        actions={
          <Button
            variant="outline"
            size="md"
            icon={<Download size={14} />}
            onClick={handleExportCSV}
          >
            Export All to CSV
          </Button>
        }
      />

      {(loadingCampaignCandidates || campaignLoadError) && (
        <div
          role={campaignLoadError ? 'alert' : 'status'}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', marginBottom: '14px',
            background: campaignLoadError ? 'var(--status-warning-bg)' : 'var(--bg-subtle)',
            border: `1px solid ${campaignLoadError ? 'var(--status-warning-border)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            color: campaignLoadError ? 'var(--status-warning-text)' : 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {loadingCampaignCandidates && <Loader2 size={14} className="spin" />}
          {loadingCampaignCandidates ? 'Loading campaign candidates and screening results…' : campaignLoadError}
        </div>
      )}

      {/* Filter Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Status pills + Call status filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Screening status pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} /> Status:
            </span>
            {statusFilters.map(statusKey => (
              <button
                key={statusKey}
                onClick={() => setActiveFilter(statusKey)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: activeFilter === statusKey ? 'var(--brand-primary)' : 'var(--border-default)',
                  background: activeFilter === statusKey ? 'var(--brand-primary-light)' : 'var(--bg-white)',
                  color: activeFilter === statusKey ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {statusKey === 'all' ? 'All' : statusKey === 'added' ? 'Queued' : statusKey.replace('_', ' ')}
                {statusKey === 'all'
                  ? ` (${directoryCandidates.length})`
                  : ` (${directoryCandidates.filter(c => getFilterStatus(c) === statusKey).length})`}
              </button>
            ))}
            {/* Liked Profiles pill */}
            <button
              onClick={() => setActiveFilter('liked')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                borderColor: activeFilter === 'liked' ? '#f59e0b' : 'var(--border-default)',
                background: activeFilter === 'liked' ? '#fffbeb' : 'var(--bg-white)',
                color: activeFilter === 'liked' ? '#b45309' : 'var(--text-secondary)',
              }}
            >
              <Star
                size={11}
                fill={activeFilter === 'liked' ? '#f59e0b' : 'none'}
                strokeWidth={1.75}
                style={{ color: activeFilter === 'liked' ? '#f59e0b' : 'var(--text-muted)' }}
              />
              Liked Profiles ({directoryCandidates.filter(c => c.isFavorite).length})
            </button>
          </div>

          {!campaignsLoadedFromApi && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Call:
              </span>
              {[
                { key: 'all', label: 'All' },
                { key: 'called', label: 'Called' },
                { key: 'not_called', label: 'Not called yet' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setCallStatusFilter(opt.key)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 500,
                    border: '1px solid',
                    borderColor: callStatusFilter === opt.key ? 'var(--brand-primary)' : 'var(--border-default)',
                    background: callStatusFilter === opt.key ? 'var(--brand-primary-light)' : 'var(--bg-white)',
                    color: callStatusFilter === opt.key ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Campaign filter + clear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedHiringId}
            onChange={e => setSelectedHiringId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-primary)',
              background: 'var(--bg-white)',
              cursor: 'pointer',
            }}
            aria-label="Filter by hiring campaign"
          >
            <option value="all">All Campaigns ({directoryHirings.length})</option>
            {directoryHirings.map(h => (
              <option key={h.id} value={h.id}>
                {h.title} ({h.candidateCount})
              </option>
            ))}
          </select>

          {/* Clear all filters chip — only show when any filter is active */}
          {(activeFilter !== 'all' || selectedHiringId !== 'all' || callStatusFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setActiveFilter('all');
                setSelectedHiringId('all');
                setCallStatusFilter('all');
                setSearch('');
              }}
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
              <X size={11} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Candidate Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, phone, email, role, or location…"
        onRowClick={handleOpenCandidate}
        batchActions={() => (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<CheckCircle2 size={13} />}
              onClick={handleBulkShortlist}
              disabled={selectedIncludesBackend}
              title={selectedIncludesBackend ? 'Shortlisting is not available from the campaign candidate APIs.' : undefined}
            >
              Bulk Shortlist
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDisqualify}
              disabled={selectedIncludesBackend}
              title={selectedIncludesBackend ? 'Candidate status updates are not available from the campaign candidate APIs.' : undefined}
            >
              Mark Not Interested
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={13} />}
              onClick={handleExportCSV}
            >
              Export Selected
            </Button>
          </>
        )}
        emptyIcon={<Users size={24} />}
        emptyTitle="No candidates found"
        emptyDescription={
          directoryCandidates.length === 0
            ? 'Candidates will appear here once you create a hiring campaign and import candidates.'
            : 'Try adjusting your search criteria or filter options.'
        }
      />

      {/* Candidate Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCallAgain={handleCallAgain}
      />

      {/* Dialer Modal */}
      <DialerModal
        open={dialerOpen}
        initialPhone={dialerCandidate?.phone}
        initialCandidateName={dialerCandidate?.name}
        onClose={() => {
          setDialerOpen(false);
          setDialerCandidate(null);
        }}
      />
    </div>
  );
};

export default Candidates;
