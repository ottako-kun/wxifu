import React, { useState, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { MediaItem } from '../types';
import MediaGrid from './MediaGrid';
import { updateUserProfile } from '../lib/supabaseClient';
import LoadingSpinner from './icons/LoadingSpinner';
import CloseIcon from './icons/CloseIcon';
import UploadIcon from './icons/UploadIcon';

interface ProfileViewProps {
  session: Session;
  userMedia: MediaItem[];
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, userMedia, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(session.user.user_metadata.full_name || '');
  const [bio, setBio] = useState(session.user.user_metadata.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  // Stats
  const postCount = userMedia.length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await updateUserProfile({
        full_name: displayName,
        bio: bio
      });
      if (error) throw error;
      setIsEditing(false);
      // Force reload to reflect changes or rely on realtime auth listener in App.tsx
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 border-b border-gray-800 pb-12">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 p-1">
            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
               {session.user.user_metadata.avatar_url ? (
                  <img 
                    src={session.user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gray-900">
                    {session.user.email?.[0].toUpperCase()}
                  </div>
               )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-grow text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-light text-white">
              {session.user.user_metadata.full_name || session.user.email?.split('@')[0]}
            </h2>
            <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg border border-gray-700 transition-colors"
                >
                  Edit Profile
                </button>
                <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-8 text-sm md:text-base">
            <div className="flex flex-col md:flex-row gap-1">
                <span className="font-bold text-white">{postCount}</span> 
                <span className="text-gray-400">posts</span>
            </div>
            <div className="flex flex-col md:flex-row gap-1">
                <span className="font-bold text-white">0</span> 
                <span className="text-gray-400">followers</span>
            </div>
            <div className="flex flex-col md:flex-row gap-1">
                <span className="font-bold text-white">0</span> 
                <span className="text-gray-400">following</span>
            </div>
          </div>

          <div className="max-w-md">
            <h3 className="font-bold text-white text-sm mb-1">{session.user.user_metadata.full_name}</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">
              {session.user.user_metadata.bio || "No bio yet."}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Gallery */}
      <div className="space-y-8">
        <div className="flex items-center justify-center gap-12 border-t border-gray-800 -mt-[1px]">
           <button className="flex items-center gap-2 border-t py-4 text-xs font-bold uppercase tracking-widest text-white border-white -mt-[1px]">
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
             Posts
           </button>
        </div>

        {userMedia.length > 0 ? (
          <MediaGrid items={userMedia} />
        ) : (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-16 h-16 rounded-full border-2 border-gray-800 flex items-center justify-center mb-4">
               <UploadIcon className="w-8 h-8 text-gray-600" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Share Photos</h3>
             <p className="text-gray-500 max-w-xs mb-6">When you share photos and videos, they will appear on your profile.</p>
           </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                 <h3 className="font-bold text-white">Edit Profile</h3>
                 <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                    <CloseIcon className="w-5 h-5" />
                 </button>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
                    <textarea 
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none resize-none"
                      placeholder="Tell us about yourself..."
                    />
                 </div>

                 <button
                   type="submit"
                   disabled={isSaving}
                   className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                 >
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;