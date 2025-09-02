'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MockUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

interface MockUserContextType {
  user: MockUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const MockUserContext = createContext<MockUserContextType | undefined>(undefined);

export function MockUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for mock user in cookies
    const mockUserCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('mock-user='));
    
    if (mockUserCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(mockUserCookie.split('=')[1]));
        setUser(userData);
      } catch (error) {
        console.error('Error parsing mock user cookie:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <MockUserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </MockUserContext.Provider>
  );
}

export function useMockUser() {
  const context = useContext(MockUserContext);
  if (context === undefined) {
    throw new Error('useMockUser must be used within a MockUserProvider');
  }
  return context;
}