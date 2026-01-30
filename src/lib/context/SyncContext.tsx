'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { trySyncQueue, setupOfflineSync } from '@/lib/db/sync';

interface SyncContextType {
    isOnline: boolean;
    isSyncing: boolean;
    pendingChanges: number;
    lastSyncedAt: Date | null;
    forceSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(0);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);

            const handleOnline = () => {
                setIsOnline(true);
                forceSync();
            };

            const handleOffline = () => {
                setIsOnline(false);
            };

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            setupOfflineSync();

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    const forceSync = useCallback(async () => {
        if (!isOnline) return;

        setIsSyncing(true);
        try {
            await trySyncQueue();
            setLastSyncedAt(new Date());
            setPendingChanges(0);
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline]);

    return (
        <SyncContext.Provider
            value={{
                isOnline,
                isSyncing,
                pendingChanges,
                lastSyncedAt,
                forceSync,
            }}
        >
            {children}
        </SyncContext.Provider>
    );
}

export function useSync() {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSync must be used within a SyncProvider');
    }
    return context;
}
