import React from 'react';

export default function AIComponentRenderer({ component }) {
  const { id, type, props, style } = component;
  const mergedStyle = { ...style }; // They inherit base styles via CSS classes, but override with style prop

  switch (type) {
    case 'button':
      return <button id={id} className="ai-btn" style={mergedStyle}>{props.text}</button>;
    
    case 'heading':
      return <h2 id={id} className="ai-heading" style={mergedStyle}>{props.text}</h2>;
    
    case 'text':
      return <p id={id} className="ai-text" style={mergedStyle}>{props.text}</p>;
    
    case 'input':
      return <input id={id} className="ai-input" type="text" placeholder={props.placeholder || props.text || ''} style={mergedStyle} />;
    
    case 'card':
      return <div id={id} className="ai-card" style={mergedStyle}>{props.text}</div>;
    
    case 'badge':
      return <span id={id} className="ai-badge" style={mergedStyle}>{props.text}</span>;
    
    case 'divider':
      return <hr id={id} className="ai-divider" style={mergedStyle} />;
      
    default:
      return null;
  }
}
