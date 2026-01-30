'use client';

import React, { useState } from 'react';
import { useProof } from '@/lib/hooks/useProof';
import { useGoals } from '@/lib/hooks/useGoals';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { getWeekStart, formatWeekRange } from '@/lib/utils/dates';
import { generateWeeklySummary, generateProofExport } from '@/lib/utils/summary';
import { calculateWeeklyScore } from '@/lib/utils/scoring';
import { copyToClipboard, downloadAsFile } from '@/lib/utils/export';
import styles from './export.module.css';

export default function ExportPage() {
    const { logs, loading: proofLoading, getLogsForWeek, getLogsForLast30Days } = useProof();
    const { loading: goalsLoading, getGoalForWeek, getOutcomesForGoal } = useGoals();
    const { showToast } = useToast();
    const [copying, setCopying] = useState<string | null>(null);

    const weekStart = getWeekStart();
    const goal = getGoalForWeek(weekStart);
    const outcomes = goal ? getOutcomesForGoal(goal.id) : [];
    const weekLogs = getLogsForWeek(weekStart);
    const last30DaysLogs = getLogsForLast30Days();

    const handleCopyWeeklySummary = async () => {
        setCopying('weekly');
        const content = generateWeeklySummary({
            weekStart,
            goal: goal || undefined,
            outcomes,
            proofLogs: weekLogs,
            score: calculateWeeklyScore(weekLogs),
        });

        const success = await copyToClipboard(content);
        if (success) {
            showToast('Weekly summary copied to clipboard!', 'success');
        } else {
            showToast('Failed to copy', 'error');
        }
        setCopying(null);
    };

    const handleCopy30DaysProof = async () => {
        setCopying('30days');
        const content = generateProofExport(last30DaysLogs, 'Last 30 Days Proof Log');

        const success = await copyToClipboard(content);
        if (success) {
            showToast('30-day proof log copied!', 'success');
        } else {
            showToast('Failed to copy', 'error');
        }
        setCopying(null);
    };

    const handleDownload30DaysProof = () => {
        const content = generateProofExport(last30DaysLogs, 'Last 30 Days Proof Log');
        const date = new Date().toISOString().split('T')[0];
        downloadAsFile(content, `proof-log-${date}.md`, 'text/markdown');
        showToast('Download started', 'success');
    };

    if (proofLoading || goalsLoading) {
        return <PageLoading message="Loading..." />;
    }

    return (
        <div className={styles.page}>
            <p className={styles.description}>
                Export your work proof for sharing with managers, performance reviews, or personal records.
            </p>

            <div className={styles.grid}>
                {/* Weekly Summary Export */}
                <Card>
                    <CardHeader
                        title="Weekly Summary"
                        subtitle="Current week's accomplishments and goal progress"
                    />
                    <CardBody>
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{weekLogs.length}</span>
                                <span className={styles.statLabel}>Proof entries</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{calculateWeeklyScore(weekLogs)}</span>
                                <span className={styles.statLabel}>Points</span>
                            </div>
                        </div>
                        <Button fullWidth onClick={handleCopyWeeklySummary} disabled={copying === 'weekly'}>
                            {copying === 'weekly' ? 'Copying...' : '📋 Copy Weekly Summary'}
                        </Button>
                    </CardBody>
                </Card>

                {/* 30 Days Proof Export */}
                <Card>
                    <CardHeader
                        title="Last 30 Days"
                        subtitle="Complete proof log for the past month"
                    />
                    <CardBody>
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{last30DaysLogs.length}</span>
                                <span className={styles.statLabel}>Total entries</span>
                            </div>
                        </div>
                        <div className={styles.buttonGroup}>
                            <Button fullWidth onClick={handleCopy30DaysProof} disabled={copying === '30days'}>
                                {copying === '30days' ? 'Copying...' : '📋 Copy to Clipboard'}
                            </Button>
                            <Button fullWidth variant="secondary" onClick={handleDownload30DaysProof}>
                                ⬇️ Download as Markdown
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className={styles.tips}>
                <h3 className={styles.tipsTitle}>💡 Export Tips</h3>
                <ul className={styles.tipsList}>
                    <li>Use weekly summaries for 1:1 meetings with your manager</li>
                    <li>30-day exports are great for performance review prep</li>
                    <li>Paste into Notion, email, or your personal notes</li>
                    <li>High-impact items (⭐) stand out in your summary</li>
                </ul>
            </div>
        </div>
    );
}
