import React, { useState } from 'react';
import { MediaItem, MediaType } from '../types';
import MediaDetailModal from './MediaDetailModal';
import PlayIcon from './icons/PlayIcon';
import ShareIcon from './icons/ShareIcon';
import SharePopover from './SharePopover';
import VideoIcon from './icons/VideoIcon';

interface MediaCardProps {
  item: MediaItem;
  items: MediaItem[];
  index: number;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, items, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShareAnchorEl(e.currentTarget);
  };

  const closeSharePopover = () => {
    setShareAnchorEl(null);
  };

  return (
    <>
      <div 
        className={`group relative overflow-hidden rounded-xl shadow-lg cursor-pointer mb-3 md:mb-6 break-inside-avoid bg-gray-900 border border-gray-800 hover:border-pink-500/50 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10 ${!isImageLoaded ? 'min-h-[200px] animate-pulse-bg' : ''}`}
        onClick={openModal}
      >
        <img 
          src={item.src} 
          alt={item.description || "Gallery content"} 
          className={`w-full h-auto object-cover block transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Type Badge (Always visible if video) */}
        {item.type === MediaType.Video && isImageLoaded && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-white/10 z-10">
                <VideoIcon className="w-3 h-3 text-white" />
            </div>
        )}

        {/* Hover Overlay */}
        {isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
            
            {/* Center Play Button for Videos */}
            {item.type === MediaType.Video && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                    <PlayIcon className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Bottom Content */}
            <div className="p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                     {item.category && (
                        <span className="inline-block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                            {item.category}
                        </span>
                     )}
                     {item.description && (
                        <p className="text-white text-sm font-medium line-clamp-2 leading-snug drop-shadow-md">
                            {item.description}
                        </p>
                     )}
                  </div>
                  
                  <button
                    onClick={handleShareClick}
                    className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/10 shrink-0"
                    aria-label="Share media"
                    title="Share"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isModalOpen && <MediaDetailModal items={items} initialIndex={index} onClose={closeModal} />}
      
      {shareAnchorEl && (
        <SharePopover
          item={item}
          onClose={closeSharePopover}
          anchorEl={shareAnchorEl}
        />
      )}
    </>
  );
};

export default MediaCard;
