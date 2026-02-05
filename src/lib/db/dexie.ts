import Dexie, { Table } from 'dexie';
import {
    Organization,
    User,
    Task,
    Topic,
    WeeklyGoal,
    GoalOutcome,
    Top3Item,
    ProofLog,
    WeeklySummary,
    SyncQueueEntry,
    SyncMeta,
} from '@/lib/types';

export class TeamPriorityDB extends Dexie {
    organizations!: Table<Organization>;
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

        // V3: Multi-tenant SaaS schema with organizationId on all entities
        this.version(3).stores({
            organizations: 'id, ownerId, inviteCode',
            users: 'id, email, organizationId, role',
            tasks: 'id, organizationId, quadrant, status, topicId, ownerId, createdBy, outcomeId, isDeleted, updatedAt',
            topics: 'id, organizationId, name, isDeleted',
            weeklyGoals: 'id, organizationId, userId, weekStart, isDeleted',
            goalOutcomes: 'id, organizationId, goalId, userId, isDeleted',
            top3Items: 'id, organizationId, userId, date, order, isDeleted',
            proofLogs: 'id, organizationId, userId, date, type, *linkedOutcomeIds, isDeleted',
            weeklySummaries: 'id, organizationId, userId, weekStart, isDeleted',
            syncQueue: '++id, collection, documentId, operation, createdAt',
            syncMeta: 'id, collection, lastSyncedAt',
        });
    }
}

export const localDb = new TeamPriorityDB();

// Clear all local data (for logout)
export async function clearLocalData(): Promise<void> {
    await Promise.all([
        localDb.organizations.clear(),
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
