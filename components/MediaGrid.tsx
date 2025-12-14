
import React, { useState } from 'react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';
import MediaDetailModal from './MediaDetailModal';
import { Session } from '@supabase/supabase-js';
import MediaGridSkeleton from './skeletons/MediaGridSkeleton';

interface MediaGridProps {
  items: MediaItem[];
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session?: Session | null;
  onDataChange?: () => void;
  isLoading?: boolean; 
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, onUserClick, session, onDataChange, isLoading }) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  if (isLoading && items.length === 0) {
      return <MediaGridSkeleton />;
  }

  return (
    <>
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 md:gap-4 space-y-3 md:space-y-4 pb-20">
        {items.map((item, index) => (
            <MediaCard 
                key={item.id} 
                item={item} 
                onClick={() => setSelectedItemIndex(index)}
                onUserClick={onUserClick}
                session={session || null}
                onDataChange={onDataChange}
            />
        ))}
        </div>

        {selectedItemIndex !== null && (
            <MediaDetailModal 
                items={items} 
                initialIndex={selectedItemIndex} 
                onClose={() => setSelectedItemIndex(null)} 
                onUserClick={onUserClick}
                session={session || null}
                onDataChange={onDataChange}
            />
        )}
    </>
  );
};

export default React.memo(MediaGrid);
