import React from 'react';
import AIComponentRenderer from './AIComponentRenderer';

export default function AIWorkspaceCanvas({ workspaceState }) {
  const { components, notifications } = workspaceState;

  return (
    <div className="ai-workspace-canvas">
      <div className="ai-components-container">
        {components.map(comp => (
          <AIComponentRenderer key={comp.id} component={comp} />
        ))}
      </div>
      
      {/* Notifications overlay */}
      <div className="ai-notifications-container">
        {notifications.map(notif => (
          <div key={notif.id} className={`ai-notification ${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
}
