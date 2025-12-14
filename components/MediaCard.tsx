
import React, { useState, useEffect } from 'react';
import { MediaItem, MediaType } from '../types';
import MediaDetailModal from './MediaDetailModal';
import MangaReaderModal from './MangaReaderModal';
import PlayIcon from './icons/PlayIcon';
import ShareIcon from './icons/ShareIcon';
import TrashIcon from './icons/TrashIcon';
import SharePopover from './SharePopover';
import VideoIcon from './icons/VideoIcon';
import LockIcon from './icons/LockIcon';
import HeartIcon from './icons/HeartIcon';
import { Session } from '@supabase/supabase-js';
import { deleteMediaItem, getLikeCount, checkUserLiked, toggleLike } from '../lib/supabaseClient';
import { useConfirm } from '../context/ConfirmationContext';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';

interface MediaCardProps {
  item: MediaItem;
  items: MediaItem[];
  index: number;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session: Session | null;
  onDataChange?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, items, index, onUserClick, session, onDataChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMangaReaderOpen, setIsMangaReaderOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Likes State
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const { confirm } = useConfirm();
  const toast = useToast();
  const { isUnlocked: checkIsUnlocked } = useWallet();

  const isOwner = session?.user.id === item.user_id;
  // Unlock if: Owner, OR Not Premium, OR In user's unlock list
  const isUnlocked = isOwner || !item.is_premium || checkIsUnlocked(item.id); 
  const isStatic = item.id.startsWith('static-') || item.type === MediaType.Manga;

  // Fetch Likes on Mount
  useEffect(() => {
    // We don't fetch likes for static/file-based items as they aren't in the DB properly to have likes
    if (isStatic) return;

    let mounted = true;

    const fetchLikes = async () => {
      const { count } = await getLikeCount(item.id);
      if (mounted) setLikeCount(count);

      if (session) {
        const { isLiked } = await checkUserLiked(item.id, session.user.id);
        if (mounted) setIsLiked(isLiked);
      }
    };

    fetchLikes();

    return () => {
      mounted = false;
    };
  }, [item.id, session, isStatic]);

  const handleCardClick = () => {
      if (item.type === MediaType.Manga) {
          setIsMangaReaderOpen(true);
      } else {
          setIsModalOpen(true);
      }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setIsMangaReaderOpen(false);
  };

