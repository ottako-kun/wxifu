
export enum MediaType {
  Photo = 'PHOTO',
  Video = 'VIDEO',
  Manga = 'MANGA',
}

export interface MediaItem {
  id: string;
  type: MediaType;
  src: string; // The URL for the image (or video thumbnail)
  videoSrc?: string; // The URL for video playback
  description?: string;
  category?: string;
  tags?: string[];
  user_id?: string; // Links the media to a specific user
  author?: string; // Username of the uploader
  author_avatar?: string; // Avatar URL of the uploader
  is_premium?: boolean; // Is this content locked?
  price?: number; // Cost to unlock (in coins/dollars)
  
  // Manga Specific
  externalId?: string; // MangaDex ID
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface UserProfileData {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    coins?: number;
}

export interface Comment {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at?: string;
}