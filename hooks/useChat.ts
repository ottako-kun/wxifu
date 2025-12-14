
import { useState, useEffect, useRef } from 'react';
import { supabase, getMessages, sendMessage, deleteMessage, updateMessage } from '../lib/supabaseClient';
import { Message } from '../types';
import { useToast } from '../context/ToastContext';

interface UseChatProps {
  currentUserId: string;
  targetUserId: string;
}

export const useChat = ({ currentUserId, targetUserId }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  // Load Initial Messages
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await getMessages(currentUserId, targetUserId);
      if (!error && data) {
        setMessages(data as Message[]);
      }
      setLoading(false);
    };

    fetchHistory();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`chat:${currentUserId}-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
           // Handle Insert
           if (payload.eventType === 'INSERT') {
               const newMsg = payload.new as Message;
               // Check if this message belongs to current chat
               if ((newMsg.sender_id === currentUserId && newMsg.receiver_id === targetUserId) ||
                   (newMsg.sender_id === targetUserId && newMsg.receiver_id === currentUserId)) {
                   setMessages((prev) => {
                       // Avoid duplicates
                       if (prev.some(m => m.id === newMsg.id)) return prev;
                       return [...prev, newMsg];
                   });
               }
           }
           // Handle Delete
           if (payload.eventType === 'DELETE') {
               setMessages(prev => prev.filter(m => m.id !== payload.old.id));
           }
           // Handle Update
           if (payload.eventType === 'UPDATE') {
               const updatedMsg = payload.new as Message;
               setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, targetUserId]);

  const send = async (content: string) => {
    // Optimistic update
    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
        id: tempId,
        sender_id: currentUserId,
        receiver_id: targetUserId,
        content: content,
        created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await sendMessage(currentUserId, targetUserId, content);
    
    if (error) {
        console.error('Failed to send', error);
        setMessages(prev => prev.filter(m => m.id !== tempId));
        toast.error('Failed to send message');
        return false;
    } else {
        // We rely on Realtime subscription to replace the optimistic message with real ID,
        // but we remove the temp one to prevent duplicates if the realtime event arrives fast.
        setMessages(prev => prev.filter(m => m.id !== tempId)); 
        return true;
    }
  };

  const remove = async (msgId: string) => {
      const { error } = await deleteMessage(msgId);
      if (error) {
          toast.error('Failed to delete message');
          return false;
      }
      return true;
  };

  const edit = async (msgId: string, newContent: string) => {
      const { error } = await updateMessage(msgId, newContent);
      if (error) {
          toast.error('Failed to update message');
          return false;
      }
      return true;
  };

  return {
    messages,
    loading,
    send,
    remove,
    edit
  };
};
