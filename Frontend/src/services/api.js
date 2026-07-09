import axios from 'axios';

const DEFAULT_API_BASE_URL = '/api';

function getApiBaseUrl() {
  const rawEnv = import.meta.env.VITE_API_URL;

  // Use a configured backend URL when provided, including in production.
  // If the URL already includes /api, keep it; otherwise use it as the backend root.
  if (rawEnv) {
    let cleaned = String(rawEnv).trim().replace(/\/+$/'', '');
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = `https://${cleaned}`;
    }
    return cleaned;
  }

  return DEFAULT_API_BASE_URL;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 120000,
  headers: {
    Accept: 'application/json'
  }
});
console.log('[API] Created axios instance with baseURL:', api.defaults.baseURL);

// Optional: allow cross-site cookies if your backend uses them. Toggle via env.
if (import.meta.env.VITE_API_WITH_CREDENTIALS === 'true') {
  api.defaults.withCredentials = true;
  console.log('[API] withCredentials enabled');
}

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Allow uploads more time on slow networks or larger image files.
    config.timeout = 120000;
  }
  return config;
});

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
