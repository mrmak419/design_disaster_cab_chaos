import { useEffect, useState } from 'react';
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

function RecenterControl({ map, isRouting, setIsDropoffReady }) {
  if (!map) return null;
  const handleRecenter = (e) => {
    e.preventDefault();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
          window.__tempMapTitle = null; 
          setIsDropoffReady(true);
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <button 
      onClick={handleRecenter}
      className={`absolute right-4 z-[1000] bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 active:scale-95 ${isRouting ? 'bottom-[350px]' : 'bottom-[350px]'}`}
      title="Recenter Map"
    >
      <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function ConfirmLocationControl({ map, activeField, isRouting, isDropoffReady }) {
  const { setPickup, setDropoff } = useAppStore();
  const [isConfirming, setIsConfirming] = useState(false);

  if (isRouting || !map) return null;

  const isDisabled = activeField === 'dropoff' && !isDropoffReady;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (isDisabled) return;
    
    setIsConfirming(true);
    const center = map.getCenter();
    
    try {
      let cleanAddress = window.__tempMapTitle;

      if (!cleanAddress) {
        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lon=${center.lng}&lat=${center.lat}`);
          const data = await res.json();
          const props = data.features?.[0]?.properties;
          if (props?.name || props?.street || props?.district) {
            cleanAddress = props.name || props.street || props.district;
          } else {
            throw new Error("Photon Empty");
          }
        } catch (error) {
          try {
            const res2 = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`);
            const data2 = await res2.json();
            cleanAddress = data2.address?.road || data2.address?.suburb || data2.display_name?.split(',')[0] || "Pinned Location";
          } catch (fallbackError) {
            cleanAddress = "Pinned Location";
          }
        }
      }
      
      const payload = { address: cleanAddress, coords: [center.lat, center.lng] };
      
      if (activeField === 'pickup') {
        setPickup(payload);
        setTimeout(() => {
          window.dispatchEvent(new Event('focus-dropoff'));
        }, 150);
      } else {
        setDropoff(payload);
      }

      window.__tempMapTitle = null; 
    } catch (error) {
      const payload = { address: "Pinned Location", coords: [center.lat, center.lng] };
      if (activeField === 'pickup') {
        setPickup(payload);
        setTimeout(() => window.dispatchEvent(new Event('focus-dropoff')), 150);
      } else {
        setDropoff(payload);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return (
<div className="absolute bottom-[320px] left-1/2 transform -translate-x-1/2 z-[1000] w-11/12 max-w-[300px]">      <button 
        onClick={handleConfirm}
        disabled={isConfirming || isDisabled}
        className={`w-full font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2 ${isDisabled ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-black dark:bg-white text-white dark:text-black disabled:opacity-70'}`}
      >
        {isConfirming ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
            <span>Locking in...</span>
          </>
        ) : (
          <span>{isDisabled ? 'Search or move map...' : `Confirm ${activeField === 'pickup' ? 'Pickup' : 'Dropoff'}`}</span>
        )}
      </button>
    </div>
  );
}

export default function AccurateMap() {
  const { pickupLocation, dropoffLocation, setDistance } = useAppStore();
  const [map, setMap] = useState(null); 
  
  const [routePath, setRoutePath] = useState([]);
  const [isDropoffReady, setIsDropoffReady] = useState(false);
  
  const activeField = !pickupLocation ? 'pickup' : 'dropoff';
  const isRouting = !!(pickupLocation && dropoffLocation);

  useEffect(() => {
    setIsDropoffReady(false);
  }, [pickupLocation]);

  useEffect(() => {
    if (map) setTimeout(() => { map.invalidateSize(); }, 300);
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const handleFly = (e) => {
      if (e.detail?.coords) {
        map.flyTo(e.detail.coords, 16, { animate: true, duration: 1.2 });
        setIsDropoffReady(true); 
      }
    };

    const handleDragStart = () => {
      window.__tempMapTitle = null; 
      setIsDropoffReady(true);
    };

    window.addEventListener('fly-to-suggestion', handleFly);
    map.on('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('fly-to-suggestion', handleFly);
      map.off('dragstart', handleDragStart);
    };
  }, [map]);

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
            
            // Pad the bottom more so the route isn't hidden behind the pricing sheet
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
    // Changed to absolute full-screen
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

      {/* The Pin is adjusted slightly upwards to account for the bottom navbar */}
      {!isRouting && (
        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-[1000] drop-shadow-lg">
          <svg className="w-10 h-10 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      )}

      {!isRouting && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-xs font-bold tracking-wide text-white border border-gray-700">
          Drag map to pin {activeField === 'pickup' ? 'Pickup' : 'Dropoff'}
        </div>
      )}

      <RecenterControl map={map} isRouting={isRouting} setIsDropoffReady={setIsDropoffReady} />
      <ConfirmLocationControl map={map} activeField={activeField} isRouting={isRouting} isDropoffReady={isDropoffReady} />

    </div>
  );
}