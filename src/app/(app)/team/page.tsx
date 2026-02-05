'use client';

import React, { useState, useEffect } from 'react';
import { User, WeeklyGoal, GoalOutcome, Top3Item, ProofLog, PROOF_TYPE_INFO } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { queryDocuments, where } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { getWeekStart, getToday, isSameDay, isSameWeek, formatDate } from '@/lib/utils/dates';
import styles from './team.module.css';

interface TeamMemberData {
    user: User;
    weeklyGoal?: WeeklyGoal;
    outcomes: GoalOutcome[];
    todayTop3: Top3Item[];
    recentProof: ProofLog[];
}

export default function TeamPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [teamData, setTeamData] = useState<TeamMemberData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTeamData = async () => {
            try {
                const weekStart = getWeekStart();
                const today = getToday();

                // Fetch all users
                const users = await queryDocuments<User>('users', []);

                // Fetch all weekly goals for this week
                const allGoals = await queryDocuments<WeeklyGoal>('weeklyGoals', [
                    where('isDeleted', '==', false)
                ]);

                // Fetch all outcomes
                const allOutcomes = await queryDocuments<GoalOutcome>('goalOutcomes', [
                    where('isDeleted', '==', false)
                ]);

                // Fetch all Top 3 items for today
                const allTop3 = await queryDocuments<Top3Item>('top3Items', [
                    where('isDeleted', '==', false)
                ]);

                // Fetch all proof logs (recent)
                const allProof = await queryDocuments<ProofLog>('proofLogs', [
                    where('isDeleted', '==', false)
                ]);

                // Assemble team data
                const data: TeamMemberData[] = users.map(u => {
                    const weeklyGoal = allGoals.find(g =>
                        g.userId === u.id && isSameWeek(g.weekStart, weekStart)
                    );
                    const outcomes = weeklyGoal
                        ? allOutcomes.filter(o => o.goalId === weeklyGoal.id).sort((a, b) => a.order - b.order)
                        : [];
                    const todayTop3 = allTop3
                        .filter(t => t.userId === u.id && isSameDay(t.date, today))
                        .sort((a, b) => a.order - b.order);
                    const recentProof = allProof
                        .filter(p => p.userId === u.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 3);

                    return { user: u, weeklyGoal, outcomes, todayTop3, recentProof };
                });

                setTeamData(data);
            } catch (error) {
                console.error('Error loading team data:', error);
                showToast('Failed to load team data', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadTeamData();
    }, [showToast]);

    if (loading) {
        return <PageLoading message="Loading team..." />;
    }

    return (
        <div className={styles.page}>
            <p className={styles.description}>
                See what your team is working on this week.
            </p>

            <div className={styles.teamGrid}>
                {teamData.map((member) => (
                    <Card key={member.user.id} className={styles.memberCard}>
                        <CardBody>
                            <div className={styles.memberHeader}>
                                <div className={styles.memberAvatar}>
                                    {member.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.memberInfo}>
                                    <div className={styles.memberName}>
                                        {member.user.name}
                                        {member.user.id === user?.id && (
                                            <span className={styles.youBadge}>(You)</span>
                                        )}
                                    </div>
                                    <Badge variant={member.user.role === 'ADMIN' ? 'primary' : 'default'} size="sm">
                                        {member.user.role}
                                    </Badge>
                                </div>
                            </div>

                            {/* Weekly Goal */}
                            <div className={styles.section}>
                                <div className={styles.sectionLabel}>Weekly Goal</div>
                                {member.weeklyGoal ? (
                                    <div className={styles.goalText}>{member.weeklyGoal.title}</div>
                                ) : (
                                    <div className={styles.emptyText}>No goal set</div>
                                )}
                            </div>

                            {/* Outcomes */}
                            {member.outcomes.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionLabel}>
                                        Outcomes ({member.outcomes.filter(o => o.isCompleted).length}/{member.outcomes.length})
                                    </div>
                                    <div className={styles.outcomesList}>
                                        {member.outcomes.map(outcome => (
                                            <div key={outcome.id} className={styles.outcomeItem}>
                                                <span className={outcome.isCompleted ? styles.completed : ''}>
                                                    {outcome.isCompleted ? '✓' : '○'} {outcome.description}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Today's Top 3 */}
                            <div className={styles.section}>
                                <div className={styles.sectionLabel}>
                                    Today ({member.todayTop3.filter(t => t.isCompleted).length}/{member.todayTop3.length})
                                </div>
                                {member.todayTop3.length > 0 ? (
                                    <div className={styles.top3List}>
                                        {member.todayTop3.map(item => (
                                            <div key={item.id} className={styles.top3Item}>
                                                <span className={item.isCompleted ? styles.completed : ''}>
                                                    {item.isCompleted ? '✓' : '○'} {item.content}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyText}>No priorities set</div>
                                )}
                            </div>

                            {/* Recent Proof */}
                            {member.recentProof.length > 0 && (
                                <div className={styles.section}>
                                    <div className={styles.sectionLabel}>Recent Proof</div>
                                    <div className={styles.proofList}>
                                        {member.recentProof.map(proof => (
                                            <div key={proof.id} className={styles.proofItem}>
                                                <span className={styles.proofEmoji}>
                                                    {PROOF_TYPE_INFO[proof.type].emoji}
                                                </span>
                                                <span className={styles.proofContent}>{proof.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}
