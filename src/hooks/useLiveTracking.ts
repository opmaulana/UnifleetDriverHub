import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { fetchNavixyTrackerList, fetchTrackerState } from '../lib/navixyApi';


interface LocationData {
  driverLat: number | null;
  driverLng: number | null;
  truckLat: number | null;
  truckLng: number | null;
  truckSpeed: number | null;
  truckLastUpdate: string | null;
  truckHeading: number | null;
  truckConnectionStatus: string | null;
  truckMovementStatus: string | null;
  truckIgnition: boolean | null;
  truckBattery: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useLiveTracking = () => {
  const { user } = useStore();
  const [data, setData] = useState<LocationData>({
    driverLat: null, driverLng: null,
    truckLat: null, truckLng: null,
    truckSpeed: null, truckLastUpdate: null,
    truckHeading: null, truckConnectionStatus: null,
    truckMovementStatus: null, truckIgnition: null,
    truckBattery: null,
    isLoading: true, error: null,
  });
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const webWatchId = useRef<number | null>(null);
  const truckPoll = useRef<ReturnType<typeof setInterval> | null>(null);
  const navixyTrackerId = useRef<number | null>(null);


  useEffect(() => {
    if (!user?.tracker_name) return;

    // 1. Start watching driver's GPS
    const startDriverTracking = async () => {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          try {
            webWatchId.current = navigator.geolocation.watchPosition(
              (loc) => {
                const { latitude, longitude } = loc.coords;
                setData(prev => ({ ...prev, driverLat: latitude, driverLng: longitude, isLoading: false }));

                // Update profiles table silently
                if (user?.driver_id) {
                  supabase.from('profiles')
                    .update({ current_latitude: latitude, current_longitude: longitude })
                    .eq('id', user.driver_id)
                    .then(() => {});
                }
              },
              (err) => {
                setData(prev => ({ ...prev, error: err.message, isLoading: false }));
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          } catch (e: any) {
            setData(prev => ({ ...prev, error: e.message, isLoading: false }));
          }
        } else {
          setData(prev => ({ ...prev, error: 'Geolocation not supported', isLoading: false }));
        }
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setData(prev => ({ ...prev, error: 'Location permission denied', isLoading: false }));
          return;
        }

        locationSub.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 20 },
          (loc) => {
            const { latitude, longitude } = loc.coords;
            setData(prev => ({ ...prev, driverLat: latitude, driverLng: longitude, isLoading: false }));

            // Update profiles table silently
            if (user?.driver_id) {
              supabase.from('profiles')
                .update({ current_latitude: latitude, current_longitude: longitude })
                .eq('id', user.driver_id)
                .then(() => {});
            }
          }
        );
      } catch (e: any) {
        setData(prev => ({ ...prev, error: e.message, isLoading: false }));
      }
    };

    // 2. Resolve Navixy tracker ID from tracker_name, then poll state
    const resolveAndStartPolling = async () => {
      try {
        // Find the tracker ID by matching the label
        const trackers = await fetchNavixyTrackerList();
        const normalised = user.tracker_name!.trim().toLowerCase();
        // Try matching strategies: exact → starts-with → contains
        let match = trackers.find(t => t.label.trim().toLowerCase() === normalised);

        if (!match) {
          // Navixy labels often have suffixes like "CAA 104 ZM HOWO" 
          // while driver registered just "CAA 104"
          match = trackers.find(t => t.label.trim().toLowerCase().startsWith(normalised));
        }

        if (!match) {
          // Also try if user's tracker_name is contained within the Navixy label
          match = trackers.find(t => t.label.trim().toLowerCase().includes(normalised));
        }

        if (match) {
          navixyTrackerId.current = match.id;
          console.log(`[Navixy] Matched "${user.tracker_name}" → "${match.label}" (id: ${match.id})`);
          // Fetch immediately then poll every 10 seconds
          await fetchTruckFromNavixy();
          truckPoll.current = setInterval(fetchTruckFromNavixy, 10000);
        } else {
          console.warn(`[Navixy] No tracker found for label "${user.tracker_name}" in ${trackers.length} trackers`);
          setData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error('[Navixy] Resolution error:', err);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Poll truck GPS from Navixy API
    const fetchTruckFromNavixy = async () => {
      if (!navixyTrackerId.current) return;
      try {
        const state = await fetchTrackerState(navixyTrackerId.current);
        if (state?.gps?.location) {
          setData(prev => ({
            ...prev,
            truckLat: state.gps.location.lat,
            truckLng: state.gps.location.lng,
            truckSpeed: state.gps.speed || 0,
            truckLastUpdate: state.gps.updated || state.last_update,
            truckHeading: state.gps.heading || null,
            truckConnectionStatus: state.connection_status || null,
            truckMovementStatus: state.movement_status || null,
            truckIgnition: state.ignition ?? null,
            truckBattery: state.battery_level ?? null,
          }));
        }
      } catch (e) {
        console.log('[Navixy] Truck poll error:', e);
      }
    };

    startDriverTracking();
    resolveAndStartPolling();

    return () => {
      if (locationSub.current) locationSub.current.remove();
      if (webWatchId.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(webWatchId.current);
      }
      if (truckPoll.current) clearInterval(truckPoll.current);
    };
  }, [user?.tracker_name]);

  return data;
};
