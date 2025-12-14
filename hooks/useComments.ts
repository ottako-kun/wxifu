
import { useState, useEffect, useCallback } from 'react';
import { supabase, getComments, addComment, deleteComment, updateComment } from '../lib/supabaseClient';
import { Comment } from '../types';
import { useToast } from '../context/ToastContext';
import { Session } from '@supabase/supabase-js';

export const useComments = (mediaId: string, session: Session | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Fetch initial comments and setup subscription
  useEffect(() => {
    let mounted = true;

    const fetchComments = async () => {
      setIsLoading(true);
      const { data, error } = await getComments(mediaId);
      if (mounted) {
        if (!error && data) {
          setComments(data as Comment[]);
        }
        setIsLoading(false);
      }
    };

    fetchComments();

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
           if (!mounted) return;
           
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
        mounted = false;
        supabase.removeChannel(channel);
    };
  }, [mediaId]);

  const postComment = async (content: string) => {
    if (!session) return { success: false, error: 'Not logged in' };
    
    const { error } = await addComment({
        media_id: mediaId,
        user_id: session.user.id,
        content: content.trim(),
        author_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Anonymous',
        author_avatar: session.user.user_metadata.avatar_url
    });

    if (error) {
        toast.error('Failed to post comment: ' + error.message);
        return { success: false, error: error.message };
    } else {
        toast.success('Comment posted');
        return { success: true };
    }
  };

  const removeComment = async (commentId: string) => {
      // Optimistic Update
      const oldComments = [...comments];
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      const { error } = await deleteComment(commentId);
      if (error) {
          toast.error('Failed to delete comment.');
          setComments(oldComments); // Revert
          return { success: false };
      } else {
          toast.success('Comment deleted');
          return { success: true };
      }
  };

  const editComment = async (commentId: string, content: string) => {
      const { error } = await updateComment(commentId, content);
      if (error) {
          toast.error("Failed to update comment.");
          return { success: false };
      } else {
          toast.success("Comment updated");
          return { success: true };
      }
  };

  return {
    comments,
    isLoading,
    postComment,
    removeComment,
    editComment
  };
};
