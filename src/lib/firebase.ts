import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZfHqdufO1V2IpErBY7S4Ls3uq1CoVyQo",
  authDomain: "dgstd-3.firebaseapp.com",
  projectId: "dgstd-3",
  storageBucket: "dgstd-3.firebasestorage.app",
  messagingSenderId: "610791863684",
  appId: "1:610791863684:web:c5e53fcbaba9cd6eda19d1"
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
