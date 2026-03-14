import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

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

export default function TransparentPricing() {
  const { distance, selectedRideType, setRideType, pickupLocation, dropoffLocation } = useAppStore();

  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const hasBothLocations = pickupLocation?.coords && dropoffLocation?.coords;

  useEffect(() => {
    if (hasBothLocations) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        setIsCalculating(false);
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [pickupLocation, dropoffLocation, hasBothLocations]);

  if (!hasBothLocations) return null;

  const estimatedDistance = calculateEstimatedDistance(pickupLocation.coords, dropoffLocation.coords);
  const activeDistance = distance > 0 ? distance : estimatedDistance; 
  const safeDistance = Math.max(activeDistance, 1); 

  const rides = [
    { id: 'mini', base: 50, perKm: 14, name: 'Uber Go', time: '2 min', capacity: 4 },
    { id: 'sedan', base: 70, perKm: 18, name: 'Premier', time: '5 min', capacity: 4 },
    { id: 'suv', base: 100, perKm: 25, name: 'Uber XL', time: '8 min', capacity: 6 }
  ];

  const calculateFare = (ride) => {
    const rawFare = ride.base + (safeDistance * ride.perKm);
    return rawFare + (rawFare * 0.05); 
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
      <div className="w-full mt-6 animate-fade-in text-center pb-4">
        <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <svg className="w-8 h-8 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Driver Confirmed</h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">Your {activeRide.name} is arriving shortly.</p>
        <button 
          onClick={() => setIsBooked(false)} 
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          View Trip Details
        </button>
      </div>
    );
  }

  return (
    // Notice how all the bg-white, padding, and rounded-t-3xl classes are GONE.
    <div className="w-full mt-5 animate-slide-up pb-2">
      
      <h3 className="text-[17px] font-black text-gray-900 dark:text-white mb-3 px-1">Choose a ride</h3>

      {isCalculating ? (
        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-[76px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {rides.map((ride) => {
            const isActive = selectedRideType === ride.id;
            return (
              <button
                key={ride.id}
                onClick={() => setRideType(ride.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left ${
                  isActive 
                    ? 'border-black dark:border-white bg-gray-50/50 dark:bg-gray-800/50' 
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    {/* Cleaned up SVGs without the bulky circular background */}
                    {ride.id === 'mini' && <svg className="w-8 h-8 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>}
                    {ride.id === 'sedan' && <svg className="w-9 h-9 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>}
                    {ride.id === 'suv' && <svg className="w-10 h-10 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>}
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-gray-900 dark:text-white flex items-center gap-2">
                      {ride.name} 
                      <span className="text-gray-400 dark:text-gray-500 text-xs font-normal flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        {ride.capacity}
                      </span>
                    </h4>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{ride.time} dropoff</p>
                  </div>
                </div>
                <div className="text-[17px] font-black text-gray-900 dark:text-white">
                  {formatINR(calculateFare(ride))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* SOLID BLACK CTA BUTTON */}
      <button 
        disabled={isCalculating || isProcessingBooking}
        onClick={handleBooking}
        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold text-[17px] py-4 rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
      >
        {isProcessingBooking ? (
          <svg className="w-5 h-5 animate-spin text-white dark:text-black" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
        ) : (
          <span>Confirm {activeRide.name}</span>
        )}
      </button>
      
    </div>
  );
}