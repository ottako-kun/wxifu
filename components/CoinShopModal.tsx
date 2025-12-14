import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import CoinIcon from './icons/CoinIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import Avatar, { FRAMES } from './Avatar';

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
  const [activeTab, setActiveTab] = useState<'coins' | 'frames'>('coins');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  
  const { purchasePackage, addCoins, balance, buyFrame, activeFrame } = useWallet();
  const toast = useToast();

  const handlePurchase = async (pkg: typeof PACKAGES[0]) => {
    setProcessingId(pkg.id);
    await purchasePackage(pkg.id);
    setProcessingId(null);
  };

  const handleWatchAd = async () => {
      setIsWatchingAd(true);
      setTimeout(async () => {
          await addCoins(15);
          toast.success("Ad watched! +15 Coins received.");
          setIsWatchingAd(false);
      }, 3000);
  };

  const handleBuyFrame = async (frameId: string, price: number) => {
      if (activeFrame === frameId) return; // Already equipped
      setProcessingId(frameId);
      const success = await buyFrame(frameId, price);
      setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-b from-gray-800 to-gray-900 relative">
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <CoinIcon className="w-32 h-32 text-yellow-500 transform rotate-12 translate-x-8 -translate-y-8" />
           </div>
           
           <div className="flex justify-between items-start relative z-10 mb-6">
               <div>
                   <h2 className="text-2xl font-bold text-white font-orbitron tracking-wide uppercase">
                     Marketplace
                   </h2>
                   <div className="flex items-center gap-2 mt-1">
                       <span className="text-yellow-500 font-bold flex items-center gap-1">
                           <CoinIcon className="w-4 h-4" /> {balance}
                       </span>
                       <span className="text-gray-500 text-sm">Available Balance</span>
                   </div>
               </div>
               <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full hover:bg-gray-800">
                 <CloseIcon className="w-5 h-5" />
               </button>
           </div>

           {/* Tabs */}
           <div className="flex space-x-4 relative z-10">
               <button 
                  onClick={() => setActiveTab('coins')}
                  className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'coins' ? 'text-yellow-400 border-yellow-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
               >
                   Buy Coins
               </button>
               <button 
                  onClick={() => setActiveTab('frames')}
                  className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'frames' ? 'text-pink-400 border-pink-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
               >
                   Decorations
               </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
            {activeTab === 'coins' ? (
                <>
                    {/* Free Coins Section */}
                    <div className="p-4 mx-6 mt-6 bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/30 text-cyan-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Free Coins</h4>
                                <p className="text-gray-400 text-xs">Watch a short ad</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleWatchAd}
                            disabled={isWatchingAd}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded-lg shadow-lg disabled:opacity-50 min-w-[100px] flex justify-center"
                        >
                            {isWatchingAd ? <LoadingSpinner className="w-4 h-4" /> : '+15 Coins'}
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
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
                </>
            ) : (
                // Frames Shop
                <div className="p-6 grid grid-cols-2 gap-4">
                    {Object.entries(FRAMES).filter(([key]) => key !== 'none').map(([key, frame]) => {
                         const isEquipped = activeFrame === key;
                         const canAfford = balance >= frame.price;

                         return (
                             <div key={key} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-gray-500 transition-colors">
                                 <Avatar frame={key} alt="Preview" size="lg" />
                                 <div className="text-center">
                                     <h4 className="font-bold text-white text-sm">{frame.label}</h4>
                                     <p className="text-yellow-500 text-xs font-bold flex items-center justify-center gap-1">
                                         <CoinIcon className="w-3 h-3" /> {frame.price}
                                     </p>
                                 </div>
                                 <button
                                     onClick={() => handleBuyFrame(key, frame.price)}
                                     disabled={processingId === key || isEquipped || (!canAfford && !isEquipped)}
                                     className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider
                                        ${isEquipped 
                                            ? 'bg-green-600/20 text-green-400 border border-green-600 cursor-default'
                                            : !canAfford
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg'
                                        }
                                     `}
                                 >
                                     {processingId === key ? <LoadingSpinner className="w-4 h-4 mx-auto"/> : isEquipped ? 'Equipped' : 'Buy'}
                                 </button>
                             </div>
                         );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CoinShopModal;