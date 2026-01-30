import { ProofLog, PROOF_TYPE_INFO, IMPACT_MULTIPLIERS, ImpactTag } from '@/lib/types';

export function calculateDailyScore(logs: ProofLog[]): number {
    let score = 0;

    for (const log of logs) {
        const basePoints = PROOF_TYPE_INFO[log.type].basePoints;
        const multiplier = IMPACT_MULTIPLIERS[log.impactTag || 'LOW'];
        score += basePoints * multiplier;
    }

    return Math.round(score);
}

export function calculateWeeklyScore(logs: ProofLog[]): number {
    return logs.reduce((total, log) => {
        const basePoints = PROOF_TYPE_INFO[log.type].basePoints;
        const multiplier = IMPACT_MULTIPLIERS[log.impactTag || 'LOW'];
        return total + basePoints * multiplier;
    }, 0);
}

export function getScoreLabel(score: number): string {
    if (score >= 50) return 'Exceptional Week';
    if (score >= 35) return 'Strong Week';
    if (score >= 20) return 'Solid Week';
    if (score >= 10) return 'Making Progress';
    return 'Getting Started';
}

export function getScoreColor(score: number): string {
    if (score >= 50) return 'var(--color-success)';
    if (score >= 35) return '#10b981';
    if (score >= 20) return '#3b82f6';
    if (score >= 10) return '#f59e0b';
    return '#6b7280';
}

export function getDailyScoreBreakdown(logs: ProofLog[]): {
    shipped: number;
    solved: number;
    improved: number;
    total: number;
} {
    const shipped = logs.filter(l => l.type === 'SHIPPED').length;
    const solved = logs.filter(l => l.type === 'SOLVED').length;
    const improved = logs.filter(l => l.type === 'IMPROVED').length;

    return {
        shipped,
        solved,
        improved,
        total: shipped + solved + improved,
    };
}
