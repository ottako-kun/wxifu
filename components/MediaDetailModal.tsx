
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, MediaType } from '../types';
import { reportMediaItem } from '../lib/supabaseClient';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SharePopover from './SharePopover';
import ReportModal from './ReportModal';
import { Session } from '@supabase/supabase-js';
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
import LoadingSpinner from './icons/LoadingSpinner';

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
  
  // Immersive States
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);

  // Drawer / UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
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
        setIsDrawerOpen(false);
        setIsZoomed(false);
    }
  }, [currentIndex, isZoomed]);

  const goToNext = useCallback(() => {
    if (isZoomed) return;
    if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsDrawerOpen(false);
        setIsZoomed(false);
    } else {
        setIsAutoplay(false);
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
    onSwipeUp: isDrawerOpen ? undefined : () => setIsDrawerOpen(true),
    onSwipeDown: isDrawerOpen ? () => setIsDrawerOpen(false) : handleClose,
    onSwipeLeft: isDrawerOpen ? undefined : goToNext,
    onSwipeRight: isDrawerOpen ? undefined : goToPrevious,
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
      className={`fixed inset-0 bg-black z-[1000] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={handleDoubleTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
        {/* Top Header */}
        <div className={`absolute top-0 inset-x-0 z-[1100] flex items-center justify-between p-4 pt-8 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${isFocusMode ? 'opacity-0' : 'opacity-100'}`}>
            <button onClick={handleClose} className="p-2 text-white/70 hover:text-white bg-black/20 backdrop-blur-md rounded-full transition-colors"><CloseIcon className="w-6 h-6" /></button>
            <div className="flex items-center gap-2">
                 <button onClick={() => setIsFocusMode(!isFocusMode)} className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">{isFocusMode ? 'Show Controls' : 'Focus Mode'}</button>
            </div>
        </div>

        <div className="flex-grow flex flex-col md:flex-row relative overflow-hidden h-full">
            {/* Nav Arrows (Desktop) */}
            <button onClick={goToPrevious} disabled={currentIndex === 0} className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all disabled:opacity-0 hidden lg:block border border-white/5 backdrop-blur-sm"><ChevronLeftIcon className="w-8 h-8" /></button>
            <button onClick={goToNext} disabled={currentIndex === items.length - 1} className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all disabled:opacity-0 hidden lg:block border border-white/5 backdrop-blur-sm"><ChevronRightIcon className="w-8 h-8" /></button>

            {/* Main Viewer */}
            <div className="flex-grow h-full relative">
                <MediaViewer 
                    item={item} 
                    isUnlocked={isUnlocked} 
                    onUnlockClick={() => unlockContent(item.id, item.price || 0)} 
                    isUnlocking={isWalletLoading} 
                    onMediaEnded={goToNext}
                    onZoomChange={setIsZoomed} 
                />
            </div>

            {/* Sidebar (Desktop) */}
            {!isFocusMode && (
                <div className="hidden lg:block w-[400px] h-full border-l border-white/10 bg-[#050505] overflow-y-auto custom-scrollbar">
                    <MediaSidebar 
                        item={item} 
                        session={session} 
                        relatedItems={relatedItems} 
                        isOwner={isOwner} 
                        onAuthorClick={() => { handleClose(); onUserClick?.({ id: item.user_id!, name: item.author!, avatar: item.author_avatar || '' }); }} 
                        onRelatedClick={(id) => { const idx = items.findIndex(i => i.id === id); if (idx !== -1) setCurrentIndex(idx); }} 
                        onShareClick={(e) => setShareAnchorEl(e.currentTarget as HTMLElement)} 
                        onReportClick={() => setIsReportModalOpen(true)} 
                        onDataChange={onDataChange} 
                        onDeleteSuccess={handleClose} 
                    />
                </div>
            )}
        </div>

        {/* Mobile Interaction Bar */}
        {!isFocusMode && (
            <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 pb-safe bg-gradient-to-t from-black to-transparent z-[1050] flex items-end justify-between gap-4">
                <div className="flex flex-col gap-2 max-w-[70%]">
                    {/* Fixed onAuthorClick error: using onUserClick and closing modal on navigation */}
                    <div className="flex items-center gap-3" onClick={() => { handleClose(); onUserClick?.({ id: item.user_id!, name: item.author!, avatar: item.author_avatar || '' }); }}>
                        <div className="w-10 h-10 rounded-full border-2 border-pink-500 overflow-hidden shadow-lg">
                            <img src={item.author_avatar || `https://ui-avatars.com/api/?name=${item.author}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white font-bold text-sm truncate">{item.author}</p>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider">{item.category}</p>
                        </div>
                    </div>
                    <p className="text-gray-200 text-xs line-clamp-2 leading-snug">{item.description}</p>
                </div>

                {/* Vertical Actions */}
                <div className="flex flex-col items-center gap-6 mb-2">
                    <div className="flex flex-col items-center">
                        <button onClick={handleLikeAction} className={`p-2 transition-transform active:scale-75 ${isLiked ? 'text-pink-500' : 'text-white'}`}>
                            <HeartIcon filled={isLiked} className="w-8 h-8 drop-shadow-lg" />
                        </button>
                        <span className="text-[10px] font-bold text-white drop-shadow-md">{likeCount}</span>
                    </div>
                    <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-white">
                        <ChatIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <button onClick={() => setIsTipModalOpen(true)} className="p-2 text-yellow-500">
                        <GiftIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                    <button onClick={(e) => setShareAnchorEl(e.currentTarget as HTMLElement)} className="p-2 text-white">
                        <ShareIcon className="w-8 h-8 drop-shadow-lg" />
                    </button>
                </div>
            </div>
        )}

        {/* Mobile Swipe-up Drawer */}
        {isDrawerOpen && (
            <div className="lg:hidden fixed inset-0 z-[1200] flex flex-col animate-slide-up">
                <div className="flex-grow" onClick={() => setIsDrawerOpen(false)}></div>
                <div className="h-[70vh] bg-[#050505] rounded-t-[2.5rem] border-t border-white/10 flex flex-col overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                    <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto my-4 flex-shrink-0" onClick={() => setIsDrawerOpen(false)}></div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pb-20">
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
            </div>
        )}

        {shareAnchorEl && <SharePopover item={item} anchorEl={shareAnchorEl} onClose={() => setShareAnchorEl(null)} />}
        {isReportModalOpen && <ReportModal onClose={() => setIsReportModalOpen(false)} isSubmitting={isReporting} onSubmit={async (r, d) => { if (!session) return; setIsReporting(true); try { await reportMediaItem({ media_id: item.id, reporter_id: session.user.id, reason: r, details: d }); toast.success("Reported"); setIsReportModalOpen(false); } finally { setIsReporting(false); } }} />}
        {isTipModalOpen && <TipModal recipientId={item.user_id || ''} recipientName={item.author || ''} onClose={() => setIsTipModalOpen(false)} />}
    </div>
  );
};

export default MediaDetailModal;
