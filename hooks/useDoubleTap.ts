
import { useRef, useCallback } from 'react';

export const useDoubleTap = (callback: () => void, delay = 300) => {
  const lastTapRef = useRef<number>(0);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < delay) {
       // Prevent default zoom or other browser actions on double tap if needed
       if (e.cancelable && e.type === 'touchend') {
          e.preventDefault();
       }
       callback();
    }
    lastTapRef.current = now;
  }, [callback, delay]);

  return handleTap;
};
