'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, onAuthStateChange } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithSchoolId: (email: string, password: string, schoolId: string) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, schoolId: string, displayName?: string) => Promise<void>;
  signUpAdmin: (email: string, password: string, displayName?: string) => Promise<void>;
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

  const signInWithSchoolId = async (email: string, password: string, schoolId: string) => {
    const { signInWithSchoolId: firebaseSignInWithSchoolId } = await import('@/lib/auth');
    await firebaseSignInWithSchoolId(email, password, schoolId);
  };

  const signInAdmin = async (email: string, password: string) => {
    const { signInAdmin: firebaseSignInAdmin } = await import('@/lib/auth');
    await firebaseSignInAdmin(email, password);
  };

  const signUp = async (email: string, password: string, schoolId: string, displayName?: string) => {
    const { signUp: firebaseSignUp } = await import('@/lib/auth');
    await firebaseSignUp(email, password, schoolId, displayName);
  };

  const signUpAdmin = async (email: string, password: string, displayName?: string) => {
    const { signUpAdmin: firebaseSignUpAdmin } = await import('@/lib/auth');
    await firebaseSignUpAdmin(email, password, displayName);
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
    signInWithSchoolId,
    signInAdmin,
    signUp,
    signUpAdmin,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};