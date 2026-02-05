'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGoals } from '@/lib/hooks/useGoals';
import { useTasks } from '@/lib/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { getWeekStart, formatWeekRange, getRelativeDay } from '@/lib/utils/dates';
import styles from './outcomes.module.css';

export default function OutcomesPage() {
    const {
        loading: goalsLoading,
        getGoalForWeek,
        getOutcomesForGoal
    } = useGoals();
    const { tasks, loading: tasksLoading } = useTasks();

    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    const weekStart = getWeekStart(getRelativeDay(currentWeekOffset * 7));
    const currentGoal = getGoalForWeek(weekStart);
    const outcomes = currentGoal ? getOutcomesForGoal(currentGoal.id) : [];

    // Calculate progress for each outcome
    const outcomesWithProgress = useMemo(() => {
        return outcomes.map(outcome => {
            const linkedTasks = tasks.filter(t => t.outcomeId === outcome.id);
            const completedTasks = linkedTasks.filter(t => t.status === 'DONE');
            const progress = linkedTasks.length > 0
                ? Math.round((completedTasks.length / linkedTasks.length) * 100)
                : 0;

            return {
                ...outcome,
                totalTasks: linkedTasks.length,
                completedTasks: completedTasks.length,
                progress,
            };
        });
    }, [outcomes, tasks]);

    if (goalsLoading || tasksLoading) {
        return <PageLoading message="Loading outcomes..." />;
    }

    return (
        <div className={styles.page}>
            {/* Week Navigation */}
            <div className={styles.weekNav}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                >
                    ← Previous
                </Button>
                <span className={styles.weekLabel}>
                    {formatWeekRange(weekStart)}
                    {currentWeekOffset === 0 && ' (Current)'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                        disabled={currentWeekOffset >= 0}
                    >
                        Next →
                    </Button>
                    {currentWeekOffset !== 0 && (
                        <Button variant="secondary" size="sm" onClick={() => setCurrentWeekOffset(0)}>
                            Today
                        </Button>
                    )}
                </div>
            </div>

            {/* Weekly Goal */}
            {currentGoal ? (
                <>
                    <div className={styles.goalCard}>
                        <h2 className={styles.goalTitle}>{currentGoal.title}</h2>
                        {currentGoal.description && (
                            <p className={styles.goalDescription}>{currentGoal.description}</p>
                        )}
                    </div>

                    {/* Outcomes List */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>
                                Outcomes ({outcomes.length}/3)
                            </h3>
                            <Link href="/goals">
                                <Button variant="ghost" size="sm">Edit Outcomes</Button>
                            </Link>
                        </div>

                        {outcomesWithProgress.length > 0 ? (
                            <div className={styles.outcomesList}>
                                {outcomesWithProgress.map((outcome) => (
                                    <Link
                                        key={outcome.id}
                                        href={`/outcomes/${outcome.id}`}
                                        className={styles.outcomeCard}
                                    >
                                        <div className={styles.outcomeHeader}>
                                            <h4 className={styles.outcomeTitle}>
                                                {outcome.description}
                                            </h4>
                                            <div className={styles.outcomeStatus}>
                                                <span className={`${styles.outcomeStatusBadge} ${outcome.isCompleted ? styles.completed : styles.inProgress}`}>
                                                    {outcome.isCompleted ? '✓ Done' : 'In Progress'}
                                                </span>
                                            </div>
                                        </div>

                                        {outcome.definitionOfDone && (
                                            <p className={styles.outcomeDoD}>
                                                Done when: {outcome.definitionOfDone}
                                            </p>
                                        )}

                                        <div className={styles.outcomeProgress}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${outcome.progress}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressText}>
                                                {outcome.completedTasks}/{outcome.totalTasks} tasks
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <h3 className={styles.emptyTitle}>No outcomes yet</h3>
                                <p className={styles.emptyText}>
                                    Add outcomes to define what success looks like this week.
                                </p>
                                <Link href="/goals">
                                    <Button>Add Outcomes</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className={styles.emptyState}>
                    <h3 className={styles.emptyTitle}>No weekly goal set</h3>
                    <p className={styles.emptyText}>
                        Set your weekly impact goal to get started.
                    </p>
                    <Link href="/goals">
                        <Button>Set Weekly Goal</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
