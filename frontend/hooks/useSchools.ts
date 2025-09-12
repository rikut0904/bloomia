import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { API_CONFIG } from '@/lib/config';

export interface School {
  id: string;
  name: string;
  code: string;
}

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  
  const api = useApi<{ schools: School[] }>({
    onSuccess: (data) => {
      if (data.schools) {
        setSchools(data.schools);
      } else if (Array.isArray(data)) {
        setSchools(data);
      }
    },
    onError: (error) => {
      console.error('Failed to fetch schools:', error);
      setSchools([]);
    }
  });

  const fetchSchools = async () => {
    try {
      await api.get(API_CONFIG.ENDPOINTS.ADMIN.SCHOOLS);
    } catch (error) {
      // エラーハンドリングはonErrorで処理済み
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return {
    schools,
    loading: api.loading,
    error: api.error,
    refresh: fetchSchools,
  };
}