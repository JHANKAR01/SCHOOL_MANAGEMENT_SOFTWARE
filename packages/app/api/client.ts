
import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Environment variable for API URL or fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const client = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Auth Interceptor: Attach Token
client.interceptors.request.use(async (config) => {
    try {
        let token: string | null = null;

        if (Platform.OS === 'web') {
            token = localStorage.getItem('sovereign_token');
        } else {
            token = await SecureStore.getItemAsync('sovereign_token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error fetching token for request:', error);
    }
    return config;
});

// 2. Global Error Handling
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            console.warn('Session expired. Redirecting to login...');
            // In a real app, you might trigger a global event emitter or Redux action to logout
            if (Platform.OS === 'web') {
                localStorage.removeItem('sovereign_token');
                // window.location.href = '/login'; // Optional: Redirect
            } else {
                await SecureStore.deleteItemAsync('sovereign_token');
            }
        }
        return Promise.reject(error);
    }
);

export default client;
