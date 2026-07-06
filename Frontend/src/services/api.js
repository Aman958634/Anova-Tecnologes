import axios from 'axios';

const DEFAULT_API_BASE_URL = '/api';

function getApiBaseUrl() {
  // When the site runs on Vercel (or localhost during local dev), prefer a relative
  // `/api` path so that the hosting platform can proxy requests to the backend.
  // This avoids baked-in build-time URLs (like Railway) causing client-side
  // DNS failures if the host is unreachable.
  try {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || '';
      if (host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1') {
        return DEFAULT_API_BASE_URL;
      }
    }
  } catch (e) {
    // ignore and fall back to env
  }

  const rawUrl = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;
  const baseUrl = String(rawUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    Accept: 'application/json'
  }
});
console.log('[API] Created axios instance with baseURL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('anova-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API] Request:', config.method?.toUpperCase(), config.baseURL ? `${config.baseURL}${config.url}` : config.url, config.data || config.params || '');
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.config.method?.toUpperCase(), response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.message, error.response?.data || error.request);
    return Promise.reject(error);
  }
);

export default api;

export const getBlogs = (search = '', category = '', page = 1, limit = 12) => api.get(`/blogs`, { params: { search, category, page, limit } });
export const getBlogById = (id) => api.get(`/blogs/${id}`);
export const createBlog = (newBlog) => api.post('/blogs', newBlog);
export const updateBlog = (id, updatedBlog) => api.put(`/blogs/${id}`, updatedBlog);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

export const signIn = (formData) => api.post('/auth/login', formData);
export const signUp = (formData) => api.post('/auth/register', formData);
