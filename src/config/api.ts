export const API_CONFIG = {
  USE_PROXY: false,
  USE_CORS_PROXY: false,
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://app.tablecrm.com/api/v1',
  CORS_PROXY: '',
  TIMEOUT: 15000,
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  
  if (API_CONFIG.USE_CORS_PROXY) {
    return `${API_CONFIG.CORS_PROXY}${encodeURIComponent(baseUrl + endpoint)}`;
  }
  
  return `${baseUrl}${endpoint}`;
};