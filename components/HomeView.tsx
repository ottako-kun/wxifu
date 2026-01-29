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
    // Smart view switch: Default to Feed for videos and Grid for photos
    if (activeTab === 'videos') setViewMode('feed');
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
      { threshold: 0.1, rootMargin: '600px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, sortedItems.length, loadMore]);

  const handleRefresh = async () => {
     onDataChange();
     await new Promise(r => setTimeout(r, 1200));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Hero />
      <main className={`container mx-auto px-4 py-4 min-h-screen relative ${viewMode === 'feed' ? 'max-w-none px-0' : ''}`}>
        
        {/* Sync Error Banner */}
        {error && (
            <div className="max-w-4xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between animate-fade-in shadow-xl shadow-red-900/5">
                <div className="flex items-center gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div className="flex flex-col">
                        <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Neural Link Disturbance</p>
                        <p className="text-sm text-red-200/80">{error}. Using local archive.</p>
                    </div>
                </div>
                <button 
                    onClick={onDataChange} 
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 text-[10px] font-black uppercase rounded-lg transition-all active:scale-95"
                >
                    Reconnect
                </button>
            </div>
        )}

        <div 
            className={`sticky z-40 py-3 -mx-4 px-4 bg-gradient-to-b from-[#050505] via-[#050505]/95 to-transparent backdrop-blur-xl transition-[top] duration-300 ease-in-out border-b border-white/5`}
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
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-[3rem] bg-gray-900/40 max-w-2xl mx-auto mt-20 backdrop-blur-md">
                <div className="w-24 h-24 rounded-full bg-pink-500/10 flex items-center justify-center mb-8 border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-pink-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-4 font-orbitron uppercase tracking-widest">Connect with Creators</h2>
                <p className="text-gray-400 mb-8 max-w-xs">Follow your favorite artists and never miss an update in your personalized feed.</p>
                <button onClick={signInWithGoogle} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-pink-500 hover:text-white transition-all shadow-xl active:scale-95">Sign In with Google</button>
            </div>
        ) : (
            <>
                {itemsToDisplay.length > 0 || isCurrentLoading ? (
                  sortedItems.length > 0 || isCurrentLoading ? (
                    <div className={`animate-fade-in space-y-12 ${viewMode === 'grid' ? 'mt-8 px-4' : 'mt-0'}`}>
                        {viewMode === 'grid' ? (
                            <MediaGrid items={visibleItems} onUserClick={onUserClick} session={session} onDataChange={onDataChange} isLoading={isCurrentLoading} onItemClick={setSelectedItemIndex} />
                        ) : (
                            <FeedView items={visibleItems} session={session} onUserClick={onUserClick} onDataChange={onDataChange} isLoading={isCurrentLoading} onItemClick={setSelectedItemIndex} />
                        )}
                        {visibleCount < sortedItems.length && !isCurrentLoading && <div ref={observerTarget} className="flex justify-center py-12 w-full"><LoadingSpinner className="w-12 h-12 text-pink-500/30" /></div>}
                        {!isCurrentLoading && viewMode === 'grid' && <div className="text-center text-xs text-gray-700 uppercase tracking-widest pb-20">Transmission End // {sortedItems.length} Records Found</div>}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-dashed border-white/5 rounded-[3rem] bg-gray-900/10 m-8">
                        <div className="w-20 h-20 mb-6 text-gray-800"><SearchIcon className="w-full h-full" /></div>
                        <h2 className="text-3xl font-black text-gray-700 mb-4 font-orbitron uppercase tracking-widest">Zero Frequency</h2>
                        <button onClick={clearFilters} className="px-10 py-3 border border-pink-500/50 text-pink-500 hover:bg-pink-500 hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-xs">Reset Neural Filters</button>
                    </div>
                )
                ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <h2 className="text-xl font-bold text-gray-700 uppercase tracking-[0.3em] font-orbitron animate-pulse">Initializing Feed...</h2>
                </div>
                )}
            </>
        )}
        
        {/* Floating Back to Top Button */}
        {showScrollTop && viewMode === 'grid' && (
            <button 
                onClick={scrollToTop}
                className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 md:left-auto md:right-12 z-[55] p-4 rounded-full bg-pink-600/20 backdrop-blur-xl border border-pink-500/40 text-pink-500 shadow-2xl hover:bg-pink-500 hover:text-white transition-all transform active:scale-90 animate-fade-in"
                title="Return to Peak"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
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