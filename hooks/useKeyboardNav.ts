
import { useEffect } from 'react';

interface KeyboardNavOptions {
  onNext?: () => void;
  onPrev?: () => void;
  onEscape?: () => void;
  disabled?: boolean;
}

export const useKeyboardNav = ({ onNext, onPrev, onEscape, disabled = false }: KeyboardNavOptions) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger navigation if the user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' && onNext) {
        onNext();
      } else if (e.key === 'ArrowUp' && onPrev) {
        onPrev();
      } else if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onEscape, disabled]);
};
