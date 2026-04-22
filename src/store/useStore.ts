import { create } from 'zustand';

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
  name: string;
  phone: string;
  vehicle: string;
  photo?: string;
  isOnline: boolean;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  activeTrip: Trip | null;
  trips: Trip[];
  notifications: any[];
  
  // Actions
  login: (phone: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  toggleOnline: () => void;
  setActiveTrip: (trip: Trip | null) => void;
  updateTripStatus: (status: Trip['status']) => void;
  addNotification: (notification: any) => void;
}

export const useStore = create<AppState>((set) => ({
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

  login: (phone) => set({ isAuthenticated: true, user: { name: 'Driver John', phone, vehicle: 'KDJ 432L', isOnline: true } }),
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
}));
