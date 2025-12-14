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
}