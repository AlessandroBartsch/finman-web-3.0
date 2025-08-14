import axios from 'axios';
import type { User, CreateUserForm } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Serviços para Usuários/Clientes
export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (user: CreateUserForm) => api.post<User>('/users', user),
  update: (id: number, user: Partial<CreateUserForm>) => api.put<User>(`/users/${id}`, user),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export default api;
