import axios from 'axios';
import type { User, CreateUserForm, Document, DocumentType } from '../types';

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

// Document service
export const documentService = {
  getUserDocuments: (userId: number) => api.get<Document[]>(`/documents/user/${userId}`),
  getUserDocumentsByType: (userId: number, documentType: DocumentType) => 
    api.get<Document[]>(`/documents/user/${userId}/type/${documentType}`),
  upload: (userId: number, formData: FormData) => 
    api.post<string>(`/documents/user/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  download: (documentId: number) => 
    api.get(`/documents/${documentId}/download`, { responseType: 'blob' }),
  view: (documentId: number) => 
    api.get(`/documents/${documentId}/view`, { responseType: 'blob' }),
  verify: (documentId: number, verifiedByUserId: number) => 
    api.put<string>(`/documents/${documentId}/verify`, null, {
      params: { verifiedByUserId }
    }),
  delete: (documentId: number) => 
    api.delete<string>(`/documents/${documentId}`)
};

// Dashboard service
export const dashboardService = {
  getStats: () => api.get<{
    totalUsers: number;
    activeLoans: number;
    totalValue: number;
    totalDocuments: number;
    paidInstallments: number;
    overdueInstallments: number;
    approvedLoans: number;
    totalApproved: number;
  }>('/dashboard/stats')
};

export default api;
