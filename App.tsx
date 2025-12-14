import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import ProfileView, { UserProfileData } from './components/ProfileView';
import ChatWindow from './components/ChatWindow';
import InboxView from './components/InboxView';
import { supabase, insertMediaItem } from './lib/supabaseClient';
import Footer from './components/Footer';
import UploadButton from './components/UploadButton';
import UploadModal from './components/UploadModal';
import BottomNav from './components/BottomNav';
import AgeVerificationModal from './components/AgeVerificationModal';
import { MediaType } from './types';

// New Imports for Refactoring
import { useMediaLibrary } from './hooks/useMediaLibrary';
import HomeView from './components/HomeView';

type ViewState = 'home' | 'profile' | 'inbox';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeProfile, setActiveProfile] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  // Auth State
  const [session, setSession] = useState<Session | null>(null);

  // Chat State
  const [activeChatUser, setActiveChatUser] = useState<UserProfileData | null>(null);

  // Data State (via Custom Hook)
  const { photoMedia, videoMedia, isLoading, refresh } = useMediaLibrary();

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Age Verification State
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  // Search Focus Ref for Bottom Nav integration
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadSubmit = async (data: { type: MediaType; src: string; description: string; category: string; tags: string[]; is_premium: boolean; price: number }) => {
    if (!session) return;
    setIsUploading(true);
    try {
        const { error } = await insertMediaItem({
            type: data.type,
            src: data.src,
            description: data.description,
            category: data.category,
            tags: data.tags,
            user_id: session.user.id,
            author: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
            author_avatar: session.user.user_metadata.avatar_url,
            is_premium: data.is_premium,
            price: data.price
        });

        if (error) {
            throw error;
        }

        // Refresh data to show new item
        await refresh();
        setIsUploadModalOpen(false);
        
        // Switch tab to the type uploaded so user sees it immediately
        if (data.type === MediaType.Video) {
            setActiveTab('videos');
        } else {
            setActiveTab('photos');
        }

    } catch (err: any) {
        console.error("Upload error:", err);
        alert(`Failed to add link: ${err.message}`);
    } finally {
        setIsUploading(false);
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
          alert("Please sign in to view your profile.");
          return;
      } else if (view === 'inbox' && !session) {
          alert("Please sign in to view messages.");
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

  const handleUploadClick = () => {
      if (!session) {
          alert("Please sign in to upload media.");
          return;
      }
      setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white relative pb-16 md:pb-0">
      
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
      
      <Footer />
      
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
            {isUploadModalOpen && (
                <UploadModal 
                    onClose={() => setIsUploadModalOpen(false)} 
                    onSubmit={handleUploadSubmit}
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
    </div>
  );
};

export default App;