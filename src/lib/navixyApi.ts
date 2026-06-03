/**
 * Navixy API helper for fetching live vehicle telemetry.
 * Docs: https://api.navixy.com/v2/
 */

const NAVIXY_BASE = 'https://api.navixy.com/v2';
const NAVIXY_HASH = process.env.EXPO_PUBLIC_NAVIXY_API_HASH || '';

export interface NavixyTracker {
  id: number;
  label: string;
  group_id: number;
  source: {
    id: number;
    device_id: string;
    model: string;
    blocked: boolean;
  };
}

export interface NavixyGpsLocation {
  lat: number;
  lng: number;
}

export interface NavixyGpsState {
  location: NavixyGpsLocation;
  speed: number;
  heading: number;
  updated: string;
  signal_level: number;
}

export interface NavixyTrackerState {
  gps: NavixyGpsState;
  connection_status: string;
  movement_status: string;
  ignition: boolean;
  battery_level: number;
  last_update: string;
  inputs?: boolean[];
}

/**
 * Fetches all trackers from Navixy.
 * Returns a list of tracker objects with id and label.
 */
export const fetchNavixyTrackerList = async (): Promise<NavixyTracker[]> => {
  try {
    const response = await fetch(`${NAVIXY_BASE}/tracker/list?hash=${NAVIXY_HASH}`);
    const json = await response.json();
    if (json.success && json.list) {
      return json.list;
    }
    console.warn('Navixy tracker/list failed:', json);
    return [];
  } catch (error) {
    console.warn('Navixy tracker/list error:', error);
    return [];
  }
};

/**
 * Finds a tracker by its label (tracker_name).
 * Returns the tracker_id or null if not found.
 */
export const findTrackerIdByLabel = async (trackerLabel: string): Promise<number | null> => {
  const trackers = await fetchNavixyTrackerList();
  const normalised = trackerLabel.trim().toLowerCase();
  const match = trackers.find(t => t.label.trim().toLowerCase() === normalised);
  return match ? match.id : null;
};

/**
 * Fetches the current state (GPS, speed, status) of a specific tracker.
 */
export const fetchTrackerState = async (trackerId: number): Promise<NavixyTrackerState | null> => {
  try {
    const response = await fetch(
      `${NAVIXY_BASE}/tracker/get_state?hash=${NAVIXY_HASH}&tracker_id=${trackerId}`
    );
    const json = await response.json();
    if (json.success && json.state) {
      return json.state;
    }
    console.warn('Navixy get_state failed:', json);
    return null;
  } catch (error) {
    console.warn('Navixy get_state error:', error);
    return null;
  }
};

/**
 * Returns all tracker labels (vehicle names) sorted alphabetically.
 */
export const fetchAllTrackerLabels = async (): Promise<string[]> => {
  const trackers = await fetchNavixyTrackerList();
  return trackers
    .map(t => t.label)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
};

/**
 * Fetches vehicle state data in batch chunks of 200 to prevent HTTP 414 URI Too Long errors.
 * API Endpoint: /tracker/get_states?tracker_ids=[id1,id2...]&hash=YOUR_HASH
 */
export const fetchTrackerStatesBatch = async (
  trackerIds: number[]
): Promise<Record<number, NavixyTrackerState>> => {
  if (trackerIds.length === 0) return {};
  
  const chunkIds = (arr: number[], size: number): number[][] => {
    const chunks: number[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  try {
    const chunks = chunkIds(trackerIds, 200);
    const fetchPromises = chunks.map(async (chunk) => {
      const idsParam = `[${chunk.join(',')}]`;
      const response = await fetch(
        `${NAVIXY_BASE}/tracker/get_states?tracker_ids=${idsParam}&hash=${NAVIXY_HASH}`
      );
      const json = await response.json();
      return json.success && json.states ? json.states : {};
    });

    const results = await Promise.all(fetchPromises);
    const mergedStates: Record<number, NavixyTrackerState> = {};
    results.forEach((statesObj) => {
      Object.assign(mergedStates, statesObj);
    });
    return mergedStates;
  } catch (error) {
    console.warn('Batch telemetry fetch failed:', error);
    return {};
  }
};
