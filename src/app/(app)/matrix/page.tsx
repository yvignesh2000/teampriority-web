'use client';

import React, { useState } from 'react';
import { useTasks } from '@/lib/hooks/useTasks';
import { usePrompts } from '@/lib/hooks/usePrompts';
import { Task, Quadrant, QUADRANT_INFO, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Banner } from '@/components/ui/Banner';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/lib/context/ToastContext';
import { useRouter } from 'next/navigation';
import styles from './matrix.module.css';

const quadrantOrder: Quadrant[] = ['UI', 'NUI', 'UNI', 'NUNI'];

export default function MatrixPage() {
    const { tasks, loading, createTask, updateTask, deleteTask, getTasksByQuadrant } = useTasks();
    const { activePrompts, dismissPrompt, getPromptInfo } = usePrompts();
    const { showToast } = useToast();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant>('UI');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openCreateModal = (quadrant: Quadrant) => {
        setSelectedQuadrant(quadrant);
        setEditingTask(null);
        setFormTitle('');
        setFormDescription('');
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setSelectedQuadrant(task.quadrant);
        setFormTitle(task.title);
        setFormDescription(task.description || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setFormTitle('');
        setFormDescription('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        setIsSubmitting(true);
        try {
            if (editingTask) {
                await updateTask(editingTask.id, {
                    title: formTitle.trim(),
                    description: formDescription.trim() || undefined,
                    quadrant: selectedQuadrant,
                });
                showToast('Task updated', 'success');
            } else {
                await createTask({
                    title: formTitle.trim(),
                    description: formDescription.trim() || undefined,
                    quadrant: selectedQuadrant,
                });
                showToast('Task created', 'success');
            }
            closeModal();
        } catch (error) {
            showToast('Failed to save task', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (task: Task, status: TaskStatus) => {
        try {
            await updateTask(task.id, { status });
            showToast(`Task marked as ${status.toLowerCase().replace('_', ' ')}`, 'success');
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        if (!editingTask) return;

        setIsSubmitting(true);
        try {
            await deleteTask(editingTask.id);
            showToast('Task deleted', 'success');
            closeModal();
        } catch (error) {
            showToast('Failed to delete task', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <PageLoading message="Loading tasks..." />;
    }

    return (
        <div className={styles.page}>
            {/* Active Prompts */}
            {activePrompts.map((type) => {
                const info = getPromptInfo(type);
                return (
                    <Banner
                        key={type}
                        variant="prompt"
                        title={info.title}
                        message={info.message}
                        actions={
                            <>
                                <Button size="sm" onClick={() => { router.push(info.action); dismissPrompt(type); }}>
                                    {info.actionLabel}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => dismissPrompt(type)}>
                                    Later
                                </Button>
                            </>
                        }
                        onClose={() => dismissPrompt(type)}
                    />
                );
            })}

            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <p className={styles.description}>
                        Prioritize tasks by urgency and importance
                    </p>
                </div>
                <Button onClick={() => openCreateModal('UI')}>+ Add Task</Button>
            </div>

            <div className={styles.grid}>
                {quadrantOrder.map((q) => {
                    const info = QUADRANT_INFO[q];
                    const quadrantTasks = getTasksByQuadrant(q);

                    return (
                        <div key={q} className={styles.quadrant}>
                            <div className={styles.quadrantHeader}>
                                <div className={styles.quadrantTitle}>
                                    <span
                                        className={styles.quadrantDot}
                                        style={{ backgroundColor: info.color }}
                                    />
                                    <div>
                                        <h3 className={styles.quadrantLabel}>{info.label}</h3>
                                        <p className={styles.quadrantSubtitle}>{info.description}</p>
                                    </div>
                                </div>
                                <span className={styles.quadrantCount}>{quadrantTasks.length}</span>
                            </div>

                            <div className={styles.quadrantBody}>
                                {quadrantTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={styles.taskCard}
                                        onClick={() => openEditModal(task)}
                                    >
                                        <h4 className={styles.taskTitle}>{task.title}</h4>
                                        <div className={styles.taskMeta}>
                                            <span className={styles.taskStatus}>
                                                <span
                                                    className={`${styles.statusDot} ${task.status === 'TODO'
                                                            ? styles.statusTodo
                                                            : task.status === 'IN_PROGRESS'
                                                                ? styles.statusProgress
                                                                : styles.statusDone
                                                        }`}
                                                />
                                                {task.status === 'TODO' ? 'To Do' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    className={styles.addTaskButton}
                                    onClick={() => openCreateModal(q)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M7 1v12M1 7h12" />
                                    </svg>
                                    Add Task
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingTask ? 'Edit Task' : 'New Task'}
                footer={
                    <>
                        {editingTask && (
                            <Button variant="danger" onClick={handleDelete} disabled={isSubmitting}>
                                Delete
                            </Button>
                        )}
                        <div style={{ flex: 1 }} />
                        <Button variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!formTitle.trim() || isSubmitting}>
                            {isSubmitting ? 'Saving...' : editingTask ? 'Update' : 'Create'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Title"
                        placeholder="What needs to be done?"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                        autoFocus
                    />

                    <Textarea
                        label="Description (optional)"
                        placeholder="Add more details..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                    />

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.5rem', display: 'block' }}>
                            Quadrant
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {quadrantOrder.map((q) => {
                                const info = QUADRANT_INFO[q];
                                const isSelected = selectedQuadrant === q;
                                return (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() => setSelectedQuadrant(q)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: isSelected ? `2px solid ${info.color}` : '1px solid var(--color-gray-200)',
                                            background: isSelected ? `${info.color}10` : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span
                                                style={{
                                                    width: '0.5rem',
                                                    height: '0.5rem',
                                                    borderRadius: '50%',
                                                    backgroundColor: info.color,
                                                }}
                                            />
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-gray-900)' }}>
                                                {info.description}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                                            {info.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {editingTask && (
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-700)', marginBottom: '0.5rem', display: 'block' }}>
                                Status
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((status) => (
                                    <Button
                                        key={status}
                                        type="button"
                                        variant={editingTask.status === status ? 'primary' : 'secondary'}
                                        size="sm"
                                        onClick={() => handleStatusChange(editingTask, status)}
                                    >
                                        {status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
}
