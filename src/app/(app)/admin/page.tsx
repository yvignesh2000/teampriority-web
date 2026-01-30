'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Task } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { queryDocuments } from '@/lib/firebase/firestore';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import styles from './admin.module.css';

interface TeamMemberStats {
    user: User;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
}

interface QuadrantStats {
    urgentImportant: number;
    notUrgentImportant: number;
    urgentNotImportant: number;
    notUrgentNotImportant: number;
}

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [memberStats, setMemberStats] = useState<TeamMemberStats[]>([]);
    const [quadrantStats, setQuadrantStats] = useState<QuadrantStats>({
        urgentImportant: 0,
        notUrgentImportant: 0,
        urgentNotImportant: 0,
        notUrgentNotImportant: 0,
    });
    const [totals, setTotals] = useState({
        members: 0,
        tasks: 0,
        completed: 0,
        avgCompletion: 0,
    });

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        const loadData = async () => {
            if (!isAdmin) {
                setLoading(false);
                return;
            }

            try {
                // Load all users
                const users = await queryDocuments<User>('users', []);

                // Load all tasks
                const tasks = await queryDocuments<Task>('tasks', []);

                // Calculate per-user stats
                const stats: TeamMemberStats[] = users.map((u) => {
                    const userTasks = tasks.filter((t) => t.ownerId === u.id);
                    const completed = userTasks.filter((t) => t.status === 'DONE').length;
                    const total = userTasks.length;
                    return {
                        user: u,
                        totalTasks: total,
                        completedTasks: completed,
                        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                    };
                });

                // Sort by total tasks descending
                stats.sort((a, b) => b.totalTasks - a.totalTasks);
                setMemberStats(stats);

                // Calculate quadrant distribution using quadrant enum
                const quadrants: QuadrantStats = {
                    urgentImportant: 0,
                    notUrgentImportant: 0,
                    urgentNotImportant: 0,
                    notUrgentNotImportant: 0,
                };

                tasks.forEach((task) => {
                    switch (task.quadrant) {
                        case 'UI':
                            quadrants.urgentImportant++;
                            break;
                        case 'NUI':
                            quadrants.notUrgentImportant++;
                            break;
                        case 'UNI':
                            quadrants.urgentNotImportant++;
                            break;
                        case 'NUNI':
                            quadrants.notUrgentNotImportant++;
                            break;
                    }
                });
                setQuadrantStats(quadrants);

                // Calculate totals
                const totalCompleted = tasks.filter((t) => t.status === 'DONE').length;
                const avgCompletion = tasks.length > 0
                    ? Math.round((totalCompleted / tasks.length) * 100)
                    : 0;

                setTotals({
                    members: users.length,
                    tasks: tasks.length,
                    completed: totalCompleted,
                    avgCompletion,
                });
            } catch (error) {
                console.error('Error loading admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAdmin]);

    if (loading) {
        return <PageLoading message="Loading team analytics..." />;
    }

    if (!isAdmin) {
        return (
            <div className={styles.accessDenied}>
                <svg className={styles.accessDeniedIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className={styles.accessDeniedTitle}>Admin Access Required</h2>
                <p className={styles.accessDeniedText}>
                    This dashboard is only available to team administrators. Contact your team admin for access.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Overview Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totals.members}</div>
                    <div className={styles.statLabel}>Team Members</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totals.tasks}</div>
                    <div className={styles.statLabel}>Total Tasks</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totals.completed}</div>
                    <div className={styles.statLabel}>Completed</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totals.avgCompletion}%</div>
                    <div className={styles.statLabel}>Team Completion Rate</div>
                </div>
            </div>

            {/* Team Performance */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="7" r="4" />
                            <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                            <circle cx="19" cy="7" r="3" />
                            <path d="M21 21v-2a3 3 0 00-3-3h-1" />
                        </svg>
                        Team Performance
                    </h3>
                </div>
                <div className={styles.sectionBody}>
                    {memberStats.length === 0 ? (
                        <div className={styles.emptyState}>No team members found</div>
                    ) : (
                        <table className={styles.membersTable}>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Total Tasks</th>
                                    <th>Completed</th>
                                    <th>Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberStats.map((stat) => (
                                    <tr key={stat.user.id}>
                                        <td>
                                            <div className={styles.memberCell}>
                                                <div className={styles.memberAvatar}>
                                                    {stat.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className={styles.memberName}>{stat.user.name}</div>
                                                    <div className={styles.memberEmail}>{stat.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.taskCount}>{stat.totalTasks}</td>
                                        <td className={styles.taskCount}>{stat.completedTasks}</td>
                                        <td>
                                            <div className={styles.completionRate}>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={styles.progressFill}
                                                        style={{ width: `${stat.completionRate}%` }}
                                                    />
                                                </div>
                                                <span className={styles.percentText}>{stat.completionRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Quadrant Distribution */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Task Distribution by Quadrant
                    </h3>
                </div>
                <div className={styles.sectionBody}>
                    <div className={styles.quadrantGrid}>
                        <div className={`${styles.quadrantCard} ${styles['urgent-important']}`}>
                            <div className={styles.quadrantHeader}>
                                <span className={styles.quadrantLabel}>Urgent & Important</span>
                                <span className={styles.quadrantCount}>{quadrantStats.urgentImportant}</span>
                            </div>
                            <div className={styles.quadrantSubtext}>Do First</div>
                        </div>
                        <div className={`${styles.quadrantCard} ${styles['not-urgent-important']}`}>
                            <div className={styles.quadrantHeader}>
                                <span className={styles.quadrantLabel}>Not Urgent & Important</span>
                                <span className={styles.quadrantCount}>{quadrantStats.notUrgentImportant}</span>
                            </div>
                            <div className={styles.quadrantSubtext}>Schedule</div>
                        </div>
                        <div className={`${styles.quadrantCard} ${styles['urgent-not-important']}`}>
                            <div className={styles.quadrantHeader}>
                                <span className={styles.quadrantLabel}>Urgent & Not Important</span>
                                <span className={styles.quadrantCount}>{quadrantStats.urgentNotImportant}</span>
                            </div>
                            <div className={styles.quadrantSubtext}>Delegate</div>
                        </div>
                        <div className={`${styles.quadrantCard} ${styles['not-urgent-not-important']}`}>
                            <div className={styles.quadrantHeader}>
                                <span className={styles.quadrantLabel}>Not Urgent & Not Important</span>
                                <span className={styles.quadrantCount}>{quadrantStats.notUrgentNotImportant}</span>
                            </div>
                            <div className={styles.quadrantSubtext}>Eliminate</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
