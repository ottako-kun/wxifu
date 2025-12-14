import React from 'react';
import CloseIcon from './icons/CloseIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="font-bold text-white text-lg font-orbitron tracking-wide flex items-center gap-2">
            {variant === 'danger' && <span className="text-red-500">⚠</span>}
            {title}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="p-4 bg-black/40 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-600"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 ${
              variant === 'danger'
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/20'
                : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-900/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;