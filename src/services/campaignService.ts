// ============================================================
// SoloBuildAI — Campaign Service
// Wraps all /campaigns endpoints from the backend spec.
//
// Endpoints covered:
//  POST   /campaigns                                    — create campaign
//  PATCH  /campaigns/{id}                               — update campaign
//  GET    /campaigns                                    — list campaigns
//  POST   /campaigns/{id}/candidates/upload             — upload resumes/CSVs
//  POST   /campaigns/{id}/candidates/upload/{bid}/retry — retry failed upload
//  GET    /campaigns/{id}/candidates/upload/{bid}/status — upload batch status
//  POST   /campaigns/{id}/candidates                    — list candidates
//  PATCH  /campaigns/{id}/candidates/{cid}              — update candidate
//  POST   /campaigns/{id}/candidates/screen             — start screening
//  GET    /campaigns/{id}/candidates/screen/{bid}/status — screening status
//  POST   /campaigns/{id}/candidates/call               — start calling
//  POST   /campaigns/{id}/candidates/call/{bid}/status  — calling status
// ============================================================

import { apiRequest } from './api';
import type { Candidate } from '../types';

// ——— Campaign ———

export interface CampaignResponse {
  id: string;
  title: string;
  workflow_template_id: string;
  agent_id: string;
  raw_text?: string;
  required_fields?: Record<string, unknown>;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignListItem {
  id: string;
  title: string;
  workflow_template_id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new campaign (hiring).
 * Uses multipart/form-data.
 * Provide either rawText OR file, not both.
 *
 * required_fields should include: location, employment_type, role_summary
 */
export interface CreateCampaignParams {
  title: string;
  rawText?: string;
  file?: File;
  required_fields?: {
    location?: string;
    employment_type?: string;
    role_summary?: string;
    [key: string]: unknown;
  };
}

export async function createCampaign(params: CreateCampaignParams): Promise<CampaignResponse> {
  const fd = new FormData();
  fd.append('title', params.title);
  if (params.rawText) fd.append('raw_text', params.rawText);
  if (params.file) fd.append('file', params.file);
  if (params.required_fields) {
    fd.append('required_fields', JSON.stringify(params.required_fields));
  }
  return apiRequest<CampaignResponse>('/campaigns', { method: 'POST', formData: fd });
}

/**
 * Update an existing campaign.
 */
export async function updateCampaign(
  campaignId: string,
  params: Partial<CreateCampaignParams> & { agentId?: string }
): Promise<CampaignResponse> {
  const fd = new FormData();
  if (params.title) fd.append('title', params.title);
  if (params.rawText) fd.append('raw_text', params.rawText);
  if (params.file) fd.append('file', params.file);
  if (params.required_fields) {
    fd.append('required_fields', JSON.stringify(params.required_fields));
  }

  const query = params.agentId
    ? `?agent_id=${encodeURIComponent(params.agentId)}`
    : '';
  const hasFormData = Boolean(params.title || params.rawText || params.file || params.required_fields);
  return apiRequest<CampaignResponse>(`/campaigns/${campaignId}${query}`, {
    method: 'PATCH',
    ...(hasFormData ? { formData: fd } : {}),
  });
}

/** List all campaigns belonging to the current user. */
export async function listCampaigns(): Promise<CampaignListItem[]> {
  return apiRequest<CampaignListItem[]>('/campaigns', { method: 'GET' });
}

// ——— Candidate file upload ———

export interface UploadBatchResponse {
  batch_id: string;
  status: string;
  accepted_files: number;
  rejected_files: number;
}

export interface UploadBatchStatus {
  batch_id: string;
  status: string;
  total_files: number;
  processed: number;
  failed: number;
  created_at: string;
  updated_at: string;
  finished_at: string;
  failed_files: string[];
}

/**
 * Upload candidate resume/CSV files.
 * Supports PDF, DOCX, TXT, ZIP, CSV.
 * Pass multiple files; they all go in the `files` FormData field.
 */
export async function uploadCandidateFiles(
  campaignId: string,
  files: File[]
): Promise<UploadBatchResponse> {
  const fd = new FormData();
  files.forEach(f => fd.append('files', f));
  return apiRequest<UploadBatchResponse>(
    `/campaigns/${campaignId}/candidates/upload`,
    { method: 'POST', formData: fd }
  );
}

/** Retry failed uploads in a batch. */
export async function retryUpload(
  campaignId: string,
  batchId: string
): Promise<UploadBatchResponse> {
  return apiRequest<UploadBatchResponse>(
    `/campaigns/${campaignId}/candidates/upload/${batchId}/retry`,
    { method: 'POST' }
  );
}

/** Poll upload batch status. */
export async function getUploadStatus(
  campaignId: string,
  batchId: string
): Promise<UploadBatchStatus> {
  return apiRequest<UploadBatchStatus>(
    `/campaigns/${campaignId}/candidates/upload/${batchId}/status`,
    { method: 'GET' }
  );
}

// ——— Candidates in a campaign ———

export interface CampaignCandidate {
  id: string;
  campaign_id: string;
  name: string;
  email: string;
  phone: string;
  file_url: string;
  ingestion_item_id: string;
  extracted_fields: Record<string, unknown>;
  workflow_step: string;
  step_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export interface DocumentScreeningResponse {
  id: string;
  campaign_id: string;
  candidate_id: string;
  match_score: number | null;
  matched_fields: Record<string, unknown> | null;
  unmatched_fields: Record<string, unknown> | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

function getFieldText(fields: Record<string, unknown>, ...names: string[]): string | undefined {
  const key = Object.keys(fields).find(field => names.includes(field.toLowerCase()));
  if (!key) return undefined;
  const value = fields[key];
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const values = value.filter((item): item is string | number => (
      typeof item === 'string' || typeof item === 'number'
    ));
    return values.length ? values.join(', ') : undefined;
  }
  return undefined;
}

function getFieldLabels(fields: Record<string, unknown> | null): string[] {
  if (!fields) return [];
  return Object.entries(fields).map(([key, value]) => {
    const label = key.replace(/[_-]/g, ' ');
    const text = getFieldValueText(value);
    return text ? `${label}: ${text}` : label;
  });
}

function getFieldValueText(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const values = value.map(getFieldValueText).filter((item): item is string => Boolean(item));
    return values.length ? values.join(', ') : undefined;
  }
  if (value && typeof value === 'object') {
    const values = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const text = getFieldValueText(item);
        return text ? `${key.replace(/[_-]/g, ' ')}: ${text}` : undefined;
      })
      .filter((item): item is string => Boolean(item));
    return values.length ? values.join('; ') : undefined;
  }
  return undefined;
}

