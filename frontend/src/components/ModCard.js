'use client';

import Image from 'next/image';
import { useState } from 'react';
import useModStore from '@/store/modStore';
import ImageDisplay from './ImageDisplay';
import { CiImageOff } from "react-icons/ci";

export default function ModCard({ mod, isSelected, onSelect, uiSettings }) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleMod } = useModStore();

  const handleToggle = async (e) => {
    e.stopPropagation(); // Prevent triggering select
    await toggleMod(mod.id);
  };

  const handleSelect = () => {
    onSelect(mod.id);
  };

  // Use preview prop for image src
  const previewImage = mod.preview;
  // Get caption from first image if available
  const imageCaption = mod.images && mod.images.length > 0 ? mod.images[0].caption : null;

  return (
    <div
      className={`relative aspect-square w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
      onDoubleClick={handleToggle}
    >
      {/* Preview Image or Placeholder */}
      <div className={`absolute inset-0 transition-all duration-200
        ${mod.enabled ? '' : 'grayscale-[0.7] saturate-[0.7]'}`}>
        {previewImage ? (
          <ImageDisplay
            filePath={previewImage}
            relative={false}
            alt={mod.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <CiImageOff className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-black/0 to-black/0 transition-opacity duration-200
        ${previewImage ? (isHovered ? 'opacity-100' : 'opacity-0') : 'opacity-100'}`}
      />

      {/* Title - Fades in from top */}
      <div className={`absolute top-0 left-0 right-0 p-4 transition-all duration-200
        ${previewImage ? (
          uiSettings.use_hidden_card_title 
            ? (isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4')
            : 'opacity-100 translate-y-0'
        ) : 'opacity-100 translate-y-0'}`}
      >
        <h3 className="text-lg font-semibold text-white drop-shadow-md line-clamp-2">
          {mod.name}
        </h3>
        {/*imageCaption && (
          <div className="text-xs text-gray-200 mt-1 line-clamp-1">{imageCaption}</div>
        )*/}
      </div>

      {/* Labels - Slides up from bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-200
        ${previewImage ? (isHovered ? 'translate-y-0' : 'translate-y-full') : 'translate-y-0'}`}
      >
        <div className="flex flex-wrap gap-2">
          {uiSettings.show_labels.category && (
            <span className="px-2 py-1 text-sm bg-blue-500/80 backdrop-blur-sm text-white rounded">
              {mod.category}
            </span>
          )}
          {uiSettings.show_labels.character && mod.character && (
            <span className="px-2 py-1 text-sm bg-purple-500/80 backdrop-blur-sm text-white rounded">
              {mod.character}
            </span>
          )}
        </div>
      </div>

      {/* Enabled Indicator */}
      {mod.enabled && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
      )}
    </div>
  );
} 