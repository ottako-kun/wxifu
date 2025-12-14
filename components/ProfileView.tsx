import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { MediaItem } from '../types';
import MediaGrid from './MediaGrid';
import UploadIcon from './icons/UploadIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import EditProfileModal from './EditProfileModal';
import TipModal from './TipModal';
import { useProfileStats } from '../hooks/useProfileStats';
import { useWallet } from '../context/WalletContext';
import { useFollow } from '../hooks/useFollow';
import { useUI } from '../context/UIContext';
import ProfileHeader from './ProfileHeader';

export interface UserProfileData {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    frame?: string;
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
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  // Use Follow Hook
  const { isFollowing, isMutual, isLoading: loadingSocial, toggleFollow } = useFollow(session?.user.id, profileData.id);
  
  // UI Context for Chat
  const { openChat } = useUI();
  
  // Frame State
  const { activeFrame } = useWallet(); // Current user's frame
  const [viewedUserFrame, setViewedUserFrame] = useState('none');
  
  // Stats Logic (Extracted)
  const { followersCount, followingCount, incrementFollowers, decrementFollowers } = useProfileStats(profileData.id);

  // Sync state if profileData changes (e.g. switching viewed profile)
  useEffect(() => {
      // Check for frame in localStorage hack (Simulating DB fetch)
      if (isOwner) {
          setViewedUserFrame(activeFrame);
      } else {
          // In real app, profileData would have 'frame' from DB. 
          // Here we mock it or default to none for others unless we stored it globally
          const stored = localStorage.getItem(`frame_${profileData.id}`);
          setViewedUserFrame(stored || 'none');
      }
  }, [profileData, isOwner, activeFrame]);

  const handleFollowToggleWrapper = async () => {
      if (await toggleFollow(profileData.name)) {
          // Optimistically update stats if successful
          if (isFollowing) {
              decrementFollowers();
          } else {
              incrementFollowers();
          }
          if (onDataChange) onDataChange();
      }
  };

  // Stats
  const postCount = userMedia.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
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
          onTipClick={() => setIsTipModalOpen(true)}
          onMessageClick={openChat}
      />

      {/* Profile Gallery */}
      <div className="space-y-8">
        <div className="flex items-center justify-center gap-12 border-t border-gray-800 -mt-[1px]">
           <button className="flex items-center gap-2 border-t-2 py-4 text-xs font-bold uppercase tracking-widest text-white border-pink-500 -mt-[2px]">
             <span className="w-3 h-3 grid grid-cols-3 gap-[1px]">
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
                <span className="bg-current col-span-1 row-span-1"></span>
             </span>
             Collection
           </button>
        </div>

        {userMedia.length > 0 ? (
          <MediaGrid 
            items={userMedia} 
            onUserClick={onUserClick}
            session={session}
            onDataChange={onDataChange} 
          />
        ) : (
           <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
             <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
               <UploadIcon className="w-8 h-8 text-gray-600" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
             <p className="text-gray-500 max-w-xs mb-6">
                 {isOwner ? "Upload your first photo or video to show it here." : "This user hasn't posted anything yet."}
             </p>
           </div>
        )}
      </div>

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
      
      {/* Tip Modal */}
      {isTipModalOpen && (
          <TipModal 
            recipientId={profileData.id}
            recipientName={profileData.name}
            onClose={() => setIsTipModalOpen(false)}
          />
      )}
    </div>
  );
};

export default ProfileView;