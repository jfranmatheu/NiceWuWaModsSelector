'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaStar } from "react-icons/fa";
import { IoHeartSharp } from "react-icons/io5";
import { IoHeartOutline } from "react-icons/io5";
import { IoGrid, IoList, IoApps } from "react-icons/io5";
import { GiSwitchWeapon } from "react-icons/gi";
import { GiSwordsEmblem } from "react-icons/gi";
import { GiOrbital } from "react-icons/gi";


const weaponMapIcons = {
  "All": <GiSwordsEmblem className='w-full h-full' />,
  "Sword": "https://www.prydwen.gg/static/f030fbedfea9b9c3837a2cddda9697e7/2391d/weapon_sword.png",
  "Rectifier": "https://www.prydwen.gg/static/44a8ab926f77e3701a04f20af69b2528/2391d/weapon_rectifier.png",
  "Gauntlets": "https://www.prydwen.gg/static/ee24d5a8b054c97591e6ec7fab8af845/2391d/weapon_gauntlets.png",
  "Broadblade": "https://www.prydwen.gg/static/1a8fd77c3956c11a572b0e2add093670/2391d/weapon_broadblade.png",
  "Pistols": "https://www.prydwen.gg/static/f71d9a8b096b116045ed073091adde48/2391d/weapon_pistols.png"
}

const elementMapIcons = {
  "All": <GiOrbital className='w-full h-full' />,
  "Fusion": "https://www.prydwen.gg/static/12e0bf6eef91cfd7dd832b9814d4d09a/2391d/element_fusion.png",
  "Aero": "https://www.prydwen.gg/static/1f08458a83668aa52df1e440ce70f1a2/2391d/element_aero.png",
  "Electro": "https://www.prydwen.gg/static/b3a899c0fab081fc3885a348751a9dc2/2391d/element_electro.png",
  "Havoc": "https://www.prydwen.gg/static/540bb4ed0d39932cf34d5a196d721f80/2391d/element_havoc.png",
  "Spectro": "https://www.prydwen.gg/static/411f51b647b7811db2212e4b6fe6bdd2/2391d/element_spectro.png",
  "Glacio": "https://www.prydwen.gg/static/4e2106b71dde592b9cdd87dbaa7f4b12/2391d/element_glacio.png"
}

// Helper function to render either an Image component or the icon component
const renderIcon = (type, value, style = 'default') => {
  const icon = type === 'weapon' ? weaponMapIcons[value] : elementMapIcons[value];
  
  // Define styles for different contexts
  const styles = {
    header: "w-6 h-6 relative",
    card: "w-6 h-6 relative flex-shrink-0",
    list: "w-5 h-5 relative flex-shrink-0",
    grid: "w-4 h-4 relative flex-shrink-0",
    default: "w-6 h-6 relative"
  };

  const imageStyles = {
    header: "",
    card: type === 'weapon' ? "drop-shadow-md" : "drop-shadow filter invert brightness-0",
    list: "",
    grid: type === 'weapon' ? "drop-shadow-md" : "drop-shadow filter invert brightness-0",
    default: ""
  };

  const containerClass = styles[style] || styles.default;
  
  if (value === 'All') {
    return (
      <div className={containerClass}>
        {icon}
      </div>
    );
  }
  
  return (
    <div className={containerClass}>
      <Image
        src={icon}
        alt={value}
        fill
        className={`object-contain ${imageStyles[style]}`}
      />
    </div>
  );
};

