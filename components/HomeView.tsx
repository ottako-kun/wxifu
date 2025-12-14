import React, { useState, useEffect, useRef } from 'react';
import Hero from './Hero';
import MediaGrid from './MediaGrid';
import SearchIcon from './icons/SearchIcon';
import SortAscendingIcon from './icons/SortAscendingIcon';
import CloseIcon from './icons/CloseIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { MediaItem } from '../types';
import { Session } from '@supabase/supabase-js';
import { useGalleryFilters } from '../hooks/useGalleryFilters';
import { signInWithGoogle } from '../lib/supabaseClient';

interface HomeViewProps {
  photoMedia: MediaItem[];
  videoMedia: MediaItem[];
  followedMedia?: MediaItem[];
  isLoading: boolean;
  session: Session | null;
  onUserClick: (user: { id: string; name: string; avatar: string }) => void;
  onDataChange: () => void;
  activeTab: 'photos' | 'videos' | 'following';
  setActiveTab: (tab: 'photos' | 'videos' | 'following') => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const HomeView: React.FC<HomeViewProps> = ({
  photoMedia,
  videoMedia,
  followedMedia = [],
  isLoading,
  session,
  onUserClick,
  onDataChange,
  activeTab,
  setActiveTab,
  searchInputRef
}) => {
  // Determine which dataset to use
  let itemsToDisplay: MediaItem[] = [];
  let galleryName = '';

  if (activeTab === 'photos') {
    itemsToDisplay = photoMedia;
    galleryName = 'photo';
  } else if (activeTab === 'videos') {
    itemsToDisplay = videoMedia;
    galleryName = 'video';
  } else {
    itemsToDisplay = followedMedia;
    galleryName = 'following';
  }

  // Use the custom filter hook
  const {
    searchQuery, setSearchQuery,
    sortOrder, toggleSort,
    selectedCategory, setSelectedCategory,
    selectedTags, toggleTag,
    visibleCount, loadMore,
    clearFilters,
    availableCategories,
    availableTags,
    sortedItems,
    visibleItems,
  } = useGalleryFilters(itemsToDisplay);

  // Reset filters when changing tabs (Optional, but good UX)
  useEffect(() => {
    clearFilters();
  }, [activeTab]);

  return (
    <>
      <Hero />
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center items-center mb-12">
          <div className="flex bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full border border-gray-800 shadow-xl overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeTab === 'photos' ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Featured Waifu
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeTab === 'videos' ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Video Collection
            </button>
             <button
              onClick={() => setActiveTab('following')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeTab === 'following' ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Following Tab - Not Signed In State */}
        {activeTab === 'following' && !session ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20 max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 font-orbitron">Join the Community</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    Sign in to follow your favorite artists and see their latest uploads right here.
                </p>
                <button
                    onClick={signInWithGoogle}
                    className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
                >
                    Sign In with Google
                </button>
            </div>
        ) : (
            <>
                {/* Controls Container */}
                <div className="max-w-4xl mx-auto mb-10 space-y-6">
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

                {/* Tag Filter */}
                {availableTags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                    {availableTags.map(tag => (
                        <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded text-xs transition-colors duration-200 border border-transparent
                                ${selectedTags.includes(tag)
                            ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30'
                            : 'bg-gray-800/50 text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                        #{tag}
                        </button>
                    ))}
                    </div>
                )}

                {/* Active Filters Summary */}
                {(selectedCategory !== 'All' || selectedTags.length > 0 || searchQuery) && (
                    <div className="flex justify-center animate-fade-in">
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

                {/* Grid Content */}
                {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
                    <LoadingSpinner className="w-12 h-12 text-pink-500" />
                    <p className="text-gray-500 animate-pulse">Loading {galleryName} gallery...</p>
                </div>
                ) : itemsToDisplay.length > 0 ? (
                sortedItems.length > 0 ? (
                    <div className="animate-fade-in space-y-12">
                    <MediaGrid
                        items={visibleItems}
                        onUserClick={onUserClick}
                        session={session}
                        onDataChange={onDataChange}
                    />

                    {/* Load More Button */}
                    {visibleCount < sortedItems.length && (
                        <div className="flex justify-center pt-8">
                        <button
                            onClick={loadMore}
                            className="group relative px-8 py-3 bg-gray-900 hover:bg-black border border-gray-800 hover:border-pink-500 text-gray-300 hover:text-white rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-pink-500/20"
                        >
                            <span className="font-semibold tracking-wider text-sm uppercase">Load More</span>
                            <ChevronRightIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300 rotate-90" />
                        </button>
                        <p className="sr-only">Showing {visibleItems.length} of {sortedItems.length} items</p>
                        </div>
                    )}

                    <div className="text-center text-xs text-gray-600">
                        Showing {Math.min(visibleCount, sortedItems.length)} of {sortedItems.length} results
                    </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-center animate-fade-in border border-dashed border-gray-800 rounded-3xl bg-gray-900/20 m-4">
                    <div className="w-16 h-16 mb-4 text-gray-700">
                        <SearchIcon className="w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">No Results Found</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        We couldn't find any {galleryName === 'following' ? 'posts' : galleryName + 's'} matching "{searchQuery}" or your selected filters.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Clear all filters
                    </button>
                    </div>
                )
                ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    {activeTab === 'following' ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-400 mb-2">Feed Empty</h2>
                            <p className="text-gray-500 max-w-md">You aren't following anyone yet, or the people you follow haven't posted anything.</p>
                            <button onClick={() => setActiveTab('photos')} className="mt-4 text-pink-500 hover:text-pink-400 underline">Explore the Gallery</button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-gray-400 mb-2">No {galleryName}s yet.</h2>
                            <p className="text-lg text-gray-500">Connect to Supabase or add items to your database to see them here.</p>
                        </>
                    )}
                </div>
                )}
            </>
        )}
      </main>
    </>
  );
};

export default HomeView;
