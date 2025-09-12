import { useState } from 'react';
import { useApi } from './useApi';
import { API_CONFIG } from '@/lib/config';

export interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_approved: boolean;
  school_id?: number;
  school_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRoleRequest {
  user_id: number;
  role: string;
}

export interface UpdateUserStatusRequest {
  user_id: number;
  is_active: boolean;
  is_approved: boolean;
}

export function useUserManagement() {
  const api = useApi();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async (filters?: {
    search?: string;
    role?: string;
    school_id?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.school_id && filters.school_id !== 'all') params.append('school_id', filters.school_id);

    const queryString = params.toString();
    const endpoint = queryString 
      ? `${API_CONFIG.ENDPOINTS.ADMIN.USERS}?${queryString}`
      : API_CONFIG.ENDPOINTS.ADMIN.USERS;

    try {
      const data = await api.execute(endpoint);
      if (data) {
        setUsers(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      return [];
    }
  };

  const updateUserRole = async (data: UpdateUserRoleRequest) => {
    return api.execute(API_CONFIG.ENDPOINTS.ADMIN.UPDATE_USER_ROLE, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  };

  const updateUserStatus = async (data: UpdateUserStatusRequest) => {
    return api.execute(API_CONFIG.ENDPOINTS.ADMIN.UPDATE_USER_STATUS, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  };

  const updateLocalUser = (updatedUser: Partial<User> & { id: number }) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id 
        ? { ...user, ...updatedUser }
        : user
    ));
  };

  return {
    users,
    loading: api.loading,
    error: api.error,
    fetchUsers,
    updateUserRole,
    updateUserStatus,
    updateLocalUser
  };
}