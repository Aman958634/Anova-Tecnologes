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
