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
  
  // NEW: Track explicit user consent
  const [hasSelected, setHasSelected] = useState(false);

  const hasBothLocations = pickupLocation?.coords && dropoffLocation?.coords;

  useEffect(() => {
    if (hasBothLocations) {
      setIsCalculating(true);
      setHasSelected(false); // Reset selection when locations change
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
    { id: 'mini', base: 50, perKm: 14, name: 'Mini', time: '2 min', capacity: 4 },
    { id: 'sedan', base: 70, perKm: 18, name: 'Sedan', time: '5 min', capacity: 4 },
    { id: 'suv', base: 100, perKm: 25, name: 'SUV', time: '8 min', capacity: 6 }
  ];

  const calculateFare = (ride) => {
    const rawFare = ride.base + (safeDistance * ride.perKm);
    return rawFare + (rawFare * 0.05); 
  };

  const formatINR = (amount) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const activeRide = rides.find(r => r.id === selectedRideType) || rides[0];
  const finalPrice = formatINR(calculateFare(activeRide));

  const handleBooking = () => {
    if (!hasSelected) return; // Failsafe
    setIsProcessingBooking(true);
    setTimeout(() => {
      setIsProcessingBooking(false);
      setIsBooked(true);
    }, 1500);
  };

  if (isBooked) {
    return (
      <div className="w-full mt-2 animate-slide-up pb-2">
        
        {/* TOP STATUS BAR & OTP */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Arriving in <span className="text-blue-600 dark:text-blue-500">3 mins</span></h3>
            <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Your {activeRide.name} is on the way</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl text-center border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">OTP</p>
            <p className="text-xl font-black text-gray-900 dark:text-white tracking-widest">5924</p>
          </div>
        </div>

        {/* DRIVER & VEHICLE CARD */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-4 mb-4 border border-gray-100 dark:border-gray-800/80">
          <div className="flex justify-between items-center">
            
            {/* Driver Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-white dark:border-gray-900 shadow-sm">
                  {/* Mock Driver Photo (SVG Placeholder) */}
                  <svg className="w-full h-full text-gray-400 dark:text-gray-500 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div className="absolute -bottom-2 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                  <div className="bg-blue-100 dark:bg-blue-900/50 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    <svg className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">4.9</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-black text-[17px] text-gray-900 dark:text-white">Ramesh K.</h4>
                <p className="text-[13px] text-gray-500 font-medium mt-0.5">Suzuki Dzire • White</p>
              </div>
            </div>

            {/* Indian License Plate */}
            <div className="bg-[#FCD116] border-2 border-gray-900 rounded-lg px-2 py-1 text-center shadow-sm shrink-0">
              <p className="text-[8px] font-bold text-gray-900 uppercase tracking-widest leading-none mb-0.5 opacity-80">IND</p>
              <p className="text-[13px] font-black text-gray-900 tracking-wider leading-none">KA 03 AB 0613</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex gap-3 mb-6">
          <button className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
            </div>
            <span className="font-bold text-[14px]">Call</span>
          </button>
          
          <button className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center relative">
              <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-700 rounded-full"></div>
            </div>
            <span className="font-bold text-[14px]">Message</span>
          </button>
        </div>

        {/* SAFETY & CANCEL TRAY */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5 px-1">
          <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
            <span className="font-bold text-[13px]">Share Status</span>
          </button>
          
          <button 
            onClick={() => setIsBooked(false)}
            className="font-bold text-[13px] text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Cancel Ride
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="w-full mt-5 animate-slide-up pb-2">
      
      <h3 className="text-[17px] font-black text-gray-900 dark:text-white mb-3 px-1">Choose a ride</h3>

      {isCalculating ? (
        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-[76px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-6 relative">
          {rides.map((ride) => {
            // Only show it as active if they have actually clicked something
            const isActive = hasSelected && selectedRideType === ride.id;
            
            return (
              <button
                key={ride.id}
                onClick={() => {
                  setRideType(ride.id);
                  setHasSelected(true); // User explicitly consented
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left ${
                  isActive 
                    ? 'border-black dark:border-white bg-gray-50/50 dark:bg-gray-800/50' 
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center shrink-0 transition-opacity ${hasSelected && !isActive ? 'opacity-40' : 'opacity-100'}`}>
                    {ride.id === 'mini' && <svg className="w-8 h-8 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>}
                    {ride.id === 'sedan' && <svg className="w-9 h-9 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>}
                    {ride.id === 'suv' && <svg className="w-10 h-10 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>}
                  </div>
                  <div className={`transition-opacity ${hasSelected && !isActive ? 'opacity-40' : 'opacity-100'}`}>
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
                <div className={`text-[17px] font-black transition-opacity ${hasSelected && !isActive ? 'opacity-40 text-gray-500' : 'text-gray-900 dark:text-white opacity-100'}`}>
                  {formatINR(calculateFare(ride))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* DYNAMIC CTA BUTTON */}
      <button 
        disabled={isCalculating || isProcessingBooking || !hasSelected}
        onClick={handleBooking}
        className={`w-full font-bold text-[17px] py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
          !hasSelected 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
            : 'bg-black dark:bg-white text-white dark:text-black active:scale-[0.98] shadow-lg'
        } disabled:active:scale-100`}
      >
        {isProcessingBooking ? (
          <svg className="w-5 h-5 animate-spin text-white dark:text-black" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
        ) : (
          <span>{!hasSelected ? 'Select a ride to continue' : `Confirm ${activeRide.name}`}</span>
        )}
      </button>
      
    </div>
  );
}