import { useState, useCallback, useRef, useEffect } from 'react';

interface UseGestureOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export const useGesture = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onPinchIn,
  onPinchOut,
  onTap,
  onDoubleTap,
  threshold = 50,
  disabled = false,
}: UseGestureOptions) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    if (e.touches.length === 2 && onPinchIn) {
      pinchStartDistance.current = getDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  }, [disabled, onPinchIn]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    if (e.touches.length === 2 && pinchStartDistance.current !== null) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const diff = pinchStartDistance.current - currentDistance;

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && onPinchIn) {
          onPinchIn();
          pinchStartDistance.current = null;
        } else if (diff < 0 && onPinchOut) {
          onPinchOut();
          pinchStartDistance.current = null;
        }
      }
    } else if (e.touches.length === 1) {
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    }
  }, [disabled, onPinchIn, onPinchOut, threshold]);

  const onTouchEnd = useCallback(() => {
    if (disabled) return;

    // Handle swipe gestures
    if (touchStartX.current !== null && touchStartY.current !== null && 
        touchEndX.current !== null && touchEndY.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      const diffY = touchStartY.current - touchEndY.current;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0 && onSwipeLeft) onSwipeLeft();
          else if (diffX < 0 && onSwipeRight) onSwipeRight();
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          if (diffY > 0 && onSwipeUp) onSwipeUp();
          else if (diffY < 0 && onSwipeDown) onSwipeDown();
        }
      }
    }

    // Reset values
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
    pinchStartDistance.current = null;
  }, [disabled, threshold, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;

    if (timeSinceLastTap < 300 && onDoubleTap) {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      onDoubleTap();
    } else if (onTap) {
      tapTimer.current = setTimeout(() => {
        onTap();
        tapTimer.current = null;
      }, 300);
    }

    lastTapTime.current = now;
  }, [onTap, onDoubleTap]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    handleTap,
  };
};
