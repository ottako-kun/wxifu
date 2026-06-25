
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import FeedView from './FeedView';
import SearchIcon from './icons/SearchIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { MediaItem, Session, ExploreTab } from '../types';
// Fixed: Import Session from local types
import { useGalleryFilters } from '../hooks/useGalleryFilters';
import { signInWithGoogle } from '../lib/supabaseClient';
import GalleryControls from './GalleryControls';
import PullToRefresh from './PullToRefresh';
import GalleryTabs from './GalleryTabs';
import { useScrollDirection } from '../hooks/useScrollDirection';
import MediaDetailModal from './MediaDetailModal';
import { useUI } from '../context/UIContext';

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
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { searchQuery, setSearchQuery } = useUI();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 1000);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let itemsToDisplay: MediaItem[] = [];
  let galleryName = 'explore';

  if (activeTab === 'following' && session) {
      itemsToDisplay = followedMedia;
      galleryName = 'following';
  } else {
      // For Explore (Photos/Videos tabs now represent different types in the same view)
      itemsToDisplay = [...photoMedia, ...videoMedia];
  }

  const {
    sortOption, setSortOption,
    selectedCategory, setSelectedCategory,
    selectedTags, toggleTag,
    visibleCount, loadMore,
    clearFilters,
    availableCategories,
    availableTags,
    sortedItems,
    visibleItems,
  } = useGalleryFilters(itemsToDisplay);

  const exploreTabs: ExploreTab[] = ['For You', 'Trending', 'GIFs', 'Images', 'Videos', 'Creators', 'Niches'];

  // Derive unique creators for Creators tab
  const uniqueCreators = useMemo(() => {
    const creators = new Map();
    itemsToDisplay.forEach(item => {
        if (item.author && !creators.has(item.author)) {
            creators.set(item.author, {
                id: item.user_id || item.author,
                name: item.author,
                avatar: item.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author}`
            });
        }
    });
    return Array.from(creators.values());
  }, [itemsToDisplay]);

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
      <main className={cn(
        "py-2 md:py-4 min-h-screen relative w-full flex flex-col",
        "max-w-none px-0"
      )}>
        
        <div 
            className={`sticky z-40 py-2 bg-gradient-to-b from-[#020202] via-[#020202]/95 to-transparent backdrop-blur-2xl transition-[top] duration-500 ease-in-out border-b border-white/5 pb-4 mb-2`}
            style={{ top: scrollDirection === 'down' ? '0px' : '56px' }}
        >
             {/* Explore Navigation Tabs */}
              <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-4 px-2 mb-2 border-b border-white/5 relative">
                 {exploreTabs.map((tab, idx) => {
                     const isPrimary = tab === 'For You' || tab === 'Trending';
                     return (
                         <button 
                             key={tab}
                             onClick={() => setSelectedCategory(tab)}
                             className={cn(
                                "group relative py-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
                                (selectedCategory === tab) ? "text-white" : "text-gray-500 hover:text-gray-300",
                                isPrimary && "font-black"
                             )}
                         >
                             {isPrimary && (
                                 <div className={cn(
                                     "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                     selectedCategory === tab ? (tab === 'For You' ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]") : "bg-transparent"
                                 )} />
                             )}
                             <span className={cn(
                                 "text-xs md:text-sm uppercase tracking-[0.2em] font-orbitron transition-all",
                                 selectedCategory === tab ? "scale-110" : "scale-100"
                             )}>
                                 {tab}
                             </span>
                             {(selectedCategory === tab) && (
                                 <motion.div 
                                    layoutId="explore-active-pill"
                                    className={cn(
                                        "absolute -bottom-1 left-0 right-0 h-0.5 rounded-full",
                                        tab === 'For You' ? "bg-pink-500" : (tab === 'Trending' ? "bg-cyan-500" : "bg-white/40")
                                    )}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                 />
                             )}
                         </button>
                     );
                 })}
                 {/* Decorative spacer for mobile horizontal scroll */}
                 <div className="min-w-[20px] h-4" />
             </div>

             <GalleryControls 
                galleryName={galleryName}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchInputRef={searchInputRef}
                sortOption={sortOption}
                setSortOption={setSortOption}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                availableCategories={availableCategories}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                availableTags={availableTags}
                clearFilters={() => {
                    clearFilters();
                    setSearchQuery('');
                }}
            />
        </div>

        {activeTab === 'following' && !session ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center border border-white/5 rounded-[4rem] bg-gray-900/10 max-w-2xl mx-auto mt-16 backdrop-blur-xl"
            >
                <div className="w-24 h-24 rounded-full bg-pink-500/10 flex items-center justify-center mb-10 border border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.15)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-14 h-14 text-pink-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
                <h2 className="text-4xl font-black text-white mb-4 font-orbitron uppercase tracking-widest">Connect with Artists</h2>
                <p className="text-gray-500 mb-10 max-w-sm text-sm font-medium">Follow creators to build a custom feed tailored to your aesthetic.</p>
                <button onClick={signInWithGoogle} className="px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-pink-600 hover:text-white transition-all shadow-2xl active:scale-95 text-xs">Authorize Link</button>
            </motion.div>
        ) : (
            <div className="relative flex-grow">
                <AnimatePresence mode="wait">
                  {itemsToDisplay.length > 0 || isLoading ? (
                    selectedCategory === 'Creators' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
                             {uniqueCreators.map(creator => (
                                 <motion.button 
                                     key={creator.id}
                                     whileHover={{ y: -5 }}
                                     onClick={() => onUserClick(creator)}
                                     className="flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-center"
                                 >
                                     <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500/20 p-1 bg-black">
                                         <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover rounded-full" />
                                     </div>
                                     <div>
                                         <h3 className="text-sm font-black text-white uppercase tracking-widest">{creator.name}</h3>
                                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Artist</p>
                                     </div>
                                 </motion.button>
                             ))}
                        </div>
                    ) : selectedCategory === 'Niches' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                             {availableTags.map(tag => (
                                 <motion.button 
                                     key={tag}
                                     whileHover={{ scale: 1.02 }}
                                     onClick={() => toggleTag(tag)}
                                     className={cn(
                                        "h-32 flex items-center justify-center p-6 rounded-[2rem] border transition-all text-center relative overflow-hidden group",
                                        selectedTags.includes(tag) ? "bg-pink-500/20 border-pink-500/50" : "bg-white/5 border-white/5 hover:border-white/20"
                                     )}
                                 >
                                     <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     <span className="text-lg font-black text-white uppercase tracking-widest font-orbitron z-10">#{tag}</span>
                                 </motion.button>
                             ))}
                        </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full mt-0"
                      >
                          {sortedItems.length > 0 || isLoading ? (
                              <>
                                <FeedView items={visibleItems} session={session} onUserClick={onUserClick} onDataChange={onDataChange} isLoading={isLoading} onItemClick={setSelectedItemIndex} />
                                {visibleCount < sortedItems.length && !isLoading && <div ref={observerTarget} className="flex justify-center py-16 w-full"><LoadingSpinner className="w-12 h-12 text-pink-500/20" /></div>}
                              </>
                          ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-[60vh] text-center border border-white/5 rounded-[4rem] bg-gray-900/5 m-4"
                              >
                                  <div className="w-24 h-24 mb-10 text-gray-800 opacity-20"><SearchIcon className="w-full h-full" /></div>
                                  <h2 className="text-3xl font-black text-gray-700 mb-6 font-orbitron uppercase tracking-widest">No Matches Found</h2>
                                  <button onClick={clearFilters} className="px-12 py-4 border border-pink-500/40 text-pink-500 hover:bg-pink-600 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs">Reset Filters</button>
                              </motion.div>
                          )}
                      </motion.div>
                    )
                  ) : (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                      <LoadingSpinner className="w-12 h-12 text-pink-500/30 mb-4" />
                      <h2 className="text-xs font-black text-gray-700 uppercase tracking-[0.5em] font-orbitron">Mapping Neural Grid</h2>
                  </div>
                  )}
                </AnimatePresence>
            </div>
        )}
        
        
        {selectedItemIndex !== null && (
            <MediaDetailModal items={visibleItems} initialIndex={selectedItemIndex} onClose={() => setSelectedItemIndex(null)} onUserClick={onUserClick} session={session || null} onDataChange={onDataChange} />
        )}
      </main>
    </PullToRefresh>
  );
};

export default HomeView;
