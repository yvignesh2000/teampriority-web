/**
 * Command Center - The Unified Execution Dashboard
 * Primary screen showing weekly direction + daily focus + next actions
 */

'use client';

import React from 'react';
import styles from './command-center.module.css';

export default function CommandCenterPage() {
    return (
        <div className={styles.commandCenter}>
            <div className={styles.container}>
                {/* Temporary: Simple test to prove page renders */}
                <div style={{ padding: '48px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '16px' }}>
                        ✅ Command Center is Live!
                    </h1>
                    <p style={{ fontSize: '15px', color: '#64748B' }}>
                        This is the new homepage. The full Command Center with WeeklyGoalCard and Top3List will be added next.
                    </p>
                    <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '24px' }}>
                        Navigation has been simplified to 4 items. Phase 1 foundation is complete.
                    </p>
                </div>
            </div>
        </div>
    );
}
