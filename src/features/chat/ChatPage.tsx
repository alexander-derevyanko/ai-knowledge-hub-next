import './ChatPage.css';
import ChatClient from './components/ChatClient/ChatClient';

export default function ChatPage() {
  return (
    <div className="chat-page">
      <header className="chat-page__header">
        <div className="chat-page__avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="4" y="7" width="16" height="12" rx="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 4v3M8 3l1 2M16 3l-1 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>

        <div className="chat-page__heading">
          <h1>AI Assistant</h1>
          <p>Ask questions about your knowledge base</p>
        </div>
      </header>

      <ChatClient />
    </div>
  );
}
