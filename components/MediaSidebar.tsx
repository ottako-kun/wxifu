
import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { Session } from '@supabase/supabase-js';
import { deleteMediaItem, getFollowStatus, followUser, unfollowUser } from '../lib/supabaseClient';
import { APP_CONFIG } from '../gallery-data';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ShareIcon from './icons/ShareIcon';
import FlagIcon from './icons/FlagIcon';
import LockIcon from './icons/LockIcon';
import GiftIcon from './icons/GiftIcon';
import CommentSection from './CommentSection';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';
import EditMediaForm from './EditMediaForm';
import TipModal from './TipModal';

interface MediaSidebarProps {
  item: MediaItem;
  session: Session | null;
  relatedItems: MediaItem[];
  isOwner: boolean;
  onAuthorClick: () => void;
  onRelatedClick: (id: string) => void;
  onShareClick: (e: React.MouseEvent) => void;
  onReportClick: () => void;
  onDataChange?: () => void;
  onDeleteSuccess: () => void;
}

const MediaSidebar: React.FC<MediaSidebarProps> = ({
  item,
  session,
  relatedItems,
  isOwner,
  onAuthorClick,
  onRelatedClick,
  onShareClick,
  onReportClick,
  onDataChange,
  onDeleteSuccess
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  
  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const toast = useToast();
  const { confirm } = useConfirm();

  // Reset editing mode when item changes
  useEffect(() => {
    setIsEditing(false);
  }, [item]);

  // Check Follow Status
  useEffect(() => {
    if (session && !isOwner && item.user_id && !item.user_id.startsWith('static')) {
        const checkStatus = async () => {
            const { isFollowing } = await getFollowStatus(session.user.id, item.user_id!);
            setIsFollowing(isFollowing);
        };
        checkStatus();
    }
  }, [session, isOwner, item.user_id]);

  const handleFollowToggle = async () => {
      if (!session || !item.user_id) return;
      
      setIsFollowLoading(true);
      try {
          if (isFollowing) {
              await unfollowUser(session.user.id, item.user_id);
              setIsFollowing(false);
              toast.success(`Unfollowed ${item.author}`);
          } else {
              await followUser(session.user.id, item.user_id);
              setIsFollowing(true);
              toast.success(`Following ${item.author}`);
          }
          if (onDataChange) onDataChange();
      } catch (err) {
          console.error(err);
          toast.error("Failed to update follow status");
      } finally {
          setIsFollowLoading(false);
      }
  };

  const handleEditSuccess = (updatedFields: Partial<MediaItem>) => {
      setIsEditing(false);
      // Mutate local item to reflect changes immediately in UI
      Object.assign(item, updatedFields);
      if (onDataChange) onDataChange();
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'danger'
    });

    if (!isConfirmed) return;

    const { error } = await deleteMediaItem(item.id);
    
    if (error) {
        toast.error('Failed to delete item: ' + error.message);
    } else {
        toast.success('Post deleted');
        if (onDataChange) onDataChange();
        onDeleteSuccess();
    }
  };

  return (
    <div className="w-full md:w-[30%] lg:w-[25%] h-[40%] md:h-full flex flex-col bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 relative z-10">
      <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col">
        
        {/* Header: Brand or Author */}
        <div className="p-4 md:p-8 pb-2 md:pb-4">
            <div className="flex items-center gap-x-4 mb-4 border-b border-gray-800 pb-4 justify-between">
            <div className="flex items-center gap-x-4">
                <div className="cursor-pointer group relative" onClick={onAuthorClick}>
                    {item.author_avatar ? (
                        <img src={item.author_avatar} alt={item.author} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-pink-500 shadow-lg object-cover" />
                    ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg border border-white/10">
                            {item.author?.charAt(0) || APP_CONFIG.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="overflow-hidden">
                    <h2 
                        className="text-base md:text-lg font-bold text-white tracking-widest leading-none mb-1.5 font-orbitron truncate cursor-pointer hover:text-pink-400 transition-colors"
                        onClick={onAuthorClick}
                    >
                        {item.author || APP_CONFIG.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">{item.author ? 'Artist' : 'Viewer'}</p>
                        {!isOwner && session && item.user_id && !item.user_id.startsWith('static') && (
                            <button 
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded border transition-colors uppercase ${
                                    isFollowing 
                                    ? 'border-gray-600 text-gray-400 hover:text-white' 
                                    : 'border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white'
                                }`}
                            >
                                {isFollowing ? 'Following' : '+ Follow'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Owner Controls */}
            {isOwner ? (
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
            ) : (
                session && item.user_id && !item.user_id.startsWith('static') && (
                    <button 
                        onClick={() => setIsTipModalOpen(true)}
                        className="p-2 rounded-lg bg-yellow-900/30 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-800/50 transition-colors"
                        title="Send Gift"
                    >
                        <GiftIcon className="w-5 h-5" />
                    </button>
                )
            )}
            </div>
            
            {isEditing ? (
                <EditMediaForm 
                    item={item} 
                    onCancel={() => setIsEditing(false)} 
                    onSuccess={handleEditSuccess} 
                />
            ) : (
                <>
                    <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider">Info</span>
                    {item.category && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-pink-500/30 bg-pink-500/10 text-pink-300 uppercase shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                        {item.category}
                        </span>
                    )}
                    </div>
                    <div className="prose prose-invert prose-sm prose-p:text-gray-300 prose-p:font-light prose-p:leading-relaxed mb-4">
                        <p className="line-clamp-3 md:line-clamp-none">{item.description || 'No description available.'}</p>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-gray-300 bg-gray-800/50 border border-gray-700 px-2 py-1 rounded transition-colors cursor-default">
                            #{tag}
                            </span>
                        ))}
                        </div>
                    </div>
                    )}
                </>
            )}
        </div>

        {/* Comments Section */}
        <div className="flex-grow px-4 md:px-6 pb-2 md:pb-4 min-h-0">
            <CommentSection mediaId={item.id} session={session} />
        </div>

        {/* Related Media Section - Hidden on very small screens if needed, but keeping for now */}
        {relatedItems.length > 0 && (
            <div className="px-4 md:px-6 py-4 border-t border-gray-800 hidden md:block">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">More Like This</h3>
                <div className="grid grid-cols-3 gap-2">
                    {relatedItems.map(rel => (
                        <div 
                            key={rel.id} 
                            onClick={() => onRelatedClick(rel.id)}
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group/rel"
                        >
                            <img src={rel.src} alt="Related" className="w-full h-full object-cover" />
                            {rel.is_premium && !isOwner && rel.user_id !== session?.user.id && (
                                <div className="absolute top-1 right-1 bg-black/60 p-0.5 rounded-full">
                                    <LockIcon className="w-3 h-3 text-yellow-500" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>

      <div className="p-4 md:p-6 bg-black/20 border-t border-gray-800 backdrop-blur-sm flex-shrink-0 flex gap-2">
        <button
          onClick={onShareClick}
          className="flex-grow group flex items-center justify-center gap-x-2 px-4 py-3 md:py-4 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white transition-all duration-300 font-bold tracking-wide shadow-lg shadow-pink-900/20 hover:shadow-pink-500/30 transform hover:-translate-y-0.5 border border-white/10 text-xs md:text-sm"
        >
          <ShareIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          <span>SHARE</span>
        </button>
        
        {/* Report Button */}
        <button
            onClick={onReportClick}
            className="p-3 md:p-4 rounded-xl bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 transition-colors"
            title="Report Content"
        >
            <FlagIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {isTipModalOpen && item.user_id && (
          <TipModal 
            recipientId={item.user_id}
            recipientName={item.author || 'Artist'}
            onClose={() => setIsTipModalOpen(false)}
          />
      )}
    </div>
  );
};

export default MediaSidebar;
