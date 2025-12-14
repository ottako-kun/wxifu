import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './icons/LoadingSpinner';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const THRESHOLD = 80; // pixels to pull down to trigger refresh
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull to refresh if we are at the top of the page
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      // If we started at top and are pulling down
      if (startY > 0 && y > startY && window.scrollY === 0) {
         // Pulling down
         const diff = y - startY;
         // Add resistance
         if (diff < 200) { 
            setCurrentY(diff * 0.5); 
            // Prevent native scrolling while pulling
            if (e.cancelable) e.preventDefault(); 
         }
      } else {
        // Scrolling up or somewhere else
        setCurrentY(0);
      }
    };

    const handleTouchEnd = async () => {
      if (currentY > THRESHOLD) {
        setRefreshing(true);
        setCurrentY(THRESHOLD); // Snap to threshold
        try {
            await onRefresh();
        } finally {
            setTimeout(() => {
                setRefreshing(false);
                setCurrentY(0);
                setStartY(0);
            }, 500);
        }
      } else {
        setCurrentY(0);
        setStartY(0);
      }
    };

    // Attach to window/document to catch swipes properly
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false }); // non-passive to allow preventDefault
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, currentY, onRefresh]);

  return (
    <div className="relative min-h-screen">
      {/* Loading Indicator Layer */}
      <div 
        className="fixed top-0 left-0 w-full flex justify-center items-start pointer-events-none z-50 transition-transform duration-300"
        style={{ 
            transform: `translateY(${currentY > 0 ? currentY - 50 : -100}px)`,
            opacity: currentY > 0 ? Math.min(currentY / THRESHOLD, 1) : 0
        }}
      >
        <div className="bg-gray-900 border border-pink-500 rounded-full p-2 shadow-xl shadow-pink-500/20">
             <LoadingSpinner className={`w-6 h-6 text-pink-500 ${refreshing || currentY > THRESHOLD ? 'animate-spin' : ''} ${!refreshing && currentY <= THRESHOLD ? 'transform rotate-180' : ''}`} />
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={contentRef}
        style={{ 
            transform: `translateY(${currentY}px)`,
            transition: refreshing ? 'transform 0.3s ease' : 'transform 0.1s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;