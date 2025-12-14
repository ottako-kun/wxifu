
import React, { useState } from 'react';
import SearchIcon from './icons/SearchIcon';
import SortAscendingIcon from './icons/SortAscendingIcon';
import CloseIcon from './icons/CloseIcon';

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
  clearFilters
}) => {
  const [showTags, setShowTags] = useState(false);

  return (
    <div className="max-w-4xl mx-auto mb-4 space-y-4">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            ref={searchInputRef}
            type="search"
            placeholder={`Search ${galleryName === 'following' ? 'followed posts' : galleryName + 's'}, authors, tags...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all shadow-inner"
            aria-label="Search media"
          />
        </div>

        <button
          onClick={toggleSort}
          className={`w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-x-2 px-5 py-3 rounded-xl border transition-all duration-300 text-sm font-semibold
                ${sortOrder === 'asc'
              ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
        >
          <SortAscendingIcon className="w-5 h-5" />
          <span>Sort A-Z</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
        <div className="flex justify-start sm:justify-center space-x-2 min-w-max px-2">
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                    ${selectedCategory === category
                  ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20 transform scale-105'
                  : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Tag Filter */}
      {availableTags.length > 0 && (
        <div className="flex flex-col items-center animate-fade-in">
           <button 
              onClick={() => setShowTags(!showTags)}
              className="group flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors py-2"
            >
               <span>{showTags ? 'Hide Tags' : 'Filter by Tags'}</span>
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 strokeWidth={2} 
                 stroke="currentColor" 
                 className={`w-4 h-4 transition-transform duration-300 ${showTags ? 'rotate-180' : ''}`}
               >
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
               </svg>
            </button>

            {/* Selected Tags Summary (Visible when collapsed) */}
            {!showTags && selectedTags.length > 0 && (
               <div className="flex flex-wrap justify-center gap-2 mt-1 mb-2">
                  {selectedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-2 py-0.5 rounded text-[10px] bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 hover:bg-red-900/30 hover:text-red-300 hover:border-red-500/30 transition-colors"
                    >
                      #{tag} &times;
                    </button>
                  ))}
               </div>
            )}

            {/* Expanded Tag Cloud */}
            {showTags && (
                <div className="w-full bg-gray-900/40 border border-gray-800 rounded-xl p-4 mt-2 animate-fade-in shadow-inner">
                    <div className="flex flex-wrap justify-center gap-2">
                        {availableTags.map(tag => (
                            <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded text-xs transition-colors duration-200 border
                                    ${selectedTags.includes(tag)
                                ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                : 'bg-gray-800/50 border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-700'
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

      {/* Clear Filters Button */}
      {(selectedCategory !== 'All' || selectedTags.length > 0 || searchQuery) && (
        <div className="flex justify-center animate-fade-in pt-2">
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
          >
            <CloseIcon className="w-3.5 h-3.5" />
            Clear Active Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryControls;
