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
            // Only clear token if the request actually HAD a token attached
            const requestHadToken = error.config?.headers?.Authorization;

            if (requestHadToken) {
                console.error('[AUTH] Session expired (401). clearing token.');

                if (Platform.OS === 'web') {
                    localStorage.removeItem('sovereign_token');
                } else {
                    await SecureStore.deleteItemAsync('sovereign_token');
                }
            } else {
                // 401 without token = expected during login flow
                console.log('[DEBUG] 401 received without token (Normal pre-login behavior)');
            }
        }
        return Promise.reject(error);
    }
);

// 3. Super Admin API Helper
export const getSuperAdminData = async (endpoint: string) => {
    try {
        const response = await client.get(`/super-admin${endpoint}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching super admin data from ${endpoint}:`, error);
        throw error;
    }
};

export const superAdminApi = {
    toggleFeature: async (schoolId: string, feature: string, enabled: boolean) => {
        try {
            const response = await client.post(`/super-admin/tenants/${schoolId}/toggle-feature`, {
                feature,
                enabled
            });
            return response.data;
        } catch (error) {
            console.error(`Error toggling feature ${feature} for school ${schoolId}:`, error);
            throw error;
        }
    }
};

export default client;
