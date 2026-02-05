/**
 * Next Up Prompt Component
 * Contextual guidance to Matrix when tasks are waiting
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useTasks } from '@/lib/hooks/useTasks';
import styles from './NextUpPrompt.module.css';

export function NextUpPrompt() {
    const { user } = useAuth();
    const { tasks } = useTasks();

    // Count tasks that aren't archived
    const waitingTasks = tasks.filter(t => t.status !== 'ARCHIVED');
    const waitingCount = waitingTasks.length;

    if (waitingCount === 0) {
        return null; // Don't show if no tasks waiting
    }

    return (
        <Link href="/matrix" className={styles.prompt}>
            <div className={styles.content}>
                <div className={styles.icon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </div>
                <div className={styles.text}>
                    <p className={styles.title}>NEXT UP</p>
                    <p className={styles.description}>
                        {waitingCount} task{waitingCount !== 1 ? 's' : ''} waiting in your matrix
                    </p>
                </div>
                <div className={styles.arrow}>
                    <span>Prioritize now</span>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
