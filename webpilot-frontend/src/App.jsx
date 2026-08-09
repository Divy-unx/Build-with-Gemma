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

    if (background?.type === 'solid' && background?.color) {
        appBackgroundStyle.backgroundColor = background.color;

        // Calculate contrast so text remains readable
        // against the AI-selected background.
        const hex = background.color.replace('#', '');

        let r = 0;
        let g = 0;
        let b = 0;

        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }

        const yiq =
            (r * 299 + g * 587 + b * 114) / 1000;

        const textColor =
            yiq >= 128 ? '#000000' : '#ffffff';

        const textSecondary =
            yiq >= 128
                ? 'rgba(0, 0, 0, 0.7)'
                : 'rgba(255, 255, 255, 0.7)';

        appBackgroundStyle['--text-primary'] = textColor;
        appBackgroundStyle['--text-secondary'] = textSecondary;
        appBackgroundStyle.color = textColor;
    } else if (
        background?.type === 'gradient' &&
        background?.gradient
    ) {
        appBackgroundStyle.backgroundImage =
            background.gradient;

        appBackgroundStyle['--text-primary'] = '#ffffff';
        appBackgroundStyle['--text-secondary'] =
            'rgba(255, 255, 255, 0.8)';
        appBackgroundStyle.color = '#ffffff';
    }

    return (
        <div
            className={`app-container theme-${theme} ${
                isSidebarCollapsed
                    ? 'sidebar-collapsed'
                    : ''
            } ${isMobile ? 'is-mobile' : ''}`}
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