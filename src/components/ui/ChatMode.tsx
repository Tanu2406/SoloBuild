import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatWindow } from './chatbot/ChatWindow';
import { ChatHeader } from './chatbot/ChatHeader';
import { ContextPanel } from './chatbot/ContextPanel';
import { talentAcquisitionSolution } from './chatbot/data';
import type { ChatMessageData } from './chatbot/types';
import {
  createChatSession,
  getChatMessages,
  listChatSessions,
  sendChatMessage,
  type ChatSessionListItem,
} from '../../services/chatService';
import { useToast } from './Toast';
import './chatbot/chatbot.css';

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessageData[];
  updatedAt: number;
}

export type ChatConversationSummary = Pick<ChatConversation, 'id' | 'title' | 'updatedAt'>;

interface ChatModeProps {
  open: boolean;
  newChatRequest: number;
  selectedChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onRecentChatsChange: (chats: ChatConversationSummary[]) => void;
  onExit: () => void;
}

function fromSession(session: ChatSessionListItem): ChatConversation {
  const updatedAt = Date.parse(session.updated_at);
  return {
    id: session.id,
    title: session.title?.trim() || 'New chat',
    messages: [],
    updatedAt: Number.isNaN(updatedAt) ? 0 : updatedAt,
  };
}

function errorText(error: unknown): string {
  if (!(error instanceof Error)) return 'The message could not be sent. Please try again.';
  if (error.message.includes('503')) return 'The AI service is temporarily unavailable. Please try again shortly.';
  return error.message;
}

