import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // --- SYSTEM STATE ---
  isChaosMode: false, // DEFAULT IS NOW FALSE (PRODUCTION MODE)
  toggleChaosMode: () => set((state) => ({ isChaosMode: !state.isChaosMode })),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  // --- PWA STATE ---
  deferredPrompt: null,
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),

  // --- THE DATA CONTRACT (Between You and Teammate) ---
  pickupLocation: null, // You write this
  dropoffLocation: null, // You write this
  distance: 0,          // TEAMMATE WRITES THIS from the Map
  baseFare: 0,          // You calculate this based on distance
  
  selectedRideType: 'mini', // Default to normal
  rideStatus: 'idle',

  // Actions
  setPickup: (location) => set({ pickupLocation: location }),
  setDropoff: (location) => set({ dropoffLocation: location }),
  setDistance: (dist) => set({ distance: dist }), // Teammate calls this
  setBaseFare: (fare) => set({ baseFare: fare }),
  setRideType: (type) => set({ selectedRideType: type }),
  setRideStatus: (status) => set({ rideStatus: status }),
  
  resetBooking: () => set({
    pickupLocation: null,
    dropoffLocation: null,
    distance: 0,
    baseFare: 0,
    selectedRideType: 'mini',
    rideStatus: 'idle',
  })
}));