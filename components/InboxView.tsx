import { motion } from 'motion/react';
import { UserProfileData } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';
import ChatIcon from './icons/ChatIcon';
import { useInbox } from '../hooks/useInbox';
import { useUI } from '../context/UIContext';

interface InboxViewProps {
  currentUserId: string;
}

const InboxView: React.FC<InboxViewProps> = ({ currentUserId }) => {
  const { conversations, loading } = useInbox(currentUserId);
  const { openChat } = useUI();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-4 py-12 max-w-4xl"
    >
        <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4 font-orbitron">
            Messages
        </h2>
        
        {loading && conversations.length === 0 ? (
            <div className="flex justify-center py-20">
                <LoadingSpinner className="w-10 h-10 text-pink-500" />
            </div>
        ) : conversations.length === 0 ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed"
            >
                <ChatIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl text-gray-400 font-bold mb-2">No Messages Yet</h3>
                <p className="text-gray-500">Visit a user's profile to start a conversation.</p>
            </motion.div>
        ) : (
            <div className="space-y-4">
                {conversations.map((convo, index) => (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        key={convo.userId}
                        onClick={() => openChat({
                            id: convo.userId,
                            name: convo.name,
                            avatar: convo.avatar || '',
                        })}
                        className="flex items-center gap-4 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-pink-500/30 rounded-xl cursor-pointer transition-all group"
                    >
                        <div className="relative">
                             <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden border border-gray-600 group-hover:border-pink-500 transition-colors">
                                {convo.avatar ? (
                                    <img src={convo.avatar} alt={convo.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg">
                                        {convo.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {!convo.isRead && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full border border-gray-900"></div>
                            )}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-white font-bold truncate group-hover:text-pink-400 transition-colors">
                                    {convo.name}
                                </h3>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                    {new Date(convo.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-sm truncate ${convo.isRead ? 'text-gray-500' : 'text-gray-300 font-medium'}`}>
                                {convo.lastMessage}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
    </motion.div>
  );
};

export default InboxView;