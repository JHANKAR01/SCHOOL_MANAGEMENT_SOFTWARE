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

export const AuthProvider: React.FC<{ children: React.ReactNode; user?: User | null; onLogout?: () => void }> = ({ children, user: externalUser, onLogout }) => {
    const [internalUser, setInternalUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const activeUser = externalUser ?? internalUser;

    const checkAuth = async () => {
        if (externalUser) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await api.get('/auth/me');
            if (res.status === 200) {
                setInternalUser(res.data);
            } else {
                setInternalUser(null);
            }
        } catch (error) {
            setInternalUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [externalUser]);

    const login = async (token: string, userData: User) => {
        if (Platform.OS === 'web') {
            localStorage.setItem('sovereign_token', token);
        } else {
            // SecureStore is handled in client.ts, but here we might need to set it explicitly
            // For now assuming client.ts interception handles it if we navigate
        }
        setInternalUser(userData);
    };

    const logout = async () => {
        if (onLogout) {
            onLogout();
        } else {
            if (Platform.OS === 'web') {
                localStorage.removeItem('sovereign_token');
            } else {
                // handle native storage removal
            }
            setInternalUser(null);
        }
    };

    const value = {
        user: activeUser,
        currentUser: activeUser,
        isLoading,
        login,
        logout,
        isAuthenticated: !!activeUser
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
