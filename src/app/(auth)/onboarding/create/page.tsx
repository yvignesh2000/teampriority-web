'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateDocument } from '@/lib/firebase/firestore';
import styles from '../../auth.module.css';

export default function CreateTeamPage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const { createOrganization } = useOrganization();
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName.trim() || !user) return;

        setLoading(true);
        setError('');

        try {
            const org = await createOrganization(teamName.trim());

            // Update user with organizationId and OWNER role
            await updateDocument('users', {
                id: user.id,
                organizationId: org.id,
                role: 'OWNER',
            });

            // Refresh user in AuthContext so layout sees the new organizationId
            await refreshUser();

            router.push('/top3');
        } catch (err: any) {
            setError(err.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Your Team</h1>
                    <p className={styles.subtitle}>Give your team a name to get started</p>
                </div>

                <form onSubmit={handleCreate} className={styles.form}>
                    <Input
                        label="Team Name"
                        placeholder="e.g., Acme Corp, Product Team"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <Button type="submit" disabled={loading || !teamName.trim()} style={{ width: '100%' }}>
                        {loading ? 'Creating...' : 'Create Team'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
