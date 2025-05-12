'use client';

import { useState, useRef } from 'react';
import useModStore from '@/store/modStore';
import ModDetailsModal from './ModDetailsModal';

export default function AddModButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [gamebananaUrl, setGamebananaUrl] = useState('');
  const [modData, setModData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { addMod, installFromGamebanana } = useModStore();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFiles = async (files) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('category', 'Other');
      formData.append('wuwa_version', '1.0.0');
      
      await addMod(formData);
    }
  };

  const handleGamebananaSubmit = async (e) => {
    e.preventDefault();
    if (!gamebananaUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract mod ID from URL
      const modId = gamebananaUrl.match(/\/mods\/(\d+)/)?.[1];
      if (!modId) {
        throw new Error('Invalid GameBanana URL');
      }

      // Fetch mod data from GameBanana API
      const response = await fetch(`https://gamebanana.com/apiv11/Mod/${modId}/ProfilePage`);
      if (!response.ok) {
        throw new Error('Failed to fetch mod data');
      }

      const data = await response.json();
      setModData(data);
      setGamebananaUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (selectedFileIds) => {
    if (!modData || selectedFileIds.length === 0) return;

    // Make sure we're sending just the IDs, not the whole file objects
    const selectedFiles = selectedFileIds.map(id => Number(id));

    await installFromGamebanana({
      modData,
      selectedFiles
    });

    setModData(null);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center text-2xl"
      >
        +
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Mod</h2>

            <div
              className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center ${
                isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Drag and drop mod files here
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-500 hover:text-blue-600"
              >
                or click to browse
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Or install from GameBanana
              </h3>
              <form onSubmit={handleGamebananaSubmit}>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={gamebananaUrl}
                    onChange={(e) => setGamebananaUrl(e.target.value)}
                    placeholder="Paste GameBanana URL"
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Install'}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </form>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setModData(null);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {modData && (
        <ModDetailsModal
          modData={modData}
          onClose={() => setModData(null)}
          onInstall={handleInstall}
        />
      )}
    </>
  );
} 