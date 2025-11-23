import { MediaItem, MediaType } from './types';

// --- HOW TO UPDATE THE GALLERY ---
// 1. Make sure your photos/videos in Google Drive are public ("Anyone with the link").
// 2. Get the shareable link. It will look like: 
//    https://drive.google.com/file/d/THIS_IS_THE_ID/view?usp=sharing
// 3. Copy the ID part and add it to the appropriate list below.
// 4. Add a description for each item.
// 5. For videos, you MUST provide a thumbnail image ID. Just take a screenshot of the video,
//    upload it to Drive, get its ID, and add it below. /

const GOOGLE_DRIVE_PHOTOS: { id: string; description: string }[] = [
  { 
    id: '1iobHbO4o-UmvF2mQS-tNHBcVyTrxOBrq', 
    description: 'Original Character - Cyber Aesthetic' 
  },
  { 
    id: '1228WCzPxVv2U0svW8fB7ySHRjGbfzH7g', 
    description: 'Night City Background Art' 
  },
  { 
    id: '1ivIocYRk84BQWyCEDSHz1zq-sMf6KpZK', 
    description: 'Rough Sketch - Mech Pilot' 
  },
  { 
    id: '1IXhQS8f6KSYqP2V9r3DPXSLO4U7R094h', 
    description: 'Concept Art - Blue Protocol' 
  },
  { 
    id: '1yJX7by0Gv6Gb4wfUNKm7e2TXjZwoy213', 
    description: 'Fan Art - Unit 01' 
  },
  { 
    id: '1V54lKJ9UHsAEVmrvG3PNk5G8Fb146tOJ', 
    description: 'Character Sheet - Front View' 
  },
  { 
    id: '1ew0NM1dAo0uEcrJdsxY5ycQOkm0iGux8', 
    description: 'Weapon Design - Katana' 
  },
  { 
    id: '12u8GEmAL2DcwzZwDYuNkeLfOemmRn0ij', 
    description: 'Environmental Art - Tokyo Future' 
  },
  { 
    id: '1QArFn14xLx6Puaszzi-miqRmJpsor6-h', 
    description: 'Keyframe Animation Study' 
  },
  { 
    id: '1suf4MNM-ONGix9XeU7yAMqgEccTZsorJ', 
    description: 'Motion Test Frame' 
  },
  { 
    id: '1VMUKBpfuFxLV-zCWVw4lFAXsh-ZMP5kC', 
    description: 'Portrait - Neon Light Study' 
  },
];


const GOOGLE_DRIVE_VIDEOS: { videoId: string; thumbnailId: string, description: string }[] = [
  { 
    videoId: '1FtUMM6NDQatclxoABpS2mCkvDCWif6CR', 
    thumbnailId: '1kV5XMG9SFnXCAuX-Rqm8p2cu0xC1kDOl',
    description: 'Animation Showreel 2025'
  },
  { 
    videoId: '17gOAdMDLNbyDNV_O4dnjtIcZUlUEhEB3', 
    thumbnailId: '1ICYSgKhI6VGphsxX7-aArxYnelVC22BN',
    description: 'Speedpaint Process - 10x Speed'
  },
];


// --- APP LOGIC (No need to edit below this line) ---

export const photoMedia: MediaItem[] = GOOGLE_DRIVE_PHOTOS.map(photo => ({
  id: photo.id,
  type: MediaType.Photo,
  src: `https://lh3.googleusercontent.com/d/${photo.id}`,
  description: photo.description,
}));

export const videoMedia: MediaItem[] = GOOGLE_DRIVE_VIDEOS.map(video => ({
  id: video.videoId,
  type: MediaType.Video,
  src: `https://lh3.googleusercontent.com/d/${video.thumbnailId}`,
  videoSrc: `https://drive.google.com/file/d/${video.videoId}/preview`,
  description: video.description,
}));