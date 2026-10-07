import { ArrowIcon } from './Icon';
import type { ChatSolution } from './types';

export function ContextPanel({
  solution,
  onAction,
}: {
  solution: ChatSolution;
  onAction: (message: string) => void;
}) {
  const prompts: Record<string, string> = {
    'Show my campaigns': 'Show my campaigns.',
    'Show candidates': 'Show candidates across my campaigns.',
    'Create campaign': 'Create a campaign.',
    'Upload candidates': 'I want to upload candidate resumes.',
  };
  return (
    <aside className="chatbot-context-panel" aria-label="Connected Tools and Suggested Actions">
      <div className="chatbot-context-panel__content">
        <section>
          <p className="chatbot-context-panel__section-label">Connected Tools</p>
          <div className="chatbot-context-panel__tool-list">
            {solution.tools.map(tool => (
              <div className="chatbot-context-panel__tool" key={tool}>
                <span>{tool}</span>
                <span className="chatbot-context-panel__tool-status"><span className="chatbot-context-panel__tool-dot" />Available</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <p className="chatbot-context-panel__section-label">Suggested Actions</p>
          <div className="chatbot-context-panel__action-list">
            {solution.actions.map(action => (
              <button
                className="chatbot-context-panel__action"
                type="button"
                key={action}
                onClick={() => onAction(prompts[action] ?? action)}
              >
                <span>{action}</span>
                <ArrowIcon className="chatbot-context-panel__action-icon" />
              </button>
            ))}
          </div>
        </section>
        <section className="chatbot-context-panel__security">
          <div className="chatbot-context-panel__security-title">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 4.5 2.8 8.3 7 10 4.2-1.7 7-5.5 7-10V6l-7-3Z" />
            </svg>
            Workspace access
          </div>
          <p>Rollo AI can access hiring campaigns and candidates available to your account. Review actions before submitting changes.</p>
        </section>
      </div>
    </aside>
  );
}