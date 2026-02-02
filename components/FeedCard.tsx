
import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, MediaType, Session } from '../types';
// Fixed: Import Session from local types
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { isLiked, likeCount, toggleLike } = useMediaLikes(item.id, session?.user.id, item.id.startsWith('static'));
  const { isUnlocked: checkIsUnlocked, unlockContent, isLoading: isWalletLoading } = useWallet();
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, item.user_id || '');
  const { isGlobalMuted, toggleGlobalMute, showVolumeHUD } = useUI();

  const isOwner = session?.user.id === item.user_id;
  const isUnlocked = isOwner || !item.is_premium || checkIsUnlocked(item.id);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

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
    if (videoRef.current && videoRef.current.duration) {
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
      className="w-full h-[100dvh] md:h-[90vh] bg-black md:bg-gray-950 md:rounded-3xl overflow-hidden mb-0 md:mb-8 shadow-2xl relative flex flex-col group/feed snap-start"
    >
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
            <img src={item.src} className="w-full h-full object-cover opacity-25 blur-3xl scale-110" alt="" />
        </div>

        <div 
            className="flex-grow relative w-full h-full flex items-center justify-center overflow-hidden bg-black cursor-pointer md:aspect-[9/16] md:h-full md:w-auto md:mx-auto md:shadow-2xl z-10"
            onClick={onItemClick}
            onMouseDown={handleTapInteraction}
            onTouchEnd={handleTapInteraction}
        >
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <HeartIcon filled className="w-32 h-32 text-pink-500 drop-shadow-[0_0_20px_#ec4899] animate-heart-burst" />
                </div>
            )}

            {!isImageLoaded && <div className="absolute inset-0 animate-pulse-bg" />}

            {!isUnlocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-3xl pointer-events-auto">
                    <div className="relative z-20 flex flex-col items-center text-center p-8 bg-black/40 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                            <LockIcon className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-white font-black text-2xl mb-2 font-orbitron tracking-tight uppercase">Premium Vault</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-[200px]">Unlock to view full content by <span className="text-pink-400 font-bold">@{item.author}</span></p>
                        <button 
                            onClick={handleUnlock}
                            disabled={isWalletLoading}
                            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                        >
                            {isWalletLoading ? <LoadingSpinner className="w-5 h-5 text-black"/> : `${item.price || 5} Coins to Unlock`}
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
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            className="w-full h-full object-contain z-10"
                        />
                        {!isPlaying && (
                             <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 pointer-events-none transition-opacity duration-300">
                                <div className="p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <PlayIcon className="w-10 h-10 text-white" />
                                </div>
                             </div>
                        )}
                        <button 
                            onClick={handleMuteToggle}
                            className="absolute top-4 right-4 z-30 p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-all"
                        >
                            {isGlobalMuted ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path strokeLinecap="round" d="M15.54 8.46l5.66 5.66m0-5.66l-5.66 5.66"/></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
                            )}
                        </button>
                    </div>
                ) : (
                    <img 
                      src={item.src} 
                      alt={item.description} 
                      className="w-full h-full object-contain z-10 transition-opacity duration-500" 
                      onLoad={() => setIsImageLoaded(true)}
                    />
                )
            )}

            {/* Interaction Bar */}
            <div className="absolute bottom-24 right-4 z-30 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center">
                    <div className="relative" onClick={handleUserClick}>
                        <Avatar 
                           src={item.author_avatar} 
                           alt={item.author} 
                           size="md"
                           isVerified={true}
                           className="cursor-pointer border-2 border-white/30 shadow-xl"
                        />
                        {session && !isOwner && !isFollowing && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-white z-40 border border-black shadow-lg"
                            >
                                <span className="text-xs font-bold">+</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                        className={`p-2 transition-all active:scale-50 ${isLiked ? 'text-pink-500' : 'text-white'}`}
                    >
                        <HeartIcon filled={isLiked} className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={(e) => { e.stopPropagation(); onItemClick(); }} className="p-2 text-white transition-all active:scale-50">
                        <ChatIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">Art</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }} className="p-2 text-yellow-500 transition-all active:scale-50">
                        <GiftIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">Gift</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={handleShareClick} className="p-2 text-white transition-all active:scale-50">
                        <ShareIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">Link</span>
                </div>
                
                {isPlaying && (
                    <div className="relative w-10 h-10 flex items-center justify-center mt-2">
                        <div className="absolute top-0 right-0 animate-float-note opacity-0">
                            <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        </div>
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-800 to-black p-1 animate-vinyl border-2 border-gray-700">
                             <div className="w-full h-full rounded-full bg-pink-500/10 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]"></div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Info Area */}
            <div className="absolute bottom-0 inset-x-0 p-5 pt-20 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none">
                <div className="pointer-events-auto max-w-[85%]">
                    <h3 onClick={handleUserClick} className="font-bold text-white text-base mb-1 hover:text-pink-400 cursor-pointer inline-flex items-center gap-1.5 drop-shadow-lg">
                        @{item.author}
                        <div className="w-3 h-3 bg-cyan-500 rounded-full flex items-center justify-center border border-black shadow-[0_0_5px_#06b6d4]">
                             <svg viewBox="0 0 24 24" fill="currentColor" className="w-[80%] h-[80%] text-white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                             </svg>
                        </div>
                    </h3>
                    <p className="text-sm text-gray-200 line-clamp-2 leading-snug drop-shadow-lg font-light">
                        {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {item.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs text-pink-400 font-bold drop-shadow-md">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {item.type === MediaType.Video && isUnlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-50">
                    <div className="h-full bg-pink-500 shadow-[0_0_10px_#ec4899] transition-all duration-300 ease-linear" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>

        {shareAnchorEl && <SharePopover item={item} onClose={() => setShareAnchorEl(null)} anchorEl={shareAnchorEl} />}
        {isTipModalOpen && <TipModal recipientId={item.user_id || ''} recipientName={item.author || ''} onClose={() => setIsTipModalOpen(false)} />}
    </div>
  );
};

export default FeedCard;