export function applyDocumentScreening(
  candidate: Candidate,
  screening: DocumentScreeningResponse,
): Candidate {
  const score = screening.match_score == null
    ? undefined
    : screening.match_score >= 0 && screening.match_score <= 1
      ? screening.match_score * 100
      : screening.match_score;
  return {
    ...candidate,
    matchScore: score,
    compatibility: score === undefined ? undefined : score >= 60 ? 'compatible' : 'not_compatible',
    strongMatches: getFieldLabels(screening.matched_fields),
    missingRequirements: getFieldLabels(screening.unmatched_fields),
    aiRecommendation: screening.summary ?? undefined,
    aiSummary: screening.summary ?? undefined,
    documentScreeningId: screening.id,
    documentScreeningSummary: screening.summary ?? undefined,
    documentScreeningCreatedAt: screening.created_at,
    documentScreeningUpdatedAt: screening.updated_at,
    includedInCallList: score === undefined ? false : score >= 60,
  };
}

/** Map backend candidate and document-screening records into the app's campaign model. */
export function mapCampaignCandidate(
  candidate: CampaignCandidate,
  screening: DocumentScreeningResponse | undefined,
  hiringTitle: string,
): Candidate {
  const extracted = candidate.extracted_fields ?? {};
  const skillsText = getFieldText(extracted, 'skills', 'skill');

  const mappedCandidate: Candidate = {
    id: candidate.id,
    name: candidate.name || candidate.email || candidate.id,
    phone: candidate.phone || '',
    email: candidate.email || undefined,
    location: getFieldText(extracted, 'location', 'city', 'current_location'),
    position: hiringTitle,
    experience: getFieldText(extracted, 'experience', 'years_experience', 'experience_years'),
    skills: skillsText ? skillsText.split(',').map(skill => skill.trim()).filter(Boolean) : undefined,
    education: getFieldText(extracted, 'education', 'qualification', 'degree'),
    extractedFields: extracted,
    resumeUrl: candidate.file_url || undefined,
    workflowStep: candidate.workflow_step || undefined,
    workflowStepStatus: candidate.step_status,
    backendCampaignCandidate: true,
    candidateUpdatedAt: candidate.updated_at || candidate.created_at,
    hiringId: candidate.campaign_id,
    hiringTitle,
    status: 'added',
    matchScore: undefined,
    compatibility: undefined,
    strongMatches: undefined,
    missingRequirements: undefined,
    aiRecommendation: undefined,
    aiSummary: undefined,
    includedInCallList: false,
    documentScreeningId: undefined,
    documentScreeningSummary: undefined,
    documentScreeningCreatedAt: undefined,
    documentScreeningUpdatedAt: undefined,
    lastActivity: '—',
  };
  return screening ? applyDocumentScreening(mappedCandidate, screening) : mappedCandidate;
}

