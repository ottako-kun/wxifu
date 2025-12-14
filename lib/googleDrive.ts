
/**
 * Utility functions for handling Google Drive links.
 * Automatically converts "Share" links into direct viewable content.
 */

// Helper to extract Google Drive ID from various URL formats
export const getDriveId = (input: string): string | null => {
  if (!input) return null;
  
  // Pattern 1: /d/ID (Standard view links)
  const matchSlash = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSlash && matchSlash[1]) return matchSlash[1];

  // Pattern 2: id=ID (Export links, open?id=)
  const matchId = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  // Pattern 3: Raw ID (If user pastes just the ID)
  // Drive IDs are usually 33 chars or 19 chars (folders), alphanumeric + symbols
  if (/^[a-zA-Z0-9_-]{15,}$/.test(input) && !input.includes('/')) {
      return input;
  }

  return null;
};

// Convert ID to a high-performance image delivery URL (lh3.googleusercontent.com)
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
