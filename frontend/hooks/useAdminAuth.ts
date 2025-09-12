import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export interface UseAdminAuthOptions {
  redirectPath?: string;
  requiredRoles?: string[];
}

export function useAdminAuth(options: UseAdminAuthOptions = {}) {
  const { redirectPath = '/admin/login', requiredRoles = ['admin'] } = options;
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectPath);
        return;
      }

      if (user.role && !requiredRoles.includes(user.role)) {
        router.push(redirectPath);
        return;
      }
    }
  }, [user, loading, router, redirectPath, requiredRoles]);

  return {
    user,
    loading,
    isAuthorized: !!user && user.role && requiredRoles.includes(user.role),
    isLoading: loading,
  };
}