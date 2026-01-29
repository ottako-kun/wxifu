
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, MediaType } from '../types';
import { reportMediaItem } from '../lib/supabaseClient';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SharePopover from './SharePopover';
import ReportModal from './ReportModal';
import { Session } from '@supabase/supabase-js';
import { useToast } from '../context/ToastContext';
import MediaSidebar from './MediaSidebar';
import MediaViewer from './MediaViewer';
import { useRelatedMedia } from '../hooks/useRelatedMedia';
import { useWallet } from '../context/WalletContext';
import { useMediaLikes } from '../hooks/useMediaLikes';
import { useFollow } from '../hooks/useFollow';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useSwipe } from '../hooks/useSwipe';
import { useDoubleTap } from '../hooks/useDoubleTap';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import ShareIcon from './icons/ShareIcon';
import GiftIcon from './icons/GiftIcon';
import TipModal from './TipModal';

interface MediaDetailModalProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session: Session | null;
  onDataChange?: () => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ items, initialIndex, onClose, onUserClick, session, onDataChange }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Immersive States
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drawer / UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  const item = items[currentIndex];

  const safeItem: MediaItem = item || {
      id: 'fallback',
      type: MediaType.Photo,
      src: '',
      user_id: '',
      author: '',
      description: '',
      category: '',
      tags: [],
      is_premium: false,
      price: 0
  };

  const isOwner = session?.user.id === safeItem.user_id;
  
  const toast = useToast();
  const relatedItems = useRelatedMedia(safeItem, items);
  const { unlockContent, isUnlocked: checkIsUnlocked, isLoading: isWalletLoading } = useWallet();
  const { isLiked, likeCount, toggleLike } = useMediaLikes(safeItem.id, session?.user.id, (safeItem.id || '').startsWith('static'));
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, safeItem.user_id || '');
  
  const isUnlocked = isOwner || !safeItem.is_premium || checkIsUnlocked(safeItem.id);

  // PRE-FETCHING LOGIC
  useEffect(() => {
      const nextItem = items[currentIndex + 1];
      if (nextItem && nextItem.type === MediaType.Photo) {
          const img = new Image();
          img.src = nextItem.src;
      }
  }, [currentIndex, items]);

  const goToPrevious = useCallback(() => {
    if (isZoomed) return;
    if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setIsDrawerOpen(false);
        setIsZoomed(false);
        setAutoplayProgress(0);
    }
  }, [currentIndex, isZoomed]);

  const goToNext = useCallback(() => {
    if (isZoomed) return;
    if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsDrawerOpen(false);
        setIsZoomed(false);
        setAutoplayProgress(0);
    } else {
        setIsAutoplay(false);
    }
  }, [currentIndex, items.length, isZoomed]);

  const handleLikeAction = useCallback(async () => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 800);
    await toggleLike();
  }, [toggleLike]);

  const handleMediaEnded = useCallback(() => {
    if (isAutoplay) {
        goToNext();
    }
  }, [isAutoplay, goToNext]);

  // Autoplay Effect (Photos only, Videos wait for handleMediaEnded)
  useEffect(() => {
    if (isAutoplay && isVisible && isUnlocked && item?.type === MediaType.Photo) {
        const DURATION = 6000;
        const INTERVAL = 50;
        
        autoplayTimerRef.current = setTimeout(goToNext, DURATION);
        
        progressIntervalRef.current = setInterval(() => {
            setAutoplayProgress(prev => Math.min(prev + (INTERVAL / DURATION) * 100, 100));
        }, INTERVAL);
    } else {
        setAutoplayProgress(0);
    }

    return () => {
        if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isAutoplay, currentIndex, isVisible, isUnlocked, item?.type, goToNext]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeUp: isDrawerOpen ? undefined : goToNext,
    onSwipeDown: isDrawerOpen ? undefined : goToPrevious,
    onSwipeLeft: isDrawerOpen ? undefined : goToNext,
    onSwipeRight: isDrawerOpen ? undefined : goToPrevious,
    disabled: isZoomed
  });

  const handleDoubleTap = useDoubleTap(handleLikeAction);
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareAnchorEl(e.currentTarget as HTMLElement);
  };

  const closeSharePopover = () => {
    setShareAnchorEl(null);
  };
  
  const handleAuthorClick = () => {
      if (safeItem.author && safeItem.user_id && onUserClick) {
          handleClose();
          setTimeout(() => {
             onUserClick({
                 id: safeItem.user_id!,
                 name: safeItem.author!,
                 avatar: safeItem.author_avatar || ''
             });
          }, 300);
      }
  };

  const handleRelatedClick = useCallback((id: string) => {
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      setCurrentIndex(index);
      setIsDrawerOpen(false);
    }
  }, [items]);

  const handleUnlockClick = async () => {
      if (!session) {
          toast.error("Please login to unlock content");
          return;
      }
      await unlockContent(safeItem.id, safeItem.price || 0, safeItem.user_id);
  };

  useKeyboardNav({
    onNext: goToNext,
    onPrev: goToPrevious,
    onEscape: () => {
      if (isDrawerOpen) setIsDrawerOpen(false);
      else handleClose();
    },
    disabled: !item || isZoomed
  });

  useEffect(() => {
      const handleHotkeys = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'l') handleLikeAction();
        if (e.key.toLowerCase() === 'f') setIsFocusMode(prev => !prev);
      };
      window.addEventListener('keydown', handleHotkeys);
      return () => window.removeEventListener('keydown', handleHotkeys);
  }, [handleLikeAction]);

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!item) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-[80] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
    >
        {/* Autoplay Progress Bar */}
        {isAutoplay && item.type === MediaType.Photo && (
            <div className="absolute top-0 left-0 right-0 h-1 z-[110] bg-white/10">
                <div 
                    className="h-full bg-pink-500 transition-all duration-100 ease-linear shadow-[0_0_10px_#ec4899]" 
                    style={{ width: `${autoplayProgress}%` }}
                ></div>
            </div>
        )}

        {/* Top Header Bar */}
        <div className={`absolute top-0 inset-x-0 z-[90] flex items-center justify-between p-4 pointer-events-none transition-all duration-500 ${isFocusMode ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{currentIndex + 1} / {items.length}</span>
                </div>
                
                <button 
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    className={`flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border transition-all active:scale-95 ${isAutoplay ? 'border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)]' : 'border-white/10 text-white/60'}`}
                >
                    <span className="text-[10px] font-black uppercase tracking-tighter">{isAutoplay ? 'Autoplay On' : 'Autoplay Off'}</span>
                </button>
            </div>
            
            <button 
                onClick={handleClose} 
                className="pointer-events-auto text-white/70 hover:text-white bg-black/40 hover:bg-red-500/80 rounded-full p-2.5 transition-all backdrop-blur-md border border-white/10 active:scale-90"
            >
                <CloseIcon className="w-6 h-6"/>
            </button>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className={`hidden md:flex absolute inset-y-0 left-0 w-24 items-center justify-center z-[85] pointer-events-none transition-opacity duration-500 ${isFocusMode || isZoomed ? 'opacity-0' : 'opacity-100'}`}>
            {currentIndex > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5 active:scale-90"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
            )}
        </div>
        <div className={`hidden md:flex absolute inset-y-0 right-0 w-24 items-center justify-center z-[85] pointer-events-none transition-opacity duration-500 ${isFocusMode || isZoomed ? 'opacity-0' : 'opacity-100'}`}>
            {currentIndex < items.length - 1 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5 active:scale-90"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            )}
        </div>

        {/* Main Content Area */}
        <div 
            className={`relative flex-grow w-full h-full overflow-hidden bg-[#020202] transition-all duration-500 ${isDrawerOpen ? 'md:pr-[400px]' : ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleDoubleTap}
        >
            <MediaViewer 
                item={item}
                isUnlocked={isUnlocked}
                onUnlockClick={handleUnlockClick}
                isUnlocking={isWalletLoading}
                onMediaEnded={handleMediaEnded}
                onZoomChange={setIsZoomed}
            />

            {/* Heart Animation Overlay */}
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none animate-bounce-in">
                    <HeartIcon filled className="w-32 h-32 text-white drop-shadow-2xl opacity-90" />
                </div>
            )}

            {/* OVERLAY: Bottom Actions */}
            <div className={`absolute inset-0 pointer-events-none flex flex-col justify-end pb-safe transition-all duration-500 ${isDrawerOpen || isFocusMode || isZoomed ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                
                <div className="relative z-10 flex items-end justify-between px-6 pb-10 md:px-12 md:pb-12">
                    <div className="flex-grow max-w-[75%] md:max-w-2xl pointer-events-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="cursor-pointer active:scale-90 transition-transform" onClick={handleAuthorClick}>
                                {item.author_avatar ? (
                                    <img src={item.author_avatar} alt={item.author} className="w-12 h-12 rounded-full border-2 border-pink-500 shadow-xl object-cover" />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {item.author?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-xl leading-none cursor-pointer hover:underline font-orbitron" onClick={handleAuthorClick}>
                                    {item.author}
                                </h2>
                                {!isOwner && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                                        className="text-[10px] font-bold text-pink-400 hover:text-white transition-colors uppercase tracking-widest mt-1 active:scale-95"
                                    >
                                        {isFollowing ? 'Following' : '+ Follow'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-white/90 text-sm md:text-lg mb-3 drop-shadow-lg leading-relaxed max-w-lg line-clamp-2">
                            {item.description}
                        </p>
                    </div>

                    <div className="flex flex-col gap-5 pointer-events-auto items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                                className={`p-4 rounded-full backdrop-blur-xl border transition-all active:scale-75 ${isLiked ? 'bg-pink-500 border-pink-500 text-white shadow-[0_0_20px_#ec4899]' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                            >
                                <HeartIcon filled={isLiked} className="w-7 h-7 md:w-8 md:h-8" />
                            </button>
                            <span className="text-[10px] font-black text-white drop-shadow-lg">{likeCount}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsDrawerOpen(!isDrawerOpen); }}
                                className="p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all active:scale-75 shadow-lg"
                            >
                                <ChatIcon className="w-7 h-7 md:w-8 md:h-8" />
                            </button>
                        </div>

                        {!isOwner && session && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }}
                                className="p-4 rounded-full bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all active:scale-75 shadow-lg"
                             >
                                 <GiftIcon className="w-6 h-6 md:w-7 md:h-7" />
                             </button>
                        )}

                        <button 
                            onClick={handleShareClick}
                            className="p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all active:scale-75 shadow-lg"
                        >
                            <ShareIcon className="w-6 h-6 md:w-7 md:h-7" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RESPONSIVE DRAWER --- */}
        {isDrawerOpen && (
            <div 
                className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-all duration-300"
                onClick={() => setIsDrawerOpen(false)}
            >
                <div 
                    className="absolute bottom-0 md:top-0 md:right-0 w-full md:w-[400px] h-[80vh] md:h-full bg-[#080808] border-t md:border-t-0 md:border-l border-white/10 rounded-t-[2.5rem] md:rounded-none flex flex-col shadow-2xl animate-slide-up md:animate-slide-in-right overflow-hidden ring-1 ring-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="md:hidden w-full flex justify-center pt-4 pb-2" onClick={() => setIsDrawerOpen(false)}>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h3 className="text-white font-black text-lg uppercase tracking-widest font-orbitron">Details</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                         <MediaSidebar 
                            item={item}
                            session={session}
                            relatedItems={relatedItems}
                            isOwner={isOwner}
                            onAuthorClick={handleAuthorClick}
                            onRelatedClick={handleRelatedClick}
                            onShareClick={handleShareClick}
                            onReportClick={() => setIsReportModalOpen(true)}
                            onDataChange={onDataChange}
                            onDeleteSuccess={handleClose}
                        />
                    </div>
                </div>
            </div>
        )}

        {shareAnchorEl && (
            <SharePopover
                item={item}
                onClose={closeSharePopover}
                anchorEl={shareAnchorEl}
            />
        )}

        {isReportModalOpen && (
            <ReportModal 
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={async (reason, details) => {
                    if (!session) return;
                    setIsReporting(true);
                    await reportMediaItem({ media_id: safeItem.id, reporter_id: session.user.id, reason, details });
                    setIsReporting(false);
                    setIsReportModalOpen(false);
                    toast.success("Thank you for your report.");
                }}
                isSubmitting={isReporting}
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

export default MediaDetailModal;
