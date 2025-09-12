import { useState, useCallback } from 'react';
import { getIdToken } from '@/lib/auth';
import { buildApiUrl } from '@/lib/config';

class ApiError extends Error {
  public status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  showLoading?: boolean;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (
    endpoint: string, 
    requestOptions: RequestInit = {}
  ): Promise<T> => {
    const { showLoading = true, onSuccess, onError } = options;
    
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // Firebase IDトークンを取得
      const idToken = await getIdToken();
      
      // デフォルトヘッダーを設定
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': idToken ? `Bearer ${idToken}` : '',
        ...requestOptions.headers,
      };

      const response = await fetch(buildApiUrl(endpoint), {
        ...requestOptions,
        headers,
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const result = await response.json();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError 
        ? err 
        : new ApiError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      setError(apiError);
      
      if (onError) {
        onError(apiError);
      } else {
        console.error('API Error:', apiError);
      }
      
      throw apiError;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [options]);

  const get = useCallback((endpoint: string, params?: Record<string, string>) => {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return execute(`${endpoint}${queryString}`, { method: 'GET' });
  }, [execute]);

  const post = useCallback((endpoint: string, body?: any) => {
    return execute(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }, [execute]);

  const put = useCallback((endpoint: string, body?: any) => {
    return execute(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }, [execute]);

  const del = useCallback((endpoint: string) => {
    return execute(endpoint, { method: 'DELETE' });
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    get,
    post,
    put,
    delete: del,
    clearError: () => setError(null),
    clearData: () => setData(null),
  };
}