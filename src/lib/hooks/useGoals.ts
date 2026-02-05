'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeeklyGoal, GoalOutcome } from '@/lib/types';
import { localDb } from '@/lib/db/dexie';
import { SyncEngine } from '@/lib/db/sync';
import { useAuth } from '@/lib/context/AuthContext';
import { getWeekStart, isSameWeek } from '@/lib/utils/dates';
import { where } from '@/lib/firebase/firestore';

const goalSync = new SyncEngine<WeeklyGoal>('weeklyGoals', localDb.weeklyGoals);
const outcomeSync = new SyncEngine<GoalOutcome>('goalOutcomes', localDb.goalOutcomes);

export function useGoals() {
    const [goals, setGoals] = useState<WeeklyGoal[]>([]);
    const [outcomes, setOutcomes] = useState<GoalOutcome[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadGoals = useCallback(async () => {
        if (!user) return;

        try {
            const allGoals = await goalSync.query(g => g.userId === user.id);
            const allOutcomes = await outcomeSync.query(o => o.userId === user.id);
            setGoals(allGoals);
            setOutcomes(allOutcomes);
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadGoals();

        if (user && typeof navigator !== 'undefined' && navigator.onLine) {
            goalSync.startRealtimeSync([
                where('userId', '==', user.id),
                where('isDeleted', '==', false),
            ]);
            outcomeSync.startRealtimeSync([
                where('userId', '==', user.id),
                where('isDeleted', '==', false),
            ]);
        }

        return () => {
            goalSync.stopRealtimeSync();
            outcomeSync.stopRealtimeSync();
        };
    }, [user, loadGoals]);

    const getCurrentWeekGoal = useCallback(() => {
        const weekStart = getWeekStart();
        return goals.find(g => isSameWeek(g.weekStart, weekStart));
    }, [goals]);

    const getGoalForWeek = useCallback((weekStart: Date) => {
        return goals.find(g => isSameWeek(g.weekStart, weekStart));
    }, [goals]);

    const getOutcomesForGoal = useCallback((goalId: string) => {
        return outcomes.filter(o => o.goalId === goalId).sort((a, b) => a.order - b.order);
    }, [outcomes]);

    const createGoal = useCallback(async (data: {
        title: string;
        description?: string;
        weekStart?: Date;
    }) => {
        if (!user) throw new Error('Not authenticated');

        const weekStart = data.weekStart || getWeekStart();

        // Check if goal already exists for this week
        const existing = goals.find(g => isSameWeek(g.weekStart, weekStart));
        if (existing) {
            // Update existing goal instead
            return updateGoal(existing.id, { title: data.title, description: data.description });
        }

        const goal = await goalSync.create({
            organizationId: user.organizationId!,
            title: data.title,
            description: data.description,
            weekStart,
            userId: user.id,
            isDeleted: false,
        });

        setGoals(prev => [...prev, goal]);
        return goal;
    }, [user, goals]);

    const updateGoal = useCallback(async (id: string, updates: Partial<WeeklyGoal>) => {
        const updated = await goalSync.update(id, updates);
        if (updated) {
            setGoals(prev => prev.map(g => g.id === id ? updated : g));
        }
        return updated;
    }, []);

    const createOutcome = useCallback(async (data: {
        goalId: string;
        description: string;
        definitionOfDone?: string;
        linkedTaskId?: string;
    }) => {
        if (!user) throw new Error('Not authenticated');

        const existingOutcomes = outcomes.filter(o => o.goalId === data.goalId);
        if (existingOutcomes.length >= 3) {
            throw new Error('Maximum 3 outcomes per goal');
        }

        const outcome = await outcomeSync.create({
            ...data,
            organizationId: user.organizationId!,
            definitionOfDone: data.definitionOfDone || '',
            userId: user.id,
            isCompleted: false,
            order: existingOutcomes.length + 1,
            isDeleted: false,
        });

        setOutcomes(prev => [...prev, outcome]);
        return outcome;
    }, [user, outcomes]);

    const updateOutcome = useCallback(async (id: string, updates: Partial<GoalOutcome>) => {
        const updated = await outcomeSync.update(id, updates);
        if (updated) {
            setOutcomes(prev => prev.map(o => o.id === id ? updated : o));
        }
        return updated;
    }, []);

    const deleteOutcome = useCallback(async (id: string) => {
        const success = await outcomeSync.delete(id);
        if (success) {
            setOutcomes(prev => prev.filter(o => o.id !== id));
        }
        return success;
    }, []);

    return {
        goals,
        outcomes,
        loading,
        getCurrentWeekGoal,
        getGoalForWeek,
        getOutcomesForGoal,
        createGoal,
        updateGoal,
        createOutcome,
        updateOutcome,
        deleteOutcome,
        refresh: loadGoals,
    };
}
