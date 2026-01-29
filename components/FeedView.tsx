
import React from 'react';
import { MediaItem } from '../types';
import { Session } from '@supabase/supabase-js';
import FeedCard from './FeedCard';
import LoadingSpinner from './icons/LoadingSpinner';

interface FeedViewProps {
  items: MediaItem[];
  session: Session | null;
  onUserClick: (user: { id: string; name: string; avatar: string }) => void;
  onDataChange: () => void;
  isLoading: boolean;
  onItemClick?: (index: number) => void;
}

const FeedView: React.FC<FeedViewProps> = ({ items, session, onUserClick, onDataChange, isLoading, onItemClick }) => {
  return (
    <div className="w-full flex flex-col">
        <div className="flex flex-col md:space-y-4">
            {items.map((item, index) => (
                <FeedCard
                    key={item.id}
                    item={item}
                    session={session}
                    onUserClick={onUserClick}
                    onItemClick={() => onItemClick && onItemClick(index)}
                    onDataChange={onDataChange}
                />
            ))}
        </div>

        {isLoading && (
            <div className="flex justify-center py-12">
                <LoadingSpinner className="w-10 h-10 text-pink-500" />
            </div>
        )}
        
        {items.length === 0 && !isLoading && (
            <div className="text-center py-20 text-gray-500">
                <p className="text-lg font-bold">End of the line.</p>
                <p className="text-sm mt-2">Follow more creators to fill your feed!</p>
            </div>
        )}
    </div>
  );
};

export default FeedView;
