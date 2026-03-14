import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { useAppStore } from '../../store/appStore';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterControl({ map, isRouting }) {
  const { setPickup, setDropoff, pickupLocation } = useAppStore();

  if (!map) return null;
  
  const handleRecenter = (e) => {
    e.preventDefault();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          map.flyTo([lat, lng], 16, { animate: true, duration: 1 });
          
          // Auto-resolve GPS directly to store
          const payload = { address: "Current Location", coords: [lat, lng] };
          if (!pickupLocation) {
            setPickup(payload);
            setTimeout(() => window.dispatchEvent(new Event('focus-dropoff')), 150);
          } else {
            setDropoff(payload);
          }
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <button 
      onClick={handleRecenter}
      className={`absolute right-4 z-[1000] bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 active:scale-95 ${isRouting ? 'bottom-[350px]' : 'bottom-10 md:bottom-[350px]'}`}
      title="Locate Me"
    >
      <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export default function AccurateMap() {
  const { pickupLocation, dropoffLocation, setPickup, setDropoff, setDistance } = useAppStore();
  const [map, setMap] = useState(null); 
  
  const [routePath, setRoutePath] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  
  const isRouting = !!(pickupLocation && dropoffLocation);
  
  // Use a ref to track active field without causing stale closures in timeouts
  const pickupRef = useRef(pickupLocation);
  useEffect(() => { pickupRef.current = pickupLocation; }, [pickupLocation]);

  useEffect(() => {
    if (map) setTimeout(() => { map.invalidateSize(); }, 300);
  }, [map]);

  // THE MAGIC AUTO-RESOLVE ENGINE
  useEffect(() => {
    if (!map || isRouting) return;

    let timeoutId;
    let abortController = new AbortController();

    const handleDragStart = () => {
      setIsDragging(true);
      setIsResolving(false);
      clearTimeout(timeoutId);
      abortController.abort(); // Cancel any pending API fetches if they drag again
      abortController = new AbortController();
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      
      // Debounce: Wait 700ms after they stop dragging before locking it in
      timeoutId = setTimeout(async () => {
        setIsResolving(true);
        const center = map.getCenter();
        let cleanAddress = "Pinned Location";

        try {
          // Fallback Architecture for reverse geocoding
          const res = await fetch(`https://photon.komoot.io/reverse?lon=${center.lng}&lat=${center.lat}`, {
            signal: abortController.signal
          });
          const data = await res.json();
          const props = data.features?.[0]?.properties;
          
          if (props?.name || props?.street || props?.district) {
            cleanAddress = props.name || props.street || props.district;
          } else throw new Error("Empty data");
        } catch (error) {
          if (error.name === 'AbortError') return; // Ignore if aborted by another drag
          
          try {
            const res2 = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`, {
              signal: abortController.signal
            });
            const data2 = await res2.json();
            cleanAddress = data2.address?.road || data2.address?.suburb || data2.display_name?.split(',')[0] || "Pinned Location";
          } catch (fallbackError) {}
        }

        // Lock the address into global state
        const payload = { address: cleanAddress, coords: [center.lat, center.lng] };
        
        if (!pickupRef.current) {
          setPickup(payload);
          setTimeout(() => window.dispatchEvent(new Event('focus-dropoff')), 150);
        } else {
          setDropoff(payload);
        }

        setIsResolving(false);
      }, 700); 
    };

    const handleFly = (e) => {
      if (e.detail?.coords) map.flyTo(e.detail.coords, 16, { animate: true, duration: 1.2 });
    };

    window.addEventListener('fly-to-suggestion', handleFly);
    map.on('dragstart', handleDragStart);
    map.on('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('fly-to-suggestion', handleFly);
      map.off('dragstart', handleDragStart);
      map.off('dragend', handleDragEnd);
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [map, isRouting, setPickup, setDropoff]);

  // OSRM ROUTING DRAWING
  useEffect(() => {
    if (isRouting && map) {
      const fetchRoute = async () => {
        try {
          const pLng = pickupLocation.coords[1], pLat = pickupLocation.coords[0];
          const dLng = dropoffLocation.coords[1], dLat = dropoffLocation.coords[0];
          
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson`);
          const data = await res.json();
          
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            setRoutePath(coords);
            setDistance(route.distance / 1000);
            
            map.fitBounds(coords, { paddingBottomRight: [40, 300], paddingTopLeft: [40, 40], animate: true, duration: 1 });
          }
        } catch (error) {
          console.error("OSRM Routing failed:", error);
        }
      };
      fetchRoute();
    } else {
      setRoutePath([]);
      setDistance(0);
    }
  }, [pickupLocation, dropoffLocation, setDistance, isRouting, map]);

  return (
    <div className="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-900 overflow-hidden z-0 pointer-events-auto">
      
      <MapContainer 
        ref={setMap}
        center={[12.9716, 77.5946]} 
        zoom={14} 
        zoomControl={false} 
        dragging={!isRouting}
        touchZoom={!isRouting}
        scrollWheelZoom={!isRouting}
        doubleClickZoom={!isRouting}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; OSM'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
        />
        
        {isRouting && pickupLocation && <Marker position={pickupLocation.coords} />}
        {isRouting && dropoffLocation && <Marker position={dropoffLocation.coords} />}
        {isRouting && routePath.length > 0 && (
          <Polyline positions={routePath} pathOptions={{ color: '#000000', weight: 4, lineCap: 'round', lineJoin: 'round' }} />
        )}
      </MapContainer>

      {/* THE DYNAMIC CENTER PIN */}
      {!isRouting && (
        <div className={`absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-[1000] drop-shadow-xl transition-transform duration-200 ease-out ${isDragging ? '-translate-y-[120%] scale-110' : ''}`}>
          <svg className="w-11 h-11 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          
          {/* Processing Spinner attached to Pin */}
          {isResolving && (
            <div className="absolute -right-3 -top-2 bg-white dark:bg-black rounded-full shadow-lg p-1 border border-gray-100 dark:border-gray-800 animate-fade-in">
               <svg className="w-4 h-4 animate-spin text-black dark:text-white" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-80"></path></svg>
            </div>
          )}
        </div>
      )}

      {/* FLOATING STATUS BADGE */}
      {!isRouting && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl text-xs font-bold tracking-wide text-white border border-gray-700/50 transition-all duration-300">
          {isResolving ? 'Finding address...' : `Drag map to set ${!pickupLocation ? 'Pickup' : 'Dropoff'}`}
        </div>
      )}

      <RecenterControl map={map} isRouting={isRouting} />

    </div>
  );
}