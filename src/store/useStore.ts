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

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  activeTrip: Trip | null;
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
  addNotification: (notification: any) => void;
  setLanguage: (lang: 'en' | 'sw') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      activeTrip: null,
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
  logout: () => set({ isAuthenticated: false, user: null, activeTrip: null }),
  setUser: (user) => set({ user }),
  toggleOnline: () => set((state) => ({ 
    user: state.user ? { ...state.user, isOnline: !state.user.isOnline } : null 
  })),
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  updateTripStatus: (status) => set((state) => ({
    activeTrip: state.activeTrip ? { ...state.activeTrip, status } : null
  })),
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
        language: state.language 
      }), // Only persist these fields
    }
  )
);
