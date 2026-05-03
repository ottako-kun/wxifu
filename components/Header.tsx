
import React, { useState, useEffect } from 'react';
import { Menu, Search, Plus, Bell, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { Session } from '../types';
import { signInWithGoogle, signOut } from '../lib/supabaseClient';
import GoogleIcon from './icons/GoogleIcon';
import { APP_CONFIG } from '../gallery-data';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import { useScrollDirection } from '../hooks/useScrollDirection';
import InboxIcon from './icons/InboxIcon';

interface HeaderProps {
  session: Session | null;
  onNavigate?: (view: 'home' | 'profile' | 'inbox') => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, onNavigate, onMenuClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const { searchQuery, setSearchQuery } = useUI();
  const toast = useToast();
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) onNavigate('home');
  };

  const handleProfileClick = () => {
    if (onNavigate) onNavigate('profile');
    setIsMenuOpen(false);
  };
  
  const handleInboxClick = () => {
    if (onNavigate) onNavigate('inbox');
    setIsMenuOpen(false);
  };

  const handleNavClick = (view: 'home' | 'profile' | 'inbox') => {
      if (onNavigate) onNavigate(view);
  }

  // Refined transitions: slides away when scrolling down, reappears when scrolling up
  // Becomes more "solid" when not at the top
  const headerClass = `fixed top-0 left-0 right-0 z-[60] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
    scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
  } ${
    isAtTop 
      ? 'bg-transparent py-4 border-transparent' 
      : 'bg-black/80 backdrop-blur-2xl py-2 border-b border-pink-500/20 shadow-2xl shadow-black/50'
  }`;

  return (
    <header className={headerClass}>
      <div className="mx-auto px-4 lg:px-6 flex items-center justify-between h-full gap-4 md:gap-8">
        
        <div className="flex items-center gap-4">
            {/* Menu Toggle (Mobile + Sidebar control) */}
            <button 
                onClick={onMenuClick}
                className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Logo and Title */}
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-x-3 group cursor-pointer" title="Return to Home">
                <div className="relative w-8 h-8 flex items-center justify-center bg-gray-950 rounded-lg border border-pink-500/30 overflow-hidden group-hover:border-pink-500 transition-all duration-300">
                    <span className="text-pink-500 font-black text-lg leading-none select-none relative z-10 font-orbitron">{APP_CONFIG.name.charAt(0)}</span>
                </div>
                <h1 className="text-lg font-black text-white tracking-tighter uppercase select-none leading-none hidden sm:block font-orbitron">
                    {APP_CONFIG.name}<span className="text-cyan-400">{APP_CONFIG.nameSuffix}</span>
                </h1>
            </a>
        </div>

        {/* Global Search Bar (Omnipresent) */}
        <div className="flex-grow max-w-2xl hidden md:block">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search neural grid..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full bg-white/5 border border-white/5 hover:border-white/10 focus:border-pink-500/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-pink-500/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 transition-all outline-none"
                    onFocus={() => {
                        if (onNavigate) onNavigate('home');
                    }}
                />
            </div>
        </div>

        {/* Auth & Actions Section */}
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
            onClick={() => onNavigate && onNavigate('home')}
          >
              <Search className="w-5 h-5" />
          </button>
          {session ? (
            <div className="flex items-center gap-3 md:gap-4">
              <button className="hidden sm:flex p-2 text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/5">
                  <Bell className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleInboxClick}
                className="hidden sm:flex p-2 text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
              >
                  <MessageSquare className="w-5 h-5" />
              </button>

              <div 
                className="flex items-center gap-2 cursor-pointer group ml-2"
                onClick={handleProfileClick}
              >
                <Avatar 
                    src={session.user.user_metadata.avatar_url} 
                    alt={session.user.email} 
                    size="sm"
                    className="ring-2 ring-transparent group-hover:ring-pink-500/50 transition-all border-0"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              title="Establish Link"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-pink-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Link Identity</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
