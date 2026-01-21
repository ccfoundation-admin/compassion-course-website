import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('Usage: npm run grant-admin <email>');
  process.exit(1);
}

async function grantAdmin(email) {
  try {
    // Initialize Firebase Admin
    // Try to load service account from common locations
    let serviceAccount;
    const possiblePaths = [
      join(__dirname, '../service-account-key.json'),
      join(__dirname, '../serviceAccountKey.json'),
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
    ];

    for (const path of possiblePaths) {
      if (path) {
        try {
          const keyFile = readFileSync(path, 'utf8');
          serviceAccount = JSON.parse(keyFile);
          console.log(`✅ Loaded service account from: ${path}`);
          break;
        } catch (err) {
          // Continue to next path
        }
      }
    }

    if (!serviceAccount) {
      // Try using default credentials (if running on GCP or with gcloud auth)
      try {
        initializeApp({
          projectId: 'compassion-course-websit-937d6',
        });
        console.log('✅ Using default credentials');
      } catch (err) {
        console.error('❌ Error: Could not find service account key file');
        console.log('Please either:');
        console.log('1. Place service-account-key.json in the project root');
        console.log('2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
        console.log('3. Run: gcloud auth application-default login');
        process.exit(1);
      }
    } else {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: 'compassion-course-websit-937d6',
      });
    }

    const db = getFirestore();
    const auth = getAuth();

    // Get user by email
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`✅ Found user: ${user.uid} (${user.email})`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error(`❌ Error: No user found with email: ${email}`);
        console.log('Please make sure the user has signed up first.');
        process.exit(1);
      }
      throw error;
    }

    // Create admin document by UID
    const adminDocRef = db.collection('admins').doc(user.uid);
    await adminDocRef.set({
      role: 'admin',
      email: user.email,
      grantedAt: new Date().toISOString(),
      grantedBy: 'script',
    });
    console.log(`✅ Admin document created at: admins/${user.uid}`);

    // Also create admin document by email (for email-based lookup)
    const adminEmailDocRef = db.collection('admins').doc(user.email.toLowerCase().trim());
    await adminEmailDocRef.set({
      role: 'admin',
      uid: user.uid,
      grantedAt: new Date().toISOString(),
      grantedBy: 'script',
    });
    console.log(`✅ Admin document created at: admins/${user.email.toLowerCase().trim()}`);

    // Set custom claim (optional, but recommended)
    try {
      await auth.setCustomUserClaims(user.uid, { admin: true });
      console.log(`✅ Custom claim 'admin: true' set for user`);
    } catch (error) {
      console.warn(`⚠️  Warning: Could not set custom claim: ${error.message}`);
      console.log('   The admin document should still work as a fallback');
    }

    console.log('\n✅ Admin access granted successfully!');
    console.log(`   User: ${user.email}`);
    console.log(`   UID: ${user.uid}`);
    console.log('\n💡 Note: User may need to sign out and sign back in for changes to take effect.');

  } catch (error) {
    console.error('❌ Error granting admin access:', error);
    process.exit(1);
  }
}

grantAdmin(email);
