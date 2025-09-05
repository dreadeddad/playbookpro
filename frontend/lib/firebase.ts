// Demo mode configuration - Replace with real Firebase config when available
const DEMO_MODE = true;

// Placeholder Firebase config for demo
let auth: any = null;
let db: any = null;
let firebaseApp: any = null;

if (!DEMO_MODE) {
  // Real Firebase imports (commented out for demo)
  // import { initializeApp, getApps } from 'firebase/app';
  // import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
  // import { getFirestore } from 'firebase/firestore';
  // import AsyncStorage from '@react-native-async-storage/async-storage';

  const firebaseConfig = {
    // Add your real Firebase config here
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  };

  // Initialize Firebase when not in demo mode
  // firebaseApp = initializeApp(firebaseConfig);
  // auth = getAuth(firebaseApp);
  // db = getFirestore(firebaseApp);
}

export { auth, db, firebaseApp, DEMO_MODE };