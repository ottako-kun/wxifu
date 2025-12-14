import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getUserBalance, getUnlockedMedia, unlockMedia } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useToast } from './ToastContext';

interface WalletContextType {
  balance: number;
  unlockedIds: string[];
  refreshWallet: () => Promise<void>;
  unlockContent: (mediaId: string, price: number, authorId?: string) => Promise<boolean>;
  addCoins: (amount: number) => Promise<boolean>;
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

  const addCoins = async (amount: number) => {
      if (!session) return false;
      try {
          // This is a simulated top-up. 
          // In production, this would be handled by a Supabase Edge Function triggered by a Stripe Webhook.
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

  const isUnlocked = (mediaId: string) => {
      return unlockedIds.includes(mediaId);
  };

  return (
    <WalletContext.Provider value={{ balance, unlockedIds, refreshWallet, unlockContent, addCoins, isUnlocked, isLoading }}>
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