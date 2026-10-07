import { apiRequest } from './api';
import type { ChatMessageData, UIAction } from '../components/ui/chatbot/types';

export interface ChatSessionListItem {
  id: string;
  title: string | null;
  turn_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionResponse extends ChatSessionListItem {
  summary: string | null;
}

interface ChatMessageHistoryItem {
  role: string;
  text: string;
  ui_action?: unknown;
}

interface BotResponse {
  text: string;
  ui_action?: unknown;
}

const UI_ACTION_TYPES = new Set<UIAction['type']>([
  'SHOW_CAMPAIGN_LIST',
  'SHOW_CAMPAIGN_DETAIL',
  'SHOW_CAMPAIGN_CREATE_FORM',
  'SHOW_CANDIDATE_LIST',
  'SHOW_CANDIDATE_UPLOAD',
  'SHOW_SCREENING_STATUS',
  'SHOW_BATCH_STATUS',
  'SHOW_CAMPAIGN_PICKER',
  'SHOW_SCREENING_RESULTS',
  'SHOW_CANDIDATE_SCREENING_RESULT',
]);

function toUiAction(value: unknown): UIAction | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.type !== 'string' || !UI_ACTION_TYPES.has(candidate.type as UIAction['type'])) {
    return undefined;
  }
  if (!candidate.payload || typeof candidate.payload !== 'object' || Array.isArray(candidate.payload)) {
    return undefined;
  }
  return { type: candidate.type as UIAction['type'], payload: candidate.payload as Record<string, unknown> };
}

function normalizeAssistantMessage(text: string, providedAction?: unknown): Pick<ChatMessageData, 'content' | 'uiAction'> {
  const markerIndex = text.lastIndexOf('ACTION:');
  let content = text;
  let parsedAction: UIAction | undefined;

  if (markerIndex >= 0) {
    const actionText = text.slice(markerIndex + 'ACTION:'.length).trim();
    try {
      parsedAction = toUiAction(JSON.parse(actionText));
      if (parsedAction) content = text.slice(0, markerIndex).trimEnd();
    } catch {
      // Keep malformed model output visible rather than hiding potentially useful text.
    }
  }

  const uiAction = toUiAction(providedAction) ?? parsedAction;
  if (uiAction && content === text && markerIndex >= 0) {
    content = text.slice(0, markerIndex).trimEnd();
  }
  return { content, ...(uiAction ? { uiAction } : {}) };
}

export async function createChatSession(title: string | null): Promise<ChatSessionResponse> {
  return apiRequest<ChatSessionResponse>('/chat/sessions', {
    method: 'POST',
    body: { title },
  });
}

export async function listChatSessions(): Promise<ChatSessionListItem[]> {
  return apiRequest<ChatSessionListItem[]>('/chat/sessions', { method: 'GET' });
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  return apiRequest<void>(`/chat/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
}

export async function getChatMessages(sessionId: string): Promise<ChatMessageData[]> {
  const messages = await apiRequest<ChatMessageHistoryItem[]>(
    `/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
    { method: 'GET' },
  );
  return messages
    .filter(message => message.role === 'user' || message.role === 'model')
    .map((message, index) => {
      const normalized = message.role === 'user'
        ? { content: message.text }
        : normalizeAssistantMessage(message.text, message.ui_action);
      return {
        id: `${sessionId}-${index}`,
        role: message.role === 'user' ? 'user' as const : 'assistant' as const,
        ...normalized,
      };
    });
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
): Promise<{ text: string; uiAction?: UIAction }> {
  const response = await apiRequest<BotResponse>(
    `/chat/sessions/${encodeURIComponent(sessionId)}/message`,
    { method: 'POST', body: { message } },
  );
  const normalized = normalizeAssistantMessage(response.text, response.ui_action);
  return {
    text: normalized.content,
    ...(normalized.uiAction ? { uiAction: normalized.uiAction } : {}),
  };
}
