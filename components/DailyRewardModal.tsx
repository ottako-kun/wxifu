import React, { useState } from 'react';
import CoinIcon from './icons/CoinIcon';
import CloseIcon from './icons/CloseIcon';

interface DailyRewardModalProps {
  onClaim: () => void;
  streak?: number;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ onClaim, streak = 1 }) => {
  const [isOpen, setIsOpen] = useState(false); // Animation state
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-sm bg-gray-900 border border-pink-500/50 rounded-2xl shadow-[0_0_50px_rgba(236,72,153,0.2)] overflow-hidden flex flex-col items-center text-center p-8">
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

        {/* Header */}
        <h2 className="text-2xl font-black text-white uppercase font-orbitron tracking-wider mb-2 relative z-10">
            Daily Supply Drop
        </h2>
        <p className="text-pink-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 relative z-10">
            Login Streak: {streak} Days
        </p>

        {/* Central Graphic */}
        <div className="relative mb-8 group cursor-pointer" onClick={onClaim}>
            <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse"></div>
            <div className="relative w-32 h-32 bg-gray-800 rounded-full border-4 border-gray-700 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <CoinIcon className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
            </div>
            
            {/* Floating text */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-sm px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                +50 COINS
            </div>
        </div>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-8 leading-relaxed relative z-10">
            Welcome back, operative. Here is your daily allowance to unlock premium assets.
        </p>

        {/* Button */}
        <button
            onClick={onClaim}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/20 transform transition-all duration-300 hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm relative z-10"
        >
            Claim Reward
        </button>
      </div>
    </div>
  );
};

export default DailyRewardModal;