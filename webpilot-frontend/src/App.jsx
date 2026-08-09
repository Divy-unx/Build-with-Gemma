import React, { useState, useEffect } from 'react';
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
        deleteChat,
        backendStatus,
        theme,
        toggleTheme,
        currentArtifact,
        setCurrentArtifact,
        workspaceState,
    } = useChat();

    const [isAIOpen, setIsAIOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        window.innerWidth <= 768
    );
    const [isMobile, setIsMobile] = useState(
        window.innerWidth <= 768
    );

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;

            if (mobile && !isMobile) {
                setIsSidebarCollapsed(true);
            } else if (!mobile && isMobile) {
                setIsSidebarCollapsed(false);
            }

            setIsMobile(mobile);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobile]);

    /*
     * Global workspace background.
     *
     * The AI workspace tools can modify workspaceState.background.
     * We apply that background to the entire application container,
     * not just the chat area.
     */
    const appBackgroundStyle = {};
    const background = workspaceState?.background;

    const getRgbFromColor = (colorStr) => {
        if (!colorStr || colorStr === 'transparent' || colorStr === 'none') return null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = colorStr;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            if (a === 0) return null;
            return { r, g, b };
        } catch (e) {
            return null;
        }
    };

    if (background?.type === 'solid' && background?.color) {
        const rgb = getRgbFromColor(background.color);
        if (rgb) {
            appBackgroundStyle.backgroundColor = background.color;

            const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            const isLight = yiq >= 128;
            
            const textColor = isLight ? '#000000' : '#ffffff';
            const textSecondary = isLight ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
            const textMuted = isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
            const border = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
            const glassBg = isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
            const glow = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';

            appBackgroundStyle['--text-primary'] = textColor;
            appBackgroundStyle['--text-secondary'] = textSecondary;
            appBackgroundStyle['--text-muted'] = textMuted;
            appBackgroundStyle['--border'] = border;
            appBackgroundStyle['--glass-bg'] = glassBg;
            appBackgroundStyle['--glow'] = glow;
            appBackgroundStyle.color = textColor;
        }
    } else if (background?.type === 'gradient' && background?.gradient) {
        appBackgroundStyle.backgroundImage = background.gradient;

        appBackgroundStyle['--text-primary'] = '#ffffff';
        appBackgroundStyle['--text-secondary'] = 'rgba(255, 255, 255, 0.8)';
        appBackgroundStyle.color = '#ffffff';
    }

    return (
        <div
            className={`app-container theme-${theme} ${
                isSidebarCollapsed
                    ? 'sidebar-collapsed'
                    : ''
            } ${isMobile ? 'is-mobile' : ''}`}
            data-theme={theme}
            style={appBackgroundStyle}
        >
            {isMobile && !isSidebarCollapsed && (
                <div
                    className="mobile-sidebar-backdrop"
                    onClick={() =>
                        setIsSidebarCollapsed(true)
                    }
                />
            )}

            <Sidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                newChat={newChat}
                switchChat={switchChat}
                deleteChat={deleteChat}
                backendStatus={backendStatus}
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={() =>
                    setIsSidebarCollapsed(
                        !isSidebarCollapsed
                    )
                }
            />

            <Workspace
                messages={messages}
                isLoading={isLoading}
                sendMessage={sendMessage}
                toggleAI={() =>
                    setIsAIOpen(!isAIOpen)
                }
                isAIOpen={isAIOpen}
                theme={theme}
                toggleTheme={toggleTheme}
                WelcomeScreen={WelcomeScreen}
                currentArtifact={currentArtifact}
                setCurrentArtifact={setCurrentArtifact}
                workspaceState={workspaceState}
                toggleSidebar={() =>
                    setIsSidebarCollapsed(
                        !isSidebarCollapsed
                    )
                }
                isMobile={isMobile}
            />

            <AIPanel
                isOpen={isAIOpen}
                onClose={() =>
                    setIsAIOpen(false)
                }
                sendMessage={sendMessage}
                isLoading={isLoading}
                messages={messages}
                backendStatus={backendStatus}
            />
        </div>
    );
}

export default App;