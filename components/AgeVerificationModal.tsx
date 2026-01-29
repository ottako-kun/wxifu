import React from 'react';
import { APP_CONFIG } from '../config';

interface AgeVerificationModalProps {
  onVerify: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify }) => {
  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background with strong blur and darkness */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl"></div>
      
      <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 bg-pink-500/10 rounded-full flex items-center justify-center border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
          <span className="text-2xl font-bold text-pink-500">18+</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase font-orbitron tracking-wide">
          Adult Content Warning
        </h2>

        <p className="text-gray-400 mb-6 leading-relaxed">
          Welcome to <span className="text-pink-400 font-bold">{APP_CONFIG.name}{APP_CONFIG.nameSuffix}</span>.
        </p>
        
        <p className="text-gray-300 mb-8 text-sm leading-relaxed border-l-2 border-cyan-500/50 pl-4 text-left bg-black/20 p-4 rounded-r-lg">
          This community features uncensored artistic content, including nudity and mature themes, intended solely for adults. 
          <br/><br/>
          By entering, you confirm that you are at least <strong>18 years of age</strong> (or the age of majority in your jurisdiction) and consent to view such content.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onVerify}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/20 transform transition-all duration-300 hover:-translate-y-0.5 uppercase tracking-wider text-sm"
          >
            I am 18+ & Enter
          </button>
          
          <button
            onClick={handleExit}
            className="w-full py-3 bg-transparent text-gray-500 hover:text-white font-semibold rounded-xl border border-gray-800 hover:border-gray-600 transition-colors text-xs uppercase tracking-wider"
          >
            Exit Site
          </button>
        </div>
        
        <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest">
            Liberated Art • Community • Respect
        </p>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
