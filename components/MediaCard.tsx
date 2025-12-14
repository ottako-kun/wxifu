
import React, { useState, useRef } from 'react';
import { MediaItem, MediaType } from '../types';
import PlayIcon from './icons/PlayIcon';
import ShareIcon from './icons/ShareIcon';
import TrashIcon from './icons/TrashIcon';
import SharePopover from './SharePopover';
import VideoIcon from './icons/VideoIcon';
import LockIcon from './icons/LockIcon';
import HeartIcon from './icons/HeartIcon';
import { Session } from '@supabase/supabase-js';
import { deleteMediaItem } from '../lib/supabaseClient';
import { useConfirm } from '../context/ConfirmationContext';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';
import { useMediaLikes } from '../hooks/useMediaLikes';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session: Session | null;
  onDataChange?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, onUserClick, session, onDataChange }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  
  const { confirm } = useConfirm();
  const toast = useToast();
  const { isUnlocked: checkIsUnlocked } = useWallet();

  const isOwner = session?.user.id === item.user_id;
  // Unlock if: Owner, OR Not Premium, OR In user's unlock list
  const isUnlocked = isOwner || !item.is_premium || checkIsUnlocked(item.id); 
  const isStatic = item.id.startsWith('static-');
  
  // Use Custom Hook for Likes
  const { likeCount, isLiked, toggleLike } = useMediaLikes(item.id, session?.user.id, isStatic);
  
  // Double tap logic
  const lastTapRef = useRef<number>(0);

  const handleCardClick = () => {
      onClick();
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
      // Allow default behavior (scroll) but detect double tap
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          // Only prevent default if it's cancelable to avoid console errors
          if (e.cancelable) {
              e.preventDefault(); 
          }
          handleLikeAction();
      }
      lastTapRef.current = now;
  };

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShareAnchorEl(e.currentTarget);
  };
  
  const handleLikeAction = async () => {
    // Trigger Animation immediately for feedback
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);

    await toggleLike();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleLikeAction();
  }

  const handleQuickDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    const isConfirmed = await confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (!isConfirmed) return;
    
    setIsDeleting(true);
    const { error } = await deleteMediaItem(item.id);
    setIsDeleting(false);

    if (error) {
        toast.error('Failed to delete item: ' + error.message);
    } else {
        toast.success('Post deleted successfully');
        if (onDataChange) onDataChange();
    }
  };

  const closeSharePopover = () => {
    setShareAnchorEl(null);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.user_id && item.author && onUserClick) {
        onUserClick({
            id: item.user_id,
            name: item.author,
            avatar: item.author_avatar || ''
        });
    }
  };

  return (
    <>
      <div 
        className={`group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 cursor-pointer mb-3 break-inside-avoid shadow-lg transition-all duration-300 hover:shadow-pink-500/10 hover:border-gray-700 hover:ring-1 hover:ring-pink-500/30 ${!isImageLoaded ? 'min-h-[200px] animate-pulse-bg' : ''} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={handleCardClick}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative">
            <img 
                src={item.src} 
                alt={item.description || "Gallery content"} 
                className={`w-full h-auto object-cover block transition-all duration-700 ease-in-out
                    ${isImageLoaded ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-105'}
                    ${!isUnlocked ? 'blur-md brightness-50' : ''}
                `}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setIsImageLoaded(true)}
            />

            {/* Heart Animation Overlay */}
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-bounce-in">
                    <HeartIcon filled className="w-20 h-20 text-white drop-shadow-2xl opacity-90" />
                </div>
            )}

            {/* Premium Lock Overlay */}
            {!isUnlocked && isImageLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 p-4 bg-black/40">
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-full mb-2 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                        <LockIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <span className="text-white font-bold text-xs mt-1 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                        {item.price} Coins
                    </span>
                </div>
            )}

            {/* Type Badges */}
            <div className="absolute top-2 right-2 flex gap-1 z-20">
                {item.type === MediaType.Video && (
                    <div className="bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 border border-white/10 flex items-center gap-1">
                        <VideoIcon className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase">Video</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* --- MOBILE: Persistent Bottom Overlay --- */}
        <div className="md:hidden absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-3 px-3 flex items-end justify-between z-20">
             {/* Author Info */}
             <div className="flex items-center gap-2 max-w-[70%]">
                 {item.author_avatar ? (
                     <img src={item.author_avatar} className="w-6 h-6 rounded-full border border-white/30" alt={item.author} />
                 ) : (
                     <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/30">
                         {item.author?.charAt(0)}
                     </div>
                 )}
                 <div className="flex flex-col truncate">
                     <span className="text-[10px] font-bold text-gray-200 truncate leading-none">{item.author}</span>
                     {item.is_premium && (
                         <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-wider leading-tight">Premium</span>
                     )}
                 </div>
             </div>

             {/* Like Button (Mobile) */}
             <button 
                onClick={handleLikeClick}
                className="flex flex-col items-center justify-center text-white"
             >
                 <HeartIcon filled={isLiked} className={`w-5 h-5 ${isLiked ? 'text-pink-500' : 'text-white'}`} />
                 {likeCount > 0 && <span className="text-[9px] font-bold mt-0.5">{likeCount}</span>}
             </button>
        </div>

        {/* --- DESKTOP: Hover Overlay (Updated for better visibility) --- */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-4 z-20">
            {/* Center Play Button for Video */}
            {item.type === MediaType.Video && isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transform scale-90 group-hover:scale-110 transition-transform duration-300">
                        <PlayIcon className="w-6 h-6 text-white ml-1" />
                    </div>
                </div>
            )}

            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                {item.category && (
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-1 block">
                        {item.category}
                    </span>
                )}
                
                {item.description && (
                    <p className={`text-white text-sm font-semibold line-clamp-2 leading-tight mb-3 drop-shadow-md ${!isUnlocked ? 'blur-[2px]' : ''}`}>
                        {item.description}
                    </p>
                )}

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                     <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 -ml-1 rounded-lg transition-colors"
                        onClick={handleUserClick}
                     >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30">
                            {item.author_avatar ? (
                                <img src={item.author_avatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[9px]">{item.author?.charAt(0)}</div>
                            )}
                        </div>
                        <span className="text-xs text-gray-300 font-medium truncate max-w-[80px]">
                            {item.author}
                        </span>
                     </div>

                     <div className="flex items-center gap-2">
                        <button
                            onClick={handleLikeClick}
                            className={`p-1.5 rounded-full transition-colors ${isLiked ? 'text-pink-500 bg-pink-500/10' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                        >
                            <HeartIcon filled={isLiked} className="w-4 h-4" />
                        </button>
                        
                        {isOwner && (
                            <button onClick={handleQuickDelete} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={handleShareClick} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <ShareIcon className="w-4 h-4" />
                        </button>
                     </div>
                </div>
            </div>
        </div>
      </div>
      
      {shareAnchorEl && (
        <SharePopover
          item={item}
          onClose={closeSharePopover}
          anchorEl={shareAnchorEl}
        />
      )}
    </>
  );
};

export default React.memo(MediaCard);
