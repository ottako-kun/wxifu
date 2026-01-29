import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ProfileView from './components/ProfileView';
import InboxView from './components/InboxView';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AgeVerificationModal from './components/AgeVerificationModal';
import GlobalModalLayer from './components/GlobalModalLayer';
import { MediaType } from './types';
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

// UI State System
import { UIProvider, useUI } from './context/UIContext';

// App Logic Hooks
import { useAppNavigation } from './hooks/useAppNavigation';

// Inner component to use hooks that require Context
const AppContent: React.FC = () => {
  // Use Navigation Logic Hook
  const {
      currentView,
      setCurrentView,
      activeProfile,
      activeTab,
      setActiveTab,
      session,
      searchInputRef,
      handleNavigate,
      handleUserClick,
      handleSearchClick,
      photoMedia,
      videoMedia,
      followedMedia,
      isLoading,
      error,
      refresh
  } = useAppNavigation();

  // UI Context Access
  const { openDailyReward } = useUI();
  const { checkIfRewardAvailable } = useWallet();

  // Upload State (via Custom Hook) - Kept here to trigger 'refresh'
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

  // Check Daily Reward on Session Load
  useEffect(() => {
      // DAILY REWARD CHECK
      if (session && isAgeVerified) {
          // Small delay to let app load
          const timer = setTimeout(() => {
              if (checkIfRewardAvailable()) {
                  openDailyReward();
              }
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [session, isAgeVerified, checkIfRewardAvailable, openDailyReward]);

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
  }, [handleUploadSubmit, setActiveTab]);

  // Media for Profile (Combine both photo and video)
  const profileMedia = React.useMemo(() => {
    if (!activeProfile) return [];
    const all = [...photoMedia, ...videoMedia];
    // Filter items belonging to the active profile ID
    return all.filter(item => item.user_id === activeProfile.id);
  }, [photoMedia, videoMedia, activeProfile]);

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white relative pb-20 md:pb-0">
      
      <ToastContainer />

      {/* Age Gate Overlay */}
      {!isAgeVerified && <AgeVerificationModal onVerify={handleVerifyAge} />}

      <Header 
        session={session} 
        onNavigate={handleNavigate}
      />
      
      <div className="flex-grow">
        {currentView === 'home' ? (
          <HomeView 
             photoMedia={photoMedia}
             videoMedia={videoMedia}
             followedMedia={followedMedia}
             isLoading={isLoading}
             error={error}
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
                    />
                )}
            </div>
        )}
      </div>
      
      <Footer />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav 
        currentView={currentView}
        onNavigate={handleNavigate}
        onUploadClick={handleUploadClick}
        onSearchClick={handleSearchClick}
        session={session}
      />
      
      {/* Global Modals */}
      <GlobalModalLayer 
          session={session}
          // Upload specifics managed here
          isUploading={isUploading}
          isUploadModalOpen={isModalOpen}
          onUploadClick={handleUploadClick}
          onUploadClose={closeUploadModal}
          onUploadSubmit={onUploadSubmitWrapper}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <WalletProvider>
        <ConfirmationProvider>
          <UIProvider>
            <AppContent />
          </UIProvider>
        </ConfirmationProvider>
      </WalletProvider>
    </ToastProvider>
  );
};

export default App;