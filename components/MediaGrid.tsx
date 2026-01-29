
import React, { useMemo } from 'react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';
import { Session } from '@supabase/supabase-js';
import MediaGridSkeleton from './skeletons/MediaGridSkeleton';
import { useUI } from '../context/UIContext';

interface MediaGridProps {
  items: MediaItem[];
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session?: Session | null;
  onDataChange?: () => void;
  isLoading?: boolean; 
  onItemClick?: (index: number) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, onUserClick, session, onDataChange, isLoading, onItemClick }) => {
  const { density } = useUI();

  const columnClass = useMemo(() => {
    switch (density) {
      case 'compact':
        // Mobile: 3 columns, Desktop (XL): 10 columns
        return "columns-3 sm:columns-4 md:columns-6 lg:columns-8 xl:columns-10";
      case 'large':
        // Mobile: 1 column, Desktop (XL): 4 columns
        return "columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4";
      case 'standard':
      default:
        // Mobile: 2 columns, Desktop (XL): 7 columns
        return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-7";
    }
  }, [density]);

  if (isLoading && items.length === 0) {
      return <MediaGridSkeleton />;
  }

  return (
    <div className={`${columnClass} gap-2 md:gap-4 space-y-2 md:space-y-4 pb-20 transition-all duration-500`}>
    {items.map((item, index) => (
        <MediaCard 
            key={item.id} 
            item={item} 
            onClick={() => onItemClick && onItemClick(index)}
            onUserClick={onUserClick}
            session={session || null}
            onDataChange={onDataChange}
        />
    ))}
    </div>
  );
};

export default React.memo(MediaGrid);
