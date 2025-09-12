import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_CONFIG } from '@/lib/config';

export interface User {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  role: string;
  school_id?: string;
  school_name?: string;
  is_active?: boolean;
  is_approved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsersFilters {
  search?: string;
  role?: string;
  school_id?: string;
}

export interface UseUsersOptions {
  initialFilters?: UsersFilters;
  debounceMs?: number;
}

export function useUsers(options: UseUsersOptions = {}) {
  const { initialFilters = {}, debounceMs = 300 } = options;
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UsersFilters>(initialFilters);
  
  const api = useApi<{ users: User[] }>({
    onSuccess: (data) => {
      if (data.users) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
    },
    onError: (error) => {
      console.error('Failed to fetch users:', error);
      // エラー時は空配列を設定
      setUsers([]);
    }
  });

  const fetchUsers = useCallback(async (currentFilters: UsersFilters) => {
    try {
      const params: Record<string, string> = {};
      
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.role && currentFilters.role !== 'all') params.role = currentFilters.role;
      if (currentFilters.school_id && currentFilters.school_id !== 'all') params.school_id = currentFilters.school_id;

      await api.get(API_CONFIG.ENDPOINTS.ADMIN.USERS, params);
    } catch (error) {
      // エラーハンドリングはonErrorで処理済み
    }
  }, [api]);

  // フィルター変更時のデバウンス処理
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (!api.loading) {
        fetchUsers(filters);
      }
    }, debounceMs);

    return () => clearTimeout(debounceTimeout);
  }, [filters, fetchUsers, api.loading, debounceMs]);

  // 初回読み込み
  useEffect(() => {
    fetchUsers(filters);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<UsersFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refreshUsers = useCallback(() => {
    return fetchUsers(filters);
  }, [fetchUsers, filters]);

  return {
    users,
    filters,
    loading: api.loading,
    error: api.error,
    updateFilters,
    clearFilters,
    refresh: refreshUsers,
  };
}