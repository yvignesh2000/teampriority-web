'use client';

import React, { useState, useMemo } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import { useGoals } from '@/lib/hooks/useGoals';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { getWeekStart } from '@/lib/utils/dates';
import styles from './inbox.module.css';

export default function InboxPage() {
    const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks();
    const { getCurrentWeekGoal, getOutcomesForGoal, loading: goalsLoading } = useGoals();
    const { showToast } = useToast();

    const [newItem, setNewItem] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const currentGoal = getCurrentWeekGoal();
    const outcomes = currentGoal ? getOutcomesForGoal(currentGoal.id) : [];

    // Inbox items = tasks without an outcomeId
    const inboxItems = useMemo(() => {
        return tasks.filter(t => !t.outcomeId && t.status !== 'ARCHIVED');
    }, [tasks]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        setIsSubmitting(true);
        try {
            await createTask({
                title: newItem.trim(),
                quadrant: 'NUNI', // Default to "Not Urgent, Not Important" until assigned
            });
            setNewItem('');
            showToast('Added to Inbox', 'success');
        } catch (error) {
            showToast('Failed to add item', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openConvertModal = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleAssignToOutcome = async (outcomeId: string) => {
        if (!selectedTask) return;

        try {
            await updateTask(selectedTask.id, {
                outcomeId,
                quadrant: 'NUI', // Move to "Not Urgent, Important" when assigned
            });
            showToast('Task assigned to outcome', 'success');
            setIsModalOpen(false);
            setSelectedTask(null);
        } catch (error) {
            showToast('Failed to assign task', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTask(id);
            showToast('Item removed', 'success');
        } catch (error) {
            showToast('Failed to remove item', 'error');
        }
    };

    if (tasksLoading || goalsLoading) {
        return <PageLoading message="Loading inbox..." />;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h2 className={styles.title}>Inbox</h2>
                <span className={styles.count}>{inboxItems.length} items</span>
            </div>

            {/* Quick Add Form */}
            <form className={styles.addForm} onSubmit={handleAddItem}>
                <Input
                    placeholder="Capture a quick thought or task..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button type="submit" disabled={!newItem.trim() || isSubmitting}>
                    {isSubmitting ? '...' : 'Add'}
                </Button>
            </form>

            {/* Inbox Items */}
            {inboxItems.length > 0 ? (
                <div className={styles.list}>
                    {inboxItems.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div className={styles.itemContent}>
                                <div className={styles.itemTitle}>{item.title}</div>
                                {item.description && (
                                    <div className={styles.itemMeta}>{item.description}</div>
                                )}
                            </div>
                            <div className={styles.itemActions}>
                                <button
                                    className={styles.convertButton}
                                    onClick={() => openConvertModal(item)}
                                >
                                    Assign
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <h3 className={styles.emptyTitle}>Inbox is empty</h3>
                    <p className={styles.emptyText}>
                        Capture thoughts and tasks here, then assign them to outcomes.
                    </p>
                </div>
            )}

            {/* Assign to Outcome Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                title="Assign to Outcome"
                footer={
                    <Button variant="secondary" onClick={() => { setIsModalOpen(false); setSelectedTask(null); }}>
                        Cancel
                    </Button>
                }
            >
                {currentGoal && outcomes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: '0.5rem' }}>
                            This week&apos;s goal: <strong>{currentGoal.title}</strong>
                        </p>
                        {outcomes.map((outcome) => (
                            <button
                                key={outcome.id}
                                onClick={() => handleAssignToOutcome(outcome.id)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-gray-50)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <div style={{ fontWeight: 500 }}>{outcome.description}</div>
                                {outcome.definitionOfDone && (
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>
                                        Done when: {outcome.definitionOfDone}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-gray-500)' }}>
                        <p>No outcomes set for this week.</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Set a weekly goal and outcomes first.
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
