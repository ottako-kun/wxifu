/**
 * Utility functions for handling Google Drive links.
 * Automatically converts "Share" links into direct viewable content.
 */

// Helper to extract Google Drive ID from various URL formats
export const getDriveId = (input: string): string | null => {
  if (!input) return null;
  
  // Pattern 1: /d/ID (Standard sharing/view links)
  const matchSlash = input.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
  if (matchSlash && matchSlash[1]) return matchSlash[1];

  // Pattern 2: id=ID (Export links, open?id=, uc?id=)
  const matchIdParam = input.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pattern 3: Raw ID detection
  if (/^[a-zA-Z0-9_-]{25,}$/.test(input) && !input.includes('/') && !input.includes('.')) {
      return input;
  }

  return null;
};

export const getGoogleDriveImageUrl = (id: string): string => {
    return `https://lh3.googleusercontent.com/d/${id}`;
};

// IMPORTANT: This creates an EMBEDDABLE player link. 
// It cannot be used in <video src="...">, only in <iframe src="...">
export const getGoogleDriveVideoPreviewUrl = (id: string): string => {
    return `https://drive.google.com/file/d/${id}/preview`;
};

export const isGoogleDriveLink = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('drive.google.com') || url.includes('googleusercontent.com') || url.includes('docs.google.com');
};
