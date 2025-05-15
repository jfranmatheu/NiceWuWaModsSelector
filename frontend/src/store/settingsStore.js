import { create } from 'zustand';

const API_URL = 'http://localhost:8000/api';

const useSettingsStore = create((set) => ({
  settings: {
    mods_dir: '',
    ui: {
      use_hidden_card_title: true,
      show_labels: {
        category: false,
        character: false,
        wuwa_version: true
      }
    }
  },
  isLoading: true,
  error: null,

  loadSettings: async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      if (!response.ok) throw new Error('Failed to load settings');
      
      const settings = await response.json();
      set({ 
        settings, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error.message, 
        isLoading: false 
      });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSettings,
          ui: {
            ...newSettings.ui
          }
        }),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      const settings = await response.json();
      set({ settings, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useSettingsStore; 