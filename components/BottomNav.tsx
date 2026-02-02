
import React from 'react';
import HomeIcon from './icons/HomeIcon';
import SearchIcon from './icons/SearchIcon';
import UploadIcon from './icons/UploadIcon';
import InboxIcon from './icons/InboxIcon';
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
    ${isActive ? 'text-pink-500 scale-110' : 'text-gray-500 hover:text-gray-200'}
  `;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-3xl border-t border-white/5 z-[60] pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around h-full max-w-md mx-auto px-2 relative">
        
        {/* Home */}
        <button 
          onClick={() => onNavigate('home')}
          className={navItemClass(currentView === 'home')}
          title="Home Gallery"
        >
          <HomeIcon className={`w-6 h-6 ${currentView === 'home' ? 'filter drop-shadow-[0_0_5px_#ec4899]' : ''}`} />
          <span className={`text-[8px] uppercase tracking-widest font-black mt-1 ${currentView === 'home' ? 'glow-pink' : ''}`}>Home</span>
          {currentView === 'home' && (
              <div className="absolute -bottom-1 w-8 h-1 bg-pink-500 shadow-[0_0_15px_#ec4899] rounded-full"></div>
          )}
        </button>

        {/* Search */}
        <button 
          onClick={onSearchClick}
          className={navItemClass(false)}
          title="Search Content"
        >
          <SearchIcon className="w-6 h-6" />
          <span className="text-[8px] uppercase tracking-widest font-black mt-1">Explore</span>
        </button>

        {/* Central Upload Action */}
        <div className="relative -top-4">
           <button 
             onClick={onUploadClick}
             title="Upload Artwork"
             className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 shadow-[0_0_25px_rgba(236,72,153,0.5)] border-4 border-black text-white transform active:scale-90 transition-all duration-200"
           >
             <UploadIcon className="w-7 h-7 stroke-[2.5]" />
           </button>
        </div>

        {/* Inbox */}
        <button 
          onClick={() => onNavigate('inbox')}
          className={navItemClass(currentView === 'inbox')}
          title="Messages"
        >
           <div className="relative">
             <InboxIcon className={`w-6 h-6 ${currentView === 'inbox' ? 'filter drop-shadow-[0_0_5px_#ec4899]' : ''}`} />
           </div>
          <span className={`text-[8px] uppercase tracking-widest font-black mt-1 ${currentView === 'inbox' ? 'glow-pink' : ''}`}>Inbox</span>
          {currentView === 'inbox' && (
              <div className="absolute -bottom-1 w-8 h-1 bg-pink-500 shadow-[0_0_15px_#ec4899] rounded-full"></div>
          )}
        </button>

        {/* Profile */}
        <button 
          onClick={() => onNavigate('profile')}
          className={navItemClass(currentView === 'profile')}
          title="Your Profile"
        >
          {session?.user.user_metadata.avatar_url ? (
            <img 
              src={session.user.user_metadata.avatar_url} 
              alt="Profile" 
              className={`w-7 h-7 rounded-full border-2 transition-all ${currentView === 'profile' ? 'border-pink-500 shadow-[0_0_15px_#ec4899]' : 'border-gray-700'}`}
            />
          ) : (
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${currentView === 'profile' ? 'border-pink-500 bg-pink-500/20 text-pink-500' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
               {session?.user.email?.[0].toUpperCase() || '?'}
            </div>
          )}
          <span className={`text-[8px] uppercase tracking-widest font-black mt-1 ${currentView === 'profile' ? 'glow-pink' : ''}`}>Profile</span>
          {currentView === 'profile' && (
              <div className="absolute -bottom-1 w-8 h-1 bg-pink-500 shadow-[0_0_15px_#ec4899] rounded-full"></div>
          )}
        </button>

      </div>
    </div>
  );
};

export default BottomNav;
