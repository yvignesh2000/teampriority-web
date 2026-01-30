import Dexie, { Table } from 'dexie';
import {
    Task,
    Topic,
    WeeklyGoal,
    GoalOutcome,
    Top3Item,
    ProofLog,
    WeeklySummary,
    SyncQueueEntry,
    SyncMeta,
    User,
} from '@/lib/types';

export class TeamPriorityDB extends Dexie {
    users!: Table<User>;
    tasks!: Table<Task>;
    topics!: Table<Topic>;
    weeklyGoals!: Table<WeeklyGoal>;
    goalOutcomes!: Table<GoalOutcome>;
    top3Items!: Table<Top3Item>;
    proofLogs!: Table<ProofLog>;
    weeklySummaries!: Table<WeeklySummary>;
    syncQueue!: Table<SyncQueueEntry>;
    syncMeta!: Table<SyncMeta>;

    constructor() {
        super('TeamPriorityDB');

        this.version(1).stores({
            users: 'id, email, role',
            tasks: 'id, quadrant, status, topicId, ownerId, createdBy, isDeleted, updatedAt',
            topics: 'id, name, isDeleted',
            weeklyGoals: 'id, userId, weekStart, isDeleted',
            goalOutcomes: 'id, goalId, userId, isDeleted',
            top3Items: 'id, userId, date, order, isDeleted',
            proofLogs: 'id, userId, date, type, isDeleted',
            weeklySummaries: 'id, userId, weekStart, isDeleted',
            syncQueue: '++id, collection, documentId, operation, createdAt',
            syncMeta: 'id, collection, lastSyncedAt',
        });
    }
}

export const localDb = new TeamPriorityDB();

// Clear all local data (for logout)
export async function clearLocalData(): Promise<void> {
    await Promise.all([
        localDb.users.clear(),
        localDb.tasks.clear(),
        localDb.topics.clear(),
        localDb.weeklyGoals.clear(),
        localDb.goalOutcomes.clear(),
        localDb.top3Items.clear(),
        localDb.proofLogs.clear(),
        localDb.weeklySummaries.clear(),
        localDb.syncQueue.clear(),
        localDb.syncMeta.clear(),
    ]);
}
