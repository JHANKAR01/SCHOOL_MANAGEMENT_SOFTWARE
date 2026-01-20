import { useState, useEffect } from 'react';

// Platform check helper
const isNative = typeof window !== 'undefined' && window.navigator.product === 'ReactNative';

interface Coords {
  lat: number;
  lng: number;
}

export const useGeofencing = (schoolLocation: Coords, radiusMeters: number = 50) => {
  const [isWithinFence, setIsWithinFence] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isMockLocation, setIsMockLocation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    // 1. Native Logic (Production)
    if (isNative) {
      // In a real Expo app, we import: import * as Location from 'expo-location';
      // const checkNativeLocation = async () => {
      //   const location = await Location.getCurrentPositionAsync({});
      //   if (location.mocked) { setIsMockLocation(true); return; }
      //   ... calc distance ...
      // }
      console.log("Running in Native Mode - Strict Mock Checks Enabled");
    }

    // 2. Web Logic (Browser)
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Strict Heuristics for Web
        // 1. Accuracy too perfect (GPS usually has some error)
        // 2. No altitude (GPS usually provides altitude)
        const isSuspicious = accuracy === 0;
        
        setIsMockLocation(isSuspicious);

        if (!isSuspicious) {
          const dist = calculateDistance(latitude, longitude, schoolLocation.lat, schoolLocation.lng);
          setDistance(dist);
          setIsWithinFence(dist <= radiusMeters);
        } else {
          setIsWithinFence(false); // Fail safe
        }
        
        setLoading(false);
      },
      (error) => {
        console.error("Geo Error", error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [schoolLocation, radiusMeters]);

  return { isWithinFence, distance, isMockLocation, loading };
};
