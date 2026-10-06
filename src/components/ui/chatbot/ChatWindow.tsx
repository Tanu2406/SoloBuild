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
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    messagesElement?.scrollTo({ top: messagesElement.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="chatbot-window" aria-label="Chat center">
      <div className="chatbot-window__messages" ref={messagesRef} aria-live="polite">
        <div className="chatbot-window__message-list">
          {messages.length === 0 && (
            <div className="chatbot-window__welcome">
              <div className="chatbot-window__welcome-avatar" aria-hidden="true">SB</div>
              <p className="chatbot-window__welcome-brand">Rollo AI</p>
              <h1>How can I help?</h1>
              <p>Tell me what you need help with, from HR tasks and hiring workflows to interviews and team updates.</p>
            </div>
          )}
          {messages.map(message => <ChatMessage key={message.id} message={message} />)}
        </div>
      </div>
      <div className="chatbot-window__footer">
        <div className="chatbot-window__composer-wrap">
          <ChatComposer onSubmit={onSubmit} />
          <p className="chatbot-window__notice">
            Demo responses are generated for this session. No connected tools are accessed.
          </p>
        </div>
      </div>
    </main>
  );
}