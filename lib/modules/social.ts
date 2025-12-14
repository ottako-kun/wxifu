
import { supabase } from '../client';

// --- LIKES ---
export const getLikeCount = async (mediaId: string) => {
  const { count, error } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('media_id', mediaId);
  return { count: count || 0, error };
};

export const checkUserLiked = async (mediaId: string, userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('media_id', mediaId)
    .eq('user_id', userId)
    .single();
  return { isLiked: !!data, error };
};

export const toggleLike = async (mediaId: string, userId: string) => {
  const { isLiked } = await checkUserLiked(mediaId, userId);

  if (isLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('media_id', mediaId)
      .eq('user_id', userId);
    return { liked: false, error };
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ media_id: mediaId, user_id: userId });
    return { liked: true, error };
  }
};

// --- COMMENTS ---
export const getComments = async (mediaId: string) => {
  return await supabase
    .from('comments')
    .select('*')
    .eq('media_id', mediaId)
    .order('created_at', { ascending: true });
};

export const addComment = async (comment: {
  media_id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_avatar?: string;
}) => {
  return await supabase.from('comments').insert([comment]).select().single();
};

export const deleteComment = async (commentId: string) => {
  return await supabase.from('comments').delete().eq('id', commentId);
};

export const updateComment = async (commentId: string, content: string) => {
  return await supabase.from('comments').update({ content, updated_at: new Date().toISOString() }).eq('id', commentId);
};

// --- FOLLOWS & STATS ---
export const getProfileStats = async (userId: string) => {
    const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

    const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

    return {
        followers: followersCount || 0,
        following: followingCount || 0
    };
};

export const getFollowStatus = async (currentUserId: string, targetUserId: string) => {
    const { data: iFollow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();
    
    const { data: theyFollow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', targetUserId)
        .eq('following_id', currentUserId)
        .single();

    return {
        isFollowing: !!iFollow,
        isFollowedBy: !!theyFollow,
        isMutual: !!iFollow && !!theyFollow
    };
};

export const followUser = async (currentUserId: string, targetUserId: string) => {
    return await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: targetUserId
    });
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    return await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
};

// --- MESSAGING ---
export const getMessages = async (user1: string, user2: string) => {
    return await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
        .order('created_at', { ascending: true });
};

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
    return await supabase.from('messages').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content
    });
};

export const deleteMessage = async (msgId: string) => {
  return await supabase.from('messages').delete().eq('id', msgId);
};

export const updateMessage = async (msgId: string, content: string) => {
  return await supabase.from('messages').update({ content }).eq('id', msgId);
};

export const getInboxUsers = async (currentUserId: string) => {
    const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, created_at, content, is_read')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

    if (error || !messages) return [];

    const userMap = new Map();
    messages.forEach(msg => {
        const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        if (!userMap.has(otherId)) {
            userMap.set(otherId, {
                userId: otherId,
                lastMessage: msg.content,
                timestamp: msg.created_at,
                isRead: msg.is_read || (msg.sender_id === currentUserId)
            });
        }
    });

    const uniqueUserIds = Array.from(userMap.keys());
    if (uniqueUserIds.length === 0) return [];

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .in('id', uniqueUserIds);

    return Array.from(userMap.values()).map(convo => {
        const profile = profiles?.find((p: any) => p.id === convo.userId);
        return {
            ...convo,
            name: profile?.name || 'Unknown User',
            avatar: profile?.avatar || null
        };
    });
};

// --- REPORTING ---
export const reportMediaItem = async (reportData: {
  media_id: string;
  reporter_id: string;
  reason: string;
  details?: string;
}) => {
  return await supabase.from('reports').insert([reportData]);
};
