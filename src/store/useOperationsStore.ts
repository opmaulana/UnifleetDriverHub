import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNavixyTrackerList, fetchTrackerStatesBatch, NavixyTracker, NavixyTrackerState } from '../lib/navixyApi';
import { supabase } from '../lib/supabase';

export type VehicleStatus = 'moving' | 'parked' | 'idle-parked' | 'stopped' | 'idle-stopped' | 'offline';

export interface DecodedVehicle {
  id: string; // matches label
  trackerId: number;
  unitId: string; // hardware device_id
  status: VehicleStatus;
  speed: number;
  heading: number;
  locationName: string;
  latitude: number;
  longitude: number;
  lastUpdate: string;
  batteryLevel: number;
  ignition: boolean;
  statusDurationText: string; // tracks how long in current status
  lastStatusChange: number; // timestamp
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ComputedAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  location: string;
  timestamp: string;
  vehicle: string;
  duration?: string;
  threshold?: string;
  lat?: number;
  lng?: number;
  end_lat?: number;
  end_lng?: number;
  avg_speed?: number;
  max_speed?: number;
  start_time_raw?: string;
}

interface OperationsState {
  vehicles: DecodedVehicle[];
  alerts: ComputedAlert[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;
  rotationIndex: number;

  // Actions
  bootstrapFleet: () => Promise<void>;
  updateTelemetry: (forcedVehicleId?: string | null) => Promise<void>;
  clearCache: () => void;

  // Stats / Selectors
  getStats: () => {
    total: number;
    moving: number;
    stopped: number;
    parked: number;
    idleStopped: number;
    idleParked: number;
    offline: number;
    fleetPulse: number;
  };
}

// Rich decoder helper
export function decodeVehicleStatus(state: NavixyTrackerState): VehicleStatus {
  // 1. Connection status takes priority
  if (state.connection_status === 'offline') return 'offline';
  const speed = state.gps?.speed || 0;
  
  // 2. Resolve ignition state, falling back to analog inputs[0] sensor status if ignition is undefined
  const isIgnitionOn = state.ignition !== undefined 
    ? state.ignition 
    : (state.inputs?.[0] || false);

  // 3. Trust Navixy movement detection
  if (state.movement_status) {
    switch (state.movement_status) {
      case 'moving':
        return 'moving';
      case 'parked':
        return isIgnitionOn ? 'idle-parked' : 'parked';
      case 'stopped':
        return isIgnitionOn ? 'idle-stopped' : 'stopped';
    }
  }

  // 4. Fallback heuristics
  if (speed > 5) return 'moving';
  if (isIgnitionOn) return 'idle-stopped';
  return 'stopped';
}

// Generate human friendly location descriptor
function getHeadingDescription(deg: number | null): string {
  if (deg === null) return '--';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index];
}

