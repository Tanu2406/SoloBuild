import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createCampaign,
  getScreeningStatus,
  getUploadStatus,
  listCampaignCandidates,
  listCampaigns,
  listCampaignDocumentScreenings,
  mapCampaignCandidate,
  applyDocumentScreening,
  uploadCandidateFiles,
} from '../../../services/campaignService';
import type {
  CampaignListItem,
  CampaignResponse,
  ScreeningBatchStatus,
  UploadBatchStatus,
} from '../../../services/campaignService';
import { Button } from '../Button';
import type { UIAction } from './types';
import { Avatar } from '../Avatar';

interface ChatActionRendererProps {
  action: UIAction;
  onActionTrigger: (message: string) => void;
}

const panelStyle: React.CSSProperties = {
  marginTop: 12,
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  background: '#fff',
  padding: 16,
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#0f172a',
  fontSize: 13,
  fontWeight: 600,
};

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function fieldLabels(value: unknown): string[] {
  const flatten = (input: unknown, prefix = ''): string[] => {
    if (Array.isArray(input)) return input.flatMap(item => flatten(item, prefix));
    const fields = objectValue(input);
    if (fields) {
      return Object.entries(fields).flatMap(([key, field]) =>
        flatten(field, [prefix, key.replace(/[_-]/g, ' ')].filter(Boolean).join(' · ')),
      );
    }
    if (input === null || input === undefined || input === '') return [];
    return [prefix ? `${prefix}: ${String(input)}` : String(input)];
  };
  return flatten(value);
}

interface ChatScreeningCandidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  workflowStep?: string;
  workflowStepStatus?: string;
  matchScore?: number;
  experience?: string;
  education?: string;
  strongMatches: string[];
  missingRequirements: string[];
  summary?: string;
}

function mapActionCandidate(value: unknown): ChatScreeningCandidate | null {
  const record = objectValue(value);
  if (!record || typeof record.id !== 'string') return null;
  const extracted = objectValue(record.extracted_fields) ?? {};
  const numericScore = typeof record.match_score === 'number'
    ? record.match_score
    : typeof record.matchScore === 'number'
      ? record.matchScore
      : undefined;
  const matchScore = numericScore === undefined
    ? undefined
    : numericScore >= 0 && numericScore <= 1 ? numericScore * 100 : numericScore;
  return {
    id: record.id,
    name: stringValue(record.name) ?? stringValue(record.email) ?? record.id,
    email: stringValue(record.email),
    phone: stringValue(record.phone),
    workflowStep: stringValue(record.workflow_step) ?? stringValue(record.workflowStep),
    workflowStepStatus: stringValue(record.step_status) ?? stringValue(record.workflow_step_status) ?? stringValue(record.workflowStepStatus),
    matchScore,
    experience: stringValue(extracted.experience) ?? stringValue(extracted.years_experience),
    education: stringValue(extracted.education) ?? stringValue(extracted.qualification),
    strongMatches: fieldLabels(record.matched_fields ?? record.strong_matches ?? record.strongMatches),
    missingRequirements: fieldLabels(record.unmatched_fields ?? record.missing_requirements ?? record.missingRequirements),
    summary: stringValue(record.summary) ?? stringValue(record.document_screening_summary),
  };
}

function campaignArray(value: unknown): CampaignListItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Partial<CampaignListItem>;
    if (typeof candidate.id !== 'string' || typeof candidate.title !== 'string') return [];
    return [{
      id: candidate.id,
      title: candidate.title,
      workflow_template_id: candidate.workflow_template_id ?? '',
      agent_id: candidate.agent_id ?? '',
      created_at: candidate.created_at ?? '',
      updated_at: candidate.updated_at ?? '',
    }];
  });
}

function useActionError() {
  const [error, setError] = useState('');
  const updateError = useCallback((message: string) => setError(message), []);
  return { error, setError: updateError };
}

