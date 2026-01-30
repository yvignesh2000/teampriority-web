'use client';

import React, { useState, useMemo } from 'react';
import { useGoals } from '@/lib/hooks/useGoals';
import { useProof } from '@/lib/hooks/useProof';
import { usePrompts } from '@/lib/hooks/usePrompts';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { getWeekStart, formatWeekRange, getRelativeDay } from '@/lib/utils/dates';
import { generateWeeklySummary } from '@/lib/utils/summary';
import { calculateWeeklyScore } from '@/lib/utils/scoring';
import { copyToClipboard } from '@/lib/utils/export';
import styles from './summary.module.css';

export default function SummaryPage() {
    const { loading: goalsLoading, getGoalForWeek, getOutcomesForGoal } = useGoals();
    const { loading: proofLoading, getLogsForWeek, getWeekScore } = useProof();
    const { completePrompt } = usePrompts();
    const { showToast } = useToast();

    const [weekOffset, setWeekOffset] = useState(0);
    const [editedContent, setEditedContent] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const weekStart = getWeekStart(getRelativeDay(weekOffset * 7));
    const goal = getGoalForWeek(weekStart);
    const outcomes = goal ? getOutcomesForGoal(goal.id) : [];
    const logs = getLogsForWeek(weekStart);
    const score = getWeekScore(weekStart);

    const generatedContent = useMemo(() => {
        return generateWeeklySummary({
            weekStart,
            goal: goal || undefined,
            outcomes,
            proofLogs: logs,
            score,
        });
    }, [weekStart, goal, outcomes, logs, score]);

    const displayContent = editedContent ?? generatedContent;

    const handleEdit = () => {
        setEditedContent(displayContent);
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        showToast('Summary saved', 'success');
        completePrompt('SUMMARY_FRIDAY');
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(displayContent);
        if (success) {
            showToast('Copied to clipboard!', 'success');
        } else {
            showToast('Failed to copy', 'error');
        }
    };

    const handleReset = () => {
        setEditedContent(null);
        setIsEditing(false);
    };

    if (goalsLoading || proofLoading) {
        return <PageLoading message="Loading summary..." />;
    }

    return (
        <div className={styles.page}>
            {/* Week Navigation */}
            <div className={styles.weekNav}>
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset(prev => prev - 1)}>
                    ← Previous Week
                </Button>
                <span className={styles.weekLabel}>
                    {formatWeekRange(weekStart)}
                    {weekOffset === 0 && ' (Current)'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        disabled={weekOffset >= 0}
                    >
                        Next Week →
                    </Button>
                    {weekOffset !== 0 && (
                        <Button variant="secondary" size="sm" onClick={() => setWeekOffset(0)}>
                            Current
                        </Button>
                    )}
                </div>
            </div>

            {/* Summary Card */}
            <div className={styles.summaryCard}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Weekly Summary</h2>
                        <p className={styles.subtitle}>Score: {score} points</p>
                    </div>
                    <div className={styles.actions}>
                        {isEditing ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={handleReset}>
                                    Reset
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                    Save
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" onClick={handleEdit}>
                                    Edit
                                </Button>
                                <Button size="sm" onClick={handleCopy}>
                                    Copy
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <Textarea
                        value={editedContent || ''}
                        onChange={(e) => setEditedContent(e.target.value)}
                        style={{ minHeight: '400px', fontFamily: 'monospace', fontSize: '0.875rem' }}
                    />
                ) : (
                    <div className={styles.content}>
                        <pre className={styles.markdown}>{displayContent}</pre>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{logs.length}</span>
                    <span className={styles.statLabel}>Proof entries</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{outcomes.filter(o => o.isCompleted).length}/{outcomes.length}</span>
                    <span className={styles.statLabel}>Outcomes completed</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{score}</span>
                    <span className={styles.statLabel}>Total score</span>
                </div>
            </div>
        </div>
    );
}
