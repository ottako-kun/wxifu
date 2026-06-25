
import React, { useState, useEffect } from 'react';
// Fixed: Import Session from local types
import { MediaItem, Session } from '../types';
import FeedCard from './FeedCard';
import LoadingSpinner from './icons/LoadingSpinner';
import FilterChips, { FilterChip } from './FilterChips';
import EmptyState from './EmptyState';
import SearchIcon from './icons/SearchIcon';
import FireIcon from './icons/FireIcon';
import ClockIcon from './icons/ClockIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';

interface FeedViewProps {
  items: MediaItem[];
  session: Session | null;
  onUserClick: (user: { id: string; name: string; avatar: string }) => void;
  onDataChange: () => void;
  isLoading: boolean;
  onItemClick?: (index: number) => void;
}

const FeedView: React.FC<FeedViewProps> = ({ items, session, onUserClick, onDataChange, isLoading, onItemClick }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>('all');
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>(items);
  const [loadProgress, setLoadProgress] = useState(0);

  // Quick filter chips for content discovery
  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All', icon: null },
    { id: 'trending', label: 'Trending', icon: <FireIcon className="w-4 h-4" /> },
    { id: 'recent', label: 'Recent', icon: <ClockIcon className="w-4 h-4" /> },
    { id: 'popular', label: 'Popular', icon: <TrendingUpIcon className="w-4 h-4" /> },
  ];

  // Simulate loading progress for better perceived performance
  useEffect(() => {
    if (isLoading) {
      setLoadProgress(0);
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setLoadProgress(100);
    }
  }, [isLoading]);

  // Apply filters
  useEffect(() => {
    let filtered = [...items];
    
    switch (selectedFilter) {
      case 'trending':
        // Sort by likes/views (simulated)
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'recent':
        // Already sorted by recent
        break;
      case 'popular':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }
    
    setFilteredItems(filtered);
  }, [items, selectedFilter]);

  return (
    <div className="w-full h-[100dvh] md:h-[90vh] overflow-y-auto snap-y snap-mandatory hide-scrollbar overscroll-behavior-y-none">
        {/* Progress indicator for loading */}
        {isLoading && loadProgress > 0 && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-gray-900 z-50">
            <div 
              className="h-full bg-pink-500 transition-all duration-300 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        )}

        {/* Quick filter chips */}
        {!isLoading && items.length > 0 && (
          <div className="sticky top-0 z-40 bg-gradient-to-b from-[#020202] via-[#020202]/95 to-transparent backdrop-blur-xl pb-2">
            <FilterChips
              chips={filterChips}
              selectedChip={selectedFilter}
              onSelectChip={setSelectedFilter}
            />
          </div>
        )}
        
        <div className="flex flex-col md:space-y-4 h-full">
            {filteredItems.map((item, index) => (
                <div key={item.id} className="snap-start snap-always w-full h-full flex-shrink-0">
                    <FeedCard
                        item={item}
                        session={session}
                        onUserClick={onUserClick}
                        onItemClick={() => onItemClick && onItemClick(index)}
                        onDataChange={onDataChange}
                    />
                </div>
            ))}
            
            {isLoading && (
                <div className="flex items-center justify-center w-full h-full flex-shrink-0 snap-start">
                    <div className="flex flex-col items-center gap-4">
                        <LoadingSpinner className="w-12 h-12 text-pink-500" />
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-orbitron">
                          {loadProgress >= 90 ? 'Almost Ready...' : 'Loading Stream...'}
                        </p>
                    </div>
                </div>
            )}
            
            {!isLoading && filteredItems.length === 0 && (
                <div className="flex items-center justify-center w-full h-full flex-shrink-0 snap-start">
                    <EmptyState
                      icon={<SearchIcon className="w-full h-full" />}
                      title="No Content Found"
                      description={
                        selectedFilter !== 'all'
                          ? `No ${selectedFilter} content available. Try a different filter!`
                          : "Follow more creators to fill your feed!"
                      }
                      action={
                        selectedFilter !== 'all'
                          ? {
                              label: 'Show All',
                              onClick: () => setSelectedFilter('all'),
                              variant: 'primary'
                            }
                          : undefined
                      }
                    />
                </div>
            )}
            
            {/* Load more indicator */}
            {!isLoading && filteredItems.length > 0 && (
              <div className="flex items-center justify-center py-8 snap-start">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-orbitron">
                  End of Feed
                </p>
              </div>
            )}
        </div>
    </div>
  );
};

export default FeedView;
