
import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, MediaType, Session } from '../types';
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
import { isGoogleDriveLink } from '../lib/googleDrive';

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
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { isLiked, likeCount, toggleLike } = useMediaLikes(item.id, session?.user.id, item.id.startsWith('static'));
  const { isUnlocked: checkIsUnlocked, unlockContent, isLoading: isWalletLoading } = useWallet();
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, item.user_id || '');
  const { isGlobalMuted, toggleGlobalMute } = useUI();

  const isOwner = session?.user.id === item.user_id;
  const isUnlocked = isOwner || !item.is_premium || checkIsUnlocked(item.id);
  const isDriveVideo = item.type === MediaType.Video && isGoogleDriveLink(item.videoSrc);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  useEffect(() => {
    if (item.type !== MediaType.Video || !isUnlocked || isDriveVideo) return;

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
  }, [item.type, isUnlocked, isDriveVideo]);

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
            <img src={item.src} className="w-full h-full object-cover opacity-25 blur-[100px] scale-110" alt="" />
        </div>

        <div 
            className="flex-grow relative w-full h-full flex items-center justify-center overflow-hidden bg-black cursor-pointer md:aspect-[9/16] md:h-full md:w-auto md:mx-auto md:shadow-2xl z-10"
            onClick={onItemClick}
            onMouseDown={handleTapInteraction}
            onTouchEnd={handleTapInteraction}
        >
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <HeartIcon filled className="w-36 h-36 text-pink-500 drop-shadow-[0_0_20px_#ec4899] animate-heart-burst" />
                </div>
            )}

            {!isImageLoaded && item.type === MediaType.Photo && <div className="absolute inset-0 animate-pulse-bg" />}

            {!isUnlocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl pointer-events-auto">
                    <div className="relative z-20 flex flex-col items-center text-center p-10 bg-black/50 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                            <LockIcon className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-white font-black text-2xl mb-2 font-orbitron tracking-tight uppercase">Neural Lock</h3>
                        <p className="text-gray-400 text-sm mb-10 leading-relaxed max-w-[240px]">This creation by <span className="text-pink-400 font-bold">@{item.author}</span> requires authorization.</p>
                        <button 
                            onClick={handleUnlock}
                            disabled={isWalletLoading}
                            className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black rounded-[1.5rem] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 uppercase text-[11px] tracking-widest"
                        >
                            {isWalletLoading ? <LoadingSpinner className="w-5 h-5 text-black"/> : `${item.price || 5} Coins to View`}
                        </button>
                    </div>
                </div>
            ) : (
                item.type === MediaType.Video ? (
                    <div className="w-full h-full relative group/player">
                        {isDriveVideo ? (
                            <div className="w-full h-full relative">
                                {!iframeLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                                        <LoadingSpinner className="w-12 h-12 text-pink-500 mb-4" />
                                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] animate-pulse">Establishing Signal</p>
                                    </div>
                                )}
                                <iframe 
                                    src={item.videoSrc}
                                    className="w-full h-full border-0 z-10"
                                    allow="autoplay"
                                    onLoad={() => setIframeLoaded(true)}
                                />
                            </div>
                        ) : (
                            <>
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
                                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/10 pointer-events-none transition-opacity duration-300">
                                        <div className="p-8 bg-black/40 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl">
                                            <PlayIcon className="w-12 h-12 text-white" />
                                        </div>
                                    </div>
                                )}
                                <button 
                                    onClick={handleMuteToggle}
                                    className="absolute top-6 right-6 z-30 p-3 bg-black/30 backdrop-blur-3xl rounded-2xl border border-white/5 text-white hover:bg-black/60 transition-all active:scale-90"
                                >
                                    {isGlobalMuted ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path strokeLinecap="round" d="M15.54 8.46l5.66 5.66m0-5.66l-5.66 5.66"/></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <img 
                      src={item.src} 
                      alt={item.description} 
                      className="w-full h-full object-contain z-10 transition-opacity duration-700" 
                      onLoad={() => setIsImageLoaded(true)}
                    />
                )
            )}

            {/* Interaction Bar - Optimized spacing */}
            <div className="absolute bottom-24 right-4 z-30 flex flex-col items-center gap-7">
                <div className="flex flex-col items-center">
                    <div className="relative" onClick={handleUserClick}>
                        <Avatar 
                           src={item.author_avatar} 
                           alt={item.author} 
                           size="md"
                           isVerified={true}
                           className="cursor-pointer border-2 border-white/40 shadow-2xl scale-110"
                        />
                        {session && !isOwner && !isFollowing && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white z-40 border-2 border-black shadow-xl"
                            >
                                <span className="text-[10px] font-black">+</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                        className={`p-2 transition-all active:scale-50 ${isLiked ? 'text-pink-500' : 'text-white'}`}
                    >
                        <HeartIcon filled={isLiked} className="w-9 h-9 drop-shadow-2xl" />
                    </button>
                    <span className="text-[10px] font-black text-white mt-1 drop-shadow-xl">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={(e) => { e.stopPropagation(); onItemClick(); }} className="p-2 text-white transition-all active:scale-50">
                        <ChatIcon className="w-9 h-9 drop-shadow-2xl" />
                    </button>
                    <span className="text-[10px] font-black text-white mt-1 drop-shadow-xl">Art</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }} className="p-2 text-yellow-500 transition-all active:scale-50">
                        <GiftIcon className="w-9 h-9 drop-shadow-2xl" />
                    </button>
                    <span className="text-[10px] font-black text-white mt-1 drop-shadow-xl">Gift</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={handleShareClick} className="p-2 text-white transition-all active:scale-50">
                        <ShareIcon className="w-9 h-9 drop-shadow-2xl" />
                    </button>
                    <span className="text-[10px] font-black text-white mt-1 drop-shadow-xl">Link</span>
                </div>
                
                {isPlaying && !isDriveVideo && (
                    <div className="relative w-11 h-11 flex items-center justify-center mt-3">
                        <div className="absolute top-0 right-0 animate-float-note opacity-0">
                            <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        </div>
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-900 to-black p-1 animate-vinyl border border-white/10 shadow-2xl">
                             <div className="w-full h-full rounded-full bg-pink-500/10 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Info Area - Grassy transparent bg */}
            <div className="absolute bottom-0 inset-x-0 p-6 pt-32 pb-10 bg-gradient-to-t from-black via-black/30 to-transparent z-20 pointer-events-none">
                <div className="pointer-events-auto max-w-[80%] flex flex-col gap-2 animate-slide-up">
                    <h3 onClick={handleUserClick} className="font-black text-white text-lg mb-1 hover:text-pink-400 cursor-pointer inline-flex items-center gap-2 drop-shadow-2xl font-orbitron tracking-tight">
                        @{item.author}
                        <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-black shadow-[0_0_8px_#06b6d4]">
                             <svg viewBox="0 0 24 24" fill="currentColor" className="w-[80%] h-[80%] text-white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                             </svg>
                        </div>
                    </h3>
                    <p className="text-sm text-gray-100 line-clamp-2 leading-relaxed drop-shadow-2xl font-medium max-w-sm">
                        {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {item.tags?.slice(0, 4).map(tag => (
                            <span key={tag} className="text-[10px] text-pink-400 font-black tracking-widest uppercase bg-pink-950/20 px-2 py-0.5 rounded border border-pink-500/10">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {item.type === MediaType.Video && isUnlocked && !isDriveVideo && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
                    <div className="h-full bg-pink-500 shadow-[0_0_15px_#ec4899] transition-all duration-300 ease-linear" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>

        {shareAnchorEl && <SharePopover item={item} onClose={() => setShareAnchorEl(null)} anchorEl={shareAnchorEl} />}
        {isTipModalOpen && <TipModal recipientId={item.user_id || ''} recipientName={item.author || ''} onClose={() => setIsTipModalOpen(false)} />}
    </div>
  );
};

export default FeedCard;
