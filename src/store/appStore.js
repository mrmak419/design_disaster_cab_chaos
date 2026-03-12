import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // --- HACKATHON CONTROL ---
  isChaosMode: true, // Start in Chaos mode for Round 1
  toggleChaosMode: () => set((state) => ({ isChaosMode: !state.isChaosMode })),

  // --- CAB BOOKING STATE ---
  pickupLocation: null, // { lat, lng, address }
  dropoffLocation: null, // { lat, lng, address }
  baseFare: 150, // Standard base fare in INR
  selectedRideType: null, // 'mini', 'sedan', 'suv'
  rideStatus: 'idle', // 'idle', 'searching', 'booked', 'completed'

  // --- ACTIONS ---
  setPickup: (location) => set({ pickupLocation: location }),
  setDropoff: (location) => set({ dropoffLocation: location }),
  setRideType: (type) => set({ selectedRideType: type }),
  setRideStatus: (status) => set({ rideStatus: status }),
  
  // Resets the core flow without touching the Chaos toggle
  resetBooking: () => set({
    pickupLocation: null,
    dropoffLocation: null,
    selectedRideType: null,
    rideStatus: 'idle'
  })
}));