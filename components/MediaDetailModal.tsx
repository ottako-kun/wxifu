
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
  
  // Immersive States
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
      if (!item) {
          onClose();
      }
  }, [item, onClose]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setIsDrawerOpen(false);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsDrawerOpen(false);
    } else {
        setIsAutoplay(false);
    }
  }, [currentIndex, items.length]);

  const handleLikeAction = useCallback(async () => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
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
        autoplayTimerRef.current = setTimeout(goToNext, 6000);
    }
    return () => {
        if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isAutoplay, currentIndex, isVisible, isUnlocked, item?.type, goToNext]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeUp: goToNext,
    onSwipeDown: goToPrevious,
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious
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

  // Enhanced Keyboard Nav
  useKeyboardNav({
    onNext: goToNext,
    onPrev: goToPrevious,
    onEscape: () => {
      if (isDrawerOpen) setIsDrawerOpen(false);
      else handleClose();
    },
    disabled: !item
  });

  // Hotkeys for modal
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

  const handleLikeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleLikeAction();
  };

  const toggleDrawer = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDrawerOpen(!isDrawerOpen);
  };

  if (!item) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-[80] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
    >
        {/* Top Header Bar */}
        <div className={`absolute top-0 inset-x-0 z-[90] flex items-center justify-between p-4 pointer-events-none transition-all duration-500 ${isFocusMode ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{currentIndex + 1} / {items.length}</span>
                </div>
                
                <button 
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    className={`flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border transition-all ${isAutoplay ? 'border-pink-500 text-pink-400' : 'border-white/10 text-white/60'}`}
                >
                    <span className="text-[10px] font-black uppercase tracking-tighter">{isAutoplay ? 'Autoplay On' : 'Autoplay Off'}</span>
                </button>
            </div>
            
            <button 
                onClick={handleClose} 
                className="pointer-events-auto text-white/70 hover:text-white bg-black/40 hover:bg-red-500/80 rounded-full p-2.5 transition-all backdrop-blur-md border border-white/10"
            >
                <CloseIcon className="w-6 h-6"/>
            </button>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className={`hidden md:flex absolute inset-y-0 left-0 w-24 items-center justify-center z-[85] pointer-events-none transition-opacity duration-500 ${isFocusMode ? 'opacity-0' : 'opacity-100'}`}>
            {currentIndex > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
            )}
        </div>
        <div className={`hidden md:flex absolute inset-y-0 right-0 w-24 items-center justify-center z-[85] pointer-events-none transition-opacity duration-500 ${isFocusMode ? 'opacity-0' : 'opacity-100'}`}>
            {currentIndex < items.length - 1 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            )}
        </div>

        {/* Main Content Area */}
        <div 
            className={`relative flex-grow w-full h-full overflow-hidden bg-black transition-all duration-500 ${isDrawerOpen ? 'md:pr-[400px]' : ''}`}
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
            />

            {/* Heart Animation Overlay */}
            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none animate-bounce-in">
                    <HeartIcon filled className="w-32 h-32 text-white drop-shadow-2xl opacity-90" />
                </div>
            )}

            {/* OVERLAY: Bottom Actions */}
            <div className={`absolute inset-0 pointer-events-none flex flex-col justify-end pb-safe transition-all duration-500 ${isDrawerOpen || isFocusMode ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <div className="relative z-10 flex items-end justify-between px-4 pb-8 md:px-12 md:pb-12">
                    <div className="flex-grow max-w-[75%] md:max-w-2xl pointer-events-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="cursor-pointer" onClick={handleAuthorClick}>
                                {item.author_avatar ? (
                                    <img src={item.author_avatar} alt={item.author} className="w-12 h-12 rounded-full border-2 border-pink-500 shadow-xl" />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {item.author?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-xl leading-none cursor-pointer hover:underline" onClick={handleAuthorClick}>
                                    {item.author}
                                </h2>
                                {!isOwner && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                                        className="text-[11px] font-bold text-pink-400 hover:text-white transition-colors uppercase tracking-widest mt-1"
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
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
                                onClick={handleLikeClick}
                                className={`p-4 rounded-full backdrop-blur-xl border transition-all active:scale-90 ${isLiked ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                            >
                                <HeartIcon filled={isLiked} className="w-7 h-7 md:w-8 md:h-8" />
                            </button>
                            <span className="text-xs font-black text-white drop-shadow-lg">{likeCount}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                            <button 
                                onClick={toggleDrawer}
                                className="p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
                            >
                                <ChatIcon className="w-7 h-7 md:w-8 md:h-8" />
                            </button>
                        </div>

                        {!isOwner && session && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }}
                                className="p-4 rounded-full bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 transition-all active:scale-90"
                             >
                                 <GiftIcon className="w-6 h-6 md:w-7 md:h-7" />
                             </button>
                        )}

                        <button 
                            onClick={handleShareClick}
                            className="p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
                        >
                            <ShareIcon className="w-6 h-6 md:w-7 md:h-7" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SLIDING DRAWER --- */}
        {isDrawerOpen && (
            <div 
                className="absolute inset-0 z-[85] bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
                onClick={() => setIsDrawerOpen(false)}
            >
                <div 
                    className="absolute bottom-0 md:top-0 md:right-0 w-full md:w-[400px] h-[75vh] md:h-full bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-white/10 rounded-t-3xl md:rounded-none flex flex-col shadow-2xl animate-slide-up md:animate-slide-in-right overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="md:hidden w-full flex justify-center pt-3 pb-2" onClick={() => setIsDrawerOpen(false)}>
                        <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <h3 className="text-white font-black text-lg uppercase tracking-widest font-orbitron">Metadata</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-white/40 hover:text-white transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto">
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
