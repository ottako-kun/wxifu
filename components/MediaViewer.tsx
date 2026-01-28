
import React, { useState } from 'react';
import { MediaItem, MediaType } from '../types';
import ZoomableImage from './ZoomableImage';
import LockIcon from './icons/LockIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface MediaViewerProps {
  item: MediaItem;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  isUnlocking?: boolean;
  onMediaEnded?: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
    item, 
    isUnlocked, 
    onUnlockClick,
    isUnlocking = false,
    onMediaEnded
}) => {
  const isPhoto = item.type === MediaType.Photo;
  const [videoError, setVideoError] = useState(false);

  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  return (
    <div className="w-full h-full animate-fade-in flex items-center justify-center relative bg-black">
        {/* Locked Content Overlay */}
        {!isUnlocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-900/80 border border-yellow-500/40 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] max-w-sm mx-4 backdrop-blur-md">
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30 animate-pulse">
                        <LockIcon className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest font-orbitron">Premium Content</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        This creation by <span className="text-pink-400 font-bold">{item.author}</span> is exclusive to premium supporters.
                    </p>
                    <button 
                        onClick={onUnlockClick}
                        disabled={isUnlocking}
                        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3 group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        {isUnlocking ? <LoadingSpinner className="w-6 h-6 text-black" /> : (
                            <>
                                <span className="text-lg">{item.price || 5}</span>
                                <span>Coins to Unlock</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {isPhoto ? (
            <ZoomableImage 
                src={item.src} 
                alt={item.description || 'Full screen view'} 
                isUnlocked={isUnlocked} 
            />
        ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
                {isUnlocked ? (
                    videoError ? (
                        <div className="flex flex-col items-center text-center p-8">
                            <p className="text-gray-400 mb-4">Preview unavailable for this link.</p>
                            <a 
                                href={item.videoSrc} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-pink-600 text-white font-bold rounded-lg"
                            >
                                View Externally
                            </a>
                        </div>
                    ) : (
                        isDirectVideo(item.videoSrc) ? (
                            <video 
                                src={item.videoSrc}
                                controls
                                autoPlay
                                onEnded={onMediaEnded}
                                className="max-w-full max-h-full w-auto h-auto outline-none shadow-2xl"
                                onError={() => setVideoError(true)}
                            />
                        ) : (
                            <div className="w-full h-full relative overflow-hidden">
                                <iframe 
                                    src={item.videoSrc}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full border-0 scale-100 md:scale-105"
                                    title={item.description || 'Video content'}
                                    onError={() => setVideoError(true)}
                                />
                            </div>
                        )
                    )
                ) : (
                    <div className="relative w-full h-full">
                        <img 
                            src={item.src} 
                            className="w-full h-full object-cover blur-3xl opacity-20" 
                            alt="Locked Preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60"></div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default MediaViewer;
