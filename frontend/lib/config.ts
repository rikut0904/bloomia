// API設定
export const API_CONFIG = {
    // 環境変数でAPI URLを制御
    // NEXT_PUBLIC_API_URL を優先し、なければ NEXT_PUBLIC_API_BASE_URL を参照
    BASE_URL: (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL) ||
        (process.env.NODE_ENV === 'production'
            ? 'https://www.bloomia.com'  // 本番環境のデフォルト
            : 'http://localhost:8080'),  // 開発環境のデフォルト

    ENDPOINTS: {
        AUTH: {
            SYNC: '/api/v1/auth/sync',
            REGISTER: '/api/v1/auth/register',
            VERIFY: '/api/v1/auth/verify',
        },
        ADMIN: {
            STATS: '/api/v1/admin/stats',
            USERS: '/api/v1/admin/users',
            SCHOOLS: '/api/v1/admin/schools',
            INVITE: '/api/v1/admin/invite',
            UPDATE_USER_ROLE: '/api/v1/admin/users/role',
            UPDATE_USER_STATUS: '/api/v1/admin/users/status',
        },
        SCHOOLS: {
            BASE: '/api/v1/schools',
            STATS: (id: string) => `/api/v1/schools/${id}/stats`,
            USERS: (id: string) => `/api/v1/schools/${id}/users`,
            DETAIL: (id: string) => `/api/v1/schools/${id}`,
        },
        DASHBOARD: {
            BASE: '/api/v1/dashboard',
            TASKS: '/api/v1/dashboard/tasks',
            STATS: '/api/v1/dashboard/stats',
        }
    }
};

// API URLを構築するヘルパー関数
export const buildApiUrl = (endpoint: string): string => `${API_CONFIG.BASE_URL}${endpoint}`;
