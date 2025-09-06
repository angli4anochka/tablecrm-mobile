export const API_CONFIG = {
  USE_PROXY: false,
  USE_CORS_PROXY: false,
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://app.tablecrm.com/api/v1',
  CORS_PROXY: '',
  TIMEOUT: 15000,
};

export const getApiUrl = (endpoint: string): string => {
  const isDev = window.location.hostname === 'localhost';
  
  if (isDev) {
    return `http://localhost:3001/api/v1${endpoint}`;
  }
  
  if (window.location.hostname.includes('vercel.app')) {
    return `/api/proxy?path=${encodeURIComponent(endpoint)}`;
  }
  
  const baseUrl = API_CONFIG.BASE_URL;
  return `${baseUrl}${endpoint}`;
};