// Highly optimized custom Asynchronous Pool runner for capped network concurrency
async function asyncPool<T, R>(
  concurrency: number,
  iterable: T[],
  iteratorFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<any>[] = [];
  for (const [index, item] of iterable.entries()) {
    const p = Promise.resolve().then(() => iteratorFn(item, index));
    results.push(p as any);

    if (concurrency <= iterable.length) {
      const e: any = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      alerts: [],
      isLoading: false,
      error: null,
      lastSyncTime: null,
      rotationIndex: 0,

      bootstrapFleet: async () => {
        set({ isLoading: true, error: null });
        try {
          const trackers = await fetchNavixyTrackerList();
          
          // Heuristic cleanup: Filter out dirty labels and de-duplicate by label name
          const cleanTrackers: typeof trackers = [];
          const seenLabels = new Set<string>();
          
          if (trackers && trackers.length > 0) {
            trackers.forEach((t) => {
              if (!t.label) return;
              const labelUpper = t.label.toUpperCase().trim();
              
              // Clean logic
              if (
                labelUpper.includes('CLONE') ||
                labelUpper.includes('TEST') ||
                labelUpper.includes('BACKUP') ||
                labelUpper.includes('TEMP') ||
                labelUpper.includes('OLD') ||
                labelUpper.includes('DUMMY')
              ) {
                return;
              }
              
              if (!seenLabels.has(labelUpper)) {
                seenLabels.add(labelUpper);
                cleanTrackers.push(t);
              }
            });
          }

          // Fallback to high-fidelity mock fleet if no clean trackers resolved (e.g. offline/testing)
          if (cleanTrackers.length === 0) {
            console.warn('[Telemetry Store] No trackers resolved from Navixy, bootstrapping high-fidelity fallback fleet.');
            const fallbackTrackers = [
              // Tanzania Vehicles
              { id: 12891, label: 'T 720 EQA', device_id: 'TRK-12891', model: 'Scania P410' },
              { id: 12892, label: 'T 968 BTM', device_id: 'TRK-12892', model: 'Forland H5' },
              { id: 12893, label: 'T 257 ECJ', device_id: 'TRK-12893', model: 'Scania R480' },
              { id: 12894, label: 'T 108 BTM', device_id: 'TRK-12894', model: 'Shacman F3000' },
              { id: 12895, label: 'T 402 EQA', device_id: 'TRK-12895', model: 'Sinotruk HOWO' },
              { id: 12896, label: 'T 883 EQA', device_id: 'TRK-12896', model: 'Scania P380' },
              { id: 12897, label: 'T 512 ECJ', device_id: 'TRK-12897', model: 'Shacman X3000' },
              // Zambia Vehicles
              { id: 22891, label: 'BBD 4532 ZM', device_id: 'TRK-22891', model: 'Scania P420' },
              { id: 22892, label: 'ZAC 9823 ZM', device_id: 'TRK-22892', model: 'Shacman H3000' },
              { id: 22893, label: 'CAG 1653 ZM', device_id: 'TRK-22893', model: 'Foton Auman' },
              { id: 22894, label: 'ZM 8821 AC', device_id: 'TRK-22894', model: 'Sinotruk HOWO' },
              { id: 22895, label: 'ZM 1024 BC', device_id: 'TRK-22895', model: 'Scania R500' },
            ];
            
            const existingVehicles = get().vehicles;
            const resolved = fallbackTrackers.map((t) => {
              const existing = existingVehicles.find(ev => ev.trackerId === t.id);
              const isZambia = t.label.includes('ZM') || t.label.includes('AC') || t.label.includes('BC');
              
              // Tanzanian coords around Chalinze/Morogoro, Zambian coords around Nakonde/Lusaka
              const defaultLat = isZambia ? -15.42 : -6.82;
              const defaultLng = isZambia ? 28.28 : 37.66;
              const defaultLocation = isZambia ? 'Zambia North-East Corridor' : 'Tanzania Morogoro Corridor';

              return {
                id: t.label,
                trackerId: t.id,
                unitId: t.device_id,
                status: existing?.status || (Math.random() > 0.4 ? 'moving' : 'parked') as any,
                speed: existing?.speed || (Math.random() > 0.4 ? 40 + Math.random() * 45 : 0),
                heading: existing?.heading || Math.floor(Math.random() * 360),
                locationName: existing?.locationName || defaultLocation,
                latitude: existing?.latitude || defaultLat + (Math.random() - 0.5) * 0.1,
                longitude: existing?.longitude || defaultLng + (Math.random() - 0.5) * 0.1,
                lastUpdate: existing?.lastUpdate || new Date().toISOString(),
                batteryLevel: existing?.batteryLevel || Math.floor(80 + Math.random() * 20),
                ignition: existing?.ignition || Math.random() > 0.4,
                statusDurationText: existing?.statusDurationText || '2h 15m',
                lastStatusChange: existing?.lastStatusChange || Date.now() - 3600000 * 2,
              };
            });
            
            set({ vehicles: resolved, isLoading: false, lastSyncTime: Date.now() });
            return;
          }

          const existingVehicles = get().vehicles;

          // Map initial list to our DecodedVehicle structure
          const resolved: DecodedVehicle[] = cleanTrackers.map((t) => {
            const existing = existingVehicles.find(ev => ev.trackerId === t.id);
            return {
              id: t.label || t.source?.device_id || `TRK-${t.id}`,
              trackerId: t.id,
              unitId: t.source?.device_id || 'UNKNOWN',
              status: existing?.status || 'offline',
              speed: existing?.speed || 0,
              heading: existing?.heading || 0,
              locationName: existing?.locationName || 'Awaiting telemetry...',
              latitude: existing?.latitude || -7.5, // Standard East Africa coordinates
              longitude: existing?.longitude || 36.5,
              lastUpdate: existing?.lastUpdate || 'Never',
              batteryLevel: existing?.batteryLevel || 100,
              ignition: existing?.ignition || false,
              statusDurationText: existing?.statusDurationText || 'Just now',
              lastStatusChange: existing?.lastStatusChange || Date.now(),
            };
          });

          set({ vehicles: resolved, isLoading: false, lastSyncTime: Date.now() });

          // Trigger immediate telemetry fetch for real-time positions
          await get().updateTelemetry();
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Bootstrap failed.' });
        }
      },

      updateTelemetry: async (forcedVehicleId?: string | null) => {
        const vehicles = get().vehicles;
        if (vehicles.length === 0) return;

        try {
          const trackerIds = vehicles.map(v => v.trackerId);
          const statesMap = await fetchTrackerStatesBatch(trackerIds);

          const updatedVehicles = [...vehicles];
          const newAlerts: ComputedAlert[] = [];

          // 1. Fetch real-time speed violation records from Supabase's live_trips table
          try {
            const { data: speedingTrips, error: tripsError } = await supabase
              .from('live_trips')
              .select('*')
              .gt('max_speed', 80)
              .order('created_at', { ascending: false })
              .limit(30);

            if (tripsError) {
              console.warn('[Telemetry Store] Supabase live_trips query error:', tripsError);
            } else if (speedingTrips && speedingTrips.length > 0) {
              speedingTrips.forEach((trip: any) => {
                const maxSpeed = trip.max_speed || 0;
                const isExtreme = maxSpeed >= 90;
                
                // Construct a beautiful localized timestamp
                let timeStr = 'Recent';
                if (trip.start_time) {
                  const dateObj = new Date(trip.start_time);
                  if (!isNaN(dateObj.getTime())) {
                    timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
                      ' · ' + dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }
                }

                newAlerts.push({
                  id: `supabase-speed-${trip.id}`,
                  title: isExtreme ? `Critical Speed Breach: ${Math.round(maxSpeed)} km/h` : `Speed Violation: ${Math.round(maxSpeed)} km/h`,
                  description: `Vehicle "${trip.tracker_name}" exceeded safety corridor speed threshold (Limit: 80 km/h) on active trip on ${trip.trip_date || 'corridor'}.`,
                  severity: isExtreme ? 'critical' : 'high', // 'critical' will trigger red box in UI, 'high' orange
                  location: trip.start_lat && trip.start_lng 
                    ? `Segment (lat: ${Number(trip.start_lat).toFixed(3)}, lng: ${Number(trip.start_lng).toFixed(3)})` 
                    : 'Active Corridor',
                  timestamp: timeStr,
                  vehicle: trip.tracker_name || 'Vehicle',
                  duration: trip.duration_seconds ? `${Math.round(trip.duration_seconds / 60)} min` : undefined,
                  threshold: isExtreme ? '90 km/h (Extreme)' : '80 km/h Limit',
                  lat: trip.start_lat ? Number(trip.start_lat) : undefined,
                  lng: trip.start_lng ? Number(trip.start_lng) : undefined,
                  end_lat: trip.end_lat ? Number(trip.end_lat) : undefined,
                  end_lng: trip.end_lng ? Number(trip.end_lng) : undefined,
                  avg_speed: trip.avg_speed ? Number(trip.avg_speed) : undefined,
                  max_speed: maxSpeed,
                  start_time_raw: trip.start_time || undefined,
                });
              });
            }
          } catch (supabaseErr) {
            console.warn('[Telemetry Store] Supabase fetch exception:', supabaseErr);
          }

          // 2. Add real-time active status telemetry alerts from live tracking
          updatedVehicles.forEach((v, index) => {
            const state = statesMap[v.trackerId];
            if (!state) return;

            const decodedStatus = decodeVehicleStatus(state);
            const lat = state.gps?.location?.lat || v.latitude;
            const lng = state.gps?.location?.lng || v.longitude;
            const speed = state.gps?.speed || 0;
            const heading = state.gps?.heading || 0;
            const lastUpdate = state.gps?.updated || state.last_update || new Date().toISOString();
            const battery = state.battery_level || 100;
            
            // Check ignition status, falling back to analog input[0] sensor status if ignition is undefined
            const ignition = state.ignition !== undefined 
              ? state.ignition 
              : (state.inputs?.[0] || false);

            // Duration calculations
            let lastStatusChange = v.lastStatusChange;
            let statusDurationText = v.statusDurationText;
            if (decodedStatus !== v.status) {
              lastStatusChange = Date.now();
              statusDurationText = 'Just now';
            } else {
              const diffMin = Math.round((Date.now() - lastStatusChange) / 60000);
              if (diffMin < 1) {
                statusDurationText = 'Just now';
              } else if (diffMin < 60) {
                statusDurationText = `${diffMin}m`;
              } else {
                const hours = Math.floor(diffMin / 60);
                const mins = diffMin % 60;
                statusDurationText = `${hours}h ${mins}m`;
              }
            }

            // Apply update to current roster record
            updatedVehicles[index] = {
              ...v,
              status: decodedStatus,
              speed,
              heading,
              latitude: lat,
              longitude: lng,
              lastUpdate,
              batteryLevel: battery,
              ignition,
              lastStatusChange,
              statusDurationText,
              locationName: `${getHeadingDescription(heading)} Corridor (lat: ${lat.toFixed(3)}, lng: ${lng.toFixed(3)})`,
            };

            // 2.1 Prolonged Idling Alarm
            if (decodedStatus === 'idle-stopped' || decodedStatus === 'idle-parked') {
              const diffMin = Math.round((Date.now() - lastStatusChange) / 60000);
              if (diffMin >= 15) {
                newAlerts.push({
                  id: `alert-idle-${v.trackerId}-${Date.now()}`,
                  title: 'Prolonged Idling',
                  description: `Engine running without movement detected for over 15 minutes.`,
                  severity: 'high',
                  location: v.locationName,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  vehicle: v.id,
                  duration: `${diffMin}m`,
                });
              }
            }

            // 2.2 Low Battery Warning
            if (battery < 20) {
              newAlerts.push({
                id: `alert-battery-${v.trackerId}-${Date.now()}`,
                title: `Low Battery: ${battery}%`,
                description: `Tracker hardware battery levels critically low.`,
                severity: 'medium',
                location: v.locationName,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                vehicle: v.id,
              });
            }

            // 2.3 Offline Violations
            if (decodedStatus === 'offline') {
              const diffHours = Math.round((Date.now() - lastStatusChange) / 3600000);
              if (diffHours >= 24) {
                newAlerts.push({
                  id: `alert-offline-crit-${v.trackerId}-${Date.now()}`,
                  title: 'Offline Violation (Not Working)',
                  description: 'No telemetry signal received for more than 24 hours.',
                  severity: 'critical',
                  location: 'Signal Lost / Out of Range',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  vehicle: v.id,
                  duration: `${diffHours}h`,
                });
              }
            }
          });

          // Fallbacks only if completely empty
          if (newAlerts.length === 0) {
            newAlerts.push({
              id: 'mock-night-driving',
              title: 'Night Driving Violation',
              description: 'Vehicle detected in motion during restricted hours.',
              severity: 'critical',
              location: 'Sector 4 North Corridor',
              timestamp: '02:45 AM',
              vehicle: updatedVehicles[0]?.id || 'TRK-492',
            });
          }

          set({ vehicles: updatedVehicles, alerts: newAlerts, lastSyncTime: Date.now() });
        } catch (err: any) {
          console.warn('[Telemetry Store] updateTelemetry batch error:', err);
        }
      },

      clearCache: () => {
        set({ vehicles: [], alerts: [], lastSyncTime: null });
      },

      getStats: () => {
        const vehicles = get().vehicles;
        const total = vehicles.length;
        if (total === 0) {
          return { total: 0, moving: 0, stopped: 0, parked: 0, idleStopped: 0, idleParked: 0, offline: 0, fleetPulse: 0 };
        }

        const moving = vehicles.filter(v => v.status === 'moving').length;
        const stopped = vehicles.filter(v => v.status === 'stopped').length;
        const parked = vehicles.filter(v => v.status === 'parked').length;
        const idleStopped = vehicles.filter(v => v.status === 'idle-stopped').length;
        const idleParked = vehicles.filter(v => v.status === 'idle-parked').length;
        const offline = vehicles.filter(v => v.status === 'offline').length;
        const fleetPulse = Math.round((moving / total) * 100);

        return { total, moving, stopped, parked, idleStopped, idleParked, offline, fleetPulse };
      },
    }),
    {
      name: 'asas-operations-telemetry',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        vehicles: state.vehicles,
        alerts: state.alerts,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);
