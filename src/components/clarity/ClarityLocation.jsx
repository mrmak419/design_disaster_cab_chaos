import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';

export default function ClarityLocation() {
  const { setPickup, setDropoff } = useAppStore();
  
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  
  const [activeField, setActiveField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const typingTimeoutRef = useRef(null);

  // --- 1. REVERSE GEOCODING (GPS Coords -> Real Street Name) ---
  const handleCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          try {
            // Fetch the real street name from OpenStreetMap
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            
            // Extract a clean, short address (Road name or Suburb)
            const cleanAddress = data.address?.road || data.address?.suburb || data.display_name.split(',')[0];
            
            setPickupText(cleanAddress);
            setPickup({ address: cleanAddress, coords: [lat, lng] });
          } catch (error) {
            console.error("Geocoding failed", error);
            setPickupText("Current Location");
            setPickup({ address: "Current Location", coords: [lat, lng] });
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          alert("Could not fetch location. Please ensure location services are enabled.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  // --- 2. FORWARD GEOCODING (Typing -> Real Address Suggestions) ---
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Fetch up to 4 results in India, prioritizing Bengaluru area
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=4&countrycodes=in`);
      const data = await res.json();
      
      const formattedSuggestions = data.map(item => ({
        // display_name is usually very long, so we split it to look cleaner
        title: item.display_name.split(',')[0], 
        subtitle: item.display_name.split(',').slice(1, 3).join(',').trim(),
        coords: [parseFloat(item.lat), parseFloat(item.lon)]
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Suggestion fetch failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field, text) => {
    if (field === 'pickup') setPickupText(text);
    if (field === 'dropoff') setDropoffText(text);
    
    setActiveField(field);
    
    // Debounce logic: Wait 500ms after the user stops typing before calling the API
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    if (text.length >= 3) {
      setIsSearching(true);
      typingTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(text);
      }, 500);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    if (activeField === 'pickup') {
      setPickupText(suggestion.title);
      setPickup({ address: suggestion.title, coords: suggestion.coords });
    } else {
      setDropoffText(suggestion.title);
      setDropoff({ address: suggestion.title, coords: suggestion.coords });
    }
    
    setSuggestions([]);
    setActiveField(null);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 relative z-50">
      
      {/* Visual connection line */}
      <div className="absolute left-7 top-10 bottom-10 w-0.5 bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-between py-2">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <div className="w-2 h-2 rounded-none bg-black dark:bg-white"></div>
      </div>

      <div className="space-y-3 ml-8 relative">
        
        {/* Pickup Input with GPS Button */}
        <div className="relative flex items-center gap-2">
          <input 
            type="text"
            value={pickupText}
            onChange={(e) => handleInputChange('pickup', e.target.value)}
            onFocus={() => { if (pickupText.length >= 3) fetchSuggestions(pickupText); setActiveField('pickup'); }}
            placeholder="Pickup location"
            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button 
            onClick={handleCurrentLocation}
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 transition-colors shrink-0"
            title="Use real GPS location"
          >
            {isLocating ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            )}
          </button>
        </div>

        {/* Dropoff Input */}
        <div className="relative">
          <input 
            type="text"
            value={dropoffText}
            onChange={(e) => handleInputChange('dropoff', e.target.value)}
            onFocus={() => { if (dropoffText.length >= 3) fetchSuggestions(dropoffText); setActiveField('dropoff'); }}
            placeholder="Where to?"
            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
        </div>

        {/* --- AUTOCOMPLETE DROPDOWN --- */}
        {suggestions.length > 0 && activeField && (
          <div className="absolute top-[100%] left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[9999] animate-fade-in">
            {isSearching ? (
               <div className="p-4 flex items-center justify-center gap-3 text-gray-500">
                 <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                 <span className="text-xs font-semibold">Searching OpenStreetMap...</span>
               </div>
            ) : (
              <div>
                {suggestions.map((sug, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center shrink-0">
                       <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{sug.title}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{sug.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}