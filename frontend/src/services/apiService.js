import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken = localStorage.getItem('api_token') || null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('api_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('api_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const clearAuthToken = () => setAuthToken(null);

// Initialize token on load
if (authToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

// Auth endpoints
export const login = (credentials) => api.post('/login', credentials);
export const logout = () => api.post('/logout');
export const getCurrentUser = () => api.get('/user');

// Task endpoints
export const getEmployees = () => api.get('/users');
export const createUser = (userData) => api.post('/users', userData);
export const getTasks = () => api.get('/tasks');
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data);
export const updateTaskStatus = (taskId, status) => api.patch(`/tasks/${taskId}`, { status });
export const getMyTasks = (userId) => api.get(`/users/${userId}/tasks`);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

// Comment endpoints
export const getComments = (taskId) => {
  return api.get(`/tasks/${taskId}/comments`);
};

export const addComment = (taskId, commentData) => {
  return api.post(`/tasks/${taskId}/comments`, commentData);
};

// Update employee availability status (Self)
export const updateEmployeeStatus = (userId, status) => api.patch(`/users/${userId}/status`, { availability_status: status });

// Admin update employee details (active status, skills)
export const adminUpdateEmployee = (userId, data) => api.put(`/users/${userId}/admin-update`, data);

export default api;