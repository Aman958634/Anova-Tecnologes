import { api } from '../config/api';

export default api;

export const getBlogs = (search = '', category = '', page = 1, limit = 12) => api.get(`/blogs`, { params: { search, category, page, limit } });
export const getBlogById = (id) => api.get(`/blogs/${id}`);
export const createBlog = (newBlog) => api.post('/blogs', newBlog);
export const updateBlog = (id, updatedBlog) => api.put(`/blogs/${id}`, updatedBlog);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

export const signIn = (formData) => api.post('/auth/login', formData);
export const signUp = (formData) => api.post('/auth/register', formData);
