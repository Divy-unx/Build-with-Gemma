import React from 'react';

export default function Sidebar({ sessions, currentSessionId, newChat, switchChat, backendStatus, isCollapsed, toggleSidebar }) {
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
          {!isCollapsed && <h2>WebPilot</h2>}
        </div>

        <button className="new-chat-btn" onClick={newChat} title="New Chat">
          <span className="plus-icon">+</span> 
          {!isCollapsed && <span>New Chat</span>}
        </button>

        <div className="recent-chats-container">
          {!isCollapsed && <h3>Recent Conversations</h3>}
          <div className="recent-chats-list">
            {sessions.map(session => (
              <button 
                key={session.id} 
                className={`recent-chat-item ${session.id === currentSessionId ? 'active' : ''}`}
                onClick={() => switchChat(session.id)}
                title={isCollapsed ? session.title : undefined}
              >
                <span className="chat-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
                {!isCollapsed && <span className="chat-title">{session.title}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="status-row">
            {!isCollapsed && <span>Backend</span>}
            <div className="status-indicator-wrap" title={backendStatus === 'connected' ? 'Backend connected' : 'Backend offline'}>
              <span className={`status-dot ${backendStatus === 'connected' ? 'online' : 'offline'}`}></span>
              {!isCollapsed && <span>{backendStatus === 'connected' ? 'Connected' : 'Offline'}</span>}
            </div>
          </div>
          <div className="status-row">
            {!isCollapsed && <span>Model</span>}
            <strong className="model-name" title="Gemma 2B">{!isCollapsed ? 'Gemma 2B' : 'G'}</strong>
          </div>
          <div className="user-row">
            <div className="user-avatar" title="Local User">U</div>
            {!isCollapsed && (
              <div className="user-details">
                <strong>Local User</strong>
                <span>Workspace</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
