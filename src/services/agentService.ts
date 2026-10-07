// ============================================================
// SoloBuildAI — Agent Service
// Wraps: POST /agents, GET /agents, GET /agents/{id},
//        PATCH /agents/{id}, DELETE /agents/{id}
// ============================================================

import { apiRequest } from './api';

// ——— Backend shape (snake_case from API) ———
export interface AgentResponse {
  id: string;
  name: string;
  conversation_style: string;
  languages: string;
  voice: string;
  interview_instruction: string;
  is_preset?: boolean;
}

export interface AgentListResponse extends AgentResponse {
  is_preset: boolean;
}

// ——— Allowed enum values (as per backend spec) ———
export type ConversationStyle =
  | 'Friendly Conversational'
  | 'Conversational'
  | 'Formal'
  | 'Professional';

export type AgentLanguage =
  | 'English'
  | 'English + Hindi'
  | 'English + Hindi + Marathi';

export type AgentVoice =
  | 'Warm & Clear'
  | 'Clear & Confident'
  | 'Natural & Clear'
  | 'Soft & Professional';

export interface AgentPayload {
  name: string;
  conversation_style: ConversationStyle;
  languages: AgentLanguage;
  voice: AgentVoice;
  interview_instruction: string;
}

// ——— Create agent ———
export async function createAgent(payload: AgentPayload): Promise<AgentResponse> {
  return apiRequest<AgentResponse>('/agents', {
    method: 'POST',
    body: payload,
  });
}

// ——— List all agents ———
export async function listAgents(): Promise<AgentListResponse[]> {
  return apiRequest<AgentListResponse[]>('/agents', { method: 'GET' });
}

// ——— Get single agent ———
export async function getAgent(agentId: string): Promise<AgentResponse> {
  return apiRequest<AgentResponse>(`/agents/${agentId}`, { method: 'GET' });
}

// ——— Update agent ———
export async function updateAgent(
  agentId: string,
  payload: Partial<AgentPayload>
): Promise<AgentResponse> {
  return apiRequest<AgentResponse>(`/agents/${agentId}`, {
    method: 'PATCH',
    body: payload,
  });
}

// ——— Delete agent ———
export async function deleteAgent(agentId: string): Promise<void> {
  return apiRequest<void>(`/agents/${agentId}`, { method: 'DELETE' });
}

// ——— Helpers: map between backend format and frontend AIRecruiter shape ———

/** Maps frontend form values → backend ConversationStyle string */
export const STYLE_TO_API: Record<string, ConversationStyle> = {
  friendly_professional: 'Friendly Conversational',
  professional: 'Professional',
  conversational: 'Conversational',
  formal: 'Formal',
};

/** Maps backend ConversationStyle → frontend form value key */
export const STYLE_FROM_API: Record<string, string> = {
  'Friendly Conversational': 'friendly_professional',
  'Professional': 'professional',
  'Conversational': 'conversational',
  'Formal': 'formal',
};

/** Maps frontend language key → backend language string */
export const LANG_TO_API: Record<string, AgentLanguage> = {
  english: 'English',
  english_hindi: 'English + Hindi',
  english_hindi_marathi: 'English + Hindi + Marathi',
};

/** Maps backend language string → frontend language array (for display) */
export const LANG_ARRAY_FROM_API: Record<string, string[]> = {
  'English': ['English'],
  'English + Hindi': ['English', 'Hindi'],
  'English + Hindi + Marathi': ['English', 'Hindi', 'Marathi'],
};
