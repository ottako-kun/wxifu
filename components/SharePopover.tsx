import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, MediaType } from '../types';
import TwitterIcon from './icons/TwitterIcon';
import LinkIcon from './icons/LinkIcon';

interface SharePopoverProps {
  item: MediaItem;
  onClose: () => void;
  anchorEl: HTMLElement;
}

const SharePopover: React.FC<SharePopoverProps> = ({ item, onClose, anchorEl }) => {
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const shareUrl = item.type === MediaType.Photo ? item.src : (item.videoSrc || item.src);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, anchorEl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    });
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(item.description || "Check out this from SelleShy's Gallery!");
    const url = `https://x.com/intent/post?url=${encodeURIComponent(shareUrl)}&text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const getPopoverPosition = () => {
    if (!anchorEl) return {};
    const rect = anchorEl.getBoundingClientRect();
    const popoverWidth = 192; // w-48
    const popoverHeight = 92; // approximate height
    const margin = 8;
    
    let top = rect.bottom + margin;
    let left = rect.left;

    if (top + popoverHeight > window.innerHeight) {
        top = rect.top - popoverHeight - margin;
    }

    if (left + popoverWidth > window.innerWidth) {
        left = rect.right - popoverWidth;
    }
    
    left = Math.max(margin, left);

    return {
      position: 'fixed' as 'fixed',
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  return (
    <div
      ref={popoverRef}
      style={getPopoverPosition()}
      className="z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl animate-fade-in py-2 px-1 w-48"
    >
      <button
        onClick={copyToClipboard}
        className="w-full flex items-center gap-x-3 px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
      >
        <LinkIcon className="w-5 h-5" />
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
      <button
        onClick={shareOnTwitter}
        className="w-full flex items-center gap-x-3 px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
      >
        <TwitterIcon className="w-5 h-5" />
        <span>Share on X</span>
      </button>
    </div>
  );
};

export default SharePopover;
