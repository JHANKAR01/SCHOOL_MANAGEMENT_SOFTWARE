// shim.js
import * as ReactNative from 'react-native-web';

// 1. Shim for TurboModuleRegistry (required by expo-modules-core)
export const TurboModuleRegistry = {
    getEnforcing: (name) => null,
    get: (name) => null,
};

// 2. Shim for Expo SQLite
export const openDatabaseSync = (name) => {
    console.warn(`[SQLite Shim] Opening dummy database: ${name}`);
    return {
        execSync: () => { },
        runSync: () => { },
        getAllSync: () => [],
        getFirstSync: () => null,
        closeSync: () => { },
        withTransactionSync: (cb) => cb(),
    };
};

export const SQLiteProvider = ({ children }) => children;
export const useSQLiteContext = () => ({
    getAllSync: () => [],
    runSync: () => { },
    execSync: () => { },
});

// 3. Shim for Expo Secure Store (Web Fallback)
export const setItemAsync = async (key, value) => {
    console.log('[SecureStore Shim] Set:', key);
    localStorage.setItem(key, value);
};
export const getItemAsync = async (key) => {
    console.log('[SecureStore Shim] Get:', key);
    return localStorage.getItem(key);
};
export const deleteItemAsync = async (key) => {
    localStorage.removeItem(key);
};

// 4. Shim for Expo Local Authentication
export const hasHardwareAsync = async () => false;
export const isEnrolledAsync = async () => false;
export const authenticateAsync = async () => ({ success: true });

// 5. Shim for Expo Haptics
export const impactAsync = async () => { };
export const notificationAsync = async () => { };
export const selectionAsync = async () => { };

// NOTE: react-native-web exports are now handled by vite.config.ts alias
// This shim is only used for: expo-sqlite, expo-secure-store, expo-local-authentication, 
// expo-haptics, react-native-reanimated, react-native-worklets

// 6. Dummy Reanimated / Worklets exports (for react-native-reanimated alias only)
export const useSharedValue = (val) => ({ value: val });
export const useAnimatedStyle = (cb) => ({});
export const withTiming = (val) => val;
export const withSpring = (val) => val;
export const createAnimatedComponent = (comp) => comp;
// Note: This Animated object is for react-native-reanimated's usage, not standard RN Animated
// The real Animated comes from react-native-web via vite alias
export const Animated = {
    View: ({ children, style, ...props }) => {
        const React = require('react');
        return React.createElement('div', { style, ...props }, children);
    },
    Text: ({ children, style, ...props }) => {
        const React = require('react');
        return React.createElement('span', { style, ...props }, children);
    },
    Image: ({ style, ...props }) => {
        const React = require('react');
        return React.createElement('img', { style, ...props });
    },
    ScrollView: ({ children, style, ...props }) => {
        const React = require('react');
        return React.createElement('div', { style: { overflow: 'auto', ...style }, ...props }, children);
    },
};
export const runOnJS = (fn) => fn;
export const runOnUI = (fn) => fn;