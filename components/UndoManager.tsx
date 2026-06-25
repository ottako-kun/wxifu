
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';

interface UndoAction {
  id: string;
  message: string;
  onUndo: () => void;
  timestamp: number;
}

interface UndoToastProps {
  action: UndoAction;
  onClose: () => void;
}

const UNDO_TIMEOUT = 5000; // 5 seconds

export const UndoToast: React.FC<UndoToastProps> = ({ action, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(UNDO_TIMEOUT);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = UNDO_TIMEOUT - elapsed;
      
      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      } else {
        setTimeLeft(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onClose]);

  const handleUndo = () => {
    action.onUndo();
    onClose();
  };

  const progress = (timeLeft / UNDO_TIMEOUT) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl max-w-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm text-white font-medium">{action.message}</p>
        <button
          onClick={handleUndo}
          className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors min-h-[36px]"
          aria-label="Undo action"
        >
          Undo
        </button>
      </div>
      <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-pink-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

interface UndoManagerProps {
  children: React.ReactNode;
}

export const UndoManager: React.FC<UndoManagerProps> = ({ children }) => {
  const [pendingAction, setPendingAction] = useState<UndoAction | null>(null);
  const toast = useToast();

  const queueUndo = (action: Omit<UndoAction, 'timestamp'>) => {
    const newAction: UndoAction = {
      ...action,
      timestamp: Date.now(),
    };
    setPendingAction(newAction);
  };

  const closeUndo = () => {
    setPendingAction(null);
  };

  // Expose queueUndo to window for global access
  useEffect(() => {
    (window as any).queueUndo = queueUndo;
    return () => {
      delete (window as any).queueUndo;
    };
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {pendingAction && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4">
            <UndoToast action={pendingAction} onClose={closeUndo} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Helper function to create undoable actions
export const createUndoableAction = (
  execute: () => Promise<void>,
  undo: () => Promise<void>,
  successMessage: string
) => {
  return async () => {
    await execute();
    if ((window as any).queueUndo) {
      (window as any).queueUndo({
        id: `action-${Date.now()}`,
        message: successMessage,
        onUndo: undo,
      });
    }
  };
};

export default UndoManager;
