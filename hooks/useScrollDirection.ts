
import { useState, useEffect, useRef } from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const threshold = 15; // Increased threshold for smoother feeling
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always show header at the very top
      if (scrollY < 80) {
        setScrollDirection('up');
        lastScrollY.current = scrollY;
        ticking.current = false;
        return;
      }

      const diff = scrollY - lastScrollY.current;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
        lastScrollY.current = scrollY;
      }
      
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollDirection;
};
