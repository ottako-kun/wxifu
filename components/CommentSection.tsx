import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Comment } from '../types';
import { getComments, addComment, deleteComment, updateComment, supabase } from '../lib/supabaseClient';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import SendIcon from './icons/SendIcon';
import CloseIcon from './icons/CloseIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface CommentSectionProps {
  mediaId: string;
  session: Session | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ mediaId, session }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch comments on mount or media change
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      const { data, error } = await getComments(mediaId);
      if (!error && data) {
        setComments(data as Comment[]);
      }
      setIsLoading(false);
    };

    fetchComments();

    // Setup Realtime subscription
    const channel = supabase
      .channel(`comments:${mediaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `media_id=eq.${mediaId}`,
        },
        (payload) => {
           if (payload.eventType === 'INSERT') {
               setComments(prev => [...prev, payload.new as Comment]);
           } else if (payload.eventType === 'DELETE') {
               setComments(prev => prev.filter(c => c.id !== payload.old.id));
           } else if (payload.eventType === 'UPDATE') {
               setComments(prev => prev.map(c => c.id === payload.new.id ? payload.new as Comment : c));
           }
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [mediaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setIsSubmitting(true);
    const { error } = await addComment({
        media_id: mediaId,
        user_id: session.user.id,
        content: newComment.trim(),
        author_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Anonymous',
        author_avatar: session.user.user_metadata.avatar_url
    });

    if (error) {
        alert('Failed to post comment. ' + error.message);
    } else {
        setNewComment('');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
      if(!confirm("Are you sure you want to delete this comment?")) return;
      
      // Optimistic Update
      const oldComments = [...comments];
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      const { error } = await deleteComment(commentId);
      if (error) {
          alert('Failed to delete comment.');
          setComments(oldComments);
      }
  };

  const startEdit = (comment: Comment) => {
      setEditingId(comment.id);
      setEditContent(comment.content);
  };

  const cancelEdit = () => {
      setEditingId(null);
      setEditContent('');
  };

  const handleUpdate = async (commentId: string) => {
      if (!editContent.trim()) return;
      
      const { error } = await updateComment(commentId, editContent);
      if (error) {
          alert("Failed to update comment.");
      } else {
          setEditingId(null);
      }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-xl border border-gray-800/50 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Comments ({comments.length})
            </h3>
        </div>

        {/* List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[300px] md:max-h-[400px]">
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <LoadingSpinner className="w-6 h-6 text-pink-500" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">
                    No comments yet. Be the first to share your thoughts!
                </div>
            ) : (
                comments.map(comment => {
                    const isAuthor = session?.user.id === comment.user_id;
                    const isEditing = editingId === comment.id;

                    return (
                        <div key={comment.id} className="group flex gap-3 animate-fade-in">
                            {/* Avatar */}
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                                    {comment.author_avatar ? (
                                        <img src={comment.author_avatar} alt={comment.author_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                            {comment.author_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs font-bold text-gray-300 hover:text-pink-400 cursor-pointer transition-colors">
                                        {comment.author_name}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>

                                {isEditing ? (
                                    <div className="mt-1">
                                        <textarea 
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-pink-500 mb-2"
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={cancelEdit}
                                                className="text-xs text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={() => handleUpdate(comment.id)}
                                                className="text-xs bg-pink-600 px-3 py-1 rounded text-white font-bold"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group relative">
                                        <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                        
                                        {/* Actions */}
                                        {isAuthor && (
                                            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => startEdit(comment)} 
                                                    className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"
                                                >
                                                    <PencilIcon className="w-3 h-3" /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(comment.id)} 
                                                    className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1"
                                                >
                                                    <TrashIcon className="w-3 h-3" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {/* Input Form */}
        {session ? (
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="flex gap-2 items-center">
                    <input 
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-grow bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-600"
                        disabled={isSubmitting}
                    />
                    <button 
                        type="submit" 
                        disabled={!newComment.trim() || isSubmitting}
                        className="p-2 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-full text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-pink-500/20 transition-all"
                    >
                        {isSubmitting ? <LoadingSpinner className="w-4 h-4" /> : <SendIcon className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        ) : (
            <div className="p-4 border-t border-gray-800 text-center bg-gray-900/80">
                <p className="text-xs text-gray-500">
                    Please <span className="text-cyan-400 font-bold">sign in</span> to leave a comment.
                </p>
            </div>
        )}
    </div>
  );
};

export default CommentSection;