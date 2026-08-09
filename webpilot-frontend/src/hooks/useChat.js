import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useChat() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('webpilot_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [{ id: 'default', title: 'New Conversation', messages: [] }];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = localStorage.getItem('webpilot_current_session');
    return saved || 'default';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('webpilot_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('webpilot_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('webpilot_sessions', JSON.stringify(sessions));
    localStorage.setItem('webpilot_current_session', currentSessionId);
  }, [sessions, currentSessionId]);

  useEffect(() => {
    async function init() {
      const isConnected = await api.checkBackend();
      setBackendStatus(isConnected ? 'connected' : 'disconnected');
      if (isConnected) {
        try {
          const backendTheme = await api.getTheme();
          setThemeState(backendTheme);
        } catch (e) {
          // Ignore theme fetch failure on init
        }
      }
    }
    init();
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession.messages;

  const updateCurrentSession = (updater) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return updater(s);
      }
      return s;
    }));
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

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    updateCurrentSession(s => ({
      ...s,
      messages: [...s.messages, userMsg],
      title: s.messages.length === 0 ? text.slice(0, 30) : s.title
    }));
    
    setIsLoading(true);

    try {
      const response = await api.sendMessage(text);
      let aiContent = response;

      if (response.startsWith('FUNCTION_CALL:')) {
        aiContent = await handleFunctionCall(response);
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiContent,
        timestamp: new Date().toISOString()
      };
      
      updateCurrentSession(s => ({
        ...s,
        messages: [...s.messages, aiMsg]
      }));
    } catch (error) {
      let errorText = "Unable to reach WebPilot backend.";
      if (error.message.includes('500')) {
        errorText = "WebPilot encountered a backend error. Check the backend terminal.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorText = "WebPilot couldn't connect to the backend.";
      }
      
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: errorText,
        timestamp: new Date().toISOString(),
        isError: true
      };
      updateCurrentSession(s => ({
        ...s,
        messages: [...s.messages, errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  const newChat = () => {
    const id = Date.now().toString();
    setSessions(prev => [{ id, title: 'New Conversation', messages: [] }, ...prev]);
    setCurrentSessionId(id);
  };

  const switchChat = (id) => {
    setCurrentSessionId(id);
  };

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
    backendStatus,
    theme,
    toggleTheme
  };
}
