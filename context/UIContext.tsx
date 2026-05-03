
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { UserProfileData, DensityType } from '../types';

interface UIContextType {
  // Chat State
  activeChatUser: UserProfileData | null;
  openChat: (user: UserProfileData) => void;
  closeChat: () => void;

  // Legal Modal State
  activeLegalModal: 'privacy' | 'terms' | null;
  openLegal: (type: 'privacy' | 'terms') => void;
  closeLegal: () => void;

  // Global Media State (TikTok style)
  isGlobalMuted: boolean;
  toggleGlobalMute: () => void;
  showVolumeHUD: boolean;

  // Density State
  density: DensityType;
  setDensity: (density: DensityType) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Global Category
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChatUser, setActiveChatUser] = useState<UserProfileData | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [showVolumeHUD, setShowVolumeHUD] = useState(false);
  const [density, setDensityState] = useState<DensityType>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('For You');
  
  const volumeTimerRef = useRef<number | null>(null);

  // Persistence for Density
  useEffect(() => {
    const savedDensity = localStorage.getItem('ui_density') as DensityType;
    if (savedDensity && ['compact', 'standard', 'large'].includes(savedDensity)) {
      setDensityState(savedDensity);
    }
  }, []);

  const setDensity = useCallback((newDensity: DensityType) => {
    setDensityState(newDensity);
    localStorage.setItem('ui_density', newDensity);
  }, []);

  const openChat = useCallback((user: UserProfileData) => setActiveChatUser(user), []);
  const closeChat = useCallback(( ) => setActiveChatUser(null), []);

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
      activeChatUser, openChat, closeChat,
      activeLegalModal, openLegal, closeLegal,
      isGlobalMuted, toggleGlobalMute, showVolumeHUD,
      density, setDensity,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory
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
