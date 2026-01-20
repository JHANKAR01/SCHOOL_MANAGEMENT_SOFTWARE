
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Sovereign Low Data Hook
 * Reduces API polling, disables high-res images, and batches uploads.
 */
export const useLowDataMode = () => {
  const [isLowData, setIsLowData] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sovereign_low_data');
      if (saved === 'true') {
        setIsLowData(true);
      }
    }
  }, []);

  const toggleLowData = () => {
    setIsLowData(prev => {
      const newState = !prev;
      if (Platform.OS === 'web') {
        localStorage.setItem('sovereign_low_data', String(newState));
      }
      return newState;
    });
  };

  return { isLowData, toggleLowData };
};
