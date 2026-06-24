
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, MediaType, Session } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SharePopover from './SharePopover';
import ReportModal from './ReportModal';
import { useToast } from '../context/ToastContext';
import MediaSidebar from './MediaSidebar';
import MediaViewer from './MediaViewer';
import { useRelatedMedia } from '../hooks/useRelatedMedia';
import { useMediaLikes } from '../hooks/useMediaLikes';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useSwipe } from '../hooks/useSwipe';
import { useDoubleTap } from '../hooks/useDoubleTap';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import ShareIcon from './icons/ShareIcon';
import FlagIcon from './icons/FlagIcon';
import Avatar from './Avatar';

interface MediaDetailModalProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session: Session | null;
  onDataChange?: () => void;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ items, initialIndex, onClose, onUserClick, session, onDataChange }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [shareAnchorEl, setShareAnchorEl] = useState<HTMLElement | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  
  // HUD state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const item = items[currentIndex] || items[0];
  const isOwner = session?.user.id === item?.user_id;
  
  const toast = useToast();
  const relatedItems = useRelatedMedia(item, items);
  const { isLiked, likeCount, toggleLike } = useMediaLikes(item?.id || '', session?.user.id, (item?.id || '').startsWith('static'));
  
  const triggerChangeEffect = useCallback(() => {
    setIsChanging(true);
    setTimeout(() => setIsChanging(false), 400); // Slightly longer for the neural effect
  }, []);

  const goToPrevious = useCallback(() => {
    if (isZoomed || isChanging) return;
    if (currentIndex > 0) {
        triggerChangeEffect();
        setCurrentIndex(prev => prev - 1);
        setIsZoomed(false);
    }
  }, [currentIndex, isZoomed, isChanging, triggerChangeEffect]);

  const goToNext = useCallback(() => {
    if (isZoomed || isChanging) return;
    if (currentIndex < items.length - 1) {
        triggerChangeEffect();
        setCurrentIndex(prev => prev + 1);
        setIsZoomed(false);
    }
  }, [currentIndex, items.length, isZoomed, isChanging, triggerChangeEffect]);

  const handleLikeAction = useCallback(async () => {
    await toggleLike();
  }, [toggleLike]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeUp: goToNext,
    onSwipeDown: goToPrevious,
    onSwipeLeft: () => setIsDrawerOpen(true),
    onSwipeRight: isDrawerOpen ? () => setIsDrawerOpen(false) : handleClose,
    disabled: isZoomed || isChanging,
    threshold: 40 
  });

  const handleDoubleTap = useDoubleTap(handleLikeAction);

  useKeyboardNav({
    onNext: goToNext,
    onPrev: goToPrevious,
    onEscape: () => isDrawerOpen ? setIsDrawerOpen(false) : handleClose(),
    disabled: !item || isZoomed || isChanging
  });

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!item) return null;

  return (
    <div 
      className={`fixed inset-0 bg-[#020202] z-[1000] flex flex-col transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
        {/* Dynamic Blurred Backdrop - More dramatic blur and color shift */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img 
                src={item.src} 
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover scale-125 blur-[150px] opacity-40 brightness-[0.2] transition-all duration-1000 ${isChanging ? 'grayscale blur-[200px] opacity-20' : ''}`} 
                alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"></div>
        </div>

        {/* Neural Scanline Effect */}
        <div className="neural-scan-line"></div>

        {/* Top Actions Bar */}
        <div className="absolute top-0 inset-x-0 z-[1100] flex items-center justify-between p-4 md:p-8 pt-safe-top">
            <button 
                onClick={handleClose} 
                className="p-4 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-3xl rounded-2xl transition-all border border-white/10 active:scale-90 shadow-2xl"
                aria-label="Close"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsReportModalOpen(true)} 
                    className="p-4 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 backdrop-blur-3xl rounded-2xl transition-all border border-white/10 active:scale-90"
                    aria-label="Report"
                 >
                     <FlagIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div 
            className={`flex-grow w-full h-full relative overflow-hidden z-10 flex items-center justify-center px-4 py-20 md:px-32 md:py-24 transition-all duration-500 ease-out ${isChanging ? 'scale-90 opacity-0 blur-xl' : 'scale-100 opacity-100 blur-0'}`}
            onMouseDown={handleDoubleTap}
        >
            <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center relative">
                <MediaViewer 
                    item={item} 
                    onMediaEnded={goToNext}
                    onZoomChange={setIsZoomed} 
                />
            </div>
        </div>

        {/* Interaction HUD - Futurist Sidebar */}
        <div className={`absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-[1100] flex flex-col items-center gap-4 pointer-events-auto transition-all duration-500 ${isZoomed || isChanging ? 'opacity-0 translate-x-12' : 'opacity-100 translate-x-0'}`}>
            <div className="flex flex-col items-center group">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleLikeAction(); }}
                    className={`p-4 md:p-5 rounded-[2rem] bg-black/40 backdrop-blur-3xl border transition-all active:scale-50 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${isLiked ? 'text-pink-500 border-pink-500/50' : 'text-white border-white/10 hover:border-white/30'}`}
                >
                    <HeartIcon filled={isLiked} className="w-7 h-7 md:w-8 md:h-8" />
                </button>
                <span className="text-[10px] font-black text-white/70 mt-1 uppercase tracking-tight font-orbitron">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
            </div>

            <div className="flex flex-col items-center group">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsDrawerOpen(true); }}
                    className="p-4 md:p-5 rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-white/10 text-white transition-all active:scale-75 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-white/30"
                >
                    <ChatIcon className="w-7 h-7 md:w-8 md:h-8" />
                </button>
                <span className="text-[10px] font-black text-white/70 mt-1 uppercase tracking-tight font-orbitron">Info</span>
            </div>

            <div className="flex flex-col items-center group">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShareAnchorEl(e.currentTarget as HTMLElement); }}
                    className="p-4 md:p-5 rounded-[2rem] bg-black/40 backdrop-blur-3xl border border-white/10 text-white transition-all active:scale-75 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-white/30"
                >
                    <ShareIcon className="w-7 h-7 md:w-8 md:h-8" />
                </button>
                <span className="text-[10px] font-black text-white/70 mt-1 uppercase tracking-tight font-orbitron">Link</span>
            </div>
        </div>

        {/* Bottom Info Bar */}
        <div className={`absolute bottom-0 inset-x-0 z-[1050] pointer-events-none transition-all duration-500 pb-safe ${isZoomed || isChanging ? 'opacity-0 translate-y-12' : 'opacity-100 translate-y-0'}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12 flex items-end">
                <div className="flex-grow max-w-[80%] md:max-w-[60%] pointer-events-auto flex flex-col gap-3 animate-slide-up">
                    <div 
                        className="flex items-center gap-4 cursor-pointer group w-fit" 
                        onClick={() => onUserClick?.({ id: item.user_id!, name: item.author!, avatar: item.author_avatar || '' })}
                    >
                        <Avatar src={item.author_avatar} alt={item.author} size="lg" className="ring-2 ring-pink-500/50 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
                        <div>
                            <h3 className="text-white font-black text-xl font-orbitron tracking-tight text-shadow-glow">@{item.author}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-cyan-400 text-[9px] font-black uppercase tracking-[0.2em] bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">{item.category}</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-white/90 text-sm line-clamp-2 leading-relaxed font-light drop-shadow-lg">
                        {item.description}
                    </p>
                </div>
            </div>
        </div>

        {/* PC Navigation Controls */}
        <div className="hidden md:block absolute inset-y-0 left-0 z-[1050] w-24">
            <button 
                onClick={goToPrevious}
                disabled={currentIndex === 0 || isZoomed || isChanging}
                className="w-full h-full flex items-center justify-center text-white/10 hover:text-pink-500 hover:bg-white/5 transition-all disabled:opacity-0"
            >
                <ChevronLeftIcon className="w-12 h-12" />
            </button>
        </div>
        <div className="hidden md:block absolute inset-y-0 right-0 z-[1050] w-24">
            <button 
                onClick={goToNext}
                disabled={currentIndex === items.length - 1 || isZoomed || isChanging}
                className="w-full h-full flex items-center justify-center text-white/10 hover:text-pink-500 hover:bg-white/5 transition-all disabled:opacity-0"
            >
                <ChevronRightIcon className="w-12 h-12" />
            </button>
        </div>

        {/* Sidebar Drawer */}
        {isDrawerOpen && (
            <div className="fixed inset-0 z-[1200] flex animate-fade-in">
                <div className="flex-grow bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
                <div className="w-full md:w-[460px] bg-[#050505] h-full shadow-[-20px_0_60px_rgba(0,0,0,0.8)] border-l border-white/5 overflow-y-auto custom-scrollbar animate-slide-left">
                    <div className="sticky top-0 z-50 p-6 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-between border-b border-white/5 pt-safe-top">
                        <h3 className="text-white font-black uppercase tracking-[0.3em] text-[10px] font-orbitron">Neural Transmission</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-3 text-gray-500 hover:text-white bg-white/5 rounded-xl transition-colors"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                    <MediaSidebar 
                        item={item} 
                        session={session} 
                        relatedItems={relatedItems} 
                        isOwner={isOwner} 
                        onAuthorClick={() => { setIsDrawerOpen(false); handleClose(); onUserClick?.({ id: item.user_id!, name: item.author!, avatar: item.author_avatar || '' }); }} 
                        onRelatedClick={(id) => { const idx = items.findIndex(i => i.id === id); if (idx !== -1) setCurrentIndex(idx); }} 
                        onShareClick={(e) => setShareAnchorEl(e.currentTarget as HTMLElement)} 
                        onReportClick={() => setIsReportModalOpen(true)} 
                        onDataChange={onDataChange} 
                        onDeleteSuccess={handleClose} 
                    />
                </div>
            </div>
        )}

        {shareAnchorEl && <SharePopover item={item} anchorEl={shareAnchorEl} onClose={() => setShareAnchorEl(null)} />}
        {isReportModalOpen && <ReportModal onClose={() => setIsReportModalOpen(false)} isSubmitting={false} onSubmit={async () => {}} />}
    </div>
  );
};

export default MediaDetailModal;