export default function CharacterSidebar({ onCharacterChange, selectedCharacter }) {
  const [viewMode, setViewMode] = useState(2); // 0: cards, 1: list, 2: grid
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rarityFilter, setRarityFilter] = useState("All");
  const [elementFilter, setElementFilter] = useState("All");
  const [weaponFilter, setWeaponFilter] = useState("All");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [showElementDropdown, setShowElementDropdown] = useState(false);
  const [showWeaponDropdown, setShowWeaponDropdown] = useState(false);
  const [showRarityDropdown, setShowRarityDropdown] = useState(false);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/characters');
        const data = await response.json();
        const charactersData = data.data.allContentfulWwCharacter.nodes
          .filter(char => !char.name.startsWith('Rover'))
          .map(char => ({
            name: char.name,
            icon: `https://www.prydwen.gg${char.smallImage.localFile.childImageSharp.gatsbyImageData.images.fallback.src}`,
            cardImage: `https://www.prydwen.gg${char.cardImage.localFile.childImageSharp.gatsbyImageData.images.fallback.src}`,
            weapon: char.weapon,
            element: char.element,
            rarity: char.rarity,
            unitId: char.unitId,
            id: char.id,
            isNew: char.isNew,
            upcoming: char.upcoming
          }));
        // Manually add the Rover Female and Male as they are not in the API
        charactersData.push({
          name: "Rover Female",
          icon: "https://www.prydwen.gg/static/33d043cdcced39c96b08f210c4c15d4c/60b4d/rover_icon.webp",
          cardImage: "https://www.prydwen.gg/static/ec3edb26e6df7f128ff8f9d1226c9a76/b26e2/rover_card.webp",
          weapon: "Sword",
          element: "All",
          rarity: "5",
          unitId: "0",
          id: "rover-female",
          isNew: false,
          upcoming: false
        });
        charactersData.push({
          name: "Rover Male",
          icon: "https://www.prydwen.gg/static/33d043cdcced39c96b08f210c4c15d4c/60b4d/rover_icon.webp",
          cardImage: "https://www.prydwen.gg/static/ec3edb26e6df7f128ff8f9d1226c9a76/b26e2/rover_card.webp",
          weapon: "Sword",
          element: "All",
          rarity: "5",
          unitId: "0",
          id: "rover-male",
          isNew: false,
          upcoming: false
        });
        // Fix specific character names...
        // "The Shorekeeper" -> "Shorekeeper"
        charactersData.forEach(char => {
          if (char.name === "The Shorekeeper") {
            char.name = "Shorekeeper";
          }
        });
        // Sort the characters by name and rarity.
        // Characters with "5" rarity are at the top, then "4".
        charactersData.sort((a, b) => {
          if (a.rarity === "5" && b.rarity !== "5") {
            return -1;
          } else if (a.rarity !== "5" && b.rarity === "5") {
            return 1;
          } else if (a.rarity === "4" && b.rarity !== "4") {
            return -1;
          } else if (a.rarity !== "4" && b.rarity === "4") {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
        // Fetch the characters categories from gamebanana
        // We are interesting in the category ID to be able to fetch the mods from the character category.
        // the category ID is '_idRow', the mod count in the category is '_nItemCount' the category url is '_sUrl' and the category name is '_sName' and it should match the character name.
        const gb_response = await fetch("https://gamebanana.com/apiv11/Mod/Categories?_idCategoryRow=29524&_sSort=a_to_z&_bShowEmpty=true");
        const gb_data = await gb_response.json();
        console.log("gb_data", gb_data);
        // Store the gamebanana category for each character in charactersData.
        // gb_data is an array of objects, each object has a _sName property that should match the character name.
        charactersData.forEach(char => {
          for (const category of gb_data) {
            if (category._sName === char.name) {
              char.gamebanana = {
                cat_id: category._idRow,
                // cat_name: category._sName, // not needed
                cat_url: category._sUrl,
                cat_mod_count: category._nItemCount,
                // cat_icon: category._sIcon, // not needed
              };
            }
          }
        });

        console.log("charactersData", charactersData);
        setCharacters(charactersData);
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const toggleFavorite = (characterId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(characterId)) {
        newFavorites.delete(characterId);
      } else {
        newFavorites.add(characterId);
      }
      return newFavorites;
    });
  };

  const filteredCharacters = characters.filter(char => {
    if (showFavorites && !favorites.has(char.id)) return false;
    if (rarityFilter !== "All" && char.rarity !== rarityFilter) return false;
    if (elementFilter !== "All" && char.element !== elementFilter) return false;
    if (weaponFilter !== "All" && char.weapon !== weaponFilter) return false;
    return true;
  });

  const cycleViewMode = () => {
    setViewMode((prev) => (prev + 1) % 3);
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 0: return <IoGrid className='w-full h-full p-1' />;
      case 1: return <IoList className='w-full h-full p-1' />;
      case 2: return <IoApps className='w-full h-full p-1' />;
      default: return <IoGrid className='w-full h-full p-1' />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-screen flex flex-col flex-none w-64">
      <div className="flex-1 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <>
            {/* Filters Header */}
            <div className="sticky top-0 left-0 right-0 w-full bg-white dark:bg-gray-800 py-2 z-10 flex justify-between items-center px-2">
              {/* Left side - Dropdowns */}
              <div className="flex gap-2">
                {/* Rarity Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowRarityDropdown(!showRarityDropdown);
                      setShowElementDropdown(false);
                      setShowWeaponDropdown(false);
                    }}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
                  >
                    <div className="relative w-5 h-5">
                      <FaStar className={`w-full h-full ${rarityFilter === "All" ? "text-gray-200" : rarityFilter === "5" ? "text-yellow-500" : "text-purple-400"}`} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
                        {rarityFilter === "All" ? "" : rarityFilter}
                      </span>
                    </div>
                  </button>
                  {showRarityDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setRarityFilter("All");
                          setShowRarityDropdown(false);
                        }}
                        className="w-full px-3 py-2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setRarityFilter("5");
                          setShowRarityDropdown(false);
                        }}
                        className="w-full px-3 py-2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        5★
                      </button>
                      <button
                        onClick={() => {
                          setRarityFilter("4");
                          setShowRarityDropdown(false);
                        }}
                        className="w-full px-3 py-2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        4★
                      </button>
                    </div>
                  )}
                </div>

                {/* Element Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowElementDropdown(!showElementDropdown);
                      setShowWeaponDropdown(false);
                    }}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
                  >
                    {renderIcon('element', elementFilter, 'header')}
                  </button>
                  {showElementDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                      {Object.entries(elementMapIcons).map(([elementName, elementIcon]) => (
                        <button
                          key={elementName}
                          onClick={() => {
                            setElementFilter(elementName);
                            setShowElementDropdown(false);
                          }}
                          className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${elementName === "All" ? "border-b border-gray-200 dark:border-gray-700" : ""}`}
                        >
                          {elementName === "All" ? (
                            <>
                              <GiOrbital className='w-5 h-5' />
                              <span>All</span>
                            </>
                          ) : (
                            <>
                              <div className="w-5 h-5 relative">
                                <Image
                                  src={elementIcon}
                                  alt={elementName}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span>{elementName}</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weapon Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowWeaponDropdown(!showWeaponDropdown);
                      setShowElementDropdown(false);
                    }}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center"
                  >
                    {renderIcon('weapon', weaponFilter, 'header')}
                  </button>
                  {showWeaponDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                      {Object.entries(weaponMapIcons).map(([weaponName, weaponIcon]) => (
                        <button
                          key={weaponName}
                          onClick={() => {
                            setWeaponFilter(weaponName);
                            setShowWeaponDropdown(false);
                          }}
                          className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${weaponName === "All" ? "border-b border-gray-200 dark:border-gray-700" : ""}`}
                        >
                          {weaponName === "All" ? (
                            <>
                              <GiSwordsEmblem className='w-5 h-5' />
                              <span>All</span>
                            </>
                          ) : (
                            <>
                              <div className="w-5 h-5 relative">
                                <Image
                                  src={weaponIcon}
                                  alt={weaponName}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span>{weaponName}</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="w-8 h-8 rounded flex items-center justify-center marker:bg-gray-100 dark:bg-gray-700"
                >
                  <IoHeartSharp className={`w-full h-full p-1 ${
                    showFavorites ? 'text-red-500' : 'text-gray-200'
                  }`} />
                </button>
              </div>

              {/* Right side - Buttons */}
              <div className="flex gap-2 border-l pl-2 border-gray-200 dark:border-gray-700">
                <button
                  onClick={cycleViewMode}
                  className="w-8 h-8 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {getViewModeIcon()}
                </button>
              </div>
            </div>

            {/* Character Grid */}
            <div className={`px-4 pb-4 grid ${
              viewMode === 0 ? 'grid-cols-1 gap-4' : 
              viewMode === 1 ? 'grid-cols-1 gap-1' : 
              'grid-cols-2 gap-4'
            } mt-4`}>
              {filteredCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => onCharacterChange(character)}
                  className={`relative flex flex-col items-center rounded-lg overflow-hidden transition-colors ${
                    selectedCharacter?.name === character.name
                      ? 'ring-2 ring-blue-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {viewMode === 0 ? (
                    // Card view
                    <div className="w-full">
                      <div 
                        className="relative w-full aspect-[3/4]"
                        style={{
                          backgroundColor: character.rarity === "5" ? "#ccbf48" : "#9b68d4"
                        }}
                      >
                        <Image
                          src={character.cardImage}
                          alt={character.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-1 left-1 right-1 flex justify-between">
                          {renderIcon('element', character.element, 'card')}
                          {renderIcon('weapon', character.weapon, 'card')}
                        </div>
                        <div 
                          className="absolute bottom-0 left-0 right-0 p-2 text-center text-white backdrop-blur-[1px]"
                          style={{
                            background: character.rarity === "5" 
                              ? "linear-gradient(0deg, rgba(204, 191, 72, 0.9), rgba(171, 144, 89, 0))"
                              : "linear-gradient(0deg, rgba(155, 104, 212, 0.9), rgba(107, 46, 150, 0))"
                          }}
                        >
                          <p className="text-lg font-mono font-bold text-white drop-shadow">{character.name}</p>
                        </div>
                      </div>
                      
                    </div>
                  ) : viewMode === 1 ? (
                    // List view
                    <div className="w-full flex items-center gap-4 p-2">
                      <div 
                        className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                        style={{
                          backgroundColor: character.rarity === "5" ? "#ccbf48" : "#9b68d4"
                        }}
                      >
                        <Image
                          src={character.icon}
                          alt={character.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg text-left font-medium truncate mb-[4px]">{character.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderIcon('element', character.element, 'list')}
                          {renderIcon('weapon', character.weapon, 'list')}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Grid view
                    <div className="w-full aspect-square">
                      <div 
                        className="relative w-full h-full rounded-lg overflow-hidden"
                        style={{
                          backgroundColor: character.rarity === "5" ? "#ccbf48" : "#9b68d4"
                        }}
                      >
                        <Image
                          src={character.icon}
                          alt={character.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-1 left-1 right-1 flex justify-between">
                          {renderIcon('element', character.element, 'grid')}
                          {renderIcon('weapon', character.weapon, 'grid')}
                        </div>
                        <div 
                          className="absolute bottom-0 left-0 right-0 p-1 text-center"
                          style={{
                            background: character.rarity === "5" 
                              ? "linear-gradient(0deg, rgba(80, 60, 20, 0.9), rgba(171, 144, 89, 0.1))"
                              : "linear-gradient(0deg, rgba(60, 20, 80, 0.9), rgba(107, 46, 150, 0.1))"
                          }}
                        >
                          <p className="text-white text-sm font-mono font-bold drop-shadow">{character.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
              </button>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
} 