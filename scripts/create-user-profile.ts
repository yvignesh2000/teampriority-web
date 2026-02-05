/**
 * Create User Profile Script
 * 
 * This script creates a Firestore user document for an existing Firebase Auth user.
 * Run this if a user exists in Firebase Auth but is missing their Firestore profile.
 * 
 * Usage:
 * npx ts-node scripts/create-user-profile.ts <user-email> <user-name> [role]
 * 
 * Examples:
 * npx ts-node scripts/create-user-profile.ts user@example.com "John Doe"
 * npx ts-node scripts/create-user-profile.ts admin@example.com "Admin User" ADMIN
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'service-account-key.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} catch (error) {
    console.error('❌ Error: service-account-key.json not found');
    console.log('');
    console.log('To use this script:');
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('2. Click "Generate New Private Key"');
    console.log('3. Save the file as: scripts/service-account-key.json');
    console.log('4. Run this script again');
    process.exit(1);
}

async function createUserProfile(email: string, name: string, role: 'MEMBER' | 'ADMIN' = 'MEMBER') {
    const auth = admin.auth();
    const db = admin.firestore();

    try {
        // Get the user from Firebase Auth
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;

        console.log(`✓ Found user in Firebase Auth: ${email} (${uid})`);

        // Check if user document already exists
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            console.log(`✓ User profile already exists in Firestore`);
            console.log(`  Current data:`, userDoc.data());
            process.exit(0);
        }

        // Create the user document
        const userData = {
            email: email,
            name: name,
            role: role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('users').doc(uid).set(userData);

        console.log('');
        console.log(`✅ Successfully created user profile!`);
        console.log(`  Email: ${email}`);
        console.log(`  Name: ${name}`);
        console.log(`  Role: ${role}`);
        console.log(`  UID: ${uid}`);
        console.log('');
        console.log('The user can now log in to the app.');
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.error(`❌ No user found with email: ${email}`);
            console.log('');
            console.log('The user must exist in Firebase Authentication first.');
            console.log('Either sign up through the app or create the user in Firebase Console.');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

// Parse command line arguments
const email = process.argv[2];
const name = process.argv[3];
const role = (process.argv[4] as 'MEMBER' | 'ADMIN') || 'MEMBER';

if (!email || !name) {
    console.log('Usage: npx ts-node scripts/create-user-profile.ts <email> <name> [role]');
    console.log('');
    console.log('Examples:');
    console.log('  npx ts-node scripts/create-user-profile.ts user@example.com "John Doe"');
    console.log('  npx ts-node scripts/create-user-profile.ts admin@example.com "Admin User" ADMIN');
    process.exit(1);
}

if (role !== 'MEMBER' && role !== 'ADMIN') {
    console.error('❌ Role must be either MEMBER or ADMIN');
    process.exit(1);
}

createUserProfile(email, name, role)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
