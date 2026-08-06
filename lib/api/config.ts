export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:8080',
  ENDPOINTS: {
    AUTH: '/api/v1/users/auth',
    FINANCES: '/api/v1/finances',
    BANKS: '/api/v1/banks',
    NOTIFICATIONS: '/api/v1/notifications',
    UPLOAD: '/api/v1/upload',
    INVESTMENTS: '/api/v1/investments',
    BFF: '/api/v1/bff',
  },
} as const;
