import React, { useState, useEffect, useCallback } from 'react';
import { MediaItem, MediaType } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ShareIcon from './icons/ShareIcon';
import SharePopover from './SharePopover';


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
    setShareAnchorEl(e.currentTarget);
  };

  const closeSharePopover = () => {
    setShareAnchorEl(null);
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

  // Preload next and previous images for a smoother experience
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
      className={`fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-0 md:p-4 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-title"
    >
      <div 
        className={`bg-gray-900 border border-gray-800 rounded-none md:rounded-xl shadow-2xl w-full max-w-[90vw] h-full md:h-[90vh] flex flex-col md:flex-row overflow-hidden transition-all duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Container */}
        <div className="relative w-full md:w-[75%] h-[60%] md:h-full flex items-center justify-center bg-black">
          <div key={item.id} className="w-full h-full animate-fade-in flex items-center justify-center">
            {isPhoto ? (
              <div className="w-full h-full overflow-hidden flex items-center justify-center">
                <img 
                  src={item.src} 
                  alt={item.description || 'Full screen view'} 
                  className={`max-h-full max-w-full object-contain select-none ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={handleZoomClick}
                  style={zoomStyle}
                  draggable={false}
                />
              </div>
            ) : (
              <div className="w-full h-full relative">
                <iframe 
                  src={item.videoSrc}
                  allow="autoplay"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-[25%] h-[40%] md:h-full flex flex-col bg-gray-900 border-l border-gray-800">
          <div className="p-6 flex-grow overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-x-3 mb-6 border-b border-gray-800 pb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                OK
              </div>
              <h2 id="media-title" className="text-xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                  OTTAKO-KUN
              </h2>
            </div>
            
            <div className="mb-2">
               <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">Description</span>
            </div>
             <div className="prose prose-invert prose-sm prose-p:text-gray-300 prose-p:leading-relaxed">
               <p>{item.description || 'No description available.'}</p>
             </div>
          </div>

          <div className="p-6 bg-gray-800/50 border-t border-gray-800">
            <button
              onClick={handleShareClick}
              className="w-full flex items-center justify-center gap-x-2 px-4 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-all duration-200 font-bold tracking-wide shadow-lg shadow-pink-900/20"
            >
              <ShareIcon className="w-5 h-5" />
              <span>SHARE</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
        disabled={currentIndex === 0}
        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-pink-500 rounded-full p-3 transition-all z-50 disabled:opacity-0 disabled:cursor-not-allowed backdrop-blur-sm"
        aria-label="Previous item"
      >
        <ChevronLeftIcon className="w-8 h-8"/>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        disabled={currentIndex >= items.length - 1}
        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-pink-500 rounded-full p-3 transition-all z-50 disabled:opacity-0 disabled:cursor-not-allowed backdrop-blur-sm"
        aria-label="Next item"
      >
        <ChevronRightIcon className="w-8 h-8"/>
      </button>
      
      <button 
        onClick={handleClose} 
        className="absolute top-4 right-4 text-white/70 hover:text-white z-50 bg-black/40 hover:bg-red-500 rounded-full p-2 transition-colors backdrop-blur-sm"
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