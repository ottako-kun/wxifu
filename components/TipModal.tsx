import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import CoinIcon from './icons/CoinIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { useWallet } from '../context/WalletContext';

interface TipModalProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

const TIP_AMOUNTS = [10, 50, 100, 500];

const TipModal: React.FC<TipModalProps> = ({ recipientId, recipientName, onClose }) => {
  const { tipUser, balance } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
      const amount = selectedAmount || parseInt(customAmount);
      if (!amount || amount <= 0) return;

      setIsSending(true);
      const success = await tipUser(recipientId, amount);
      setIsSending(false);

      if (success) {
          setTimeout(onClose, 500); // Wait a bit to show success state if we added animation later
      }
  };

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);
  const canAfford = balance >= finalAmount;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] w-full max-w-sm overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <div>
                <h3 className="font-bold text-white text-lg font-orbitron tracking-wide text-yellow-500">
                    Send Gift
                </h3>
                <p className="text-xs text-gray-400">To: {recipientName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            <div className="text-center mb-4">
                <p className="text-gray-400 text-xs mb-1">Your Balance</p>
                <div className="flex items-center justify-center gap-1 text-white font-bold text-xl">
                    <CoinIcon className="w-5 h-5 text-yellow-500" />
                    {balance}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {TIP_AMOUNTS.map(amount => (
                    <button
                        key={amount}
                        onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                        className={`py-3 rounded-xl border font-bold flex items-center justify-center gap-1 transition-all
                            ${selectedAmount === amount 
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-500/10' 
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }
                        `}
                    >
                        <CoinIcon className="w-4 h-4" />
                        {amount}
                    </button>
                ))}
            </div>

            <div className="relative">
                <input 
                    type="number"
                    placeholder="Custom Amount"
                    value={customAmount}
                    onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                    }}
                    className={`w-full bg-black/30 border rounded-xl py-3 pl-4 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${selectedAmount === null && customAmount ? 'border-yellow-500 ring-yellow-500' : 'border-gray-700 focus:border-yellow-500'}`}
                />
            </div>

            <button
                onClick={handleSend}
                disabled={isSending || finalAmount <= 0 || !canAfford}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg flex items-center justify-center gap-2
                    ${isSending 
                        ? 'bg-gray-700 text-gray-400 cursor-wait'
                        : !canAfford
                            ? 'bg-red-900/50 text-red-400 border border-red-900 cursor-not-allowed'
                            : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black shadow-yellow-500/20 transform hover:-translate-y-0.5'
                    }
                `}
            >
                {isSending ? (
                    <LoadingSpinner className="w-5 h-5" />
                ) : !canAfford ? (
                    `Insufficient Funds`
                ) : (
                    <>Send Gift</>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TipModal;