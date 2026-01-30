import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserRole } from '@/lib/types';

export async function signUp(email: string, password: string, name: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userData: Omit<User, 'id'> = {
        email: firebaseUser.email || email,
        name,
        role: 'MEMBER' as UserRole,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Create user document in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return {
        id: firebaseUser.uid,
        ...userData,
    };
}

export async function signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
        throw new Error('User profile not found');
    }

    const userData = userDoc.data();
    return {
        id: firebaseUser.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
    };
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

export async function getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    return {
        id: firebaseUser.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
    };
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
    await setDoc(doc(db, 'users', userId), { role, updatedAt: serverTimestamp() }, { merge: true });
}
