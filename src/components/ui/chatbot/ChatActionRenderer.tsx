import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateHiring from '../../../pages/CreateHiring';
import HiringWorkspace from '../../../pages/HiringWorkspace';
import ScreeningProgress from '../../../pages/ScreeningProgress';
import CandidateScreeningReport from '../../../pages/CandidateScreeningReport';
import {
  getScreeningStatus,
  getUploadStatus,
  listCampaigns,
} from '../../../services/campaignService';
import type { CampaignListItem, ScreeningBatchStatus, UploadBatchStatus } from '../../../services/campaignService';
import type { UIAction } from './types';

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

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function ActionMessage({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p role={error ? 'alert' : 'status'} style={{ color: error ? '#b91c1c' : '#475569', fontSize: 12, lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

function ExistingPageAction({ action, onActionTrigger }: ChatActionRendererProps) {
  const payload = action.payload;
  const campaignId = stringValue(payload.campaign_id) ?? stringValue(payload.hiring_id);
  const candidateId = stringValue(payload.candidate_id);
  let location = '';
  let routePath = '';
  let page: React.ReactElement | null = null;
  let missing: string | undefined;

  switch (action.type) {
    case 'SHOW_CAMPAIGN_LIST':
    case 'SHOW_CAMPAIGN_PICKER':
      return <CampaignListAction action={action} />;
    case 'SHOW_CAMPAIGN_DETAIL':
      if (!campaignId) {
        missing = 'This action did not include a campaign ID.';
        break;
      }
      location = `/hiring/${encodeURIComponent(campaignId)}`;
      routePath = '/hiring/:id';
      page = <HiringWorkspace />;
      break;
    case 'SHOW_CANDIDATE_LIST':
      if (!campaignId) {
        missing = 'This action did not include a campaign ID.';
        break;
      }
      location = `/hiring/${encodeURIComponent(campaignId)}?tab=candidates`;
      routePath = '/hiring/:id';
      page = <HiringWorkspace />;
      break;
    case 'SHOW_SCREENING_RESULTS':
      if (!campaignId) {
        missing = 'This action did not include a campaign ID.';
        break;
      }
      location = `/hiring/${encodeURIComponent(campaignId)}?tab=screening`;
      routePath = '/hiring/:id';
      page = <HiringWorkspace />;
      break;
    case 'SHOW_CANDIDATE_SCREENING_RESULT':
      if (!campaignId || !candidateId) {
        missing = 'This action requires both a campaign ID and candidate ID.';
        break;
      }
      location = `/screening-reports/${encodeURIComponent(campaignId)}/candidate/${encodeURIComponent(candidateId)}`;
      routePath = '/screening-reports/:hiringId/candidate/:candidateId';
      page = <CandidateScreeningReport />;
      break;
    case 'SHOW_SCREENING_STATUS': {
      const batchId = stringValue(payload.batch_id);
      if (!campaignId || !batchId) {
        missing = 'This action requires both a campaign ID and screening batch ID.';
        break;
      }
      location = `/hiring/${encodeURIComponent(campaignId)}/screening?batch_id=${encodeURIComponent(batchId)}`;
      routePath = '/hiring/:id/screening';
      page = <ScreeningProgress />;
      break;
    }
    case 'SHOW_CAMPAIGN_CREATE_FORM':
      return <CampaignCreateAction action={action} onActionTrigger={onActionTrigger} />;
    default:
      return null;
  }

  if (missing) {
    return <section style={panelStyle}><ActionMessage error>{missing}</ActionMessage></section>;
  }

  return (
    <div className="chat-existing-page" style={{
      marginTop: 12,
      maxHeight: 'min(72vh, 760px)',
      overflow: 'auto',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      background: '#fff',
    }}>
      <Routes location={location} key={location}>
        <Route path={routePath} element={page ? React.cloneElement(page, { key: location }) : null} />
      </Routes>
    </div>
  );
}

function CampaignListAction({ action }: { action: UIAction }) {
  const [campaigns, setCampaigns] = useState<CampaignListItem[] | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listCampaigns()
      .then(result => {
        if (!cancelled) setCampaigns(result);
      })
      .catch(reason => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Campaigns could not be loaded.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const campaignPicker = action.type === 'SHOW_CAMPAIGN_PICKER';

  if (selectedCampaign) {
    return (
      <section style={panelStyle} aria-label={`${selectedCampaign.title} campaign details`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <strong style={{ color: '#0f172a', fontSize: 14 }}>{selectedCampaign.title}</strong>
          <button
            type="button"
            onClick={() => setSelectedCampaign(null)}
            style={{ border: 0, background: 'transparent', color: '#2563eb', cursor: 'pointer', fontSize: 12 }}
          >
            All campaigns
          </button>
        </div>
        <ExistingPageAction
          action={{ type: 'SHOW_CAMPAIGN_DETAIL', payload: { campaign_id: selectedCampaign.id } }}
          onActionTrigger={() => {}}
        />
      </section>
    );
  }

  return (
    <section style={panelStyle} aria-label={campaignPicker ? 'Choose a campaign' : 'Your campaigns'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <strong style={{ color: '#0f172a', fontSize: 14 }}>
            {campaignPicker ? 'Choose a campaign' : 'Your campaigns'}
          </strong>
          <ActionMessage>
            {campaignPicker
              ? stringValue(action.payload.reason) ?? 'Select a campaign to continue.'
              : 'Select a campaign to open its existing hiring workspace details here.'}
          </ActionMessage>
        </div>
      </div>

      {loading && <ActionMessage>Loading campaigns…</ActionMessage>}
      {error && <ActionMessage error>{error}</ActionMessage>}
      {!loading && !error && campaigns?.length === 0 && (
        <ActionMessage>You don’t have any campaigns yet.</ActionMessage>
      )}

      {campaigns && campaigns.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {campaigns.map(campaign => (
            <button
              key={campaign.id}
              type="button"
              onClick={() => setSelectedCampaign(campaign)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                width: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: 9,
                background: '#fff',
                padding: '11px 12px',
                color: '#0f172a',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 600 }}>
                {campaign.title}
              </span>
              <span style={{ flex: '0 0 auto', color: '#64748b', fontSize: 11 }}>View details →</span>
            </button>
          ))}
        </div>
      )}

    </section>
  );
}

function CandidateUploadAction({ action }: ChatActionRendererProps) {
  const campaignId = stringValue(action.payload.campaign_id) ?? '';
  const [batchId, setBatchId] = useState('');

  if (!campaignId) {
    return <section style={panelStyle}><ActionMessage error>This action did not include a campaign ID.</ActionMessage></section>;
  }

  return (
    <div>
      <CreateHiring
        key={campaignId}
        embeddedCampaignId={campaignId}
        embeddedMode="candidate-upload"
        onCandidateUploadComplete={setBatchId}
      />
      {batchId && (
        <BatchStatusAction
          key={batchId}
          action={{ type: 'SHOW_BATCH_STATUS', payload: { batch_id: batchId, campaign_id: campaignId } }}
          upload
        />
      )}
    </div>
  );
}

function CampaignCreateAction({ action }: ChatActionRendererProps) {
  const [launch, setLaunch] = useState<{ campaignId: string; title: string; batchId: string } | null>(null);

  if (launch) {
    const progressUrl = `/hiring/${encodeURIComponent(launch.campaignId)}/screening?batch_id=${encodeURIComponent(launch.batchId)}`;
    return (
      <section style={panelStyle}>
        <strong style={{ color: '#0f172a', fontSize: 14 }}>Screening started</strong>
        <ActionMessage>
          “{launch.title}” was created and screening has been queued. You can follow progress here.
        </ActionMessage>
        <BatchStatusAction
          action={{
            type: 'SHOW_BATCH_STATUS',
            payload: {
              campaign_id: launch.campaignId,
              batch_id: launch.batchId,
              batch_type: 'screening',
            },
          }}
        />
        <a href={progressUrl} style={{ display: 'inline-block', marginTop: 12, fontSize: 13 }}>
          Open full screening progress
        </a>
      </section>
    );
  }

  return (
    <div className="chat-existing-page" style={{
      marginTop: 12,
      maxHeight: 'min(72vh, 760px)',
      overflow: 'auto',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      background: '#fff',
    }}>
      <CreateHiring
        initialTitle={stringValue(action.payload.initial_title)}
        embeddedMode="campaign-create"
        onScreeningStarted={setLaunch}
      />
    </div>
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
  const batchType = stringValue(action.payload.batch_type)?.toLowerCase();
  const uploadBatch = upload || batchType === 'upload' || batchId?.startsWith('batch_') === true;
  const screeningBatch = batchType === 'screening' || batchId?.startsWith('screen_') === true;
  const requiresPolling = uploadBatch || screeningBatch;
  const [batchResult, setBatchResult] = useState<{ id: string; summary: BatchSummary } | null>(null);
  const [errorResult, setErrorResult] = useState<{ id: string; message: string } | null>(null);
  const shouldPoll = Boolean(campaignId && batchId && requiresPolling);
  const batch = batchId && batchResult?.id === batchId ? batchResult.summary : null;
  const error = batchId && errorResult?.id === batchId ? errorResult.message : '';
  const loading = shouldPoll && !batch && !error;
  const statusDetails = ['status', 'total', 'processed', 'failed', 'finished_at'].reduce<Record<string, unknown>>(
    (details, key) => {
      if (action.payload[key] !== undefined) details[key] = action.payload[key];
      return details;
    },
    {},
  );
  const genericDetails = objectValue(action.payload.batch_details)
    ?? (Object.keys(statusDetails).length ? statusDetails : undefined);

  React.useEffect(() => {
    if (!shouldPoll || !campaignId || !batchId) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const status = uploadBatch
          ? await getUploadStatus(campaignId, batchId)
          : await getScreeningStatus(campaignId, batchId);
        if (cancelled) return;
        const summary = summarizeBatch(status);
        setBatchResult({ id: batchId, summary });
        setErrorResult(null);
        if (!['completed', 'complete', 'failed', 'finished', 'done', 'success', 'cancelled', 'canceled'].includes(summary.status.toLowerCase())) {
          timeout = setTimeout(() => { void poll(); }, 2500);
        }
      } catch (reason) {
        if (!cancelled) {
          setErrorResult({
            id: batchId,
            message: reason instanceof Error ? reason.message : 'Batch status could not be loaded.',
          });
        }
      }
    };
    void poll();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [batchId, campaignId, shouldPoll, uploadBatch]);

  return (
    <section style={panelStyle}>
      <strong style={{ color: '#0f172a', fontSize: 13 }}>
        {uploadBatch ? 'Upload progress' : screeningBatch ? 'Screening progress' : 'Batch status'}
      </strong>
      {batchId && <ActionMessage>Batch: {batchId}</ActionMessage>}
      {loading && <ActionMessage>Checking batch status…</ActionMessage>}
      {batch && (
        <ActionMessage>
          Status: {batch.status}
          {batch.total !== undefined && ` · ${batch.processed ?? 0} of ${batch.total} processed`}
          {batch.failed !== undefined && batch.failed > 0 && ` · ${batch.failed} failed`}
        </ActionMessage>
      )}
      {error && <ActionMessage error>{error}</ActionMessage>}
      {requiresPolling && !campaignId && <ActionMessage error>Campaign ID is required to check progress.</ActionMessage>}
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
      {!shouldPoll && !genericDetails && !error && (
        <ActionMessage>This response did not include status details.</ActionMessage>
      )}
    </section>
  );
}

export function ChatActionRenderer(props: ChatActionRendererProps) {
  switch (props.action.type) {
    case 'SHOW_CAMPAIGN_LIST':
    case 'SHOW_CAMPAIGN_PICKER':
    case 'SHOW_CAMPAIGN_DETAIL':
    case 'SHOW_CANDIDATE_LIST':
    case 'SHOW_SCREENING_RESULTS':
    case 'SHOW_CANDIDATE_SCREENING_RESULT':
    case 'SHOW_SCREENING_STATUS':
      return <ExistingPageAction {...props} />;
    case 'SHOW_CAMPAIGN_CREATE_FORM':
      return <CampaignCreateAction {...props} />;
    case 'SHOW_CANDIDATE_UPLOAD':
      return <CandidateUploadAction {...props} />;
    case 'SHOW_BATCH_STATUS':
      return <BatchStatusAction {...props} />;
    default:
      return null;
  }
}
