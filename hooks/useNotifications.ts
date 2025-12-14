import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';
import { Session } from '@supabase/supabase-js';

export const useNotifications = (session: Session | null) => {
  const { info } = useToast();

  useEffect(() => {
    if (!session) return;

    const userId = session.user.id;

    // 1. Subscribe to New Messages
    const messageChannel = supabase
      .channel('global_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          // Ideally fetch sender name, but for speed we just show a generic alert or try to fetch
          const { data: senderProfile } = await supabase
             .from('profiles')
             .select('name')
             .eq('id', newMsg.sender_id)
             .single();
             
          const senderName = senderProfile?.name || 'Someone';
          info(`New message from ${senderName}: ${newMsg.content.substring(0, 30)}${newMsg.content.length > 30 ? '...' : ''}`);
        }
      )
      .subscribe();

    // 2. Subscribe to New Comments
    // Note: Supabase Realtime filters are limited. We listen to all comments and filter locally for ownership.
    // In a high-scale app, this should be handled by a specific RLS subscription or Edge Function notification.
    const commentChannel = supabase
      .channel('global_comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        async (payload) => {
          const newComment = payload.new;
          
          // Don't notify if I commented on my own post
          if (newComment.user_id === userId) return;

          // Fetch the media item to see if I own it
          const { data: mediaItem } = await supabase
            .from('media')
            .select('user_id, description')
            .eq('id', newComment.media_id)
            .single();

          if (mediaItem && mediaItem.user_id === userId) {
             info(`New comment on "${mediaItem.description?.substring(0, 20) || 'your post'}": ${newComment.content}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [session, info]);
};
