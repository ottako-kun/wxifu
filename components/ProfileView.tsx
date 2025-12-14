import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { MediaItem } from '../types';
import MediaGrid from './MediaGrid';
import { getFollowStatus, followUser, unfollowUser, getProfileStats, supabase } from '../lib/supabaseClient';
import UploadIcon from './icons/UploadIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChatIcon from './icons/ChatIcon';
import CloseIcon from './icons/CloseIcon';
import EditProfileModal from './EditProfileModal';

export interface UserProfileData {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
}

interface ProfileViewProps {
  session: Session | null;
  profileData: UserProfileData;
  userMedia: MediaItem[];
  onBack: () => void;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  onMessageClick?: (user: UserProfileData) => void;
  onDataChange?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, profileData, userMedia, onBack, onUserClick, onMessageClick, onDataChange }) => {
  const isOwner = session?.user.id === profileData.id;
  
  const [isEditing, setIsEditing] = useState(false);

  // Social State
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(false);
  
  // Stats State
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Sync state if profileData changes (e.g. switching viewed profile)
  useEffect(() => {
      // Reset social state
      setIsFollowing(false);
      setIsMutual(false);
  }, [profileData]);

  // Fetch Stats (Followers/Following) and Subscribe to Changes
  useEffect(() => {
     const fetchStats = async () => {
         const stats = await getProfileStats(profileData.id);
         setFollowersCount(stats.followers);
         setFollowingCount(stats.following);
     };

     fetchStats();

     // Realtime Subscription to update counts when someone follows/unfollows
     const channel = supabase
        .channel(`public:follows:${profileData.id}`)
        .on(
            'postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'follows',
                filter: `following_id=eq.${profileData.id}` 
            }, 
            () => {
                // If someone follows/unfollows THIS user, refresh followers count
                fetchStats();
            }
        )
        .on(
            'postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'follows',
                filter: `follower_id=eq.${profileData.id}` 
            }, 
            () => {
                // If THIS user follows/unfollows someone, refresh following count
                fetchStats();
            }
        )
        .subscribe();

     return () => {
         supabase.removeChannel(channel);
     };
  }, [profileData.id]);

  // Check Follow Status (Am I following them?)
  useEffect(() => {
    if (session && !isOwner) {
        const checkStatus = async () => {
            setLoadingSocial(true);
            const { isFollowing, isMutual } = await getFollowStatus(session.user.id, profileData.id);
            setIsFollowing(isFollowing);
            setIsMutual(isMutual);
            setLoadingSocial(false);
        };
        checkStatus();
    }
  }, [session, profileData.id, isOwner]);

  const handleFollowToggle = async () => {
      if (!session) return;
      setLoadingSocial(true);
      try {
          if (isFollowing) {
              await unfollowUser(session.user.id, profileData.id);
              setIsFollowing(false);
              setIsMutual(false); // Can't be mutual if I don't follow
              setFollowersCount(prev => Math.max(0, prev - 1)); // Optimistic update
          } else {
              await followUser(session.user.id, profileData.id);
              setIsFollowing(true);
              // Check mutual status again immediately to update UI if they were already following me
              const { isMutual } = await getFollowStatus(session.user.id, profileData.id);
              setIsMutual(isMutual);
              setFollowersCount(prev => prev + 1); // Optimistic update
          }
          // Refresh global data (like Following tab in Home)
          if (onDataChange) onDataChange();
      } catch (err) {
          console.error("Follow action failed", err);
      } finally {
          setLoadingSocial(false);
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

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 border-b border-gray-800 pb-12">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 p-1 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
               {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gray-900">
                    {profileData.name?.[0]?.toUpperCase() || '?'}
                  </div>
               )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-grow text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 mb-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-orbitron">
                {profileData.name || 'Anonymous User'}
                </h2>
                
                {isOwner ? (
                    <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-bold uppercase tracking-wider rounded-full border border-gray-700 transition-colors"
                    >
                    Edit Profile
                    </button>
                ) : session ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleFollowToggle}
                            disabled={loadingSocial}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg ${
                                isFollowing 
                                ? 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-red-900/50 hover:border-red-500/50 hover:text-red-300' 
                                : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5'
                            }`}
                        >
                            {loadingSocial ? '...' : isFollowing ? 'Following' : 'Follow'}
                        </button>
                        
                        {isMutual && onMessageClick && (
                            <button
                                onClick={() => onMessageClick(profileData)}
                                className="px-4 py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 rounded-full hover:bg-cyan-800/50 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                                aria-label="Send Message"
                            >
                                <ChatIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : null}
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-8 text-sm md:text-base mb-6">
            <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-white text-xl">{postCount}</span> 
                <span className="text-gray-500 text-xs uppercase tracking-wider">posts</span>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-white text-xl animate-fade-in">{followersCount}</span> 
                <span className="text-gray-500 text-xs uppercase tracking-wider">followers</span>
            </div>
            
            <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-white text-xl animate-fade-in">{followingCount}</span> 
                <span className="text-gray-500 text-xs uppercase tracking-wider">following</span>
            </div>
          </div>

          <div className="max-w-xl mx-auto md:mx-0">
            {profileData.bio ? (
                 <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed border-l-2 border-pink-500/50 pl-4">
                 {profileData.bio}
                 </p>
            ) : (
                <p className="text-gray-600 text-sm italic">
                    {isOwner ? "Add a bio to tell people about yourself." : "This user hasn't written a bio yet."}
                </p>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ProfileView;