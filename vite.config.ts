// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode !== 'production';

  return {
    base: '/',
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react({
        babel: {
          presets: ["nativewind/babel"],
        },
      }),
    ],
    define: {
      __DEV__: JSON.stringify(isDev),
      global: 'window',
      'process.env': {},
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // Point directly to react-native-web for real RN components (View, Text, Animated, etc.)
        'react-native': 'react-native-web',
        // Keep these pointing to shim.js for expo-specific modules
        'expo-sqlite': path.resolve(__dirname, 'shim.js'),
        'expo-secure-store': path.resolve(__dirname, 'shim.js'),
        'expo-local-authentication': path.resolve(__dirname, 'shim.js'),
        'expo-haptics': path.resolve(__dirname, 'shim.js'),
        'react-native-reanimated': path.resolve(__dirname, 'shim.js'),
        'react-native-worklets': path.resolve(__dirname, 'shim.js'),
        '@react-native/assets-registry/registry': 'react-native-web/dist/modules/AssetRegistry',
        'react-native-css-interop/jsx-runtime': 'react-native-css-interop/dist/runtime/jsx-runtime',
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          __DEV__: JSON.stringify(isDev),
          global: 'window',
        },
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
});