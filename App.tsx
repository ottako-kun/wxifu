import React, { useState, useMemo, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import Hero from './components/Hero';
import MediaGrid from './components/MediaGrid';
import ProfileView, { UserProfileData } from './components/ProfileView';
import ChatWindow from './components/ChatWindow';
import InboxView from './components/InboxView';
import { fallbackPhotoMedia, fallbackVideoMedia, processMediaItem, APP_CONFIG } from './gallery-data';
import { supabase, insertMediaItem } from './lib/supabaseClient';
import Footer from './components/Footer';
import SearchIcon from './components/icons/SearchIcon';
import SortAscendingIcon from './components/icons/SortAscendingIcon';
import CloseIcon from './components/icons/CloseIcon';
import ChevronRightIcon from './components/icons/ChevronRightIcon';
import LoadingSpinner from './components/icons/LoadingSpinner';
import UploadButton from './components/UploadButton';
import UploadModal from './components/UploadModal';
import { MediaItem, MediaType } from './types';

type ViewState = 'home' | 'profile' | 'inbox';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  // Target profile to view (could be current user or another user)
  const [activeProfile, setActiveProfile] = useState<UserProfileData | null>(null);

  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc'>('default');
  
  // Auth State
  const [session, setSession] = useState<Session | null>(null);

  // Chat State
  const [activeChatUser, setActiveChatUser] = useState<UserProfileData | null>(null);

  // Data State
  const [photoMedia, setPhotoMedia] = useState<MediaItem[]>([]);
  const [videoMedia, setVideoMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(APP_CONFIG.itemsPerPage);

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const fetchData = async () => {
      setIsLoading(true);
      try {
        let fetchedData: any[] = [];

        // Attempt 1: Efficient Join (Requires Foreign Key)
        const { data: joinData, error: joinError } = await supabase
          .from('media')
          .select('*, profiles(name, avatar)')
          .order('created_at', { ascending: false });

        if (!joinError && joinData) {
          fetchedData = joinData;
        } else {
          // Attempt 2: Fallback Manual Fetch (Works if Foreign Key is broken/missing)
          console.warn("Database join failed, falling back to manual fetch...", joinError?.message);
          
          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (mediaError) throw mediaError;

          if (mediaData && mediaData.length > 0) {
             // Extract user IDs to fetch
             const userIds = Array.from(new Set(
                 mediaData
                    .map(m => m.user_id)
                    .filter(id => id && id.length > 20 && !id.startsWith('static'))
             ));
             
             // Fetch profiles manually
             const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, name, avatar')
                .in('id', userIds);
                
             const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
             
             // Stitch data together
             fetchedData = mediaData.map(m => ({
                 ...m,
                 profiles: profileMap.get(m.user_id) || null
             }));
          }
        }

        if (fetchedData.length === 0) {
          console.log("No DB data found (or empty), using fallback.");
          setPhotoMedia(fallbackPhotoMedia);
          setVideoMedia(fallbackVideoMedia);
        } else {
          // Process fetched data
          const fetchedPhotos: MediaItem[] = [];
          const fetchedVideos: MediaItem[] = [];

          fetchedData.forEach((item, index) => {
             const processed = processMediaItem(item, index);
             
             if (processed.type === MediaType.Video) {
                 fetchedVideos.push(processed);
             } else {
                 fetchedPhotos.push(processed);
             }
          });
          
          setPhotoMedia(fetchedPhotos.length > 0 ? fetchedPhotos : fallbackPhotoMedia);
          setVideoMedia(fetchedVideos.length > 0 ? fetchedVideos : fallbackVideoMedia);
        }
      } catch (err: any) {
        console.error("Error fetching media:", err.message);
        setPhotoMedia(fallbackPhotoMedia);
        setVideoMedia(fallbackVideoMedia);
      } finally {
        setIsLoading(false);
      }
  };

  // Fetch Data from Supabase on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmit = async (data: { type: MediaType; src: string; description: string; category: string; tags: string[] }) => {
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
            author_avatar: session.user.user_metadata.avatar_url
        });

        if (error) {
            throw error;
        }

        // Refresh data to show new item
        await fetchData();
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
          // We should ideally fetch the latest profile data here, but session metadata is a decent fallback
          setActiveProfile({
              id: session.user.id,
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
              avatar: session.user.user_metadata.avatar_url,
              bio: session.user.user_metadata.bio
          });
      }
      setCurrentView(view);
      window.scrollTo(0,0);
  };

  const handleUserClick = (user: { id: string; name: string; avatar: string }) => {
      setActiveProfile({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          // Bio is unknown for other users without a separate fetch/table, pass undefined or check session if it's me
          bio: session?.user.id === user.id ? session.user.user_metadata.bio : undefined 
      });
      setCurrentView('profile');
      window.scrollTo(0, 0);
  };

  const itemsToDisplay = activeTab === 'photos' ? photoMedia : videoMedia;
  const galleryName = activeTab === 'photos' ? 'photo' : 'video';

  // Extract unique Categories and Tags dynamically from the current items
  const availableCategories = useMemo(() => {
    const cats = new Set(itemsToDisplay.map(item => item.category).filter(Boolean) as string[]);
    return ['All', ...Array.from(cats)];
  }, [itemsToDisplay]);

  const availableTags = useMemo(() => {
    const tags = new Set(itemsToDisplay.flatMap(item => item.tags || []));
    return Array.from(tags);
  }, [itemsToDisplay]);

  // Reset filters and pagination when changing tabs
  useEffect(() => {
    setSelectedCategory('All');
    setSelectedTags([]);
    setSearchQuery('');
    setSortOrder('default');
    setVisibleCount(APP_CONFIG.itemsPerPage);
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return itemsToDisplay.filter(item => {
      // Improved Search: Checks description, category, tags, and AUTHOR
      const inDescription = item.description?.toLowerCase().includes(query) ?? false;
      const inCategory = item.category?.toLowerCase().includes(query) ?? false;
      const inTags = item.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false;
      const inAuthor = item.author?.toLowerCase().includes(query) ?? false;
      
      const matchesSearch = query === '' || inDescription || inCategory || inTags || inAuthor;
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => item.tags?.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [itemsToDisplay, searchQuery, selectedCategory, selectedTags]);

  const sortedItems = useMemo(() => {
    if (sortOrder === 'asc') {
      return [...filteredItems].sort((a, b) => 
        (a.description || '').localeCompare(b.description || '')
      );
    }
    return filteredItems;
  }, [filteredItems, sortOrder]);

  // Paginated Items
  const visibleItems = useMemo(() => {
    return sortedItems.slice(0, visibleCount);
  }, [sortedItems, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + APP_CONFIG.itemsPerPage);
  };

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'default' : 'asc'));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setVisibleCount(APP_CONFIG.itemsPerPage); // Reset pagination on filter change
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTags([]);
    setSortOrder('default');
    setVisibleCount(APP_CONFIG.itemsPerPage);
  };

  // Media for Profile (Combine both photo and video)
  const profileMedia = useMemo(() => {
    if (!activeProfile) return [];
    const all = [...photoMedia, ...videoMedia];
    // Filter items belonging to the active profile ID
    return all.filter(item => item.user_id === activeProfile.id);
  }, [photoMedia, videoMedia, activeProfile]);

  const handleOpenChat = (user: UserProfileData) => {
      setActiveChatUser(user);
  };

  const handleDataChange = () => {
      fetchData(); // Reload all data when an item is updated or deleted
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white relative">
      <Header 
        session={session} 
        onNavigate={handleNavigate} 
      />
      
      <div className="flex-grow">
        {currentView === 'home' ? (
          <>
            <Hero />
            <main className="container mx-auto px-4 py-8">
              {/* Tabs */}
              <div className="flex justify-center items-center mb-12">
                <div className="flex bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full border border-gray-800 shadow-xl">
                  <button
                    onClick={() => setActiveTab('photos')}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === 'photos' ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Featured Waifu
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${activeTab === 'videos' ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    Video Collection
                  </button>
                </div>
              </div>
              
              {/* Controls Container */}
              <div className="max-w-4xl mx-auto mb-10 space-y-6">
                
                {/* Search and Sort */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-grow w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <SearchIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="search"
                      placeholder={`Search ${galleryName}s, authors, tags...`}
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(APP_CONFIG.itemsPerPage); }}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all shadow-inner"
                      aria-label="Search media"
                    />
                  </div>

                  <button
                    onClick={handleSortToggle}
                    className={`w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-x-2 px-5 py-3 rounded-xl border transition-all duration-300 text-sm font-semibold
                      ${sortOrder === 'asc'
                        ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                      }`}
                  >
                    <SortAscendingIcon className="w-5 h-5" />
                    <span>Sort A-Z</span>
                  </button>
                </div>

                {/* Category Filter */}
                <div className="overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
                  <div className="flex justify-start sm:justify-center space-x-2 min-w-max px-2">
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => { setSelectedCategory(category); setVisibleCount(APP_CONFIG.itemsPerPage); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                          ${selectedCategory === category
                            ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20 transform scale-105'
                            : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Filter */}
                {availableTags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 px-4">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded text-xs transition-colors duration-200 border border-transparent
                          ${selectedTags.includes(tag)
                            ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30'
                            : 'bg-gray-800/50 text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                          }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Active Filters Summary */}
                {(selectedCategory !== 'All' || selectedTags.length > 0 || searchQuery) && (
                  <div className="flex justify-center animate-fade-in">
                     <button 
                      onClick={clearFilters}
                      className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                     >
                       <CloseIcon className="w-3.5 h-3.5" />
                       Clear Active Filters
                     </button>
                  </div>
                )}
              </div>

              {/* Grid Content */}
              {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
                     <LoadingSpinner className="w-12 h-12 text-pink-500" />
                     <p className="text-gray-500 animate-pulse">Loading {galleryName} gallery...</p>
                 </div>
              ) : itemsToDisplay.length > 0 ? (
                sortedItems.length > 0 ? (
                  <div className="animate-fade-in space-y-12">
                    <MediaGrid 
                        items={visibleItems} 
                        onUserClick={handleUserClick} 
                        session={session}
                        onDataChange={handleDataChange}
                    />
                    
                    {/* Load More Button */}
                    {visibleCount < sortedItems.length && (
                      <div className="flex justify-center pt-8">
                        <button
                          onClick={handleLoadMore}
                          className="group relative px-8 py-3 bg-gray-900 hover:bg-black border border-gray-800 hover:border-pink-500 text-gray-300 hover:text-white rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-pink-500/20"
                        >
                          <span className="font-semibold tracking-wider text-sm uppercase">Load More</span>
                          <ChevronRightIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300 rotate-90" />
                        </button>
                        <p className="sr-only">Showing {visibleItems.length} of {sortedItems.length} items</p>
                      </div>
                    )}
                    
                    <div className="text-center text-xs text-gray-600">
                        Showing {Math.min(visibleCount, sortedItems.length)} of {sortedItems.length} results
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[40vh] text-center animate-fade-in border border-dashed border-gray-800 rounded-3xl bg-gray-900/20 m-4">
                    <div className="w-16 h-16 mb-4 text-gray-700">
                        <SearchIcon className="w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">No Results Found</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      We couldn't find any {galleryName}s matching "{searchQuery}" or your selected filters.
                    </p>
                    <button 
                      onClick={clearFilters}
                      className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                  <h2 className="text-3xl font-bold text-gray-400 mb-2">No {galleryName}s yet.</h2>
                  <p className="text-lg text-gray-500">Connect to Supabase or add items to your database to see them here.</p>
                </div>
              )}
            </main>
          </>
        ) : currentView === 'profile' ? (
           <div className="pt-24">
               {activeProfile && (
                   <ProfileView 
                      session={session} 
                      profileData={activeProfile}
                      userMedia={profileMedia} 
                      onBack={() => setCurrentView('home')} 
                      onUserClick={handleUserClick} // Recursive nav if needed
                      onMessageClick={handleOpenChat}
                      onDataChange={handleDataChange}
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
      
      {/* Upload Button & Modal (Only for logged in users) */}
      {session && (
        <>
            <UploadButton onClick={() => setIsUploadModalOpen(true)} isUploading={isUploading} />
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