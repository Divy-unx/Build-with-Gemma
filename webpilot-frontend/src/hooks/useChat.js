import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [theme, setThemeState] = useState(() => localStorage.getItem('webpilot_theme') || 'dark');

  // Load all conversations on mount
  useEffect(() => {
    async function init() {
      const isConnected = await api.checkBackend();
      setBackendStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected) {
        try {
          const backendTheme = await api.getTheme();
          setThemeState(backendTheme);
          
          const convos = await api.getConversations();
          setSessions(convos);
          
          if (convos.length > 0) {
            switchChat(convos[0].id);
          } else {
            newChat();
          }
        } catch (e) {
          console.error("Failed to initialize backend data", e);
        }
      }
    }
    init();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('webpilot_theme', theme);
  }, [theme]);

  const [currentArtifact, setCurrentArtifact] = useState(null);
  
  // Clear artifact when switching chats
  const switchChat = async (id) => {
    try {
      setCurrentArtifact(null);
      setCurrentSessionId(id);
      const detail = await api.getConversation(id);
      setMessages(detail.messages || []);
    } catch (e) {
      console.error("Failed to load conversation messages", e);
    }
  };

  const newChat = async () => {
    try {
      setCurrentArtifact(null);
      const conv = await api.createConversation("New Conversation");
      setSessions(prev => [conv, ...prev]);
      setCurrentSessionId(conv.id);
      setMessages([]);
    } catch (e) {
      console.error("Failed to create new conversation", e);
    }
  };

  const deleteChat = async (id) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        await api.deleteConversation(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
          setCurrentArtifact(null);
          if (sessions.length > 1) {
            const nextConv = sessions.find(s => s.id !== id);
            switchChat(nextConv.id);
          } else {
            newChat();
          }
        }
      } catch (e) {
        console.error("Failed to delete conversation", e);
      }
    }
  };

  const handleFunctionCall = async (fnString) => {
    try {
      const match = fnString.match(/FUNCTION_CALL:\s*(\w+)\s*{(.+)}/);
      if (!match) return "I executed a function, but couldn't parse the result.";
      
      const fnName = match[1];
      const argsRaw = match[2];
      
      if (fnName === 'set_theme') {
        const themeMatch = argsRaw.match(/theme=(\w+)/);
        if (themeMatch) {
          const newTheme = themeMatch[1];
          await api.setTheme(newTheme);
          setThemeState(newTheme);
          return `Done. I've switched the workspace to ${newTheme} mode.`;
        }
      }
      return "Function executed successfully.";
    } catch (e) {
      console.error(e);
      return "An error occurred while executing the function.";
    }
  };

  // Dynamically import the parser to avoid circular deps or complex setups if needed
  // Alternatively we can just import it at the top. Let's assume it's imported at the top.
  
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !currentSessionId) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.sendMessage(currentSessionId, text);
      let aiContent = response;

      if (response.startsWith('FUNCTION_CALL:')) {
        aiContent = await handleFunctionCall(response);
      } else {
        // Parse for artifact
        import('../utils/artifactParser').then(({ parseArtifact }) => {
          const parsed = parseArtifact(response);
          if (parsed.hasArtifact) {
            setCurrentArtifact({
              id: Date.now().toString(),
              type: parsed.type,
              title: "Generated UI",
              code: parsed.code,
              createdAt: new Date().toISOString()
            });
            aiContent = parsed.text; // Update content to just be conversational text
          }
          
          const aiMsg = {
            id: Date.now() + 1,
            role: 'ai',
            content: aiContent,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, aiMsg]);
        });
        return; // Early return because state update happens async above
      }

      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: aiContent,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      if (messages.length === 0) {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, title: text.slice(0, 50) + (text.length > 50 ? '...' : '') };
          }
          return s;
        }));
      }

    } catch (error) {
      let errorText = "Unable to reach WebPilot backend.";
      if (error.message.includes('500')) {
        errorText = "WebPilot encountered a backend error. Check the backend terminal.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorText = "WebPilot couldn't connect to the backend.";
      }
      
      const errorMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: errorText,
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, messages]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    try {
      await api.setTheme(newTheme);
      setThemeState(newTheme);
    } catch (e) {
      console.error("Failed to sync theme with backend, updating local only.");
      setThemeState(newTheme);
    }
  };

  return {
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
    setCurrentArtifact
  };
}
