import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import api from '../api/client';
import { User, UserRole } from '../../../types';

interface AuthContextType {
    user: User | null;
    currentUser: User | null; // Alias for compatibility
    isLoading: boolean;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // Check for token in storage (client.ts handles this automatically for requests)
            // Here we just verify if the session is valid by fetching /me
            const res = await api.get('/auth/me');
            if (res.status === 200) {
                setUser(res.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            // Token invalid or network error
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (token: string, userData: User) => {
        if (Platform.OS === 'web') {
            localStorage.setItem('sovereign_token', token);
        } else {
            // SecureStore is handled in client.ts, but here we might need to set it explicitly
            // For now assuming client.ts interception handles it if we navigate
        }
        setUser(userData);
    };

    const logout = async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem('sovereign_token');
        } else {
            // handle native storage removal
        }
        setUser(null);
    };

    const value = {
        user,
        currentUser: user, // Alias
        isLoading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
