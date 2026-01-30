'use client';

import React, { useState, useEffect } from 'react';
import { Topic } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { localDb } from '@/lib/db/dexie';
import { SyncEngine } from '@/lib/db/sync';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { EmptyState, EmptyIcons } from '@/components/ui/EmptyState';
import { Banner } from '@/components/ui/Banner';
import styles from './topics.module.css';

const topicSync = new SyncEngine<Topic>('topics', localDb.topics);

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

export default function TopicsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        const loadTopics = async () => {
            const allTopics = await topicSync.getAll();
            setTopics(allTopics);
            setLoading(false);
        };
        loadTopics();
    }, []);

    const openCreate = () => {
        setEditingTopic(null);
        setName('');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setIsModalOpen(true);
    };

    const openEdit = (topic: Topic) => {
        setEditingTopic(topic);
        setName(topic.name);
        setColor(topic.color);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTopic(null);
        setName('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !user) return;

        setIsSubmitting(true);
        try {
            if (editingTopic) {
                const updated = await topicSync.update(editingTopic.id, {
                    name: name.trim(),
                    color,
                });
                if (updated) {
                    setTopics(prev => prev.map(t => t.id === editingTopic.id ? updated : t));
                }
                showToast('Topic updated', 'success');
            } else {
                const newTopic = await topicSync.create({
                    name: name.trim(),
                    color,
                    createdBy: user.id,
                    isDeleted: false,
                });
                setTopics(prev => [...prev, newTopic]);
                showToast('Topic created', 'success');
            }
            closeModal();
        } catch (error) {
            showToast('Failed to save topic', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!editingTopic) return;

        setIsSubmitting(true);
        try {
            await topicSync.delete(editingTopic.id);
            setTopics(prev => prev.filter(t => t.id !== editingTopic.id));
            showToast('Topic deleted', 'success');
            closeModal();
        } catch (error) {
            showToast('Failed to delete topic', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <PageLoading message="Loading topics..." />;
    }

    return (
        <div className={styles.page}>
            {!isAdmin && (
                <Banner
                    variant="info"
                    message="Only admins can create or edit topics. Contact your team admin to make changes."
                />
            )}

            <div className={styles.header}>
                <p className={styles.description}>
                    Topics help organize tasks by project or area of work.
                </p>
                {isAdmin && (
                    <Button onClick={openCreate}>+ New Topic</Button>
                )}
            </div>

            {topics.length > 0 ? (
                <div className={styles.grid}>
                    {topics.map((topic) => (
                        <Card
                            key={topic.id}
                            clickable={isAdmin}
                            onClick={isAdmin ? () => openEdit(topic) : undefined}
                        >
                            <CardBody>
                                <div className={styles.topicCard}>
                                    <span
                                        className={styles.topicColor}
                                        style={{ backgroundColor: topic.color }}
                                    />
                                    <span className={styles.topicName}>{topic.name}</span>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={EmptyIcons.list}
                    title="No topics yet"
                    description={isAdmin ? "Create topics to organize your team's tasks" : "Your team admin hasn't created any topics yet"}
                    action={isAdmin ? <Button onClick={openCreate}>Create First Topic</Button> : undefined}
                />
            )}

            {/* Topic Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingTopic ? 'Edit Topic' : 'New Topic'}
                footer={
                    <>
                        {editingTopic && (
                            <Button variant="danger" onClick={handleDelete} disabled={isSubmitting}>
                                Delete
                            </Button>
                        )}
                        <div style={{ flex: 1 }} />
                        <Button variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Topic Name"
                        placeholder="e.g., Product Launch"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                    />

                    <div>
                        <label className={styles.colorLabel}>Color</label>
                        <div className={styles.colorGrid}>
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`${styles.colorButton} ${color === c ? styles.colorSelected : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
