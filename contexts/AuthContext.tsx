'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FirebaseAuthService, AuthUser } from '@/lib/firebase-auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (email: string, password: string, name: string, role?: 'FOUNDER' | 'EXPERT' | 'TEAM_MEMBER') => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await FirebaseAuthService.signIn(email, password);
    setUser(user);
    return user;
  };

  const signUp = async (email: string, password: string, name: string, role: 'FOUNDER' | 'EXPERT' | 'TEAM_MEMBER' = 'FOUNDER') => {
    const user = await FirebaseAuthService.signUp(email, password, name, role);
    setUser(user);
    return user;
  };

  const signOut = async () => {
    await FirebaseAuthService.signOutUser();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 