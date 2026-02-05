/**
 * Weekly Goal Card Component
 * Always-visible weekly direction and progress
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useGoals } from '@/lib/hooks/useGoals';
import { useAuth } from '@/lib/context/AuthContext';
import styles from './WeeklyGoalCard.module.css';

export function WeeklyGoalCard() {
    const { user } = useAuth();
    const { getCurrentWeekGoal, getOutcomesForGoal } = useGoals();

    const currentGoal = getCurrentWeekGoal();
    const outcomes = currentGoal ? getOutcomesForGoal(currentGoal.id) : [];

    if (!currentGoal) {
        return (
            <Link href="/week" className={styles.emptyState}>
                <div className={styles.emptyContent}>
                    <div className={styles.emptyIcon}>🎯</div>
                    <h2 className={styles.emptyTitle}>Set your weekly impact goal</h2>
                    <p className={styles.emptyDescription}>
                        Define what success looks like this week
                    </p>
                    <button className={styles.primaryButton}>
                        Set Weekly Direction →
                    </button>
                </div>
            </Link>
        );
    }

    const completedOutcomes = outcomes.filter(o => o.isCompleted).length;
    const totalOutcomes = outcomes.length;
    const progress = totalOutcomes > 0 ? (completedOutcomes / totalOutcomes) * 100 : 0;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.label}>THIS WEEK'S IMPACT</span>
                <Link href="/week" className={styles.editLink}>
                    Edit
                </Link>
            </div>

            <h1 className={styles.goalTitle}>{currentGoal.title}</h1>

            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                    aria-label={`${Math.round(progress)}% complete`}
                />
            </div>

            <div className={styles.meta}>
                <span className={styles.metaText}>
                    {totalOutcomes} outcome{totalOutcomes !== 1 ? 's' : ''} · {completedOutcomes} completed
                </span>
                <span className={styles.percentage}>{Math.round(progress)}%</span>
            </div>
        </div>
    );
}
