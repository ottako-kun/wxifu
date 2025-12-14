import { MediaItem, MediaType } from './types';

// --- CONFIGURATION: PASTE YOUR LINKS HERE ---

// 1. Add your Google Drive links here.
// 2. Ensure the file on Google Drive is set to "Anyone with the link" -> "Viewer".
// 3. For Videos, it's best to use a thumbnail image if possible, but the code will try to handle it.

const CUSTOM_MEDIA_COLLECTION = [
  // --- PHOTOS ---
  {
    type: 'PHOTO',
    link: 'https://drive.google.com/file/d/1VcZ2HwtbfXJddnszt9PoguYiRTNoZL0a/view?usp=sharing',
    description: 'Neon City Night',
    category: 'Illustration',
    tags: ['Cyberpunk', 'Neon']
  },
  {
    type: 'PHOTO',
    link: 'https://drive.google.com/file/d/1VZcVYIZ0kdY722MshqvKOoDMAR62qkP5/view?usp=sharing',
    description: 'Summer Breeze',
    category: 'Cosplay',
    tags: ['Beach', 'Summer']
  },
  {
    type: 'PHOTO',
    link: 'https://drive.google.com/file/d/1GKdEr3pj5LxaNVUSMzo4o9tHCLSRfoEh/view?usp=sharing',
    description: 'Forest Spirit',
    category: 'Sketch',
    tags: ['Fantasy', 'Nature']
  },
  {
    type: 'PHOTO',
    link: 'https://drive.google.com/file/d/1BlKaIHxsJ9ypmfuIeQq_PM5jpX6rGAYG/view?usp=sharing',
    description: 'School Days',
    category: 'Render',
    tags: ['Uniform', 'Slice of Life']
  },
  
  // --- VIDEOS ---
  {
    type: 'VIDEO',
    link: 'https://drive.google.com/file/d/194iRont8lJn2s7uwb-aC74mb0OZm8l9d/view?usp=drive_link',
    description: 'Animated Preview',
    category: 'Clip',
    tags: ['Demo', 'Animation']
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
