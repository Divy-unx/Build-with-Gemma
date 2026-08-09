import React, { useState } from 'react';

export default function WelcomeScreen({ sendMessage, isLoading, toggleAI }) {
  const [input, setInput] = useState('');

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

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1 className="welcome-title">WebPilot</h1>
        <p className="welcome-subtitle">AI-powered workspace</p>

        <form className="welcome-search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="search-input"
              placeholder="Search the web or ask WebPilot..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
            />
          </div>
        </form>

        <div className="welcome-quick-actions">
          <button className="welcome-action-btn" type="button" onClick={toggleAI}>
            <span style={{ fontSize: '16px', color: 'var(--accent-secondary)' }}>✦</span>
            AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
