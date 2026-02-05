/**
 * Top3List Component
 * Enhanced daily focus list with outcome links and inline proof
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTop3 } from '@/lib/hooks/useTop3';
import { useGoals } from '@/lib/hooks/useGoals';
import { Top3Item as Top3ItemType } from '@/lib/types';
import styles from './Top3List.module.css';

export function Top3List() {
    const { user } = useAuth();
    const { getTodayItems, createItem, updateItem, deleteItem } = useTop3();
    const { getOutcomesForGoal, getCurrentWeekGoal } = useGoals();
    const [newItemText, setNewItemText] = useState('');
    const [showingProofFor, setShowingProofFor] = useState<string | null>(null);

    const items = getTodayItems();
    const currentGoal = getCurrentWeekGoal();
    const outcomes = currentGoal ? getOutcomesForGoal(currentGoal.id) : [];

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim()) return;

        await createItem({ content: newItemText.trim() });
        setNewItemText('');
    };

    const handleToggleComplete = async (item: Top3ItemType) => {
        await updateItem(item.id, { isCompleted: !item.isCompleted });

        // Show proof prompt if completing
        if (!item.isCompleted) {
            setShowingProofFor(item.id);
            // Auto-hide after 5 seconds
            setTimeout(() => setShowingProofFor(null), 5000);
        }
    };

    const completedCount = items.filter(i => i.isCompleted).length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>TODAY'S FOCUS</h2>
                    <p className={styles.subtitle}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        })}
                        {items.length > 0 && ` · ${completedCount} of ${items.length} completed`}
                    </p>
                </div>
            </div>

            <div className={styles.list}>
                {items.map((item, index) => (
                    <Top3ItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        outcomes={outcomes}
                        showProofPrompt={showingProofFor === item.id}
                        onToggle={() => handleToggleComplete(item)}
                        onDelete={() => deleteItem(item.id)}
                        onUpdate={(updates) => updateItem(item.id, updates)}
                    />
                ))}

                {items.length < 3 && (
                    <form onSubmit={handleAddItem} className={styles.addForm}>
                        <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder={`Priority ${items.length + 1}`}
                            className={styles.input}
                            autoFocus={items.length === 0}
                        />
                    </form>
                )}
            </div>

            {items.length === 0 && (
                <div className={styles.emptyState}>
                    <p className={styles.emptyText}>
                        What are your top 3 priorities today?
                    </p>
                    <p className={styles.emptyHint}>
                        Pull from your Matrix or start fresh
                    </p>
                </div>
            )}
        </div>
    );
}

interface Top3ItemCardProps {
    item: Top3ItemType;
    index: number;
    outcomes: any[];
    showProofPrompt: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onUpdate: (updates: Partial<Top3ItemType>) => void;
}

function Top3ItemCard({ item, index, outcomes, showProofPrompt, onToggle, onDelete, onUpdate }: Top3ItemCardProps) {
    const linkedOutcome = outcomes.find(o => o.id === item.linkedOutcomeId);
    const quadrantColor = getQuadrantColor(item.quadrant);

    return (
        <div className={`${styles.itemCard} ${item.isCompleted ? styles.completed : ''}`}>
            <div className={styles.itemMain}>
                <button
                    onClick={onToggle}
                    className={styles.checkbox}
                    aria-label={item.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                >
                    {item.isCompleted ? (
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                        </svg>
                    ) : (
                        <div className={styles.checkboxEmpty} />
                    )}
                </button>

                <div className={styles.itemContent}>
                    <p className={styles.itemText}>{item.content}</p>

                    {linkedOutcome && (
                        <div className={styles.linkedOutcome}>
                            <span className={styles.linkIcon}>└─</span>
                            <span className={styles.linkText}>Links to: {linkedOutcome.description}</span>
                        </div>
                    )}

                    {item.isCompleted && item.proofText && (
                        <div className={styles.proof}>
                            <span className={styles.proofIcon}>✓</span>
                            <span className={styles.proofText}>{item.proofText}</span>
                        </div>
                    )}

                    {showProofPrompt && !item.proofText && (
                        <div className={styles.proofPrompt}>
                            <input
                                type="text"
                                placeholder="What did you accomplish? (optional)"
                                className={styles.proofInput}
                                onBlur={(e) => {
                                    if (e.target.value.trim()) {
                                        onUpdate({ proofText: e.target.value.trim() });
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onUpdate({ proofText: (e.target as HTMLInputElement).value.trim() });
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {item.quadrant && (
                    <span
                        className={styles.quadrantBadge}
                        style={{ backgroundColor: quadrantColor }}
                    >
                        {item.quadrant}
                    </span>
                )}
            </div>
        </div>
    );
}

function getQuadrantColor(quadrant?: string): string {
    switch (quadrant) {
        case 'Q1': return '#EF4444';
        case 'Q2': return '#3B82F6';
        case 'Q3': return '#F59E0B';
        case 'Q4': return '#64748B';
        default: return '#94A3B8';
    }
}
