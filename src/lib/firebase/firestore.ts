import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    QueryConstraint,
    DocumentData,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';

// Generic Firestore helpers

export async function createDocument<T extends { id: string }>(
    collectionName: string,
    data: T
): Promise<void> {
    const { id, ...rest } = data;
    await setDoc(doc(db, collectionName, id), {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateDocument<T extends { id: string }>(
    collectionName: string,
    data: Partial<T> & { id: string }
): Promise<void> {
    const { id, ...rest } = data;
    await setDoc(
        doc(db, collectionName, id),
        {
            ...rest,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

export async function getDocument<T>(
    collectionName: string,
    docId: string
): Promise<T | null> {
    const docSnap = await getDoc(doc(db, collectionName, docId));
    if (!docSnap.exists()) return null;
    return convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as T;
}

export async function queryDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[]
): Promise<T[]> {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }) as T);
}

export function subscribeToQuery<T>(
    collectionName: string,
    constraints: QueryConstraint[],
    callback: (data: T[]) => void
): Unsubscribe {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }) as T);
        callback(data);
    });
}

// Convert Firestore Timestamps to JavaScript Dates
function convertTimestamps(data: DocumentData): DocumentData {
    const result: DocumentData = {};
    for (const [key, value] of Object.entries(data)) {
        if (value instanceof Timestamp) {
            result[key] = value.toDate();
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = convertTimestamps(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

// Date to Firestore-ready format
export function toFirestoreDate(date: Date | undefined): Timestamp | null {
    return date ? Timestamp.fromDate(date) : null;
}

// Query helpers
export { where, orderBy, Timestamp };
