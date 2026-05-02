
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { updateUserProfile } from '../lib/supabaseClient';
import { getDriveId, getGoogleDriveImageUrl } from '../lib/googleDrive';
import CloseIcon from './icons/CloseIcon';
import PhotoIcon from './icons/PhotoIcon';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Process Avatar URL for Google Drive links using utility
    let finalAvatarUrl = avatarUrl;
    if (avatarUrl && !avatarUrl.startsWith('data:')) {
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
       <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
       >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gray-900/30">
             <div>
                <h3 className="font-bold text-white text-lg font-orbitron uppercase tracking-widest">Aesthetic Tuning</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Profile Customization</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <CloseIcon className="w-5 h-5" />
             </button>
          </div>
          
          <form onSubmit={handleSaveProfile} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
             {/* Avatar Customization */}
             <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500/20 bg-gray-900 shadow-[0_0_50px_rgba(236,72,153,0.1)] relative">
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={avatarUrl}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={avatarUrl || 'https://via.placeholder.com/150'} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {e.currentTarget.src = 'https://via.placeholder.com/150'}}
                            />
                        </AnimatePresence>
                        
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 backdrop-blur-[2px]"
                        >
                            <PhotoIcon className="w-8 h-8" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Change Identity</span>
                        </button>
                    </div>
                    
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-2 border border-dashed border-pink-500/30 rounded-full -z-10"
                    />
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className="w-full space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Avatar Source (URL)</label>
                    <input 
                        type="text" 
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://images.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-pink-500/50 focus:outline-none text-sm transition-all placeholder:text-gray-700"
                    />
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Callsign / Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Input ID..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-pink-500/50 focus:outline-none font-medium transition-all"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Manifesto / Bio</label>
                    <textarea 
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-pink-500/50 focus:outline-none resize-none text-sm leading-relaxed transition-all"
                      placeholder="Tell the grid who you are..."
                    />
                </div>
             </div>

             <div className="pt-4 flex gap-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                    Abort
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] py-4 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-2xl transition-all disabled:opacity-50 shadow-2xl shadow-pink-600/20 active:scale-95 uppercase tracking-widest text-xs"
                >
                    {isSaving ? 'Syncing...' : 'Commit Changes'}
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
};

export default EditProfileModal;
