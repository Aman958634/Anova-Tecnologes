import axios from 'axios';

const DEFAULT_API_BASE_URL = '/api';
const ACTIVE_BACKEND_API_URL = 'https://anova-tecnologes.onrender.com/api';

const normalizeConfiguredApiUrl = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';

  const cleaned = raw.replace(/\/+$/, '');

  // Guard against stale deployment env values pointing to the retired backend host.
  if (/^https?:\/\/anova-tecnologes-backend\.onrender\.com\/api$/i.test(cleaned)) {
    return ACTIVE_BACKEND_API_URL;
  }

  return cleaned;
};

export const API_BASE_URL = (() => {
  const isBrowser = typeof window !== 'undefined';
  const host = isBrowser ? window.location.hostname : '';
  const isVercelHost = /(^|\.)vercel\.app$/i.test(host);

  // On Vercel frontend, enforce same-origin /api and rely on vercel.json rewrite.
  if (isVercelHost) {
    return DEFAULT_API_BASE_URL;
  }

  const configured = normalizeConfiguredApiUrl(import.meta.env.VITE_API_URL);
  return configured || DEFAULT_API_BASE_URL;
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

    const isFormDataPayload = typeof FormData !== 'undefined' && config.data instanceof FormData;

    if (isFormDataPayload) {
      // Keep Content-Type unset for FormData so the browser can send multipart boundary.
      if (typeof config.headers?.setContentType === 'function') {
        config.headers.setContentType(false);
      }
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    const resolvedContentType =
      typeof config.headers?.getContentType === 'function'
        ? config.headers.getContentType()
        : config.headers?.['Content-Type'] || config.headers?.['content-type'];

    console.log('API request debug:', {
      method: config.method,
      url: config.url,
      isFormDataPayload,
      contentType: resolvedContentType || null,
    });

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