  const handleShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShareAnchorEl(e.currentTarget);
  };

  const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isStatic) return; // Static items interact disabled

    if (!session) {
      toast.info("Please sign in to like posts!");
      return;
    }

    // Optimistic UI Update
    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousIsLiked);
    setLikeCount(prev => previousIsLiked ? prev - 1 : prev + 1);

    const { liked, error } = await toggleLike(item.id, session.user.id);

    if (error) {
      // Revert if error
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);
      toast.error("Failed to update like");
    } else {
      // Ensure sync
      setIsLiked(liked);
    }
  };

  const handleQuickDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    const isConfirmed = await confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (!isConfirmed) return;
    
    setIsDeleting(true);
    const { error } = await deleteMediaItem(item.id);
    setIsDeleting(false);

    if (error) {
        toast.error('Failed to delete item: ' + error.message);
    } else {
        toast.success('Post deleted successfully');
        if (onDataChange) onDataChange();
    }
  };

  const closeSharePopover = () => {
    setShareAnchorEl(null);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.user_id && item.author && onUserClick) {
        onUserClick({
            id: item.user_id,
            name: item.author,
            avatar: item.author_avatar || ''
        });
    }
  };

  return (
    <>
      <div 
        className={`group relative overflow-hidden rounded-xl shadow-lg cursor-pointer mb-3 md:mb-6 break-inside-avoid bg-gray-900 border border-gray-800 hover:border-pink-500/50 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10 ${!isImageLoaded ? 'min-h-[200px] animate-pulse-bg' : ''} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={handleCardClick}
      >
        <div className="relative overflow-hidden">
            <img 
            src={item.src} 
            alt={item.description || "Gallery content"} 
            className={`w-full h-auto object-cover block transition-all duration-700 
                ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
                ${!isUnlocked ? 'blur-xl scale-110 brightness-50' : ''}
            `}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            />

            {/* Premium Lock Overlay */}
            {!isUnlocked && isImageLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 p-4">
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-full mb-2 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                        <LockIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <span className="text-yellow-500 font-bold text-sm tracking-wider uppercase drop-shadow-md">Premium</span>
                    <span className="text-white font-bold text-xs mt-1 bg-black/50 px-2 py-0.5 rounded-full border border-gray-700">
                        {item.price ? `${item.price} Coins` : 'Locked'}
                    </span>
                </div>
            )}
        </div>
        
        {/* Type Badge */}
        {item.type === MediaType.Video && isImageLoaded && isUnlocked && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-white/10 z-10">
                <VideoIcon className="w-3 h-3 text-white" />
            </div>
        )}
        {item.type === MediaType.Manga && isImageLoaded && (
            <div className="absolute top-2 left-2 bg-pink-600/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-white/10 z-10">
                <span className="text-[10px] font-bold text-white uppercase">MANGA</span>
            </div>
        )}

        {/* Hover Overlay */}
        {isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
            
            {/* Center Play Button for Videos (Only if unlocked) */}
            {item.type === MediaType.Video && isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300">
                    <PlayIcon className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Bottom Content */}
            <div className="p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {/* Category */}
              {item.category && (
                <span className="inline-block text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    {item.category}
                </span>
              )}
              
              {/* Description */}
              {item.description && (
                <p className={`text-white text-sm font-medium line-clamp-2 leading-snug drop-shadow-md mb-3 ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
                    {item.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  {/* User Info - Clickable */}
                  {item.author && (
                      <div 
                        className="flex items-center gap-2 group/user hover:bg-white/10 rounded-full pr-3 py-1 -ml-1 pl-1 transition-colors"
                        onClick={item.type !== MediaType.Manga ? handleUserClick : undefined}
                      >
                         {item.author_avatar ? (
                             <img src={item.author_avatar} alt={item.author} className="w-5 h-5 rounded-full border border-white/30" />
                         ) : (
                             <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white border border-white/30">
                                 {item.author.charAt(0)}
                             </div>
                         )}
                         <span className="text-xs font-semibold text-gray-300 group-hover/user:text-pink-300 transition-colors truncate max-w-[80px] sm:max-w-[100px]">
                             {item.author}
                         </span>
                      </div>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Like Button (Hidden for static items) */}
                    {!isStatic && (
                      <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
                          isLiked 
                            ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' 
                            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                        }`}
                        aria-label={isLiked ? "Unlike" : "Like"}
                      >
                        <HeartIcon className={`w-3.5 h-3.5 ${isLiked ? 'text-pink-500 scale-110' : ''}`} filled={isLiked} />
                        {likeCount > 0 && (
                          <span className="text-[10px] font-bold">{likeCount}</span>
                        )}
                      </button>
                    )}

                    {isOwner && (
                       <button
                         onClick={handleQuickDelete}
                         className="p-1.5 bg-red-500/20 hover:bg-red-500/80 hover:text-white backdrop-blur-md rounded-full text-red-200 transition-colors border border-red-500/30 shrink-0"
                         aria-label="Delete post"
                         title="Delete"
                       >
                         <TrashIcon className="w-3.5 h-3.5" />
                       </button>
                    )}
                    <button
                        onClick={handleShareClick}
                        className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/10 shrink-0"
                        aria-label="Share media"
                        title="Share"
                    >
                        <ShareIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <MediaDetailModal 
            items={items} 
            initialIndex={index} 
            onClose={closeModal} 
            onUserClick={onUserClick}
            session={session}
            onDataChange={onDataChange}
        />
      )}

      {isMangaReaderOpen && (
          <MangaReaderModal 
            item={item}
            onClose={closeModal}
          />
      )}
      
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