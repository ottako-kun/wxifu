
import React, { useState } from 'react';
import { updateUserProfile } from '../lib/supabaseClient';
import { getDriveId, getGoogleDriveImageUrl } from '../lib/googleDrive';
import CloseIcon from './icons/CloseIcon';

interface EditProfileModalProps {
  currentName: string;
  currentBio: string;
  currentAvatar: string;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  currentName, 
  currentBio, 
  currentAvatar, 
  onClose,
  onUpdateSuccess
}) => {
  const [displayName, setDisplayName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Process Avatar URL for Google Drive links using utility
    let finalAvatarUrl = avatarUrl;
    if (avatarUrl) {
        const driveId = getDriveId(avatarUrl);
        if (driveId) {
             finalAvatarUrl = getGoogleDriveImageUrl(driveId);
        }
    }

    try {
      const { error } = await updateUserProfile({
        full_name: displayName,
        bio: bio,
        avatar_url: finalAvatarUrl
      });
      if (error) throw error;
      onUpdateSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
             <h3 className="font-bold text-white">Edit Profile</h3>
             <button onClick={onClose} className="text-gray-400 hover:text-white">
                <CloseIcon className="w-5 h-5" />
             </button>
          </div>
          
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
             {/* Avatar Input */}
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avatar Image Link</label>
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => {e.currentTarget.style.display='none'}} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">?</div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <input 
                        type="text" 
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none text-sm"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Paste a direct link or a Google Drive link.</p>
             </div>

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
               className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-pink-500/20"
             >
               {isSaving ? 'Saving...' : 'Save Changes'}
             </button>
          </form>
       </div>
    </div>
  );
};

export default EditProfileModal;
