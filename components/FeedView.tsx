import React from 'react';
import { MediaItem } from '../types';
import { Session } from '@supabase/supabase-js';
import FeedCard from './FeedCard';
import MediaDetailModal from './MediaDetailModal';
import LoadingSpinner from './icons/LoadingSpinner';

interface FeedViewProps {
  items: MediaItem[];
  session: Session | null;
  onUserClick: (user: { id: string; name: string; avatar: string }) => void;
  onDataChange: () => void;
  isLoading: boolean;
}

const FeedView: React.FC<FeedViewProps> = ({ items, session, onUserClick, onDataChange, isLoading }) => {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState<number | null>(null);

  return (
    <div className="pb-20">
        <div className="space-y-6">
            {items.map((item, index) => (
                <FeedCard
                    key={item.id}
                    item={item}
                    session={session}
                    onUserClick={onUserClick}
                    onItemClick={() => setSelectedItemIndex(index)}
                    onDataChange={onDataChange}
                />
            ))}
        </div>

        {isLoading && (
            <div className="flex justify-center py-8">
                <LoadingSpinner className="w-8 h-8 text-pink-500" />
            </div>
        )}

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
    </div>
  );
};

export default FeedView;