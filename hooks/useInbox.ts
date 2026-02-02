
import { useState, useEffect, useCallback } from 'react';
import { supabase, getInboxUsers } from '../lib/supabaseClient';

export interface ConversationItem {
  userId: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
}

export const useInbox = (currentUserId: string) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    const data = await getInboxUsers(currentUserId);
    setConversations(data);
    if (!isBackground) setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    // Initial fetch
    fetchConversations();

    // Subscribe to real-time message updates
    // Fixed: Mock client properly supports channel() chain now
    const channel = supabase
      .channel('inbox_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE (read status), DELETE
          schema: 'public',
          table: 'messages',
        },
        (payload: any) => {
           // Type assertion to access ids safely
           const newMsg = payload.new as { sender_id?: string; receiver_id?: string } | null;
           const oldMsg = payload.old as { sender_id?: string; receiver_id?: string } | null;
           
           // Check if the change involves the current user
           const involvesUser = 
             (newMsg?.sender_id === currentUserId || newMsg?.receiver_id === currentUserId) ||
             (oldMsg?.sender_id === currentUserId || oldMsg?.receiver_id === currentUserId);

           if (involvesUser) {
               fetchConversations(true); // Refresh in background
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversations]);

  return { conversations, loading, refresh: fetchConversations };
};
