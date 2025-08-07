// TypeScript interfaces matching backend DTOs
// Generated based on backend Spring Boot DTOs

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: string;
  timestamp: string;
}

// Pagination interfaces
export interface PageInfo {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: PageInfo;
}

// Dashboard interfaces
export interface RecentReport {
  reportId: string;
  reportTitle: string;
  reportDate: string;
  status: string;
  totalAmount: number;
  currency: string;
}

export interface DashboardSummary {
  employeeId: string;
  employeeName: string;
  totalExpenses: number;
  pendingAmount: number;
  approvedAmount: number;
  recentReports: RecentReport[];
}

// Expense Type interfaces
export interface ExpenseType {
  id: number;
  typeName: string;
  typeCode: string;
  description?: string;
  isActive: boolean;
  requiresReceipt: boolean;
  maxAmount?: number;
  category: string;
  glAccount?: string;
  createdDate: string;
  modifiedDate: string;
}

export interface ExpenseTypeDto {
  id: number;
  typeName: string;
  typeCode: string;
  description?: string;
  category: string;
}

// Currency and Exchange Rate interfaces
export interface Currency {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  isActive: boolean;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
}

// Document interfaces
export interface ExpenseDocument {
  documentId: number;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  documentType: string;
  description?: string;
}

// Approval interfaces
export interface ApprovalHistory {
  approvalId: number;
  action: string;
  comments?: string;
  approverName: string;
  actionDate: string;
}

// Expense Line interfaces
export interface ExpenseLine {
  lineId: number;
  expenseDate: string;
  expenseType: ExpenseTypeDto;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate: number;
  reimbursementAmount: number;
  reimbursementCurrency: string;
  hasReceipt: boolean;
  isPersonal: boolean;
  businessJustification?: string;
  merchant?: string;
  location?: string;
  billableToClient?: boolean;
  clientCode?: string;
  projectCode?: string;
  documents: ExpenseDocument[];
}

// Expense Report interfaces
export interface ExpenseReport {
  reportId: string;
  employeeId: string;
  employeeName: string;
  reportTitle: string;
  purpose?: string;
  dateFrom: string;
  dateTo: string;
  templateId?: number;
  templateName?: string;
  status: string;
  totalAmount: number;
  reimbursementCurrency: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approverName?: string;
  expenseLines: ExpenseLine[];
  documents: ExpenseDocument[];
  approvalHistory: ApprovalHistory[];
  canBeModified: boolean;
  canBeSubmitted: boolean;
}

// Template interfaces
export interface ExpenseTemplate {
  templateId: number;
  templateName: string;
  description?: string;
  isActive: boolean;
  allowedExpenseTypes: ExpenseType[];
  defaultCurrency: string;
  maxDuration?: number;
  requiresApproval: boolean;
  approvalWorkflow?: string;
  createdDate: string;
  modifiedDate: string;
}

// Request DTOs
export interface CreateExpenseReportRequest {
  employeeId: string;
  reportTitle: string;
  purpose?: string;
  dateFrom: string;
  dateTo: string;
  templateId?: number;
}

export interface UpdateExpenseReportRequest {
  reportTitle: string;
  purpose?: string;
  dateFrom: string;
  dateTo: string;
  templateId?: number;
}

export interface CreateExpenseLineRequest {
  expenseDate: string;
  expenseTypeId: number;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate?: number;
  hasReceipt: boolean;
  isPersonal?: boolean;
  businessJustification?: string;
  merchant?: string;
  location?: string;
  billableToClient?: boolean;
  clientCode?: string;
  projectCode?: string;
}

export interface UpdateExpenseLineRequest {
  expenseDate: string;
  expenseTypeId: number;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  exchangeRate?: number;
  hasReceipt: boolean;
  isPersonal?: boolean;
  businessJustification?: string;
  merchant?: string;
  location?: string;
  billableToClient?: boolean;
  clientCode?: string;
  projectCode?: string;
}

export interface ApprovalRequest {
  approverId: string;
  comments?: string;
}

export interface BulkApprovalRequest {
  reportIds: string[];
  approverId: string;
  comments?: string;
}

export interface ApprovalStatistics {
  approved: number;
  rejected: number;
  infoRequested: number;
  pending: number;
}

// API service parameter interfaces
export interface ExpenseReportFilters {
  employeeId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
}

export interface ExchangeRateRequest {
  fromCurrency: string;
  toCurrency: string;
  date?: string;
}

export interface SearchRequest {
  searchTerm: string;
  page?: number;
  size?: number;
}

// Status enums
export enum ExpenseReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_INFO = 'REQUEST_INFO'
}

export enum DocumentType {
  RECEIPT = 'RECEIPT',
  INVOICE = 'INVOICE',
  TRAVEL_DOCUMENT = 'TRAVEL_DOCUMENT',
  OTHER = 'OTHER'
}

// Error response interface
export interface ErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  timestamp: string;
}