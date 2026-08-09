import React, { useState } from 'react';
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
    backendStatus, 
    theme, 
    toggleTheme 
  } = useChat();

  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`app-container theme-${theme} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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