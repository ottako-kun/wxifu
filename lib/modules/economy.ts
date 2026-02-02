
import { gasRequest } from '../client';

export const getUserBalance = async (userId: string) => {
    const res = await gasRequest('GET_PROFILES');
    const profile = res.data ? res.data.find((p: any) => p.id === userId) : null;
    return { coins: profile?.coins ?? 100, error: res.error };
};

export const getUnlockedMedia = async (userId: string) => {
    const res = await gasRequest('GET_UNLOCKED', { user_id: userId });
    return { unlockedIds: res.data ? res.data.map((r: any) => r.media_id) : [], error: res.error };
};

export const unlockMedia = async (userId: string, mediaId: string, price: number, authorId?: string) => {
    // 1. Check Balance
    const { coins } = await getUserBalance(userId);
    if (coins < price) throw new Error("Insufficient coins");

    // 2. Deduct Balance
    await gasRequest('UPSERT_PROFILE', { id: userId, coins: coins - price });

    // 3. Record Unlock
    await gasRequest('UNLOCK_MEDIA', { user_id: userId, media_id: mediaId });

    // 4. Pay Author (If applicable)
    if (authorId && !authorId.startsWith('static')) {
        const aBal = await getUserBalance(authorId);
        await gasRequest('UPSERT_PROFILE', { id: authorId, coins: (aBal.coins || 0) + price });
    }

    return { success: true, newBalance: coins - price };
};
