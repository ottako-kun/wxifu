
import { gasRequest } from '../client';

export const insertMediaItem = async (item: any) => {
  const result = await gasRequest('INSERT_MEDIA', item);
  return { data: result.data, error: result.error ? { message: result.error } : null };
};

export const deleteMediaItem = async (id: string) => {
  const result = await gasRequest('DELETE_MEDIA', { id });
  return { error: result.error ? { message: result.error } : null };
};

export const updateMediaItem = async (id: string, updates: any) => {
  const result = await gasRequest('UPDATE_MEDIA', { id, updates });
  return { error: result.error ? { message: result.error } : null };
};

export const getFollowedMedia = async (userId: string) => {
    // 1. Get follows
    const fRes = await gasRequest('GET_FOLLOWS');
    const followingIds = fRes.data
        ? fRes.data.filter((f: any) => f.follower_id === userId).map((f: any) => f.following_id)
        : [];
    
    if (followingIds.length === 0) return { data: [], error: null };

    // 2. Get media for those IDs
    const mRes = await gasRequest('GET_MEDIA');
    const pRes = await gasRequest('GET_PROFILES');
    const profilesMap = new Map(pRes.data?.map((p: any) => [p.id, p]) || []);

    const media = mRes.data
        ? mRes.data
            .filter((m: any) => followingIds.includes(m.user_id))
            .map((m: any) => ({ ...m, profiles: profilesMap.get(m.user_id) }))
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [];

    return { data: media, error: mRes.error ? { message: mRes.error } : null };
};
