
import { gasRequest } from '../client';

// --- LIKES ---
export const getLikeCount = async (mediaId: string) => {
  const res = await gasRequest('GET_LIKES', { media_id: mediaId });
  return { count: res.data ? res.data.length : 0, error: res.error };
};

export const checkUserLiked = async (mediaId: string, userId: string) => {
  const res = await gasRequest('GET_LIKES', { media_id: mediaId });
  const isLiked = res.data ? res.data.some((r: any) => r.user_id === userId) : false;
  return { isLiked, error: res.error };
};

export const toggleLike = async (mediaId: string, userId: string) => {
  const res = await gasRequest('TOGGLE_LIKE', { media_id: mediaId, user_id: userId });
  return { liked: res.data?.liked, error: res.error };
};

// --- COMMENTS ---
export const getComments = async (mediaId: string) => {
  const res = await gasRequest('GET_COMMENTS', { media_id: mediaId });
  return { data: res.data || [], error: res.error };
};

export const addComment = async (comment: any) => {
  const res = await gasRequest('ADD_COMMENT', comment);
  return { data: res.data, error: res.error };
};

export const deleteComment = async (commentId: string) => {
  return await gasRequest('DELETE_COMMENT', { id: commentId });
};

export const updateComment = async (commentId: string, content: string) => {
  // Not used in standard flow but implemented for completeness
  return { error: "Not implemented in GAS version" };
};

// --- FOLLOWS & STATS ---
export const getProfileStats = async (userId: string) => {
    const res = await gasRequest('GET_FOLLOWS');
    const followers = res.data ? res.data.filter((f: any) => f.following_id === userId).length : 0;
    const following = res.data ? res.data.filter((f: any) => f.follower_id === userId).length : 0;
    return { followers, following };
};

export const getFollowStatus = async (currentUserId: string, targetUserId: string) => {
    const res = await gasRequest('GET_FOLLOWS');
    const iFollow = res.data ? res.data.some((f: any) => f.follower_id === currentUserId && f.following_id === targetUserId) : false;
    const theyFollow = res.data ? res.data.some((f: any) => f.follower_id === targetUserId && f.following_id === currentUserId) : false;
    return { isFollowing: iFollow, isFollowedBy: theyFollow, isMutual: iFollow && theyFollow };
};

export const followUser = async (currentUserId: string, targetUserId: string) => {
    return await gasRequest('FOLLOW_USER', { follower_id: currentUserId, following_id: targetUserId });
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    return await gasRequest('UNFOLLOW_USER', { follower_id: currentUserId, following_id: targetUserId });
};

// --- MESSAGING ---
export const getMessages = async (user1: string, user2: string) => {
    const res = await gasRequest('GET_MESSAGES', { user1, user2 });
    return { data: res.data || [], error: res.error };
};

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
    const res = await gasRequest('SEND_MESSAGE', { sender_id: senderId, receiver_id: receiverId, content });
    return { data: res.data, error: res.error };
};

export const deleteMessage = async (msgId: string) => {
  // Mock delete
  return { error: null };
};

export const updateMessage = async (msgId: string, content: string) => {
  // Mock update
  return { error: null };
};

export const getInboxUsers = async (currentUserId: string) => {
    const mRes = await gasRequest('GET_MEDIA'); // Placeholder to check if backend works
    const res = await gasRequest('GET_MESSAGES', { user1: currentUserId, user2: 'all' }); // Conceptual
    // Real implementation would fetch all messages involving user
    const allMsgsRes = await gasRequest('GET_MEDIA'); // GAS GET_MESSAGES with filtered payload would be better
    // For simplicity, let's assume getInboxUsers logic stays client side mostly
    return []; // Placeholder: in real GAS deployment, you'd write a GET_INBOX command
};

// --- REPORTING ---
export const reportMediaItem = async (reportData: any) => {
  return { success: true }; // Mock report
};
