import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';

// THE OFFLINE EDGE DATABASE
const BANGALORE_DB = [
  { title: "UB City", subtitle: "Vittal Mallya Road, Bengaluru", coords: [12.9711, 77.5966] },
  { title: "Mantri Square Mall", subtitle: "Malleswaram, Bengaluru", coords: [12.9911, 77.5709] },
  { title: "Orion Mall", subtitle: "Rajajinagar, Bengaluru", coords: [13.0110, 77.5548] },
  { title: "Manyata Tech Park", subtitle: "Nagavara, Bengaluru", coords: [13.0450, 77.6205] },
  { title: "Bagmane Tech Park", subtitle: "CV Raman Nagar, Bengaluru", coords: [12.9784, 77.6628] },
  { title: "KSR Bengaluru Railway Station", subtitle: "Majestic, Bengaluru", coords: [12.9781, 77.5695] },
  { title: "Yeshwanthpur Railway Station", subtitle: "Yeshwanthpur, Bengaluru", coords: [13.0234, 77.5503] },
  { title: "Kempegowda International Airport", subtitle: "Devanahalli, Bengaluru", coords: [13.1986, 77.7066] },
  { title: "Indiranagar Metro Station", subtitle: "CMH Road, Bengaluru", coords: [12.9783, 77.6387] },
  { title: "MG Road Metro Station", subtitle: "MG Road, Bengaluru", coords: [12.9755, 77.6060] },
  { title: "Lalbagh Botanical Garden", subtitle: "Mavalli, Bengaluru", coords: [12.9507, 77.5848] },
  { title: "Cubbon Park", subtitle: "Kasturba Road, Bengaluru", coords: [12.9779, 77.5952] },
  { title: "Bengaluru Palace", subtitle: "Vasanth Nagar, Bengaluru", coords: [12.9988, 77.5921] },
  { title: "NIMHANS", subtitle: "Hosur Road, Bengaluru", coords: [12.9382, 77.5938] },
  { title: "RV College of Engineering", subtitle: "Mysore Road, Bengaluru", coords: [12.9239, 77.4997] },
  { title: "UVCE Campus", subtitle: "K.R. Circle, Bengaluru", coords: [12.9749, 77.5896] }
];

