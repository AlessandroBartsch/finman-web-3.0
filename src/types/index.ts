// Tipos para Usuários/Clientes
export type UserSituation = 'ACTIVE' | 'DEACTIVATED';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  knownByWhom?: string;
  situation: UserSituation;
  deactivatedDate?: string;
  deactivationReason?: string;
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
  knownByWhom?: string;
  situation?: UserSituation;
  deactivatedDate?: string;
  deactivationReason?: string;
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
  | 'ASSINATURA_PROMISSORIA'
  | 'OUTROS';

export const DocumentTypes = {
  RG: 'RG' as DocumentType,
  CPF: 'CPF' as DocumentType,
  COMPROVANTE_RESIDENCIA: 'COMPROVANTE_RESIDENCIA' as DocumentType,
  COMPROVANTE_RENDA: 'COMPROVANTE_RENDA' as DocumentType,
  CONTRACHEQUE: 'CONTRACHEQUE' as DocumentType,
  EXTRATO_BANCARIO: 'EXTRATO_BANCARIO' as DocumentType,
  ASSINATURA_PROMISSORIA: 'ASSINATURA_PROMISSORIA' as DocumentType,
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

// Loan Types
export type LoanStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'REJECTED' | 'CANCELLED';
export type PaymentFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALTERNATE_DAYS';
export type PaymentType = 'FIXED_INSTALLMENTS' | 'INTEREST_ONLY' | 'FLEXIBLE';

export interface Loan {
  id: number;
  userId: number;
  loanAmount: number;
  interestRate: number;
  termValue: number;
  paymentFrequency: PaymentFrequency;
  paymentType: PaymentType;
  alternateDaysInterval?: number;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  disbursementDate?: string;
  totalPaidAmount: number;
  outstandingBalance: number;
  totalInterest: number;
  totalLoanValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanForm {
  userId: number;
  loanAmount: number;
  interestRate: number;
  termValue: number;
  paymentFrequency: PaymentFrequency;
  paymentType: PaymentType;
  alternateDaysInterval?: number;
  startDate: string;
}

export interface UpdateLoanForm {
  userId?: number;
  loanAmount?: number;
  interestRate?: number;
  termValue?: number;
  paymentFrequency?: PaymentFrequency;
  paymentType?: PaymentType;
  alternateDaysInterval?: number;
  startDate?: string;
  status?: LoanStatus;
  disbursementDate?: string;
}

// Loan Installment Types
export interface LoanInstallment {
  id: number;
  loanId: number;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalDueAmount: number;
  paidAmount: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  remainingAmount: number;
  overdue: boolean;
  // Campos para cálculo de atraso
  dailyInterestRate: number;
  overdueDays: number;
  dailyInterestAmount: number;
  overdueInterestAmount: number;
  totalWithOverdue: number;
  negotiationComment?: string;
}

export interface CreateInstallmentForm {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalDueAmount: number;
}

export interface PaymentForm {
  amount: number;
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
