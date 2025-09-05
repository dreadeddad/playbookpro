import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBEXaaUvjFF3CTyXDT9yEc0SjtN_LNG05Y",
  authDomain: "playbook-pro-119bb.firebaseapp.com",
  projectId: "playbook-pro-119bb",
  storageBucket: "playbook-pro-119bb.firebasestorage.app",
  messagingSenderId: "153546122232",
  appId: "1:153546122232:web:61c15dba2956955f272c0d",
  measurementId: "G-1T8RRPY68Y"
};

// Initialize Firebase
let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize Auth with proper persistence handling
let auth;
try {
  // For React Native, use AsyncStorage persistence
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Auth already initialized or running on web, fallback to default
  auth = getAuth(firebaseApp);
}

// Initialize Firestore
const db = getFirestore(firebaseApp);

export { auth, db, firebaseApp };