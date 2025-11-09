import axios from 'axios';

const API_BASE_URL = 'https://todoapi-norm-d4ere5eda0hje8e6.canadacentral-01.azurewebsites.net';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
};

export const tasksAPI = {
  getTasks: async (params = {}) => {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  },
  getTask: async (id) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  updateTask: async (id, taskData) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },
  deleteTask: async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
};

export default api;