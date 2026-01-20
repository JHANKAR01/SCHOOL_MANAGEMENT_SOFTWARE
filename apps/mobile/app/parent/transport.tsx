import React, { useEffect, useRef } from 'react';
import { useInteraction } from '../../../../packages/app/provider/InteractionContext';

export default function TransportTracking() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const busMarker = useRef<any>(null);
  
  // Connect to global state
  const { buses } = useInteraction();
  
  // Find the assigned bus (Mock: Assuming student is on Route R-01 / Bus 1)
  const assignedBus = buses.find(b => b.routeId === 'R-01') || buses[0];

  // Initialize Map
  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
      // @ts-ignore - Leaflet loaded via CDN in index.html
      const L = window.L;

      const map = L.map(mapRef.current).setView([assignedBus.lat, assignedBus.lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // School Marker
      L.marker([28.6160, 77.2120])
        .addTo(map)
        .bindPopup("Greenwood High School");

      // Bus Icon
      const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        html: '<div style="background-color: #FBBF24; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 16px;">🚌</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      busMarker.current = L.marker([assignedBus.lat, assignedBus.lng], { icon: busIcon }).addTo(map);
      mapInstance.current = map;
    }
  }, []);

  // Sync Map with Live Data
  useEffect(() => {
    if (busMarker.current && mapInstance.current && typeof window !== 'undefined') {
       // @ts-ignore
       const L = window.L;
       const newLatLng = new L.LatLng(assignedBus.lat, assignedBus.lng);
       busMarker.current.setLatLng(newLatLng);
       
       // Only pan if bus is moving to avoid jitter when user drags map
       if (assignedBus.status === 'ON_ROUTE') {
         mapInstance.current.panTo(newLatLng);
       }
    }
  }, [assignedBus.lat, assignedBus.lng]);

  return (
    <div className="flex flex-col h-[400px] bg-gray-100 relative">
      <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg z-[1000] border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Route {assignedBus.routeId}</h2>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${assignedBus.status === 'ON_ROUTE' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <p className="text-xs text-gray-600 font-medium">
                {assignedBus.status === 'ON_ROUTE' ? `Moving • ${assignedBus.speed} km/h` : 'Parked'}
                </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Driver</p>
            <p className="text-sm font-bold text-indigo-900">{assignedBus.driverName}</p>
          </div>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="flex-1 w-full h-full z-0" 
      />
    </div>
  );
}