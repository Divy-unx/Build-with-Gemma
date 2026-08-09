const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined in .env file");
}

export const api = {
  async checkBackend() {
    try {
      const response = await fetch(`${API_BASE}/api/theme`);
      return response.ok;
    } catch {
      return false;
    }
  },

  async getTheme() {
    try {
      const response = await fetch(`${API_BASE}/api/theme`);
      if (!response.ok) throw new Error('Failed to get theme');
      const data = await response.json();
      return data.theme;
    } catch (error) {
      console.error(error);
      return 'dark'; // default
    }
  },

  async setTheme(theme) {
    try {
      const response = await fetch(`${API_BASE}/api/theme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });
      if (!response.ok) throw new Error('Failed to set theme');
      const data = await response.json();
      return data.theme;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getConversations() {
    try {
      const response = await fetch(`${API_BASE}/api/conversations`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getConversation(id) {
    try {
      const response = await fetch(`${API_BASE}/api/conversations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async createConversation(title = null) {
    try {
      const response = await fetch(`${API_BASE}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async deleteConversation(id) {
    try {
      const response = await fetch(`${API_BASE}/api/conversations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete conversation');
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async sendMessage(conversationId, message) {
    try {
      const response = await fetch(`${API_BASE}/api/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, message }),
      });
      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
