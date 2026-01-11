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

// 6. Re-export everything from react-native-web
export * from 'react-native-web';
export default ReactNative;

// 7. Dummy Reanimated / Worklets exports
// jhankar01/school-management-system---1/School-Management-System---1-LOCAL/shim.js

// 7. Dummy Reanimated / Worklets exports to satisfy NativeWind v4 Babel preset
export const useSharedValue = (val) => ({ value: val });
export const useAnimatedStyle = (cb) => ({});
export const withTiming = (val) => val;
export const withSpring = (val) => val;
export const createAnimatedComponent = (comp) => comp;
export const Animated = {
    View: ReactNative.View,
    Text: ReactNative.Text,
    Image: ReactNative.Image,
    ScrollView: ReactNative.ScrollView,
};
export const runOnJS = (fn) => fn;
export const runOnUI = (fn) => fn;