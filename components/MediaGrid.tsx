import React from 'react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';
import { Session } from '@supabase/supabase-js';

interface MediaGridProps {
  items: MediaItem[];
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session?: Session | null;
  onDataChange?: () => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ items, onUserClick, session, onDataChange }) => {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 gap-2 md:gap-4 inline-block text-left w-full">
      {items.map((item, index) => (
        <MediaCard 
            key={item.id} 
            item={item} 
            items={items} 
            index={index} 
            onUserClick={onUserClick}
            session={session || null}
            onDataChange={onDataChange}
        />
      ))}
    </div>
  );
};

export default MediaGrid;