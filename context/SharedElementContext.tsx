import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SharedElement {
  id: string;
  rect: DOMRect | null;
  element: HTMLElement | null;
}

interface TransitionState {
  isTransitioning: boolean;
  fromView: string | null;
  toView: string | null;
  sharedElements: Map<string, SharedElement>;
}

interface SharedElementContextType {
  registerElement: (id: string, element: HTMLElement | null) => void;
  unregisterElement: (id: string) => void;
  startTransition: (fromView: string, toView: string) => void;
  endTransition: () => void;
  isTransitioning: boolean;
  getSharedElementStyle: (id: string, isTarget: boolean) => React.CSSProperties;
}

const SharedElementContext = createContext<SharedElementContextType | null>(null);

export const SharedElementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<Map<string, SharedElement>>(new Map());
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    fromView: null,
    toView: null,
    sharedElements: new Map(),
  });

  const registerElement = useCallback((id: string, element: HTMLElement | null) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    setElements(prev => {
      const next = new Map(prev);
      next.set(id, { id, rect, element });
      return next;
    });
  }, []);

  const unregisterElement = useCallback((id: string) => {
    setElements(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const startTransition = useCallback((fromView: string, toView: string) => {
    setTransitionState({
      isTransitioning: true,
      fromView,
      toView,
      sharedElements: new Map(elements),
    });
  }, [elements]);

  const endTransition = useCallback(() => {
    setTransitionState({
      isTransitioning: false,
      fromView: null,
      toView: null,
      sharedElements: new Map(),
    });
  }, []);

  const getSharedElementStyle = useCallback((id: string, isTarget: boolean): React.CSSProperties => {
    const element = elements.get(id);
    if (!element?.rect) return {};

    return {
      position: 'fixed',
      top: `${element.rect.top}px`,
      left: `${element.rect.left}px`,
      width: `${element.rect.width}px`,
      height: `${element.rect.height}px`,
      zIndex: isTarget ? 1000 : 999,
      pointerEvents: 'none',
    };
  }, [elements]);

  return (
    <SharedElementContext.Provider
      value={{
        registerElement,
        unregisterElement,
        startTransition,
        endTransition,
        isTransitioning: transitionState.isTransitioning,
        getSharedElementStyle,
      }}
    >
      {children}
    </SharedElementContext.Provider>
  );
};

export const useSharedElement = () => {
  const context = useContext(SharedElementContext);
  if (!context) {
    throw new Error('useSharedElement must be used within SharedElementProvider');
  }
  return context;
};

// Hook for creating shared element transitions
export const useSharedElementTransition = (id: string, ref: React.RefObject<HTMLElement>) => {
  const { registerElement, unregisterElement, getSharedElementStyle, isTransitioning } = useSharedElement();

  useEffect(() => {
    if (ref.current) {
      registerElement(id, ref.current);
    }
    return () => {
      unregisterElement(id);
    };
  }, [id, ref, registerElement, unregisterElement]);

  return {
    style: getSharedElementStyle(id, false),
    isTransitioning,
  };
};
