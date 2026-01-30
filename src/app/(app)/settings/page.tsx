'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useSync } from '@/lib/context/SyncContext';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import styles from './settings.module.css';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const { isOnline, lastSyncedAt, forceSync } = useSync();

    return (
        <div className={styles.page}>
            {/* Profile Card */}
            <Card>
                <CardHeader title="Profile" subtitle="Your account information" />
                <CardBody>
                    <div className={styles.profile}>
                        <div className={styles.avatar}>
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.info}>
                            <div className={styles.name}>{user?.name}</div>
                            <div className={styles.email}>{user?.email}</div>
                            <Badge variant={user?.role === 'ADMIN' ? 'primary' : 'default'}>
                                {user?.role}
                            </Badge>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Sync Status */}
            <Card>
                <CardHeader title="Sync Status" subtitle="Data synchronization" />
                <CardBody>
                    <div className={styles.syncStatus}>
                        <div className={styles.syncItem}>
                            <span className={styles.syncLabel}>Connection</span>
                            <Badge variant={isOnline ? 'success' : 'warning'}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Badge>
                        </div>
                        <div className={styles.syncItem}>
                            <span className={styles.syncLabel}>Last synced</span>
                            <span className={styles.syncValue}>
                                {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Never'}
                            </span>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={forceSync} disabled={!isOnline}>
                        Force Sync
                    </Button>
                </CardBody>
            </Card>

            {/* About */}
            <Card>
                <CardHeader title="About TeamPriority" subtitle="Version info" />
                <CardBody>
                    <div className={styles.about}>
                        <p>TeamPriority is a productivity app for small teams focused on building consistent prioritization habits.</p>
                        <div className={styles.version}>
                            <span>Version 1.0.0</span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Sign Out */}
            <Card>
                <CardBody>
                    <Button variant="danger" fullWidth onClick={logout}>
                        Sign Out
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}
