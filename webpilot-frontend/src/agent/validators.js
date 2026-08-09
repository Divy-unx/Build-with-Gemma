import { WEBPILOT_TOOLS, SUPPORTED_UI_ELEMENTS } from './toolDefinitions';

export function validateToolCall(toolName, args) {
  if (!WEBPILOT_TOOLS.includes(toolName)) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  if (!args) {
    throw new Error(`Missing arguments for tool: ${toolName}`);
  }

  switch (toolName) {
    case 'set_background_color':
      if (typeof args.color !== 'string' || !args.color) {
        throw new Error('color must be a non-empty string');
      }
      break;

    case 'set_background_gradient':
      if (typeof args.from !== 'string' || typeof args.to !== 'string' || typeof args.direction !== 'string') {
        throw new Error('Missing gradient parameters');
      }
      break;

    case 'set_theme':
      if (args.theme !== 'light' && args.theme !== 'dark') {
        throw new Error('theme must be light or dark');
      }
      break;

    case 'create_ui_element':
      if (!SUPPORTED_UI_ELEMENTS.includes(args.type)) {
        throw new Error(`Unsupported UI element type: ${args.type}`);
      }
      if (typeof args.id !== 'string' || !args.id) {
        throw new Error('id must be a non-empty string');
      }
      break;

    case 'remove_ui_element':
      if (typeof args.id !== 'string' || !args.id) {
        throw new Error('id must be a non-empty string');
      }
      break;

    case 'update_ui_element':
      if (typeof args.id !== 'string' || !args.id) {
        throw new Error('id must be a non-empty string');
      }
      if (!args.properties || typeof args.properties !== 'object') {
        throw new Error('properties must be an object');
      }
      break;

    case 'show_notification':
      if (typeof args.message !== 'string' || !args.message) {
        throw new Error('message must be a non-empty string');
      }
      break;

    case 'clear_workspace':
      // no args required
      break;
  }

  return true;
}
