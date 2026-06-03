export const getDeviceModel = () => {
  try {
    const Device = require('expo-device');
    return Device.modelName || 'Unknown Device';
  } catch (e) {
    return 'Unknown Device';
  }
};

export const getAppVersion = () => {
  try {
    const Application = require('expo-application');
    return Application.nativeApplicationVersion || '1.0';
  } catch (e) {
    return '1.0';
  }
};

export const getTimezone = () => {
  try {
    const Localization = require('expo-localization');
    return Localization.getCalendars?.()?.[0]?.timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
};

export const getLocale = () => {
  try {
    const Localization = require('expo-localization');
    return Localization.getLocales?.()?.[0]?.languageTag || 'en';
  } catch (e) {
    return 'en';
  }
};

export const getGPSLocation = async () => {
  try {
    const Location = require('expo-location');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let location = await Location.getCurrentPositionAsync({});
      if (location && location.coords) {
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    }
  } catch (e) {
    console.log('[deviceInfo] Native location error:', e);
  }
  return null;
};
