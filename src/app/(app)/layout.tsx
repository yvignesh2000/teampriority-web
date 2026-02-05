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
        } else if (!loading && user && !user.organizationId) {
            // User exists but has no organization - send to onboarding
            router.replace('/onboarding');
        }
    }, [user, loading, router]);

    if (loading) {
        return <PageLoading message="Loading..." />;
    }

    if (!user) {
        return <PageLoading message="Redirecting to login..." />;
    }

    if (!user.organizationId) {
        return <PageLoading message="Setting up your team..." />;
    }

    return <AppShell>{children}</AppShell>;
}
