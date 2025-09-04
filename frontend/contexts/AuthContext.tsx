'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const { signIn: firebaseSignIn } = await import('@/lib/auth');
    await firebaseSignIn(email, password);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { signUp: firebaseSignUp } = await import('@/lib/auth');
    await firebaseSignUp(email, password, displayName);
  };

  const logout = async () => {
    const { logout: firebaseLogout } = await import('@/lib/auth');
    await firebaseLogout();
  };

  const resetPassword = async (email: string) => {
    const { resetPassword: firebaseResetPassword } = await import('@/lib/auth');
    await firebaseResetPassword(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};