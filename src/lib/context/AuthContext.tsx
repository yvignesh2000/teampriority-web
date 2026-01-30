'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/lib/types';
import { onAuthChange, getCurrentUser, signIn, signUp, signOut } from '@/lib/firebase/auth';
import { clearLocalData } from '@/lib/db/dexie';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                try {
                    const userData = await getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    console.error('Error getting user data:', err);
                    setUser(null);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            const userData = await signIn(email, password);
            setUser(userData);
        } catch (err: any) {
            setError(getAuthErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        setError(null);
        setLoading(true);
        try {
            const userData = await signUp(email, password, name);
            setUser(userData);
        } catch (err: any) {
            setError(getAuthErrorMessage(err.code));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setError(null);
        try {
            await signOut();
            await clearLocalData();
            setUser(null);
            setFirebaseUser(null);
        } catch (err: any) {
            setError('Failed to sign out');
            throw err;
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                loading,
                error,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

function getAuthErrorMessage(code: string): string {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return 'An error occurred. Please try again.';
    }
}
