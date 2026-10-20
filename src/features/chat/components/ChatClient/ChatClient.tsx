'use client';

import { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from '../ChatMessage/ChatMessage';

import './ChatClient.css';

export default function ChatClient() {
  const { messages, isLoading, sendMessage, retryMessage } = useChat();

  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const question = inputValue.trim();

    if (!question || isLoading) {
      return;
    }

    setInputValue('');

    await sendMessage(question);
  };

  return (
    <>
      <section className="chat-page__chat" aria-label="Chat interface">
        <div className="chat-page__messages">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLoading={false}
              retry={() => retryMessage(message.id)}
            />
          ))}

          {isLoading && (
            <ChatMessage
              key="assistant-loading"
              message={{
                id: 'assistant-loading',
                content: '',
                sender: 'assistant',
                timestamp: new Date().toISOString(),
              }}
              isLoading
            />
          )}
        </div>
      </section>

      <footer className="chat-page__footer">
        <form className="chat-page__form" onSubmit={handleSubmit}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type="text"
            placeholder="Ask a question..."
            aria-label="Ask a question"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2 11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m22 2-7 20-4-9-9-4 20-7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </footer>
    </>
  );
}
