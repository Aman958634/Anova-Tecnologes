import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://anova-tecnologes-production.up.railway.app';

function getApiBaseUrl() {
  const rawUrl = import.meta.env.VITE_API_URL || RAILWAY_BACKEND_URL;
  const baseUrl = rawUrl.replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000
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
