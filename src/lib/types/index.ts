// All TypeScript types for TeamPriority Web

export type UserRole = 'MEMBER' | 'ADMIN';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
export type Quadrant = 'UI' | 'UNI' | 'NUI' | 'NUNI';
export type ProofType = 'SHIPPED' | 'SOLVED' | 'IMPROVED';
export type ImpactTag = 'LOW' | 'MEDIUM' | 'HIGH';
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type PromptType = 'TOP3_MORNING' | 'PROOF_EVENING' | 'SUMMARY_FRIDAY';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: Quadrant;
  status: TaskStatus;
  topicId?: string;
  ownerId: string;
  createdBy: string;
  dueDate?: Date;
  linkedGoalOutcomeId?: string;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  name: string;
  color: string;
  createdBy: string;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyGoal {
  id: string;
  userId: string;
  weekStart: Date;
  title: string;
  description?: string;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalOutcome {
  id: string;
  goalId: string;
  userId: string;
  description: string;
  linkedTaskId?: string;
  isCompleted: boolean;
  order: number;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Top3Item {
  id: string;
  userId: string;
  date: Date;
  order: number;
  content: string;
  linkedTaskId?: string;
  isCompleted: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProofLog {
  id: string;
  userId: string;
  date: Date;
  type: ProofType;
  content: string;
  category?: string;
  impactTag?: ImpactTag;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklySummary {
  id: string;
  userId: string;
  weekStart: Date;
  content: string;
  isFinalized: boolean;
  score: number;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncQueueEntry {
  id?: number;
  collection: string;
  documentId: string;
  operation: SyncOperation;
  data: Record<string, unknown>;
  createdAt: Date;
  retryCount: number;
}

export interface SyncMeta {
  id: string;
  collection: string;
  lastSyncedAt: Date;
}

// Prompt state stored in localStorage
export interface PromptState {
  type: PromptType;
  lastDismissedAt?: Date;
  lastCompletedAt?: Date;
}

// Quadrant metadata
export const QUADRANT_INFO: Record<Quadrant, { label: string; description: string; color: string }> = {
  UI: { label: 'Urgent & Important', description: 'Do First', color: '#ef4444' },
  UNI: { label: 'Urgent & Not Important', description: 'Delegate', color: '#f59e0b' },
  NUI: { label: 'Not Urgent & Important', description: 'Schedule', color: '#3b82f6' },
  NUNI: { label: 'Not Urgent & Not Important', description: 'Eliminate', color: '#6b7280' },
};

// Proof type metadata
export const PROOF_TYPE_INFO: Record<ProofType, { label: string; emoji: string; basePoints: number }> = {
  SHIPPED: { label: 'Shipped', emoji: '🚀', basePoints: 5 },
  SOLVED: { label: 'Solved', emoji: '🔧', basePoints: 4 },
  IMPROVED: { label: 'Improved', emoji: '✨', basePoints: 3 },
};

// Impact multipliers
export const IMPACT_MULTIPLIERS: Record<ImpactTag, number> = {
  LOW: 1.0,
  MEDIUM: 1.5,
  HIGH: 2.0,
};
