import axios from 'axios';

const DEFAULT_API_BASE_URL = '/api';

export const API_BASE_URL = (() => {
  const configured = typeof import.meta.env.VITE_API_URL === 'string' ? import.meta.env.VITE_API_URL.trim() : '';
  const cleaned = configured.replace(/\/+$/, '');
  return cleaned || DEFAULT_API_BASE_URL;
})();

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/i, '');

export function createApiClient({ timeout = 30000 } = {}) {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout,
    headers: {
      Accept: 'application/json'
    }
  });

  console.log('Base URL:', API_BASE_URL);

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('anova-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log('API error response:', error.response);
      console.log('API error message:', error.message);
      console.log('API error config:', error.config);
      return Promise.reject(error);
    }
  );

  return client;
}

export const api = createApiClient();

export default api;
