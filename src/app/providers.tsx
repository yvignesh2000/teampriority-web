'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/context/AuthContext';
import { SyncProvider } from '@/lib/context/SyncContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <SyncProvider>
                <ToastProvider>
                    {children}
                    <ToastContainer />
                </ToastProvider>
            </SyncProvider>
        </AuthProvider>
    );
}
