import { useEffect, useRef } from 'react';
import { ChatComposer } from './ChatComposer';
import { ChatMessage } from './ChatMessage';
import type { ChatMessageData } from './types';

export function ChatWindow({
  messages,
  onSubmit,
}: {
  messages: ChatMessageData[];
  onSubmit: (message: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="chatbot-window" aria-label="Chat center">
      <div className="chatbot-window__messages">
        <div className="chatbot-window__message-list">
          {messages.length === 0 && (
            <p className="chatbot-window__empty">Send a message to start a conversation.</p>
          )}
          {messages.map(message => <ChatMessage key={message.id} message={message} />)}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="chatbot-window__footer">
        <div className="chatbot-window__composer-wrap">
          <ChatComposer onSubmit={onSubmit} />
          <p className="chatbot-window__notice">
            Your messages are kept in this session. Connect an assistant service to receive AI responses.
          </p>
        </div>
      </div>
    </main>
  );
}