import axios from 'axios';

const DEFAULT_API_BASE_URL = '/api';
const ACTIVE_BACKEND_API_URL = 'https://anova-tecnologes.onrender.com/api';

const normalizeConfiguredApiUrl = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';

  const cleaned = raw.replace(/\/+$/, '');

  if (/^https?:\/\/anova-tecnologes-backend\.onrender\.com\/api$/i.test(cleaned)) {
    return ACTIVE_BACKEND_API_URL;
  }

  return cleaned;
};

export const API_BASE_URL = (() => {
  const isBrowser = typeof window !== 'undefined';
  const host = isBrowser ? window.location.hostname : '';
  const isVercelHost = /(^|\.)vercel\.app$/i.test(host);

  if (isVercelHost) {
    return DEFAULT_API_BASE_URL;
  }

  const configured = normalizeConfiguredApiUrl(import.meta.env.VITE_API_URL);
  return configured || DEFAULT_API_BASE_URL;
})();

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/i, '');

function createApiClient({ timeout = 30000, retries = 2, retryDelay = 800 } = {}) {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout,
    headers: {
      Accept: 'application/json'
    }
  });

  client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('anova-token') || localStorage.getItem('anova-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormDataPayload = typeof FormData !== 'undefined' && config.data instanceof FormData;

    if (isFormDataPayload) {
      if (typeof config.headers?.setContentType === 'function') {
        config.headers.setContentType(false);
      }
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      if (!config) {
        return Promise.reject(error);
      }

      const method = String(config.method || 'get').toLowerCase();
      const canRetry = method === 'get' || method === 'head' || method === 'options';
      if (!canRetry) {
        return Promise.reject(error);
      }

      const retryCount = config.__retryCount || 0;
      if (retryCount >= retries) {
        return Promise.reject(error);
      }

      const shouldRetry =
        !response ||
        response.status >= 500 ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED';

      if (!shouldRetry) {
        return Promise.reject(error);
      }

      config.__retryCount = retryCount + 1;
      await new Promise((resolve) => setTimeout(resolve, retryDelay * config.__retryCount));

      return client(config);
    }
  );

  return client;
}

export const api = createApiClient();

export function createRetryApi() {
  return createApiClient({ retries: 2 });
}

export const retryApi = createRetryApi();

export default api;
