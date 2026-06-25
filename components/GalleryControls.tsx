
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUI } from '../context/UIContext';
import { cn } from '../lib/utils';
import SearchIcon from './icons/SearchIcon';
import SortAscendingIcon from './icons/SortAscendingIcon';
import CloseIcon from './icons/CloseIcon';
import FilterIcon from './icons/FilterIcon';
import { SortOption, DensityType } from '../types';

interface GalleryControlsProps {
  galleryName: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
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
  sortOption,
  setSortOption,
  selectedCategory,
  setSelectedCategory,
  availableCategories,
  selectedTags,
  toggleTag,
  availableTags,
  clearFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { density, setDensity } = useUI();

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + selectedTags.length;

  const densities: { id: DensityType; label: string }[] = [
    { id: 'compact', label: 'Compact' },
    { id: 'standard', label: 'Standard' },
    { id: 'large', label: 'Large' },
  ];

  const sortOptions = [
    { id: SortOption.Trending, label: 'Trending' },
    { id: SortOption.Week, label: 'Top This Week' },
    { id: SortOption.Month, label: 'Top This Month' },
    { id: SortOption.Views, label: 'Most Viewed' },
    { id: SortOption.Latest, label: 'Latest' },
  ];

  return (
    <div className="max-w-4xl mx-auto mb-2 space-y-3">
      {/* Top Row: View Toggle | Sort | Filter */}
      <div className="flex items-center justify-between gap-2 md:gap-3">
        {/* Search Integration */}
        <div className="relative group flex-grow max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className={cn("w-4 h-4 transition-colors", searchQuery ? "text-pink-500" : "text-gray-500 group-hover:text-gray-400")} />
            </div>
            <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find aesthetics..."
                className="w-full bg-gray-900/40 border border-white/5 rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-500/30 focus:border-pink-500/20 transition-all font-medium"
            />
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2">
            {/* Sort Toggle Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 bg-gray-900/80 border-gray-700 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:border-gray-500 shadow-xl`}
                >
                    <SortAscendingIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{sortOptions.find(o => o.id === sortOption)?.label}</span>
                </button>

                <AnimatePresence>
                    {showSortDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 shadow-2xl"
                            >
                                {sortOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => {
                                            setSortOption(opt.id);
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sortOption === opt.id ? 'bg-pink-500/10 text-pink-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative flex-shrink-0 p-2.5 rounded-full border transition-all duration-300
                    ${showFilters || activeFilterCount > 0
                    ? 'bg-pink-900/30 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                    : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                title="Toggle Filters & Categories"
            >
                <FilterIcon className="w-5 h-5" />
                {activeFilterCount > 0 && !showFilters && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border border-gray-950 shadow-[0_0_8px_rgba(236,72,153,0.6)]" 
                    />
                )}
            </button>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
            <motion.div 
                initial={{ height: 0, opacity: 0, scaleY: 0.95 }}
                animate={{ height: 'auto', opacity: 1, scaleY: 1 }}
                exit={{ height: 0, opacity: 0, scaleY: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-4 space-y-4">
                    {/* Header / Clear */}
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Refine Results</span>
                        {(activeFilterCount > 0) && (
                            <button onClick={clearFilters} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase flex items-center gap-1" title="Reset all active filters">
                                <CloseIcon className="w-3 h-3" /> Clear All
                            </button>
                        )}
                    </div>

                    {/* Density Selection */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Grid Density</span>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 relative">
                            {densities.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setDensity(d.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all relative z-10 ${density === d.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {d.label}
                                    {density === d.id && (
                                        <motion.div 
                                            layoutId="density-pill"
                                            className="absolute inset-0 bg-pink-600 rounded-lg shadow-lg -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Categories</span>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map(category => (
                                <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                title={`Filter by ${category}`}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border relative
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
                                    title={`Filter by tag #${tag}`}
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
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryControls;
