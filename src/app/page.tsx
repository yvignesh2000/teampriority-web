'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/matrix');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return <PageLoading message="Loading TeamPriority..." />;
}
