import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import WelcomeScreen from './components/WelcomeScreen';
import AIPanel from './components/AIPanel';
import { useChat } from './hooks/useChat';
import './index.css';

function App() {
  const { 
    sessions, 
    currentSessionId, 
    messages, 
    isLoading, 
    sendMessage, 
    newChat, 
    switchChat, 
    deleteChat,
    backendStatus, 
    theme, 
    toggleTheme,
    currentArtifact,
    setCurrentArtifact,
    workspaceState,
    dispatchWorkspace
  } = useChat();

  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (mobile && !isMobile) {
        setIsSidebarCollapsed(true);
      } else if (!mobile && isMobile) {
        setIsSidebarCollapsed(false);
      }
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Compute full-page background from workspace state
  let appBackgroundStyle = {};
  if (workspaceState?.background) {
    if (workspaceState.background.type === 'solid' && workspaceState.background.color) {
      appBackgroundStyle.backgroundColor = workspaceState.background.color;
    } else if (workspaceState.background.type === 'gradient' && workspaceState.background.gradient) {
      appBackgroundStyle.backgroundImage = workspaceState.background.gradient;
    }
  }

  return (
    <div 
      className={`app-container theme-${theme} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'is-mobile' : ''}`}
      style={appBackgroundStyle}
    >
      {isMobile && !isSidebarCollapsed && (
        <div className="mobile-sidebar-backdrop" onClick={() => setIsSidebarCollapsed(true)} />
      )}
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId} 
        newChat={newChat} 
        switchChat={switchChat}
        deleteChat={deleteChat}
        backendStatus={backendStatus}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Workspace 
        messages={messages}
        isLoading={isLoading}
        sendMessage={sendMessage}
        toggleAI={() => setIsAIOpen(!isAIOpen)}
        isAIOpen={isAIOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        WelcomeScreen={WelcomeScreen}
        currentArtifact={currentArtifact}
        setCurrentArtifact={setCurrentArtifact}
        workspaceState={workspaceState}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={isMobile}
      />
      <AIPanel 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
        sendMessage={sendMessage}
        isLoading={isLoading}
        messages={messages}
        backendStatus={backendStatus}
      />
    </div>
  );
}

export default App;