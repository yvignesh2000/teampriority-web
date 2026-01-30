'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { queryDocuments, updateDocument, where } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { Banner } from '@/components/ui/Banner';
import styles from './team.module.css';

export default function TeamPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const allUsers = await queryDocuments<User>('users', []);
                setUsers(allUsers);
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const handleRoleToggle = async (targetUser: User) => {
        if (!isAdmin || targetUser.id === user?.id) return;

        const newRole: UserRole = targetUser.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';

        try {
            await updateDocument<User>('users', { id: targetUser.id, role: newRole });
            setUsers(prev => prev.map(u =>
                u.id === targetUser.id ? { ...u, role: newRole } : u
            ));
            showToast(`${targetUser.name} is now a ${newRole.toLowerCase()}`, 'success');
        } catch (error) {
            showToast('Failed to update role', 'error');
        }
    };

    if (loading) {
        return <PageLoading message="Loading team..." />;
    }

    return (
        <div className={styles.page}>
            {!isAdmin && (
                <Banner
                    variant="info"
                    message="Only admins can manage team roles."
                />
            )}

            <p className={styles.description}>
                Your team members and their roles.
            </p>

            <div className={styles.list}>
                {users.map((member) => (
                    <Card key={member.id}>
                        <CardBody>
                            <div className={styles.memberCard}>
                                <div className={styles.memberAvatar}>
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.memberInfo}>
                                    <div className={styles.memberName}>
                                        {member.name}
                                        {member.id === user?.id && (
                                            <span className={styles.youBadge}>(You)</span>
                                        )}
                                    </div>
                                    <div className={styles.memberEmail}>{member.email}</div>
                                </div>
                                <div className={styles.memberRole}>
                                    <Badge variant={member.role === 'ADMIN' ? 'primary' : 'default'}>
                                        {member.role}
                                    </Badge>
                                </div>
                                {isAdmin && member.id !== user?.id && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRoleToggle(member)}
                                    >
                                        {member.role === 'ADMIN' ? 'Make Member' : 'Make Admin'}
                                    </Button>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className={styles.info}>
                <h3 className={styles.infoTitle}>Role Permissions</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <strong>Members</strong>
                        <ul>
                            <li>Create and manage their own tasks</li>
                            <li>View all team tasks</li>
                            <li>Set personal goals and proof logs</li>
                        </ul>
                    </div>
                    <div className={styles.infoItem}>
                        <strong>Admins</strong>
                        <ul>
                            <li>All member permissions</li>
                            <li>Create and manage topics</li>
                            <li>Manage team roles</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
