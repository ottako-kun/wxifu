
import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Comment } from '../types';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import SendIcon from './icons/SendIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { useConfirm } from '../context/ConfirmationContext';
import { useComments } from '../hooks/useComments';
import Avatar from './Avatar';

interface CommentSectionProps {
  mediaId: string;
  session: Session | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({ mediaId, session }) => {
  const { comments, isLoading, postComment, removeComment, editComment } = useComments(mediaId, session);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { confirm } = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    if ((await postComment(newComment)).success) setNewComment('');
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
      if (await confirm({ title: 'Delete Comment', message: 'Delete this comment?', confirmText: 'Delete', variant: 'danger' })) {
          await removeComment(id);
      }
  };

  return (
    <div className="flex flex-col bg-gray-900/40 rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Feed Interactions ({comments.length})</h3>
        </div>

        <div className="p-4 space-y-5 max-h-[350px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
                <div className="flex justify-center py-6"><LoadingSpinner className="w-6 h-6 text-pink-500" /></div>
            ) : comments.length === 0 ? (
                <div className="text-center py-10 text-gray-600 text-xs uppercase tracking-widest">No transmissions yet</div>
            ) : (
                comments.map(c => (
                    <div key={c.id} className="flex gap-3 group animate-fade-in">
                        <Avatar src={c.author_avatar} alt={c.author_name} size="sm" />
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-bold text-gray-200">{c.author_name}</span>
                                <span className="text-[9px] text-gray-600">{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            {editingId === c.id ? (
                                <div className="mt-2">
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full bg-black/40 border border-pink-500/50 rounded-xl p-3 text-sm text-white focus:outline-none" rows={2} />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-500">Cancel</button>
                                        <button onClick={async () => { if ((await editComment(c.id, editContent)).success) setEditingId(null); }} className="text-xs font-bold text-pink-500">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-400 font-light leading-relaxed">{c.content}</p>
                                    {session?.user.id === c.user_id && (
                                        <div className="flex gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingId(c.id); setEditContent(c.content); }} className="text-[9px] uppercase font-bold text-gray-600 hover:text-white flex items-center gap-1"><PencilIcon className="w-2.5 h-2.5"/> Edit</button>
                                            <button onClick={() => handleDelete(c.id)} className="text-[9px] uppercase font-bold text-gray-600 hover:text-red-500 flex items-center gap-1"><TrashIcon className="w-2.5 h-2.5"/> Delete</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>

        {session ? (
            <form onSubmit={handleSubmit} className="p-3 bg-black/40 border-t border-white/5">
                <div className="flex gap-2">
                    <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Say something..." className="flex-grow bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-colors" />
                    <button type="submit" disabled={!newComment.trim() || isSubmitting} className="p-2.5 bg-gradient-to-tr from-pink-600 to-pink-500 rounded-full text-white shadow-lg active:scale-90 disabled:opacity-50"><SendIcon className="w-4 h-4" /></button>
                </div>
            </form>
        ) : (
            <div className="p-4 bg-black/20 text-center border-t border-white/5"><p className="text-[10px] text-gray-600 uppercase tracking-widest">Sign in to leave a trace</p></div>
        )}
    </div>
  );
};

export default CommentSection;
