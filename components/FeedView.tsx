
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
    <div className="pb-20">
        <div className="space-y-6">
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
            <div className="flex justify-center py-8">
                <LoadingSpinner className="w-8 h-8 text-pink-500" />
            </div>
        )}
    </div>
  );
};

export default FeedView;
