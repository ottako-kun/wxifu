
import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { Session } from '@supabase/supabase-js';
import { updateMediaItem, deleteMediaItem } from '../lib/supabaseClient';
import { APP_CONFIG } from '../gallery-data';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ShareIcon from './icons/ShareIcon';
import FlagIcon from './icons/FlagIcon';
import LockIcon from './icons/LockIcon';
import CommentSection from './CommentSection';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmationContext';

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
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    setEditDesc(item.description || '');
    setEditCategory(item.category || '');
    setEditTags(item.tags ? item.tags.join(', ') : '');
    setIsEditing(false);
  }, [item]);

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
        // Mutate local item to reflect changes immediately in UI
        item.description = editDesc;
        item.category = editCategory;
        item.tags = tagsArray;
        toast.success('Post updated');
        if (onDataChange) onDataChange();
    }
  };

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
        onDeleteSuccess();
    }
  };

  return (
    <div className="w-full md:w-[30%] lg:w-[25%] h-[50%] md:h-full flex flex-col bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 relative z-10">
      <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col">
        
        {/* Header: Brand or Author */}
        <div className="p-6 md:p-8 pb-4">
            <div className="flex items-center gap-x-4 mb-6 border-b border-gray-800 pb-6 justify-between">
            <div className="flex items-center gap-x-4">
                <div className="cursor-pointer group" onClick={onAuthorClick}>
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
                        className="text-lg font-bold text-white tracking-widest leading-none mb-1.5 font-orbitron truncate cursor-pointer hover:text-pink-400 transition-colors"
                        onClick={onAuthorClick}
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

        {/* Comments Section */}
        <div className="flex-grow px-6 pb-4">
            <CommentSection mediaId={item.id} session={session} />
        </div>

        {/* Related Media Section */}
        {relatedItems.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-800">
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

      <div className="p-6 bg-black/20 border-t border-gray-800 backdrop-blur-sm flex-shrink-0 flex gap-2">
        <button
          onClick={onShareClick}
          className="flex-grow group flex items-center justify-center gap-x-2 px-4 py-4 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white transition-all duration-300 font-bold tracking-wide shadow-lg shadow-pink-900/20 hover:shadow-pink-500/30 transform hover:-translate-y-0.5 border border-white/10"
        >
          <ShareIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>SHARE THIS</span>
        </button>
        
        {/* Report Button */}
        <button
            onClick={onReportClick}
            className="p-4 rounded-xl bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 transition-colors"
            title="Report Content"
        >
            <FlagIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MediaSidebar;
