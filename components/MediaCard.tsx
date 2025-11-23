import React, { useState } from 'react';
import { MediaItem, MediaType } from '../types';
import MediaDetailModal from './MediaDetailModal';
import PlayIcon from './icons/PlayIcon';
import ShareIcon from './icons/ShareIcon';
import SharePopover from './SharePopover';

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
        className={`group relative overflow-hidden rounded-lg shadow-lg cursor-pointer mb-2 md:mb-4 break-inside-avoid bg-gray-800 transition-transform duration-300 ease-in-out hover:scale-105 ${!isImageLoaded ? 'animate-pulse-bg min-h-48' : ''}`}
        onClick={openModal}
      >
        <img 
          src={item.src} 
          alt={item.description || "Gallery content"} 
          className={`w-full h-auto object-cover block transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsImageLoaded(true)}
        />
        {isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            {item.type === MediaType.Video && (
              <PlayIcon className="w-16 h-16 text-white/90 drop-shadow-lg" />
            )}
            {item.description && (
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white text-sm line-clamp-2">{item.description}</p>
              </div>
            )}
            <button
              onClick={handleShareClick}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
              aria-label="Share media"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
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