import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MediaItem, MediaType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { getDriveId, getGoogleDriveImageUrl, getGoogleDriveVideoPreviewUrl, isGoogleDriveLink } from './googleDrive';

// Default thumbnail for videos if none is provided
export const DEFAULT_THUMB_URL = 'https://drive.google.com/file/d/12nzE1g4dwx6ltHIbK2rWtC4V58vYDlsP';
export const HYPNOTUBE_DEFAULT_THUMB = 'https://drive.google.com/file/d/12nzE1g4dwx6ltHIbK2rWtC4V58vYDlsP';

export function isHypnotubeUrl(url?: string): boolean {
  if (!url) return false;
  return /hypnotube\.com\/(video|embed)\//i.test(url);
}

export function getHypnotubeEmbedUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('/embed/')) {
    return url;
  }
  const match = url.match(/\/video\/([a-zA-Z0-9_-]+)(?:\.html|\/)?/i);
  if (match) {
    const slug = match[1];
    const idMatch = slug.match(/-(\d+)$/);
    if (idMatch) {
      return `https://hypnotube.com/embed/${idMatch[1]}`;
    }
    if (/^\d+$/.test(slug)) {
      return `https://hypnotube.com/embed/${slug}`;
    }
  }
  return url;
}

export function isRedgifsUrl(url?: string): boolean {
  if (!url) return false;
  return /redgifs\.com/i.test(url);
}

export function isDirectVideoUrl(url?: string): boolean {
  if (!url) return false;
  if (isGoogleDriveLink(url)) return false;
  if (isHypnotubeUrl(url)) return false;
  if (/\.(mp4|webm|ogg|mov)/i.test(url)) return true;
  return false;
}

export function getRedgifsId(url?: string): string | null {
  if (!url) return null;
  
  let target = url;
  // If it's an iframe embed code, extract the src attribute
  if (url.includes('<iframe')) {
    const srcMatch = url.match(/src=['"]([^'"]+)['"]/i);
    if (srcMatch) {
      target = srcMatch[1];
    }
  }
  
  // Extract ID from watch, iframe, or detail links
  const idMatch = target.match(/redgifs\.com\/(?:ifr|watch|detail)\/([a-zA-Z0-9_-]+)/i);
  if (idMatch) {
    return idMatch[1];
  }
  
  // Try matching filename for thumbs/media links
  const mediaMatch = target.match(/([a-zA-Z0-9_-]+)-(?:large|poster|small|mobile)\.(?:jpg|png|webp|mp4|gif)/i);
  if (mediaMatch) {
    return mediaMatch[1];
  }
  
  // Simple match for path segments if it contains redgifs.com
  if (target.includes('redgifs.com')) {
    const segments = target.split('/');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment) {
      const cleanSegment = lastSegment.split('?')[0].split('#')[0];
      if (/^[a-zA-Z0-9_-]+$/.test(cleanSegment)) {
        return cleanSegment;
      }
    }
  }

  return null;
}

export function getRedgifsEmbedUrl(url?: string): string {
  if (!url) return '';
  const id = getRedgifsId(url);
  if (id) {
    return `https://www.redgifs.com/ifr/${id}`;
  }
  return url;
}

export function getRedgifsThumbnailUrl(url?: string): string {
  if (!url) return '';
  const id = getRedgifsId(url);
  if (id) {
    return `https://thumbs2.redgifs.com/${id}-large.jpg`;
  }
  return DEFAULT_THUMB_URL;
}

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
  // Input Source Handling
  const sourceString = item.link || item.src || item.url || '';
  const hasHypnotube = isHypnotubeUrl(sourceString);
  const hasRedgifs = isRedgifsUrl(sourceString);
  const isDirectVid = isDirectVideoUrl(sourceString);

  // Case insensitive check for video type
  const rawType = item.type ? String(item.type).toUpperCase() : '';
  const isVideo = rawType === 'VIDEO' || rawType === MediaType.Video || hasHypnotube || hasRedgifs || isDirectVid;
  
  const type = isVideo ? MediaType.Video : MediaType.Photo;
  
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
          finalSrc = item.thumbnail || (hasHypnotube ? HYPNOTUBE_DEFAULT_THUMB : (hasRedgifs ? getRedgifsThumbnailUrl(sourceString) : DEFAULT_THUMB_URL));
      }
      
      if (driveId) {
         // Handle Google Drive
         finalVideoSrc = getGoogleDriveVideoPreviewUrl(driveId);
      } else if (hasHypnotube) {
         // Handle HypnoTube
         finalVideoSrc = getHypnotubeEmbedUrl(sourceString);
      } else if (hasRedgifs) {
         // Handle RedGIFs
         finalVideoSrc = getRedgifsEmbedUrl(sourceString);
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