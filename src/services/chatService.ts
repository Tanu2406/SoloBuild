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
}

interface BotResponse {
  text: string;
  ui_action?: UIAction | null;
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
    .map((message, index) => ({
      id: `${sessionId}-${index}`,
      role: message.role === 'user' ? 'user' : 'assistant',
      content: message.text,
    }));
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
): Promise<{ text: string; uiAction?: UIAction }> {
  const response = await apiRequest<BotResponse>(
    `/chat/sessions/${encodeURIComponent(sessionId)}/message`,
    { method: 'POST', body: { message } },
  );
  return {
    text: response.text,
    ...(response.ui_action ? { uiAction: response.ui_action } : {}),
  };
}
