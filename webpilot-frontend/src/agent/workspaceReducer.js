export const initialWorkspaceState = {
  background: { type: 'solid', color: 'transparent', gradient: null },
  components: [],
  notifications: []
};

export function workspaceReducer(state, action) {
  switch (action.type) {
    case 'SET_BACKGROUND_COLOR':
      return {
        ...state,
        background: { type: 'solid', color: action.payload.color, gradient: null }
      };

    case 'SET_BACKGROUND_GRADIENT':
      return {
        ...state,
        background: { 
          type: 'gradient', 
          color: null, 
          gradient: `linear-gradient(${action.payload.direction}, ${action.payload.from}, ${action.payload.to})` 
        }
      };

    case 'ADD_COMPONENT':
      // Avoid duplicates
      if (state.components.some(c => c.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        components: [...state.components, action.payload]
      };

    case 'REMOVE_COMPONENT':
      return {
        ...state,
        components: state.components.filter(c => c.id !== action.payload.id)
      };

    case 'UPDATE_COMPONENT':
      return {
        ...state,
        components: state.components.map(c => {
          if (c.id === action.payload.id) {
            // merge properties into props and style dynamically based on what they are
            const updates = action.payload.properties;
            const newProps = { ...c.props };
            const newStyle = { ...c.style };
            
            Object.keys(updates).forEach(key => {
              if (['text', 'value', 'placeholder', 'src'].includes(key)) {
                newProps[key] = updates[key];
              } else {
                newStyle[key] = updates[key];
              }
            });
            
            return { ...c, props: newProps, style: newStyle };
          }
          return c;
        })
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'CLEAR_WORKSPACE':
      return {
        ...state,
        components: [],
        background: { type: 'solid', color: 'transparent', gradient: null }
      };

    default:
      return state;
  }
}
