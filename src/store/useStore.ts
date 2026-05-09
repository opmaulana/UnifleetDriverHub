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
  vehicle: string;
  photo?: string;
  role: 'driver';
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
  language: 'en' | 'sw' | 'ar' | 'hi' | 'fr';
  
  // Actions
  login: (phone: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  toggleOnline: () => void;
  setActiveTrip: (trip: Trip | null) => void;
  updateTripStatus: (status: Trip['status']) => void;
  addNotification: (notification: any) => void;
  setLanguage: (lang: 'en' | 'sw' | 'ar' | 'hi' | 'fr') => void;
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

  login: (phone) => set({ 
    isAuthenticated: true, 
    user: { 
      driver_id: 'mock-driver-123',
      name: 'Driver John', 
      phone, 
      vehicle: 'KDJ 432L',
      role: 'driver',
      onboarding_completed: true,
      permissions_granted: true,
      isOnline: true 
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
