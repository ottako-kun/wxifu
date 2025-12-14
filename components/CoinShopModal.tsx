import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import CoinIcon from './icons/CoinIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { useWallet } from '../context/WalletContext';

interface CoinShopModalProps {
  onClose: () => void;
}

const PACKAGES = [
  { id: 'starter', coins: 100, price: 1.99, label: 'Starter Stash', bonus: 0 },
  { id: 'fan', coins: 500, price: 8.99, label: 'Fan Bundle', bonus: 50 },
  { id: 'collector', coins: 1200, price: 19.99, label: 'Collector\'s Hoard', bonus: 200, featured: true },
  { id: 'whale', coins: 3500, price: 49.99, label: 'Whale Chest', bonus: 800 },
];

const CoinShopModal: React.FC<CoinShopModalProps> = ({ onClose }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { purchasePackage } = useWallet();

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    setProcessingId(pkg.id);
    await purchasePackage(pkg.id);
    // Note: If successful, the page redirects to Stripe, so we don't need to stop loading state.
    // If it fails (and is caught in context), we stop loading.
    setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <CoinIcon className="w-32 h-32 text-yellow-500 transform rotate-12 translate-x-8 -translate-y-8" />
           </div>
           <div className="flex justify-between items-start relative z-10">
               <div>
                   <h2 className="text-2xl font-bold text-white font-orbitron tracking-wide uppercase">
                     Coin Shop
                   </h2>
                   <p className="text-yellow-500 text-sm font-medium mt-1">
                       Support creators & unlock premium content
                   </p>
               </div>
               <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full hover:bg-gray-800">
                 <CloseIcon className="w-5 h-5" />
               </button>
           </div>
        </div>

        {/* Packages */}
        <div className="p-6 overflow-y-auto space-y-4">
            {PACKAGES.map((pkg) => (
                <div 
                    key={pkg.id}
                    className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group cursor-pointer hover:scale-[1.02]
                        ${pkg.featured 
                            ? 'bg-gradient-to-r from-yellow-900/40 to-black border-yellow-500 shadow-lg shadow-yellow-900/20' 
                            : 'bg-gray-800/50 border-gray-700 hover:border-yellow-500/50 hover:bg-gray-800'
                        }
                    `}
                    onClick={() => !processingId && handlePurchase(pkg)}
                >
                    {pkg.featured && (
                        <div className="absolute -top-3 left-4 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                            Best Value
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${pkg.featured ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-gray-700 border-gray-600 text-gray-400 group-hover:text-yellow-400 group-hover:border-yellow-500/50'}`}>
                            <CoinIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${pkg.featured ? 'text-yellow-400' : 'text-white'}`}>
                                {pkg.coins} Coins
                            </h3>
                            {pkg.bonus > 0 && (
                                <p className="text-xs text-green-400 font-semibold">
                                    +{pkg.bonus} Bonus
                                </p>
                            )}
                            <p className="text-xs text-gray-500">{pkg.label}</p>
                        </div>
                    </div>

                    <button 
                        disabled={!!processingId}
                        className={`px-5 py-2 rounded-lg font-bold text-sm transition-all
                            ${pkg.featured
                                ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                                : 'bg-gray-700 hover:bg-white hover:text-black text-white'
                            }
                        `}
                    >
                        {processingId === pkg.id ? (
                            <LoadingSpinner className="w-5 h-5" />
                        ) : (
                            `$${pkg.price}`
                        )}
                    </button>
                </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-gray-800 text-center">
            <p className="text-[10px] text-gray-500">
                Secure payments processed by Stripe. Purchases are non-refundable.
            </p>
        </div>
      </div>
    </div>
  );
};

export default CoinShopModal;