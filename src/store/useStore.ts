import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Trip {
  id: string;
  status: 'pending' | 'active' | 'arrived' | 'completed';
  pickup: string;
  dropoff: string;
  estimatedEarnings: string;
  distance: string;
  time: string;
}

interface User {
  driver_id: string;
  name: string;
  phone: string;
  tracker_name: string;
  photo?: string;
  role: 'DRIVER' | 'OPERATOR' | 'MANAGER' | 'UNASSIGNED';
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  onboarding_completed: boolean;
  permissions_granted: boolean;
  isOnline: boolean;
}

type DriverTripStatus = 'waiting' | 'nearby' | 'active' | 'stopped' | 'delivered_pending_approval' | 'completed';

interface DriverTripSession {
  id: string;
  status: DriverTripStatus;
  driver_id: string;
  driver_name: string;
  tracker_name: string;
  startedAt: string | null;
  stoppedAt: string | null;
  resumedAt: string | null;
  deliveryRequestedAt: string | null;
  completedAt: string | null;
  totalActiveSeconds: number;
  totalStoppedSeconds: number;
  lastResumedAt: string | null;
  currentStopStartedAt: string | null;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  activeTrip: Trip | null;
  driverTripSession: DriverTripSession | null;
  trips: Trip[];
  notifications: any[];
  language: 'en' | 'sw';
  
  // Actions
  login: (profile: any) => void;
  logout: () => void;
  setUser: (user: User) => void;
  toggleOnline: () => void;
  setActiveTrip: (trip: Trip | null) => void;
  updateTripStatus: (status: Trip['status']) => void;
  startDriverTrip: () => DriverTripSession | null;
  stopDriverTrip: () => DriverTripSession | null;
  resumeDriverTrip: () => DriverTripSession | null;
  markDriverDelivered: () => DriverTripSession | null;
  setDriverTripNearby: () => void;
  clearDriverTripSession: () => void;
  addNotification: (notification: any) => void;
  setLanguage: (lang: 'en' | 'sw') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      activeTrip: null,
      driverTripSession: null,
  trips: [
    {
      id: '1',
      status: 'pending',
      pickup: 'Terminal 1, JKIA',
      dropoff: 'Westlands, Nairobi',
      estimatedEarnings: 'KES 2,400',
      distance: '18.5 km',
      time: '35 min',
    }
  ],
  notifications: [],
  language: 'en',

  login: (profile: any) => set({ 
    isAuthenticated: true, 
    driverTripSession: null,
    user: { 
      driver_id: profile.id || 'mock-driver-123',
      name: profile.full_name || 'Driver John', 
      phone: profile.phone_number || '', 
      tracker_name: profile.tracker_name || 'CAG 1653 ZM FOTON',
      role: profile.role || 'DRIVER',
      approval_status: profile.approval_status || 'PENDING',
      onboarding_completed: true,
      permissions_granted: true,
      isOnline: false 
    } 
  }),
  logout: () => set({ isAuthenticated: false, user: null, activeTrip: null, driverTripSession: null }),
  setUser: (user) => set({ user }),
  toggleOnline: () => set((state) => ({ 
    user: state.user ? { ...state.user, isOnline: !state.user.isOnline } : null 
  })),
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  updateTripStatus: (status) => set((state) => ({
    activeTrip: state.activeTrip ? { ...state.activeTrip, status } : null
  })),
  startDriverTrip: () => {
    let nextSession: DriverTripSession | null = null;
    set((state) => {
      if (!state.user) return state;

      const now = new Date().toISOString();
      nextSession = {
        id: `driver-trip-${state.user.driver_id}-${Date.now()}`,
        status: 'active',
        driver_id: state.user.driver_id,
        driver_name: state.user.name,
        tracker_name: state.user.tracker_name,
        startedAt: now,
        stoppedAt: null,
        resumedAt: null,
        deliveryRequestedAt: null,
        completedAt: null,
        totalActiveSeconds: 0,
        totalStoppedSeconds: 0,
        lastResumedAt: now,
        currentStopStartedAt: null,
      };

      return { driverTripSession: nextSession };
    });
    return nextSession;
  },
  stopDriverTrip: () => {
    let nextSession: DriverTripSession | null = null;
    set((state) => {
      const session = state.driverTripSession;
      if (!session || session.status !== 'active') return state;

      const now = new Date();
      const activeStartedAt = session.lastResumedAt ? new Date(session.lastResumedAt).getTime() : now.getTime();
      const activeSeconds = Math.max(0, Math.floor((now.getTime() - activeStartedAt) / 1000));
      nextSession = {
        ...session,
        status: 'stopped',
        stoppedAt: now.toISOString(),
        totalActiveSeconds: session.totalActiveSeconds + activeSeconds,
        lastResumedAt: null,
        currentStopStartedAt: now.toISOString(),
      };

      return { driverTripSession: nextSession };
    });
    return nextSession;
  },
  resumeDriverTrip: () => {
    let nextSession: DriverTripSession | null = null;
    set((state) => {
      const session = state.driverTripSession;
      if (!session || session.status !== 'stopped') return state;

      const now = new Date();
      const stopStartedAt = session.currentStopStartedAt ? new Date(session.currentStopStartedAt).getTime() : now.getTime();
      const stoppedSeconds = Math.max(0, Math.floor((now.getTime() - stopStartedAt) / 1000));
      nextSession = {
        ...session,
        status: 'active',
        resumedAt: now.toISOString(),
        totalStoppedSeconds: session.totalStoppedSeconds + stoppedSeconds,
        lastResumedAt: now.toISOString(),
        currentStopStartedAt: null,
      };

      return { driverTripSession: nextSession };
    });
    return nextSession;
  },
  markDriverDelivered: () => {
    let nextSession: DriverTripSession | null = null;
    set((state) => {
      const session = state.driverTripSession;
      if (!session || session.status === 'delivered_pending_approval' || session.status === 'completed') return state;

      const now = new Date();
      const activeSeconds = session.lastResumedAt
        ? Math.max(0, Math.floor((now.getTime() - new Date(session.lastResumedAt).getTime()) / 1000))
        : 0;
      const stoppedSeconds = session.currentStopStartedAt
        ? Math.max(0, Math.floor((now.getTime() - new Date(session.currentStopStartedAt).getTime()) / 1000))
        : 0;

      nextSession = {
        ...session,
        status: 'delivered_pending_approval',
        deliveryRequestedAt: now.toISOString(),
        totalActiveSeconds: session.totalActiveSeconds + activeSeconds,
        totalStoppedSeconds: session.totalStoppedSeconds + stoppedSeconds,
        lastResumedAt: null,
        currentStopStartedAt: null,
      };

      return { driverTripSession: nextSession };
    });
    return nextSession;
  },
  setDriverTripNearby: () => set((state) => {
    const session = state.driverTripSession;
    if (!state.user || session) return state;

    return {
      driverTripSession: {
        id: `driver-trip-${state.user.driver_id}-${Date.now()}`,
        status: 'nearby',
        driver_id: state.user.driver_id,
        driver_name: state.user.name,
        tracker_name: state.user.tracker_name,
        startedAt: null,
        stoppedAt: null,
        resumedAt: null,
        deliveryRequestedAt: null,
        completedAt: null,
        totalActiveSeconds: 0,
        totalStoppedSeconds: 0,
        lastResumedAt: null,
        currentStopStartedAt: null,
      },
    };
  }),
  clearDriverTripSession: () => set({ driverTripSession: null }),
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'asas-driver-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user, 
        language: state.language,
        driverTripSession: state.driverTripSession,
      }), // Only persist these fields
    }
  )
);
