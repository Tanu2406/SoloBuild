import React, { useEffect, useMemo, useState } from 'react';
import { ChatWindow } from './chatbot/ChatWindow';
import { ChatHeader } from './chatbot/ChatHeader';
import { ContextPanel } from './chatbot/ContextPanel';
import { talentAcquisitionSolution } from './chatbot/data';
import type { ChatMessageData } from './chatbot/types';
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

export const ChatMode: React.FC<ChatModeProps> = ({
  open,
  newChatRequest,
  selectedChatId,
  onSelectChat,
  onRecentChatsChange,
  onExit,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedChatId) ?? null,
    [conversations, selectedChatId],
  );

  const recentChats = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  useEffect(() => {
    onRecentChatsChange(recentChats);
  }, [onRecentChatsChange, recentChats]);

  function submitMessage(content: string) {
    const message: ChatMessageData = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    const now = Date.now();
    if (selectedChatId) {
      setConversations((current) => current.map((conversation) => (
        conversation.id === selectedChatId
          ? { ...conversation, messages: [...conversation.messages, message], updatedAt: now }
          : conversation
      )));
      return;
    }

    const id = crypto.randomUUID();
    setConversations((current) => [
      {
        id,
        title: content.length > 40 ? `${content.slice(0, 37)}...` : content,
        messages: [message],
        updatedAt: now,
      },
      ...current,
    ]);
    onSelectChat(id);
  }

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
              messages={selectedConversation?.messages ?? []}
              onSubmit={submitMessage}
            />
            <ContextPanel solution={talentAcquisitionSolution} />
          </div>
        </div>
      </div>
    </section>
  );
};
