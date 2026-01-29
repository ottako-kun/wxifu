
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { UserProfileData } from '../types';

interface UIContextType {
  // Shop State
  isShopOpen: boolean;
  openShop: () => void;
  closeShop: () => void;

  // Chat State
  activeChatUser: UserProfileData | null;
  openChat: (user: UserProfileData) => void;
  closeChat: () => void;

  // Daily Reward State
  isDailyRewardOpen: boolean;
  openDailyReward: () => void;
  closeDailyReward: () => void;

  // Legal Modal State
  activeLegalModal: 'privacy' | 'terms' | null;
  openLegal: (type: 'privacy' | 'terms') => void;
  closeLegal: () => void;

  // Global Media State (TikTok style)
  isGlobalMuted: boolean;
  toggleGlobalMute: () => void;
  showVolumeHUD: boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<UserProfileData | null>(null);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);
  
  const volumeTimerRef = useRef<number | null>(null);

  const openShop = useCallback(() => setIsShopOpen(true), []);
  const closeShop = useCallback(() => setIsShopOpen(false), []);

  const openChat = useCallback((user: UserProfileData) => setActiveChatUser(user), []);
  const closeChat = useCallback(( ) => setActiveChatUser(null), []);

  const openDailyReward = useCallback(() => setIsDailyRewardOpen(true), []);
  const closeDailyReward = useCallback(() => setIsDailyRewardOpen(false), []);

  const openLegal = useCallback((type: 'privacy' | 'terms') => setActiveLegalModal(type), []);
  const closeLegal = useCallback(() => setActiveLegalModal(null), []);

  const toggleGlobalMute = useCallback(() => {
    setIsGlobalMuted(prev => !prev);
    setShowVolumeHUD(true);
    if (volumeTimerRef.current) window.clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = window.setTimeout(() => setShowVolumeHUD(false), 1200);
  }, []);

  return (
    <UIContext.Provider value={{
      isShopOpen, openShop, closeShop,
      activeChatUser, openChat, closeChat,
      isDailyRewardOpen, openDailyReward, closeDailyReward,
      activeLegalModal, openLegal, closeLegal,
      isGlobalMuted, toggleGlobalMute, showVolumeHUD
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
