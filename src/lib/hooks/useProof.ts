'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProofLog, ProofType, ImpactTag } from '@/lib/types';
import { localDb } from '@/lib/db/dexie';
import { SyncEngine } from '@/lib/db/sync';
import { useAuth } from '@/lib/context/AuthContext';
import { getToday, isSameDay, getWeekStart, getWeekEnd } from '@/lib/utils/dates';
import { calculateDailyScore, calculateWeeklyScore } from '@/lib/utils/scoring';
import { where } from '@/lib/firebase/firestore';

const proofSync = new SyncEngine<ProofLog>('proofLogs', localDb.proofLogs);

export function useProof() {
    const [logs, setLogs] = useState<ProofLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadLogs = useCallback(async () => {
        if (!user) return;

        try {
            const allLogs = await proofSync.query(l => l.userId === user.id);
            setLogs(allLogs.sort((a, b) => b.date.getTime() - a.date.getTime()));
        } catch (error) {
            console.error('Error loading proof logs:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadLogs();

        if (user && typeof navigator !== 'undefined' && navigator.onLine) {
            proofSync.startRealtimeSync([
                where('userId', '==', user.id),
                where('isDeleted', '==', false),
            ]);
        }

        return () => {
            proofSync.stopRealtimeSync();
        };
    }, [user, loadLogs]);

    const getTodayLogs = useCallback(() => {
        const today = getToday();
        return logs.filter(l => isSameDay(l.date, today));
    }, [logs]);

    const getLogsForDate = useCallback((date: Date) => {
        return logs.filter(l => isSameDay(l.date, date));
    }, [logs]);

    const getLogsForWeek = useCallback((weekStart: Date) => {
        const weekEnd = getWeekEnd(weekStart);
        return logs.filter(l => l.date >= weekStart && l.date <= weekEnd);
    }, [logs]);

    const getLogsForLast30Days = useCallback(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return logs.filter(l => l.date >= thirtyDaysAgo);
    }, [logs]);

    const getTodayScore = useCallback(() => {
        return calculateDailyScore(getTodayLogs());
    }, [getTodayLogs]);

    const getWeekScore = useCallback((weekStart?: Date) => {
        const start = weekStart || getWeekStart();
        return calculateWeeklyScore(getLogsForWeek(start));
    }, [getLogsForWeek]);

    const createLog = useCallback(async (data: {
        type: ProofType;
        content: string;
        category?: string;
        impactTag?: ImpactTag;
        date?: Date;
    }) => {
        if (!user) throw new Error('Not authenticated');

        const log = await proofSync.create({
            ...data,
            date: data.date || getToday(),
            userId: user.id,
            isDeleted: false,
        });

        setLogs(prev => [log, ...prev]);
        return log;
    }, [user]);

    const updateLog = useCallback(async (id: string, updates: Partial<ProofLog>) => {
        const updated = await proofSync.update(id, updates);
        if (updated) {
            setLogs(prev => prev.map(l => l.id === id ? updated : l));
        }
        return updated;
    }, []);

    const deleteLog = useCallback(async (id: string) => {
        const success = await proofSync.delete(id);
        if (success) {
            setLogs(prev => prev.filter(l => l.id !== id));
        }
        return success;
    }, []);

    return {
        logs,
        loading,
        getTodayLogs,
        getLogsForDate,
        getLogsForWeek,
        getLogsForLast30Days,
        getTodayScore,
        getWeekScore,
        createLog,
        updateLog,
        deleteLog,
        refresh: loadLogs,
    };
}
