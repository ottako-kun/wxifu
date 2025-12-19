
import React from 'react';
import { MediaItem, MediaType } from '../types';
import ZoomableImage from './ZoomableImage';
import LockIcon from './icons/LockIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface MediaViewerProps {
  item: MediaItem;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  isUnlocking?: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
    item, 
    isUnlocked, 
    onUnlockClick,
    isUnlocking = false
}) => {
  const isPhoto = item.type === MediaType.Photo;

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
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                        <LockIcon className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest font-orbitron">Premium</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        This creation is part of <span className="text-pink-400 font-bold">{item.author}</span>'s exclusive collection.
                    </p>
                    <button 
                        onClick={onUnlockClick}
                        disabled={isUnlocking}
                        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black uppercase tracking-widest rounded-xl shadow-xl transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3"
                    >
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
                    isDirectVideo(item.videoSrc) ? (
                    <video 
                        src={item.videoSrc}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="max-w-full max-h-full w-auto h-auto outline-none shadow-2xl"
                    />
                    ) : (
                    <div className="w-full h-full relative">
                        <iframe 
                            src={item.videoSrc}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full border-0"
                            title={item.description || 'Video content'}
                        />
                    </div>
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
