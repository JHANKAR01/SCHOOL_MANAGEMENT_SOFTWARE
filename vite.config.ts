import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),

        // FIX 1: Point 'react-native' to the shim.js file we just created
        'react-native': path.resolve(__dirname, 'shim.js'),

        // FIX 2: Keep the other aliases
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