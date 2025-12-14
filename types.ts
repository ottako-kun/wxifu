export enum MediaType {
  Photo = 'PHOTO',
  Video = 'VIDEO',
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
}