import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useFakeLag } from '../../hooks/useFakeLag';

export default function ChaosLocationInput() {
  // 1. ADDED: pickupLocation and dropoffLocation to the destructuring
  const { setPickup, setDropoff, pickupLocation, dropoffLocation } = useAppStore(); 
  const applyLag = useFakeLag();
  
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [activeField, setActiveField] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [reqPickupAttempts] = useState(() => Math.floor(Math.random() * 3) + 2);
  const [reqDropoffAttempts] = useState(() => Math.floor(Math.random() * 3) + 2);
  const [pickupAttempts, setPickupAttempts] = useState(0);
  const [dropoffAttempts, setDropoffAttempts] = useState(0);

  const trapTraumaCenter = [
    { address: 'Wagah Border, Punjab', coords: [31.6042, 74.5723] },
    { address: 'Thar Desert, Rajasthan', coords: [26.9157, 70.9083] },
    { address: 'Rohtang Pass, Himalayas', coords: [32.3716, 77.2466] },
    { address: 'Kanyakumari View Point', coords: [8.0883, 77.5385] },
    { address: 'Ditch on Mumbai-Pune Expressway', coords: [18.8260, 73.3950] }
  ];

  const baseSuccessCoords = [12.9716, 77.5946]; 

  // 2. ADDED: Sync global Pickup to local Chaos text
  useEffect(() => {
    if (pickupLocation?.address && pickupLocation.address !== pickupText) {
      setPickupText(pickupLocation.address);
    }
  }, [pickupLocation]);

  // 3. ADDED: Sync global Dropoff to local Chaos text
  useEffect(() => {
    if (dropoffLocation?.address && dropoffLocation.address !== dropoffText) {
      setDropoffText(dropoffLocation.address);
    }
  }, [dropoffLocation]);

  const handleSearch = (field, text) => {
    if (field === 'pickup') setPickupText(text);
    if (field === 'dropoff') setDropoffText(text);
    
    if (text.length > 2) {
      setActiveField(field);
      setIsSearching(true);
      setShowSuggestions(true);
      applyLag(() => setIsSearching(false), 800, 1500);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (field, typedText) => {
    let currentAttempts = field === 'pickup' ? pickupAttempts : dropoffAttempts;
    let targetAttempts = field === 'pickup' ? reqPickupAttempts : reqDropoffAttempts;
    let finalPayload;

    if (currentAttempts < targetAttempts) {
      finalPayload = trapTraumaCenter[Math.floor(Math.random() * trapTraumaCenter.length)];
    } else {
      const jitterLat = baseSuccessCoords[0] + (Math.random() * 0.05 - 0.025);
      const jitterLng = baseSuccessCoords[1] + (Math.random() * 0.05 - 0.025);
      finalPayload = { address: typedText, coords: [jitterLat, jitterLng] };
    }

    if (field === 'pickup') {
      setPickupText(finalPayload.address);
      setPickup(finalPayload);
      setPickupAttempts(prev => prev + 1);
    } else {
      setDropoffText(finalPayload.address);
      setDropoff(finalPayload);
      setDropoffAttempts(prev => prev + 1);
    }
    
    setShowSuggestions(false);
    setActiveField(null);
  };

  return (
    <div className="w-full mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 relative mb-6 border border-gray-100 z-[2000] transition-all">
      <div className="absolute left-9 top-12 bottom-12 w-[2px] bg-gray-100 flex flex-col items-center justify-between py-2">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <div className="w-2 h-2 rounded-none bg-black"></div>
      </div>

      <div className="space-y-4 ml-8">
        <input 
          type="text"
          value={pickupText}
          onChange={(e) => handleSearch('pickup', e.target.value)}
          onFocus={() => { if (pickupText.length > 2) setShowSuggestions(true); setActiveField('pickup'); }}
          placeholder="Current Location"
          className={`w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 outline-none transition-all ${pickupAttempts > 0 && pickupAttempts < reqPickupAttempts ? 'text-red-600 bg-red-50' : ''}`}
        />
        <input 
          type="text"
          value={dropoffText}
          onChange={(e) => handleSearch('dropoff', e.target.value)}
          onFocus={() => { if (dropoffText.length > 2) setShowSuggestions(true); setActiveField('dropoff'); }}
          placeholder="Where to?"
          className={`w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:bg-white focus:border-black outline-none transition-all ${dropoffAttempts > 0 && dropoffAttempts < reqDropoffAttempts ? 'text-red-600 bg-red-50' : ''}`}
        />
      </div>

      {showSuggestions && activeField && (
        <div className="absolute top-[110%] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[3000] animate-fade-in">
          {isSearching ? (
             <div className="p-5 flex items-center justify-center gap-3 text-gray-400">
               <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
               <span className="text-sm font-semibold">Indexing coordinates...</span>
             </div>
          ) : (
            <div>
              {[
                { title: activeField === 'pickup' ? pickupText : dropoffText, sub: "Exact coordinate match" },
                { title: `${activeField === 'pickup' ? pickupText : dropoffText} Main Gate`, sub: "Suggested pickup point" },
                { title: `${activeField === 'pickup' ? pickupText : dropoffText} Block A`, sub: "High demand zone" }
              ].map((sug, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSelectSuggestion(activeField, activeField === 'pickup' ? pickupText : dropoffText)}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 border-b border-gray-50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                     <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{sug.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">{sug.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}