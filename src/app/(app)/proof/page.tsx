'use client';

import React, { useState } from 'react';
import { useProof } from '@/lib/hooks/useProof';
import { usePrompts } from '@/lib/hooks/usePrompts';
import { ProofType, ImpactTag, PROOF_TYPE_INFO } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { formatDate, isSameDay, getToday } from '@/lib/utils/dates';
import styles from './proof.module.css';

export default function ProofPage() {
    const { logs, loading, getTodayScore, createLog, deleteLog } = useProof();
    const { completePrompt } = usePrompts();
    const { showToast } = useToast();

    const [selectedType, setSelectedType] = useState<ProofType>('SHIPPED');
    const [content, setContent] = useState('');
    const [impact, setImpact] = useState<ImpactTag>('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const todayScore = getTodayScore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await createLog({
                type: selectedType,
                content: content.trim(),
                impactTag: impact,
            });
            setContent('');
            showToast('Proof logged!', 'success');
            completePrompt('PROOF_EVENING');
        } catch (error) {
            showToast('Failed to log proof', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteLog(id);
            showToast('Entry deleted', 'success');
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    if (loading) {
        return <PageLoading message="Loading proof logs..." />;
    }

    // Group logs by date
    const today = getToday();
    const todayLogs = logs.filter(l => isSameDay(l.date, today));
    const previousLogs = logs.filter(l => !isSameDay(l.date, today));

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.scoreCard}>
                    <div>
                        <div className={styles.scoreValue}>{todayScore}</div>
                        <div className={styles.scoreLabel}>Today's Score</div>
                    </div>
                </div>
            </div>

            {/* Entry Form */}
            <div className={styles.entryCard}>
                <h3 className={styles.entryTitle}>What did you accomplish?</h3>

                <div className={styles.typeButtons}>
                    {(Object.entries(PROOF_TYPE_INFO) as [ProofType, typeof PROOF_TYPE_INFO[ProofType]][]).map(([type, info]) => (
                        <button
                            key={type}
                            type="button"
                            className={`${styles.typeButton} ${selectedType === type ? styles.selected : ''}`}
                            onClick={() => setSelectedType(type)}
                        >
                            <span className={styles.typeEmoji}>{info.emoji}</span>
                            <span className={styles.typeLabel}>{info.label}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        placeholder={
                            selectedType === 'SHIPPED' ? "What did you ship or deliver?" :
                                selectedType === 'SOLVED' ? "What problem did you solve?" :
                                    "What did you improve?"
                        }
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    <div className={styles.impactRow}>
                        <span className={styles.impactLabel}>Impact:</span>
                        {(['LOW', 'MEDIUM', 'HIGH'] as ImpactTag[]).map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                className={`${styles.impactButton} ${impact === tag ? styles.selected : ''}`}
                                onClick={() => setImpact(tag)}
                            >
                                {tag === 'HIGH' ? '⭐ High' : tag === 'MEDIUM' ? 'Medium' : 'Low'}
                            </button>
                        ))}
                    </div>

                    <div className={styles.submitRow}>
                        <Button type="submit" fullWidth disabled={!content.trim() || isSubmitting}>
                            {isSubmitting ? 'Logging...' : 'Log Proof'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Today's Logs */}
            {todayLogs.length > 0 && (
                <div className={styles.dateSection}>
                    <div className={styles.dateLabel}>Today</div>
                    <div className={styles.logList}>
                        {todayLogs.map((log) => (
                            <div key={log.id} className={styles.logItem}>
                                <span className={styles.logEmoji}>{PROOF_TYPE_INFO[log.type].emoji}</span>
                                <div className={styles.logContent}>
                                    <p className={styles.logText}>{log.content}</p>
                                    <div className={styles.logMeta}>
                                        <Badge size="sm" variant={log.impactTag === 'HIGH' ? 'success' : log.impactTag === 'MEDIUM' ? 'warning' : 'default'}>
                                            {log.impactTag || 'Low'}
                                        </Badge>
                                        <span>+{PROOF_TYPE_INFO[log.type].basePoints * (log.impactTag === 'HIGH' ? 2 : log.impactTag === 'MEDIUM' ? 1.5 : 1)} pts</span>
                                    </div>
                                </div>
                                <button className={styles.logDelete} onClick={() => handleDelete(log.id)}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previous Logs */}
            {previousLogs.length > 0 && (
                <div className={styles.dateSection}>
                    <div className={styles.dateLabel}>Previous</div>
                    <div className={styles.logList}>
                        {previousLogs.slice(0, 10).map((log) => (
                            <div key={log.id} className={styles.logItem}>
                                <span className={styles.logEmoji}>{PROOF_TYPE_INFO[log.type].emoji}</span>
                                <div className={styles.logContent}>
                                    <p className={styles.logText}>{log.content}</p>
                                    <div className={styles.logMeta}>
                                        <span>{formatDate(log.date)}</span>
                                        <Badge size="sm">{log.impactTag || 'Low'}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {logs.length === 0 && (
                <div className={styles.emptyState}>
                    No proof logged yet. Start tracking your accomplishments!
                </div>
            )}
        </div>
    );
}
