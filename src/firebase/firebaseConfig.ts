import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel as setFirestoreLogLevel } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

// Firebase config - ONLY from Vite env vars (single source of truth)
// apiKey must match Firebase Console → Project settings → Your apps (Web) - case-sensitive
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Runtime sanity check (temporary - for verification)
console.log("Firebase apiKey in use:", firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 12)}...` : "(undefined)");

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_")) {
  const msg = "Firebase apiKey missing/invalid. Set VITE_FIREBASE_API_KEY in .env from Firebase Console → Project settings → Your apps (Web).";
  console.error(msg);
  throw new Error(msg);
}
if (!firebaseConfig.projectId) {
  throw new Error("Firebase projectId missing. Set VITE_FIREBASE_PROJECT_ID in .env.");
}

// Initialize Firebase ONCE (guard against double init)
export const app = getApps().length > 0
  ? getApps()[0] as ReturnType<typeof initializeApp>
  : initializeApp(firebaseConfig);

if (getApps().length === 1) {
  console.log("Firebase init:", { projectId: firebaseConfig.projectId, authDomain: firebaseConfig.authDomain });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
setFirestoreLogLevel('error');
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Only initialize analytics in browser and if measurementId is provided
export const analytics = (typeof window !== 'undefined' && firebaseConfig.measurementId)
  ? getAnalytics(app)
  : undefined as unknown as ReturnType<typeof getAnalytics>;

export default app;
