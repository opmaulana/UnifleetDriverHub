import { Platform } from 'react-native';

export const getDeviceModel = () => 'Web Browser';

export const getAppVersion = () => '1.0.0';

export const getTimezone = () => {
  return typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
};

export const getLocale = () => {
  return typeof navigator !== 'undefined' ? navigator.language : 'en';
};

export const getGPSLocation = async () => {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<any>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      if (pos && pos.coords) {
        return {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      }
    } catch (e) {
      console.log('[deviceInfo.web] Browser location error:', e);
    }
  }
  return null;
};
