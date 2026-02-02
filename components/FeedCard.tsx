
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
      className="w-full h-[100dvh] bg-black overflow-hidden relative flex flex-col group/feed"
    >
        {/* Cinematic Backdrop for Desktop */}
        <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
            <img src={item.src} className="w-full h-full object-cover opacity-10 blur-[100px] scale-110" alt="" />
        </div>

        {/* Content Container */}
        <div 
            className="flex-grow relative w-full h-full flex items-center justify-center overflow-hidden bg-black cursor-pointer md:max-w-[500px] md:mx-auto md:shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
            onClick={onItemClick}
            onMouseDown={handleTapInteraction}
            onTouchEnd={handleTapInteraction}
        >
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <HeartIcon filled className="w-32 h-32 text-pink-500 drop-shadow-[0_0_20px_#ec4899] animate-heart-burst" />
                </div>
            )}

            {!isUnlocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-3xl">
                    <div className="relative z-20 flex flex-col items-center text-center p-8 bg-gray-900/60 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                            <LockIcon className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-white font-black text-2xl mb-2 font-orbitron tracking-tight uppercase">Premium Vault</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-[200px]">Unlock high-fidelity artwork by <span className="text-pink-400 font-bold">@{item.author}</span></p>
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
                        {isDriveVideo ? (
                            <div className="w-full h-full relative">
                                {!iframeLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                                        <LoadingSpinner className="w-10 h-10 text-pink-500 mb-4" />
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Initializing Neural Link</p>
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
                                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 pointer-events-none">
                                        <div className="p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                            <PlayIcon className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                )}
                                <button 
                                    onClick={handleMuteToggle}
                                    className="absolute top-6 right-6 z-30 p-3 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 text-white hover:bg-black/70 transition-all active:scale-90"
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
                      className={`w-full h-full object-contain z-10 transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                      onLoad={() => setIsImageLoaded(true)}
                    />
                )
            )}

            {/* Side Interaction Actions */}
            <div className="absolute bottom-28 right-4 z-30 flex flex-col items-center gap-7">
                <div className="flex flex-col items-center">
                    <div className="relative group/avatar" onClick={handleUserClick}>
                        <Avatar 
                           src={item.author_avatar} 
                           alt={item.author} 
                           size="md"
                           isVerified={true}
                           className="cursor-pointer border-2 border-white/20 shadow-2xl group-hover/avatar:scale-110 transition-transform"
                        />
                        {session && !isOwner && !isFollowing && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white z-40 border-2 border-black shadow-lg"
                            >
                                <span className="text-[14px] font-black">+</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                        className={`p-2 transition-all active:scale-50 ${isLiked ? 'text-pink-500' : 'text-white'}`}
                    >
                        <HeartIcon filled={isLiked} className={`w-8 h-8 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${isLiked ? 'filter drop-shadow-[0_0_8px_#ec4899]' : ''}`} />
                    </button>
                    <span className="text-[11px] font-black text-white mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-tighter">
                        {likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}
                    </span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={(e) => { e.stopPropagation(); onItemClick(); }} className="p-2 text-white transition-all active:scale-50">
                        <ChatIcon className="w-8 h-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
                    </button>
                    <span className="text-[11px] font-black text-white mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-tighter">Art</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }} className="p-2 text-yellow-500 transition-all active:scale-50">
                        <GiftIcon className="w-8 h-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
                    </button>
                    <span className="text-[11px] font-black text-white mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-tighter">Gift</span>
                </div>

                <div className="flex flex-col items-center">
                    <button onClick={handleShareClick} className="p-2 text-white transition-all active:scale-50">
                        <ShareIcon className="w-8 h-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
                    </button>
                    <span className="text-[11px] font-black text-white mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-tighter">Link</span>
                </div>
            </div>

            {/* Caption Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-6 pt-24 pb-12 bg-gradient-to-t from-black via-black/60 to-transparent z-20 pointer-events-none">
                <div className="pointer-events-auto max-w-[80%]">
                    <h3 onClick={handleUserClick} className="font-black text-white text-lg mb-1.5 hover:text-pink-400 cursor-pointer inline-flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wide">
                        @{item.author}
                        <div className="w-3.5 h-3.5 bg-cyan-500 rounded-full flex items-center justify-center border border-black shadow-[0_0_8px_#06b6d4]">
                             <svg viewBox="0 0 24 24" fill="currentColor" className="w-[80%] h-[80%] text-white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                             </svg>
                        </div>
                    </h3>
                    <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,1)] font-light">
                        {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {item.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] text-pink-400 font-black uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,1)] bg-pink-900/10 px-2 py-0.5 rounded border border-pink-500/10">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Progress Line */}
            {item.type === MediaType.Video && isUnlocked && !isDriveVideo && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-50">
                    <div className="h-full bg-pink-500 shadow-[0_0_12px_#ec4899] transition-all duration-300 ease-linear" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>

        {shareAnchorEl && <SharePopover item={item} onClose={() => setShareAnchorEl(null)} anchorEl={shareAnchorEl} />}
        {isTipModalOpen && <TipModal recipientId={item.user_id || ''} recipientName={item.author || ''} onClose={() => setIsTipModalOpen(false)} />}
    </div>
  );
};

export default FeedCard;
