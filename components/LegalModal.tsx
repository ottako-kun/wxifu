import React from 'react';
import CloseIcon from './icons/CloseIcon';

interface LegalModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md sticky top-0 z-10">
           <h2 className="text-xl font-bold text-white font-orbitron tracking-wide uppercase text-pink-500 shadow-pink-500/10 drop-shadow-md">
             {title}
           </h2>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full hover:bg-gray-800">
             <CloseIcon className="w-5 h-5" />
           </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 md:p-8 text-gray-300 text-sm leading-relaxed space-y-6 custom-scrollbar bg-gray-900/50">
            {children}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur-md flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs font-bold uppercase tracking-wider border border-gray-700 hover:border-gray-500"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
