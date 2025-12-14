
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MediaItem, MediaType } from '../types';
import { reportMediaItem } from '../lib/supabaseClient';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import LockIcon from './icons/LockIcon';
import SharePopover from './SharePopover';
import ReportModal from './ReportModal';
import { Session } from '@supabase/supabase-js';
import { useToast } from '../context/ToastContext';
import ZoomableImage from './ZoomableImage';
import MediaSidebar from './MediaSidebar';

interface MediaDetailModalProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session: Session | null;
  onDataChange?: () => void; // Callback to refresh data after edit/delete
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ items, initialIndex, onClose, onUserClick, session, onDataChange }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  
  // Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const item = items[currentIndex];
  const isPhoto = item.type === MediaType.Photo;
  const isOwner = session?.user.id === item.user_id;
  
  // Hooks
  const toast = useToast();
  
  // Premium Logic
  const isUnlocked = isOwner || !item.is_premium;

  // Swipe logic vars
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  // Calculate Related Items (Simple Algorithm: Same Category or Tag overlap)
  const relatedItems = useMemo(() => {
      // 1. Filter items excluding current
      const candidates = items.filter(i => i.id !== item.id);
      
      // 2. Score them
      const scored = candidates.map(c => {
          let score = 0;
          if (c.category === item.category) score += 2;
          if (c.user_id === item.user_id) score += 1;
          const sharedTags = c.tags?.filter(t => item.tags?.includes(t)).length || 0;
          score += sharedTags * 2;
          return { item: c, score };
      });

      // 3. Sort by score and take top 6
      return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(s => s.item);
  }, [item, items]);


  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex < items.length - 1 ? prevIndex + 1 : prevIndex));
  }, [items.length]);

  const handleRelatedClick = (relatedId: string) => {
      const index = items.findIndex(i => i.id === relatedId);
      if (index !== -1) setCurrentIndex(index);
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Corresponds to transition duration
  }, [onClose]);
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareAnchorEl(e.currentTarget as HTMLElement);
  };

  const closeSharePopover = () => {
    setShareAnchorEl(null);
  };
  
  const handleAuthorClick = () => {
      if (item.author && item.user_id && onUserClick) {
          handleClose();
          setTimeout(() => {
             onUserClick({
                 id: item.user_id!,
                 name: item.author!,
                 avatar: item.author_avatar || ''
             });
          }, 300);
      }
  };

  const handleUnlockClick = () => {
      toast.info("Payment System Integration Coming Soon!");
  };

  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  // --- REPORTING ---
  const handleReportSubmit = async (reason: string, details: string) => {
      if (!session) {
          toast.error("You must be logged in to report.");
          return;
      }
      setIsReporting(true);
      const { error } = await reportMediaItem({
          media_id: item.id,
          reporter_id: session.user.id,
          reason,
          details
      });
      setIsReporting(false);
      setIsReportModalOpen(false);
      if (error) {
          toast.error("Failed to submit report.");
      } else {
          toast.success("Report submitted. Thank you for keeping the community safe.");
      }
  };

  // Keyboard Navigation
  useEffect(() => {
    setIsVisible(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrevious, handleClose]);

  // Handle Swipe Navigation logic (mostly for mobile, passed to container)
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;
      const distance = touchStartX.current - touchEndX.current;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe && currentIndex < items.length - 1) {
          goToNext();
      } else if (isRightSwipe && currentIndex > 0) {
          goToPrevious();
      }
      touchStartX.current = null;
      touchEndX.current = null;
  };


  return (
    <div 
      className={`fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-0 md:p-6 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-title"
    >
      <div 
        className={`bg-gray-900/90 border border-gray-800 rounded-none md:rounded-3xl shadow-2xl w-full max-w-[95vw] h-full md:h-[90vh] flex flex-col md:flex-row overflow-hidden transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Container */}
        <div 
            className="relative w-full md:w-[70%] lg:w-[75%] h-[50%] md:h-full flex items-center justify-center bg-black/40 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
          <div key={item.id} className="w-full h-full animate-fade-in flex items-center justify-center p-0 md:p-4">
            
            {/* Locked Content Overlay */}
            {!isUnlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(234,179,8,0.2)] max-w-sm mx-4">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50">
                            <LockIcon className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider font-orbitron">Premium Content</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Unlock this exclusive post from <span className="text-pink-400 font-bold">{item.author}</span>.
                        </p>
                        <button 
                            onClick={handleUnlockClick}
                            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black uppercase tracking-wider rounded-lg shadow-lg transform transition-transform hover:-translate-y-0.5"
                        >
                            Unlock for {item.price || 5} Coins
                        </button>
                    </div>
                </div>
            )}

            {isPhoto ? (
              <ZoomableImage 
                src={item.src} 
                alt={item.description || 'Full screen view'} 
                isUnlocked={isUnlocked} 
              />
            ) : (
              <div className="w-full h-full relative flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                {isUnlocked ? (
                    isDirectVideo(item.videoSrc) ? (
                    <video 
                        src={item.videoSrc}
                        controls
                        autoPlay
                        playsInline
                        className="max-w-full max-h-full outline-none"
                    />
                    ) : (
                    <iframe 
                        src={item.videoSrc}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                    />
                    )
                ) : (
                    <img 
                        src={item.src} 
                        className="w-full h-full object-cover blur-xl opacity-30" 
                    />
                )}
              </div>
            )}
          </div>
          
           {/* Mobile Swipe Indicators (Hint) */}
           <div className={`absolute inset-x-4 top-1/2 flex justify-between pointer-events-none md:hidden`}>
               <ChevronLeftIcon className="w-8 h-8 text-white/20" />
               <ChevronRightIcon className="w-8 h-8 text-white/20" />
           </div>
        </div>

        {/* Sidebar */}
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
      
      {/* Desktop Navigation Buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
        disabled={currentIndex === 0}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/30 hover:bg-black/80 border border-transparent hover:border-gray-700 rounded-full p-4 transition-all z-50 disabled:opacity-0 disabled:cursor-not-allowed backdrop-blur-sm group shadow-2xl"
        aria-label="Previous item"
      >
        <ChevronLeftIcon className="w-8 h-8 group-hover:-translate-x-1 transition-transform"/>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        disabled={currentIndex >= items.length - 1}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/30 hover:bg-black/80 border border-transparent hover:border-gray-700 rounded-full p-4 transition-all z-50 disabled:opacity-0 disabled:cursor-not-allowed backdrop-blur-sm group shadow-2xl"
        aria-label="Next item"
      >
        <ChevronRightIcon className="w-8 h-8 group-hover:translate-x-1 transition-transform"/>
      </button>
      
      {/* Close Button */}
      <button 
        onClick={handleClose} 
        className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white bg-black/50 hover:bg-red-500/80 rounded-full p-2.5 transition-all backdrop-blur-md shadow-lg"
        aria-label="Close"
      >
          <CloseIcon className="w-6 h-6"/>
      </button>

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
    </div>
  );
};

export default MediaDetailModal;
