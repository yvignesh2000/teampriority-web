'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateDocument } from '@/lib/firebase/firestore';
import styles from '../../auth.module.css';

export default function JoinTeamPage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const { getOrgByInviteCode } = useOrganization();
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim() || !user) return;

        setLoading(true);
        setError('');

        try {
            const org = await getOrgByInviteCode(inviteCode.trim().toUpperCase());

            if (!org) {
                setError('Invalid invite code. Please check and try again.');
                setLoading(false);
                return;
            }

            // Update user with organizationId
            await updateDocument('users', {
                id: user.id,
                organizationId: org.id,
                role: 'MEMBER',
            });

            // Refresh user in AuthContext
            await refreshUser();

            router.push('/top3');
        } catch (err: any) {
            setError(err.message || 'Failed to join team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Join a Team</h1>
                    <p className={styles.subtitle}>Enter the invite code from your team admin</p>
                </div>

                <form onSubmit={handleJoin} className={styles.form}>
                    <Input
                        label="Invite Code"
                        placeholder="e.g., ABC12345"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        required
                        style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <Button type="submit" disabled={loading || !inviteCode.trim()} style={{ width: '100%' }}>
                        {loading ? 'Joining...' : 'Join Team'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
