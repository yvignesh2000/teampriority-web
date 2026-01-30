/**
 * Quick script to make Sarah Chen an admin
 * Run from the teampriority-web directory: npx ts-node scripts/make-sarah-admin.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase config from .env.local or your firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDe2KpJSHWbQPBqJVkgYqP1R8DRCxCEI84",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "teampriority-web.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "teampriority-web",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "teampriority-web.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "200381879697",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:200381879697:web:39f18e6c05b8c39b0a2e6a"
};

async function makeSarahAdmin() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const email = 'sarah.chen@docteam.com';

    console.log(`Looking for user with email: ${email}`);

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.error('❌ User not found');
        process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log(`Found user: ${userData.name} (current role: ${userData.role})`);

    if (userData.role === 'ADMIN') {
        console.log('✅ User is already an admin');
        process.exit(0);
    }

    // Update to admin
    await updateDoc(doc(db, 'users', userDoc.id), { role: 'ADMIN' });

    console.log('✅ Successfully made Sarah Chen an ADMIN!');
    console.log('');
    console.log('She can now:');
    console.log('- See the Admin Dashboard in the sidebar');
    console.log('- Create and manage topics');
    console.log('- Manage team member roles');
}

makeSarahAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
