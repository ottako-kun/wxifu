
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MediaItem, MediaType, Session } from '../types';
import { cn, DEFAULT_THUMB_URL } from '../lib/utils';
import { buttonVariants, cardVariants, spacing, transitions } from '../lib/designTokens';
import PlayIcon from './icons/PlayIcon';
import ShareIcon from './icons/ShareIcon';
import TrashIcon from './icons/TrashIcon';
import SharePopover from './SharePopover';
import VideoIcon from './icons/VideoIcon';
import HeartIcon from './icons/HeartIcon';
// Fixed: Import Session from local types
import { deleteMediaItem } from '../lib/supabaseClient';
import { useConfirm } from '../context/ConfirmationContext';
import { useToast } from '../context/ToastContext';
import { useMediaLikes } from '../hooks/useMediaLikes';
import { useDoubleTap } from '../hooks/useDoubleTap';

// --- Sub-Components ---

const MediaBadges: React.FC<{ type: MediaType }> = ({ type }) => (
  <div className={cn("absolute top-2 right-2 flex gap-1 z-20", spacing.gap2)}>
    {type === MediaType.Video && (
      <div className={cn(
        "bg-black/60 backdrop-blur-md flex items-center gap-1",
        "rounded-lg px-2 py-1 border border-white/10"
      )}>
        <VideoIcon className="w-3 h-3 text-white" />
        <span className="text-[10px] font-bold text-white uppercase">Video</span>
      </div>
    )}
  </div>
);

const MobileOverlay: React.FC<{
  author: string;
  avatar?: string;
  isLiked: boolean;
  likeCount: number;
  onLike: (e: React.MouseEvent) => void;
}> = ({ author, avatar, isLiked, likeCount, onLike }) => (
  <div className="md:hidden absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-3 px-3 flex items-end justify-between z-20">
    <div className={cn("flex items-center gap-2 max-w-[70%]", spacing.gap2)}>
      {avatar ? (
        <img src={avatar} className="w-6 h-6 rounded-full border border-white/30" alt={author} />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/30">
          {author.charAt(0)}
        </div>
      )}
      <div className="flex flex-col truncate">
        <span className="text-[10px] font-bold text-gray-200 truncate leading-none">{author}</span>
      </div>
    </div>
    <button 
      onClick={onLike} 
      className={cn(
        "flex flex-col items-center justify-center text-white min-h-[48px] min-w-[48px]",
        "active:scale-90 transition-transform"
      )}
      aria-label={isLiked ? `Unlike ${author}'s post` : `Like ${author}'s post`}
    >
      <HeartIcon filled={isLiked} className={`w-5 h-5 ${isLiked ? 'text-pink-500' : 'text-white'}`} />
      {likeCount > 0 && <span className="text-[9px] font-bold mt-0.5">{likeCount}</span>}
    </button>
  </div>
);

