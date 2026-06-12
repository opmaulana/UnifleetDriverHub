import { supabase } from '../lib/supabase';

type DriverTripEventType = 'start' | 'stop' | 'resume' | 'delivered_pending_approval';

interface DriverTripEventPayload {
  eventType: DriverTripEventType;
  sessionId: string;
  driverId: string;
  driverName: string;
  trackerName: string;
  driverLat: number | null;
  driverLng: number | null;
  truckLat: number | null;
  truckLng: number | null;
  truckSpeed: number | null;
  totalActiveSeconds: number;
  totalStoppedSeconds: number;
}

export const logDriverTripEvent = async (payload: DriverTripEventPayload) => {
  try {
    await supabase.from('driver_trip_events').insert({
      event_type: payload.eventType,
      session_id: payload.sessionId,
      driver_id: payload.driverId,
      driver_name: payload.driverName,
      tracker_name: payload.trackerName,
      driver_latitude: payload.driverLat,
      driver_longitude: payload.driverLng,
      truck_latitude: payload.truckLat,
      truck_longitude: payload.truckLng,
      truck_speed: payload.truckSpeed,
      total_active_seconds: payload.totalActiveSeconds,
      total_stopped_seconds: payload.totalStoppedSeconds,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[DriverTripEvents] Event log skipped:', error);
  }
};

