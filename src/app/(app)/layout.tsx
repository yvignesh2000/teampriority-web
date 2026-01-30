'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <PageLoading message="Loading..." />;
    }

    if (!user) {
        return <PageLoading message="Redirecting to login..." />;
    }

    return <AppShell>{children}</AppShell>;
}
