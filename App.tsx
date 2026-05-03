
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
import { cn } from './lib/utils';
import HomeView from './components/HomeView';
import Sidebar from './components/Sidebar';

// Notification System
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import { useNotifications } from './hooks/useNotifications';
import { useToast } from './context/ToastContext';

// Confirmation System
import { ConfirmationProvider } from './context/ConfirmationContext';

// UI State System
import { UIProvider, useUI } from './context/UIContext';

// App Logic Hooks
import { useAppNavigation } from './hooks/useAppNavigation';

import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useUI();
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

  // Layout State: Grid vs TikTok-style Feed
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const onUploadSubmitWrapper = useCallback(async (data: any) => {
      const type = await handleUploadSubmit(data);
      if (type) {
         if (data.category === 'GIFs') {
            setActiveTab('photos');
            setSelectedCategory('GIFs');
            setViewMode('grid');
         } else if (type === MediaType.Video) {
            setActiveTab('videos');
            setSelectedCategory('Videos');
            setViewMode('feed'); // Auto-switch to feed for videos
        } else {
            setActiveTab('photos');
            setSelectedCategory('Images');
            setViewMode('grid');
        }
      }
  }, [handleUploadSubmit, setActiveTab, setSelectedCategory]);

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
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex flex-1 pt-0 overflow-hidden">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          currentView={currentView}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onUploadClick={handleUploadClick}
        />

        <main className={cn(
            "flex-grow transition-all duration-300 lg:pl-[260px] pt-14 md:pt-16 outline-none",
            viewMode === 'feed' && currentView === 'home' ? "pt-0 md:pt-0" : ""
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex-grow flex flex-col"
            >
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
                 <div className="pt-16 md:pt-24 min-h-screen px-4 max-w-6xl mx-auto w-full">
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
                  <div className="pt-16 md:pt-24 min-h-screen px-4 max-w-4xl mx-auto w-full">
                      {session ? (
                          <InboxView 
                              currentUserId={session.user.id}
                          />
                      ) : (
                          <div className="flex flex-col items-center justify-center py-32 text-center">
                              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                                  <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              </div>
                              <h2 className="text-xl font-bold text-white mb-2">Auth Required</h2>
                              <p className="text-gray-500 mb-8">Sign in with your Google account to access messages.</p>
                              <button onClick={() => {/* Sign in trigger handled by header usually */}} className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-xl text-xs">Verify Identity</button>
                          </div>
                      )}
                  </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {currentView !== 'home' || viewMode === 'grid' ? <Footer /> : null}
        </main>
      </div>
      
      <BottomNav 
        currentView={currentView}
        onNavigate={handleNavigate}
        setActiveTab={setActiveTab}
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
      <ConfirmationProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </ConfirmationProvider>
    </ToastProvider>
  );
};

export default App;