export const ChatMode: React.FC<ChatModeProps> = ({
  open,
  newChatRequest,
  selectedChatId,
  onSelectChat,
  onRecentChatsChange,
  onExit,
}) => {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [draftChat, setDraftChat] = useState<{ request: number; messages: ChatMessageData[] }>(() => ({
    request: newChatRequest,
    messages: [],
  }));
  const [loadedConversationIds, setLoadedConversationIds] = useState<Set<string>>(() => new Set());
  const loadedConversationIdsRef = useRef(loadedConversationIds);
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sessionListLoaded, setSessionListLoaded] = useState(false);
  const [sessionListError, setSessionListError] = useState('');
  const [historyError, setHistoryError] = useState('');

  const selectedConversation = useMemo(
    () => conversations.find(conversation => conversation.id === selectedChatId) ?? null,
    [conversations, selectedChatId],
  );

  const recentChats = useMemo(
    () => conversations
      .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }))
      .sort((left, right) => right.updatedAt - left.updatedAt),
    [conversations],
  );

  useEffect(() => {
    onRecentChatsChange(recentChats);
  }, [onRecentChatsChange, recentChats]);

  useEffect(() => {
    if (sessionListLoaded) return;
    let cancelled = false;
    listChatSessions()
      .then(sessions => {
        if (!cancelled) setConversations(sessions.map(fromSession));
      })
      .catch(error => {
        if (!cancelled) setSessionListError(errorText(error));
      })
      .finally(() => {
        if (!cancelled) setSessionListLoaded(true);
      });
    return () => { cancelled = true; };
  }, [sessionListLoaded]);

  useEffect(() => {
    if (!open || !sessionListError) return;
    showToast(`Chat history could not be loaded: ${sessionListError}`, 'error');
    setSessionListError('');
  }, [open, sessionListError, showToast]);

  useEffect(() => {
    loadedConversationIdsRef.current = loadedConversationIds;
  }, [loadedConversationIds]);

  useEffect(() => {
    if (!selectedChatId || loadedConversationIdsRef.current.has(selectedChatId)) return;
    let cancelled = false;
    setLoadingHistoryId(selectedChatId);
    setHistoryError('');
    getChatMessages(selectedChatId)
      .then(messages => {
        if (cancelled) return;
        setConversations(current => current.map(conversation => (
          conversation.id === selectedChatId ? { ...conversation, messages } : conversation
        )));
        setLoadedConversationIds(current => {
          const next = new Set(current);
          next.add(selectedChatId);
          loadedConversationIdsRef.current = next;
          return next;
        });
      })
      .catch(error => {
        if (cancelled) return;
        const message = errorText(error);
        setHistoryError(message);
        showToast(`Conversation could not be loaded: ${message}`, 'error');
      })
      .finally(() => {
        if (!cancelled) setLoadingHistoryId(null);
      });
    return () => { cancelled = true; };
  }, [selectedChatId, showToast]);

  const appendMessage = useCallback((conversationId: string, message: ChatMessageData) => {
    setConversations(current => current.map(conversation => (
      conversation.id === conversationId
        ? { ...conversation, messages: [...conversation.messages, message], updatedAt: Date.now() }
        : conversation
    )));
  }, []);

  const submitMessage = useCallback(async (content: string) => {
    const messageText = content.trim();
    if (!messageText || sending) return;

    const userMessage: ChatMessageData = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
    };
    let conversationId = selectedChatId;
    setHistoryError('');
    setSending(true);

    if (!conversationId) {
      setDraftChat({ request: newChatRequest, messages: [userMessage] });
      try {
        const session = await createChatSession(null);
        const conversation = {
          ...fromSession(session),
          title: session.title?.trim() || messageText.slice(0, 80),
          messages: [userMessage],
          updatedAt: Date.now(),
        };
        conversationId = session.id;
        setConversations(current => [conversation, ...current.filter(item => item.id !== session.id)]);
        setDraftChat({ request: newChatRequest, messages: [] });
        setLoadedConversationIds(current => {
          const next = new Set(current);
          next.add(session.id);
          loadedConversationIdsRef.current = next;
          return next;
        });
        onSelectChat(session.id);
      } catch (error) {
        const message = errorText(error);
        setDraftChat({ request: newChatRequest, messages: [userMessage, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I couldn't start a chat session. ${message}`,
        }] });
        showToast(`Chat session could not be created: ${message}`, 'error');
        setSending(false);
        return;
      }
    } else {
      appendMessage(conversationId, userMessage);
    }

    try {
      const response = await sendChatMessage(conversationId, messageText);
      appendMessage(conversationId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text,
        ...(response.uiAction ? { uiAction: response.uiAction } : {}),
      });
      setConversations(current => current.map(conversation => (
        conversation.id === conversationId
          ? { ...conversation, title: conversation.title === 'New chat' ? messageText.slice(0, 80) : conversation.title, updatedAt: Date.now() }
          : conversation
      )));
    } catch (error) {
      const message = errorText(error);
      appendMessage(conversationId, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I couldn't complete that request. ${message}`,
      });
      showToast(message, 'error');
    } finally {
      setSending(false);
    }
  }, [appendMessage, newChatRequest, onSelectChat, selectedChatId, sending, showToast]);

  const messages = selectedChatId
    ? selectedConversation?.messages ?? []
    : draftChat.request === newChatRequest ? draftChat.messages : [];

  return (
    <section
      className="chatbot-app-view"
      aria-label="Rollo AI chatbot"
      hidden={!open}
    >
      <div className="marketing-chatbot">
        <div className="marketing-chatbot__main">
          <ChatHeader onExit={onExit} />
          <div className="marketing-chatbot__panels">
            <ChatWindow
              key={`${selectedChatId ?? 'new'}-${newChatRequest}`}
              messages={messages}
              onSubmit={submitMessage}
              onActionTrigger={submitMessage}
              isSending={sending}
              isLoadingHistory={selectedChatId !== null && loadingHistoryId === selectedChatId}
              historyError={selectedChatId ? historyError : ''}
            />
            <ContextPanel solution={talentAcquisitionSolution} onAction={submitMessage} />
          </div>
        </div>
      </div>
    </section>
  );
};
