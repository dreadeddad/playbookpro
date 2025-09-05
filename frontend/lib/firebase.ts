import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDsX_oPpTQobtm_SkW-N6zlRJSUOLCqmQE",
  authDomain: "playbook-pro-demo.firebaseapp.com",
  projectId: "playbook-pro-demo",
  storageBucket: "playbook-pro-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Auth already initialized
  auth = getAuth(firebaseApp);
}

// Initialize Firestore
const db = getFirestore(firebaseApp);

export { auth, db, firebaseApp };