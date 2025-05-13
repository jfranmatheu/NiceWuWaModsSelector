'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CharacterSidebar from '@/components/CharacterSidebar';
import ModGrid from '@/components/ModGrid';
import AddModButton from '@/components/AddModButton';
import Settings from '@/components/Settings';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden rounded-lg border-solid border-2 border-slate-200 dark:border-slate-600">
      <Sidebar onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} setShowSettings={setShowSettings} />
      
      {selectedCategory === 'Characters' && (
        <CharacterSidebar onCharacterChange={setSelectedCharacter} selectedCharacter={selectedCharacter} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="pywebview-drag-region flex-none p-2 flex bg-white dark:bg-gray-800 shadow">
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {selectedCategory} {selectedCategory === 'Characters' ? `/ ${selectedCharacter} /` : '/'}
          </span>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <ModGrid
            category={selectedCategory}
            character={selectedCharacter}
          />

          <AddModButton />
        </div>
      </div>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </main>
  );
}
