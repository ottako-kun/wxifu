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
      className="w-full h-full animate-fade-in flex items-center justify-center relative bg-transparent select-none overflow-hidden"
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
    >
        {/* Detail View Tools */}
        {isPhoto && isUnlocked && (
            <button 
                onClick={handleDownload}
                className="absolute top-4 right-4 z-[95] bg-black/60 hover:bg-pink-600 text-white p-4 rounded-3xl backdrop-blur-3xl border border-white/10 transition-all active:scale-90 pointer-events-auto shadow-2xl"
                title="Save High Resolution"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                </svg>
            </button>
        )}

        {!isUnlocked && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl rounded-[3.5rem] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-950/95 border border-yellow-500/30 rounded-[3.5rem] p-12 text-center shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-sm mx-4 backdrop-blur-xl ring-1 ring-white/10">
                    <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-yellow-500/20 animate-pulse">
                        <LockIcon className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-widest font-orbitron">Elite Access</h3>
                    <p className="text-gray-400 text-sm mb-12 leading-relaxed">
                        Authorize coin transfer to unlock high-fidelity data from <span className="text-pink-500 font-black">@{item.author}</span>.
                    </p>
                    <button 
                        onClick={onUnlockClick}
                        disabled={isUnlocking}
                        className="w-full py-5 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-black uppercase tracking-[0.2em] rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.2)] transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 text-xs"
                    >
                        {isUnlocking ? <LoadingSpinner className="w-6 h-6 text-black" /> : (
                            <>
                                <span className="text-xl font-orbitron">{item.price || 5}</span>
                                <span>Credits to Reveal</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* Content Container */}
        <div className="w-full h-full flex items-center justify-center relative rounded-[3.5rem] overflow-hidden">
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
                            <div className="flex flex-col items-center text-center p-12 bg-gray-900/80 rounded-[3rem] border border-gray-800 border-dashed backdrop-blur-md">
                                <p className="text-gray-300 mb-8 font-black uppercase tracking-widest">Protocol Failure</p>
                                <a href={item.videoSrc} target="_blank" rel="noopener noreferrer" className="px-12 py-5 bg-pink-600 text-white font-black rounded-3xl shadow-2xl active:scale-95 uppercase tracking-widest text-xs">External Link</a>
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
                                        onEnded={() => { setIsPlaying(false); if (onMediaEnded) onMediaEnded(); }}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        className="max-w-full max-h-full w-auto h-auto outline-none shadow-2xl z-10 object-contain rounded-[2rem]"
                                        onError={() => setVideoError(true)}
                                    />
                                    
                                    <div className={`absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 pointer-events-none ${!isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                        <div className="bg-black/60 backdrop-blur-3xl p-12 rounded-full border border-white/10 shadow-2xl">
                                            <PlayIcon className="w-16 h-16 text-white" />
                                        </div>
                                    </div>

                                    {/* Video HUD */}
                                    <div 
                                        className={`absolute bottom-0 inset-x-0 z-[110] p-10 pb-16 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 flex flex-col gap-6 pointer-events-auto ${showControls ? 'opacity-100' : 'opacity-0'}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-full flex items-center gap-6">
                                            <span className="text-[10px] text-white/40 font-black tracking-widest w-12 text-right">{formatTime(currentTime)}</span>
                                            <div className="flex-grow relative h-1 flex items-center group/seek">
                                                <input type="range" min="0" max={duration || 100} step="0.01" value={currentTime} onChange={handleSeek} onMouseDown={() => setIsSeeking(true)} onMouseUp={() => setIsSeeking(false)} className="w-full h-full bg-white/5 rounded-full appearance-none cursor-pointer accent-pink-500 relative z-20" />
                                                <div className="absolute left-0 top-0 h-full bg-pink-500 rounded-full shadow-[0_0_15px_#ec4899] z-10 pointer-events-none" style={{ width: `${(currentTime/duration)*100}%` }}></div>
                                            </div>
                                            <span className="text-[10px] text-white/40 font-black tracking-widest w-12">{formatTime(duration)}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-10">
                                                <button onClick={togglePlay} className="text-white/60 hover:text-pink-500 transition-all transform active:scale-75">
                                                    {isPlaying ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <PlayIcon className="w-8 h-8" />}
                                                </button>
                                                <button onClick={toggleMute} className="text-white/60 hover:text-pink-500 transition-all transform active:scale-75">
                                                    {isGlobalMuted ? <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path strokeLinecap="round" d="M15.54 8.46l5.66 5.66m0-5.66l-5.66 5.66"/></svg> : <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14"/></svg>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full max-w-6xl aspect-video mx-auto relative overflow-hidden rounded-[3rem] shadow-2xl border border-white/5 bg-black/20">
                                    {!iframeLoaded && (
                                         <div className="absolute inset-0 flex flex-col items-center justify-center z-0 bg-black/60 backdrop-blur-3xl">
                                             <LoadingSpinner className="w-16 h-16 text-pink-500 mb-6" />
                                             <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.6em]">Syncing Feed</p>
                                         </div>
                                    )}
                                    <iframe src={item.videoSrc} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className={`w-full h-full border-0 transition-all duration-1000 ${iframeLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} title={item.description || 'Video content'} onLoad={() => setIframeLoaded(true)} onError={() => setVideoError(true)} />
                                </div>
                            )
                        )
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center rounded-[3.5rem] overflow-hidden">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[150px]"></div>
                            <img src={item.src} className="max-w-[70%] max-h-[70%] object-contain rounded-[4rem] shadow-2xl grayscale blur-3xl opacity-10" alt="Locked Placeholder" />
                        </div>
                    )}
                </div>
            )}
        </div>
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