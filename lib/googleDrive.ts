
/**
 * Utility functions for handling Google Drive links.
 * This allows users to paste standard "Share" links and have them convert
 * to direct displayable images or video streams automatically.
 */

// Helper to extract Google Drive ID from various URL formats
export const getDriveId = (input: string): string | null => {
  if (!input) return null;
  
  // Match /d/ID pattern (standard drive links)
  const matchSlash = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSlash && matchSlash[1]) return matchSlash[1];

  // Match id=ID pattern (some export links)
  const matchId = input.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  // If the input string looks like a raw ID (alphanumeric, decently long), return it
  if (/^[a-zA-Z0-9_-]{20,}$/.test(input)) {
      return input;
  }

  return null;
};

export const getGoogleDriveImageUrl = (id: string): string => {
    return `https://lh3.googleusercontent.com/d/${id}`;
};

export const getGoogleDriveVideoPreviewUrl = (id: string): string => {
    return `https://drive.google.com/file/d/${id}/preview`;
};

export const isGoogleDriveLink = (url: string): boolean => {
    return url.includes('drive.google.com') || url.includes('googleusercontent.com');
};
