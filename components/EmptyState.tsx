
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  illustration?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  illustration
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      role="status"
      aria-live="polite"
    >
      {illustration ? (
        <div className="mb-8">{illustration}</div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center mb-8 border border-pink-500/20 shadow-[0_0_40px_rgba(236,72,153,0.1)]"
        >
          <div className="w-12 h-12 text-pink-500">{icon}</div>
        </motion.div>
      )}
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-black text-white mb-4 uppercase tracking-widest font-orbitron"
      >
        {title}
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-500 mb-8 max-w-md text-sm font-medium leading-relaxed"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={action.onClick}
            className={cn(
              "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl active:scale-95 min-h-[48px]",
              action.variant === 'secondary'
                ? "border border-pink-500/40 text-pink-500 hover:bg-pink-500 hover:text-white"
                : "bg-pink-500 hover:bg-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]"
            )}
          >
            {action.label}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
