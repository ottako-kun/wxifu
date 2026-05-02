
import React, { useState, useEffect } from 'react';
import { MediaItem, Session } from '../types';
// Fixed: Import Session from local types
import { deleteMediaItem } from '../lib/supabaseClient';
import { APP_CONFIG } from '../gallery-data';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ShareIcon from './icons/ShareIcon';
import FlagIcon from './icons/FlagIcon';
import CommentSection from './CommentSection';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';
import EditMediaForm from './EditMediaForm';
import { useFollow } from '../hooks/useFollow';
import Avatar from './Avatar';

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
  const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollow(session?.user.id, item.user_id || '');
  const toast = useToast();
  const { confirm } = useConfirm();

  useEffect(() => { setIsEditing(false); }, [item]);

  const handleFollowToggle = async () => {
      if (await toggleFollow(item.author || 'Artist')) {
          if (onDataChange) onDataChange();
      }
  };

  const handleEditSuccess = (updatedFields: Partial<MediaItem>) => {
      setIsEditing(false);
      Object.assign(item, updatedFields);
      if (onDataChange) onDataChange();
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({ title: 'Delete Post', message: 'Delete this post permanently?', confirmText: 'Delete', variant: 'danger' });
    if (!isConfirmed) return;
    const { error } = await deleteMediaItem(item.id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); onDeleteSuccess(); if (onDataChange) onDataChange(); }
  };

  return (
    <div className="w-full flex flex-col bg-transparent">
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={onAuthorClick} title={`Visit @${item.author}'s profile`}>
                    <Avatar src={item.author_avatar} alt={item.author} size="md" frame={isFollowing ? 'neon-pink' : 'none'} />
                    <div>
                        <h2 className="text-white font-bold text-sm font-orbitron hover:text-pink-500 transition-colors">{item.author}</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Creator</p>
                    </div>
                </div>
                {!isOwner && session && !item.user_id?.startsWith('static') && (
                    <button 
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        title={isFollowing ? "Unfollow this creator" : "Follow this creator"}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${isFollowing ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-pink-600 text-white shadow-lg shadow-pink-900/20'}`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
                {isOwner && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(!isEditing)} title="Edit post details" className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400'}`}><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={handleDelete} title="Delete this post" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <EditMediaForm item={item} onCancel={() => setIsEditing(false)} onSuccess={handleEditSuccess} />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-300 leading-relaxed font-light">{item.description}</p>
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => <span key={tag} className="text-[10px] text-pink-400 bg-pink-950/30 px-2 py-0.5 rounded-md border border-pink-500/20" title={`Tag: #${tag}`}>#{tag}</span>)}
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="px-4 mb-6">
            <CommentSection mediaId={item.id} session={session} />
        </div>

        {relatedItems.length > 0 && (
            <div className="p-6 pt-0">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Related Artworks</h3>
                <div className="grid grid-cols-3 gap-2">
                    {relatedItems.map(rel => (
                        <div key={rel.id} onClick={() => onRelatedClick(rel.id)} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all relative" title="View related content">
                            <img src={rel.src} className="w-full h-full object-cover" alt="Related" />
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        <div className="p-6 pt-0 flex gap-2">
            <button onClick={onShareClick} className="flex-grow flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold uppercase transition-all" title="Share artwork link"><ShareIcon className="w-4 h-4" /> Share Link</button>
            <button onClick={onReportClick} className="p-3 bg-gray-800 hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded-xl transition-all" title="Report inappropriate content"><FlagIcon className="w-4 h-4" /></button>
        </div>
    </div>
  );
};

export default MediaSidebar;
