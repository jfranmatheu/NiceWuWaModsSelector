'use client';

import { useState, useEffect } from 'react';
import useSettingsStore from '@/store/settingsStore';

export default function Settings({ onClose }) {
  const { settings, updateSettings, isLoading, error } = useSettingsStore();
  const [formData, setFormData] = useState({
    mods_dir: '',
    ui: {
      use_hidden_card_title: true,
      show_labels: {
        category: false,
        character: false,
        wuwa_version: true
      }
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        mods_dir: settings.mods_dir || '',
        ui: {
          use_hidden_card_title: settings.ui?.use_hidden_card_title ?? true,
          show_labels: {
            category: settings.ui?.show_labels?.category ?? false,
            character: settings.ui?.show_labels?.character ?? false,
            wuwa_version: settings.ui?.show_labels?.wuwa_version ?? true
          }
        }
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/mods/verify-mods-dir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mods_dir: formData.mods_dir })
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify mods directory');
      }
      
      const { isValid } = await response.json();
      if (!isValid) {
        alert('Invalid mods directory. Please select a valid WWMI mods directory.');
        return;
      }

      await updateSettings(formData);
      onClose();
    } catch (error) {
      console.error('Error verifying mods directory:', error);
      alert('Error verifying mods directory. Please try again.');
    }
  };

  const handleBrowseFolder = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/browse-folder', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to browse folder');
      
      const { folder } = await response.json();
      if (folder) {
        setFormData(prev => ({ ...prev, mods_dir: folder }));
      }
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
                value={formData.mods_dir}
                onChange={(e) => setFormData(prev => ({ ...prev, mods_dir: e.target.value }))}
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