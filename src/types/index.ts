// Tipos para Usuários/Clientes
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

// Tipos para Formulários
export interface CreateUserForm {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface UpdateUserForm extends Partial<CreateUserForm> {
  id: number;
}

// Tipos para API Responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
