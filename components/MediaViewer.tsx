
import React from 'react';
import { MediaItem, MediaType } from '../types';
import ZoomableImage from './ZoomableImage';
import LockIcon from './icons/LockIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface MediaViewerProps {
  item: MediaItem;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  // Pass throughs for zoomable image touch events if needed
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
  isUnlocking?: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
    item, 
    isUnlocked, 
    onUnlockClick,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isUnlocking = false
}) => {
  const isPhoto = item.type === MediaType.Photo;

  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  return (
    <div 
        className="w-full h-full animate-fade-in flex items-center justify-center p-0 md:p-4 relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
        {/* Locked Content Overlay */}
        {!isUnlocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(234,179,8,0.2)] max-w-sm mx-4">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50">
                        <LockIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider font-orbitron">Premium Content</h3>
                    <p className="text-gray-400 text-sm mb-6">
                        Unlock this exclusive post from <span className="text-pink-400 font-bold">{item.author}</span>.
                    </p>
                    <button 
                        onClick={onUnlockClick}
                        disabled={isUnlocking}
                        className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black uppercase tracking-wider rounded-lg shadow-lg transform transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isUnlocking ? <LoadingSpinner className="w-5 h-5 text-black" /> : `Unlock for ${item.price || 5} Coins`}
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
            <div className="w-full h-full relative flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                {isUnlocked ? (
                    isDirectVideo(item.videoSrc) ? (
                    <video 
                        src={item.videoSrc}
                        controls
                        autoPlay
                        playsInline
                        className="max-w-full max-h-full outline-none"
                    />
                    ) : (
                    <iframe 
                        src={item.videoSrc}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                    />
                    )
                ) : (
                    <img 
                        src={item.src} 
                        className="w-full h-full object-cover blur-xl opacity-30" 
                        alt="Locked Video Preview"
                    />
                )}
            </div>
        )}
    </div>
  );
};

export default MediaViewer;