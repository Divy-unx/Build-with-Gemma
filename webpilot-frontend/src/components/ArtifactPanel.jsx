import React, { useState } from 'react';
import ArtifactToolbar from './ArtifactToolbar';
import ArtifactRenderer from './ArtifactRenderer';

export default function ArtifactPanel({ artifact, isFullscreen, setIsFullscreen, onClose }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCopy = () => {
    if (artifact && artifact.code) {
      navigator.clipboard.writeText(artifact.code).catch(err => {
        console.error("Failed to copy code: ", err);
      });
    }
  };

  if (!artifact) return null;

  return (
    <div className={`artifact-panel ${isFullscreen ? 'fullscreen' : ''}`}>
      <ArtifactToolbar
        onRefresh={handleRefresh}
        onFullscreen={() => setIsFullscreen(!isFullscreen)}
        isFullscreen={isFullscreen}
        onCopy={handleCopy}
        onClose={onClose}
      />
      <div className="artifact-content">
        <ArtifactRenderer code={artifact.code} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
