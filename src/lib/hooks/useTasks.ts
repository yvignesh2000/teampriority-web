'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Quadrant, TaskStatus } from '@/lib/types';
import { localDb } from '@/lib/db/dexie';
import { SyncEngine } from '@/lib/db/sync';
import { useAuth } from '@/lib/context/AuthContext';
import { where } from '@/lib/firebase/firestore';

const taskSync = new SyncEngine<Task>('tasks', localDb.tasks);

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadTasks = useCallback(async () => {
        if (!user) return;

        console.log('[useTasks] loadTasks called for user:', user.id);

        try {
            // Fetch from Firestore filtered by ownerId to get only this user's tasks
            const constraints = [
                where('ownerId', '==', user.id),
                where('isDeleted', '==', false)
            ];
            console.log('[useTasks] Fetching from Firestore with constraints:', constraints);
            const remoteTasks = await taskSync.fetchFromRemote(constraints);
            console.log('[useTasks] Fetched', remoteTasks.length, 'tasks from Firestore');
            setTasks(remoteTasks.filter(t => !t.isDeleted));
        } catch (error) {
            console.error('[useTasks] Error loading tasks:', error);
            // Fallback to local if remote fails
            const allTasks = await taskSync.getAll();
            console.log('[useTasks] Fallback to local, got', allTasks.length, 'tasks');
            setTasks(allTasks.filter(t => !t.isDeleted));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadTasks();

        // Start realtime sync if online
        if (user && typeof navigator !== 'undefined' && navigator.onLine) {
            taskSync.startRealtimeSync([
                where('ownerId', '==', user.id),
                where('isDeleted', '==', false)
            ]);
        }

        return () => {
            taskSync.stopRealtimeSync();
        };
    }, [user, loadTasks]);

    const createTask = useCallback(async (data: {
        title: string;
        description?: string;
        quadrant: Quadrant;
        topicId?: string;
        dueDate?: Date;
    }) => {
        if (!user) throw new Error('Not authenticated');

        const task = await taskSync.create({
            ...data,
            organizationId: user.organizationId!,
            status: 'TODO' as TaskStatus,
            ownerId: user.id,
            createdBy: user.id,
            isDeleted: false,
        });

        setTasks(prev => [...prev, task]);
        return task;
    }, [user]);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        const updated = await taskSync.update(id, updates);
        if (updated) {
            setTasks(prev => prev.map(t => t.id === id ? updated : t));
        }
        return updated;
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        const success = await taskSync.delete(id);
        if (success) {
            setTasks(prev => prev.filter(t => t.id !== id));
        }
        return success;
    }, []);

    const getTasksByQuadrant = useCallback((quadrant: Quadrant) => {
        return tasks.filter(t => t.quadrant === quadrant && t.status !== 'ARCHIVED');
    }, [tasks]);

    const getTasksByStatus = useCallback((status: TaskStatus) => {
        return tasks.filter(t => t.status === status);
    }, [tasks]);

    return {
        tasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        getTasksByQuadrant,
        getTasksByStatus,
        refresh: loadTasks,
    };
}
