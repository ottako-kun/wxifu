
import React, { useState, useEffect, useRef } from 'react';
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
  error?: string | null;
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
  error,
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
    const handleScroll = () => setShowScrollTop(window.scrollY > 1000);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    // Standard social experience defaults:
    if (activeTab === 'videos' || activeTab === 'following') setViewMode('feed');
    else setViewMode('grid');
    
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
      { threshold: 0.1, rootMargin: '800px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, sortedItems.length, loadMore]);

  const handleRefresh = async () => {
     onDataChange();
     await new Promise(r => setTimeout(r, 1500));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Hero />
      <main className={`container mx-auto py-6 min-h-screen relative ${viewMode === 'feed' ? 'max-w-none px-0' : 'px-4'}`}>
        
        {/* Sync error banner removed for cleaner UX - the app handles sync failures gracefully in useMediaLibrary */}

        <div 
            className={`sticky z-40 py-4 -mx-4 px-4 bg-gradient-to-b from-[#020202] via-[#020202]/95 to-transparent backdrop-blur-2xl transition-[top] duration-500 ease-in-out border-b border-white/5`}
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
            <div className="flex flex-col items-center justify-center py-24 text-center border border-white/5 rounded-[4rem] bg-gray-900/10 max-w-2xl mx-auto mt-16 backdrop-blur-xl">
                <div className="w-24 h-24 rounded-full bg-pink-500/10 flex items-center justify-center mb-10 border border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.15)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-14 h-14 text-pink-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <h2 className="text-4xl font-black text-white mb-4 font-orbitron uppercase tracking-widest">Connect with Artists</h2>
                <p className="text-gray-500 mb-10 max-w-sm text-sm font-medium">Follow creators to build a custom feed tailored to your aesthetic.</p>
                <button onClick={signInWithGoogle} className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-pink-600 hover:text-white transition-all shadow-2xl active:scale-95 text-xs">Authorize Link</button>
            </div>
        ) : (
            <div className="relative">
                {itemsToDisplay.length > 0 || isLoading ? (
                  sortedItems.length > 0 || isLoading ? (
                    <div className={`animate-fade-in ${viewMode === 'grid' ? 'mt-4' : 'mt-0'}`}>
                        {viewMode === 'grid' ? (
                            <MediaGrid items={visibleItems} onUserClick={onUserClick} session={session} onDataChange={onDataChange} isLoading={isLoading} onItemClick={setSelectedItemIndex} />
                        ) : (
                            <FeedView items={visibleItems} session={session} onUserClick={onUserClick} onDataChange={onDataChange} isLoading={isLoading} onItemClick={setSelectedItemIndex} />
                        )}
                        {visibleCount < sortedItems.length && !isLoading && <div ref={observerTarget} className="flex justify-center py-16 w-full"><LoadingSpinner className="w-12 h-12 text-pink-500/20" /></div>}
                        {!isLoading && viewMode === 'grid' && <div className="text-center text-[10px] text-gray-700 uppercase tracking-[0.4em] pt-12 pb-24">Neural Index End // {sortedItems.length} Records</div>}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center border border-white/5 rounded-[4rem] bg-gray-900/5 m-4">
                        <div className="w-24 h-24 mb-10 text-gray-800 opacity-20"><SearchIcon className="w-full h-full" /></div>
                        <h2 className="text-3xl font-black text-gray-700 mb-6 font-orbitron uppercase tracking-widest">No Matches Found</h2>
                        <button onClick={clearFilters} className="px-12 py-4 border border-pink-500/40 text-pink-500 hover:bg-pink-600 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs">Reset Filters</button>
                    </div>
                )
                ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <LoadingSpinner className="w-12 h-12 text-pink-500/30 mb-4" />
                    <h2 className="text-xs font-black text-gray-700 uppercase tracking-[0.5em] font-orbitron">Mapping Neural Grid</h2>
                </div>
                )}
            </div>
        )}
        
        {showScrollTop && viewMode === 'grid' && (
            <button 
                onClick={scrollToTop}
                className="fixed bottom-24 md:bottom-12 right-6 md:right-12 z-[55] p-5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 text-pink-500 shadow-2xl hover:bg-pink-600 hover:text-white transition-all transform active:scale-90 animate-fade-in"
                title="Return to Peak"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
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
