import { api, retryApi } from '../config/api';

export default api;

export const getProjects = (search = '', page = 1, limit = 12) => retryApi.get('/projects', { params: { search, page, limit } });
export const getProjectById = (id) => retryApi.get(`/projects/${id}`);
export const createProject = (projectData) => api.post('/projects', projectData);
export const updateProject = (id, projectData) => api.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export const getBlogs = (search = '', category = '', page = 1, limit = 12) => retryApi.get(`/blogs`, { params: { search, category, page, limit } });
export const getBlogById = (id) => retryApi.get(`/blogs/${id}`);
export const createBlog = (newBlog) => api.post('/blogs', newBlog);
export const updateBlog = (id, updatedBlog) => api.put(`/blogs/${id}`, updatedBlog);
export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

export const getTeam = (page = 1, limit = 12) => retryApi.get('/team', { params: { page, limit } });
export const getServices = (page = 1, limit = 100) => retryApi.get('/services', { params: { page, limit } });
export const getTestimonials = () => retryApi.get('/testimonials');

export const signIn = (formData) => api.post('/auth/login', formData);
export const signUp = (formData) => api.post('/auth/register', formData);
export const getStats = () => retryApi.get('/stats');
