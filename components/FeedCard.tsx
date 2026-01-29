
import React, { useState, useRef, useEffect } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { isLiked, likeCount, toggleLike } = useMediaLikes(item.id, session?.user.id, item.id.startsWith('static'));
  const { isUnlocked: checkIsUnlocked, unlockContent, isLoading: isWalletLoading } = useWallet();
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, item.user_id || '');

  const isOwner = session?.user.id === item.user_id;
  const isUnlocked = isOwner || !item.is_premium || checkIsUnlocked(item.id);

  // Intersection Observer for Autoplay
  useEffect(() => {
    if (item.type !== MediaType.Video || !isUnlocked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [item.type, isUnlocked]);

  const handleLikeAction = async () => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 800);
    await toggleLike();
  };

  const handleTapInteraction = useDoubleTap(handleLikeAction);

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
    <div 
      ref={cardRef}
      className="snap-item w-full max-w-xl mx-auto h-[85vh] md:h-[90vh] bg-black md:bg-gray-900 md:border md:border-gray-800 md:rounded-3xl overflow-hidden mb-0 md:mb-8 shadow-2xl relative flex flex-col group/feed"
    >
        {/* Media Container */}
        <div 
            className="flex-grow relative w-full flex items-center justify-center overflow-hidden bg-black cursor-pointer"
            onClick={onItemClick}
            onMouseDown={handleTapInteraction}
            onTouchEnd={handleTapInteraction}
        >
             {/* Enhanced Heart Burst */}
             {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <HeartIcon filled className="w-40 h-40 text-pink-500 drop-shadow-[0_0_20px_#ec4899] animate-heart-burst" />
                </div>
            )}

            {!isUnlocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xl">
                    <img src={item.src} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl" alt="Locked" />
                    <div className="relative z-20 flex flex-col items-center text-center p-6 bg-black/40 rounded-3xl border border-white/5">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/30">
                            <LockIcon className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-1 font-orbitron tracking-tight">Support Creator</h3>
                        <button 
                            onClick={handleUnlock}
                            disabled={isWalletLoading}
                            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black rounded-full shadow-lg transform transition-all active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
                        >
                            {isWalletLoading ? <LoadingSpinner className="w-4 h-4 text-black"/> : `Unlock ${item.price} Coins`}
                        </button>
                    </div>
                </div>
            ) : (
                item.type === MediaType.Video ? (
                    <div className="w-full h-full relative group/player">
                        <video 
                            ref={videoRef}
                            src={item.videoSrc}
                            loop
                            muted
                            playsInline
                            poster={item.src}
                            className="w-full h-full object-contain z-10"
                        />
                        {!isPlaying && (
                             <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 pointer-events-none transition-opacity duration-300">
                                <div className="p-5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <PlayIcon className="w-10 h-10 text-white" />
                                </div>
                             </div>
                        )}
                        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">AMV / Video</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <img src={item.src} alt={item.description} className="w-full h-full object-contain" />
                )
            )}

            {/* TikTok Style Side Actions */}
            <div className="absolute bottom-20 right-4 z-30 flex flex-col items-center gap-6 md:gap-8">
                <div className="flex flex-col items-center">
                    <div 
                        onClick={handleUserClick} 
                        className="w-12 h-12 rounded-full border-2 border-white p-0.5 bg-black cursor-pointer transform hover:scale-110 transition-transform shadow-xl"
                    >
                        {item.author_avatar ? (
                            <img src={item.author_avatar} alt={item.author} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-pink-600 flex items-center justify-center font-bold text-white text-lg">
                                {item.author?.charAt(0)}
                            </div>
                        )}
                    </div>
                    {session && !isOwner && !isFollowing && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                            className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white -mt-3 relative z-40 shadow-lg border-2 border-black"
                        >
                            <span className="text-xs font-bold">+</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                        className={`p-2 rounded-full transition-all active:scale-75 ${isLiked ? 'text-pink-500' : 'text-white/80 hover:text-white'}`}
                    >
                        <HeartIcon filled={isLiked} className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-bold text-white/90 mt-1 drop-shadow-md">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onItemClick(); }}
                        className="p-2 text-white/80 hover:text-white transition-all active:scale-75"
                    >
                        <ChatIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-bold text-white/90 mt-1 drop-shadow-md">Chat</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleShareClick}
                        className="p-2 text-white/80 hover:text-white transition-all active:scale-75"
                    >
                        <ShareIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-bold text-white/90 mt-1 drop-shadow-md">Share</span>
                </div>
                
                {item.type === MediaType.Video && isPlaying && (
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="absolute top-0 right-0 animate-float-note opacity-0">
                            <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-black p-2 border-4 border-gray-700/50 animate-vinyl shadow-xl">
                             <div className="w-full h-full rounded-full bg-pink-500/20 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-0 inset-x-0 p-4 pt-12 pb-6 bg-gradient-to-t from-black via-black/40 to-transparent z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    <h3 onClick={handleUserClick} className="font-bold text-white text-base mb-1.5 hover:text-pink-400 cursor-pointer inline-block drop-shadow-md">
                        @{item.author}
                    </h3>
                    <p className="text-sm text-gray-100 line-clamp-3 leading-snug drop-shadow-md max-w-[85%] mb-2">
                        {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {item.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs text-pink-400 font-bold drop-shadow-md hover:underline cursor-pointer">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
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
