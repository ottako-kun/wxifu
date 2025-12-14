import { MediaItem, MediaType } from './types';

// --- CONFIGURATION: PASTE YOUR LINKS HERE ---

// 1. Add your Google Drive links here.
// 2. Ensure the file on Google Drive is set to "Anyone with the link" -> "Viewer".
// 3. For Videos, it's best to use a thumbnail image if possible, but the code will try to handle it.

const CUSTOM_MEDIA_COLLECTION = [
  // --- PHOTOS & ANIMATED GIFS ---
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/LpdlqTkgO2Lwwixwv7/giphy.gif',
    description: 'Neo Tokyo Rain',
    category: 'Scenery',
    tags: ['Cyberpunk', 'City', 'Gif', 'Neon']
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/h4fzD3yY2qGbe/giphy.gif',
    description: 'Midnight Drive',
    category: 'Vibe',
    tags: ['Retro', 'Outrun', 'Gif', 'Driving']
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    description: 'Shinjuku Nights',
    category: 'Photography',
    tags: ['Tokyo', 'Street', 'Realism']
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/j2pWZpr5RlpwpGVtG1/giphy.gif',
    description: 'Pixel Cityscape',
    category: 'Animation',
    tags: ['Pixel Art', 'City', 'Gif', 'Night']
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/i2tLw5ZyizMNy/giphy.gif',
    description: 'Cherry Blossom Fall',
    category: 'Scenery',
    tags: ['Anime', 'Sakura', 'Emotional', 'Gif']
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?q=80&w=1200&auto=format&fit=crop',
    description: 'Cyber Geisha',
    category: 'Cosplay',
    tags: ['Cyberpunk', 'Portrait', 'Neon']
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    description: 'Lofi Study Session',
    category: 'Vibe',
    tags: ['Lofi', 'Chill', 'Gif', 'Study']
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.gif',
    description: 'Space Cowboy',
    category: 'Classic',
    tags: ['Retro', 'Anime', '90s', 'Gif']
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=1200&auto=format&fit=crop',
    description: 'Urban Ninja',
    category: 'Cosplay',
    tags: ['Streetwear', 'Mask', 'Dark']
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/fCda953g1W6fC/giphy.gif',
    description: 'System Glitch',
    category: 'Aesthetic',
    tags: ['Glitch', 'Retro', 'Tech', 'Gif']
  },
  
  // --- VIDEOS ---
  {
    type: 'VIDEO',
    link: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
    description: 'Featured Animation',
    category: 'Clip',
    tags: ['Demo', '3D', 'Animation']
  }
];

// --- HELPERS ---

// Helper to extract Google Drive ID from various URL formats
export const getDriveId = (input: string): string => {
  if (!input) return '';
  // Match /d/ID pattern (standard drive links)
  const matchSlash = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSlash && matchSlash[1]) return matchSlash[1];

  // Match id=ID pattern (some export links)
  const matchId = input.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  // If no pattern matches, assume it's already the ID
  return input;
};

// Default Thumbnail ID (Used if no thumbnail is provided for videos)
export const DEFAULT_VIDEO_THUMBNAIL_ID = '1GNRxrGz1BgE6Ra1OqKfaKiHSj-JmDqDx';
export const DEFAULT_THUMB_URL = `https://lh3.googleusercontent.com/d/${DEFAULT_VIDEO_THUMBNAIL_ID}`;

/**
 * Helper to process a raw DB item or static item into a MediaItem
 * This handles the Google Drive link conversion logic centrally.
 */
export const processMediaItem = (item: any, index: number): MediaItem => {
  const isVideo = item.type === MediaType.Video || item.type === 'VIDEO';
  const type = isVideo ? MediaType.Video : MediaType.Photo;
  
  // Use existing ID or generate one
  const id = item.id || (isVideo ? `vid-${index}` : `photo-${index}`);
  
  // Detect if the input is a full link or just an ID
  const sourceString = item.link || item.src || item.url || '';
  const driveId = getDriveId(sourceString);
  
  let finalSrc = sourceString;
  let finalVideoSrc = item.videoSrc;

  if (type === MediaType.Photo) {
     // If it looks like a Drive ID, construct the proxy URL for faster loading
     // We check if it contains drive.google.com OR if it was just an ID string (length check is a rough heuristic)
     if (driveId && (sourceString.includes('drive.google.com') || sourceString.length < 50)) {
        finalSrc = `https://lh3.googleusercontent.com/d/${driveId}`;
     }
  } else {
     // Video Logic
     // Thumbnail: Use provided, or default
     finalSrc = item.thumbnail || DEFAULT_THUMB_URL;
     
     // Video Source: If Drive link, convert to preview, else use direct
     if (sourceString && sourceString.includes('drive.google.com')) {
        const vidDriveId = getDriveId(sourceString);
        finalVideoSrc = `https://drive.google.com/file/d/${vidDriveId}/preview`;
     } else {
        finalVideoSrc = item.videoSrc || sourceString;
     }
  }

  return {
    id: id.toString(),
    type,
    src: finalSrc,
    videoSrc: finalVideoSrc,
    description: item.description,
    category: item.category || (type === MediaType.Photo ? 'Illustration' : 'Clip'),
    tags: item.tags || [],
    user_id: item.user_id, // Safely pass user_id through
  };
};

// --- DATA PROCESSING ---

// Generate the fallback data from the configuration array above
const processedCustomItems = CUSTOM_MEDIA_COLLECTION.map((item, index) => 
  processMediaItem(item, index)
);

export const fallbackPhotoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Photo
);

export const fallbackVideoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Video
);