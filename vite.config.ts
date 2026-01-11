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
    plugins: [react()],
    define: {
      __DEV__: JSON.stringify(isDev),
      global: 'window',
      // FIX: Polyfill process.env to prevent crashes in some libraries
      'process.env': {},
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react-native': path.resolve(__dirname, 'shim.js'),

        // FIX: Redirect all native modules to the shim
        'expo-sqlite': path.resolve(__dirname, 'shim.js'),
        'expo-secure-store': path.resolve(__dirname, 'shim.js'),
        'expo-local-authentication': path.resolve(__dirname, 'shim.js'),
        'expo-haptics': path.resolve(__dirname, 'shim.js'),

        '@react-native/assets-registry/registry': 'react-native-web/dist/modules/AssetRegistry',
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