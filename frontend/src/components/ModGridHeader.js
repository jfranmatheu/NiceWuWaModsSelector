'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { LuSettings2 } from "react-icons/lu";
import { LuDot } from "react-icons/lu";
import useSettingsStore from '@/store/settingsStore';

export default function ModGridHeader({ onSearch, selectedCharacter }) {
  const { settings, updateSettings } = useSettingsStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLabelToggle = async (label) => {
    const newSettings = {
      ...settings,
      ui: {
        ...settings.ui,
        show_labels: {
          ...settings.ui.show_labels,
          [label]: !settings.ui.show_labels[label]
        }
      }
    };
    await updateSettings(newSettings);
  };

  const handleTitleToggle = async () => {
    const newSettings = {
      ...settings,
      ui: {
        ...settings.ui,
        use_hidden_card_title: !settings.ui.use_hidden_card_title
      }
    };
    await updateSettings(newSettings);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
      {/* Search Box */}
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search mods..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Settings Menu */}
      <div className="relative ml-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LuSettings2 className="w-5 h-5" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10">
            <div className="space-y-4">
              {/* Title Display Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hidden Card Title</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.ui.use_hidden_card_title}
                    onChange={handleTitleToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Labels Section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Labels</h3>
                <div className="space-y-2">
                  {Object.entries(settings.ui.show_labels).map(([label, enabled]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm capitalize flex items-center gap-2"><LuDot className="w-4 h-4" />{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleLabelToggle(label)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
