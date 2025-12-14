
/**
 * Utility functions for handling Google Drive links.
 * Automatically converts "Share" links into direct viewable content.
 */

// Helper to extract Google Drive ID from various URL formats
export const getDriveId = (input: string): string | null => {
  if (!input) return null;
  
  // Pattern 1: /d/ID (Standard sharing/view links)
  // Example: https://drive.google.com/file/d/1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ/view
  const matchSlash = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSlash && matchSlash[1]) return matchSlash[1];

  // Pattern 2: id=ID (Export links, open?id=)
  // Example: https://drive.google.com/open?id=1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ
  const matchIdParam = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 3: Raw ID detection
  // Drive IDs are usually long strings (25+ chars) of alphanumeric + symbols
  // We check if the input *is* just the ID itself, not a URL
  if (/^[a-zA-Z0-9_-]{25,}$/.test(input) && !input.includes('/') && !input.includes('.')) {
      return input;
  }

  return null;
};

// Convert ID to a high-performance image delivery URL (lh3.googleusercontent.com)
// This endpoint is generally faster and avoids some CORS issues compared to drive.google.com/uc
export const getGoogleDriveImageUrl = (id: string): string => {
    return `https://lh3.googleusercontent.com/d/${id}`;
};

// Convert ID to a video preview stream
export const getGoogleDriveVideoPreviewUrl = (id: string): string => {
    return `https://drive.google.com/file/d/${id}/preview`;
};

export const isGoogleDriveLink = (url: string): boolean => {
    return url.includes('drive.google.com') || url.includes('googleusercontent.com');
};
