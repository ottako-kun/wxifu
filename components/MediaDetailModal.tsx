import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, MediaType } from '../types';
import { deleteMediaItem, updateMediaItem } from '../lib/supabaseClient';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ShareIcon from './icons/ShareIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import LockIcon from './icons/LockIcon';
import SharePopover from './SharePopover';
import { APP_CONFIG } from '../gallery-data';
import { Session } from '@supabase/supabase-js';
import CommentSection from './CommentSection';
import { useConfirm } from '../context/ConfirmationContext';
import { useToast } from '../context/ToastContext';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Touch handling state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const item = items[currentIndex];
  const isPhoto = item.type === MediaType.Photo;
  const isOwner = session?.user.id === item.user_id;
  
  // Hooks
  const { confirm } = useConfirm();
  const toast = useToast();
  
  // Premium Logic (Placeholder for future purchase logic)
  const isUnlocked = isOwner || !item.is_premium;

  // Initialize edit state when item changes
  useEffect(() => {
    setEditDesc(item.description || '');
    setEditCategory(item.category || '');
    setEditTags(item.tags ? item.tags.join(', ') : '');
    setIsEditing(false);
  }, [item]);

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
      toast.info("Payment System Integration Coming Soon! This will allow users to purchase 'Otaku Coins' to unlock premium content.");
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
    if (!isUnlocked) return; // Disable zoom on locked content

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

  // Owner Actions
  const handleDelete = async () => {
      const isConfirmed = await confirm({
          title: 'Delete Post',
          message: 'Are you sure you want to delete this post? This action cannot be undone.',
          confirmText: 'Delete',
          variant: 'danger'
      });

      if (!isConfirmed) return;

      setIsSaving(true);
      const { error } = await deleteMediaItem(item.id);
      setIsSaving(false);
      
      if (error) {
          toast.error('Failed to delete item: ' + error.message);
      } else {
          toast.success('Post deleted');
          if (onDataChange) onDataChange();
          handleClose();
      }
  };

  const handleUpdate = async () => {
      setIsSaving(true);
      const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const { error } = await updateMediaItem(item.id, {
          description: editDesc,
          category: editCategory,
          tags: tagsArray
      });
      setIsSaving(false);

      if (error) {
          toast.error('Failed to update: ' + error.message);
      } else {
          setIsEditing(false);
          // Manually update local item for immediate feedback if we don't reload whole grid
          item.description = editDesc;
          item.category = editCategory;
          item.tags = tagsArray;
          toast.success('Post updated');
          if (onDataChange) onDataChange();
      }
  };

  // Keyboard Navigation
  useEffect(() => {
    setIsVisible(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return; // Disable nav while editing
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
  }, [goToNext, goToPrevious, handleClose, isEditing]);

  // Touch Navigation Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (isEditing) return;
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
            className="relative w-full md:w-[70%] lg:w-[75%] h-[50%] md:h-full flex items-center justify-center bg-black/40"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
          <div key={item.id} className="w-full h-full animate-fade-in flex items-center justify-center p-0 md:p-4">
            
            {/* Locked Content Overlay */}
            {!isUnlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
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
              <div className="w-full h-full overflow-hidden flex items-center justify-center relative">
                <img 
                  src={item.src} 
                  alt={item.description || 'Full screen view'} 
                  className={`max-h-full max-w-full object-contain select-none transition-transform duration-200 
                      ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}
                      ${!isUnlocked ? 'blur-2xl opacity-50' : ''}
                  `}
                  onClick={handleZoomClick}
                  style={zoomStyle}
                  draggable={false}
                />
              </div>
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
           <div className="absolute inset-x-4 top-1/2 flex justify-between pointer-events-none md:hidden opacity-0">
               <ChevronLeftIcon className="w-8 h-8 text-white/20" />
               <ChevronRightIcon className="w-8 h-8 text-white/20" />
           </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-[30%] lg:w-[25%] h-[50%] md:h-full flex flex-col bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 relative z-10">
          <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col">
            
            {/* Header: Brand or Author */}
            <div className="p-6 md:p-8 pb-4">
                <div className="flex items-center gap-x-4 mb-6 border-b border-gray-800 pb-6 justify-between">
                <div className="flex items-center gap-x-4">
                    <div className="cursor-pointer group" onClick={handleAuthorClick}>
                        {item.author_avatar ? (
                            <img src={item.author_avatar} alt={item.author} className="w-12 h-12 rounded-full border border-pink-500 shadow-lg object-cover" />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg border border-white/10">
                                {item.author?.charAt(0) || APP_CONFIG.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h2 
                            id="media-title" 
                            className="text-lg font-bold text-white tracking-widest leading-none mb-1.5 font-orbitron truncate cursor-pointer hover:text-pink-400 transition-colors"
                            onClick={handleAuthorClick}
                        >
                            {item.author || APP_CONFIG.name}
                        </h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">{item.author ? 'Artist / Uploader' : 'Gallery Viewer'}</p>
                    </div>
                </div>
                
                {/* Owner Controls */}
                {isOwner && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEditing(!isEditing)} 
                            className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                            title="Edit Post"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Post"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                </div>
                
                {isEditing ? (
                    <div className="space-y-4 animate-fade-in mb-6">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500">Description</label>
                            <textarea 
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500">Category</label>
                            <input 
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500">Tags (comma separated)</label>
                            <input 
                                value={editTags}
                                onChange={(e) => setEditTags(e.target.value)}
                                className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                        <button 
                            onClick={handleUpdate}
                            disabled={isSaving}
                            className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded text-xs uppercase tracking-wider disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">Info</span>
                        {item.category && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-pink-500/30 bg-pink-500/10 text-pink-300 uppercase shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                            {item.category}
                            </span>
                        )}
                        </div>
                        <div className="prose prose-invert prose-sm prose-p:text-gray-300 prose-p:font-light prose-p:leading-relaxed mb-6">
                            <p>{item.description || 'No description available for this artwork.'}</p>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                        <div className="mb-8">
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
                    </>
                )}
            </div>

            {/* Comments Section - Added Here */}
            <div className="flex-grow px-6 pb-4">
                <CommentSection mediaId={item.id} session={session} />
            </div>

          </div>

          <div className="p-6 bg-black/20 border-t border-gray-800 backdrop-blur-sm flex-shrink-0">
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