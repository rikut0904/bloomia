import { useState } from 'react';
import { useApi } from './useApi';
import { API_CONFIG } from '@/lib/config';

export interface School {
  id: number;
  school_id: string;
  name: string;
  prefecture?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  user_count?: number;
  created_at?: string;
  updated_at?: string;
}

export function useSchoolManagement() {
  const api = useApi();
  const [schools, setSchools] = useState<School[]>([]);

  const fetchSchools = async (filters?: {
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString 
      ? `${API_CONFIG.ENDPOINTS.ADMIN.SCHOOLS}?${queryString}`
      : API_CONFIG.ENDPOINTS.ADMIN.SCHOOLS;

    try {
      const data = await api.execute(endpoint);
      if (data?.schools) {
        setSchools(data.schools);
        return data.schools;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      setSchools([]);
      return [];
    }
  };

  const getSchoolUsers = async (schoolId: string) => {
    try {
      return await api.execute(`${API_CONFIG.ENDPOINTS.ADMIN.SCHOOLS}/${schoolId}/users`);
    } catch (error) {
      console.error('Failed to fetch school users:', error);
      return [];
    }
  };

  return {
    schools,
    loading: api.loading,
    error: api.error,
    fetchSchools,
    getSchoolUsers
  };
}