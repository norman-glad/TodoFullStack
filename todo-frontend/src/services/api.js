import axios from 'axios';

const API_BASE_URL = 'https://todoapi-norm-d4ere5eda0hje8e6.canadacentral-01.azurewebsites.net';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
};

export const tasksAPI = {
  getTasks: (params = {}) => api.get('/api/tasks', { params }),
  getTask: (id) => api.get(`/api/tasks/${id}`),
  createTask: (taskData) => api.post('/api/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/api/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),
};

export default api;