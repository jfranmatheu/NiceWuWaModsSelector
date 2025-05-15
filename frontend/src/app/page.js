'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CharacterSidebar from '@/components/CharacterSidebar';
import ModGrid from '@/components/ModGrid';
import AddModButton from '@/components/AddModButton';
import Settings from '@/components/Settings';
import { FaDownload, FaGamepad } from 'react-icons/fa';
import useSettingsStore from '@/store/settingsStore';
import TacetMarkLoader from '@/components/TacetMarkLoader';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Characters");
  const [selectedCharacter, setSelectedCharacter] = useState("Zani");
  const [showSettings, setShowSettings] = useState(false);
  const [context, setContext] = useState('installed');
  const {settings, loadSettings, isLoading} = useSettingsStore();
  const [isLoadingFake, setIsLoadingFake] = useState(true);

  useEffect(() => {
    // Add some delay to the loading screen
    loadSettings();
  }, []);

  const onContextChange = (newContext) => {
    setContext(newContext);
  };

  return (
    <main className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden rounded-lg border-solid border-2 border-slate-200 dark:border-slate-600">
      {(isLoading) && (
        <div className="fixed inset-0 flex flex-col items-center justify-center h-screen bg-black/95 z-50">
          <TacetMarkLoader size={144} />
          <div className="mt-4">
            <div className="loading-text">
              <span className="loading-text-words">L</span>
              <span className="loading-text-words">O</span>
              <span className="loading-text-words">A</span>
              <span className="loading-text-words">D</span>
              <span className="loading-text-words">I</span>
              <span className="loading-text-words">N</span>
              <span className="loading-text-words">G</span>
            </div>
          </div>
        </div>
      )}
      <Sidebar onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} setShowSettings={setShowSettings} />
      
      {selectedCategory === 'Characters' && (
        <CharacterSidebar onCharacterChange={setSelectedCharacter} selectedCharacter={selectedCharacter} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="pywebview-drag-region flex-none p-2 pb-0 flex items-center bg-white dark:bg-gray-800 shadow">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onContextChange('installed')}
              className={`px-4 py-1.5 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700 flex items-center gap-2 ${
                context === 'installed' 
                  ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FaDownload className="w-4 h-4" />
              <span className="text-sm font-medium">Installed</span>
            </button>
            <button
              onClick={() => onContextChange('gamebanana')}
              className={`px-4 py-1.5 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700 flex items-center gap-2 ${
                context === 'gamebanana' 
                  ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FaGamepad className="w-4 h-4" />
              <span className="text-sm font-medium">GameBanana</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <ModGrid
            category={selectedCategory}
            character={selectedCharacter}
            context={context}
          />
          {context === 'installed' && <AddModButton />}
        </div>
      </div>

      {(showSettings || (settings && settings.mods_dir === '')) && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </main>
  );
}
