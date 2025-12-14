import React from 'react';
import HomeIcon from './icons/HomeIcon';
import SearchIcon from './icons/SearchIcon';
import UploadIcon from './icons/UploadIcon';
import InboxIcon from './icons/InboxIcon';
import { Session } from '@supabase/supabase-js';

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
    flex flex-col items-center justify-center w-full h-full space-y-1
    transition-colors duration-200
    ${isActive ? 'text-pink-500' : 'text-gray-400 hover:text-gray-200'}
  `;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-xl border-t border-gray-800 z-40 pb-safe">
      <div className="flex items-center justify-around h-full max-w-md mx-auto px-2">
        
        {/* Home */}
        <button 
          onClick={() => onNavigate('home')}
          className={navItemClass(currentView === 'home')}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Home</span>
        </button>

        {/* Search (Focuses input on Home or goes to Home) */}
        <button 
          onClick={onSearchClick}
          className={navItemClass(false)}
        >
          <SearchIcon className="w-6 h-6" />
          <span className="text-[9px] uppercase tracking-wider font-bold">Search</span>
        </button>

        {/* Upload (Center Prominent Button) */}
        <div className="relative -top-5">
           <button 
             onClick={onUploadClick}
             className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 to-cyan-600 shadow-[0_0_15px_rgba(236,72,153,0.4)] border-4 border-black text-white transform active:scale-95 transition-transform"
           >
             <UploadIcon className="w-7 h-7" />
           </button>
        </div>

        {/* Inbox */}
        <button 
          onClick={() => onNavigate('inbox')}
          className={navItemClass(currentView === 'inbox')}
        >
           <div className="relative">
             <InboxIcon className="w-6 h-6" />
             {/* Optional: Add unread badge here if available */}
           </div>
          <span className="text-[9px] uppercase tracking-wider font-bold">Inbox</span>
        </button>

        {/* Profile */}
        <button 
          onClick={() => onNavigate('profile')}
          className={navItemClass(currentView === 'profile')}
        >
          {session?.user.user_metadata.avatar_url ? (
            <img 
              src={session.user.user_metadata.avatar_url} 
              alt="Profile" 
              className={`w-6 h-6 rounded-full border ${currentView === 'profile' ? 'border-pink-500' : 'border-gray-600'}`}
            />
          ) : (
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${currentView === 'profile' ? 'border-pink-500 bg-pink-500/20 text-pink-500' : 'border-gray-600 bg-gray-800'}`}>
               {session?.user.email?.[0].toUpperCase() || '?'}
            </div>
          )}
          <span className="text-[9px] uppercase tracking-wider font-bold">Profile</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNav;