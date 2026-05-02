
import React from 'react';
import { motion } from 'motion/react';
import HomeIcon from './icons/HomeIcon';
import SearchIcon from './icons/SearchIcon';
import UploadIcon from './icons/UploadIcon';
import InboxIcon from './icons/InboxIcon';
// Fixed: Import Session from local types
import { Session } from '../types';

interface BottomNavProps {
  currentView: 'home' | 'profile' | 'inbox';
  onNavigate: (view: 'home' | 'profile' | 'inbox') => void;
  onUploadClick: () => void;
  onSearchClick: () => void;
  session: Session | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ 
  currentView, 
  onNavigate, 
  onUploadClick, 
  onSearchClick,
  session 
}) => {
  
  const navItemClass = (isActive: boolean) => `
    flex flex-col items-center justify-center w-full h-full relative
    transition-all duration-300
    ${isActive ? 'text-pink-500 scale-105' : 'text-gray-400 hover:text-gray-200'}
  `;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-18 bg-black/90 backdrop-blur-3xl border-t border-white/5 z-40 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2 relative">
        
        {/* Home */}
        <button 
          onClick={() => onNavigate('home')}
          className={navItemClass(currentView === 'home')}
          title="Home Gallery"
        >
          <div className="p-2">
            <HomeIcon className="w-6 h-6" />
          </div>
          <span className="text-[8px] uppercase tracking-[0.2em] font-black -mt-1">Home</span>
          {currentView === 'home' && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute bottom-1 w-6 h-0.5 bg-pink-500 shadow-[0_0_10px_#ec4899] rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
          )}
        </button>

        {/* Search */}
        <button 
          onClick={onSearchClick}
          className={navItemClass(false)}
          title="Search Content"
        >
          <div className="p-2">
            <SearchIcon className="w-6 h-6" />
          </div>
          <span className="text-[8px] uppercase tracking-[0.2em] font-black -mt-1">Explore</span>
        </button>

        {/* Upload - Immersion Center */}
        <div className="relative -top-4">
           <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={onUploadClick}
             title="Upload Artwork"
             className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 shadow-[0_0_25px_rgba(236,72,153,0.5)] border-2 border-[#020202] text-white transition-all duration-200"
           >
             <UploadIcon className="w-7 h-7 stroke-[2.5]" />
           </motion.button>
        </div>

        {/* Inbox */}
        <button 
          onClick={() => onNavigate('inbox')}
          className={navItemClass(currentView === 'inbox')}
          title="Messages"
        >
           <div className="p-2">
             <InboxIcon className="w-6 h-6" />
           </div>
          <span className="text-[8px] uppercase tracking-[0.2em] font-black -mt-1">Inbox</span>
          {currentView === 'inbox' && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute bottom-1 w-6 h-0.5 bg-pink-500 shadow-[0_0_10px_#ec4899] rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
          )}
        </button>

        {/* Profile */}
        <button 
          onClick={() => onNavigate('profile')}
          className={navItemClass(currentView === 'profile')}
          title="Your Profile"
        >
          <div className="p-2">
            {session?.user.user_metadata.avatar_url ? (
               <motion.img 
                animate={currentView === 'profile' ? { scale: 1.2 } : { scale: 1 }}
                src={session.user.user_metadata.avatar_url} 
                alt="Profile" 
                className={`w-6 h-6 rounded-full border-2 transition-all ${currentView === 'profile' ? 'border-pink-500 shadow-[0_0_10px_#ec4899]' : 'border-gray-700'}`}
              />
            ) : (
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${currentView === 'profile' ? 'border-pink-500 bg-pink-500/20 text-pink-500' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                 {session?.user.email?.[0].toUpperCase() || '?'}
              </div>
            )}
          </div>
          <span className="text-[8px] uppercase tracking-[0.2em] font-black -mt-1">Profile</span>
          {currentView === 'profile' && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute bottom-1 w-6 h-0.5 bg-pink-500 shadow-[0_0_10px_#ec4899] rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
          )}
        </button>

      </div>
    </div>
  );
};

export default BottomNav;
