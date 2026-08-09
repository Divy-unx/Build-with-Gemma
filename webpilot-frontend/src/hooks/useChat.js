import { useState, useEffect, useCallback, useReducer } from 'react';
import { api } from '../services/api';
import { workspaceReducer, initialWorkspaceState } from '../agent/workspaceReducer';
import { toolDispatcher } from '../agent/toolDispatcher';

export function useChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [theme, setThemeState] = useState(() => localStorage.getItem('webpilot_theme') || 'dark');

  // Initialization and Polling
  useEffect(() => {
    let pollInterval;

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
            if (!currentSessionId) switchChat(convos[0].id);
          } else if (!currentSessionId) {
            newChat();
          }
          // Clear polling if connected
          if (pollInterval) clearInterval(pollInterval);
        } catch (e) {
          console.error("Failed to initialize backend data", e);
        }
      } else {
        // Poll every 3 seconds if disconnected
        if (!pollInterval) {
          pollInterval = setInterval(init, 3000);
        }
      }
    }
    
    init();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentSessionId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('webpilot_theme', theme);
  }, [theme]);

  const [currentArtifact, setCurrentArtifact] = useState(null);
  
  const [workspaceState, dispatchWorkspace] = useReducer(workspaceReducer, initialWorkspaceState);

  // Clear artifact when switching chats
  const switchChat = async (id) => {
    try {
      setCurrentArtifact(null);
      dispatchWorkspace({ type: 'CLEAR_WORKSPACE' });
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
      dispatchWorkspace({ type: 'CLEAR_WORKSPACE' });
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
          dispatchWorkspace({ type: 'CLEAR_WORKSPACE' });
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

  const handleToolCalls = async (toolCallsJson) => {
    try {
      const data = JSON.parse(toolCallsJson);
      let successMessages = [];

      for (const action of data.actions) {
        try {
          const result = await toolDispatcher.execute(action.tool, action.args, dispatchWorkspace, setThemeState);
          successMessages.push(result);
        } catch (err) {
          console.error("Tool execution failed:", err);
          successMessages.push(`Failed to execute ${action.tool}.`);
        }
      }

      return data.message || successMessages.join(" ");
    } catch (e) {
      console.error("Failed to parse tool calls JSON", e);
      return "WebPilot couldn't interpret that instruction.";
    }
  };

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
      // If we don't have a session (e.g. backend was offline), try to create one now
      try {
        const conv = await api.createConversation("New Conversation");
        setSessions(prev => [conv, ...prev]);
        setCurrentSessionId(conv.id);
        targetSessionId = conv.id;
      } catch (e) {
        console.error("Could not create session for new message");
      }
    }

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (!targetSessionId) throw new Error("No backend connection available.");
      
      const response = await api.sendMessage(targetSessionId, text);
      let aiContent = response;

      // Handle structured JSON response from new backend
      if (response.startsWith('{') && response.includes('"type"')) {
        try {
          const parsed = JSON.parse(response);
          if (parsed.type === 'tool_calls') {
            aiContent = await handleToolCalls(response);
          } else if (parsed.type === 'message') {
            aiContent = parsed.message;
          }
        } catch (e) {
          // If it fails to parse as JSON, fallback to text parsing
          console.error("Failed to parse backend response as JSON", e);
        }
      } else if (response.startsWith('FUNCTION_CALL:')) {
        // Fallback for old format if somehow returned
        aiContent = "WebPilot understood the request but couldn't apply that change.";
      } else {
        // Parse for artifact (Level 2 Generative UI)
        import('../utils/artifactParser').then(({ parseArtifact }) => {
          const parsed = parseArtifact(aiContent);
          if (parsed.hasArtifact) {
            setCurrentArtifact({
              id: Date.now().toString(),
              type: parsed.type,
              title: "Generated UI",
              code: parsed.code,
              createdAt: new Date().toISOString()
            });
            aiContent = parsed.text; 
          }
          
          const aiMsg = {
            id: Date.now() + 1,
            role: 'ai',
            content: aiContent,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, aiMsg]);
        });
        return; 
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
    setCurrentArtifact,
    workspaceState,
    dispatchWorkspace
  };
}
