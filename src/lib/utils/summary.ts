import { ProofLog, WeeklyGoal, GoalOutcome, PROOF_TYPE_INFO } from '@/lib/types';
import { formatDate, formatWeekRange, getWeekStart, getWeekEnd } from './dates';
import { calculateWeeklyScore, getScoreLabel } from './scoring';

export interface WeeklySummaryData {
    weekStart: Date;
    goal?: WeeklyGoal;
    outcomes: GoalOutcome[];
    proofLogs: ProofLog[];
    score: number;
}

export function generateWeeklySummary(data: WeeklySummaryData): string {
    const { weekStart, goal, outcomes, proofLogs, score } = data;

    const lines: string[] = [];

    // Header
    lines.push(`# Weekly Summary: ${formatWeekRange(weekStart)}`);
    lines.push('');

    // Score
    lines.push(`**Proof Score: ${score}** — ${getScoreLabel(score)}`);
    lines.push('');

    // Weekly Goal
    if (goal) {
        lines.push('## Weekly Goal');
        lines.push(`**${goal.title}**`);
        if (goal.description) {
            lines.push(goal.description);
        }
        lines.push('');

        // Outcomes
        if (outcomes.length > 0) {
            lines.push('### Key Outcomes');
            for (const outcome of outcomes) {
                const status = outcome.isCompleted ? '✅' : '⬜';
                lines.push(`- ${status} ${outcome.description}`);
            }
            lines.push('');
        }
    }

    // Proof Log Summary
    if (proofLogs.length > 0) {
        lines.push('## What I Accomplished');
        lines.push('');

        // Group by type
        const shipped = proofLogs.filter(l => l.type === 'SHIPPED');
        const solved = proofLogs.filter(l => l.type === 'SOLVED');
        const improved = proofLogs.filter(l => l.type === 'IMPROVED');

        if (shipped.length > 0) {
            lines.push('### 🚀 Shipped');
            for (const log of shipped) {
                lines.push(`- ${log.content}${log.impactTag === 'HIGH' ? ' ⭐' : ''}`);
            }
            lines.push('');
        }

        if (solved.length > 0) {
            lines.push('### 🔧 Solved');
            for (const log of solved) {
                lines.push(`- ${log.content}${log.impactTag === 'HIGH' ? ' ⭐' : ''}`);
            }
            lines.push('');
        }

        if (improved.length > 0) {
            lines.push('### ✨ Improved');
            for (const log of improved) {
                lines.push(`- ${log.content}${log.impactTag === 'HIGH' ? ' ⭐' : ''}`);
            }
            lines.push('');
        }
    } else {
        lines.push('## What I Accomplished');
        lines.push('_No proof logs recorded this week._');
        lines.push('');
    }

    // Stats
    lines.push('---');
    lines.push(`*Generated on ${formatDate(new Date())}*`);

    return lines.join('\n');
}

export function generateProofExport(proofLogs: ProofLog[], title: string = 'Proof Log Export'): string {
    const lines: string[] = [];

    lines.push(`# ${title}`);
    lines.push('');

    // Group by date
    const byDate = new Map<string, ProofLog[]>();
    for (const log of proofLogs) {
        const dateKey = formatDate(log.date);
        const existing = byDate.get(dateKey) || [];
        existing.push(log);
        byDate.set(dateKey, existing);
    }

    // Sort dates descending
    const sortedDates = Array.from(byDate.keys()).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    for (const dateKey of sortedDates) {
        const logs = byDate.get(dateKey)!;
        lines.push(`## ${dateKey}`);

        for (const log of logs) {
            const emoji = PROOF_TYPE_INFO[log.type].emoji;
            const impact = log.impactTag === 'HIGH' ? ' ⭐' : log.impactTag === 'MEDIUM' ? ' •' : '';
            lines.push(`- ${emoji} ${log.content}${impact}`);
        }
        lines.push('');
    }

    lines.push('---');
    lines.push(`*Exported on ${formatDate(new Date())}*`);

    return lines.join('\n');
}
