import axios from 'axios';

const DEFAULT_API_BASE_URL = '/api';

function getApiBaseUrl() {
  const rawUrl = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;
  const baseUrl = rawUrl.replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    Accept: 'application/json'
  }
});

// Runtime health-check: if the configured backend host cannot be reached (DNS or network
// error), fall back to a relative `/api` so sites deployed on the same domain (Vercel)
// can proxy requests to the API. This prevents repeated `ERR_NAME_NOT_RESOLVED` errors
// in browser consoles when the configured host is invalid or unreachable.
(async function ensureReachableBase() {
  try {
    const healthUrl = `${api.defaults.baseURL.replace(/\/+$/, '')}/health`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(healthUrl, { method: 'GET', signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    if (!res.ok) throw new Error('unhealthy');
  } catch (err) {
    // fallback to relative path only once
    try {
      api.defaults.baseURL = '/api';
      // minimal console note so devtools show the reason once
      console.info('API base unreachable; falling back to /api');
    } catch (e) {
      // ignore
    }
  }
})();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('anova-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const getBlogs = (search = '', category = '', page = 1, limit = 12) => api.get(`/blogs`, { params: { search, category, page, limit } });
export const getBlogById = (id) => api.get(`/blogs/${id}`);
export const createBlog = (newBlog) => api.post('/blogs', newBlog, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBlog = (id, updatedBlog) => api.put(`/blogs/${id}`, updatedBlog, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

export const signIn = (formData) => api.post('/auth/login', formData);
export const signUp = (formData) => api.post('/auth/register', formData);
