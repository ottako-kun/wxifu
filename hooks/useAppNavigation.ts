
import { useState, useEffect, useRef, useCallback } from 'react';
// Fixed: Import Session from local types
import { supabase } from '../lib/supabaseClient';
import { UserProfileData } from '../components/ProfileView';
import { useToast } from '../context/ToastContext';
import { useUI } from '../context/UIContext';
import { useMediaLibrary } from './useMediaLibrary';
import { Session } from '../types';

export type ViewState = 'home' | 'profile' | 'inbox';

export const useAppNavigation = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeProfile, setActiveProfile] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'following'>('photos');
  
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  
  // Search Ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toast = useToast();
  const { closeChat } = useUI();
  
  // Data Logic
  const { photoMedia, videoMedia, followedMedia, isLoading, error, refresh } = useMediaLibrary(session);

  // Handle Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      // If user logs out while on protected views
      if (!session) {
          if (currentView === 'inbox' || (currentView === 'profile' && activeProfile?.id === session?.user.id)) {
              setCurrentView('home');
          }
          closeChat();
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView, activeProfile, closeChat]);

  // Handlers
  const handleNavigate = useCallback((view: ViewState) => {
      if (view === 'profile' && session) {
          // Navigating to "My Profile"
          setActiveProfile({
              id: session.user.id,
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
              avatar: session.user.user_metadata.avatar_url,
              bio: session.user.user_metadata.bio
          });
      } else if (view === 'profile' && !session) {
          toast.error("Please sign in to view your profile.");
          return;
      } else if (view === 'inbox' && !session) {
          toast.error("Please sign in to view messages.");
          return;
      }
      
      setCurrentView(view);
      window.scrollTo(0,0);
  }, [session, toast]);

  const handleUserClick = useCallback((user: { id: string; name: string; avatar: string }) => {
      setActiveProfile({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: session?.user.id === user.id ? session.user.user_metadata.bio : undefined 
      });
      setCurrentView('profile');
      window.scrollTo(0, 0);
  }, [session]);

  const handleSearchClick = useCallback(() => {
      if (currentView !== 'home') {
          handleNavigate('home');
          // Add a small timeout to allow view transition before focusing
          setTimeout(() => {
              searchInputRef.current?.focus();
          }, 100);
      } else {
          searchInputRef.current?.focus();
      }
  }, [currentView, handleNavigate]);

  return {
      currentView,
      setCurrentView,
      activeProfile,
      setActiveProfile,
      activeTab,
      setActiveTab,
      session,
      searchInputRef,
      handleNavigate,
      handleUserClick,
      handleSearchClick,
      // Data passed through
      photoMedia,
      videoMedia,
      followedMedia,
      isLoading,
      error,
      refresh
  };
};
