
import { useState, useEffect } from 'react';

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always show header at the very top (within 50px) to ensure visibility
      if (scrollY < 50) {
        setScrollDirection('up');
        lastScrollY = scrollY;
        ticking = false;
        return;
      }

      const diff = scrollY - lastScrollY;
      const threshold = 10; // Minimum scroll distance to trigger a change

      // Only update direction if we've scrolled past the threshold
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Scrolling Down
          setScrollDirection('down');
        } else {
          // Scrolling Up
          setScrollDirection('up');
        }
        // Update reference point only when threshold is crossed
        lastScrollY = scrollY;
      }
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollDirection;
};