const DesktopOverlay: React.FC<{
  item: MediaItem;
  isLiked: boolean;
  isOwner: boolean;
  onUserClick: (e: React.MouseEvent) => void;
  onLike: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}> = ({ item, isLiked, isOwner, onUserClick, onLike, onDelete, onShare }) => (
  <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-4 z-20">
    {item.type === MediaType.Video && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transform scale-90 group-hover:scale-110 transition-transform duration-300">
          <PlayIcon className="w-6 h-6 text-white ml-1" />
        </div>
      </div>
    )}

    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
      {item.category && (
        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-1 block">
          {item.category}
        </span>
      )}
      
      {item.description && (
        <p className={`text-white text-sm font-semibold line-clamp-2 leading-tight mb-3 drop-shadow-md`}>
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div 
          className={cn(
            "flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 -ml-1 rounded-lg transition-colors",
            "min-h-[48px] min-w-[48px]"
          )} 
          onClick={onUserClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onUserClick()}
        >
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30">
            {item.author_avatar ? (
              <img src={item.author_avatar} className="w-full h-full object-cover" alt={item.author} />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[9px]">{item.author?.charAt(0)}</div>
            )}
          </div>
          <span className="text-xs text-gray-300 font-medium truncate max-w-[80px]">{item.author}</span>
        </div>

        <div className={cn("flex items-center gap-2", spacing.gap2)}>
          <button 
            onClick={onLike} 
            className={cn(
              "rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center",
              isLiked ? 'text-pink-500 bg-pink-500/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <HeartIcon filled={isLiked} className="w-4 h-4" />
          </button>
          {isOwner && (
            <button 
              onClick={onDelete} 
              className={cn(
                "rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center",
                "text-gray-400 hover:text-red-400 hover:bg-red-400/10"
              )}
              aria-label="Delete post"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onShare} 
            className={cn(
              "rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center",
              "text-gray-400 hover:text-white hover:bg-white/10"
            )}
            aria-label="Share post"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session: Session | null;
  onDataChange?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, onUserClick, session, onDataChange }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(item.src);
  
  useEffect(() => {
    setCurrentSrc(item.src);
  }, [item.src]);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { confirm } = useConfirm();
  const toast = useToast();

  const isOwner = session?.user.id === item.user_id;
  const isStatic = item.id.startsWith('static-');
  
  const { likeCount, isLiked, toggleLike } = useMediaLikes(item.id, session?.user.id, isStatic);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (item.type === MediaType.Video && videoRef.current) {
        if (isHovered && isInView) {
            videoRef.current.play().catch(() => {});
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }
  }, [isHovered, isInView, item.type]);

  const handleLikeAction = async () => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
    await toggleLike();
  };

  const handleTouchEnd = useDoubleTap(handleLikeAction);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleDelete = async () => {
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

  const handleUserClickInternal = () => {
    if (item.user_id && item.author && onUserClick) {
      onUserClick({ id: item.user_id, name: item.author, avatar: item.author_avatar || '' });
    }
  };

  return (
    <>
      <div 
        ref={cardRef}
        className={cn(
            "group relative overflow-hidden rounded-xl bg-[#121212] border border-white/5 cursor-pointer mb-4 break-inside-avoid shadow-lg",
            "hover:shadow-pink-500/20 hover:border-pink-500/30 hover:ring-1 hover:ring-pink-500/20",
            "transition-all duration-300 ease-out",
            !isImageLoaded && "min-h-[200px] animate-pulse",
            isDeleting && "opacity-50 pointer-events-none"
        )}
        onClick={onClick}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseOver={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        aria-label={`Media post by ${item.author}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        <div className="relative aspect-auto">
          {isInView ? (
            <>
                <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    src={currentSrc} 
                    alt={item.description || "Gallery content"} 
                    referrerPolicy="no-referrer"
                    className={cn(
                        "w-full h-auto object-cover block transition-opacity duration-500 ease-in-out",
                        isImageLoaded ? "opacity-100" : "opacity-0",
                        isHovered && item.type === MediaType.Video ? "opacity-0" : "opacity-100"
                    )}
                    loading="lazy"
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => {
                      if (currentSrc !== DEFAULT_THUMB_URL) {
                        setCurrentSrc(DEFAULT_THUMB_URL);
                      }
                    }}
                />
                
                {item.type === MediaType.Video && isHovered && (
                    <video 
                        ref={videoRef}
                        src={item.videoSrc}
                        muted
                        playsInline
                        loop
                        className="absolute inset-0 w-full h-full object-cover z-10"
                    />
                )}
            </>
          ) : (
            <div className="w-full aspect-[3/4] bg-white/5 animate-pulse" />
          )}

          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-bounce-in">
              <HeartIcon filled className="w-20 h-20 text-white drop-shadow-2xl opacity-90" />
            </div>
          )}

          <MediaBadges type={item.type} />
        </div>
        
        <MobileOverlay 
          author={item.author || 'Unknown'} 
          avatar={item.author_avatar}
          isLiked={isLiked}
          likeCount={likeCount}
          onLike={(e) => handleAction(e, handleLikeAction)}
        />

        <DesktopOverlay 
          item={item}
          isLiked={isLiked}
          isOwner={isOwner}
          onUserClick={(e) => handleAction(e, handleUserClickInternal)}
          onLike={(e) => handleAction(e, handleLikeAction)}
          onDelete={(e) => handleAction(e, handleDelete)}
          onShare={(e) => handleAction(e, () => setShareAnchorEl(e.currentTarget as HTMLElement))}
        />
      </div>
      
      {shareAnchorEl && (
        <SharePopover
          item={item}
          onClose={() => setShareAnchorEl(null)}
          anchorEl={shareAnchorEl}
        />
      )}
    </>
  );
};

export default React.memo(MediaCard);
