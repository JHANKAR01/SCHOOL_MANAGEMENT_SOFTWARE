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
      port: 5173, // FIX: Changed from 3000 to avoid conflict with Backend
      host: '0.0.0.0',
      // FIX: Add Proxy to redirect /api calls to the Hono Backend
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    define: {
      // FIX: Satisfy Expo/React Native global variable requirements
      __DEV__: JSON.stringify(isDev),
      global: 'window',
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react-native': path.resolve(__dirname, 'shim.js'),
        'expo-sqlite': path.resolve(__dirname, 'shim.js'),
        '@react-native/assets-registry/registry': 'react-native-web/dist/modules/AssetRegistry',
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
});