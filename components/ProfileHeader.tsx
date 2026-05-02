
import React from 'react';
import { UserProfileData, Session } from '../types';
// Fixed: Import Session from local types
import Avatar from './Avatar';
import ChatIcon from './icons/ChatIcon';

interface ProfileHeaderProps {
    session: Session | null;
    profileData: UserProfileData;
    isOwner: boolean;
    postCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    isMutual: boolean;
    loadingSocial: boolean;
    viewedUserFrame: string;
    onEditClick: () => void;
    onFollowToggle: () => void;
    onMessageClick?: (user: UserProfileData) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    session,
    profileData,
    isOwner,
    postCount,
    followersCount,
    followingCount,
    isFollowing,
    isMutual,
    loadingSocial,
    viewedUserFrame,
    onEditClick,
    onFollowToggle,
    onMessageClick
}) => {
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 border-b border-gray-800 pb-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <Avatar 
                    src={profileData.avatar} 
                    alt={profileData.name} 
                    frame={viewedUserFrame}
                    size="2xl"
                    className="shadow-2xl"
                />
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
                                onClick={onEditClick}
                                className="px-4 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-bold uppercase tracking-wider rounded-full border border-gray-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : session ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={onFollowToggle}
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
    );
};

export default ProfileHeader;
