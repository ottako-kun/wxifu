import { MediaItem, MediaType } from './types';

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

// Default Thumbnail ID
export const DEFAULT_VIDEO_THUMBNAIL_ID = '1GNRxrGz1BgE6Ra1OqKfaKiHSj-JmDqDx';
export const DEFAULT_THUMB_URL = `https://lh3.googleusercontent.com/d/${DEFAULT_VIDEO_THUMBNAIL_ID}`;

// Helper to process a raw DB item or static item into a MediaItem
// This handles the Google Drive link conversion logic centrally
export const processMediaItem = (item: any, index: number): MediaItem => {
  const isVideo = item.type === MediaType.Video || item.type === 'VIDEO';
  const type = isVideo ? MediaType.Video : MediaType.Photo;
  
  // Use existing ID or generate one
  const id = item.id || (isVideo ? `vid-${index}` : `photo-${index}`);
  
  const driveId = getDriveId(item.src || item.url || '');
  
  let finalSrc = item.src;
  let finalVideoSrc = item.videoSrc;

  if (type === MediaType.Photo) {
     // If it looks like a Drive ID, construct the proxy URL
     // If it's a full URL that isn't drive, leave it (future proofing)
     if (driveId && driveId === item.src) {
        finalSrc = `https://lh3.googleusercontent.com/d/${driveId}`;
     } else if (driveId && item.src.includes('drive.google.com')) {
        finalSrc = `https://lh3.googleusercontent.com/d/${driveId}`;
     }
  } else {
     // Video Logic
     // Thumbnail: Use provided, or default
     finalSrc = item.thumbnail || DEFAULT_THUMB_URL;
     
     // Video Source: If Drive link, convert to preview, else use direct
     if (item.url && item.url.includes('drive.google.com')) {
        const vidDriveId = getDriveId(item.url);
        finalVideoSrc = `https://drive.google.com/file/d/${vidDriveId}/preview`;
     } else {
        finalVideoSrc = item.videoSrc || item.url;
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


// --- FALLBACK STATIC DATA ---
const PHOTO_CATEGORIES = ['Illustration', 'Cosplay', 'Render', 'Sketch'];
const COMMON_TAGS = ['Waifu', 'High Res', 'SFW', 'NSFW', 'Fantasy', 'Cyberpunk', 'Beach', 'Uniform'];

const GOOGLE_DRIVE_PHOTOS = [
  { 
    id: '1VcZ2HwtbfXJddnszt9PoguYiRTNoZL0a', 
    description: '1 - Neon City Night', 
    category: 'Illustration', 
    tags: ['Cyberpunk', 'Neon', 'City'] 
  },
  { 
    id: '1VZcVYIZ0kdY722MshqvKOoDMAR62qkP5', 
    description: '2 - Summer Breeze', 
    category: 'Cosplay', 
    tags: ['Beach', 'Swimsuit', 'Summer'] 
  },
  { 
    id: '1GKdEr3pj5LxaNVUSMzo4o9tHCLSRfoEh', 
    description: '3 - Forest Spirit', 
    category: 'Sketch', 
    tags: ['Fantasy', 'Nature', 'Elf'] 
  },
  { 
    id: '1BlKaIHxsJ9ypmfuIeQq_PM5jpX6rGAYG', 
    description: '4 - School Days', 
    category: 'Render', 
    tags: ['Uniform', 'Slice of Life', 'School'] 
  },
  { 
    id: '1Csc0lB7GP_l0rC2jwz39jh8gsoiW12fc', 
    description: '5 - Moonlight Assassin', 
    category: 'Illustration', 
    tags: ['Dark', 'Action', 'Weapon'] 
  },
  { 
    id: '1usvczHCsfT91WMMngvp24BB-w6U6KYsE', 
    description: '6 - Cafe Date', 
    category: 'Cosplay', 
    tags: ['Casual', 'Date', 'Food'] 
  },
  { 
    id: '168F8qwSuAhqFY_d1nrAVbBReqhX03WGq', 
    description: '7 - Mecha Pilot', 
    category: 'Render', 
    tags: ['Sci-Fi', 'Suit', 'Mecha'] 
  },
  { 
    id: '1qlg40kPJ11z4PVsx_ojwGSO5XWCcdJlH', 
    description: '8 - Shrine Maiden', 
    category: 'Illustration', 
    tags: ['Traditional', 'Kimono', 'Japan'] 
  },
  { 
    id: '1YaAMkRbe2xX8yvJBth1KWyTdTMq-Co8Q', 
    description: '9 - Urban Streetwear', 
    category: 'Cosplay', 
    tags: ['Fashion', 'Street', 'Modern'] 
  },
  { 
    id: '17XmtlKQQ5rTEuL_1HD7lzYJLED46Ubsc', 
    description: '10 - Magical Girl', 
    category: 'Illustration', 
    tags: ['Magic', 'Cute', 'Sparkle'] 
  },
  { 
    id: '1bJIIrbnewoJF6NZok0LhV0QdEOjtICUL', 
    description: '11 - Vampire Queen', 
    category: 'Render', 
    tags: ['Gothic', 'Dark', 'Vampire'] 
  },
  { 
    id: '1C6Nam5BM88HT8-DXhq7vN6FAi7cZkcPp', 
    description: '12 - Gamer Girl', 
    category: 'Cosplay', 
    tags: ['Gaming', 'Headphones', 'Room'] 
  },
  { 
    id: '1kipcKgGzFU8PXdbMZ44ectyGYACJgvwb', 
    description: '13 - Steampunk Inventor', 
    category: 'Illustration', 
    tags: ['Steampunk', 'Gears', 'Vintage'] 
  },
  { 
    id: '186pUq7cS_BwaFcz-F6fC-5Ym752XfM33', 
    description: '14 - Cat Maid', 
    category: 'Render', 
    tags: ['Maid', 'Nekomimi', 'Cute'] 
  },
  { 
    id: '1wsQFU_MmDIZmghniDaCJWWL-Fmg19QjZ', 
    description: '15 - Winter Coat', 
    category: 'Cosplay', 
    tags: ['Winter', 'Snow', 'Cozy'] 
  },
  { 
    id: '1c_KpirK7XCX613T5euluXskr9hQp8wAf', 
    description: '16 - Demon Hunter', 
    category: 'Illustration', 
    tags: ['Action', 'Demon', 'Fire'] 
  },
  { 
    id: '1lJ7GfmGc-u-BqGPhnyZfodT_mmBgzd4K', 
    description: '17 - Idol Performance', 
    category: 'Render', 
    tags: ['Music', 'Stage', 'Idol'] 
  },
  { 
    id: '1iGm25Ydjf3hVrqbNRwab9ZMLqSClUn2S', 
    description: '18 - Office Lady', 
    category: 'Cosplay', 
    tags: ['Office', 'Glasses', 'Suit'] 
  },
  { 
    id: '1ZG1V97vtLuhG6HiTmXJbPjAM7OIJLCzQ', 
    description: '19 - Space Explorer', 
    category: 'Illustration', 
    tags: ['Space', 'Stars', 'Adventure'] 
  },
  { 
    id: '133GUoe5e3Y5wTDJ4fHcJ3WtkXfGGYduu', 
    description: '20 - Witch Brewing', 
    category: 'Sketch', 
    tags: ['Witch', 'Potion', 'Halloween'] 
  },
  { 
    id: '1A-9jSXec31FgKB-FRX-LG-9ynjBXfkX1', 
    description: '21 - Sports Festival', 
    category: 'Render', 
    tags: ['Sports', 'Gym', 'Active'] 
  },
  { 
    id: '1PEYlzBLLtU7JrvwyfyIT9n6VD-w99mvT', 
    description: '22 - Rainy Day', 
    category: 'Illustration', 
    tags: ['Rain', 'Umbrella', 'Melancholy'] 
  },
  { 
    id: '1jCWs73KSou7zKakpNlC0cjvCZ7mVv-r8', 
    description: '23 - Library Silence', 
    category: 'Cosplay', 
    tags: ['Books', 'Quiet', 'Study'] 
  },
  { 
    id: '1cbfgNMkbwEuhM_3QXgax833yIrF6v36e', 
    description: '24 - Sunset Horizon', 
    category: 'Render', 
    tags: ['Sunset', 'Scenic', 'Relax'] 
  },
  { 
    id: '1TnMMrZZ4uFCSblbpqSZGboMCTiVs87Dt', 
    description: '25 - Royal Ball', 
    category: 'Illustration', 
    tags: ['Dress', 'Elegant', 'Princess'] 
  },
  { 
    id: '19VqbcRa3DKvi9w1ejVkIK1ebpXR7iYid', 
    description: '26 - Cyber Hacker', 
    category: 'Cosplay', 
    tags: ['Hacker', 'Digital', 'Dark Web'] 
  },
];

const GOOGLE_DRIVE_VIDEOS = [
  {
    description: '1 - Video Collection',
    url: 'https://drive.google.com/file/d/194iRont8lJn2s7uwb-aC74mb0OZm8l9d/view?usp=drive_link',
    category: 'Clip',
    tags: ['Google Drive', 'Exclusive', 'HD']
  },
  {
    description: '2 - Video Collection',
    url: 'https://drive.google.com/file/d/1fC9_huC2XKh7eHm2p-FTH4Y7-PdmZn0o/view?usp=drive_link',
    category: 'AMV',
    tags: ['Google Drive', 'Edit', 'Anime']
  },
  {
    description: '3 - Video Collection',
    url: 'https://drive.google.com/file/d/10CXspjp3XT4zVOOPOLQZJbgviVJVnvOx/view?usp=drive_link',
    category: 'Animation',
    tags: ['Google Drive', 'Motion', 'Art']
  },
  {
    description: '4 - Video Collection',
    url: 'https://drive.google.com/file/d/1teEeldUk5k03VhhKVGAUag2vm2d7pvsa/view?usp=drive_link',
    category: 'Clip',
    tags: ['Google Drive', 'Scene', '4K']
  }
];

export const fallbackPhotoMedia: MediaItem[] = GOOGLE_DRIVE_PHOTOS.map((photo, index) => {
  const cleanId = getDriveId(photo.id);
  const category = photo.category || PHOTO_CATEGORIES[index % PHOTO_CATEGORIES.length];
  const tags = photo.tags || [COMMON_TAGS[index % COMMON_TAGS.length], COMMON_TAGS[(index + 1) % COMMON_TAGS.length]];
  
  // Transform to match the generic processing structure to re-use logic if needed, 
  // but keeping explicit map here for safety as per original file.
  return {
    id: cleanId,
    type: MediaType.Photo,
    src: `https://lh3.googleusercontent.com/d/${cleanId}`,
    description: photo.description,
    category,
    tags,
  };
});

export const fallbackVideoMedia: MediaItem[] = GOOGLE_DRIVE_VIDEOS.map((video, index) => {
  return processMediaItem({
      ...video,
      type: MediaType.Video,
      id: `vid-fallback-${index}`
  }, index);
});
