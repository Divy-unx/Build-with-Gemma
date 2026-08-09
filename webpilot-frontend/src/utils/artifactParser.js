export function parseArtifact(text) {
  if (!text) return { hasArtifact: false, type: null, code: null, text: '' };

  const htmlRegex = /```html\s*([\s\S]*?)```/i;
  const match = text.match(htmlRegex);

  if (match) {
    const code = match[1].trim();
    // Remove the entire fenced block from the text
    const cleanText = text.replace(match[0], '').trim();
    
    return {
      hasArtifact: true,
      type: 'html',
      code: code,
      text: cleanText
    };
  }

  return {
    hasArtifact: false,
    type: null,
    code: null,
    text: text
  };
}
