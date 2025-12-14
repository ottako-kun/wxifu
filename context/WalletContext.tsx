
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserBalance, getUnlockedMedia, unlockMedia } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useToast } from './ToastContext';

interface WalletContextType {
  balance: number;
  unlockedIds: string[];
  activeFrame: string;
  refreshWallet: () => Promise<void>;
  unlockContent: (mediaId: string, price: number, authorId?: string) => Promise<boolean>;
  purchasePackage: (packageId: string) => Promise<void>;
  addCoins: (amount: number) => Promise<boolean>;
  tipUser: (recipientId: string, amount: number) => Promise<boolean>;
  buyFrame: (frameId: string, price: number) => Promise<boolean>;
  isUnlocked: (mediaId: string) => boolean;
  isLoading: boolean;
  claimDailyReward: () => Promise<boolean>;
  checkIfRewardAvailable: () => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [activeFrame, setActiveFrame] = useState('none');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshWallet = async () => {
    if (!session) {
        setBalance(0);
        setUnlockedIds([]);
        setActiveFrame('none');
        return;
    }

    try {
        const { coins } = await getUserBalance(session.user.id);
        const { unlockedIds: dbUnlockedIds } = await getUnlockedMedia(session.user.id);
        
        // Fetch LocalStorage unlocks for static items
        const localStaticUnlocks = JSON.parse(localStorage.getItem(`unlocked_static_${session.user.id}`) || '[]');
        
        // Fetch Frame (Simulating extra column since we can't migrate DB easily in this environment)
        const savedFrame = localStorage.getItem(`frame_${session.user.id}`);
        if (savedFrame) setActiveFrame(savedFrame);

        setBalance(coins);
        setUnlockedIds([...dbUnlockedIds, ...localStaticUnlocks]);
    } catch (error) {
        console.warn("Wallet sync issue:", error);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, [session]);

  const unlockContent = async (mediaId: string, price: number, authorId?: string) => {
      if (!session) {
          toast.error("Please sign in to unlock content.");
          return false;
      }
      
      setIsLoading(true);
      try {
          // Special handling for Static (Non-DB) Items
          if (mediaId.startsWith('static-')) {
              if (balance < price) {
                  throw new Error("Insufficient coins");
              }

              // Deduct coins via API
              const { error: deductError } = await supabase
                  .from('profiles')
                  .update({ coins: balance - price })
                  .eq('id', session.user.id);

              if (deductError) throw new Error("Transaction failed");

              // Save unlock locally since we can't save static-ID to DB foreign key
              const localKey = `unlocked_static_${session.user.id}`;
              const currentUnlocks = JSON.parse(localStorage.getItem(localKey) || '[]');
              if (!currentUnlocks.includes(mediaId)) {
                  currentUnlocks.push(mediaId);
                  localStorage.setItem(localKey, JSON.stringify(currentUnlocks));
              }
              
              await refreshWallet();
              toast.success("Content unlocked!");
              return true;
          }

          // Standard DB Item
          await unlockMedia(session.user.id, mediaId, price, authorId);
          await refreshWallet();
          toast.success("Content unlocked!");
          return true;
      } catch (error: any) {
          toast.error(error.message || "Failed to unlock content.");
          return false;
      } finally {
          setIsLoading(false);
      }
  };

  const addCoins = async (amount: number) => {
      if (!session) return false;
      try {
          const newBalance = balance + amount;
          const { error } = await supabase
              .from('profiles')
              .update({ coins: newBalance })
              .eq('id', session.user.id);

          if (error) throw error;
          
          setBalance(newBalance);
          return true;
      } catch (error) {
          console.error("Failed to add coins", error);
          return false;
      }
  };

  // Logic for Tipping a User
  const tipUser = async (recipientId: string, amount: number) => {
      if (!session) {
          toast.error("Please sign in to tip.");
          return false;
      }
      if (balance < amount) {
          toast.error("Insufficient coins. Please recharge.");
          return false;
      }

      setIsLoading(true);
      try {
          // 1. Deduct from Sender
          const newSenderBalance = balance - amount;
          const { error: senderError } = await supabase
              .from('profiles')
              .update({ coins: newSenderBalance })
              .eq('id', session.user.id);
          
          if (senderError) throw senderError;

          // 2. Add to Recipient
          if (recipientId && !recipientId.startsWith('static')) {
              const { data: recipientData } = await supabase.from('profiles').select('coins').eq('id', recipientId).single();
              if (recipientData) {
                   await supabase
                  .from('profiles')
                  .update({ coins: (recipientData.coins || 0) + amount })
                  .eq('id', recipientId);
              }
          }

          setBalance(newSenderBalance);
          toast.success(`Sent ${amount} coins!`);
          return true;
      } catch (error) {
          console.error("Tip failed:", error);
          toast.error("Failed to send tip.");
          return false;
      } finally {
          setIsLoading(false);
      }
  };
  
  // Logic for Buying/Equipping a Frame
  const buyFrame = async (frameId: string, price: number) => {
      if (!session) return false;
      
      // If we had a real backend, we'd check if user owns it. 
      // Here we assume buying = equipping immediately, and price is deducted every switch (harsh!) 
      // OR we just simulate ownership via LocalStorage for prototype.
      
      if (balance < price) {
          toast.error("Insufficient coins");
          return false;
      }
      
      try {
           const newBalance = balance - price;
           const { error } = await supabase
              .from('profiles')
              .update({ coins: newBalance })
              .eq('id', session.user.id);
            
           if (error) throw error;

           // Save frame selection locally (mocking DB column)
           localStorage.setItem(`frame_${session.user.id}`, frameId);
           setActiveFrame(frameId);
           setBalance(newBalance);
           toast.success("Frame Equipped!");
           return true;

      } catch (error) {
          console.error("Frame buy failed", error);
          toast.error("Transaction failed");
          return false;
      }
  };

  const purchasePackage = async (packageId: string) => {
      if (!session) {
          toast.error("Please sign in to purchase coins.");
          return;
      }

      setIsLoading(true);
      try {
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
              body: { 
                  packageId, 
                  returnUrl: window.location.origin 
              }
          });

          if (error) throw error;
          if (data?.url) {
              window.location.href = data.url;
          } else {
              throw new Error("No payment URL returned.");
          }
          
      } catch (error: any) {
          console.error("Purchase failed:", error);
          toast.info("Backend not configured. Simulating purchase...");
          
          setTimeout(async () => {
               let amount = 100;
               if (packageId === 'fan') amount = 550;
               if (packageId === 'collector') amount = 1400;
               if (packageId === 'whale') amount = 4300;

               await addCoins(amount);
               toast.success(`Purchase successful! +${amount} Coins (Simulated)`);
               setIsLoading(false);
          }, 1500);
      }
  };

  const isUnlocked = (mediaId: string) => {
      return unlockedIds.includes(mediaId);
  };

  const checkIfRewardAvailable = () => {
      if (!session) return false;
      const lastClaim = localStorage.getItem(`daily_claim_${session.user.id}`);
      if (!lastClaim) return true;
      
      const today = new Date().toDateString();
      return lastClaim !== today;
  };

  const claimDailyReward = async () => {
      if (!session) return false;
      if (!checkIfRewardAvailable()) return false;

      const success = await addCoins(50);
      if (success) {
          const today = new Date().toDateString();
          localStorage.setItem(`daily_claim_${session.user.id}`, today);
          toast.success("Daily Reward Claimed! +50 Coins");
      }
      return success;
  };

  return (
    <WalletContext.Provider value={{ 
        balance, 
        unlockedIds, 
        activeFrame,
        refreshWallet, 
        unlockContent, 
        purchasePackage, 
        addCoins,
        tipUser,
        buyFrame,
        isUnlocked, 
        isLoading,
        claimDailyReward,
        checkIfRewardAvailable
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