function ActionMessage({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p role={error ? 'alert' : 'status'} style={{ color: error ? '#b91c1c' : '#475569', fontSize: 12, lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

function CampaignListAction({
  action,
  onActionTrigger,
  picker = false,
}: ChatActionRendererProps & { picker?: boolean }) {
  const [campaigns, setCampaigns] = useState(() => campaignArray(action.payload.campaigns) ?? []);
  const [loading, setLoading] = useState(!campaignArray(action.payload.campaigns));
  const { error, setError } = useActionError();

  useEffect(() => {
    if (campaignArray(action.payload.campaigns)) return;
    let cancelled = false;
    listCampaigns().then(items => {
      if (!cancelled) setCampaigns(items);
    }).catch(reason => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Campaigns could not be loaded.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [action.payload.campaigns, setError]);

  const title = picker
    ? stringValue(action.payload.reason) ?? 'Choose a campaign'
    : 'Your campaigns';

  return (
    <section style={panelStyle}>
      <h3 style={titleStyle}>{title}</h3>
      {loading && <ActionMessage>Loading campaigns…</ActionMessage>}
      {error && <ActionMessage error>{error}</ActionMessage>}
      {!loading && !error && campaigns.length === 0 && <ActionMessage>No campaigns are available.</ActionMessage>}
      <div className="chat-action-list">
        {campaigns.map(campaign => (
          <button
            key={campaign.id}
            type="button"
            className="chat-action-list__item"
            onClick={() => onActionTrigger(
              picker
                ? `Use campaign "${campaign.title}" (${campaign.id}).`
                : `Show candidates in "${campaign.title}" (${campaign.id}).`,
            )}
          >
            <span>{campaign.title}</span>
            <span>{picker ? 'Select' : 'View'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CampaignDetailAction({ action, onActionTrigger }: ChatActionRendererProps) {
  const [campaign, setCampaign] = useState<CampaignListItem | CampaignResponse | null>(() => {
    const raw = action.payload.campaign;
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Partial<CampaignResponse>;
    return typeof item.id === 'string' && typeof item.title === 'string'
      ? { ...item, id: item.id, title: item.title } as CampaignResponse
      : null;
  });
  const campaignId = stringValue(action.payload.campaign_id) ?? campaign?.id;
  const [candidateCount, setCandidateCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(campaignId));
  const { error, setError } = useActionError();

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [campaignsResult, candidatesResult] = await Promise.allSettled([
          campaign ? Promise.resolve(null) : listCampaigns(),
          listCampaignCandidates(campaignId),
        ]);
        if (cancelled) return;
        if (!campaign && campaignsResult.status === 'fulfilled') {
          setCampaign(campaignsResult.value?.find(item => item.id === campaignId) ?? null);
        } else if (campaignsResult.status === 'rejected') {
          setError(campaignsResult.reason instanceof Error ? campaignsResult.reason.message : 'Campaign details could not be loaded.');
        }
        if (candidatesResult.status === 'fulfilled') setCandidateCount(candidatesResult.value.length);
        else if (candidatesResult.status === 'rejected') {
          setError(candidatesResult.reason instanceof Error ? candidatesResult.reason.message : 'Candidate count could not be loaded.');
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Campaign details could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [campaign, campaignId, setError]);

  return (
    <section style={panelStyle}>
      <h3 style={titleStyle}>{campaign?.title ?? 'Campaign details'}</h3>
      {loading && <ActionMessage>Loading campaign details…</ActionMessage>}
      {(error || (!campaignId ? 'No campaign ID was provided.' : '')) && (
        <ActionMessage error>{error || 'No campaign ID was provided.'}</ActionMessage>
      )}
      {candidateCount !== null && <ActionMessage>{candidateCount} candidate{candidateCount === 1 ? '' : 's'} in this campaign.</ActionMessage>}
      <div className="chat-action-buttons">
        {campaignId && (
          <>
            <Button size="sm" variant="secondary" onClick={() => onActionTrigger(`Show candidates in campaign ${campaign?.title ?? campaignId} (${campaignId}).`)}>
              Show candidates
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onActionTrigger(`Upload candidate resumes to campaign ${campaign?.title ?? campaignId} (${campaignId}).`)}>
              Upload resumes
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function CampaignCreateAction({ action }: ChatActionRendererProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(stringValue(action.payload.initial_title) ?? '');
  const [rawText, setRawText] = useState(stringValue(action.payload.initial_text) ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<CampaignResponse | null>(null);
  const { error, setError } = useActionError();

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Enter a campaign title.');
      return;
    }
    if (!file && !rawText.trim()) {
      setError('Add job description text or choose a JD file.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const campaign = await createCampaign({
        title: title.trim(),
        ...(file ? { file } : { rawText: rawText.trim() }),
      });
      setCreatedCampaign(campaign);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Campaign could not be created.');
    } finally {
      setSaving(false);
    }
  };

  if (createdCampaign) {
    return (
      <section style={panelStyle}>
        <h3 style={titleStyle}>Campaign created</h3>
        <ActionMessage>{createdCampaign.title} is ready.</ActionMessage>
        <Button size="sm" variant="secondary" onClick={() => navigate(`/hiring/${createdCampaign.id}`)}>
          Open campaign
        </Button>
      </section>
    );
  }

  return (
    <form style={panelStyle} onSubmit={handleCreate}>
      <h3 style={titleStyle}>Create a campaign</h3>
      <label className="chat-action-field">
        <span>Campaign title</span>
        <input value={title} onChange={event => setTitle(event.target.value)} maxLength={255} required />
      </label>
      <label className="chat-action-field">
        <span>Job description</span>
        <textarea value={rawText} onChange={event => setRawText(event.target.value)} rows={4} disabled={!!file} />
      </label>
      <label className="chat-action-field">
        <span>Or attach a JD file (PDF, DOCX, or TXT)</span>
        <input type="file" accept=".pdf,.docx,.txt" onChange={event => setFile(event.target.files?.[0] ?? null)} />
      </label>
      {error && <ActionMessage error>{error}</ActionMessage>}
      <Button type="submit" size="sm" loading={saving}>Create campaign</Button>
    </form>
  );
}

function CandidateListAction({ action }: ChatActionRendererProps) {
  const campaignId = stringValue(action.payload.campaign_id);
  const campaignTitle = stringValue(action.payload.campaign_title);
  const initialCandidates = Array.isArray(action.payload.candidates) ? action.payload.candidates : undefined;
  const [candidates, setCandidates] = useState<ChatScreeningCandidate[]>(() =>
    initialCandidates?.map(mapActionCandidate).filter((candidate): candidate is ChatScreeningCandidate => candidate !== null) ?? [],
  );
  const [loading, setLoading] = useState(Boolean(campaignId && !initialCandidates));
  const { error, setError } = useActionError();

  useEffect(() => {
    if (!campaignId || initialCandidates) return;
    let cancelled = false;
    const load = async () => {
      const [candidateResult, screeningResult] = await Promise.allSettled([
        listCampaignCandidates(campaignId),
        listCampaignDocumentScreenings(campaignId),
      ]);
      if (cancelled) return;
      if (candidateResult.status === 'rejected') {
        setError(candidateResult.reason instanceof Error ? candidateResult.reason.message : 'Candidates could not be loaded.');
        setLoading(false);
        return;
      }
      const screenings = screeningResult.status === 'fulfilled' ? screeningResult.value : [];
      if (screeningResult.status === 'rejected') {
        setError(screeningResult.reason instanceof Error ? screeningResult.reason.message : 'Screening results could not be loaded.');
      }
      const screeningsByCandidate = new Map(screenings.map(screening => [screening.candidate_id, screening]));
      const mapped = candidateResult.value.map(candidate => {
        const apiCandidate = mapCampaignCandidate(candidate, undefined, campaignTitle ?? 'Campaign');
        const screening = screeningsByCandidate.get(candidate.id);
        return screening ? applyDocumentScreening(apiCandidate, screening) : apiCandidate;
      });
      setCandidates(mapped.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        workflowStep: candidate.workflowStep,
        workflowStepStatus: candidate.workflowStepStatus,
        matchScore: candidate.matchScore,
        experience: candidate.experience,
        education: candidate.education,
        strongMatches: candidate.strongMatches ?? [],
        missingRequirements: candidate.missingRequirements ?? [],
        summary: candidate.documentScreeningSummary ?? candidate.aiSummary,
      })));
      setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [campaignId, campaignTitle, initialCandidates, setError]);

  return (
    <section style={panelStyle}>
      <h3 style={titleStyle}>{campaignTitle ? `Screening results · ${campaignTitle}` : 'Screening results'}</h3>
      {loading && <ActionMessage>Loading candidates…</ActionMessage>}
      {(error || (!campaignId && !initialCandidates ? 'No campaign ID was provided.' : '')) && (
        <ActionMessage error>{error || 'No campaign ID was provided.'}</ActionMessage>
      )}
      {!loading && candidates.length === 0 && !error && <ActionMessage>No candidates were included in these screening results.</ActionMessage>}
      <div className="chat-screening-results">
        {candidates.slice(0, 20).map(candidate => (
          <article key={candidate.id} className="chat-screening-card">
            <div className="chat-screening-card__header">
              <Avatar name={candidate.name} size="sm" color="var(--brand-primary)" />
              <div className="chat-screening-card__identity">
                <strong>{candidate.name}</strong>
                {(candidate.email || candidate.phone) && (
                  <span>{[candidate.email, candidate.phone].filter(Boolean).join(' · ')}</span>
                )}
              </div>
              <span className="chat-screening-card__status">
                {candidate.workflowStepStatus ?? candidate.workflowStep ?? 'Screening status unavailable'}
              </span>
              {candidate.matchScore !== undefined && <span className="chat-screening-card__score">{candidate.matchScore}%</span>}
            </div>
            {(candidate.experience || candidate.education) && (
              <p className="chat-screening-card__meta">{[candidate.experience, candidate.education].filter(Boolean).join(' · ')}</p>
            )}
            {(candidate.strongMatches.length > 0 || candidate.missingRequirements.length > 0) && (
              <div className="chat-screening-card__fields">
                {candidate.strongMatches.length > 0 && (
                  <div><strong>Matched</strong><ul>{candidate.strongMatches.map(item => <li key={item}>{item}</li>)}</ul></div>
                )}
                {candidate.missingRequirements.length > 0 && (
                  <div><strong>Unmatched</strong><ul>{candidate.missingRequirements.map(item => <li key={item}>{item}</li>)}</ul></div>
                )}
              </div>
            )}
            {candidate.summary && <p className="chat-screening-card__summary">{candidate.summary}</p>}
          </article>
        ))}
      </div>
      {candidates.length > 20 && <ActionMessage>Showing 20 of {candidates.length} candidates.</ActionMessage>}
    </section>
  );
}

function CandidateUploadAction({ action }: ChatActionRendererProps) {
  const [campaignTitle, setCampaignTitle] = useState(stringValue(action.payload.campaign_title) ?? '');
  const [uploading, setUploading] = useState(false);
  const [batchId, setBatchId] = useState('');
  const { error, setError } = useActionError();
  const campaignId = stringValue(action.payload.campaign_id);

  useEffect(() => {
    if (campaignTitle || !campaignId) return;
    let cancelled = false;
    listCampaigns().then(items => {
      const campaign = items.find(item => item.id === campaignId);
      if (!cancelled && campaign) setCampaignTitle(campaign.title);
    }).catch(reason => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Campaign details could not be loaded.');
    });
    return () => { cancelled = true; };
  }, [campaignId, campaignTitle, setError]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!campaignId || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadCandidateFiles(campaignId, files);
      setBatchId(result.batch_id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Candidate files could not be uploaded.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <section style={panelStyle}>
      <h3 style={titleStyle}>Upload candidates{campaignTitle ? ` for ${campaignTitle}` : ''}</h3>
      <ActionMessage>Choose one or more candidate files. Supported formats: PDF, DOCX, TXT, ZIP, and CSV.</ActionMessage>
      <label className="chat-action-field">
        <span>Candidate files</span>
        <input type="file" multiple accept=".pdf,.docx,.txt,.zip,.csv" onChange={handleUpload} disabled={!campaignId || uploading} />
      </label>
      {uploading && <ActionMessage>Uploading files…</ActionMessage>}
      {error && <ActionMessage error>{error}</ActionMessage>}
      {batchId && campaignId && (
        <BatchStatusAction action={{ type: 'SHOW_BATCH_STATUS', payload: { batch_id: batchId, campaign_id: campaignId } }} upload />
      )}
    </section>
  );
}

type BatchSummary = {
  status: string;
  processed?: number;
  total?: number;
  failed?: number;
};

function summarizeBatch(batch: ScreeningBatchStatus | UploadBatchStatus): BatchSummary {
  if ('total_candidates' in batch) {
    return { status: batch.status, processed: batch.processed, total: batch.total_candidates, failed: batch.failed };
  }
  return { status: batch.status, processed: batch.processed, total: batch.total_files, failed: batch.failed };
}

function BatchStatusAction({ action, upload = false }: { action: UIAction; upload?: boolean }) {
  const campaignId = stringValue(action.payload.campaign_id);
  const batchId = stringValue(action.payload.batch_id);
  const shouldPoll = Boolean(campaignId && batchId && (upload || action.type === 'SHOW_SCREENING_STATUS'));
  const [batch, setBatch] = useState<BatchSummary | null>(null);
  const [loading, setLoading] = useState(shouldPoll);
  const { error, setError } = useActionError();

  useEffect(() => {
    if (!shouldPoll || !campaignId || !batchId) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const status = upload
          ? await getUploadStatus(campaignId, batchId)
          : await getScreeningStatus(campaignId, batchId);
        if (cancelled) return;
        const summary = summarizeBatch(status);
        setBatch(summary);
        setError('');
        setLoading(false);
        if (!['completed', 'complete', 'failed', 'finished', 'done', 'success'].includes(summary.status.toLowerCase())) {
          timeout = setTimeout(() => { void poll(); }, 2500);
        }
      } catch (reason) {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : 'Batch status could not be loaded.');
        setLoading(false);
      }
    };
    void poll();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [batchId, campaignId, setError, shouldPoll, upload]);

  const batchSummaryKeys = ['status', 'total', 'processed', 'failed', 'finished_at'] as const;
  const summaryDetails = Object.fromEntries(
    batchSummaryKeys.flatMap(key => action.payload[key] === undefined ? [] : [[key, action.payload[key]]]),
  );
  const genericDetails = objectValue(action.payload.batch_details)
    ?? (action.type === 'SHOW_BATCH_STATUS' && Object.keys(summaryDetails).length > 0 ? summaryDetails : undefined);
  const requiresPollingIds = upload || action.type === 'SHOW_SCREENING_STATUS';

  return (
    <section style={panelStyle}>
      <h3 style={titleStyle}>
        {upload ? 'Upload progress' : action.type === 'SHOW_SCREENING_STATUS' ? 'Screening progress' : 'Batch status'}
      </h3>
      {batchId && <ActionMessage>Batch: {batchId}</ActionMessage>}
      {loading && <ActionMessage>Checking batch status…</ActionMessage>}
      {batch && (
        <ActionMessage>
          Status: {batch.status}
          {batch.total !== undefined && ` · ${batch.processed ?? 0} of ${batch.total} processed`}
          {batch.failed !== undefined && batch.failed > 0 && ` · ${batch.failed} failed`}
        </ActionMessage>
      )}
      {(error || (requiresPollingIds && (!batchId || !campaignId)
        ? 'Campaign and batch IDs are required to check progress.'
        : '')) && (
        <ActionMessage error>
          {error || 'Campaign and batch IDs are required to check progress.'}
        </ActionMessage>
      )}
      {!shouldPoll && genericDetails && (
        <div className="chat-action-list">
          {Object.entries(genericDetails).map(([key, value]) => (
            <div key={key} className="chat-action-list__item">
              <span>{key.replace(/[_-]/g, ' ')}</span>
              <span>{typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '—'}</span>
            </div>
          ))}
        </div>
      )}
      {!shouldPoll && !genericDetails && !error && !requiresPollingIds && (
        <ActionMessage>This response did not include status details.</ActionMessage>
      )}
    </section>
  );
}

export function ChatActionRenderer(props: ChatActionRendererProps) {
  switch (props.action.type) {
    case 'SHOW_CAMPAIGN_LIST':
      return <CampaignListAction {...props} />;
    case 'SHOW_CAMPAIGN_PICKER':
      return <CampaignListAction {...props} picker />;
    case 'SHOW_CAMPAIGN_DETAIL':
      return <CampaignDetailAction {...props} />;
    case 'SHOW_CAMPAIGN_CREATE_FORM':
      return <CampaignCreateAction {...props} />;
    case 'SHOW_CANDIDATE_LIST':
      return <CandidateListAction {...props} />;
    case 'SHOW_CANDIDATE_UPLOAD':
      return <CandidateUploadAction {...props} />;
    case 'SHOW_SCREENING_STATUS':
      return <BatchStatusAction {...props} />;
    case 'SHOW_BATCH_STATUS':
      return <BatchStatusAction {...props} />;
    default:
      return null;
  }
}
