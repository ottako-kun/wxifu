
import React from 'react';
// Fixed: Import Session from local types
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
    <div className="w-full h-[100dvh] md:h-[90vh] overflow-y-auto snap-y snap-mandatory hide-scrollbar overscroll-behavior-y-none">
        <div className="flex flex-col md:space-y-4 h-full">
            {items.map((item, index) => (
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
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-orbitron">Loading Stream</p>
                    </div>
                </div>
            )}
            
            {items.length === 0 && !isLoading && (
                <div className="flex items-center justify-center w-full h-full flex-shrink-0 snap-start text-center p-10">
                    <div>
                        <p className="text-lg font-bold text-white font-orbitron uppercase tracking-widest">End of the line.</p>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Follow more creators to fill your feed!</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default FeedView;
