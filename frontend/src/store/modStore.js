import { create } from 'zustand';

const API_URL = 'http://localhost:8000/api';


const fetch_preview_image = (category, character, image_path) => {
  // Ensure the image path uses forward slashes and starts with a slash
  const normalizedPath = image_path.replace(/\\/g, '/');
  return `${API_URL}/preview/${category}/${character}/${normalizedPath}`;
}


const useModStore = create((set, get) => ({
  mods: [],
  isLoading: false,
  error: null,

  loadMods: async (category, character) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (character) params.append('character', character);
      
      const response = await fetch(`${API_URL}/mods?${params}`);
      if (!response.ok) throw new Error('Failed to load mods');
      
      const mods = await response.json();
      // Transform the mods data to include preview URLs
      const transformedMods = mods.map(mod => ({
        ...mod,
        preview: mod.preview_image // ? fetch_preview_image(mod.category, mod.character, mod.preview_image) : null
      }));
      console.log(transformedMods.map(mod => mod.preview));
      set({ mods: transformedMods, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addMod: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/mods`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to add mod');
      
      const newMod = await response.json();
      // Transform the new mod data to include preview URL
      const transformedMod = {
        ...newMod,
        preview: newMod.preview_image // ? await fetch_preview_image(newMod.category, newMod.character, newMod.preview_image) : null
      };
      set(state => ({ mods: [...state.mods, transformedMod], isLoading: false }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteMod: async (modId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/mods/${modId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete mod');
      
      set(state => ({
        mods: state.mods.filter(mod => mod.id !== modId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  toggleMod: async (modId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/mods/${modId}/toggle`, {
        method: 'PATCH',
      });
      console.log("toggleMod: response: ", response);
      if (!response.ok) throw new Error('Failed to toggle mod');
      
      const updatedMod = await response.json();
      // Transform the updated mod data to include preview image data
      const transformedMod = {
        ...updatedMod,
        preview: updatedMod.preview_image // ? await fetch_preview_image(updatedMod.category, updatedMod.character, updatedMod.preview_image) : null
      };
      set(state => ({
        mods: state.mods.map(mod => 
          mod.id === modId ? transformedMod : mod
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  installFromGamebanana: async ({ modData, selectedFiles }) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Sending to backend:', { 
        modData, 
        selectedFiles,
        selectedFilesType: typeof selectedFiles,
        isArray: Array.isArray(selectedFiles)
      });
      
      const response = await fetch(`${API_URL}/mods/gamebanana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modData, 
          selectedFiles: selectedFiles.filter(id => id != null).map(id => Number(id))
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to install from GameBanana');
      }
      
      await get().loadMods();
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useModStore;