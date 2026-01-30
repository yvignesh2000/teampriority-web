'use client';

import { useState, useEffect, useCallback } from 'react';
import { PromptType, PromptState } from '@/lib/types';
import { getToday, isSameDay, isPastTime, isFriday, isWeekend } from '@/lib/utils/dates';

const STORAGE_KEY = 'teampriority_prompts';

// Prompt schedule (in local time)
const PROMPT_SCHEDULE: Record<PromptType, { hour: number; minute: number; condition?: () => boolean }> = {
    TOP3_MORNING: { hour: 9, minute: 30, condition: () => !isWeekend() },
    PROOF_EVENING: { hour: 18, minute: 30, condition: () => !isWeekend() },
    SUMMARY_FRIDAY: { hour: 17, minute: 0, condition: () => isFriday() },
};

export function usePrompts() {
    const [activePrompts, setActivePrompts] = useState<PromptType[]>([]);
    const [promptStates, setPromptStates] = useState<Record<PromptType, PromptState>>({} as any);

    const loadPromptStates = useCallback(() => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                for (const key of Object.keys(parsed)) {
                    if (parsed[key].lastDismissedAt) {
                        parsed[key].lastDismissedAt = new Date(parsed[key].lastDismissedAt);
                    }
                    if (parsed[key].lastCompletedAt) {
                        parsed[key].lastCompletedAt = new Date(parsed[key].lastCompletedAt);
                    }
                }
                setPromptStates(parsed);
            } catch (e) {
                console.error('Error parsing prompt states:', e);
            }
        }
    }, []);

    const savePromptStates = useCallback((states: Record<PromptType, PromptState>) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    }, []);

    const checkActivePrompts = useCallback(() => {
        const today = getToday();
        const active: PromptType[] = [];

        for (const [type, schedule] of Object.entries(PROMPT_SCHEDULE) as [PromptType, typeof PROMPT_SCHEDULE[PromptType]][]) {
            // Check condition (e.g., not weekend, is Friday)
            if (schedule.condition && !schedule.condition()) continue;

            // Check if past the scheduled time
            if (!isPastTime(schedule.hour, schedule.minute)) continue;

            // Check if already dismissed or completed today
            const state = promptStates[type];
            if (state) {
                if (state.lastDismissedAt && isSameDay(state.lastDismissedAt, today)) continue;
                if (state.lastCompletedAt && isSameDay(state.lastCompletedAt, today)) continue;
            }

            active.push(type);
        }

        setActivePrompts(active);
    }, [promptStates]);

    useEffect(() => {
        loadPromptStates();
    }, [loadPromptStates]);

    useEffect(() => {
        checkActivePrompts();

        // Check every 5 minutes
        const interval = setInterval(checkActivePrompts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [checkActivePrompts]);

    const dismissPrompt = useCallback((type: PromptType) => {
        const newStates = {
            ...promptStates,
            [type]: {
                ...promptStates[type],
                type,
                lastDismissedAt: new Date(),
            },
        };
        setPromptStates(newStates);
        savePromptStates(newStates);
        setActivePrompts(prev => prev.filter(p => p !== type));
    }, [promptStates, savePromptStates]);

    const completePrompt = useCallback((type: PromptType) => {
        const newStates = {
            ...promptStates,
            [type]: {
                ...promptStates[type],
                type,
                lastCompletedAt: new Date(),
            },
        };
        setPromptStates(newStates);
        savePromptStates(newStates);
        setActivePrompts(prev => prev.filter(p => p !== type));
    }, [promptStates, savePromptStates]);

    const getPromptInfo = useCallback((type: PromptType) => {
        switch (type) {
            case 'TOP3_MORNING':
                return {
                    title: "Set Today's Top 3",
                    message: "What are the 3 most important things you need to accomplish today?",
                    action: '/top3',
                    actionLabel: "Set Top 3",
                };
            case 'PROOF_EVENING':
                return {
                    title: "Log Your Proof",
                    message: "What did you ship, solve, or improve today?",
                    action: '/proof',
                    actionLabel: "Log Proof",
                };
            case 'SUMMARY_FRIDAY':
                return {
                    title: "Generate Weekly Summary",
                    message: "Wrap up your week with a summary of accomplishments.",
                    action: '/summary',
                    actionLabel: "Generate Summary",
                };
        }
    }, []);

    return {
        activePrompts,
        promptStates,
        dismissPrompt,
        completePrompt,
        getPromptInfo,
        refresh: checkActivePrompts,
    };
}
