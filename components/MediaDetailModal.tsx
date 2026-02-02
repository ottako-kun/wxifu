
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaItem, MediaType, Session } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SharePopover from './SharePopover';
import ReportModal from './ReportModal';
// Fixed: Import Session from local types
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
      className={`fixed inset-0 bg-black z-[1000] flex flex-col transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onMouseDown={handleDoubleTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
        {/* Top Actions */}
        <div className="absolute top-0 inset-x-0 z-[1100] flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={handleClose} className="p-2 text-white/70 hover:text-white bg-black/20 backdrop-blur-md rounded-full transition-colors border border-white/5">
                <CloseIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                 <button onClick={() => setIsReportModalOpen(true)} className="p-2 text-white/40 hover:text-red-400 bg-black/20 backdrop-blur-md rounded-full transition-colors border border-white/5">
                     <FlagIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>

        {/* Full Screen Viewer */}
        <div className="flex-grow w-full h-full relative overflow-hidden">
            <MediaViewer 
                item={item} 
                isUnlocked={isUnlocked} 
                onUnlockClick={() => unlockContent(item.id, item.price || 0)} 
                isUnlocking={isWalletLoading} 
                onMediaEnded={goToNext}
                onZoomChange={setIsZoomed} 
            />
        </div>

        {/* TikTok Interaction Overlay */}
        <div className="absolute inset-0 pointer-events-none z-[1050] flex flex-col justify-end">
            <div className="flex items-end justify-between p-6 pb-12 gap-6 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                
                {/* Meta Info (Bottom Left) */}
                <div className="flex-grow max-w-[70%] pointer-events-auto flex flex-col gap-3 animate-slide-up">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onUserClick?.({ id: item.user_id!, name: item.author!, avatar: item.author_avatar || '' })}>
                        <Avatar src={item.author_avatar} alt={item.author} size="md" className="ring-2 ring-pink-500 group-hover:scale-105 transition-transform" />
                        <div>
                            <h3 className="text-white font-bold text-base drop-shadow-md">@{item.author}</h3>
                            <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">{item.category}</span>
                        </div>
                    </div>
                    
                    <p className="text-white/90 text-sm line-clamp-2 leading-snug drop-shadow-md font-light italic">
                        {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                        {item.tags?.map(tag => (
                            <span key={tag} className="text-pink-400 font-bold text-xs drop-shadow-md">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Side Action HUD (Bottom Right) */}
                <div className="flex flex-col items-center gap-7 mb-4 pointer-events-auto animate-fade-in">
                    <div className="flex flex-col items-center">
                        <button onClick={handleLikeAction} className={`p-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 transition-all active:scale-75 ${isLiked ? 'text-pink-500' : 'text-white'}`}>
                            <HeartIcon filled={isLiked} className="w-8 h-8 drop-shadow-lg" />
                        </button>
                        <span className="text-[11px] font-bold text-white mt-1.5 drop-shadow-md">{likeCount}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button onClick={() => setIsDrawerOpen(true)} className="p-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-75">
                            <ChatIcon className="w-8 h-8 drop-shadow-lg" />
                        </button>
                        <span className="text-[11px] font-bold text-white mt-1.5 drop-shadow-md">Details</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button onClick={() => setIsTipModalOpen(true)} className="p-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-yellow-500 transition-all active:scale-75">
                            <GiftIcon className="w-8 h-8 drop-shadow-lg" />
                        </button>
                        <span className="text-[11px] font-bold text-white mt-1.5 drop-shadow-md">Support</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button onClick={(e) => setShareAnchorEl(e.currentTarget as HTMLElement)} className="p-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-75">
                            <ShareIcon className="w-8 h-8 drop-shadow-lg" />
                        </button>
                        <span className="text-[11px] font-bold text-white mt-1.5 drop-shadow-md">Share</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Slide-out Sidebar/Drawer (Right/Bottom) */}
        {isDrawerOpen && (
            <div className="fixed inset-0 z-[1200] flex animate-fade-in">
                {/* Backdrop overlay */}
                <div className="flex-grow bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
                
                {/* Content Panel */}
                <div className="w-full md:w-[450px] bg-[#050505] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/10 overflow-y-auto custom-scrollbar animate-slide-left">
                    <div className="sticky top-0 z-50 p-6 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between border-b border-white/5">
                        <h3 className="text-white font-bold uppercase tracking-widest text-sm">Engagement Panel</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-gray-400 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
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
