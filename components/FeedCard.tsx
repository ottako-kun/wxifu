
import React, { useState } from 'react';
import { MediaItem, MediaType } from '../types';
import { Session } from '@supabase/supabase-js';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import ShareIcon from './icons/ShareIcon';
import GiftIcon from './icons/GiftIcon';
import LockIcon from './icons/LockIcon';
import PlayIcon from './icons/PlayIcon';
import SharePopover from './SharePopover';
import TipModal from './TipModal';
import { useMediaLikes } from '../hooks/useMediaLikes';
import { useWallet } from '../context/WalletContext';
import { useFollow } from '../hooks/useFollow';
import LoadingSpinner from './icons/LoadingSpinner';
import { useDoubleTap } from '../hooks/useDoubleTap';

interface FeedCardProps {
  item: MediaItem;
  session: Session | null;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  onItemClick: () => void;
  onDataChange?: () => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ item, session, onUserClick, onItemClick, onDataChange }) => {
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  // Hooks
  const { isLiked, likeCount, toggleLike } = useMediaLikes(item.id, session?.user.id, item.id.startsWith('static'));
  const { isUnlocked: checkIsUnlocked, unlockContent, isLoading: isWalletLoading } = useWallet();
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, item.user_id || '');

  const isOwner = session?.user.id === item.user_id;
  const isUnlocked = isOwner || !item.is_premium || checkIsUnlocked(item.id);

  const handleLikeAction = async () => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
    await toggleLike();
  };

  // Use custom double tap hook
  const handleDoubleTap = useDoubleTap(handleLikeAction);

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShareAnchorEl(e.currentTarget);
  };

  const handleUserClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (item.author && item.user_id && onUserClick) {
          onUserClick({
              id: item.user_id,
              name: item.author,
              avatar: item.author_avatar || ''
          });
      }
  };

  const handleUnlock = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const success = await unlockContent(item.id, item.price || 0, item.user_id);
      if (success && onDataChange) onDataChange();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6 shadow-xl max-w-xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div onClick={handleUserClick} className="cursor-pointer">
                    {item.author_avatar ? (
                        <img src={item.author_avatar} alt={item.author} className="w-10 h-10 rounded-full border border-gray-700 object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                            {item.author?.charAt(0)}
                        </div>
                    )}
                </div>
                <div>
                    <h3 onClick={handleUserClick} className="font-bold text-white text-sm hover:text-pink-400 cursor-pointer transition-colors">
                        {item.author}
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.category}</p>
                </div>
            </div>
            
            {!isOwner && session && item.user_id && !item.user_id.startsWith('static') && (
                <button 
                    onClick={() => toggleFollow(item.author || '')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                        isFollowing 
                        ? 'bg-gray-800 text-gray-400 border border-gray-700' 
                        : 'bg-pink-600/20 text-pink-400 border border-pink-500/50 hover:bg-pink-600 hover:text-white'
                    }`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>

        {/* Media Content */}
        <div 
            className="relative bg-black w-full aspect-[4/5] sm:aspect-square flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={onItemClick}
            onMouseDown={handleDoubleTap}
            onTouchEnd={handleDoubleTap}
        >
             {/* Heart Overlay Animation */}
             {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-bounce-in">
                    <HeartIcon filled className="w-24 h-24 text-white drop-shadow-2xl opacity-90" />
                </div>
            )}

            {!isUnlocked ? (
                // Locked State
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl">
                    <img src={item.src} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl" />
                    <div className="relative z-20 flex flex-col items-center text-center p-6">
                        <div className="w-14 h-14 bg-gray-800/80 rounded-full flex items-center justify-center mb-3 border border-yellow-500/50">
                            <LockIcon className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1 font-orbitron">Premium Content</h3>
                        <p className="text-gray-400 text-xs mb-4">Unlock to view full resolution</p>
                        <button 
                            onClick={handleUnlock}
                            disabled={isWalletLoading}
                            className="px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-full shadow-lg transform transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isWalletLoading ? <LoadingSpinner className="w-4 h-4 text-black"/> : `Unlock ${item.price} Coins`}
                        </button>
                    </div>
                </div>
            ) : (
                // Unlocked State
                item.type === MediaType.Video ? (
                    <div className="relative w-full h-full">
                         <img src={item.src} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                             <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                                 <PlayIcon className="w-8 h-8 text-white ml-1" />
                             </div>
                         </div>
                         <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                             <span className="text-[10px] font-bold text-white uppercase">Video</span>
                         </div>
                    </div>
                ) : (
                    <img src={item.src} alt={item.description} className="w-full h-full object-cover" />
                )
            )}
        </div>

        {/* Action Bar */}
        <div className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                        className={`transition-transform active:scale-90 ${isLiked ? 'text-pink-500' : 'text-white hover:text-pink-500'}`}
                    >
                        <HeartIcon filled={isLiked} className="w-7 h-7" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onItemClick(); }}
                        className="text-white hover:text-cyan-400 transition-colors"
                    >
                        <ChatIcon className="w-7 h-7" />
                    </button>
                    {!isOwner && session && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }}
                            className="text-white hover:text-yellow-400 transition-colors"
                        >
                            <GiftIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
                <button 
                    onClick={handleShareClick}
                    className="text-white hover:text-gray-300 transition-colors"
                >
                    <ShareIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Likes Count */}
            <div className="text-sm font-bold text-white mb-2">
                {likeCount} likes
            </div>

            {/* Caption */}
            <div className="text-sm text-gray-300 leading-relaxed mb-2">
                <span className="font-bold text-white mr-2 cursor-pointer" onClick={handleUserClick}>{item.author}</span>
                {item.description}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
                    {item.tags.map(tag => (
                        <span key={tag} className="text-xs text-cyan-500 cursor-pointer hover:underline">#{tag}</span>
                    ))}
                </div>
            )}

            {/* View Comments Link */}
            <button onClick={onItemClick} className="text-gray-500 text-sm font-medium hover:text-gray-300 transition-colors">
                View all comments
            </button>
        </div>

        {shareAnchorEl && (
            <SharePopover
                item={item}
                onClose={() => setShareAnchorEl(null)}
                anchorEl={shareAnchorEl}
            />
        )}
        
        {isTipModalOpen && (
            <TipModal
                recipientId={item.user_id || ''}
                recipientName={item.author || ''}
                onClose={() => setIsTipModalOpen(false)}
            />
        )}
    </div>
  );
};

export default FeedCard;
