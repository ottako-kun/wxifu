
import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, MediaType, Session } from '../types';
import { cn, DEFAULT_THUMB_URL } from '../lib/utils';
import { buttonVariants, spacing, transitions } from '../lib/designTokens';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import ShareIcon from './icons/ShareIcon';
import LockIcon from './icons/LockIcon';
import PlayIcon from './icons/PlayIcon';
import SharePopover from './SharePopover';
import { useMediaLikes } from '../hooks/useMediaLikes';
import { useFollow } from '../hooks/useFollow';
import LoadingSpinner from './icons/LoadingSpinner';
import { useDoubleTap } from '../hooks/useDoubleTap';
import { useUI } from '../context/UIContext';
import Avatar from './Avatar';
import { isGoogleDriveLink } from '../lib/googleDrive';
import { isHypnotubeUrl, isRedgifsUrl } from '../lib/utils';

interface FeedCardProps {
  item: MediaItem;
  session: Session | null;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  onItemClick: () => void;
  onDataChange?: () => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ item, session, onUserClick, onItemClick, onDataChange }) => {
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(item.src);
  
  useEffect(() => {
    setCurrentSrc(item.src);
  }, [item.src]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { isLiked, likeCount, toggleLike } = useMediaLikes(item.id, session?.user.id, item.id.startsWith('static'));
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, item.user_id || '');
  const { isGlobalMuted, toggleGlobalMute } = useUI();

  const isOwner = session?.user.id === item.user_id;
  const isUnlocked = true; // Simplified: everything is unlocked
  const isIframeVideo = item.type === MediaType.Video && (isGoogleDriveLink(item.videoSrc) || isHypnotubeUrl(item.videoSrc) || isRedgifsUrl(item.videoSrc));

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  useEffect(() => {
    if (item.type !== MediaType.Video || !isUnlocked || isIframeVideo) return;

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
  }, [item.type, isUnlocked, isIframeVideo]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
        const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(p);
    }
  };

  const handleLikeAction = async () => {
    setShowHeartAnimation(true);
    setShowPulse(true);
    setTimeout(() => {
        setShowHeartAnimation(false);
        setShowPulse(false);
    }, 1000);
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

  const handleMuteToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleGlobalMute();
  };

  return (
    <div 
      ref={cardRef}
      className="w-full h-[100dvh] md:h-[90vh] bg-black md:bg-gray-950 md:rounded-3xl overflow-hidden mb-0 md:mb-8 shadow-2xl relative flex flex-col group/feed snap-start snap-always"
    >
        <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
            <img src={currentSrc} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-25 blur-[100px] scale-110" alt="" />
        </div>

        <div 
            className="flex-grow relative w-full h-full flex items-center justify-center overflow-hidden bg-black cursor-pointer md:aspect-[9/16] md:h-full md:w-auto md:mx-auto md:shadow-2xl z-10"
            onClick={onItemClick}
            onMouseDown={handleTapInteraction}
            onTouchEnd={handleTapInteraction}
        >
            {showPulse && <div className="neural-pulse-ring"></div>}
            
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <HeartIcon filled className="w-36 h-36 text-pink-500 drop-shadow-[0_0_20px_#ec4899] animate-heart-burst" />
                </div>
            )}

            {!isImageLoaded && item.type === MediaType.Photo && <div className="absolute inset-0 animate-pulse-bg" />}

            {item.type === MediaType.Video ? (
                <div className="w-full h-full relative group/player">
                    {isIframeVideo ? (
                        isHypnotubeUrl(item.videoSrc) ? (
                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center p-8 bg-black/95 backdrop-blur-3xl z-30">
                                <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/30">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </div>
                                <h3 className="text-white text-base font-bold font-orbitron uppercase tracking-widest mb-2">Embed Restrained</h3>
                                <p className="text-gray-400 text-xs mb-8 max-w-[280px] leading-relaxed mx-auto">
                                    HypnoTube prohibits inline frame embedding. View the direct host link in a secure browser container.
                                </p>
                                <a 
                                    href={item.src || item.videoSrc} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-2xl transition-all shadow-[0_0_15px_rgba(236,72,153,0.5)] active:scale-95 uppercase tracking-widest text-[9px] font-orbitron"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Open External Stream
                                </a>
                            </div>
                        ) : (
                            <div className="w-full h-full relative">
                                {!iframeLoaded && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                                        <LoadingSpinner className="w-12 h-12 text-pink-500 mb-4" />
                                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] animate-pulse font-orbitron">Establishing Signal</p>
                                    </div>
                                )}
                                <iframe 
                                    src={item.videoSrc}
                                    className="w-full h-full border-0 z-10"
                                    allow="autoplay"
                                    onLoad={() => setIframeLoaded(true)}
                                />
                            </div>
                        )
                    ) : (
                        <>
                            <video 
                                ref={videoRef}
                                src={item.videoSrc}
                                loop
                                muted={isGlobalMuted}
                                playsInline
                                poster={currentSrc}
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
                                className="absolute top-6 right-6 z-30 p-4 bg-black/30 backdrop-blur-3xl rounded-2xl border border-white/5 text-white hover:bg-black/60 transition-all active:scale-90"
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
                  src={currentSrc} 
                  alt={item.description} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain z-10 transition-opacity duration-700" 
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => {
                    if (currentSrc !== DEFAULT_THUMB_URL) {
                      setCurrentSrc(DEFAULT_THUMB_URL);
                    }
                  }}
                />
            )}

            {/* Interaction Bar - Enhanced hit targets for mobile */}
            <div className={cn("absolute bottom-24 right-4 z-30 flex flex-col items-center gap-2", spacing.gap2)}>
                <div className="p-2" onClick={handleUserClick}>
                    <div className="relative">
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
                                className={cn(
                                    "absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white z-40 border-2 border-black shadow-xl",
                                    "min-h-[48px] min-w-[48px] active:scale-90 transition-transform"
                                )}
                                aria-label={`Follow ${item.author}`}
                            >
                                <span className="text-[10px] font-black">+</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                        className={cn(
                            "transition-all active:scale-50 min-h-[48px] min-w-[48px] flex items-center justify-center",
                            isLiked ? 'text-pink-500' : 'text-white'
                        )}
                        aria-label="Like"
                    >
                        <HeartIcon filled={isLiked} className="w-8 h-8 drop-shadow-2xl" />
                    </button>
                    <span className="text-[10px] font-black text-white -mt-2 drop-shadow-xl font-orbitron">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onItemClick(); }} 
                      className={cn(
                        "transition-all active:scale-50 min-h-[48px] min-w-[48px] flex items-center justify-center",
                        "text-white"
                      )}
                      aria-label="Info"
                    >
                        <ChatIcon className="w-8 h-8 drop-shadow-2xl" />
                    </button>
                    <span className="text-[10px] font-black text-white -mt-2 drop-shadow-xl font-orbitron">Info</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                      onClick={handleShareClick} 
                      className={cn(
                        "transition-all active:scale-50 min-h-[48px] min-w-[48px] flex items-center justify-center",
                        "text-white"
                      )}
                      aria-label="Share"
                    >
                        <ShareIcon className="w-8 h-8 drop-shadow-2xl" />
                    </button>
                    <span className="text-[10px] font-black text-white -mt-2 drop-shadow-xl font-orbitron">Link</span>
                </div>
            </div>

            {/* Scroll Hint for mobile */}
            <div className="scroll-hint md:hidden"></div>

            {/* Bottom Info Area */}
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
                            <span key={tag} className="text-[10px] text-pink-400 font-black tracking-widest uppercase bg-pink-950/20 px-2 py-0.5 rounded border border-pink-500/10 hover:bg-pink-900/40 transition-colors">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            {item.type === MediaType.Video && isUnlocked && !isIframeVideo && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
                    <div className="h-full bg-pink-500 shadow-[0_0_15px_#ec4899] transition-all duration-300 ease-linear" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>

        {shareAnchorEl && <SharePopover item={item} onClose={() => setShareAnchorEl(null)} anchorEl={shareAnchorEl} />}
    </div>
  );
};

export default FeedCard;