/** Get all candidates for a campaign. */
export async function listCampaignCandidates(
  campaignId: string
): Promise<CampaignCandidate[]> {
  return apiRequest<CampaignCandidate[]>(
    `/campaigns/${campaignId}/candidates`,
    { method: 'GET' }
  );
}

/** Get document screening results for all candidates in a campaign. */
export async function listCampaignDocumentScreenings(
  campaignId: string
): Promise<DocumentScreeningResponse[]> {
  return apiRequest<DocumentScreeningResponse[]>(
    `/campaigns/${campaignId}/document-screenings`,
    { method: 'GET' }
  );
}

/** Get the document screening result for one candidate. */
export async function getCandidateDocumentScreening(
  campaignId: string,
  candidateId: string
): Promise<DocumentScreeningResponse[]> {
  return apiRequest<DocumentScreeningResponse[]>(
    `/campaigns/${campaignId}/candidates/${candidateId}/document-screenings`,
    { method: 'GET' }
  );
}

/** Update a candidate's details. */
export interface UpdateCandidatePayload {
  name?: string;
  email?: string;
  phone?: string;
  extracted_fields?: Record<string, unknown>;
}

export async function updateCampaignCandidate(
  campaignId: string,
  candidateId: string,
  payload: UpdateCandidatePayload
): Promise<CampaignCandidate> {
  return apiRequest<CampaignCandidate>(
    `/campaigns/${campaignId}/candidates/${candidateId}`,
    { method: 'PATCH', body: payload }
  );
}

// ——— Screening ———

export interface BatchJobResponse {
  batch_id: string;
  status: string;
}

export interface ScreeningBatchStatus {
  batch_id: string;
  status: string;
  total_candidates: number;
  processed: number;
  failed: number;
  created_at: string;
  updated_at: string;
  finished_at: string;
  failed_candidates: string[];
}

/** Kick off resume screening for all candidates in a campaign. */
export async function screenCandidates(
  campaignId: string
): Promise<BatchJobResponse> {
  return apiRequest<BatchJobResponse>(
    `/campaigns/${campaignId}/candidates/screen`,
    { method: 'POST' }
  );
}

/** Poll screening batch status. */
export async function getScreeningStatus(
  campaignId: string,
  batchId: string
): Promise<ScreeningBatchStatus> {
  return apiRequest<ScreeningBatchStatus>(
    `/campaigns/${campaignId}/candidates/screen/${batchId}/status`,
    { method: 'GET' }
  );
}

// ——— Calling ———

export interface CallingBatchStatus {
  batch_id: string;
  status: string;
  total_candidates: number;
  processed: number;
  failed: number;
  created_at: string;
  updated_at: string;
  finished_at: string;
  failed_candidates: string[];
}

/** Kick off AI calling for a list of candidate IDs. */
export async function callCandidates(
  campaignId: string,
  candidateIds: string[]
): Promise<BatchJobResponse> {
  return apiRequest<BatchJobResponse>(
    `/campaigns/${campaignId}/candidates/call`,
    { method: 'POST', body: { candidate_ids: candidateIds } }
  );
}

/** Poll calling batch status. */
export async function getCallingStatus(
  campaignId: string,
  batchId: string
): Promise<CallingBatchStatus> {
  return apiRequest<CallingBatchStatus>(
    `/campaigns/${campaignId}/candidates/call/${batchId}/status`,
    { method: 'POST' }
  );
}
