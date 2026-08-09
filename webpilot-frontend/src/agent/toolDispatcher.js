import { validateToolCall } from './validators';
import { api } from '../services/api';

export const toolDispatcher = {
  async execute(toolName, args, dispatch, setThemeState) {
    // 1. Validate
    validateToolCall(toolName, args);

    // 2. Dispatch
    switch (toolName) {
      case 'set_background_color':
        dispatch({ type: 'SET_BACKGROUND_COLOR', payload: { color: args.color } });
        return `Changed the workspace background to ${args.color}.`;

      case 'set_background_gradient':
        dispatch({ type: 'SET_BACKGROUND_GRADIENT', payload: args });
        return `Applied background gradient.`;

      case 'set_theme':
        // set_theme hits the backend and the global React state, not workspace state
        await api.setTheme(args.theme);
        if (setThemeState) setThemeState(args.theme);
        return `Switched to ${args.theme} mode.`;

      case 'create_ui_element':
        dispatch({ 
          type: 'ADD_COMPONENT', 
          payload: {
            id: args.id,
            type: args.type,
            props: { text: args.text },
            style: {}
          } 
        });
        return `Added ${args.type} ${args.id}.`;

      case 'remove_ui_element':
        dispatch({ type: 'REMOVE_COMPONENT', payload: { id: args.id } });
        return `Removed ${args.id}.`;

      case 'update_ui_element':
        dispatch({ type: 'UPDATE_COMPONENT', payload: args });
        return `Updated ${args.id}.`;

      case 'show_notification':
        const notifId = Date.now().toString();
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: notifId, ...args } });
        return `Showing notification.`;

      case 'clear_workspace':
        dispatch({ type: 'CLEAR_WORKSPACE' });
        return `Cleared the workspace.`;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
};
