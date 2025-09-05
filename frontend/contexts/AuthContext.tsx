import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'coach' | 'player';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: 'coach' | 'player') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Setting up Firebase auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Auth state changed, user:', user?.email || 'none');
      setUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        try {
          console.log('AuthContext: Fetching user data from Firestore...');
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('AuthContext: User data found:', data.role);
            setUserData({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: data.role,
              createdAt: data.createdAt?.toDate() || new Date()
            });
          } else {
            console.log('AuthContext: No user data in Firestore');
            // Create basic user data if it doesn't exist
            const basicUserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: 'player' as 'coach' | 'player', // Default role
              createdAt: new Date()
            };
            setUserData(basicUserData);
          }
        } catch (error) {
          console.error('AuthContext: Error fetching user data:', error);
          // Fallback user data
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'player',
            createdAt: new Date()
          });
        }
      } else {
        console.log('AuthContext: No user, clearing userData');
        setUserData(null);
      }
      
      console.log('AuthContext: Setting loading to false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Signing in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('AuthContext: Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'coach' | 'player') => {
    try {
      console.log('AuthContext: Signing up user:', email, 'as', role);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, { displayName });
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Also create user in our backend
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebase_uid: user.uid,
            email: user.email,
            display_name: displayName,
            role: role
          }),
        });
        
        if (!response.ok) {
          console.log('Backend user creation failed, but Firebase user created successfully');
        } else {
          console.log('User created in both Firebase and backend');
        }
      } catch (error) {
        console.log('Backend user creation error:', error);
      }
      
    } catch (error: any) {
      console.error('AuthContext: Sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Signing out user');
      await signOut(auth);
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};