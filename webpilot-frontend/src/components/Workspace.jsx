import React, { useRef, useEffect } from 'react';

export default function Workspace({ 
  messages, 
  isLoading, 
  sendMessage, 
  toggleAI, 
  isAIOpen, 
  theme, 
  toggleTheme, 
  WelcomeScreen 
}) {
  const endRef = useRef(null);
  
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div className="workspace-main">
      <header className="workspace-header">
        <div className="header-title">WebPilot</div>
        <div className="header-actions">
          <button className={`icon-btn ${isAIOpen ? 'active' : ''}`} onClick={toggleAI} title="Toggle AI Panel">
            <span style={{ fontSize: '14px', marginRight: '4px' }}>✦</span> AI
          </button>
          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="19.36" x2="19.78" y2="18.36"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
            <span style={{ marginLeft: '6px' }}>Theme</span>
          </button>
        </div>
      </header>

      <div className="workspace-content">
        {messages.length === 0 ? (
          <WelcomeScreen sendMessage={sendMessage} isLoading={isLoading} toggleAI={toggleAI} />
        ) : (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-bubble-row ${msg.role === 'ai' ? 'assistant' : 'user'}`}>
                  {msg.role === 'ai' && (
                    <div className="avatar assistant-avatar">✦</div>
                  )}
                  <div className={`chat-bubble ${msg.isError ? 'error' : ''}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-bubble-row assistant typing-row">
                  <div className="avatar assistant-avatar">✦</div>
                  <div className="chat-bubble typing-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            
            <div className="chat-input-wrapper">
              <form 
                className="chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.message.value;
                  if (input.trim() && !isLoading) {
                    sendMessage(input);
                    e.target.elements.message.value = '';
                  }
                }}
              >
                <input 
                  type="text" 
                  name="message" 
                  className="chat-bottom-input" 
                  placeholder="Ask WebPilot anything..."
                  autoComplete="off"
                  disabled={isLoading}
                />
                <button type="submit" className="chat-send-btn" disabled={isLoading}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
