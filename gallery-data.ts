import { MediaItem, MediaType } from './types';

// --- HOW TO UPDATE THE GALLERY ---
// 1. Make sure your photos/videos in Google Drive are public ("Anyone with the link").
// 2. Get the shareable link.
// 3. Add to the lists below.
// 4. To customize Category/Tags, update the mapping logic at the bottom or expand the data structure.

// Helper to extract Google Drive ID from various URL formats
const getDriveId = (input: string): string => {
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

// PLACEHOLDERS FOR EDITING LATER
const PHOTO_CATEGORIES = ['Illustration', 'Cosplay', 'Render', 'Sketch'];
const VIDEO_CATEGORIES = ['AMV', 'Animation', 'Clip', 'Edit'];
const COMMON_TAGS = ['Waifu', 'High Res', 'SFW', 'NSFW', 'Fantasy', 'Cyberpunk', 'Beach', 'Uniform'];

const GOOGLE_DRIVE_PHOTOS: { id: string; description: string; category?: string; tags?: string[] }[] = [
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

const GOOGLE_DRIVE_VIDEOS: { videoId: string; thumbnailId: string, description: string; category?: string; tags?: string[] }[] = [
  {
    videoId: '1teEeldUk5k03VhhKVGAUag2vm2d7pvsa',
    thumbnailId: '1G4sTXINHsOBwYDtcZle79qLo0OUsWDnj',
    description: '1 - AMV Edit',
    category: 'AMV',
    tags: ['Action', 'Music', 'Edit']
  },
  {
    videoId: '194iRont8lJn2s7uwb-aC74mb0OZm8l9d',
    thumbnailId: '1_rzf1mCHifK_fR0cZYwPUpv31JKAsxZa',
    description: '2 - Character Showcase',
    category: 'Clip',
    tags: ['Character', 'Showcase', 'HD']
  }
];

const EXTERNAL_VIDEOS: { id: string; thumbnailUrl: string; videoUrl: string; description: string; category?: string; tags?: string[] }[] = [
//   {
//     id: 'ext-1',
//     thumbnailUrl: '...',
//     videoUrl: '...',
//    description: 'External Anime Clip',
//    category: 'Clip',
//    tags: ['Action', 'External']
//  },
];


// --- APP LOGIC ---

export const photoMedia: MediaItem[] = GOOGLE_DRIVE_PHOTOS.map((photo, index) => {
  const cleanId = getDriveId(photo.id);
  // Assign placeholders if specific data isn't provided
  const category = photo.category || PHOTO_CATEGORIES[index % PHOTO_CATEGORIES.length];
  const tags = photo.tags || [COMMON_TAGS[index % COMMON_TAGS.length], COMMON_TAGS[(index + 1) % COMMON_TAGS.length]];
  
  return {
    id: cleanId,
    type: MediaType.Photo,
    src: `https://lh3.googleusercontent.com/d/${cleanId}`,
    description: photo.description,
    category,
    tags,
  };
});

export const videoMedia: MediaItem[] = [
  // 1. Google Drive Videos
  ...GOOGLE_DRIVE_VIDEOS.map((video, index) => {
    const cleanVideoId = getDriveId(video.videoId);
    const cleanThumbId = getDriveId(video.thumbnailId);
    
    // Placeholder logic for videos
    const category = video.category || VIDEO_CATEGORIES[index % VIDEO_CATEGORIES.length];
    const tags = video.tags || ['Video', 'HD', 'Edit'];

    return {
      id: cleanVideoId,
      type: MediaType.Video,
      src: `https://lh3.googleusercontent.com/d/${cleanThumbId}`,
      videoSrc: `https://drive.google.com/file/d/${cleanVideoId}/preview`,
      description: video.description,
      category,
      tags
    };
  }),
  // 2. External Videos
  ...EXTERNAL_VIDEOS.map(video => ({
    id: video.id,
    type: MediaType.Video,
    src: video.thumbnailUrl,
    videoSrc: video.videoUrl,
    description: video.description,
    category: video.category || 'External',
    tags: video.tags || ['Imported']
  }))
];