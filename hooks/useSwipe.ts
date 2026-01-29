
import React, { useRef } from 'react';

interface UseSwipeOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  // Add disabled property to fix error in MediaDetailModal where it's passed during zoom
  disabled?: boolean;
}

export const useSwipe = ({ 
  onSwipeUp, 
  onSwipeDown, 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 50,
  // Destructure disabled property with default false
  disabled = false
}: UseSwipeOptions) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    // If swipes are disabled (e.g., when zoomed), do nothing
    if (disabled) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // If swipes are disabled (e.g., when zoomed), do nothing
    if (disabled) return;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const onTouchEnd = () => {
    // If swipes are disabled (e.g., when zoomed), do nothing
    if (disabled) return;
    
    if (!touchStartX.current || !touchStartY.current || !touchEndX.current || !touchEndY.current) {
        return;
    }

    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Determine if horizontal or vertical swipe was more dominant
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal Swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (diffX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      // Vertical Swipe
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (diffY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};
