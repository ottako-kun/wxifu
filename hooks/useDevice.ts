import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface UseDeviceResponse {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
}

/**
 * Hook to detect device type based on screen width
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: > 1024px
 */
export const useDevice = (): UseDeviceResponse => {
  const [deviceInfo, setDeviceInfo] = useState<UseDeviceResponse>({
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
  });

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      let deviceType: DeviceType;
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width >= 768 && width <= 1024) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }

      setDeviceInfo({
        deviceType,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        isTouch: isTouchDevice,
      });
    };

    // Initial check
    updateDevice();

    // Listen for resize events with debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDevice, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
};

/**
 * Hook to get persistent view mode per device type
 * Stores view preferences in localStorage keyed by device type
 */
export const useDeviceViewMode = (defaultMode: 'grid' | 'feed' = 'grid') => {
  const { deviceType } = useDevice();
  
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>(() => {
    const stored = localStorage.getItem(`view-mode-${deviceType}`);
    return (stored as 'grid' | 'feed') || defaultMode;
  });

  useEffect(() => {
    // Load stored preference for this device type
    const stored = localStorage.getItem(`view-mode-${deviceType}`);
    if (stored && (stored === 'grid' || stored === 'feed')) {
      setViewMode(stored);
    } else {
      // Set default based on device type
      const deviceDefault = deviceType === 'mobile' ? 'feed' : 'grid';
      setViewMode(deviceDefault);
    }
  }, [deviceType]);

  const updateViewMode = (mode: 'grid' | 'feed') => {
    setViewMode(mode);
    localStorage.setItem(`view-mode-${deviceType}`, mode);
  };

  return [viewMode, updateViewMode] as const;
};
