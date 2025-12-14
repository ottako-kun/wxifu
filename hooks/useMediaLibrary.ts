import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fallbackPhotoMedia, fallbackVideoMedia, processMediaItem } from '../gallery-data';
import { MediaItem, MediaType } from '../types';

export const useMediaLibrary = () => {
  const [photoMedia, setPhotoMedia] = useState<MediaItem[]>([]);
  const [videoMedia, setVideoMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetchedData: any[] = [];

      // Attempt 1: Efficient Join (Requires Foreign Key)
      const { data: joinData, error: joinError } = await supabase
        .from('media')
        .select('*, profiles(name, avatar)')
        .order('created_at', { ascending: false });

      if (!joinError && joinData) {
        fetchedData = joinData;
      } else {
        // Attempt 2: Fallback Manual Fetch
        console.warn("Database join failed, falling back to manual fetch...", joinError?.message);
        
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (mediaError) throw mediaError;

        if (mediaData && mediaData.length > 0) {
           const userIds = Array.from(new Set(
               mediaData
                  .map(m => m.user_id)
                  .filter(id => id && id.length > 20 && !id.startsWith('static'))
           ));
           
           const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, name, avatar')
              .in('id', userIds as string[]);
              
           const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
           
           fetchedData = mediaData.map(m => ({
               ...m,
               profiles: profileMap.get(m.user_id) || null
           }));
        }
      }

      if (fetchedData.length === 0) {
        setPhotoMedia(fallbackPhotoMedia);
        setVideoMedia(fallbackVideoMedia);
      } else {
        const fetchedPhotos: MediaItem[] = [];
        const fetchedVideos: MediaItem[] = [];

        fetchedData.forEach((item, index) => {
           const processed = processMediaItem(item, index);
           if (processed.type === MediaType.Video) {
               fetchedVideos.push(processed);
           } else {
               fetchedPhotos.push(processed);
           }
        });
        
        setPhotoMedia(fetchedPhotos.length > 0 ? fetchedPhotos : fallbackPhotoMedia);
        setVideoMedia(fetchedVideos.length > 0 ? fetchedVideos : fallbackVideoMedia);
      }
    } catch (err: any) {
      console.error("Error fetching media:", err.message);
      setPhotoMedia(fallbackPhotoMedia);
      setVideoMedia(fallbackVideoMedia);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { photoMedia, videoMedia, isLoading, refresh: fetchData };
};