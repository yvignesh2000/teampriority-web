'use client';

import { useState, useEffect, useCallback } from 'react';
import { Top3Item } from '@/lib/types';
import { localDb } from '@/lib/db/dexie';
import { SyncEngine } from '@/lib/db/sync';
import { useAuth } from '@/lib/context/AuthContext';
import { getToday, isSameDay } from '@/lib/utils/dates';
import { where } from '@/lib/firebase/firestore';

const top3Sync = new SyncEngine<Top3Item>('top3Items', localDb.top3Items);

export function useTop3() {
    const [items, setItems] = useState<Top3Item[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const loadItems = useCallback(async () => {
        if (!user) return;

        try {
            const allItems = await top3Sync.query(i => i.userId === user.id);
            setItems(allItems);
        } catch (error) {
            console.error('Error loading top 3 items:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadItems();

        if (user && typeof navigator !== 'undefined' && navigator.onLine) {
            top3Sync.startRealtimeSync([
                where('userId', '==', user.id),
                where('isDeleted', '==', false),
            ]);
        }

        return () => {
            top3Sync.stopRealtimeSync();
        };
    }, [user, loadItems]);

    const getTodayItems = useCallback(() => {
        const today = getToday();
        return items
            .filter(i => isSameDay(i.date, today))
            .sort((a, b) => a.order - b.order);
    }, [items]);

    const getItemsForDate = useCallback((date: Date) => {
        return items
            .filter(i => isSameDay(i.date, date))
            .sort((a, b) => a.order - b.order);
    }, [items]);

    const createItem = useCallback(async (data: {
        content: string;
        linkedTaskId?: string;
        date?: Date;
    }) => {
        if (!user) throw new Error('Not authenticated');

        const date = data.date || getToday();
        const existingItems = items.filter(i => isSameDay(i.date, date) && i.userId === user.id);

        if (existingItems.length >= 3) {
            throw new Error('Maximum 3 items per day');
        }

        const item = await top3Sync.create({
            organizationId: user.organizationId!,
            content: data.content,
            linkedTaskId: data.linkedTaskId,
            date,
            userId: user.id,
            order: existingItems.length + 1,
            isCompleted: false,
            isDeleted: false,
        });

        setItems(prev => [...prev, item]);
        return item;
    }, [user, items]);

    const updateItem = useCallback(async (id: string, updates: Partial<Top3Item>) => {
        const updated = await top3Sync.update(id, updates);
        if (updated) {
            setItems(prev => prev.map(i => i.id === id ? updated : i));
        }
        return updated;
    }, []);

    const deleteItem = useCallback(async (id: string) => {
        const success = await top3Sync.delete(id);
        if (success) {
            setItems(prev => prev.filter(i => i.id !== id));
        }
        return success;
    }, []);

    const toggleComplete = useCallback(async (id: string) => {
        const item = items.find(i => i.id === id);
        if (item) {
            return updateItem(id, { isCompleted: !item.isCompleted });
        }
    }, [items, updateItem]);

    return {
        items,
        loading,
        getTodayItems,
        getItemsForDate,
        createItem,
        updateItem,
        deleteItem,
        toggleComplete,
        refresh: loadItems,
    };
}
