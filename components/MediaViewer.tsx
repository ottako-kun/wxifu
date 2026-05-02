
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MediaItem, MediaType } from '../types';
import ZoomableImage from './ZoomableImage';
import LoadingSpinner from './icons/LoadingSpinner';
import PlayIcon from './icons/PlayIcon';
import { useUI } from '../context/UIContext';
import { isGoogleDriveLink } from '../lib/googleDrive';

interface MediaViewerProps {
  item: MediaItem;
  onMediaEnded?: () => void;
  onZoomChange?: (isZoomed: boolean) => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
    item, 
    onMediaEnded,
    onZoomChange
}) => {
  const isPhoto = item.type === MediaType.Photo;
  const [videoError, setVideoError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showMetadataToast, setShowMetadataToast] = useState(false);
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

  const isUnlocked = true; // Simplified for now: everything is unlocked

  useEffect(() => {
    setVideoError(false);
    setIframeLoaded(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    if (!isPhoto) {
        setShowMetadataToast(true);
        const timer = setTimeout(() => setShowMetadataToast(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [item.id, isPhoto, isUnlocked]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
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
    }, 2500);
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

  // Render segmented progress bar
  const renderProgressBar = () => {
    const segments = 40;
    const progressVal = (currentTime / (duration || 1)) * segments;
    return (
        <div className="flex gap-[2px] w-full h-1 mt-2">
            {Array.from({ length: segments }).map((_, i) => (
                <div 
                    key={i} 
                    className={`flex-grow h-full rounded-[1px] transition-all duration-300 ${i < progressVal ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' : 'bg-white/10'}`}
                />
            ))}
        </div>
    );
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center relative bg-transparent select-none"
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
    >
        {/* Technical Metadata Toast */}
        {showMetadataToast && !isPhoto && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[150] bg-black/60 backdrop-blur-xl border border-pink-500/30 px-6 py-2 rounded-full animate-fade-in pointer-events-none">
                <p className="text-[10px] font-bold text-pink-400 font-orbitron uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                    Neural Stream: {isDirectVideo(item.videoSrc) ? 'Direct/RAW' : 'Drive/Emulated'} // UHD // 60fps
                </p>
            </div>
        )}

        {/* Detail View Tools */}
        {isPhoto && (
            <button 
                onClick={handleDownload}
                className="absolute top-0 right-0 z-[95] bg-black/40 hover:bg-pink-600 text-white p-3 rounded-2xl backdrop-blur-3xl border border-white/10 transition-all active:scale-90 pointer-events-auto shadow-2xl"
                title="Save High Resolution"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                </svg>
            </button>
        )}

        {isPhoto ? (
            <div className="w-full h-full max-h-[85vh] md:max-h-[80vh] flex items-center justify-center overflow-hidden">
                <ZoomableImage 
                    src={item.src} 
                    alt={item.description || 'Art Detail'} 
                    isUnlocked={true} 
                    onZoomChange={onZoomChange}
                />
            </div>
        ) : (
            <div className="w-full h-full max-h-[85vh] md:max-h-[80vh] relative flex items-center justify-center overflow-hidden">
                {videoError ? (
                    <div className="flex flex-col items-center text-center p-12 bg-gray-950 rounded-[3rem] border border-gray-800 border-dashed backdrop-blur-md">
                        <p className="text-gray-400 mb-8 font-black uppercase tracking-widest text-xs font-orbitron">Codec establishing failure</p>
                        <a 
                            href={item.videoSrc} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-12 py-5 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-3xl transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-[10px] font-orbitron"
                        >
                            External Link View
                        </a>
                    </div>
                ) : (
                    isDirectVideo(item.videoSrc) ? (
                        <div className="relative w-full h-full flex items-center justify-center group/player" onClick={togglePlay}>
                            <video 
                                key={item.id} // Forces re-render on item change to reset state
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
                                className="max-w-full max-h-full w-auto h-auto outline-none shadow-2xl z-10 object-contain rounded-2xl"
                                onError={() => setVideoError(true)}
                            />
                            
                            <div className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 pointer-events-none ${!isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="bg-black/60 backdrop-blur-3xl p-10 rounded-full border border-white/10 shadow-2xl">
                                    <PlayIcon className="w-14 h-14 text-white" />
                                </div>
                            </div>

                            {/* Futuristic Video HUD Controls */}
                            <div 
                                className={`absolute bottom-0 inset-x-0 z-[110] p-6 pb-12 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 flex flex-col gap-4 pointer-events-auto ${showControls ? 'opacity-100' : 'opacity-0'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-full flex flex-col gap-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[9px] text-white/50 font-black tracking-widest font-mono">
                                            {formatTime(currentTime)}
                                        </span>
                                        <span className="text-[9px] text-white/50 font-black tracking-widest font-mono">
                                            {formatTime(duration)}
                                        </span>
                                    </div>
                                    
                                    <div className="relative h-6 flex items-center group/seek">
                                        <input 
                                            type="range"
                                            min="0"
                                            max={duration || 100}
                                            step="0.01"
                                            value={currentTime}
                                            onChange={handleSeek}
                                            onMouseDown={() => setIsSeeking(true)}
                                            onMouseUp={() => setIsSeeking(false)}
                                            className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-pink-500 relative z-20 opacity-0"
                                        />
                                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                            {renderProgressBar()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-8">
                                        <button onClick={togglePlay} className="text-white hover:text-pink-500 transition-all transform active:scale-75">
                                            {isPlaying ? (
                                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                            ) : (
                                                <PlayIcon className="w-7 h-7" />
                                            )}
                                        </button>
                                        <button onClick={toggleMute} className="text-white hover:text-pink-500 transition-all transform active:scale-75">
                                            {isGlobalMuted ? (
                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path strokeLinecap="round" d="M15.54 8.46l5.66 5.66m0-5.66l-5.66 5.66"/></svg>
                                            ) : (
                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-[9px] font-bold text-gray-500 font-orbitron uppercase tracking-widest hidden sm:block">
                                            Neural // {((currentTime/(duration||1))*100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full max-w-6xl aspect-video mx-auto relative overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/5 bg-black">
                            {!iframeLoaded && (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-3xl">
                                     <LoadingSpinner className="w-14 h-14 text-pink-500 mb-4" />
                                     <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.4em] font-orbitron animate-pulse">Establishing Signal</p>
                                 </div>
                            )}
                            <iframe 
                                key={item.id}
                                src={item.videoSrc}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                className={`w-full h-full border-0 transition-all duration-1000 ${iframeLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                title={item.description || 'Video content'}
                                onLoad={() => setIframeLoaded(true)}
                                onError={() => setVideoError(true)}
                            />
                        </div>
                    )
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
