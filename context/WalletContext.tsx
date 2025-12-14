import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserBalance, getUnlockedMedia, unlockMedia } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useToast } from './ToastContext';

interface WalletContextType {
  balance: number;
  unlockedIds: string[];
  refreshWallet: () => Promise<void>;
  unlockContent: (mediaId: string, price: number, authorId?: string) => Promise<boolean>;
  purchasePackage: (packageId: string) => Promise<void>;
  addCoins: (amount: number) => Promise<boolean>; // Exposed for rewards
  isUnlocked: (mediaId: string) => boolean;
  isLoading: boolean;
  claimDailyReward: () => Promise<boolean>; // New method
  checkIfRewardAvailable: () => boolean; // New method
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
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
        return;
    }

    try {
        const { coins } = await getUserBalance(session.user.id);
        const { unlockedIds } = await getUnlockedMedia(session.user.id);
        setBalance(coins);
        setUnlockedIds(unlockedIds);
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

  // Helper to add coins directly (for rewards, ads, or manual topups)
  const addCoins = async (amount: number) => {
      if (!session) return false;
      try {
          // Note: In production, do this via RPC to avoid race conditions. 
          // For prototype, we update the profile directly.
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

  const purchasePackage = async (packageId: string) => {
      if (!session) {
          toast.error("Please sign in to purchase coins.");
          return;
      }

      setIsLoading(true);
      try {
          // Try to call the Stripe function
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
          
          // --- FALLBACK FOR PROTOTYPE WITHOUT BACKEND ---
          // Since user explicitly said "I will configure stripe later", 
          // we treat this error as a signal to use "Simulated Payment"
          toast.info("Backend not configured. Simulating purchase...");
          
          setTimeout(async () => {
               // Map package ID to coins (rough estimate based on Shop Modal)
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

  // --- DAILY REWARD LOGIC ---
  
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

      const success = await addCoins(50); // Daily reward amount
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
        refreshWallet, 
        unlockContent, 
        purchasePackage, 
        addCoins,
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