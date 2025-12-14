
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import ProfileView, { UserProfileData } from './components/ProfileView';
import InboxView from './components/InboxView';
import { supabase } from './lib/supabaseClient';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AgeVerificationModal from './components/AgeVerificationModal';
import GlobalModalLayer from './components/GlobalModalLayer';
import { MediaType } from './types';
import { useMediaLibrary } from './hooks/useMediaLibrary';
import { useMediaUpload } from './hooks/useMediaUpload';
import HomeView from './components/HomeView';

// Notification System
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import { useNotifications } from './hooks/useNotifications';
import { useToast } from './context/ToastContext';

// Confirmation System
import { ConfirmationProvider } from './context/ConfirmationContext';

// Wallet System
import { WalletProvider, useWallet } from './context/WalletContext';

type ViewState = 'home' | 'profile' | 'inbox';

// Inner component to use hooks that require Context
const AppContent: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeProfile, setActiveProfile] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'following' | 'manga'>('photos');

  // Auth State
  const [session, setSession] = useState<Session | null>(null);

  // Chat State
  const [activeChatUser, setActiveChatUser] = useState<UserProfileData | null>(null);
  
  // Coin Shop State
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  // Daily Reward State
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);

  // Data State (via Custom Hook)
  const { photoMedia, videoMedia, followedMedia, isLoading, refresh } = useMediaLibrary(session);

  // Upload State (via Custom Hook)
  const { 
    isModalOpen, 
    isUploading, 
    openModal: handleUploadClick, 
    closeModal: closeUploadModal, 
    handleUploadSubmit 
  } = useMediaUpload({ 
      session, 
      onUploadSuccess: refresh 
  });
  
  // Age Verification State
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  // Legal Pages State
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // Search Focus Ref for Bottom Nav integration
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Toast Hook
  const toast = useToast();
  
  // Wallet Logic
  const { checkIfRewardAvailable, claimDailyReward } = useWallet();
  
  // Initialize Global Notifications
  useNotifications(session);

  // Handle Age Verification
  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified === 'true') {
        setIsAgeVerified(true);
    }
  }, []);

  const handleVerifyAge = () => {
      localStorage.setItem('age-verified', 'true');
      setIsAgeVerified(true);
  };

  // Handle Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If user logs out while on protected views
      if (!session) {
          if (currentView === 'inbox' || (currentView === 'profile' && activeProfile?.id === session?.user.id)) {
              setCurrentView('home');
          }
          setActiveChatUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView, activeProfile]);

  // Check Daily Reward on Session Load
  useEffect(() => {
      // DAILY REWARD DISABLED FOR NOW
      /*
      if (session && isAgeVerified) {
          // Small delay to let app load
          const timer = setTimeout(() => {
              if (checkIfRewardAvailable()) {
                  setIsDailyRewardOpen(true);
              }
          }, 1500);
          return () => clearTimeout(timer);
      }
      */
  }, [session, isAgeVerified, checkIfRewardAvailable]);

  // Wrapped in useCallback to allow children to be memoized
  const onUploadSubmitWrapper = useCallback(async (data: any) => {
      const type = await handleUploadSubmit(data);
      if (type) {
         // Switch tab to the type uploaded so user sees it immediately
         if (type === MediaType.Video) {
            setActiveTab('videos');
        } else {
            setActiveTab('photos');
        }
      }
  }, [handleUploadSubmit]);

  const handleNavigate = useCallback((view: 'home' | 'profile' | 'inbox') => {
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

  // Media for Profile (Combine both photo and video)
  const profileMedia = React.useMemo(() => {
    if (!activeProfile) return [];
    const all = [...photoMedia, ...videoMedia];
    // Filter items belonging to the active profile ID
    return all.filter(item => item.user_id === activeProfile.id);
  }, [photoMedia, videoMedia, activeProfile]);

  const handleOpenChat = useCallback((user: UserProfileData) => {
      setActiveChatUser(user);
  }, []);
  
  const handleOpenShop = useCallback(() => {
      if (!session) {
          toast.error("Please sign in to access the Coin Shop.");
          return;
      }
      setIsShopOpen(true);
  }, [session, toast]);
  
  const handleClaimReward = useCallback(async () => {
      await claimDailyReward();
      setIsDailyRewardOpen(false);
  }, [claimDailyReward]);

  const handleChatClose = useCallback(() => setActiveChatUser(null), []);
  const handleShopClose = useCallback(() => setIsShopOpen(false), []);
  const handleLegalClose = useCallback(() => setActiveLegalModal(null), []);

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white relative pb-20 md:pb-0">
      
      <ToastContainer />

      {/* Age Gate Overlay */}
      {!isAgeVerified && <AgeVerificationModal onVerify={handleVerifyAge} />}

      <Header 
        session={session} 
        onNavigate={handleNavigate}
        onOpenShop={handleOpenShop}
      />
      
      <div className="flex-grow">
        {currentView === 'home' ? (
          <HomeView 
             photoMedia={photoMedia}
             videoMedia={videoMedia}
             followedMedia={followedMedia}
             isLoading={isLoading}
             session={session}
             onUserClick={handleUserClick}
             onDataChange={refresh}
             activeTab={activeTab}
             setActiveTab={setActiveTab}
             searchInputRef={searchInputRef}
          />
        ) : currentView === 'profile' ? (
           <div className="pt-24">
               {activeProfile && (
                   <ProfileView 
                      session={session} 
                      profileData={activeProfile}
                      userMedia={profileMedia} 
                      onBack={() => setCurrentView('home')} 
                      onUserClick={handleUserClick} 
                      onMessageClick={handleOpenChat}
                      onDataChange={refresh}
                   />
               )}
           </div>
        ) : (
            // INBOX VIEW
            <div className="pt-24">
                {session && (
                    <InboxView 
                        currentUserId={session.user.id}
                        onSelectUser={handleOpenChat}
                    />
                )}
            </div>
        )}
      </div>
      
      <Footer 
          onOpenPrivacy={() => setActiveLegalModal('privacy')}
          onOpenTerms={() => setActiveLegalModal('terms')}
      />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav 
        currentView={currentView}
        onNavigate={handleNavigate}
        onUploadClick={handleUploadClick}
        onSearchClick={handleSearchClick}
        session={session}
      />
      
      {/* Global Modals (Extracted for cleaner code and separation of concerns) */}
      <GlobalModalLayer 
          session={session}
          // Upload
          isUploading={isUploading}
          isUploadModalOpen={isModalOpen}
          onUploadClick={handleUploadClick}
          onUploadClose={closeUploadModal}
          onUploadSubmit={onUploadSubmitWrapper}
          // Chat
          activeChatUser={activeChatUser}
          onChatClose={handleChatClose}
          // Shop
          isShopOpen={isShopOpen}
          onShopClose={handleShopClose}
          // Reward
          isDailyRewardOpen={isDailyRewardOpen}
          onClaimReward={handleClaimReward}
          // Legal
          activeLegalModal={activeLegalModal}
          onLegalClose={handleLegalClose}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <WalletProvider>
        <ConfirmationProvider>
          <AppContent />
        </ConfirmationProvider>
      </WalletProvider>
    </ToastProvider>
  );
};

export default App;
