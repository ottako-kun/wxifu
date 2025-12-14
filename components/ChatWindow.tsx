import React, { useState, useEffect, useRef } from 'react';
import { supabase, getMessages, sendMessage } from '../lib/supabaseClient';
import { UserProfileData, Message } from '../types';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface ChatWindowProps {
  currentUser: { id: string };
  targetUser: UserProfileData;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, targetUser, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Initial Messages
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await getMessages(currentUser.id, targetUser.id);
      if (!error && data) {
        setMessages(data as Message[]);
      }
      setLoading(false);
    };

    fetchHistory();

    // Subscribe to real-time new messages
    const channel = supabase
      .channel(`chat:${currentUser.id}-${targetUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`, // Listen for messages sent TO me
        },
        (payload) => {
           // Verify it's from the person we are chatting with
           if (payload.new.sender_id === targetUser.id) {
               setMessages((prev) => [...prev, payload.new as Message]);
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, targetUser.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage(''); // Clear input immediately for UX

    // Optimistic update
    const optimisticMsg: Message = {
        id: 'temp-' + Date.now(),
        sender_id: currentUser.id,
        receiver_id: targetUser.id,
        content: content,
        created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { data, error } = await sendMessage(currentUser.id, targetUser.id, content);
    
    if (error) {
        console.error('Failed to send', error);
        // Remove optimistic message if failed
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        alert('Failed to send message');
    } else if (data) {
        // Replace optimistic ID with real ID if needed, but for now simple append is okay 
        // because we aren't editing/deleting. 
        // Note: Realtime subscription doesn't usually catch my OWN inserts unless configured, 
        // so optimistic update is good.
    }
  };

  return (
    <div className="fixed bottom-0 right-0 md:right-8 md:bottom-0 w-full md:w-96 h-[80vh] md:h-[600px] bg-gray-900 border border-gray-700 rounded-t-xl shadow-2xl flex flex-col z-[100] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 rounded-t-xl">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-cyan-500/50">
                {targetUser.avatar ? (
                    <img src={targetUser.avatar} alt={targetUser.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white">{targetUser.name.charAt(0)}</div>
                )}
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">{targetUser.name}</h3>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider">Online</span>
            </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-900/95 backdrop-blur-sm">
         {loading ? (
             <div className="flex items-center justify-center h-full">
                 <LoadingSpinner className="w-8 h-8 text-pink-500" />
             </div>
         ) : messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                 <p>No messages yet.</p>
                 <p>Say hello to {targetUser.name}!</p>
             </div>
         ) : (
             messages.map((msg) => {
                 const isMe = msg.sender_id === currentUser.id;
                 return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                         <div 
                           className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                               isMe 
                               ? 'bg-pink-600 text-white rounded-br-none' 
                               : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                           }`}
                         >
                             <p>{msg.content}</p>
                             <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-pink-200' : 'text-gray-500'}`}>
                                 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                         </div>
                     </div>
                 );
             })
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow bg-gray-900 border border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-2 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
              <SendIcon className="w-5 h-5" />
          </button>
      </form>
    </div>
  );
};

export default ChatWindow;