import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { signInWithGoogle, signOut } from '../lib/supabaseClient';
import GoogleIcon from './icons/GoogleIcon';
import InboxIcon from './icons/InboxIcon';
import CoinIcon from './icons/CoinIcon';
import { APP_CONFIG } from '../gallery-data';
import { useWallet } from '../context/WalletContext';

interface HeaderProps {
  session: Session | null;
  onNavigate?: (view: 'home' | 'profile' | 'inbox') => void;
  onOpenShop?: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, onNavigate, onOpenShop }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { balance } = useWallet();

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

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-20 border-b border-pink-500/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-x-3 group cursor-pointer">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gray-900 rounded border border-pink-500 overflow-hidden">
            <div className="absolute inset-0 bg-pink-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <span className="text-pink-500 font-black text-xl leading-none select-none relative z-10">{APP_CONFIG.name.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <h1
              className="text-2xl font-black text-white tracking-wider uppercase select-none leading-none"
              style={{
                fontFamily: '"Orbitron", sans-serif',
                textShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
              }}
            >
              {APP_CONFIG.name}<span className="text-cyan-400">{APP_CONFIG.nameSuffix}</span>
            </h1>
            <span className="text-[0.6rem] text-gray-400 tracking-[0.2em] uppercase">
              {APP_CONFIG.subtitle}
            </span>
          </div>
        </a>

        {/* Auth Section */}
        <div className="relative">
          {session ? (
            <div className="flex items-center gap-3">
              {/* Coin Balance - Clickable for Shop */}
              <button 
                  onClick={onOpenShop}
                  className="flex items-center gap-1.5 bg-yellow-900/20 border border-yellow-500/30 px-3 py-1.5 rounded-full hover:bg-yellow-900/40 hover:border-yellow-500 transition-all cursor-pointer group/coin"
                  title="Buy Coins"
              >
                  <CoinIcon className="w-4 h-4 text-yellow-500 group-hover/coin:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-yellow-400 font-orbitron">{balance}</span>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-black text-[10px] font-bold ml-1 opacity-0 group-hover/coin:opacity-100 transition-opacity">
                      +
                  </div>
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
                {session.user.user_metadata.avatar_url ? (
                  <img 
                    src={session.user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-9 h-9 rounded-full border-2 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {session.user.email?.[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-none">
                    {session.user.user_metadata.full_name || session.user.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-cyan-400 uppercase tracking-wider">Member</p>
                </div>
              </div>

              {/* Dropdown */}
              {isMenuOpen && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 animate-fade-in z-50">
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={handleInboxClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span>Messages</span>
                      <InboxIcon className="w-4 h-4 text-gray-500" />
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
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;