import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { signInWithGoogle, signOut } from '../lib/supabaseClient';
import GoogleIcon from './icons/GoogleIcon';
import InboxIcon from './icons/InboxIcon';
import CoinIcon from './icons/CoinIcon';
import HomeIcon from './icons/HomeIcon';
import UploadIcon from './icons/UploadIcon';
import { APP_CONFIG } from '../config';
import { useWallet } from '../context/WalletContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface HeaderProps {
  session: Session | null;
  onNavigate?: (view: 'home' | 'profile' | 'inbox') => void;
}

const Header: React.FC<HeaderProps> = ({ session, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { balance, activeFrame } = useWallet();
  const { openShop } = useUI();
  const toast = useToast();
  const scrollDirection = useScrollDirection();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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

  const handleOpenShop = () => {
      if (!session) {
          toast.error("Please sign in to access the Coin Shop.");
          return;
      }
      openShop();
  };

  const handleNavClick = (view: 'home' | 'profile' | 'inbox') => {
      if (onNavigate) onNavigate(view);
  }

  // Hide header when scrolling down, show when scrolling up
  const headerClass = `fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-[60] border-b border-pink-500/20 shadow-lg shadow-pink-900/5 transition-transform duration-300 ${
    scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
  }`;

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-6">
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-x-3 group cursor-pointer">
            <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-900 rounded border border-pink-500 overflow-hidden group-hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-shadow">
                <div className="absolute inset-0 bg-pink-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <span className="text-pink-500 font-black text-lg md:text-xl leading-none select-none relative z-10">{APP_CONFIG.name.charAt(0)}</span>
            </div>
            <div className="flex flex-col">
                <h1
                className="text-xl md:text-2xl font-black text-white tracking-wider uppercase select-none leading-none"
                style={{
                    fontFamily: '"Orbitron", sans-serif',
                    textShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
                }}
                >
                {APP_CONFIG.name}<span className="text-cyan-400">{APP_CONFIG.nameSuffix}</span>
                </h1>
                <span className="text-[0.5rem] md:text-[0.6rem] text-gray-400 tracking-[0.2em] uppercase hidden sm:block">
                {APP_CONFIG.subtitle}
                </span>
            </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-gray-800 pl-4">
                <button onClick={() => handleNavClick('home')} className="px-3 py-1.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                    Gallery
                </button>
                <button onClick={handleOpenShop} className="px-3 py-1.5 text-sm font-bold text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/10 rounded-lg transition-colors">
                    Shop
                </button>
            </nav>
        </div>

        {/* Auth Section */}
        <div className="relative">
          {session ? (
            <div className="flex items-center gap-4">
              {/* Coin Balance - Clickable for Shop */}
              <button 
                  onClick={handleOpenShop}
                  className="hidden md:flex items-center gap-1.5 bg-yellow-900/20 border border-yellow-500/30 px-3 py-1.5 rounded-full hover:bg-yellow-900/40 hover:border-yellow-500 transition-all cursor-pointer group/coin"
                  title="Buy Coins"
              >
                  <CoinIcon className="w-4 h-4 text-yellow-500 group-hover/coin:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-yellow-400 font-orbitron">{balance}</span>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px] font-bold ml-1 opacity-0 group-hover/coin:opacity-100 transition-opacity">
                      +
                  </div>
              </button>

              {/* Mobile Coin Balance (Simple) */}
              <button onClick={handleOpenShop} className="md:hidden flex items-center gap-1 text-yellow-500">
                  <CoinIcon className="w-5 h-5" />
                  <span className="text-xs font-bold">{balance}</span>
              </button>

              {/* Inbox Icon (Visible on Desktop) */}
              <button 
                onClick={handleInboxClick}
                className="hidden sm:flex p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-gray-800"
                title="Messages"
              >
                  <InboxIcon className="w-6 h-6" />
              </button>

              <div 
                className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-800/50 transition-colors"
                onClick={toggleMenu}
              >
                <Avatar 
                    src={session.user.user_metadata.avatar_url} 
                    alt={session.user.email} 
                    frame={activeFrame}
                    size="md"
                />
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-none">
                    {session.user.user_metadata.full_name || session.user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-cyan-400 uppercase tracking-wider">Member</p>
                </div>
              </div>

              {/* Dropdown */}
              {isMenuOpen && (
                 <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 border-b border-gray-800 md:hidden">
                        <p className="text-sm font-bold text-white">{session.user.user_metadata.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span>My Profile</span>
                    </button>
                    
                    <button
                      onClick={handleInboxClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span>Messages</span>
                      <InboxIcon className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    <button
                      onClick={handleOpenShop}
                      className="w-full text-left px-4 py-2 text-sm text-yellow-500 hover:bg-gray-800 hover:text-yellow-400 transition-colors flex items-center justify-between md:hidden"
                    >
                      <span>Coin Shop</span>
                      <CoinIcon className="w-4 h-4" />
                    </button>

                    <div className="h-px bg-gray-800 my-1"></div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                    >
                      Sign Out
                    </button>
                 </div>
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-medium text-sm transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5"
            >
              <GoogleIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
