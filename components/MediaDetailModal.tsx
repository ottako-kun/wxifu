
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
import LoadingSpinner from './icons/LoadingSpinner';

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

  // Ensure index is within bounds
  const validIndex = Math.min(Math.max(0, currentIndex), items.length - 1);
  const item = items[validIndex];

  // If items change and currentIndex becomes invalid
  useEffect(() => {
      if (currentIndex >= items.length) {
          setCurrentIndex(Math.max(0, items.length - 1));
      }
  }, [items, currentIndex]);

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
          toast.error("Please sign in to unlock content");
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

  if (!item) {
      return (
        <div className="fixed inset-0 bg-black z-[1000] flex items-center justify-center">
            <LoadingSpinner className="w-10 h-10 text-pink-500" />
        </div>
      );
  }

  // Final fix: Return the complete component with the default export
  return (
    <div 
      className={`fixed inset-0 bg-black z-[1000] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
    >
        {/* Autoplay Progress Bar */}
        {isAutoplay && item.type === MediaType.Photo && (
            <div className="absolute top-0 left-0 right-0 h-1 z-[1100] bg-white/10">
                <div 
                    className="h-full bg-pink-500 transition-all duration-100 ease-linear shadow-[0_0_10px_#ec4899]" 
                    style={{ width: `${autoplayProgress}%` }}
                ></div>
            </div>
        )}

        {/* Top Header Bar */}
        <div className={`absolute top-0 inset-x-0 z-[1100] flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button 
                onClick={handleClose}
                className="p-2 text-white/70 hover:text-white bg-black/20 backdrop-blur-md rounded-full transition-colors"
                aria-label="Close"
            >
                <CloseIcon className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isAutoplay ? 'bg-pink-600 text-white shadow-[0_0_10px_#ec4899]' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                    {isAutoplay ? 'Autoplay ON' : 'Autoplay OFF'}
                </button>
                <button 
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isFocusMode ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                    {isFocusMode ? 'Normal View' : 'Focus Mode'}
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col md:flex-row relative overflow-hidden h-full">
            {/* Navigation Buttons (Desktop) */}
            {!isFocusMode && !isZoomed && (
                <>
                    <button 
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all disabled:opacity-0 disabled:pointer-events-none hidden md:block"
                    >
                        <ChevronLeftIcon className="w-8 h-8" />
                    </button>
                    <button 
                        onClick={goToNext}
                        disabled={currentIndex === items.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all disabled:opacity-0 disabled:pointer-events-none hidden md:block"
                    >
                        <ChevronRightIcon className="w-8 h-8" />
                    </button>
                </>
            )}

            {/* Viewer Component */}
            <div 
                className="flex-grow h-full relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={handleDoubleTap}
            >
                <MediaViewer 
                    item={safeItem}
                    isUnlocked={isUnlocked}
                    onUnlockClick={handleUnlockClick}
                    isUnlocking={isWalletLoading}
                    onMediaEnded={handleMediaEnded}
                    onZoomChange={setIsZoomed}
                />
            </div>

            {/* Sidebar (Desktop) */}
            {!isFocusMode && (
                <div className="hidden md:block w-96 h-full border-l border-white/10 bg-black/40 backdrop-blur-md overflow-y-auto custom-scrollbar">
                    <MediaSidebar 
                        item={safeItem}
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
            )}
        </div>

        {/* Mobile Sidebar Trigger / Quick Info */}
        {!isFocusMode && (
            <div className="md:hidden p-4 pb-safe bg-gradient-to-t from-black to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3" onClick={handleAuthorClick}>
                    {safeItem.author_avatar ? (
                        <img src={safeItem.author_avatar} alt={safeItem.author} className="w-8 h-8 rounded-full border border-pink-500" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center font-bold text-white text-xs">
                            {safeItem.author?.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="text-white text-sm font-bold">{safeItem.author}</p>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wider">{safeItem.category}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handleLikeAction} className={isLiked ? 'text-pink-500' : 'text-white'}>
                        <HeartIcon filled={isLiked} className="w-6 h-6" />
                    </button>
                    <button onClick={() => setIsDrawerOpen(true)} className="text-white">
                        <ChatIcon className="w-6 h-6" />
                    </button>
                    <button onClick={handleShareClick} className="text-white">
                        <ShareIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        )}

        {/* Mobile Drawer */}
        {isDrawerOpen && (
            <div className="md:hidden fixed inset-0 z-[1200] flex flex-col animate-slide-up">
                <div className="flex-grow bg-black/50" onClick={() => setIsDrawerOpen(false)}></div>
                <div className="h-[80vh] bg-gray-900 rounded-t-3xl border-t border-white/10 overflow-hidden flex flex-col">
                    <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto my-4 flex-shrink-0" onClick={() => setIsDrawerOpen(false)}></div>
                    <div className="flex-grow overflow-y-auto">
                        <MediaSidebar 
                            item={safeItem}
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

        {/* Popovers & Modals */}
        {shareAnchorEl && (
            <SharePopover 
                item={safeItem}
                anchorEl={shareAnchorEl}
                onClose={closeSharePopover}
            />
        )}

        {isReportModalOpen && (
            <ReportModal 
                onClose={() => setIsReportModalOpen(false)}
                isSubmitting={isReporting}
                onSubmit={async (reason, details) => {
                    if (!session) {
                        toast.error("Please sign in to report content");
                        return;
                    }
                    setIsReporting(true);
                    try {
                        await reportMediaItem({
                            media_id: safeItem.id,
                            reporter_id: session.user.id,
                            reason,
                            details
                        });
                        toast.success("Report submitted successfully");
                        setIsReportModalOpen(false);
                    } catch (e) {
                        toast.error("Failed to submit report");
                    } finally {
                        setIsReporting(false);
                    }
                }}
            />
        )}

        {isTipModalOpen && (
            <TipModal 
                recipientId={safeItem.user_id || ''}
                recipientName={safeItem.author || ''}
                onClose={() => setIsTipModalOpen(false)}
            />
        )}
    </div>
  );
};

export default MediaDetailModal;
