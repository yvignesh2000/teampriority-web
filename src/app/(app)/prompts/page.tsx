'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePrompts } from '@/lib/hooks/usePrompts';
import { PromptType } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState, EmptyIcons } from '@/components/ui/EmptyState';
import styles from './prompts.module.css';

export default function PromptsPage() {
    const { activePrompts, dismissPrompt, getPromptInfo } = usePrompts();
    const router = useRouter();

    const handleAction = (type: PromptType) => {
        const info = getPromptInfo(type);
        router.push(info.action);
        dismissPrompt(type);
    };

    return (
        <div className={styles.page}>
            <p className={styles.description}>
                Your pending prompts and reminders to stay on track with your daily habits.
            </p>

            {activePrompts.length > 0 ? (
                <div className={styles.promptList}>
                    {activePrompts.map((type) => {
                        const info = getPromptInfo(type);
                        return (
                            <Card key={type}>
                                <CardBody>
                                    <div className={styles.promptCard}>
                                        <div className={styles.promptIcon}>
                                            {type === 'TOP3_MORNING' ? '🎯' : type === 'PROOF_EVENING' ? '✅' : '📊'}
                                        </div>
                                        <div className={styles.promptContent}>
                                            <h3 className={styles.promptTitle}>{info.title}</h3>
                                            <p className={styles.promptMessage}>{info.message}</p>
                                        </div>
                                        <div className={styles.promptActions}>
                                            <Button onClick={() => handleAction(type)}>
                                                {info.actionLabel}
                                            </Button>
                                            <Button variant="ghost" onClick={() => dismissPrompt(type)}>
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={EmptyIcons.list}
                    title="All caught up!"
                    description="No pending prompts. Check back later for your daily reminders."
                />
            )}

            <div className={styles.schedule}>
                <h3 className={styles.scheduleTitle}>📅 Prompt Schedule</h3>
                <div className={styles.scheduleList}>
                    <div className={styles.scheduleItem}>
                        <span className={styles.scheduleTime}>9:30 AM</span>
                        <span className={styles.scheduleLabel}>Set Today's Top 3 (weekdays)</span>
                    </div>
                    <div className={styles.scheduleItem}>
                        <span className={styles.scheduleTime}>6:30 PM</span>
                        <span className={styles.scheduleLabel}>Log Daily Proof (weekdays)</span>
                    </div>
                    <div className={styles.scheduleItem}>
                        <span className={styles.scheduleTime}>5:00 PM Friday</span>
                        <span className={styles.scheduleLabel}>Generate Weekly Summary</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
