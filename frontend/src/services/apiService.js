import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEmployees = () => api.get('/users');
export const getTasks = () => api.get('/tasks');
export const createTask = (taskData) => api.post('/tasks', taskData);
export const getMyTasks = (userId) => api.get(`/my-tasks/${userId}`);
export const updateTaskStatus = (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status });

export default api;
