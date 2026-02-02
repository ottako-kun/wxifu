import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MediaItem, MediaType } from '../types';
import ZoomableImage from './ZoomableImage';
import LockIcon from './icons/LockIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import PlayIcon from './icons/PlayIcon';
import { useUI } from '../context/UIContext';
import { isGoogleDriveLink } from '../lib/googleDrive';

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
  const { isGlobalMuted, toggleGlobalMute } = useUI();

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const isDirectVideo = (url?: string) => {
    if (!url) return false;
    if (isGoogleDriveLink(url)) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  useEffect(() => {
    setVideoError(false);
    setIframeLoaded(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [item.id]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && !isSeeking) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGlobalMute();
  };

  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (!isUnlocked) return;
    const link = document.createElement('a');
    link.href = item.src;
    link.download = `wxifu-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="w-full h-full animate-fade-in flex items-center justify-center relative bg-transparent select-none p-2 md:p-4"
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
    >
        {/* Detail View Tools */}
        {isPhoto && isUnlocked && (
            <button 
                onClick={handleDownload}
                className="absolute top-20 right-4 z-[95] bg-black/60 hover:bg-pink-600 text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-90 pointer-events-auto shadow-xl"
                title="Save High Resolution"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                </svg>
            </button>
        )}

        {!isUnlocked && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-900/90 border border-yellow-500/30 rounded-[2.5rem] p-8 md:p-10 text-center shadow-[0_0_60px_rgba(234,179,8,0.2)] max-w-sm mx-4 backdrop-blur-md ring-1 ring-white/10">
                    <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-500/20 animate-pulse">
                        <LockIcon className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-widest font-orbitron">Premium Asset</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        Unlock high-fidelity access to this work by <span className="text-pink-400 font-bold">{item.author}</span>.
                    </p>
                    <button 
                        onClick={onUnlockClick}
                        disabled={isUnlocking}
                        className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                        {isUnlocking ? <LoadingSpinner className="w-6 h-6 text-black" /> : (
                            <>
                                <span className="text-xl font-orbitron">{item.price || 5}</span>
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
                alt={item.description || 'Art Detail'} 
                isUnlocked={isUnlocked} 
                onZoomChange={onZoomChange}
            />
        ) : (
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                {isUnlocked ? (
                    videoError ? (
                        <div className="flex flex-col items-center text-center p-12 bg-gray-900/80 rounded-3xl border border-gray-800 border-dashed backdrop-blur-md">
                            <p className="text-gray-300 mb-6 font-medium">Codec Error or Invalid Source.</p>
                            <a 
                                href={item.videoSrc} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-10 py-4 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                            >
                                View Externally
                            </a>
                        </div>
                    ) : (
                        isDirectVideo(item.videoSrc) ? (
                            <div className="relative w-full h-full flex items-center justify-center group/player" onClick={togglePlay}>
                                <video 
                                    ref={videoRef}
                                    src={item.videoSrc}
                                    autoPlay
                                    playsInline
                                    muted={isGlobalMuted}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onEnded={() => {
                                      setIsPlaying(false);
                                      if (onMediaEnded) onMediaEnded();
                                    }}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    className="max-w-full max-h-full w-auto h-auto outline-none shadow-2xl z-10 object-contain rounded-lg md:rounded-2xl"
                                    onError={() => setVideoError(true)}
                                />
                                
                                <div className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 pointer-events-none ${!isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="bg-black/50 backdrop-blur-md p-8 rounded-full border border-white/10 shadow-2xl">
                                        <PlayIcon className="w-16 h-16 text-white" />
                                    </div>
                                </div>

                                {/* Dynamic Video HUD */}
                                <div 
                                    className={`absolute bottom-0 inset-x-0 z-[110] p-6 pb-24 md:pb-10 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 flex flex-col gap-4 pointer-events-auto ${showControls ? 'opacity-100' : 'opacity-0'}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="w-full flex items-center gap-4">
                                        <span className="text-[10px] text-white/80 font-mono w-12 text-right">
                                            {formatTime(currentTime)}
                                        </span>
                                        <div className="flex-grow relative h-1.5 flex items-center group/seek">
                                            <input 
                                                type="range"
                                                min="0"
                                                max={duration || 100}
                                                step="0.01"
                                                value={currentTime}
                                                onChange={handleSeek}
                                                onMouseDown={() => setIsSeeking(true)}
                                                onMouseUp={() => setIsSeeking(false)}
                                                className="w-full h-full bg-white/20 rounded-full appearance-none cursor-pointer accent-pink-500 relative z-20"
                                            />
                                            <div className="absolute left-0 top-0 h-full bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899] z-10 pointer-events-none" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                                        </div>
                                        <span className="text-[10px] text-white/80 font-mono w-12">
                                            {formatTime(duration)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <button onClick={togglePlay} className="text-white hover:text-pink-500 transition-colors transform active:scale-90">
                                                {isPlaying ? (
                                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                                ) : (
                                                    <PlayIcon className="w-8 h-8" />
                                                )}
                                            </button>
                                            <button onClick={toggleMute} className="text-white hover:text-pink-500 transition-colors transform active:scale-90">
                                                {isGlobalMuted ? (
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path strokeLinecap="round" d="M15.54 8.46l5.66 5.66m0-5.66l-5.66 5.66"/></svg>
                                                ) : (
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full relative overflow-hidden flex items-center justify-center md:max-w-4xl md:aspect-video md:max-h-[85%] mx-auto">
                                {!iframeLoaded && (
                                     <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-black/20 backdrop-blur-md rounded-2xl">
                                         <LoadingSpinner className="w-14 h-14 text-pink-500 mb-4" />
                                         <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Opening Secure Link</p>
                                     </div>
                                )}
                                <iframe 
                                    src={item.videoSrc}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                    className={`w-full h-full border-0 transition-all duration-700 rounded-lg md:rounded-2xl shadow-2xl ${iframeLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    title={item.description || 'Video content'}
                                    onLoad={() => setIframeLoaded(true)}
                                    onError={() => setVideoError(true)}
                                />
                            </div>
                        )
                    )
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl"></div>
                        <img 
                            src={item.src} 
                            className="max-w-[70%] max-h-[70%] object-contain rounded-2xl shadow-2xl grayscale blur-md opacity-40" 
                            alt="Locked Placeholder"
                        />
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default MediaViewer;