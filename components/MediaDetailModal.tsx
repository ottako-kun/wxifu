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
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  const item = items[currentIndex] || items[0];
  const isOwner = session?.user.id === item?.user_id;
  
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
      className={`fixed inset-0 bg-[#050505] z-[1000] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={handleDoubleTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
        {/* Cinematic Blurred Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <img 
                src={item.src} 
                className="w-full h-full object-cover scale-125 blur-[120px] opacity-25 brightness-[0.2]" 
                alt="" 
            />
            <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Global Exit & Tools */}
        <div className="absolute top-0 inset-x-0 z-[1100] flex items-center justify-between p-6">
            <button 
                onClick={handleClose} 
                className="group flex items-center gap-3 p-2 pr-6 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-3xl rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-95"
            >
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-pink-500 transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Close Gallery</span>
            </button>
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsReportModalOpen(true)} 
                    className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 backdrop-blur-2xl rounded-2xl transition-all border border-transparent hover:border-red-500/20 active:scale-90"
                    title="Report Content"
                 >
                     <FlagIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>

        {/* --- MAIN CONTENT "SAFE ZONE" --- */}
        <div className="flex-grow w-full h-full relative overflow-hidden z-10 flex items-center justify-center p-4 md:p-12 lg:p-24">
            <div className="relative w-full h-full flex items-center justify-center max-w-[85vw] max-h-[80vh] md:max-h-[75vh]">
                <MediaViewer 
                    item={item} 
                    isUnlocked={isUnlocked} 
                    onUnlockClick={() => unlockContent(item.id, item.price || 0, item.user_id)} 
                    isUnlocking={isWalletLoading} 
                    onMediaEnded={goToNext}
                    onZoomChange={setIsZoomed} 
                />
                
                {/* Desktop HUD - Anchored to the artwork bounds */}
                <div className="hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 flex-col items-center gap-6 pointer-events-auto animate-fade-in">
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={handleLikeAction} 
                            className={`p-5 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 transition-all active:scale-50 shadow-2xl hover:bg-white/10 ${isLiked ? 'text-pink-500 border-pink-500/30' : 'text-white/70 hover:text-white'}`}
                        >
                            <HeartIcon filled={isLiked} className="w-7 h-7 drop-shadow-lg" />
                        </button>
                        <span className="text-[10px] font-black text-white/50 mt-2 uppercase tracking-tighter">{likeCount > 999 ? (likeCount/1000).toFixed(1) + 'k' : likeCount}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button onClick={() => setIsDrawerOpen(true)} className="p-5 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 text-white/70 hover:text-white transition-all active:scale-75 shadow-2xl hover:bg-white/10">
                            <ChatIcon className="w-7 h-7 drop-shadow-lg" />
                        </button>
                        <span className="text-[10px] font-black text-white/50 mt-2 uppercase tracking-tighter">Details</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button onClick={() => setIsTipModalOpen(true)} className="p-5 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 text-yellow-500/70 hover:text-yellow-400 transition-all active:scale-75 shadow-2xl hover:bg-white/10">
                            <GiftIcon className="w-7 h-7 drop-shadow-lg" />
                        </button>
                        <span className="text-[10px] font-black text-white/50 mt-2 uppercase tracking-tighter">Gift</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden lg:block absolute inset-y-0 left-6 z-[1050] flex items-center">
            <button 
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-6 text-white/10 hover:text-pink-500 hover:bg-white/5 transition-all rounded-[3rem] disabled:opacity-0"
            >
                <ChevronLeftIcon className="w-12 h-12" />
            </button>
        </div>
        <div className="hidden lg:block absolute inset-y-0 right-6 z-[1050] flex items-center">
            <button 
                onClick={goToNext}
                disabled={currentIndex === items.length - 1}
                className="p-6 text-white/10 hover:text-pink-500 hover:bg-white/5 transition-all rounded-[3rem] disabled:opacity-0"
            >
                <ChevronRightIcon className="w-12 h-12" />
            </button>
        </div>

        {/* Mobile-Only HUD (Standard Bottom Right) */}
        <div className="lg:hidden absolute bottom-24 right-4 z-[1100] flex flex-col items-center gap-5 pointer-events-auto">
            <button onClick={handleLikeAction} className={`p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 transition-all ${isLiked ? 'text-pink-500' : 'text-white'}`}>
                <HeartIcon filled={isLiked} className="w-6 h-6" />
            </button>
            <button onClick={() => setIsDrawerOpen(true)} className="p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white">
                <ChatIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setIsTipModalOpen(true)} className="p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-yellow-500">
                <GiftIcon className="w-6 h-6" />
            </button>
        </div>

        {/* --- FLOATING METADATA CARD --- */}
        <div className="absolute bottom-10 left-10 z-[1100] pointer-events-none max-w-sm hidden lg:block">
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl pointer-events-auto animate-slide-up ring-1 ring-white/5">
                <div className="flex items-center gap-4 mb-4 cursor-pointer group" onClick={() => onUserClick?.({ id: item.user_id!, name: item.author!, avatar: item.author_avatar || '' })}>
                    <Avatar src={item.author_avatar} alt={item.author} size="lg" className="ring-2 ring-pink-500/50 shadow-2xl group-hover:scale-105 transition-transform" />
                    <div>
                        <h3 className="text-white font-black text-lg font-orbitron tracking-tight">@{item.author}</h3>
                        <span className="text-cyan-400 text-[9px] font-bold uppercase tracking-[0.2em] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">{item.category}</span>
                    </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3 font-light">
                    {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                    {item.tags?.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase text-pink-400/80 bg-pink-950/20 px-2.5 py-1 rounded-lg border border-pink-500/10">#{tag}</span>
                    ))}
                </div>
            </div>
        </div>

        {/* Mobile Caption area */}
        <div className="lg:hidden absolute bottom-0 inset-x-0 p-6 pb-12 bg-gradient-to-t from-black via-black/40 to-transparent z-[1050] pointer-events-none">
            <div className="pointer-events-auto max-w-[80%]">
                <h3 className="font-black text-white text-lg mb-1 drop-shadow-2xl">@{item.author}</h3>
                <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed drop-shadow-xl font-light">{item.description}</p>
            </div>
        </div>

        {/* Drawer & Overlays */}
        {isDrawerOpen && (
            <div className="fixed inset-0 z-[1200] flex animate-fade-in">
                <div className="flex-grow bg-black/80 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
                <div className="w-full md:w-[450px] bg-[#050505] h-full shadow-[-30px_0_60px_rgba(0,0,0,0.8)] border-l border-white/10 overflow-y-auto custom-scrollbar animate-slide-left">
                    <div className="sticky top-0 z-50 p-8 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-between border-b border-white/5">
                        <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs">Metadata Transmission</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-3 text-gray-500 hover:text-white bg-white/5 rounded-2xl transition-colors"><CloseIcon className="w-5 h-5" /></button>
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