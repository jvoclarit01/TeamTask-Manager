import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEmployees = () => api.get('/users');
export const getTasks = () => api.get('/tasks');
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data);
export const updateTaskStatus = (taskId, status) => api.patch(`/tasks/${taskId}`, { status });
export const getMyTasks = (userId) => api.get(`/users/${userId}/tasks`);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

export const getComments = (taskId) => {
  return api.get(`/tasks/${taskId}/comments`);
};

export const addComment = (taskId, commentData) => {
  return api.post(`/tasks/${taskId}/comments`, commentData);
};

export default api;