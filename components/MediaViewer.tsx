
import React, { useState, useEffect } from 'react';
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
  onZoomChange?: (isZoomed: boolean) => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
    item, 
    isUnlocked, 
    onUnlockClick,
    isUnlocking = false,
    onMediaEnded,
    onZoomChange
}) => {
  const isPhoto = item.type === MediaType.Photo;
  const [videoError, setVideoError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  // Reset states when item changes
  useEffect(() => {
    setVideoError(false);
    setIframeLoaded(false);
  }, [item.id]);

  const handleDownload = () => {
    if (!isUnlocked) return;
    const link = document.createElement('a');
    link.href = item.src;
    link.download = `otaku-x-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full animate-fade-in flex items-center justify-center relative bg-black">
        {/* Unlocked Actions (High Res Download) */}
        {isPhoto && isUnlocked && (
            <button 
                onClick={handleDownload}
                className="absolute top-20 right-4 z-[95] bg-black/40 hover:bg-pink-600 text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-90 pointer-events-auto shadow-lg"
                title="Download Original"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                </svg>
            </button>
        )}

        {/* Locked Content Overlay */}
        {!isUnlocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-2xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-900/90 border border-yellow-500/30 rounded-[2.5rem] p-8 md:p-10 text-center shadow-[0_0_60px_rgba(234,179,8,0.15)] max-w-sm mx-4 backdrop-blur-md ring-1 ring-white/10">
                    <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-500/20 animate-pulse">
                        <LockIcon className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-widest font-orbitron">Exclusive</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed px-2">
                        This creation by <span className="text-pink-400 font-bold">{item.author}</span> is locked for supporters.
                    </p>
                    <button 
                        onClick={onUnlockClick}
                        disabled={isUnlocking}
                        className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.3)] transform transition-all active:scale-90 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-3 overflow-hidden"
                    >
                        {isUnlocking ? <LoadingSpinner className="w-6 h-6 text-black" /> : (
                            <>
                                <span className="text-xl">{item.price || 5}</span>
                                <span>Coins to View</span>
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
                onZoomChange={onZoomChange}
            />
        ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
                {isUnlocked ? (
                    videoError ? (
                        <div className="flex flex-col items-center text-center p-8 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-gray-400 mb-6 font-medium">Link playback not supported in-app.</p>
                            <a 
                                href={item.videoSrc} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                Open External Link
                            </a>
                        </div>
                    ) : (
                        isDirectVideo(item.videoSrc) ? (
                            <video 
                                src={item.videoSrc}
                                controls
                                autoPlay
                                onEnded={onMediaEnded}
                                className="max-w-full max-h-full w-auto h-auto outline-none shadow-2xl z-10 rounded-lg overflow-hidden"
                                onError={() => setVideoError(true)}
                            />
                        ) : (
                            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                                {!iframeLoaded && (
                                     <div className="absolute inset-0 flex items-center justify-center z-0 bg-black">
                                         <LoadingSpinner className="w-12 h-12 text-pink-500" />
                                     </div>
                                )}
                                <iframe 
                                    src={item.videoSrc}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                    className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    title={item.description || 'Video content'}
                                    onLoad={() => setIframeLoaded(true)}
                                    onError={() => setVideoError(true)}
                                />
                            </div>
                        )
                    )
                ) : (
                    <div className="relative w-full h-full">
                        <img 
                            src={item.src} 
                            className="w-full h-full object-cover blur-[80px] opacity-30 scale-110" 
                            alt="Locked Preview"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default MediaViewer;
