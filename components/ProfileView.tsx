
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// Fixed: Import Session from local types
import { MediaItem, Session } from '../types';
import MediaGrid from './MediaGrid';
import FeedView from './FeedView';
import UploadIcon from './icons/UploadIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import GridIcon from './icons/GridIcon';
import ListIcon from './icons/ListIcon';
import HeartIcon from './icons/HeartIcon';
import EditProfileModal from './EditProfileModal';
import MediaDetailModal from './MediaDetailModal';
import { useProfileStats } from '../hooks/useProfileStats';
import { useFollow } from '../hooks/useFollow';
import { useUI } from '../context/UIContext';
import ProfileHeader from './ProfileHeader';

export interface UserProfileData {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    frame?: string;
    is_verified?: boolean;
}

interface ProfileViewProps {
  session: Session | null;
  profileData: UserProfileData;
  userMedia: MediaItem[];
  onBack: () => void;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  onDataChange?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, profileData, userMedia, onBack, onUserClick, onDataChange }) => {
  const isOwner = session?.user.id === profileData.id;
  
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'liked'>('posts');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Use Follow Hook
  const { isFollowing, isMutual, isLoading: loadingSocial, toggleFollow } = useFollow(session?.user.id, profileData.id);
  
  // UI Context for Chat
  const { openChat } = useUI();
  
  // Frame State
  const [viewedUserFrame, setViewedUserFrame] = useState('none');
  
  // Stats Logic (Extracted)
  const { followersCount, followingCount, incrementFollowers, decrementFollowers } = useProfileStats(profileData.id);

  // Filter for Liked Media (Mock logic: owner only, would be API backed)
  const likedMedia = useMemo(() => {
     if (!isOwner) return [];
     // For demo: randomly select some from global userMedia as liked
     return userMedia.filter((_, i) => i % 3 === 0);
  }, [isOwner, userMedia]);

  const displayItems = activeSubTab === 'posts' ? userMedia : likedMedia;

  // Sync state if profileData changes (e.g. switching viewed profile)
  useEffect(() => {
      if (isOwner) {
          setViewedUserFrame('none');
      } else {
          const stored = localStorage.getItem(`frame_${profileData.id}`);
          setViewedUserFrame(stored || 'none');
      }
  }, [profileData, isOwner]);

  const handleFollowToggleWrapper = async () => {
      if (await toggleFollow(profileData.name)) {
          if (isFollowing) {
              decrementFollowers();
          } else {
              incrementFollowers();
          }
          if (onDataChange) onDataChange();
      }
  };

  const postCount = userMedia.length;

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 max-w-6xl"
    >
       {/* Back Button */}
       <button 
         onClick={onBack}
         className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
       >
          <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-wider">Back to Gallery</span>
       </button>

      <ProfileHeader 
          session={session}
          profileData={profileData}
          isOwner={isOwner}
          postCount={postCount}
          followersCount={followersCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
          isMutual={isMutual}
          loadingSocial={loadingSocial}
          viewedUserFrame={viewedUserFrame}
          onEditClick={() => setIsEditing(true)}
          onFollowToggle={handleFollowToggleWrapper}
          onMessageClick={openChat}
      />

      {/* Profile Gallery Controls */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
             <div className="flex gap-8">
                <button 
                    onClick={() => setActiveSubTab('posts')}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest pb-2 transition-all relative ${activeSubTab === 'posts' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <GridIcon className="w-4 h-4" /> Posts
                    {activeSubTab === 'posts' && (
                        <motion.div 
                            layoutId="profile-tab-pill"
                            className="absolute bottom-0 inset-x-0 h-0.5 bg-pink-500"
                        />
                    )}
                </button>
                {isOwner && (
                    <button 
                        onClick={() => setActiveSubTab('liked')}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest pb-2 transition-all relative ${activeSubTab === 'liked' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <HeartIcon filled={activeSubTab === 'liked'} className="w-4 h-4" /> Liked
                        {activeSubTab === 'liked' && (
                            <motion.div 
                                layoutId="profile-tab-pill"
                                className="absolute bottom-0 inset-x-0 h-0.5 bg-pink-500"
                            />
                        )}
                    </button>
                )}
             </div>
             
             {/* View Toggle */}
             <div className="flex bg-gray-900 border border-gray-800 rounded-full p-0.5 relative">
                 <button 
                     onClick={() => setViewMode('grid')}
                     className={`p-2 rounded-full transition-all relative z-10 ${viewMode === 'grid' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                 >
                     <GridIcon className="w-4 h-4" />
                 </button>
                 <button 
                     onClick={() => setViewMode('feed')}
                     className={`p-2 rounded-full transition-all relative z-10 ${viewMode === 'feed' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                 >
                     <ListIcon className="w-4 h-4" />
                 </button>
                 <motion.div 
                    layoutId="profile-view-pill"
                    className="absolute inset-y-0.5 bg-gray-800 rounded-full shadow-lg"
                    animate={{ 
                        left: viewMode === 'grid' ? '2px' : '34px',
                        width: '32px'
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                 />
             </div>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={`${activeSubTab}-${viewMode}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
            >
                {displayItems.length > 0 ? (
          viewMode === 'grid' ? (
              <MediaGrid 
                items={displayItems} 
                onUserClick={onUserClick}
                session={session}
                onDataChange={onDataChange} 
                onItemClick={setSelectedItemIndex}
              />
          ) : (
              <FeedView
                items={displayItems}
                session={session}
                onUserClick={onUserClick}
                onDataChange={onDataChange}
                isLoading={false}
                onItemClick={setSelectedItemIndex}
              />
          )
                ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    {activeSubTab === 'posts' ? <UploadIcon className="w-8 h-8 text-gray-600" /> : <HeartIcon className="w-8 h-8 text-gray-600" />}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{activeSubTab === 'posts' ? 'No Posts Yet' : 'No Liked Posts'}</h3>
                    <p className="text-gray-500 max-w-xs mb-6">
                        {isOwner 
                            ? (activeSubTab === 'posts' ? "Upload your first photo or video to show it here." : "Posts you've liked will appear here.") 
                            : "This user hasn't posted anything yet."}
                    </p>
                </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>

      {selectedItemIndex !== null && (
            <MediaDetailModal 
                items={displayItems} 
                initialIndex={selectedItemIndex} 
                onClose={() => setSelectedItemIndex(null)} 
                onUserClick={onUserClick}
                session={session || null}
                onDataChange={onDataChange}
            />
      )}

      {/* Edit Profile Modal */}
      {isEditing && isOwner && (
        <EditProfileModal
            currentName={profileData.name}
            currentBio={profileData.bio || ''}
            currentAvatar={profileData.avatar || ''}
            onClose={() => setIsEditing(false)}
            onUpdateSuccess={() => {
                setIsEditing(false);
                window.location.reload();
            }}
        />
      )}
    </motion.div>
  );
};

export default ProfileView;
