
import React from 'react';
import { MediaItem, Session } from '../types';
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
    <div className="w-full flex flex-col snap-y-strict hide-scrollbar bg-black">
        <div className="flex flex-col">
            {items.map((item, index) => (
                <div key={item.id} className="snap-start w-full h-full flex-shrink-0">
                    <FeedCard
                        item={item}
                        session={session}
                        onUserClick={onUserClick}
                        onItemClick={() => onItemClick && onItemClick(index)}
                        onDataChange={onDataChange}
                    />
                </div>
            ))}
        </div>

        {isLoading && (
            <div className="flex justify-center py-12 snap-center">
                <LoadingSpinner className="w-10 h-10 text-pink-500" />
            </div>
        )}
        
        {items.length === 0 && !isLoading && (
            <div className="text-center py-20 text-gray-500 snap-center flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-lg font-bold text-white">End of Transmission</p>
                <p className="text-sm mt-2">Follow more creators to fill your neural feed.</p>
            </div>
        )}
    </div>
  );
};

export default FeedView;
