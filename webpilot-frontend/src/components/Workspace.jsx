import React, { useState } from 'react';
import ChatPanel from './ChatPanel';
import ArtifactPanel from './ArtifactPanel';
import AIWorkspaceCanvas from './AIWorkspaceCanvas';

export default function Workspace({ 
  messages, 
  isLoading, 
  sendMessage, 
  toggleAI, 
  isAIOpen, 
  theme, 
  toggleTheme, 
  WelcomeScreen,
  currentArtifact,
  setCurrentArtifact,
  workspaceState,
  toggleSidebar,
  isMobile
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasArtifact = !!currentArtifact;

  const handleCloseArtifact = () => {
    setCurrentArtifact(null);
    setIsFullscreen(false);
  };

  return (
    <div className={`workspace-main ${hasArtifact ? 'has-artifact' : ''} ${isFullscreen ? 'artifact-fullscreen' : ''}`}>
      
      {(!hasArtifact || !isFullscreen) && (
        <div className="browser-viewport">
          <div className="workspace-canvas-container">
            {workspaceState && (
              <AIWorkspaceCanvas workspaceState={workspaceState} />
            )}
          </div>
          
          <div className="workspace-chat-container">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              sendMessage={sendMessage}
              toggleAI={toggleAI}
              isAIOpen={isAIOpen}
              theme={theme}
              toggleTheme={toggleTheme}
              splitMode={false}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
            />
          </div>
        </div>
      )}
      
      {hasArtifact && (
        <div className="workspace-artifact-container">
          <ArtifactPanel
            artifact={currentArtifact}
            isFullscreen={isFullscreen}
            setIsFullscreen={setIsFullscreen}
            onClose={handleCloseArtifact}
          />
        </div>
      )}
    </div>
  );
}
