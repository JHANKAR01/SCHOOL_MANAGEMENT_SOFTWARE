import * as ReactNative from 'react-native-web';

// Fix: Shim the missing TurboModuleRegistry for expo-modules-core
export const TurboModuleRegistry = {
    getEnforcing: (name) => {
        // console.warn(`[Shim] TurboModuleRegistry.getEnforcing('${name}') called. Returning null.`);
        return null;
    },
    get: (name) => {
        // console.warn(`[Shim] TurboModuleRegistry.get('${name}') called. Returning null.`);
        return null;
    },
};

// Re-export everything else from react-native-web
export * from 'react-native-web';
export default ReactNative;