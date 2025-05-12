'use client';

import { useState, useEffect } from 'react';
import useSettingsStore from '@/store/settingsStore';

export default function Settings({ onClose }) {
  const { settings, loadSettings, updateSettings, isLoading, error } = useSettingsStore();
  const [formData, setFormData] = useState({
    mods_folder: '',
    default_category: 'Characters',
    default_wuwa_version: '1.0.0'
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
    onClose();
  };

  const handleBrowseFolder = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/browse-folder', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to browse folder');
      
      const { folder } = await response.json();
      setFormData(prev => ({ ...prev, mods_folder: folder }));
    } catch (error) {
      console.error('Error browsing folder:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Mods Folder
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.mods_folder}
                onChange={(e) => setFormData(prev => ({ ...prev, mods_folder: e.target.value }))}
                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Select mods folder"
              />
              <button
                type="button"
                onClick={handleBrowseFolder}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Browse
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Default Category
            </label>
            <select
              value={formData.default_category}
              onChange={(e) => setFormData(prev => ({ ...prev, default_category: e.target.value }))}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Characters">Characters</option>
              <option value="NPCs">NPCs</option>
              <option value="Weapons">Weapons</option>
              <option value="UI">UI</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Default Wuthering Waves Version
            </label>
            <input
              type="text"
              value={formData.default_wuwa_version}
              onChange={(e) => setFormData(prev => ({ ...prev, default_wuwa_version: e.target.value }))}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 1.0.0"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 