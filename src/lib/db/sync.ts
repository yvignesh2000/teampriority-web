import { v4 as uuidv4 } from 'uuid';
import { localDb } from './dexie';
import {
    createDocument,
    updateDocument,
    queryDocuments,
    subscribeToQuery,
    where,
    orderBy,
} from '@/lib/firebase/firestore';
import { SyncQueueEntry, SyncOperation } from '@/lib/types';

// Add an operation to the sync queue
async function addToSyncQueue(
    collection: string,
    documentId: string,
    operation: SyncOperation,
    data: Record<string, unknown>
): Promise<void> {
    await localDb.syncQueue.add({
        collection,
        documentId,
        operation,
        data,
        createdAt: new Date(),
        retryCount: 0,
    });
}

// Process sync queue
export async function processSyncQueue(): Promise<void> {
    const entries = await localDb.syncQueue.orderBy('createdAt').toArray();

    for (const entry of entries) {
        try {
            if (entry.operation === 'CREATE' || entry.operation === 'UPDATE') {
                const docData = {
                    id: entry.documentId,
                    ...entry.data,
                };

                if (entry.operation === 'CREATE') {
                    await createDocument(entry.collection, docData as { id: string });
                } else {
                    await updateDocument(entry.collection, docData as { id: string });
                }
            }
            // DELETE operations - soft delete already applied locally

            // Remove from queue on success
            await localDb.syncQueue.delete(entry.id!);
        } catch (error) {
            console.error('Sync error for entry:', entry, error);
            // Increment retry count
            await localDb.syncQueue.update(entry.id!, { retryCount: entry.retryCount + 1 });

            // If too many retries, remove from queue
            if (entry.retryCount >= 5) {
                console.error('Max retries reached, removing from queue:', entry);
                await localDb.syncQueue.delete(entry.id!);
            }
        }
    }
}

// Check if online and process queue
export async function trySyncQueue(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
        await processSyncQueue();
    }
}

// Generic sync engine for a collection
export class SyncEngine<T extends { id: string; isDeleted: boolean; version: number; updatedAt: Date }> {
    private collectionName: string;
    private localTable: any;
    private unsubscribe?: () => void;

    constructor(collectionName: string, localTable: any) {
        this.collectionName = collectionName;
        this.localTable = localTable;
    }

    // Create a new document (offline-first)
    async create(data: Omit<T, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<T> {
        const now = new Date();
        const doc = {
            ...data,
            id: uuidv4(),
            version: 1,
            createdAt: now,
            updatedAt: now,
        } as unknown as T;

        // Write to local first
        await this.localTable.put(doc);

        // Add to sync queue
        await addToSyncQueue(this.collectionName, doc.id, 'CREATE', this.prepareForFirestore(doc));

        // Try to sync immediately
        trySyncQueue();

        return doc;
    }

    // Update a document (offline-first)
    async update(id: string, updates: Partial<T>): Promise<T | null> {
        const existing = await this.localTable.get(id);
        if (!existing) return null;

        const updated: T = {
            ...existing,
            ...updates,
            version: existing.version + 1,
            updatedAt: new Date(),
        };

        // Write to local first
        await this.localTable.put(updated);

        // Add to sync queue
        await addToSyncQueue(this.collectionName, id, 'UPDATE', this.prepareForFirestore(updated));

        // Try to sync immediately
        trySyncQueue();

        return updated;
    }

    // Soft delete (offline-first)
    async delete(id: string): Promise<boolean> {
        const existing = await this.localTable.get(id);
        if (!existing) return false;

        const deleted: T = {
            ...existing,
            isDeleted: true,
            version: existing.version + 1,
            updatedAt: new Date(),
        };

        // Write to local first
        await this.localTable.put(deleted);

        // Add to sync queue
        await addToSyncQueue(this.collectionName, id, 'UPDATE', this.prepareForFirestore(deleted));

        // Try to sync immediately
        trySyncQueue();

        return true;
    }

    // Get by ID from local
    async getById(id: string): Promise<T | null> {
        const doc = await this.localTable.get(id);
        return doc && !doc.isDeleted ? doc : null;
    }

    // Get all non-deleted from local
    async getAll(): Promise<T[]> {
        return this.localTable.filter((doc: T) => !doc.isDeleted).toArray();
    }

    // Query local with filter
    async query(filter: (doc: T) => boolean): Promise<T[]> {
        return this.localTable.filter((doc: T) => !doc.isDeleted && filter(doc)).toArray();
    }

    // Subscribe to Firestore changes and sync to local
    startRealtimeSync(constraints: any[]): void {
        this.unsubscribe = subscribeToQuery<T>(
            this.collectionName,
            constraints,
            async (remoteDocs) => {
                for (const remoteDoc of remoteDocs) {
                    const localDoc = await this.localTable.get(remoteDoc.id);

                    // Conflict resolution: higher version wins
                    if (!localDoc || remoteDoc.version > localDoc.version) {
                        await this.localTable.put(remoteDoc);
                    }
                }
            }
        );
    }

    // Stop realtime sync
    stopRealtimeSync(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    // Prepare document for Firestore (convert dates to ISO strings for serialization)
    private prepareForFirestore(doc: T): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(doc)) {
            if (key === 'id') continue;
            if (value instanceof Date) {
                result[key] = value;
            } else {
                result[key] = value;
            }
        }
        return result;
    }
}

// Setup online/offline listeners
export function setupOfflineSync(): void {
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            console.log('Back online, syncing...');
            trySyncQueue();
        });
    }
}
