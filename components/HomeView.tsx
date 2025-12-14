import React, { useState, useEffect, useRef } from 'react';
import Hero from './Hero';
import MediaGrid from './MediaGrid';
import SearchIcon from './icons/SearchIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { MediaItem } from '../types';
import { Session } from '@supabase/supabase-js';
import { useGalleryFilters } from '../hooks/useGalleryFilters';
import { signInWithGoogle } from '../lib/supabaseClient';
import GalleryControls from './GalleryControls';
import { fetchMangaList } from '../lib/mangadex';
import PullToRefresh from './PullToRefresh';

interface HomeViewProps {
  photoMedia: MediaItem[];
  videoMedia: MediaItem[];
  followedMedia?: MediaItem[];
  isLoading: boolean;
  session: Session | null;
  onUserClick: (user: { id: string; name: string; avatar: string }) => void;
  onDataChange: () => void;
  activeTab: 'photos' | 'videos' | 'following' | 'manga';
  setActiveTab: (tab: 'photos' | 'videos' | 'following' | 'manga') => void;
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
  // Local state for Manga
  const [mangaMedia, setMangaMedia] = useState<MediaItem[]>([]);
  const [isMangaLoading, setIsMangaLoading] = useState(false);

  useEffect(() => {
    // Lazy load manga only when tab is active
    if (activeTab === 'manga' && mangaMedia.length === 0) {
        setIsMangaLoading(true);
        fetchMangaList().then(data => {
            setMangaMedia(data);
            setIsMangaLoading(false);
        });
    }
  }, [activeTab, mangaMedia.length]);

  // Determine which dataset to use
  let itemsToDisplay: MediaItem[] = [];
  let galleryName = '';
  let isCurrentLoading = isLoading;

  if (activeTab === 'photos') {
    itemsToDisplay = photoMedia;
    galleryName = 'photo';
  } else if (activeTab === 'videos') {
    itemsToDisplay = videoMedia;
    galleryName = 'video';
  } else if (activeTab === 'manga') {
    itemsToDisplay = mangaMedia;
    galleryName = 'manga';
    isCurrentLoading = isMangaLoading;
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

  // Infinite Scroll Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < sortedItems.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '400px' } // Load well before the user hits the bottom
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [visibleCount, sortedItems.length, loadMore]);

  // Wrap the refresh in a promise for PullToRefresh
  const handleRefresh = async () => {
     onDataChange();
     // If manga tab, refetch manga too
     if (activeTab === 'manga') {
         const data = await fetchMangaList();
         setMangaMedia(data);
     }
     // Slight artificial delay so the spinner shows for a satisfying moment
     await new Promise(r => setTimeout(r, 1000));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
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
              onClick={() => setActiveTab('manga')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeTab === 'manga' ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              Manga & Doujin
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
                <GalleryControls 
                    galleryName={galleryName}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchInputRef={searchInputRef}
                    sortOrder={sortOrder}
                    toggleSort={toggleSort}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    availableCategories={availableCategories}
                    selectedTags={selectedTags}
                    toggleTag={toggleTag}
                    availableTags={availableTags}
                    clearFilters={clearFilters}
                />

                {/* Grid Content */}
                {isCurrentLoading ? (
                <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
                    <LoadingSpinner className="w-12 h-12 text-pink-500" />
                    <p className="text-gray-500 animate-pulse">Loading {galleryName} gallery...</p>
                    {activeTab === 'manga' && <p className="text-xs text-gray-600">Powered by MangaDex</p>}
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

                    {/* Infinite Scroll Sentinel */}
                    {visibleCount < sortedItems.length && (
                        <div ref={observerTarget} className="flex justify-center py-8 w-full">
                            <LoadingSpinner className="w-8 h-8 text-pink-500/50" />
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
                        <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-yellow-500 mb-2">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                           </svg>
                           <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest font-orbitron">Under Construction</h2>
                        </div>
                    )}
                </div>
                )}
            </>
        )}
      </main>
    </PullToRefresh>
  );
};

export default HomeView;