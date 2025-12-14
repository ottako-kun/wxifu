
import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import ProfileView, { UserProfileData } from './components/ProfileView';
import ChatWindow from './components/ChatWindow';
import InboxView from './components/InboxView';
import { supabase } from './lib/supabaseClient';
import Footer from './components/Footer';
import UploadButton from './components/UploadButton';
import UploadModal from './components/UploadModal';
import BottomNav from './components/BottomNav';
import AgeVerificationModal from './components/AgeVerificationModal';
import LegalModal from './components/LegalModal';
import CoinShopModal from './components/CoinShopModal';
import DailyRewardModal from './components/DailyRewardModal';
import { MediaType } from './types';
import { useMediaLibrary } from './hooks/useMediaLibrary';
import { useMediaUpload } from './hooks/useMediaUpload';
import HomeView from './components/HomeView';
import { APP_CONFIG } from './gallery-data';

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

  const onUploadSubmitWrapper = async (data: any) => {
      const type = await handleUploadSubmit(data);
      if (type) {
         // Switch tab to the type uploaded so user sees it immediately
         if (type === MediaType.Video) {
            setActiveTab('videos');
        } else {
            setActiveTab('photos');
        }
      }
  };

  const handleNavigate = (view: 'home' | 'profile' | 'inbox') => {
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
  };
  
  const handleSearchClick = () => {
      if (currentView !== 'home') {
          handleNavigate('home');
          // Add a small timeout to allow view transition before focusing
          setTimeout(() => {
              searchInputRef.current?.focus();
          }, 100);
      } else {
          searchInputRef.current?.focus();
      }
  };

  const handleUserClick = (user: { id: string; name: string; avatar: string }) => {
      setActiveProfile({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: session?.user.id === user.id ? session.user.user_metadata.bio : undefined 
      });
      setCurrentView('profile');
      window.scrollTo(0, 0);
  };

  // Media for Profile (Combine both photo and video)
  const profileMedia = React.useMemo(() => {
    if (!activeProfile) return [];
    const all = [...photoMedia, ...videoMedia];
    // Filter items belonging to the active profile ID
    return all.filter(item => item.user_id === activeProfile.id);
  }, [photoMedia, videoMedia, activeProfile]);

  const handleOpenChat = (user: UserProfileData) => {
      setActiveChatUser(user);
  };
  
  const handleOpenShop = () => {
      if (!session) {
          toast.error("Please sign in to access the Coin Shop.");
          return;
      }
      setIsShopOpen(true);
  };
  
  const handleClaimReward = async () => {
      await claimDailyReward();
      setIsDailyRewardOpen(false);
  };

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
                        onSelectUser={(user) => {
                            setActiveChatUser(user);
                        }}
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
      
      {/* Upload Button (Desktop Only via CSS) & Modal */}
      {session && (
        <>
            <UploadButton onClick={handleUploadClick} isUploading={isUploading} />
            {isModalOpen && (
                <UploadModal 
                    onClose={closeUploadModal} 
                    onSubmit={onUploadSubmitWrapper}
                    isSubmitting={isUploading}
                />
            )}
        </>
      )}

      {/* Chat Window */}
      {session && activeChatUser && (
          <ChatWindow 
              currentUser={{ id: session.user.id }}
              targetUser={activeChatUser}
              onClose={() => setActiveChatUser(null)}
          />
      )}
      
      {/* Coin Shop Modal */}
      {isShopOpen && (
          <CoinShopModal onClose={() => setIsShopOpen(false)} />
      )}
      
      {/* Daily Reward Modal */}
      {isDailyRewardOpen && (
          <DailyRewardModal onClaim={handleClaimReward} />
      )}

      {/* Legal Modals */}
      {activeLegalModal === 'privacy' && (
        <LegalModal title="Privacy Policy" onClose={() => setActiveLegalModal(null)}>
            <div className="space-y-4">
                <p><strong className="text-white block mb-1">1. Introduction</strong>Welcome to {APP_CONFIG.name}. We are committed to protecting your privacy and ensuring you have a safe experience on our platform.</p>
                <p><strong className="text-white block mb-1">2. Data Collection</strong>We collect minimal data required for authentication via Google (email, name, avatar). We also store the media files you upload and any metadata associated with them (descriptions, tags). We do not collect real names unless provided.</p>
                <p><strong className="text-white block mb-1">3. Data Usage</strong>Your data is used solely to provide the gallery service, display your public profile, and facilitate social interactions (likes, comments, messages). We do not sell your personal data to third parties.</p>
                <p><strong className="text-white block mb-1">4. Cookies & Storage</strong>We use cookies and local storage for session management to keep you logged in and to remember your preferences (e.g., age verification status).</p>
                <p><strong className="text-white block mb-1">5. Third-Party Services</strong>We use Supabase for database and authentication services, and Google for user login. Please refer to their respective privacy policies for how they handle data.</p>
                <p><strong className="text-white block mb-1">6. Content Visibility</strong>Please be aware that any content you upload or comments you make are public and viewable by other users of the site.</p>
            </div>
        </LegalModal>
      )}

      {activeLegalModal === 'terms' && (
        <LegalModal title="Terms of Service" onClose={() => setActiveLegalModal(null)}>
            <div className="space-y-4">
                <p><strong className="text-white block mb-1">1. Age Requirement</strong>You must be at least 18 years old (or the age of majority in your jurisdiction) to access this site. By entering and using this service, you legally confirm you are an adult.</p>
                <p><strong className="text-white block mb-1">2. User Generated Content</strong>You retain full ownership of the content you upload. By uploading content to {APP_CONFIG.name}, you grant us a worldwide, non-exclusive, royalty-free license to display, reproduce, and distribute your content on this platform.</p>
                <p><strong className="text-white block mb-1">3. Prohibited Content</strong>We have a <span className="text-red-400 font-bold">zero-tolerance policy</span> for illegal content. You may not upload content that depicts non-consensual sexual acts, child sexual abuse material (CSAM), real-world violence, or any content illegal under US or international law.</p>
                <p><strong className="text-white block mb-1">4. Conduct</strong>Harassment, hate speech, and spamming are strictly prohibited. We aim to foster a respectful community for artists and enthusiasts.</p>
                <p><strong className="text-white block mb-1">5. Account Termination</strong>We reserve the right to suspend or ban any account found violating these terms, at our sole discretion, without prior notice.</p>
                <p><strong className="text-white block mb-1">6. Disclaimer</strong>This site is provided "as is". We are not responsible for user-submitted content. View discretion is advised.</p>
            </div>
        </LegalModal>
      )}
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
