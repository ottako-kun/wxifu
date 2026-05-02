
export enum MediaType {
  Photo = 'PHOTO',
  Video = 'VIDEO',
}

export type DensityType = 'compact' | 'standard' | 'large';

// Added Session interface to resolve import errors
export interface Session {
  user: {
    id: string;
    email?: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
      bio?: string;
      [key: string]: any;
    };
  };
  access_token?: string;
  refresh_token?: string;
}

export enum SortOption {
    Trending = 'trending',
    Week = 'top-week',
    Month = 'top-month',
    Views = 'most-viewed',
    Latest = 'latest'
}

export type ExploreTab = 'GIFs' | 'Images' | 'Videos' | 'Creators' | 'Niches';

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
  views?: number;
  likes?: number;
  created_at?: string;
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
    is_verified?: boolean; // TikTok-style verification badge
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
