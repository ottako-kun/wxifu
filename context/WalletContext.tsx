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
  isUnlocked: (mediaId: string) => boolean;
  isLoading: boolean;
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
        // Silent fail for prototype if tables don't exist
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
          await refreshWallet(); // Sync new balance and unlocks
          toast.success("Content unlocked!");
          return true;
      } catch (error: any) {
          toast.error(error.message || "Failed to unlock content.");
          return false;
      } finally {
          setIsLoading(false);
      }
  };

  const purchasePackage = async (packageId: string) => {
      if (!session) {
          toast.error("Please sign in to purchase coins.");
          return;
      }

      setIsLoading(true);
      try {
          // 1. Call Supabase Edge Function to initiate Stripe Checkout
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
              body: { 
                  packageId, 
                  returnUrl: window.location.origin // Where to send user back to
              }
          });

          if (error) {
              console.error("Function error:", error);
              throw new Error("Could not connect to payment server.");
          }

          if (data?.url) {
              // 2. Redirect user to Stripe
              window.location.href = data.url;
          } else {
              throw new Error("No payment URL returned.");
          }
          
      } catch (error: any) {
          console.error("Purchase failed:", error);
          
          // --- DEV MODE FALLBACK --- 
          // If you haven't deployed the function yet, this allows testing the UI.
          // Remove this block in production!
          if (error.message.includes('Function not found') || error.message.includes('Failed to fetch')) {
               console.warn("DEV MODE: Simulating purchase because Edge Function is missing.");
               toast.info("DEV MODE: Simulating purchase...");
               setTimeout(async () => {
                   // Simulate adding 100 coins
                   const newBalance = balance + 100;
                   await supabase.from('profiles').update({ coins: newBalance }).eq('id', session.user.id);
                   await refreshWallet();
                   toast.success("DEV MODE: +100 Coins Added");
                   setIsLoading(false);
               }, 1500);
               return;
          }
          // -------------------------

          toast.error("Payment initialization failed. Please try again.");
          setIsLoading(false);
      }
  };

  const isUnlocked = (mediaId: string) => {
      return unlockedIds.includes(mediaId);
  };

  return (
    <WalletContext.Provider value={{ balance, unlockedIds, refreshWallet, unlockContent, purchasePackage, isUnlocked, isLoading }}>
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