import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, MediaType } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ShareIcon from './icons/ShareIcon';
import SharePopover from './SharePopover';
import { APP_CONFIG } from '../gallery-data';

interface MediaDetailModalProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ items, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  
  // Touch handling state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const item = items[currentIndex];
  const isPhoto = item.type === MediaType.Photo;

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex < items.length - 1 ? prevIndex + 1 : prevIndex));
  }, [items.length]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Corresponds to transition duration
  }, [onClose]);
  
  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent modal close
    setShareAnchorEl(e.currentTarget);
  };

  const closeSharePopover = () => {
    setShareAnchorEl(null);
  };

  // Check if the video URL is a direct file (MP4, WEBM, etc.) or an embed (YouTube, Drive, etc.)
  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  // Reset zoom state when navigating between media items
  useEffect(() => {
    setIsZoomed(false);
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center center',
    });
  }, [currentIndex]);

  const handleZoomClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (isZoomed) {
      setIsZoomed(false);
      setZoomStyle({
        transform: 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.3s ease-out'
      });
    } else {
      const img = e.currentTarget;
      const { left, top, width, height } = img.getBoundingClientRect();
      
      const originX = ((e.clientX - left) / width) * 100;
      const originY = ((e.clientY - top) / height) * 100;
      
      setIsZoomed(true);
      setZoomStyle({
        transform: 'scale(2.5)',
        transformOrigin: `${originX}% ${originY}%`,
        transition: 'transform 0.3s ease-out'
      });
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    setIsVisible(true);

    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Touch Navigation Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < items.length - 1) {
        goToNext();
    } else if (isRightSwipe && currentIndex > 0) {
        goToPrevious();
    }
  };

  // Preload next and previous images
  useEffect(() => {
    if (currentIndex < items.length - 1) {
      const nextItem = items[currentIndex + 1];
      if (nextItem.type === MediaType.Photo) {
        const img = new Image();
        img.src = nextItem.src;
      }
    }
    if (currentIndex > 0) {
      const prevItem = items[currentIndex - 1];
      if (prevItem.type === MediaType.Photo) {
        const img = new Image();
        img.src = prevItem.src;
      }
    }
  }, [currentIndex, items]);

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
        {/* Media Container - Handles Swipes */}
        <div 
            className="relative w-full md:w-[70%] lg:w-[75%] h-[60%] md:h-full flex items-center justify-center bg-black/40"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
          <div key={item.id} className="w-full h-full animate-fade-in flex items-center justify-center p-0 md:p-4">
            {isPhoto ? (
              <div className="w-full h-full overflow-hidden flex items-center justify-center relative">
                <img 
                  src={item.src} 
                  alt={item.description || 'Full screen view'} 
                  className={`max-h-full max-w-full object-contain select-none transition-transform duration-200 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={handleZoomClick}
                  style={zoomStyle}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                {isDirectVideo(item.videoSrc) ? (
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
                )}
              </div>
            )}
          </div>
          
           {/* Mobile Swipe Indicators (Hint) */}
           <div className="absolute inset-x-4 top-1/2 flex justify-between pointer-events-none md:hidden opacity-0">
               <ChevronLeftIcon className="w-8 h-8 text-white/20" />
               <ChevronRightIcon className="w-8 h-8 text-white/20" />
           </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-[30%] lg:w-[25%] h-[40%] md:h-full flex flex-col bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 relative z-10">
          <div className="p-6 md:p-8 flex-grow overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-x-4 mb-8 border-b border-gray-800 pb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-base border border-white/10">
                {APP_CONFIG.name.substring(0,2)}
              </div>
              <div>
                  <h2 id="media-title" className="text-xl font-bold text-white tracking-widest uppercase leading-none mb-1.5 font-orbitron">
                      {APP_CONFIG.name}
                  </h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Gallery Viewer</p>
              </div>
            </div>
            
            <div className="mb-4 flex items-center justify-between">
               <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">Info</span>
               {item.category && (
                 <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-pink-500/30 bg-pink-500/10 text-pink-300 uppercase shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                   {item.category}
                 </span>
               )}
            </div>
             <div className="prose prose-invert prose-sm prose-p:text-gray-300 prose-p:font-light prose-p:leading-relaxed mb-8">
               <p>{item.description || 'No description available for this artwork.'}</p>
             </div>

             {item.tags && item.tags.length > 0 && (
               <div>
                 <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-3">Tags</span>
                 <div className="flex flex-wrap gap-2">
                   {item.tags.map(tag => (
                     <span key={tag} className="text-xs text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-default">
                       #{tag}
                     </span>
                   ))}
                 </div>
               </div>
             )}
          </div>

          <div className="p-6 bg-black/20 border-t border-gray-800 backdrop-blur-sm">
            <button
              onClick={handleShareClick}
              className="w-full group flex items-center justify-center gap-x-2 px-4 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white transition-all duration-300 font-bold tracking-wide shadow-lg shadow-pink-900/20 hover:shadow-pink-500/30 transform hover:-translate-y-0.5 border border-white/10"
            >
              <ShareIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>SHARE THIS</span>
            </button>
          </div>
        </div>
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
    </div>
  );
};

export default MediaDetailModal;