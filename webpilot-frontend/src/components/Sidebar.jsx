import React from 'react';

export default function Sidebar({ sessions, currentSessionId, newChat, switchChat, deleteChat, backendStatus, isCollapsed, toggleSidebar }) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {isCollapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        )}
      </button>

      <div className="sidebar-content-inner">
        <div className="sidebar-header">
          <img src="/src/assets/webpilot-mark.svg" alt="WebPilot Logo" className="brand-logo" />
          <h2>WebPilot</h2>
        </div>

        <button className="new-chat-btn" onClick={newChat} title="New Chat">
          <span className="plus-icon">+</span> 
          <span className="btn-text">New Chat</span>
        </button>

        <div className="recent-chats-container">
          <h3>Recent Conversations</h3>
          <div className="recent-chats-list">
            {sessions.map(session => (
              <div 
                key={session.id} 
                className={`recent-chat-item-wrapper ${session.id === currentSessionId ? 'active' : ''}`}
              >
                <button 
                  className="recent-chat-item"
                  onClick={() => switchChat(session.id)}
                  title={isCollapsed ? session.title : undefined}
                >
                  <span className="chat-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  <span className="chat-title">{session.title}</span>
                </button>
                <button 
                  className="delete-chat-btn" 
                  onClick={() => deleteChat(session.id)}
                  title="Delete Conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="status-row">
            <span className="status-label">Backend</span>
            <div className="status-indicator-wrap" title={backendStatus === 'connected' ? 'Backend connected' : 'Backend disconnected'}>
              <span className={`status-dot ${backendStatus === 'connected' ? 'online' : 'offline'}`}></span>
              <span className="status-text">{backendStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="status-row">
            <span className="status-label">Model</span>
            <strong className="model-name" title="Gemma 2B">{isCollapsed ? 'G' : 'Gemma 2B'}</strong>
          </div>
          <div className="user-row">
            <div className="user-avatar" title="Local User">U</div>
            <div className="user-details">
              <strong>Local User</strong>
              <span>Workspace</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
