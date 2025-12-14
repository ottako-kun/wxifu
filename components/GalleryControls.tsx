
import React, { useState } from 'react';
import SearchIcon from './icons/SearchIcon';
import SortAscendingIcon from './icons/SortAscendingIcon';
import CloseIcon from './icons/CloseIcon';
import FilterIcon from './icons/FilterIcon';
import GridIcon from './icons/GridIcon';
import ListIcon from './icons/ListIcon';

interface GalleryControlsProps {
  galleryName: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  sortOrder: 'default' | 'asc';
  toggleSort: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  availableCategories: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  availableTags: string[];
  clearFilters: () => void;
  viewMode?: 'grid' | 'feed';
  onViewModeChange?: (mode: 'grid' | 'feed') => void;
}

const GalleryControls: React.FC<GalleryControlsProps> = ({
  galleryName,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  sortOrder,
  toggleSort,
  selectedCategory,
  setSelectedCategory,
  availableCategories,
  selectedTags,
  toggleTag,
  availableTags,
  clearFilters,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + selectedTags.length;

  return (
    <div className="max-w-4xl mx-auto mb-2 space-y-3">
      {/* Top Row: Search | View Toggle | Sort | Filter */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search Bar - Compact Pill */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-4 h-4 text-gray-500" />
          </div>
          <input
            ref={searchInputRef}
            type="search"
            placeholder={`Search...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-700 rounded-full py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all shadow-inner"
            aria-label="Search"
          />
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {onViewModeChange && (
                <div className="flex bg-gray-900/80 border border-gray-700 rounded-full p-0.5">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 rounded-full transition-all duration-200 ${viewMode === 'grid' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        title="Grid View"
                    >
                        <GridIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('feed')}
                        className={`p-2 rounded-full transition-all duration-200 ${viewMode === 'feed' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        title="Feed View"
                    >
                        <ListIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            <button
                onClick={toggleSort}
                className={`flex-shrink-0 p-2.5 rounded-full border transition-all duration-300 
                    ${sortOrder === 'asc'
                    ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                title="Sort A-Z"
            >
                <SortAscendingIcon className="w-5 h-5" />
            </button>

            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex-shrink-0 p-2.5 rounded-full border transition-all duration-300
                    ${showFilters || activeFilterCount > 0
                    ? 'bg-pink-900/30 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                    : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                title="Filters"
            >
                <FilterIcon className="w-5 h-5" />
                {activeFilterCount > 0 && !showFilters && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border border-gray-900"></div>
                )}
            </button>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 animate-slide-up origin-top shadow-2xl">
            {/* Header / Clear */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Refine Results</span>
                {(activeFilterCount > 0) && (
                    <button onClick={clearFilters} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase flex items-center gap-1">
                        <CloseIcon className="w-3 h-3" /> Clear All
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => (
                        <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border
                                ${selectedCategory === category
                            ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20'
                            : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                            }`}
                        >
                        {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
                <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {availableTags.map(tag => (
                            <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2 py-1 rounded text-[10px] transition-colors duration-200 border
                                    ${selectedTags.includes(tag)
                                ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/50 shadow-[0_0_5px_rgba(6,182,212,0.1)]'
                                : 'bg-gray-800/30 border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-700'
                                }`}
                            >
                            #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default GalleryControls;
