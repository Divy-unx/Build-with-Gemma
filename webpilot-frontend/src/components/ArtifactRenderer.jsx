import React from 'react';

export default function ArtifactRenderer({ code, refreshKey }) {
  if (!code) return <div className="artifact-empty-state">No artifact code provided.</div>;

  return (
    <div className="artifact-renderer-container">
      <iframe
        key={refreshKey}
        srcDoc={code}
        sandbox="allow-scripts"
        title="Generated WebPilot artifact"
        className="artifact-iframe"
      />
    </div>
  );
}
