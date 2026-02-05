/**
 * Command Center - The Unified Execution Dashboard
 * Primary screen showing weekly direction + daily focus + next actions
 */

'use client';

import React from 'react';
import { WeeklyGoalCard } from '@/components/execution/WeeklyGoalCard';
import { Top3List } from '@/components/execution/Top3List';
import { NextUpPrompt } from '@/components/execution/NextUpPrompt';
import styles from './command-center.module.css';

export default function CommandCenterPage() {
    return (
        <div className={styles.commandCenter}>
            <div className={styles.container}>
                {/* Weekly Direction - Always Visible */}
                <section className={styles.weeklySection}>
                    <WeeklyGoalCard />
                </section>

                {/* Today's Focus - Primary Content */}
                <section className={styles.focusSection}>
                    <Top3List />
                </section>

                {/* Next Up - Contextual Prompt */}
                <section className={styles.nextUpSection}>
                    <NextUpPrompt />
                </section>
            </div>
        </div>
    );
}
