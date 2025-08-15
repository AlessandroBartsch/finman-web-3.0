// Tipos para Usuários/Clientes
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

// Tipos para Formulários
export interface CreateUserForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
}

export interface UpdateUserForm extends CreateUserForm {
  id: number;
}

// Document types
export type DocumentType = 
  | 'RG'
  | 'CPF'
  | 'COMPROVANTE_RESIDENCIA'
  | 'COMPROVANTE_RENDA'
  | 'CONTRACHEQUE'
  | 'EXTRATO_BANCARIO'
  | 'OUTROS';

export const DocumentTypes = {
  RG: 'RG' as DocumentType,
  CPF: 'CPF' as DocumentType,
  COMPROVANTE_RESIDENCIA: 'COMPROVANTE_RESIDENCIA' as DocumentType,
  COMPROVANTE_RENDA: 'COMPROVANTE_RENDA' as DocumentType,
  CONTRACHEQUE: 'CONTRACHEQUE' as DocumentType,
  EXTRATO_BANCARIO: 'EXTRATO_BANCARIO' as DocumentType,
  OUTROS: 'OUTROS' as DocumentType
} as const;

export interface Document {
  id: number;
  userId: number;
  documentType: DocumentType;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  description?: string;
  isVerified: boolean;
  verifiedByUserId?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentForm {
  file: File;
  documentType: DocumentType;
  description?: string;
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
