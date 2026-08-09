import React, { useState, useRef, useEffect } from 'react';

export default function AIPanel({ isOpen, onClose, sendMessage, isLoading, messages, backendStatus }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <span style={{ color: 'var(--accent-secondary)' }}>✦</span> WebPilot AI
        </div>
        <div className="ai-panel-actions">
          {backendStatus !== 'connected' && (
            <span className="status-indicator offline" title="Backend disconnected"></span>
          )}
          <button className="icon-btn" onClick={onClose} title="Close Panel">×</button>
        </div>
      </div>

      <div className="ai-panel-messages">
        {messages.length === 0 ? (
          <div className="ai-empty">
            <span style={{ fontSize: '32px', color: 'var(--accent-primary)', opacity: 0.7 }}>✦</span>
            <p>How can I help?</p>
            <span>Ask WebPilot anything...</span>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`ai-message ${msg.role === 'ai' ? 'assistant' : 'user'} ${msg.isError ? 'error' : ''}`}>
              <div className="ai-message-bubble">
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="ai-message assistant typing">
            <div className="ai-message-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="ai-panel-input">
        <form onSubmit={handleSubmit} className="ai-panel-form">
          <textarea
            ref={inputRef}
            placeholder="Ask WebPilot anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="ai-submit-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
