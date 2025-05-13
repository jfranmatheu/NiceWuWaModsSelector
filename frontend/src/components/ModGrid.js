'use client';

import { useState, useEffect, useMemo } from 'react';
import ModCard from './ModCard';
import GameBananaModCard from './GameBananaModCard';
import GameBananaModModal from './GameBananaModModal';
import ModGridHeader from './ModGridHeader';
import useModStore from '@/store/modStore';
import useSettingsStore from '@/store/settingsStore';

export default function ModGrid({ category, character }) {
  const { mods, loadMods, isLoading, error } = useModStore();
  const { settings } = useSettingsStore();
  const [selectedModId, setSelectedModId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [context, setContext] = useState('installed');
  const [gamebananaMods, setGamebananaMods] = useState([]);
  const [selectedGamebananaMod, setSelectedGamebananaMod] = useState(null);
  const [isLoadingGamebanana, setIsLoadingGamebanana] = useState(false);
  const [gamebananaError, setGamebananaError] = useState(null);

  useEffect(() => {
    if (context === 'installed') {
      loadMods(category, character?.name);
    } else if (context === 'gamebanana' && character?.gamebanana?.cat_id) {
      loadGamebananaMods(character.gamebanana.cat_id);
    } else {
      console.log("no category or character found", { category, character });
    }
  }, [category, character, loadMods, context]);

  const loadGamebananaMods = async (categoryId) => {
    setIsLoadingGamebanana(true);
    setGamebananaError(null);
    try {
      const url = `https://gamebanana.com/apiv11/Mod/Index?_nPerpage=18&_aFilters%5BGeneric_Category%5D=${categoryId}&_nPage=1`;
      console.log("requesting modes for category", categoryId, "from url", url);
      const response = await fetch(url);
      const data = await response.json();
      setGamebananaMods(data._aRecords.filter(mod => 
        mod._bHasFiles && mod._sInitialVisibility !== "hide"
      ));
    } catch (error) {
      setGamebananaError('Failed to load mods from GameBanana');
      console.error('Error loading GameBanana mods:', error);
    } finally {
      setIsLoadingGamebanana(false);
    }
  };

  const handleModSelect = (modId) => {
    setSelectedModId(modId === selectedModId ? null : modId);
  };

  const handleGamebananaModSelect = (mod) => {
    setSelectedGamebananaMod(mod);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const handleContextChange = (newContext) => {
    setContext(newContext);
    setSearchQuery('');
    setSelectedModId(null);
    setSelectedGamebananaMod(null);
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

  // Filter GameBanana mods based on search query
  const filteredGamebananaMods = useMemo(() => {
    if (!searchQuery) return gamebananaMods;

    const query = searchQuery.toLowerCase();
    
    // First, find mods that start with the search query
    const startsWithMatches = gamebananaMods.filter(mod => 
      mod._sName.toLowerCase().startsWith(query)
    );

    // Then, find mods that contain the search query (excluding the ones that start with it)
    const containsMatches = gamebananaMods.filter(mod => 
      !mod._sName.toLowerCase().startsWith(query) && 
      mod._sName.toLowerCase().includes(query)
    );

    // Combine both results, with startsWith matches first
    return [...startsWithMatches, ...containsMatches];
  }, [gamebananaMods, searchQuery]);

  const renderContent = () => {
    if (context === 'installed') {
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
            No mods found matching &quot;{searchQuery}&quot;.
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
    } else {
      if (isLoadingGamebanana) {
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        );
      }

      if (gamebananaError) {
        return (
          <div className="text-center text-red-500 p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
            Error: {gamebananaError}
          </div>
        );
      }

      if (gamebananaMods.length === 0) {
        return (
          <div className="text-center text-gray-500 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            No mods found on GameBanana for this character.
          </div>
        );
      }

      if (filteredGamebananaMods.length === 0) {
        return (
          <div className="text-center text-gray-500 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            No mods found matching &quot;{searchQuery}&quot;.
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          {filteredGamebananaMods.map((mod) => (
            <GameBananaModCard
              key={mod._idRow}
              mod={mod}
              onSelect={handleGamebananaModSelect}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col">
      <ModGridHeader 
        onSearch={handleSearch} 
        selectedCharacter={character}
        onContextChange={handleContextChange}
        context={context}
      />
      {renderContent()}
      {selectedGamebananaMod && (
        <GameBananaModModal
          mod={selectedGamebananaMod}
          onClose={() => setSelectedGamebananaMod(null)}
        />
      )}
    </div>
  );
}