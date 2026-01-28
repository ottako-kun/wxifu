
import React, { useRef, useCallback } from 'react';

export const useDoubleTap = (callback: () => void, delay = 300) => {
  const lastTapRef = useRef<number>(0);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // We only care about the primary interaction
    const now = Date.now();
    const diff = now - lastTapRef.current;
    
    if (diff > 0 && diff < delay) {
       // It's a double tap
       callback();
       // Reset so a triple tap doesn't trigger two double taps
       lastTapRef.current = 0;
    } else {
       lastTapRef.current = now;
    }
  }, [callback, delay]);

  return handleTap;
};
