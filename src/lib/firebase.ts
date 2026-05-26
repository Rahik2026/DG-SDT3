import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCV2d792bUjpx-s8HYr_gCFXPYpBGSTss8",

  authDomain: "dg-study-v3.firebaseapp.com",

  projectId: "dg-study-v3",

  storageBucket: "dg-study-v3.firebasestorage.app",

  messagingSenderId: "796057377667",

  appId: "1:796057377667:web:3da29beec220fd5f0734b6"
};
// Only initialize if we have a real API key (skip during SSR build)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '';

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // During build/SSR without env vars, create a dummy that won't crash
  // The actual app will only run on the client with real env vars
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export { app, auth, db, isConfigured };
export default app;
