import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';

export default function ClarityLocation() {
  const { setPickup, setDropoff, pickupLocation, dropoffLocation } = useAppStore();
  
  const [pickupText, setPickupText] = useState(pickupLocation?.address || '');
  const [dropoffText, setDropoffText] = useState(dropoffLocation?.address || '');
  
  const [activeField, setActiveField] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
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

  const handleCurrentLocation = (targetField = 'pickup') => {
    window.dispatchEvent(new Event('show-map')); 
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let cleanAddress = "Current Location";
          
          try {
            const res = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`);
            const data = await res.json();
            const props = data.features?.[0]?.properties;
            if (props?.name || props?.street || props?.district) cleanAddress = props.name || props.street || props.district;
          } catch (error) {
            try {
              const res2 = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data2 = await res2.json();
              cleanAddress = data2.address?.road || data2.address?.suburb || data2.display_name?.split(',')[0] || "Pinned Location";
            } catch (fallbackError) {}
          } finally {
            window.__tempMapTitle = cleanAddress; 
            if (targetField === 'pickup') setPickupText(cleanAddress);
            else setDropoffText(cleanAddress);
            
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('fly-to-suggestion', { detail: { coords: [lat, lng] } }));
            }, 100);
            setIsLocating(false);
          }
        },
        (error) => {
          alert("Please enable location services to use this feature.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=12.9716&lon=77.5946&limit=4`);
      const data = await res.json();
      const formattedSuggestions = data.features.map(item => ({
        title: item.properties.name || item.properties.street || item.properties.district,
        subtitle: [item.properties.district, item.properties.city, item.properties.state].filter(Boolean).join(', '),
        coords: [item.geometry.coordinates[1], item.geometry.coordinates[0]] 
      })).filter(sug => sug.title); 
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
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    if (text.length >= 3) {
      setIsSearching(true);
      typingTimeoutRef.current = setTimeout(() => fetchSuggestions(text), 400); 
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    window.dispatchEvent(new Event('show-map')); 
    window.__tempMapTitle = suggestion.title; 
    
    if (activeField === 'pickup') setPickupText(suggestion.title);
    else setDropoffText(suggestion.title);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('fly-to-suggestion', { detail: { coords: suggestion.coords } }));
    }, 100);
    
    setSuggestions([]);
    setActiveField(null);
  };

  const handleQuickSelect = (title, coords) => {
    window.dispatchEvent(new Event('show-map')); 
    window.__tempMapTitle = title; 
    
    if (!pickupLocation) {
      setPickupText(title);
      setPickup({ address: title, coords });
      setTimeout(() => window.dispatchEvent(new Event('focus-dropoff')), 150);
    } else {
      setDropoffText(title);
      setDropoff({ address: title, coords });
      setActiveField(null); // Clear active field when booking is ready
    }
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('fly-to-suggestion', { detail: { coords } }));
    }, 100);
  };

  const handleChooseOnMap = (field) => {
    window.dispatchEvent(new Event('show-map')); 
    if (field === 'pickup') { setPickupText('Selecting on map...'); setPickup(null); } 
    else { setDropoffText('Selecting on map...'); setDropoff(null); }
    setSuggestions([]);
    setActiveField(null);
  };

  const handleBlur = () => setTimeout(() => setActiveField(null), 150);

  return (
    <div className="w-full relative z-50">
      
      {/* 1. NEW: ISOLATED INPUT WRAPPER */}
      {/* This prevents the absolute line from stretching over the saved places */}
      <div className="relative w-full">
        
        {/* The Connection Line */}
        <div className="absolute left-[22px] top-[26px] bottom-[26px] w-[2px] bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-between z-10 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 ring-4 ring-white dark:ring-gray-900 mt-1"></div>
          <div className="w-2 h-2 bg-black dark:bg-white ring-4 ring-white dark:ring-gray-900 mb-1"></div>
        </div>

        <div className="space-y-3 ml-12 relative">
          
          {/* Pickup Input */}
          <div className="relative flex items-center bg-gray-100/70 dark:bg-gray-800/50 rounded-2xl transition-colors focus-within:bg-gray-100 dark:focus-within:bg-gray-800">
            <input 
              type="text"
              value={pickupText}
              onChange={(e) => handleInputChange('pickup', e.target.value)}
              onFocus={() => { setActiveField('pickup'); if (pickupText.length >= 3) fetchSuggestions(pickupText); }}
              onBlur={handleBlur}
              placeholder="Current Location"
              className="w-full bg-transparent border-none px-4 py-3.5 text-[15px] font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
            <button 
              onClick={() => handleCurrentLocation('pickup')}
              className="p-3 mr-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0"
              title="Locate me"
            >
              {isLocating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              )}
            </button>
          </div>

          {/* Dropoff Input */}
          <div className="relative bg-gray-100/70 dark:bg-gray-800/50 rounded-2xl transition-colors focus-within:bg-gray-100 dark:focus-within:bg-gray-800">
            <input 
              ref={dropoffInputRef}
              type="text"
              value={dropoffText}
              onChange={(e) => handleInputChange('dropoff', e.target.value)}
              onFocus={() => { setActiveField('dropoff'); if (dropoffText.length >= 3) fetchSuggestions(dropoffText); }}
              onBlur={handleBlur}
              disabled={!pickupLocation}
              placeholder={!pickupLocation ? "Where are you starting?" : "Where to?"}
              className={`w-full bg-transparent border-none px-4 py-3.5 text-[15px] font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none ${!pickupLocation ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {activeField && (
            <div className="absolute bottom-[100%] left-[-48px] w-[calc(100%+48px)] mb-4 bg-white dark:bg-gray-900 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-gray-800 overflow-hidden z-[9999] animate-slide-up flex flex-col-reverse py-2">
              <button 
                onMouseDown={(e) => { e.preventDefault(); handleChooseOnMap(activeField); }}
                className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                   <svg className="w-4 h-4 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">Choose on map</h4>
                </div>
              </button>

              {isSearching ? (
                 <div className="px-5 py-6 flex items-center justify-center gap-3 text-gray-400">
                   <svg className="w-5 h-5 animate-spin text-black dark:text-white" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-80"></path></svg>
                 </div>
              ) : (
                suggestions.length > 0 && (
                  <div className="flex flex-col-reverse">
                    {suggestions.map((sug, idx) => (
                      <button 
                        key={idx}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(sug); }}
                        className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                           <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </div>
                        <div className="overflow-hidden border-b border-gray-100 dark:border-gray-800/50 pb-3 flex-1 pt-1">
                          <h4 className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{sug.title}</h4>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{sug.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. FIX: SAVED PLACES RENDER LOGIC */}
      {/* Shows if you haven't typed a search yet AND haven't locked in both locations */}
      {suggestions.length === 0 && (!pickupLocation || !dropoffLocation) && (
        <div className="mt-6 ml-1 animate-fade-in pb-2">
          <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-2">Saved Places</h4>
          
          <div className="space-y-1">
            {/* We use onMouseDown so clicking it fires before the input's onBlur can close the component */}
            <button 
              onMouseDown={(e) => { e.preventDefault(); handleQuickSelect('Hoskote', [13.0731, 77.7981]); }}
              className="w-full flex items-center gap-4 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
              </div>
              <div className="border-b border-gray-100 dark:border-gray-800/50 pb-3 flex-1 pt-1">
                <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">Home</h4>
                <p className="text-[12px] text-gray-500 mt-0.5">Hoskote, Bengaluru</p>
              </div>
            </button>

            <button 
              onMouseDown={(e) => { e.preventDefault(); handleQuickSelect('UVCE K.R. Circle', [12.9749, 77.5896]); }}
              className="w-full flex items-center gap-4 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" /></svg>
              </div>
              <div className="border-b border-transparent pb-3 flex-1 pt-1">
                <h4 className="text-[15px] font-bold text-gray-900 dark:text-white">College</h4>
                <p className="text-[12px] text-gray-500 mt-0.5">UVCE Campus, K.R. Circle</p>
              </div>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}