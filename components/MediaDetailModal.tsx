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
import { useWallet } from '../context/WalletContext';
import { useMediaLikes } from '../hooks/useMediaLikes';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { useSwipe } from '../hooks/useSwipe';
import { useDoubleTap } from '../hooks/useDoubleTap';
import HeartIcon from './icons/HeartIcon';
import ChatIcon from './icons/ChatIcon';
import ShareIcon from './icons/ShareIcon';
import GiftIcon from './icons/GiftIcon';
import TipModal from './TipModal';
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
  
  // HUD state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  const item = items[currentIndex] || items[0];
  const isOwner = session?.user.id === item?.user_id;
  
  const toast = useToast();
  const relatedItems = useRelatedMedia(item, items);
  const { unlockContent, isUnlocked: checkIsUnlocked, isLoading: isWalletLoading } = useWallet();
  const { isLiked, likeCount, toggleLike } = useMediaLikes(item?.id || '', session?.user.id, (item?.id || '').startsWith('static'));
  
  const isUnlocked = isOwner || !item?.is_premium || checkIsUnlocked(item?.id || '');

  const goToPrevious = useCallback(() => {
    if (isZoomed) return;
    if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setIsZoomed(false);
    }
  }, [currentIndex, isZoomed]);

  const goToNext = useCallback(() => {
    if (isZoomed) return;
    if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsZoomed(false);
    }
  }, [currentIndex, items.length, isZoomed]);

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
    disabled: isZoomed
  });

  const handleDoubleTap = useDoubleTap(handleLikeAction);

  useKeyboardNav({
    onNext: goToNext,
    onPrev: goToPrevious,
    onEscape: () => isDrawerOpen ? setIsDrawerOpen(false) : handleClose(),
    disabled: !item || isZoomed
  });

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!item) return null;

  return (
    <div 
      className={`fixed inset-0 bg-[#020202] z-[1000] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={handleDoubleTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
        {/* Dynamic Blurred Backdrop for Cinema Feel */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img 
                src={item.src} 
                className="w-full h-full object-cover scale-110 blur-[100px] opacity-20 brightness-[0.2]" 
                alt="" 
            />
            <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Top Actions Bar - Floating Style */}
        <div className="absolute top-0 inset-x-0 z-[1100] flex items-center justify-between p-4 md:p-8">
            <button 
                onClick={handleClose} 
                className="p-3 text-white/80 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-2xl rounded-2xl transition-all border border-white/10 active:scale-90 shadow-2xl"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsReportModalOpen(true)} 
                    className="p-3 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 backdrop-blur-2xl rounded-2xl transition-all border border-white/10 active:scale-90"
                 >
                     <FlagIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>

        {/* Main Content Area - Reduced Scale to fit UI */}
        <div className="flex-grow w-full h-full relative overflow-hidden z-10 flex items-center justify-center px-4 py-20 md:px-32 md:py-24">
            <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center relative">
                <MediaViewer 
                    item={item} 
                    isUnlocked={isUnlocked} 
                    onUnlockClick={() => unlockContent(item.id, item.price || 0, item.user_id)} 
                    isUnlocking={isWalletLoading} 
                    onMediaEnded={goToNext}
                    onZoomChange={setIsZoomed} 
                />
            </div>
        </div>

        {/* Cinematic Navigation Controls */}
        <div className="hidden md:block absolute inset-y-0 left-0 z-[1050] w-24">
            <button 
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="w-full h-full flex items-center justify-center text-white/20 hover:text-pink-500 hover:bg-white/5 transition-all disabled:opacity-0"
            >
                <ChevronLeftIcon className="w-12 h-12" />
            </button>
        </div>
        <div className="hidden md:block absolute inset-y-0 right-0 z-[1050] w-24">
            <button 
                onClick={goToNext}
                disabled={currentIndex === items.length - 1}
                className="w-full h-full flex items-center justify-center text-white/20 hover:text-pink-500 hover:bg-white/5 transition-all disabled:opacity-0"
            >
                <ChevronRightIcon className="w-12 h-12" />
            </button>
        </div>

        {/* New Repositioned Interaction HUD - Vertical Stack Centered Right */}
        <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-[1100] flex flex-col items-center gap-6 pointer-events-auto animate-fade-in">
            <div className="flex flex-col items-center group">
                <button 
                    onClick={handleLikeAction} 
                    className={`p-4 md:p-5 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 transition-all active:scale-50 shadow-2xl hover:bg-white/10 ${isLiked ? 'text-pink-500 border-pink-500/50' : 'text-white'}`}
                >
                    <HeartIcon filled={isLiked} className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg" />
                </button>
                <span className="text-[11px] font-black text-white/80 mt-2 uppercase tracking-tighter drop-shadow-md">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
            </div>

            <div className="flex flex-col items-center group">
                <button 
                    onClick={() => setIsDrawerOpen(true)} 
                    className="p-4 md:p-5 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white transition-all active:scale-75 shadow-2xl hover:bg-white/10"
                >
                    <ChatIcon className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg" />
                </button>
                <span className="text-[11px] font-black text-white/80 mt-2 uppercase tracking-tighter drop-shadow-md">Details</span>
            </div>

            <div className="flex flex-col items-center group">
                <button 
                    onClick={() => setIsTipModalOpen(true)} 
                    className="p-4 md:p-5 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 text-yellow-500 transition-all active:scale-75 shadow-2xl hover:bg-white/10"
                >
                    <GiftIcon className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg" />
                </button>
                <span className="text-[11px] font-black text-white/80 mt-2 uppercase tracking-tighter drop-shadow-md">Gift</span>
            </div>

            <div className="flex flex-col items-center group">
                <button 
                    onClick={(e) => setShareAnchorEl(e.currentTarget as HTMLElement)} 
                    className="p-4 md:p-5 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white transition-all active:scale-75 shadow-2xl hover:bg-white/10"
                >
                    <ShareIcon className="w-7 h-7 md:w-8 md:h-8 drop-shadow-lg" />
                </button>
                <span className="text-[11px] font-black text-white/80 mt-2 uppercase tracking-tighter drop-shadow-md">Share</span>
            </div>
        </div>

        {/* Bottom Info Bar - Minimal & Translucent */}
        <div className="absolute bottom-0 inset-x-0 z-[1050] pointer-events-none">
            <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12 flex items-end justify-between gap-12">
                
                {/* Meta Info (Bottom Left) */}
                <div className="flex-grow max-w-[70%] md:max-w-[50%] pointer-events-auto flex flex-col gap-4 animate-slide-up">
                    <div 
                        className="flex items-center gap-4 cursor-pointer group w-fit" 
                        onClick={() => onUserClick?.({ id: item.user_id!, name: item.author!, avatar: item.author_avatar || '' })}
                    >
                        <Avatar src={item.author_avatar} alt={item.author} size="lg" className="ring-2 ring-pink-500 group-hover:scale-105 transition-transform shadow-2xl" />
                        <div>
                            <h3 className="text-white font-black text-xl drop-shadow-2xl font-orbitron tracking-tight">@{item.author}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20 backdrop-blur-md">{item.category}</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-white/80 text-sm md:text-base line-clamp-2 leading-relaxed drop-shadow-2xl font-light max-w-2xl bg-black/20 p-4 rounded-3xl backdrop-blur-sm border border-white/5">
                        {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                        {item.tags?.slice(0, 8).map(tag => (
                            <span key={tag} className="text-pink-400 font-black text-[10px] uppercase tracking-widest drop-shadow-md bg-pink-950/30 px-3 py-1 rounded-full border border-pink-500/10">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Slide-out Sidebar/Drawer */}
        {isDrawerOpen && (
            <div className="fixed inset-0 z-[1200] flex animate-fade-in">
                <div className="flex-grow bg-black/80 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
                <div className="w-full md:w-[480px] bg-[#050505] h-full shadow-[-30px_0_60px_rgba(0,0,0,0.8)] border-l border-white/10 overflow-y-auto custom-scrollbar animate-slide-left">
                    <div className="sticky top-0 z-50 p-8 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-between border-b border-white/5">
                        <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">Transmissions & Data</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2.5 text-gray-500 hover:text-white bg-white/5 rounded-xl transition-colors"><CloseIcon className="w-5 h-5" /></button>
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
        {isTipModalOpen && <TipModal recipientId={item.user_id || ''} recipientName={item.author || ''} onClose={() => setIsTipModalOpen(false)} />}
    </div>
  );
};

export default MediaDetailModal;