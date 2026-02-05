'use client';

import React, { useState } from 'react';
import { useGoals } from '@/lib/hooks/useGoals';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { getWeekStart, formatWeekRange, getRelativeDay } from '@/lib/utils/dates';
import styles from './goals.module.css';

export default function GoalsPage() {
    const {
        loading,
        getCurrentWeekGoal,
        getGoalForWeek,
        getOutcomesForGoal,
        createGoal,
        updateGoal,
        createOutcome,
        updateOutcome,
        deleteOutcome,
    } = useGoals();
    const { showToast } = useToast();

    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalDescription, setGoalDescription] = useState('');
    const [newOutcome, setNewOutcome] = useState('');
    const [newOutcomeDoD, setNewOutcomeDoD] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const weekStart = getWeekStart(getRelativeDay(currentWeekOffset * 7));
    const currentGoal = getGoalForWeek(weekStart);
    const outcomes = currentGoal ? getOutcomesForGoal(currentGoal.id) : [];

    const openGoalModal = () => {
        setGoalTitle(currentGoal?.title || '');
        setGoalDescription(currentGoal?.description || '');
        setIsGoalModalOpen(true);
    };

    const closeGoalModal = () => {
        setIsGoalModalOpen(false);
        setGoalTitle('');
        setGoalDescription('');
    };

    const handleSaveGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalTitle.trim()) return;

        setIsSubmitting(true);
        try {
            if (currentGoal) {
                await updateGoal(currentGoal.id, {
                    title: goalTitle.trim(),
                    description: goalDescription.trim() || undefined,
                });
            } else {
                await createGoal({
                    title: goalTitle.trim(),
                    description: goalDescription.trim() || undefined,
                    weekStart,
                });
            }
            showToast('Goal saved', 'success');
            closeGoalModal();
        } catch (error) {
            showToast('Failed to save goal', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddOutcome = async () => {
        if (!currentGoal || !newOutcome.trim()) return;

        try {
            await createOutcome({
                goalId: currentGoal.id,
                description: newOutcome.trim(),
                definitionOfDone: newOutcomeDoD.trim() || '',
            });
            setNewOutcome('');
            setNewOutcomeDoD('');
            showToast('Outcome added', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to add outcome', 'error');
        }
    };

    const handleToggleOutcome = async (id: string, isCompleted: boolean) => {
        try {
            await updateOutcome(id, { isCompleted: !isCompleted });
        } catch (error) {
            showToast('Failed to update outcome', 'error');
        }
    };

    const handleDeleteOutcome = async (id: string) => {
        try {
            await deleteOutcome(id);
            showToast('Outcome removed', 'success');
        } catch (error) {
            showToast('Failed to delete outcome', 'error');
        }
    };

    if (loading) {
        return <PageLoading message="Loading goals..." />;
    }

    return (
        <div className={styles.page}>
            {/* Week Navigation */}
            <div className={styles.weekNav}>
                <div className={styles.weekButtons}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                    >
                        ← Previous
                    </Button>
                </div>
                <span className={styles.weekLabel}>
                    Week of {formatWeekRange(weekStart)}
                    {currentWeekOffset === 0 && ' (Current)'}
                </span>
                <div className={styles.weekButtons}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                        disabled={currentWeekOffset >= 0}
                    >
                        Next →
                    </Button>
                    {currentWeekOffset !== 0 && (
                        <Button variant="secondary" size="sm" onClick={() => setCurrentWeekOffset(0)}>
                            Today
                        </Button>
                    )}
                </div>
            </div>

            {/* Goal Display */}
            {currentGoal ? (
                <div className={styles.goalCard}>
                    <div className={styles.goalHeader}>
                        <div>
                            <h2 className={styles.goalTitle}>{currentGoal.title}</h2>
                            {currentGoal.description && (
                                <p className={styles.goalDescription}>{currentGoal.description}</p>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={openGoalModal}>
                            Edit
                        </Button>
                    </div>

                    <div className={styles.outcomesSection}>
                        <h3 className={styles.sectionTitle}>
                            Key Outcomes ({outcomes.length}/3)
                        </h3>

                        <div className={styles.outcomeList}>
                            {outcomes.map((outcome) => (
                                <div key={outcome.id} className={styles.outcomeItem}>
                                    <button
                                        className={`${styles.outcomeCheckbox} ${outcome.isCompleted ? 'checked' : ''}`}
                                        onClick={() => handleToggleOutcome(outcome.id, outcome.isCompleted)}
                                        style={outcome.isCompleted ? { backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' } : {}}
                                    >
                                        {outcome.isCompleted && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                                                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className={`${styles.outcomeText} ${outcome.isCompleted ? styles.completed : ''}`}>
                                        {outcome.description}
                                    </span>
                                    <button
                                        className={styles.outcomeDelete}
                                        onClick={() => handleDeleteOutcome(outcome.id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {outcomes.length < 3 && (
                            <div className={styles.addOutcome}>
                                <Input
                                    placeholder="Outcome description..."
                                    value={newOutcome}
                                    onChange={(e) => setNewOutcome(e.target.value)}
                                />
                                <Input
                                    placeholder="Definition of Done (when is this complete?)"
                                    value={newOutcomeDoD}
                                    onChange={(e) => setNewOutcomeDoD(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddOutcome()}
                                />
                                <Button onClick={handleAddOutcome} disabled={!newOutcome.trim()}>
                                    Add
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <h3 className={styles.emptyTitle}>No goal set for this week</h3>
                    <p className={styles.emptyText}>
                        Set a weekly direction goal to focus your effort
                    </p>
                    <Button onClick={openGoalModal}>Set Weekly Goal</Button>
                </div>
            )}

            {/* Goal Modal */}
            <Modal
                isOpen={isGoalModalOpen}
                onClose={closeGoalModal}
                title={currentGoal ? 'Edit Weekly Goal' : 'Set Weekly Goal'}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeGoalModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveGoal} disabled={!goalTitle.trim() || isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Goal'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSaveGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="What's your main focus this week?"
                        placeholder="e.g., Launch the new feature"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        required
                        autoFocus
                    />
                    <Textarea
                        label="Why is this important? (optional)"
                        placeholder="Add context or motivation..."
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                    />
                </form>
            </Modal>
        </div>
    );
}
