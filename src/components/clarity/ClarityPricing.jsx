import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

// Haversine fallback for instant pricing while teammate's map API loads
const calculateEstimatedDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return 0;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return (R * c) * 1.3; 
};

export default function ClarityPricing() {
  const { distance, selectedRideType, setRideType, pickupLocation, dropoffLocation } = useAppStore();

  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // 1. THE ZERO-STATE NULL RENDER
  // If either location is missing, render nothing. Let the map take the screen.
  const hasBothLocations = pickupLocation?.coords && dropoffLocation?.coords;

  // 2. THE LIVE CALCULATION SHIMMER
  // Whenever locations change, simulate a live network request to "find drivers"
  useEffect(() => {
    if (hasBothLocations) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        setIsCalculating(false);
      }, 1200); // 1.2s delay feels like a real API call
      return () => clearTimeout(timer);
    }
  }, [pickupLocation, dropoffLocation, hasBothLocations]);

  if (!hasBothLocations) return null;

  const estimatedDistance = calculateEstimatedDistance(pickupLocation.coords, dropoffLocation.coords);
  const activeDistance = distance > 0 ? distance : estimatedDistance; 
  const safeDistance = Math.max(activeDistance, 1); 

  const rides = [
    { id: 'mini', base: 50, perKm: 14, name: 'Economy Mini', time: '2 min', capacity: 4 },
    { id: 'sedan', base: 70, perKm: 18, name: 'Comfort Sedan', time: '5 min', capacity: 4 },
    { id: 'suv', base: 100, perKm: 25, name: 'Premium SUV', time: '8 min', capacity: 6 }
  ];

  const calculateFare = (ride) => {
    const rawFare = ride.base + (safeDistance * ride.perKm);
    return rawFare + (rawFare * 0.05); // Include 5% GST automatically
  };

  const formatINR = (amount) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const activeRide = rides.find(r => r.id === selectedRideType) || rides[0];
  const finalPrice = formatINR(calculateFare(activeRide));

  const handleBooking = () => {
    setIsProcessingBooking(true);
    setTimeout(() => {
      setIsProcessingBooking(false);
      setIsBooked(true);
    }, 1500);
  };

  if (isBooked) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-t-3xl p-6 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] mt-4 animate-slide-up relative">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-6"></div>
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Driver Assigned</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{activeRide.name} arriving in {activeRide.time}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsBooked(false)} 
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Slide to view trip details
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.08)] mt-2 pb-safe animate-slide-up border-t border-gray-100 dark:border-gray-800">
      
      {/* 3. NATIVE BOTTOM SHEET DRAG HANDLE */}
      <div className="w-full pt-3 pb-1 flex justify-center cursor-grab">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>

      <div className="px-5 pb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select a ride</h3>

        {/* 2. THE SKELETON LOADER (Simulating Network Latency) */}
        {isCalculating ? (
          <div className="space-y-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          /* THE REAL RIDE OPTIONS */
          <div className="space-y-3 mb-6">
            {rides.map((ride) => {
              const isActive = selectedRideType === ride.id;
              return (
                <button
                  key={ride.id}
                  onClick={() => setRideType(ride.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                    isActive 
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' 
                      : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-600'}`}>
                      {ride.id === 'mini' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {ride.id === 'sedan' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                      {ride.id === 'suv' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                    </div>
                    <div>
                      <h4 className={`font-bold text-[15px] ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                        {ride.name} <span className="text-gray-400 font-normal ml-1">👤 {ride.capacity}</span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ride.time} away • {activeDistance.toFixed(1)} km</p>
                    </div>
                  </div>
                  <div className={`text-lg font-black ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatINR(calculateFare(ride))}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 4. INTEGRATED BUTTON PRICING */}
        <button 
          disabled={isCalculating || isProcessingBooking}
          onClick={handleBooking}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 shadow-md"
        >
          {isProcessingBooking ? (
            <svg className="w-5 h-5 animate-spin text-white dark:text-black" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
          ) : (
            <span>Confirm {activeRide.name.split(' ')[1]} • {finalPrice}</span>
          )}
        </button>
      </div>
    </div>
  );
}