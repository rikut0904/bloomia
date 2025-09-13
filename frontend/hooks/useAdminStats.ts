import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { API_CONFIG } from '@/lib/config';

export interface UserStats {
  admin: number;
  school_admin: number;
  teacher: number;
  student: number;
  total_schools: number;
  active_schools: number;
  total_students: number;
  total_users: number;
}

const DEFAULT_STATS: UserStats = {
  admin: 0,
  school_admin: 0,
  teacher: 0,
  student: 0,
  total_schools: 0,
  active_schools: 0,
  total_students: 0,
  total_users: 0,
};

export function useAdminStats() {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const api = useApi<{ stats: any }>({
    onSuccess: (data) => {
      if (data.stats) {
        // バックエンドから返されるデータ形式に合わせて変換
        const transformedStats: UserStats = {
          admin: data.stats.admin || 0,
          school_admin: data.stats.school_admin || 0,
          teacher: data.stats.teacher || 0,
          student: data.stats.student || 0,
          total_schools: data.stats.total_schools || 0,
          active_schools: data.stats.active_schools || 0,
          total_students: data.stats.total_students || 0,
          total_users: data.stats.total_users || 0,
        };
        setStats(transformedStats);
      }
    },
    onError: (error) => {
      console.error('Failed to fetch stats:', error);
      setStats(DEFAULT_STATS);
    }
  });

  const fetchStats = async () => {
    try {
      await api.get(API_CONFIG.ENDPOINTS.ADMIN.STATS);
    } catch (error) {
      // エラーハンドリングはonErrorで処理済み
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading: api.loading,
    error: api.error,
    refresh: fetchStats,
  };
}