
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
import { useUI } from '../context/UIContext';
import Avatar from './Avatar';

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
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { isLiked, likeCount, toggleLike } = useMediaLikes(item.id, session?.user.id, item.id.startsWith('static'));
  const { isUnlocked: checkIsUnlocked, unlockContent, isLoading: isWalletLoading } = useWallet();
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, item.user_id || '');
  const { isGlobalMuted, toggleGlobalMute, showVolumeHUD } = useUI();

  const isOwner = session?.user.id === item.user_id;
  const isUnlocked = isOwner || !item.is_premium || checkIsUnlocked(item.id);

  // Sync Global Mute
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(p);
    }
  };

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

  const handleMuteToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleGlobalMute();
  };

  return (
    <div 
      ref={cardRef}
      className="w-full max-w-4xl mx-auto h-[100vh] md:h-[90vh] bg-black md:bg-gray-950 md:rounded-3xl overflow-hidden mb-0 md:mb-8 shadow-2xl relative flex flex-col group/feed"
    >
        {/* Background Blur for Tablet/Desktop centering */}
        <div className="hidden md:block absolute inset-0 z-0 overflow-hidden">
            <img src={item.src} className="w-full h-full object-cover opacity-20 blur-3xl scale-125" alt="Bg Blur" />
        </div>

        {/* Media Container */}
        <div 
            className="flex-grow relative w-full h-full flex items-center justify-center overflow-hidden bg-black cursor-pointer md:w-[50.6vh] md:mx-auto md:shadow-2xl z-10"
            onClick={onItemClick}
            onMouseDown={handleTapInteraction}
            onTouchEnd={handleTapInteraction}
        >
             {/* Enhanced Heart Burst */}
             {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <HeartIcon filled className="w-40 h-40 text-pink-500 drop-shadow-[0_0_25px_#ec4899] animate-heart-burst" />
                </div>
            )}

            {/* Volume HUD Overlay */}
            {showVolumeHUD && (
               <div className="absolute inset-0 flex items-center justify-center z-[45] pointer-events-none animate-fade-in">
                  <div className="w-20 h-20 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                     {isGlobalMuted ? (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path strokeLinecap="round" d="M15.54 8.46l5.66 5.66m0-5.66l-5.66 5.66"/></svg>
                     ) : (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
                     )}
                  </div>
               </div>
            )}

            {!isUnlocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl pointer-events-auto">
                    <img src={item.src} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl" alt="Locked" />
                    <div className="relative z-20 flex flex-col items-center text-center p-8 bg-black/40 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                            <LockIcon className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-white font-black text-2xl mb-2 font-orbitron tracking-tight uppercase">Exclusive Art</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-[200px]">Unlock this high-res creation by <span className="text-pink-400 font-bold">@{item.author}</span></p>
                        <button 
                            onClick={handleUnlock}
                            disabled={isWalletLoading}
                            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black rounded-2xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                            title={`Pay ${item.price} Coins to unlock`}
                        >
                            {isWalletLoading ? <LoadingSpinner className="w-5 h-5 text-black"/> : `Unlock ${item.price} Coins`}
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
                            muted={isGlobalMuted}
                            playsInline
                            poster={item.src}
                            onTimeUpdate={handleTimeUpdate}
                            className="w-full h-full object-contain z-10"
                        />
                        {!isPlaying && (
                             <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 pointer-events-none transition-opacity duration-300">
                                <div className="p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <PlayIcon className="w-12 h-12 text-white" />
                                </div>
                             </div>
                        )}
                        
                        {/* Global Sound Toggle Button */}
                        <button 
                            onClick={handleMuteToggle}
                            title={isGlobalMuted ? "Unmute Audio" : "Mute Audio"}
                            className="absolute top-4 right-4 z-30 p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white opacity-80 hover:opacity-100 transition-all hover:scale-110"
                        >
                            {isGlobalMuted ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path strokeLinecap="round" d="M15.54 8.46l5.66 5.66m0-5.66l-5.66 5.66"/></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
                            )}
                        </button>
                    </div>
                ) : (
                    <img src={item.src} alt={item.description} className="w-full h-full object-contain z-10" />
                )
            )}

            {/* TikTok Style Side Actions */}
            <div className="absolute bottom-28 right-4 z-30 flex flex-col items-center gap-5 md:gap-7">
                <div className="flex flex-col items-center">
                    <div className="relative" onClick={handleUserClick} title={`View @${item.author}'s profile`}>
                        <Avatar 
                           src={item.author_avatar} 
                           alt={item.author} 
                           size="md"
                           isVerified={true}
                           className="cursor-pointer transform hover:scale-110 transition-transform shadow-2xl border-2 border-white/20"
                        />
                        {session && !isOwner && !isFollowing && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white z-40 shadow-lg border-2 border-black animate-bounce-in"
                                title="Follow creator"
                            >
                                <span className="text-xs font-bold leading-none">+</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                        className={`p-2.5 rounded-full transition-all active:scale-75 ${isLiked ? 'text-pink-500' : 'text-white/90 hover:text-white'}`}
                        title={isLiked ? "Unlike artwork" : "Like artwork"}
                    >
                        <HeartIcon filled={isLiked} className="w-9 h-9 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                    </button>
                    <span className="text-[11px] font-black text-white mt-1 drop-shadow-md tracking-tighter">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onItemClick(); }}
                        className="p-2.5 text-white/90 hover:text-white transition-all active:scale-75"
                        title="View details & comments"
                    >
                        <ChatIcon className="w-9 h-9 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                    </button>
                    <span className="text-[11px] font-black text-white mt-1 drop-shadow-md tracking-tighter">Art</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }}
                        className="p-2.5 text-yellow-500/90 hover:text-yellow-400 transition-all active:scale-75"
                        title="Send a gift/tip to artist"
                    >
                        <GiftIcon className="w-9 h-9 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                    </button>
                    <span className="text-[11px] font-black text-white mt-1 drop-shadow-md tracking-tighter">Gift</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleShareClick}
                        className="p-2.5 text-white/90 hover:text-white transition-all active:scale-75"
                        title="Share this content"
                    >
                        <ShareIcon className="w-9 h-9 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                    </button>
                    <span className="text-[11px] font-black text-white mt-1 drop-shadow-md tracking-tighter">Link</span>
                </div>
                
                {item.type === MediaType.Video && isPlaying && (
                    <div className="relative w-12 h-12 flex items-center justify-center mt-2">
                        <div className="absolute top-0 right-0 animate-float-note opacity-0">
                            <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-black p-1.5 border-4 border-gray-700/50 animate-vinyl shadow-2xl ring-1 ring-white/10">
                             <div className="w-full h-full rounded-full bg-pink-500/10 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Caption Area */}
            <div className="absolute bottom-0 inset-x-0 p-5 pt-20 pb-10 bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none">
                <div className="pointer-events-auto max-w-[85%]">
                    <h3 onClick={handleUserClick} className="font-black text-white text-lg mb-2 hover:text-pink-400 cursor-pointer inline-flex items-center gap-1.5 drop-shadow-lg" title="Visit profile">
                        @{item.author}
                        <div className="w-3.5 h-3.5 bg-cyan-500 rounded-full flex items-center justify-center border border-black shadow-[0_0_8px_#06b6d4]">
                             <svg viewBox="0 0 24 24" fill="currentColor" className="w-[80%] h-[80%] text-white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                             </svg>
                        </div>
                    </h3>
                    <p className="text-sm text-gray-100 line-clamp-2 leading-relaxed drop-shadow-lg font-medium italic opacity-95">
                        {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                            {item.tags.slice(0, 4).map(tag => (
                                <span key={tag} className="text-xs text-pink-400 font-black drop-shadow-md hover:text-white transition-colors cursor-pointer" title={`Search for #${tag}`}>#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Progress Line */}
            {item.type === MediaType.Video && isUnlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-50 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-pink-500 via-pink-400 to-cyan-400 shadow-[0_0_10px_#ec4899] transition-all duration-300 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
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
