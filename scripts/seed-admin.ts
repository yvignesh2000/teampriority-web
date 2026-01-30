/**
 * Seed Script for TeamPriority
 * 
 * This script creates the first admin user in the Firestore database.
 * Run this AFTER a user has signed up through the web app to promote them to admin.
 * 
 * Usage:
 * 1. Make sure you have the Firebase Admin SDK configured
 * 2. Run: npx ts-node scripts/seed-admin.ts <user-email>
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin (you need to download your service account key)
// Get it from Firebase Console > Project Settings > Service Accounts > Generate New Private Key
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

async function makeAdmin(email: string) {
    const db = admin.firestore();

    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
        console.error(`❌ No user found with email: ${email}`);
        console.log('');
        console.log('Make sure the user has signed up first through the web app.');
        process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    if (userData.role === 'ADMIN') {
        console.log(`✅ ${email} is already an admin`);
        process.exit(0);
    }

    // Update user role to admin
    await usersRef.doc(userId).update({ role: 'ADMIN' });

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log('');
    console.log('The user can now:');
    console.log('- Create and manage topics');
    console.log('- Manage team member roles');
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
    console.log('Usage: npx ts-node scripts/seed-admin.ts <user-email>');
    console.log('');
    console.log('Example: npx ts-node scripts/seed-admin.ts admin@example.com');
    process.exit(1);
}

makeAdmin(email)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
