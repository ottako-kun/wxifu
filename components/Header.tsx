
import React, { useState, useEffect } from 'react';
import { Session } from '../types';
import { signInWithGoogle, signOut } from '../lib/supabaseClient';
import GoogleIcon from './icons/GoogleIcon';
import InboxIcon from './icons/InboxIcon';
import CoinIcon from './icons/CoinIcon';
import { APP_CONFIG } from '../gallery-data';
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
  const [isAtTop, setIsAtTop] = useState(true);
  const { balance, activeFrame } = useWallet();
  const { openShop } = useUI();
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
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 md:gap-6">
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-x-3 group cursor-pointer" title="Return to Home">
            <div className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-gray-950 rounded-xl border border-pink-500/30 overflow-hidden group-hover:border-pink-500 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300">
                <div className="absolute inset-0 bg-pink-500 opacity-5 group-hover:opacity-20 transition-opacity"></div>
                <span className="text-pink-500 font-black text-xl md:text-2xl leading-none select-none relative z-10 font-orbitron">{APP_CONFIG.name.charAt(0)}</span>
                {/* Neural Pulse Status */}
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
            </div>
            <div className="flex flex-col">
                <h1
                className="text-xl md:text-2xl font-black text-white tracking-wider uppercase select-none leading-none flex items-center gap-1"
                style={{
                    fontFamily: '"Orbitron", sans-serif',
                    textShadow: isAtTop ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
                }}
                >
                {APP_CONFIG.name}<span className="text-cyan-400">{APP_CONFIG.nameSuffix}</span>
                </h1>
                <span className={`text-[0.5rem] md:text-[0.6rem] text-gray-400 tracking-[0.25em] uppercase hidden sm:block transition-opacity duration-500 ${isAtTop ? 'opacity-100' : 'opacity-60'}`}>
                {APP_CONFIG.subtitle}
                </span>
            </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-white/10 pl-6">
                <button onClick={() => handleNavClick('home')} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    Neural Feed
                </button>
                <button onClick={handleOpenShop} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/10 rounded-lg transition-all">
                    Marketplace
                </button>
            </nav>
        </div>

        {/* Auth Section */}
        <div className="relative">
          {session ? (
            <div className="flex items-center gap-3 md:gap-5">
              {/* Coin Balance */}
              <button 
                  onClick={handleOpenShop}
                  className="hidden sm:flex items-center gap-2 bg-yellow-950/20 border border-yellow-500/20 px-3 py-1.5 rounded-full hover:bg-yellow-900/40 hover:border-yellow-500/50 transition-all group/coin"
                  title="Your Neural Credits"
              >
                  <CoinIcon className="w-3.5 h-3.5 text-yellow-500 group-hover/coin:scale-110 transition-transform" />
                  <span className="text-[11px] font-black text-yellow-400 font-orbitron">{balance}</span>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px] font-bold ml-1">
                      +
                  </div>
              </button>

              {/* Inbox Icon */}
              <button 
                onClick={handleInboxClick}
                className="hidden md:flex p-2.5 text-gray-400 hover:text-cyan-400 transition-all rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
                title="Transmissions"
              >
                  <InboxIcon className="w-5 h-5" />
              </button>

              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Avatar 
                    src={session.user.user_metadata.avatar_url} 
                    alt={session.user.email} 
                    frame={activeFrame}
                    size="md"
                    className="group-hover:scale-105 transition-transform"
                />
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-white leading-none uppercase tracking-wider">
                    {session.user.user_metadata.full_name || 'Operative'}
                  </p>
                  <p className="text-[9px] text-cyan-400 uppercase tracking-[0.2em] mt-1 font-bold">Authorized</p>
                </div>
              </div>

              {/* Dropdown */}
              {isMenuOpen && (
                 <div className="absolute right-0 top-full mt-4 w-60 bg-gray-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-3 animate-fade-in z-50 backdrop-blur-3xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/5">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{session.user.user_metadata.full_name}</p>
                        <p className="text-[9px] text-gray-500 truncate mt-1">{session.user.email}</p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                          <span>Identity Module</span>
                        </button>
                        
                        <button
                          onClick={handleInboxClick}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                              <span>Transmissions</span>
                          </div>
                          <InboxIcon className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        
                        <button
                          onClick={handleOpenShop}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                              <span>Neural Shop</span>
                          </div>
                          <CoinIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="h-px bg-white/5 my-2 mx-3"></div>
                    <div className="px-2 pb-1">
                        <button
                          onClick={() => { signOut(); setIsMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
                        >
                          Disconnect
                        </button>
                    </div>
                 </div>
              )}
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
