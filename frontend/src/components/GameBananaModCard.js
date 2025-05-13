'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaHeart, FaEye } from 'react-icons/fa';
import { IoOpenOutline } from 'react-icons/io5';

export default function GameBananaModCard({ mod, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenMod = (e) => {
    e.stopPropagation();
    window.open(mod._sProfileUrl, '_blank');
  };

  const handleOpenAuthor = (e) => {
    e.stopPropagation();
    window.open(mod._aSubmitter._sProfileUrl, '_blank');
  };

  const mainImage = mod._aPreviewMedia._aImages[0];
  const imageUrl = `${mainImage._sBaseUrl}/${mainImage._sFile}`;
  const isWarned = mod._sInitialVisibility === "warn";

  return (
    <div 
      className="relative rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(mod)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mod Image */}
      <div className="relative aspect-video overflow-clip">
        <Image
          src={imageUrl}
          alt={mainImage._sCaption}
          fill
          className={`object-cover ${isWarned ? 'blur-md' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Warning Overlay */}
        {isWarned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-2">
              <span className="px-3 py-1 bg-gray-800/80 text-gray-200 rounded-full text-sm font-medium">
                NSFW
              </span>
              <span className="px-3 py-1 bg-orange-500/80 text-white rounded-full text-sm font-medium">
                Warning
              </span>
            </div>
          </div>
        )}
        
        {/* Mod Name */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-lg font-semibold truncate">{mod._sName}</h3>
        </div>

        {/* Open in Browser Button */}
        <button
          onClick={handleOpenMod}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <IoOpenOutline className="w-5 h-5" />
        </button>
      </div>

      {/* Mod Info */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-6 h-6 rounded-full overflow-hidden">
            <Image
              src={mod._aSubmitter._sAvatarUrl}
              alt={mod._aSubmitter._sName}
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={handleOpenAuthor}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            {mod._aSubmitter._sName}
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <FaHeart className="w-4 h-4" />
            <span>{mod._nLikeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaEye className="w-4 h-4" />
            <span>{mod._nViewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 