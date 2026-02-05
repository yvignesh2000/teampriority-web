'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import styles from '../auth.module.css';

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();

    // If user already has an org, redirect to app
    if (user?.organizationId) {
        router.push('/top3');
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome to TeamPriority</h1>
                    <p className={styles.subtitle}>How would you like to get started?</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Card>
                        <CardBody>
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Create a New Team</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: '1rem' }}>
                                Start fresh and invite your teammates later.
                            </p>
                            <Link href="/onboarding/create">
                                <Button style={{ width: '100%' }}>Create Team</Button>
                            </Link>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Join an Existing Team</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: '1rem' }}>
                                Enter an invite code from your team admin.
                            </p>
                            <Link href="/onboarding/join">
                                <Button variant="secondary" style={{ width: '100%' }}>Join Team</Button>
                            </Link>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
