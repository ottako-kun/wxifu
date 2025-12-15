
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, MediaType } from '../types';
import { reportMediaItem } from '../lib/supabaseClient';
import CloseIcon from './icons/CloseIcon';
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
  
  // Drawer / UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  // Retrieve current item safely
  const item = items[currentIndex];

  // Create a safe fallback item to prevent hooks from crashing if 'item' is undefined
  // This can happen if the items list changes or index is out of bounds
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
  
  // Hooks must be called unconditionally
  const toast = useToast();
  const relatedItems = useRelatedMedia(safeItem, items);
  const { unlockContent, isUnlocked: checkIsUnlocked, isLoading: isWalletLoading } = useWallet();
  const { isLiked, likeCount, toggleLike } = useMediaLikes(safeItem.id, session?.user.id, (safeItem.id || '').startsWith('static'));
  const { isFollowing, toggleFollow } = useFollow(session?.user.id, safeItem.user_id || '');
  
  // Premium Logic
  const isUnlocked = isOwner || !safeItem.is_premium || checkIsUnlocked(safeItem.id);

  // Swipe logic vars (Vertical)
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Close if item is missing (e.g. data refresh filtered it out)
  useEffect(() => {
      if (!item) {
          onClose();
      }
  }, [item, onClose]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex < items.length - 1 ? prevIndex + 1 : prevIndex));
  }, [items.length]);

  const handleRelatedClick = (relatedId: string) => {
      const index = items.findIndex(i => i.id === relatedId);
      if (index !== -1) setCurrentIndex(index);
      setIsDrawerOpen(false); // Close drawer on nav
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  
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

  const handleUnlockClick = async () => {
      if (!session) {
          toast.error("Please login to unlock content");
          return;
      }
      await unlockContent(safeItem.id, safeItem.price || 0, safeItem.user_id);
  };

  // --- REPORTING ---
  const handleReportSubmit = async (reason: string, details: string) => {
      if (!session) {
          toast.error("You must be logged in to report.");
          return;
      }
      setIsReporting(true);
      const { error } = await reportMediaItem({
          media_id: safeItem.id,
          reporter_id: session.user.id,
          reason,
          details
      });
      setIsReporting(false);
      setIsReportModalOpen(false);
      if (error) {
          toast.error("Failed to submit report.");
      } else {
          toast.success("Report submitted.");
      }
  };

  // Keyboard Navigation & Scroll Lock
  useEffect(() => {
    if (!item) return; // Don't setup listeners if item is missing

    setIsVisible(true);
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowUp') {
        goToPrevious();
      } else if (e.key === 'Escape') {
        if (isDrawerOpen) setIsDrawerOpen(false);
        else handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll
      document.body.style.overflow = '';
    };
  }, [goToNext, goToPrevious, handleClose, isDrawerOpen, item]);

  // Vertical Swipe Logic
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
      if (!touchStartY.current || !touchEndY.current) return;
      const distance = touchStartY.current - touchEndY.current;
      const isSwipeUp = distance > minSwipeDistance;
      const isSwipeDown = distance < -minSwipeDistance;

      if (isSwipeUp && currentIndex < items.length - 1) {
          goToNext();
      } else if (isSwipeDown && currentIndex > 0) {
          goToPrevious();
      }
      touchStartY.current = null;
      touchEndY.current = null;
  };

  const handleLikeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleLike();
  };

  const toggleDrawer = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDrawerOpen(!isDrawerOpen);
  };

  // If item is really missing, don't render content (useEffect will close it)
  if (!item) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black z-[80] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
    >
        {/* Close Button (Absolute Top Right) */}
        <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 z-[90] text-white/70 hover:text-white bg-black/20 hover:bg-red-500/80 rounded-full p-2.5 transition-all backdrop-blur-md"
        >
            <CloseIcon className="w-6 h-6"/>
        </button>

        {/* Main Content Area */}
        <div className="relative flex-grow w-full h-full overflow-hidden bg-black">
            
            {/* Media Viewer */}
            <MediaViewer 
                item={item}
                isUnlocked={isUnlocked}
                onUnlockClick={handleUnlockClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                isUnlocking={isWalletLoading}
            />

            {/* OVERLAY: Bottom Gradient Info & Actions */}
            <div className={`absolute inset-0 pointer-events-none flex flex-col justify-end pb-safe transition-opacity duration-300 ${isDrawerOpen ? 'opacity-0' : 'opacity-100'}`}>
                {/* Gradient Shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                
                <div className="relative z-10 flex items-end justify-between px-4 pb-6 md:px-8 md:pb-8">
                    {/* Left: Info */}
                    <div className="flex-grow max-w-[80%] md:max-w-2xl pointer-events-auto pr-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="cursor-pointer" onClick={handleAuthorClick}>
                                {item.author_avatar ? (
                                    <img src={item.author_avatar} alt={item.author} className="w-10 h-10 rounded-full border border-pink-500 shadow-lg" />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {item.author?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg leading-none cursor-pointer hover:underline" onClick={handleAuthorClick}>
                                    {item.author}
                                </h2>
                                {!isOwner && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFollow(item.author || ''); }}
                                        className="text-[10px] font-bold text-pink-400 hover:text-white transition-colors uppercase tracking-wider"
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-200 text-sm md:text-base line-clamp-2 md:line-clamp-none mb-2 drop-shadow-md">
                            {item.description}
                        </p>
                        
                        {item.tags && (
                            <div className="flex flex-wrap gap-2 opacity-80">
                                {item.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-xs font-bold text-white/80">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Floating Actions */}
                    <div className="flex flex-col gap-4 pointer-events-auto items-center pb-2">
                        {/* Like */}
                        <div className="flex flex-col items-center gap-1">
                            <button 
                                onClick={handleLikeClick}
                                className={`p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all active:scale-90 ${isLiked ? 'text-pink-500' : 'text-white hover:bg-white/10'}`}
                            >
                                <HeartIcon filled={isLiked} className="w-7 h-7 md:w-8 md:h-8" />
                            </button>
                            <span className="text-xs font-bold text-white drop-shadow-md">{likeCount}</span>
                        </div>

                        {/* Comment/Details Toggle */}
                        <div className="flex flex-col items-center gap-1">
                            <button 
                                onClick={toggleDrawer}
                                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90"
                            >
                                <ChatIcon className="w-7 h-7 md:w-8 md:h-8" />
                            </button>
                            <span className="text-xs font-bold text-white drop-shadow-md">More</span>
                        </div>

                        {/* Gift (if not owner) */}
                        {!isOwner && session && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); setIsTipModalOpen(true); }}
                                className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-yellow-400 hover:bg-white/10 transition-all active:scale-90"
                             >
                                 <GiftIcon className="w-6 h-6 md:w-7 md:h-7" />
                             </button>
                        )}

                        {/* Share */}
                        <button 
                            onClick={handleShareClick}
                            className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all active:scale-90 mt-2"
                        >
                            <ShareIcon className="w-6 h-6 md:w-7 md:h-7" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SLIDING DRAWER (Comments & Details) --- */}
        {isDrawerOpen && (
            <div 
                className="absolute inset-0 z-[85] bg-black/50 backdrop-blur-sm"
                onClick={() => setIsDrawerOpen(false)}
            >
                {/* Mobile: Bottom Sheet | Desktop: Right Panel */}
                <div 
                    className="absolute bottom-0 md:top-0 md:right-0 w-full md:w-[400px] h-[70vh] md:h-full bg-gray-900 border-t md:border-t-0 md:border-l border-gray-800 rounded-t-3xl md:rounded-none flex flex-col shadow-2xl animate-slide-up md:animate-slide-in-right overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drawer Handle (Mobile) */}
                    <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setIsDrawerOpen(false)}>
                        <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <h3 className="text-white font-bold text-lg">Comments & Info</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white">
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
                onSubmit={handleReportSubmit}
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
