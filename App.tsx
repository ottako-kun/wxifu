
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

const AppContent: React.FC = () => {
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

  const { openDailyReward } = useUI();
  const { checkIfRewardAvailable } = useWallet();
  
  // Layout State: Grid vs TikTok-style Feed
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');

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
  
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  
  useNotifications(session);

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

  useEffect(() => {
      if (session && isAgeVerified) {
          const timer = setTimeout(() => {
              if (checkIfRewardAvailable()) {
                  openDailyReward();
              }
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [session, isAgeVerified, checkIfRewardAvailable, openDailyReward]);

  const onUploadSubmitWrapper = useCallback(async (data: any) => {
      const type = await handleUploadSubmit(data);
      if (type) {
         if (type === MediaType.Video) {
            setActiveTab('videos');
            setViewMode('feed'); // Auto-switch to feed for videos
        } else {
            setActiveTab('photos');
        }
      }
  }, [handleUploadSubmit, setActiveTab]);

  const profileMedia = React.useMemo(() => {
    if (!activeProfile) return [];
    const all = [...photoMedia, ...videoMedia];
    return all.filter(item => item.user_id === activeProfile.id);
  }, [photoMedia, videoMedia, activeProfile]);

  return (
    <div className="min-h-screen bg-[#020202] text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white relative pb-16 md:pb-0 overflow-x-hidden">
      
      <ToastContainer />

      {!isAgeVerified && <AgeVerificationModal onVerify={handleVerifyAge} />}

      <Header 
        session={session} 
        onNavigate={handleNavigate}
      />
      
      <div className={`flex-grow ${viewMode === 'feed' && currentView === 'home' ? 'pt-0' : 'pt-0'}`}>
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
             viewMode={viewMode}
             onViewModeChange={setViewMode}
          />
        ) : currentView === 'profile' ? (
           <div className="pt-16 md:pt-24 min-h-screen">
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
            <div className="pt-16 md:pt-24 min-h-screen">
                {session && (
                    <InboxView 
                        currentUserId={session.user.id}
                    />
                )}
            </div>
        )}
      </div>
      
      {currentView !== 'home' || viewMode === 'grid' ? <Footer /> : null}
      
      <BottomNav 
        currentView={currentView}
        onNavigate={handleNavigate}
        onUploadClick={handleUploadClick}
        onSearchClick={handleSearchClick}
        session={session}
      />
      
      <GlobalModalLayer 
          session={session}
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
