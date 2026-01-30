'use client';

import React, { useState } from 'react';
import { useTop3 } from '@/lib/hooks/useTop3';
import { usePrompts } from '@/lib/hooks/usePrompts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { formatDateFull, getToday } from '@/lib/utils/dates';
import styles from './top3.module.css';

export default function Top3Page() {
    const { loading, getTodayItems, createItem, deleteItem, toggleComplete } = useTop3();
    const { completePrompt } = usePrompts();
    const { showToast } = useToast();

    const [newItem, setNewItem] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const todayItems = getTodayItems();
    const completedCount = todayItems.filter(i => i.isCompleted).length;
    const today = getToday();

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim() || todayItems.length >= 3) return;

        setIsSubmitting(true);
        try {
            await createItem({ content: newItem.trim() });
            setNewItem('');
            showToast('Added to Top 3', 'success');

            // Mark prompt as complete if this was the 3rd item
            if (todayItems.length === 2) {
                completePrompt('TOP3_MORNING');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to add item', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await toggleComplete(id);
        } catch (error) {
            showToast('Failed to update', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteItem(id);
            showToast('Item removed', 'success');
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    if (loading) {
        return <PageLoading message="Loading..." />;
    }

    // Create slots for the 3 items
    const slots = [1, 2, 3].map((num) => {
        const item = todayItems.find(i => i.order === num);
        return { num, item };
    });

    return (
        <div className={styles.page}>
            <div className={styles.dateHeader}>
                <span className={styles.dateLabel}>{formatDateFull(today)}</span>
            </div>

            <div className={styles.card}>
                <p className={styles.instruction}>
                    What are the 3 most important things you need to accomplish today?
                </p>

                <div className={styles.itemList}>
                    {slots.map(({ num, item }) => (
                        item ? (
                            <div
                                key={item.id}
                                className={`${styles.item} ${item.isCompleted ? styles.itemCompleted : ''}`}
                            >
                                <span className={styles.itemNumber}>{num}</span>
                                <div className={styles.itemContent}>
                                    <span className={styles.itemText}>{item.content}</span>
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        className={`${styles.itemButton} ${styles.check}`}
                                        onClick={() => handleToggle(item.id)}
                                        title={item.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={item.isCompleted ? 'var(--color-success)' : 'currentColor'} strokeWidth="2">
                                            <path d="M15 4.5L6.75 12.75L3 9" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <button
                                        className={`${styles.itemButton} ${styles.delete}`}
                                        onClick={() => handleDelete(item.id)}
                                        title="Remove"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div key={num} className={styles.emptySlot}>
                                <span className={styles.emptyNumber}>{num}</span>
                                <span className={styles.emptyText}>Not set yet</span>
                            </div>
                        )
                    ))}
                </div>

                {todayItems.length < 3 && (
                    <form className={styles.addForm} onSubmit={handleAddItem}>
                        <Input
                            placeholder="Add a priority..."
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <Button type="submit" disabled={!newItem.trim() || isSubmitting}>
                            {isSubmitting ? '...' : 'Add'}
                        </Button>
                    </form>
                )}

                <div className={styles.progress}>
                    <p className={styles.progressText}>
                        <span className={styles.progressCount}>{completedCount} of {todayItems.length}</span> completed
                    </p>
                </div>
            </div>
        </div>
    );
}
