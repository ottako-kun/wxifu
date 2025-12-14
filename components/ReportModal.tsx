import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import FlagIcon from './icons/FlagIcon';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
  isSubmitting: boolean;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState('Inappropriate Content');
  const [details, setDetails] = useState('');

  const REASONS = [
    'Inappropriate Content (Underage/Illegal)',
    'Spam or Misleading',
    'Harassment or Hate Speech',
    'Copyright Infringement',
    'Wrong Category/Tags',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason, details);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="font-bold text-white text-lg font-orbitron tracking-wide flex items-center gap-2">
            <span className="text-red-500"><FlagIcon className="w-5 h-5"/></span>
            Report Content
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Why are you reporting this?</label>
            <div className="space-y-2">
                {REASONS.map(r => (
                    <label key={r} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors border border-transparent hover:border-gray-700">
                        <input 
                            type="radio" 
                            name="reason" 
                            value={r} 
                            checked={reason === r}
                            onChange={(e) => setReason(e.target.value)}
                            className="text-pink-600 focus:ring-pink-500 bg-gray-900 border-gray-600"
                        />
                        <span className="text-sm text-gray-300">{r}</span>
                    </label>
                ))}
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Details (Optional)</label>
             <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-red-500 focus:outline-none resize-none"
                placeholder="Provide more context..."
             />
          </div>
          
          <div className="pt-2">
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;