'use client';

import { useState } from 'react';
import { GiSwordsEmblem } from "react-icons/gi";
import { GiSwordman } from "react-icons/gi";
import { MdOutlineQuestionMark } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { RiLayout3Fill } from "react-icons/ri";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { MdSettings } from "react-icons/md";
import { GiMonsterGrasp } from "react-icons/gi";
import { GiAngelWings } from "react-icons/gi";

export default function Sidebar({ onCategoryChange, selectedCategory, setShowSettings }) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { name: 'Characters', icon: <GiSwordman /> }, // 'https://images.gamebanana.com/img/ico/ModCategory/6654b6596ba11.png'
    { name: 'Echoes', icon: <GiMonsterGrasp /> },
    { name: 'Gliders', icon: <GiAngelWings /> },
    { name: 'Weapons', icon: <GiSwordsEmblem /> },
    { name: 'NPCs', icon: <FaUser /> },
    { name: 'UI', icon: <RiLayout3Fill /> },
    { name: 'Other', icon: <MdOutlineQuestionMark /> }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 h-screen flex flex-col flex-none transition-all duration-300 ${isOpen ? 'w-50' : 'w-16'}`}>
      <div className="pywebview-drag-region flex-none p-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {isOpen ? <IoIosArrowBack /> : <IoIosArrowForward />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isOpen ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => onCategoryChange(category.name)}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => onCategoryChange(category.name)}
                className={`w-full p-2 rounded flex justify-center transition-colors text-2xl ${
                  selectedCategory === category.name
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={category.name}
              >
                {category.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-none p-3 border-t border-gray-200 dark:border-gray-700">
      {isOpen ? (
          <>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <MdSettings className="text-2xl" />
              Settings
            </button>
          </>
        ) : (
          <>
            <div className="w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-2" onClick={() => setShowSettings(true)}>
              <MdSettings className="text-2xl text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 "/>
            </div>
          </>
        )}
      </div>
    </div>
  );
}