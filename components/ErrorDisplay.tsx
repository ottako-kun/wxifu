
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ErrorDisplayProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  onCancel?: () => void;
  retryLabel?: string;
  cancelLabel?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  icon,
  onRetry,
  onCancel,
  retryLabel = 'Try Again',
  cancelLabel = 'Cancel'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center border border-red-500/20 rounded-[2rem] bg-red-950/10 backdrop-blur-xl max-w-md mx-auto"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
      >
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )}
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-black text-white mb-3 uppercase tracking-widest font-orbitron"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 mb-8 text-sm font-medium leading-relaxed max-w-xs"
      >
        {message}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3"
      >
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all min-h-[44px]"
          >
            {cancelLabel}
          </button>
        )}
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] active:scale-95 min-h-[44px]"
          >
            {retryLabel}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ErrorDisplay;
