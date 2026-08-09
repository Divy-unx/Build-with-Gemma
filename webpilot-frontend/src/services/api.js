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

  async sendMessage(message) {
    try {
      const response = await fetch(`${API_BASE}/api/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const text = await response.text(); // Because the backend might just return plain text
      return text;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};
