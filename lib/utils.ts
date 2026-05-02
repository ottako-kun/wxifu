import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MediaItem, MediaType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { getDriveId, getGoogleDriveImageUrl, getGoogleDriveVideoPreviewUrl, isGoogleDriveLink } from './googleDrive';

// Default thumbnail for videos if none is provided
export const DEFAULT_THUMB_URL = 'https://lh3.googleusercontent.com/d/1Qcdu24M-ArsEeqTTLqSY1OzDx8NM14gM';

// Simple string hash for stable IDs
export const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

export const processMediaItem = (item: any, index: number): MediaItem => {
  // Case insensitive check for video type
  const rawType = item.type ? String(item.type).toUpperCase() : '';
  const isVideo = rawType === 'VIDEO' || rawType === MediaType.Video;
  
  const type = isVideo ? MediaType.Video : MediaType.Photo;
  
  // Input Source Handling
  const sourceString = item.link || item.src || item.url || '';
  
  // Generate stable ID based on content source rather than index
  const contentHash = generateHash(sourceString + (item.description || ''));
  const id = item.id || (isVideo ? `static-vid-${contentHash}` : `static-photo-${contentHash}`);
  
  const driveId = getDriveId(sourceString);
  
  let finalSrc = sourceString;
  let finalVideoSrc = item.videoSrc;

  if (type === MediaType.Photo) {
     // Auto-convert Drive Links to High-Res Image Proxy
     if (driveId) {
        finalSrc = getGoogleDriveImageUrl(driveId);
     }
  } else {
     // Video Handling
     // Check if thumbnail is also a Drive link
     const thumbDriveId = getDriveId(item.thumbnail);
     if (thumbDriveId) {
         finalSrc = getGoogleDriveImageUrl(thumbDriveId);
     } else {
         finalSrc = item.thumbnail || DEFAULT_THUMB_URL;
     }
     
     if (driveId) {
        // Handle Google Drive
        finalVideoSrc = getGoogleDriveVideoPreviewUrl(driveId);
     } else {
        // Use the direct link or existing videoSrc for non-Drive links
        finalVideoSrc = item.videoSrc || sourceString;
     }
  }

  // Author Logic
  const profileName = item.profiles?.name;
  const profileAvatar = item.profiles?.avatar;
  const authorName = profileName || item.author || (item.user_id ? 'Unknown' : 'Ottaku Admin');

  // Pseudo User ID for static items to allow clicking profile
  let userId = item.user_id;
  if (!userId) {
      userId = `static-user-${authorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  return {
    id: id.toString(),
    type,
    src: finalSrc || DEFAULT_THUMB_URL,
    videoSrc: finalVideoSrc,
    description: item.description,
    category: item.category || (type === MediaType.Photo ? 'Illustration' : 'Clip'),
    tags: item.tags || [],
    user_id: userId, 
    author: authorName,
    author_avatar: profileAvatar || item.author_avatar
  };
};