
import React, { useState, useEffect, useRef } from 'react';
import { UserProfileData, Message } from '../types';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { useConfirm } from '../context/ConfirmationContext';
import { useChat } from '../hooks/useChat';

interface ChatWindowProps {
  currentUser: { id: string };
  targetUser: UserProfileData;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, targetUser, onClose }) => {
  const { messages, loading, send, remove, edit } = useChat({ 
      currentUserId: currentUser.id, 
      targetUserId: targetUser.id 
  });

  const [newMessage, setNewMessage] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { confirm } = useConfirm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom on initial load or new message arrival, not during edits
    if (!editingId) {
        scrollToBottom();
    }
  }, [messages, editingId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const content = newMessage.trim();
    setNewMessage(''); 
    await send(content);
  };

  const handleDelete = async (msgId: string) => {
      const isConfirmed = await confirm({
          title: 'Delete Message',
          message: 'Are you sure?',
          confirmText: 'Delete',
          variant: 'danger'
      });
      if (!isConfirmed) return;
      await remove(msgId);
  };

  const startEdit = (msg: Message) => {
      setEditingId(msg.id);
      setEditText(msg.content);
  };

  const submitEdit = async (msgId: string) => {
      if (editText.trim() === '') return;
      await edit(msgId, editText);
      setEditingId(null);
  };

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-0 md:right-8 w-full md:w-96 h-full md:h-[600px] bg-gray-900 border border-gray-700 md:rounded-t-xl shadow-2xl flex flex-col z-[100] animate-fade-in pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 md:rounded-t-xl pt-safe-top">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden text-gray-400 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
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
        <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-white transition-colors">
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
                 const isEditingThis = editingId === msg.id;

                 return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg`}>
                         <div 
                           className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm relative ${
                               isMe 
                               ? 'bg-pink-600 text-white rounded-br-none' 
                               : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                           }`}
                         >
                             {isEditingThis ? (
                                 <div className="flex flex-col gap-2 min-w-[200px]">
                                     <input 
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="bg-black/20 rounded p-1 text-white w-full border border-white/20"
                                        autoFocus
                                     />
                                     <div className="flex justify-end gap-2 text-xs">
                                         <button onClick={() => setEditingId(null)} className="opacity-70 hover:opacity-100">Cancel</button>
                                         <button onClick={() => submitEdit(msg.id)} className="font-bold">Save</button>
                                     </div>
                                 </div>
                             ) : (
                                 <>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-pink-200' : 'text-gray-500'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    
                                    {/* Action Buttons (Only for sender) */}
                                    {isMe && !msg.id.startsWith('temp') && (
                                        <div className="absolute top-0 right-full mr-2 hidden group-hover/msg:flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
                                            <button 
                                                onClick={() => startEdit(msg)}
                                                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-3 h-3" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(msg.id)}
                                                className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                 </>
                             )}
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
