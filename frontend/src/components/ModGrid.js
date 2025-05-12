'use client';

import { useState, useEffect, useMemo } from 'react';
import ModCard from './ModCard';
import ModGridHeader from './ModGridHeader';
import useModStore from '@/store/modStore';
import useSettingsStore from '@/store/settingsStore';

export default function ModGrid({ category, character }) {
  const { mods, loadMods, isLoading, error } = useModStore();
  const { settings } = useSettingsStore();
  const [selectedModId, setSelectedModId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMods(category, character);
  }, [category, character, loadMods]);

  const handleModSelect = (modId) => {
    setSelectedModId(modId === selectedModId ? null : modId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  // Filter mods based on search query
  const filteredMods = useMemo(() => {
    if (!searchQuery) return mods;

    const query = searchQuery.toLowerCase();
    
    // First, find mods that start with the search query
    const startsWithMatches = mods.filter(mod => 
      mod.name.toLowerCase().startsWith(query)
    );

    // Then, find mods that contain the search query (excluding the ones that start with it)
    const containsMatches = mods.filter(mod => 
      !mod.name.toLowerCase().startsWith(query) && 
      mod.name.toLowerCase().includes(query)
    );

    // Combine both results, with startsWith matches first
    return [...startsWithMatches, ...containsMatches];
  }, [mods, searchQuery]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          Error: {error}
        </div>
      );
    }

    if (mods.length === 0) {
      let message = "No mods found.";
      if (category) {
        message += ` Try adding some mods to the ${category} category`;
        if (character) {
          message += ` for ${character}`;
        }
      }
      message += "!";
      
      return (
        <div className="text-center text-gray-500 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {message}
        </div>
      );
    }

    if (filteredMods.length === 0) {
      return (
        <div className="text-center text-gray-500 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          No mods found matching "{searchQuery}".
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {filteredMods.map((mod) => (
          <ModCard 
            key={mod.id} 
            mod={{
              id: mod.id,
              metadata: {
                name: mod.name,
                preview: mod.preview_image,
                category: mod.category,
                character: mod.character,
                wuwa_version: mod.wuwa_version,
                enabled: mod.enabled,
                created_at: mod.created_at,
                updated_at: mod.updated_at
              }
            }}
            isSelected={selectedModId === mod.id}
            onSelect={handleModSelect}
            uiSettings={settings.ui}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <ModGridHeader onSearch={handleSearch} />
      {renderContent()}
    </div>
  );
} 