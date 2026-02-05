'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGoals } from '@/lib/hooks/useGoals';
import { useTasks } from '@/lib/hooks/useTasks';
import { useProof } from '@/lib/hooks/useProof';
import { Task, TaskStatus, PROOF_TYPE_INFO } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { formatDate } from '@/lib/utils/dates';
import styles from './detail.module.css';

export default function OutcomeDetailPage() {
    const params = useParams();
    const outcomeId = params.id as string;

    const { outcomes, loading: goalsLoading, updateOutcome } = useGoals();
    const { tasks, loading: tasksLoading, createTask, updateTask } = useTasks();
    const { logs, loading: proofLoading } = useProof();
    const { showToast } = useToast();

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const outcome = outcomes.find(o => o.id === outcomeId);

    // Get tasks linked to this outcome
    const linkedTasks = useMemo(() => {
        return tasks.filter(t => t.outcomeId === outcomeId && !t.isDeleted);
    }, [tasks, outcomeId]);

    // Get proof logs linked to this outcome
    const linkedProof = useMemo(() => {
        return logs.filter(l => l.linkedOutcomeIds?.includes(outcomeId));
    }, [logs, outcomeId]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setIsSubmitting(true);
        try {
            await createTask({
                title: newTaskTitle.trim(),
                quadrant: 'NUI', // Not Urgent but Important
            });
            // Note: We need to also set outcomeId, but createTask doesn't support it directly yet
            // We'll handle this in the updateTask after creation
            setNewTaskTitle('');
            showToast('Task added', 'success');
        } catch (error) {
            showToast('Failed to add task', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleTask = async (task: Task) => {
        const newStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        try {
            await updateTask(task.id, { status: newStatus });
        } catch (error) {
            showToast('Failed to update task', 'error');
        }
    };

    const handleToggleOutcome = async () => {
        if (!outcome) return;
        try {
            await updateOutcome(outcome.id, { isCompleted: !outcome.isCompleted });
            showToast(outcome.isCompleted ? 'Marked as in progress' : 'Marked as complete!', 'success');
        } catch (error) {
            showToast('Failed to update outcome', 'error');
        }
    };

    if (goalsLoading || tasksLoading || proofLoading) {
        return <PageLoading message="Loading outcome..." />;
    }

    if (!outcome) {
        return (
            <div className={styles.page}>
                <Link href="/outcomes" className={styles.backLink}>
                    ← Back to Outcomes
                </Link>
                <div className={styles.emptyState}>
                    Outcome not found
                </div>
            </div>
        );
    }

    const completedTasks = linkedTasks.filter(t => t.status === 'DONE').length;
    const progress = linkedTasks.length > 0
        ? Math.round((completedTasks / linkedTasks.length) * 100)
        : 0;

    return (
        <div className={styles.page}>
            <Link href="/outcomes" className={styles.backLink}>
                ← Back to Outcomes
            </Link>

            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>{outcome.description}</h1>
                    {outcome.definitionOfDone && (
                        <div className={styles.dod}>
                            <span className={styles.dodLabel}>Done when:</span>
                            <span className={styles.dodText}>{outcome.definitionOfDone}</span>
                        </div>
                    )}
                </div>
                <Button
                    variant={outcome.isCompleted ? 'secondary' : 'primary'}
                    onClick={handleToggleOutcome}
                >
                    {outcome.isCompleted ? 'Reopen' : 'Mark Complete'}
                </Button>
            </div>

            <div className={`${styles.statusBadge} ${outcome.isCompleted ? styles.completed : styles.inProgress}`}>
                {outcome.isCompleted ? '✓ Completed' : `${progress}% Complete`}
            </div>

            {/* Linked Tasks Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        Tasks ({completedTasks}/{linkedTasks.length})
                    </h3>
                </div>

                {linkedTasks.length > 0 ? (
                    <div className={styles.taskList}>
                        {linkedTasks.map((task) => (
                            <div key={task.id} className={styles.taskItem}>
                                <button
                                    className={`${styles.taskCheckbox} ${task.status === 'DONE' ? styles.checked : ''}`}
                                    onClick={() => handleToggleTask(task)}
                                >
                                    {task.status === 'DONE' && (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        </svg>
                                    )}
                                </button>
                                <div className={styles.taskContent}>
                                    <div className={`${styles.taskTitle} ${task.status === 'DONE' ? styles.completed : ''}`}>
                                        {task.title}
                                    </div>
                                    {task.nextAction && (
                                        <div className={styles.taskMeta}>
                                            Next: {task.nextAction}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        No tasks linked to this outcome yet.
                        <br />
                        Add tasks from the Inbox or create new ones below.
                    </div>
                )}

                <form className={styles.addForm} onSubmit={handleAddTask}>
                    <Input
                        placeholder="Add a new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Button type="submit" disabled={!newTaskTitle.trim() || isSubmitting}>
                        Add
                    </Button>
                </form>
            </div>

            {/* Proof Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        Proof ({linkedProof.length})
                    </h3>
                    <Link href="/proof">
                        <Button variant="ghost" size="sm">Log Proof</Button>
                    </Link>
                </div>

                {linkedProof.length > 0 ? (
                    <div className={styles.proofList}>
                        {linkedProof.map((proof) => (
                            <div key={proof.id} className={styles.proofItem}>
                                <div className={styles.proofContent}>
                                    {PROOF_TYPE_INFO[proof.type].emoji} {proof.content}
                                </div>
                                <div className={styles.proofMeta}>
                                    <span>{formatDate(proof.date)}</span>
                                    <span>{PROOF_TYPE_INFO[proof.type].label}</span>
                                    {proof.impactTag && <span>{proof.impactTag} impact</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        No proof logged for this outcome yet.
                        <br />
                        Log progress as you make it!
                    </div>
                )}
            </div>
        </div>
    );
}
