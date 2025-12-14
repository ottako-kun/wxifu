
import { supabase } from '../client';

export const getUserBalance = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();
    return { coins: data?.coins ?? 100, error };
};

export const getUnlockedMedia = async (userId: string) => {
    const { data, error } = await supabase
        .from('unlocked_media')
        .select('media_id')
        .eq('user_id', userId);
        
    return { unlockedIds: data?.map((r: any) => r.media_id) || [], error };
};

export const unlockMedia = async (userId: string, mediaId: string, price: number, authorId?: string) => {
    const { data: userProfile, error: balanceError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();
        
    if (balanceError) throw new Error("Failed to fetch balance");
    const currentCoins = userProfile?.coins ?? 100;

    if (currentCoins < price) {
        throw new Error("Insufficient coins");
    }

    const { error: deductError } = await supabase
        .from('profiles')
        .update({ coins: currentCoins - price })
        .eq('id', userId);

    if (deductError) throw new Error("Transaction failed");

    if (authorId && authorId !== userId) {
        const { data: authorProfile } = await supabase
            .from('profiles')
            .select('coins')
            .eq('id', authorId)
            .single();
            
        if (authorProfile) {
            await supabase.from('profiles').update({ coins: (authorProfile.coins || 0) + price }).eq('id', authorId);
        }
    }

    const { error: unlockError } = await supabase
        .from('unlocked_media')
        .insert({ user_id: userId, media_id: mediaId });
        
    if (unlockError) {
        console.error("Unlock record failed after payment:", unlockError);
        throw new Error("Failed to unlock content");
    }

    return { success: true, newBalance: currentCoins - price };
};
