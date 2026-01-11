// shim.js
import * as ReactNative from 'react-native-web';

// 1. Shim for TurboModuleRegistry (required by expo-modules-core)
export const TurboModuleRegistry = {
    getEnforcing: (name) => {
        return null;
    },
    get: (name) => {
        return null;
    },
};

// 2. Shim for Expo SQLite (required by useAttendance.ts)
// This prevents the "openDatabaseSync is not exported" crash on web
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

// 3. Re-export everything from react-native-web
export * from 'react-native-web';
export default ReactNative;