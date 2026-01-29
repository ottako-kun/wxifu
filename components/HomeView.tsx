
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hero from './Hero';
import MediaGrid from './MediaGrid';
import FeedView from './FeedView';
import SearchIcon from './icons/SearchIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { MediaItem } from '../types';
import { Session } from '@supabase/supabase-js';
import { useGalleryFilters } from '../hooks/useGalleryFilters';
import { signInWithGoogle } from '../lib/supabaseClient';
import GalleryControls from './GalleryControls';
import PullToRefresh from './PullToRefresh';
import GalleryTabs from './GalleryTabs';
import { useScrollDirection } from '../hooks/useScrollDirection';
import MediaDetailModal from './MediaDetailModal';

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
  
  const scrollDirection = useScrollDirection();
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 800);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let itemsToDisplay: MediaItem[] = [];
  let galleryName = '';
  let isCurrentLoading = isLoading;

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

  useEffect(() => {
    clearFilters();
    setSelectedItemIndex(null);
  }, [activeTab]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < sortedItems.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, sortedItems.length, loadMore]);

  const handleRefresh = async () => {
     onDataChange();
     await new Promise(r => setTimeout(r, 1000));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Hero />
      <main className="container mx-auto px-4 py-4 min-h-screen relative">
        <div 
            className={`sticky z-40 py-2 -mx-4 px-4 bg-gradient-to-b from-[#050505] via-[#050505]/95 to-transparent backdrop-blur-sm transition-[top] duration-300 ease-in-out`}
            style={{ top: scrollDirection === 'down' ? '0px' : '56px' }}
        >
             <GalleryTabs activeTab={activeTab} setActiveTab={setActiveTab} />
             {(activeTab !== 'following' || session) && (
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
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
             )}
        </div>

        {activeTab === 'following' && !session ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20 max-w-2xl mx-auto mt-10">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 font-orbitron">Join the Community</h2>
                <button onClick={signInWithGoogle} className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">Sign In with Google</button>
            </div>
        ) : (
            <>
                {itemsToDisplay.length > 0 || isCurrentLoading ? (
                  sortedItems.length > 0 || isCurrentLoading ? (
                    <div className="animate-fade-in space-y-12 mt-4">
                        {viewMode === 'grid' ? (
                            <MediaGrid items={visibleItems} onUserClick={onUserClick} session={session} onDataChange={onDataChange} isLoading={isCurrentLoading} onItemClick={setSelectedItemIndex} />
                        ) : (
                            <FeedView items={visibleItems} session={session} onUserClick={onUserClick} onDataChange={onDataChange} isLoading={isCurrentLoading} onItemClick={setSelectedItemIndex} />
                        )}
                        {visibleCount < sortedItems.length && !isCurrentLoading && <div ref={observerTarget} className="flex justify-center py-8 w-full"><LoadingSpinner className="w-8 h-8 text-pink-500/50" /></div>}
                        {!isCurrentLoading && <div className="text-center text-xs text-gray-600">Showing {Math.min(visibleCount, sortedItems.length)} of {sortedItems.length} results</div>}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20 m-4">
                        <div className="w-16 h-16 mb-4 text-gray-700"><SearchIcon className="w-full h-full" /></div>
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">No Results Found</h2>
                        <button onClick={clearFilters} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium">Clear all filters</button>
                    </div>
                )
                ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest font-orbitron">No content available</h2>
                </div>
                )}
            </>
        )}
        
        {/* Floating Back to Top Button */}
        {showScrollTop && (
            <button 
                onClick={scrollToTop}
                className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-32 z-[55] p-3 rounded-full bg-pink-500/10 backdrop-blur-md border border-pink-500/30 text-pink-500 shadow-lg hover:bg-pink-500 hover:text-white transition-all transform active:scale-90 animate-fade-in"
                title="Back to Top"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"/></svg>
            </button>
        )}
        
        {selectedItemIndex !== null && (
            <MediaDetailModal items={visibleItems} initialIndex={selectedItemIndex} onClose={() => setSelectedItemIndex(null)} onUserClick={onUserClick} session={session || null} onDataChange={onDataChange} />
        )}
      </main>
    </PullToRefresh>
  );
};

export default HomeView;
