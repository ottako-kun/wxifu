import React from 'react';
import { useToast, ToastType } from '../context/ToastContext';
import CloseIcon from './icons/CloseIcon';

const ToastItem: React.FC<{
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}> = ({ id, message, type, onClose }) => {
  
  const styles = {
    success: 'border-green-500 bg-green-900/90 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    error: 'border-red-500 bg-red-900/90 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
    info: 'border-cyan-500 bg-gray-900/95 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg border-l-4 backdrop-blur-md mb-3 min-w-[300px] max-w-sm animate-fade-in transform transition-all hover:scale-[1.02]
      ${styles[type]}
    `}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-grow text-sm font-medium leading-relaxed">
        {message}
      </div>
      <button 
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-20 md:top-20 md:bottom-auto right-4 left-4 md:left-auto z-[100] flex flex-col items-center md:items-end pointer-events-none">
      <div className="pointer-events-auto w-full md:w-auto flex flex-col items-center md:items-end">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
