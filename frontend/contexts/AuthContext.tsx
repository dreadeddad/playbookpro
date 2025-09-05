import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple demo mode for now
const DEMO_MODE = true;

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'coach' | 'player';
  createdAt: Date;
}

interface AuthContextType {
  user: any | null;
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
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // Demo mode - check for stored demo user
      const checkDemoUser = async () => {
        try {
          console.log('AuthContext: Checking for demo user...');
          const storedUser = await AsyncStorage.getItem('demo_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('AuthContext: Found demo user:', parsedUser.displayName);
            setUser(parsedUser);
            setUserData(parsedUser);
          } else {
            console.log('AuthContext: No demo user found');
          }
        } catch (error) {
          console.log('AuthContext: Error checking demo user:', error);
        } finally {
          console.log('AuthContext: Setting loading to false');
          setLoading(false);
        }
      };
      checkDemoUser();
    } else {
      // Real Firebase auth would go here
      console.log('AuthContext: Real Firebase mode - setting loading to false');
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      // Demo mode sign in
      const demoUser = {
        uid: `demo_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: 'player' as 'coach' | 'player',
        createdAt: new Date()
      };
      
      await AsyncStorage.setItem('demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setUserData(demoUser);
      return;
    }
    
    // Real Firebase sign in would go here
    throw new Error('Firebase not configured');
  };

  const signUp = async (email: string, password: string, displayName: string, role: 'coach' | 'player') => {
    if (DEMO_MODE) {
      // Demo mode sign up
      const demoUser = {
        uid: `demo_${Date.now()}`,
        email,
        displayName,
        role,
        createdAt: new Date()
      };
      
      await AsyncStorage.setItem('demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setUserData(demoUser);
      
      // Also create user in backend
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebase_uid: demoUser.uid,
            email: demoUser.email,
            display_name: demoUser.displayName,
            role: demoUser.role
          }),
        });
        
        if (!response.ok) {
          console.log('Backend user creation failed, but demo continues');
        }
      } catch (error) {
        console.log('Backend user creation error:', error);
      }
      
      return;
    }
    
    // Real Firebase sign up would go here
    throw new Error('Firebase not configured');
  };

  const logout = async () => {
    if (DEMO_MODE) {
      await AsyncStorage.removeItem('demo_user');
      setUser(null);
      setUserData(null);
      return;
    }
    
    // Real Firebase logout would go here
    throw new Error('Firebase not configured');
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