export default function ClarityLocation() {
  const { setPickup, setDropoff, pickupLocation, dropoffLocation } = useAppStore();
  
  const [pickupText, setPickupText] = useState(pickupLocation?.address || '');
  const [dropoffText, setDropoffText] = useState(dropoffLocation?.address || '');
  
  const [activeField, setActiveField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [liveSuggestions, setLiveSuggestions] = useState([]); 
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const dropoffInputRef = useRef(null);

  useEffect(() => {
    if (pickupLocation?.address && pickupLocation.address !== pickupText && activeField !== 'pickup') {
      setPickupText(pickupLocation.address);
    }
  }, [pickupLocation, activeField]);

  useEffect(() => {
    if (dropoffLocation?.address && dropoffLocation.address !== dropoffText && activeField !== 'dropoff') {
      setDropoffText(dropoffLocation.address);
    }
  }, [dropoffLocation, activeField]);

  useEffect(() => {
    const handleFocusDropoff = () => {
      if (dropoffInputRef.current) dropoffInputRef.current.focus();
    };
    window.addEventListener('focus-dropoff', handleFocusDropoff);
    return () => window.removeEventListener('focus-dropoff', handleFocusDropoff);
  }, []);

  useEffect(() => {
    setLiveSuggestions([
      BANGALORE_DB[7], // Airport
      BANGALORE_DB[8], // Indiranagar Metro
      BANGALORE_DB[15] // UVCE
    ]);
  }, []);

  const executeSearch = async (query) => {
    setIsSearching(true);
    const lowerQuery = query.toLowerCase();

    const localResults = BANGALORE_DB.filter(place => 
      place.title.toLowerCase().includes(lowerQuery) || 
      place.subtitle.toLowerCase().includes(lowerQuery)
    ).slice(0, 4);

    if (localResults.length > 0) {
      setSuggestions(localResults);
      setIsSearching(false);
      return; 
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); 

      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=12.9716&lon=77.5946&limit=4`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API Offline");
      
      const data = await res.json();
      const formattedSuggestions = (data.features || []).map(item => ({
        title: item.properties.name || item.properties.street || item.properties.district,
        subtitle: [item.properties.district, item.properties.city, item.properties.state].filter(Boolean).join(', '),
        coords: [item.geometry.coordinates[1], item.geometry.coordinates[0]] 
      })).filter(sug => sug.title); 
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      setSuggestions([]); 
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field, text) => {
    if (field === 'pickup') {
      setPickupText(text);
      if (text.trim() === '') setPickup(null); 
    }
    if (field === 'dropoff') {
      setDropoffText(text);
      if (text.trim() === '') setDropoff(null); 
    }
    
    setActiveField(field);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    const query = text.trim();
    if (query.length >= 2) {
      setIsSearching(true);
      typingTimeoutRef.current = setTimeout(() => executeSearch(query), 300); 
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = (targetField = 'pickup') => {
    window.dispatchEvent(new Event('show-map')); 
    setIsLocating(true);
    
    setTimeout(() => {
      const mockLat = 12.9749;
      const mockLng = 77.5896;
      const cleanAddress = "UVCE Campus, K.R. Circle";
      
      window.__tempMapTitle = cleanAddress; 
      if (targetField === 'pickup') setPickupText(cleanAddress);
      else setDropoffText(cleanAddress);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('fly-to-suggestion', { detail: { coords: [mockLat, mockLng] } }));
      }, 100);
      setIsLocating(false);
    }, 600);
  };

  const handleSelectSuggestion = (suggestion) => {
    window.dispatchEvent(new Event('show-map')); 
    window.__tempMapTitle = suggestion.title; 
    
    if (activeField === 'pickup') {
      setPickupText(suggestion.title);
      setPickup({ address: suggestion.title, coords: suggestion.coords });
      // Only auto-focus dropoff if it's currently empty
      if (!dropoffLocation) setTimeout(() => window.dispatchEvent(new Event('focus-dropoff')), 150);
    } else {
      setDropoffText(suggestion.title);
      setDropoff({ address: suggestion.title, coords: suggestion.coords });
    }
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('fly-to-suggestion', { detail: { coords: suggestion.coords } }));
    }, 100);
    
    setSuggestions([]);
    setActiveField(null);
  };

  const handleChooseOnMap = (field) => {
    window.dispatchEvent(new Event('show-map')); 
    if (field === 'pickup') { setPickupText('Selecting on map...'); setPickup(null); } 
    else { setDropoffText('Selecting on map...'); setDropoff(null); }
    setSuggestions([]);
    setActiveField(null);
  };

  const handleBlur = () => setTimeout(() => setActiveField(null), 150);

  const showList = (!pickupLocation || !dropoffLocation || activeField);
  const listTitle = isSearching 
    ? "Searching..." 
    : (suggestions.length > 0 ? "Search Results" : "Suggested Destinations");
    
  const listItems = suggestions.length > 0 ? suggestions : liveSuggestions;

  return (
    <div className="w-full relative z-[99999] isolate">
      
      <div className="relative w-full">
        <div className="absolute left-[22px] top-[26px] bottom-[26px] w-[2px] bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-between z-10 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 ring-4 ring-white dark:ring-gray-900 mt-1"></div>
          <div className="w-2 h-2 bg-black dark:bg-white ring-4 ring-white dark:ring-gray-900 mb-1"></div>
        </div>

        <div className="space-y-3 ml-12 relative">
          
          <div className="relative flex items-center bg-gray-100/70 dark:bg-gray-800/50 rounded-2xl transition-colors focus-within:bg-gray-100 dark:focus-within:bg-gray-800">
            <input 
              type="text"
              value={pickupText}
              onChange={(e) => handleInputChange('pickup', e.target.value)}
              onFocus={() => { setActiveField('pickup'); handleInputChange('pickup', pickupText); }}
              onBlur={handleBlur}
              placeholder="Current Location"
              className="w-full bg-transparent border-none px-4 py-3.5 text-[15px] font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
            <button 
              onClick={() => handleCurrentLocation('pickup')}
              className="p-3 mr-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0"
            >
              {isLocating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              )}
            </button>
          </div>

          <div className="relative bg-gray-100/70 dark:bg-gray-800/50 rounded-2xl transition-colors focus-within:bg-gray-100 dark:focus-within:bg-gray-800">
            <input 
              ref={dropoffInputRef}
              type="text"
              value={dropoffText}
              onChange={(e) => handleInputChange('dropoff', e.target.value)}
              onFocus={() => { setActiveField('dropoff'); handleInputChange('dropoff', dropoffText); }}
              onBlur={handleBlur}
              /* REMOVED DISABLED LOCK HERE */
              placeholder="Where to?"
              className="w-full bg-transparent border-none px-4 py-3.5 text-[15px] font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
          </div>

        </div>
      </div>

      {showList && (
        <div className="mt-6 ml-1 animate-fade-in pb-2">
          <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">
            {listTitle}
          </h4>
          
          <div className="space-y-1">
            
            {activeField && !isSearching && (
              <button 
                onMouseDown={(e) => { e.preventDefault(); handleChooseOnMap(activeField); }}
                className="w-full flex items-center gap-4 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                   <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="border-b border-gray-100 dark:border-gray-800/50 pb-3 flex-1 pt-1">
                  <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">Choose on map</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">Drop a pin manually</p>
                </div>
              </button>
            )}

            {isSearching ? (
               <div className="px-5 py-6 flex items-center justify-center gap-3 text-gray-400">
                 <svg className="w-5 h-5 animate-spin text-black dark:text-white" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-80"></path></svg>
               </div>
            ) : (
              listItems.map((place, idx) => (
                <button 
                  key={idx}
                  onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(place); }}
                  className="w-full flex items-center gap-4 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    {/* UNIFORM LOCATION MAP PIN ICON */}
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  </div>
                  <div className={`border-b border-gray-100 dark:border-gray-800/50 pb-3 flex-1 pt-1 ${idx === listItems.length - 1 ? 'border-transparent' : ''}`}>
                    <h4 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{place.title}</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5 truncate">{place.subtitle}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}