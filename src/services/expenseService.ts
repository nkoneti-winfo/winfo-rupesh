import { api } from './api';
import apiClient from './api';
import { AxiosResponse } from 'axios';
import {
  PageResponse,
  DashboardSummary,
  ExpenseReport,
  ExpenseLine,
  ExpenseType,
  ExpenseTemplate,
  Currency,
  ExchangeRate,
  ExpenseDocument,
  CreateExpenseReportRequest,
  UpdateExpenseReportRequest,
  CreateExpenseLineRequest,
  UpdateExpenseLineRequest,
  ExpenseReportFilters,
  ExchangeRateRequest,
  SearchRequest,
  ApprovalRequest,
  BulkApprovalRequest,
  ApprovalStatistics
} from '../types/api';

/**
 * Service for handling all expense-related API calls
 * Matches backend Spring Boot controller endpoints exactly
 */
export const expenseService = {
  // ==================== DASHBOARD APIs ====================
  /**
   * Get dashboard data for an employee
   * GET /expense-reports/dashboard/{employeeId}
   */
  getDashboard: (employeeId: string): Promise<AxiosResponse<DashboardSummary>> => {
    return api.get(`/expense-reports/dashboard/${employeeId}`);
  },

  // ==================== EXPENSE REPORT APIs ====================
  /**
   * Create a new expense report
   * POST /expense-reports
   */
  createExpenseReport: (reportData: CreateExpenseReportRequest): Promise<AxiosResponse<ExpenseReport>> => {
    return api.post('/expense-reports', reportData);
  },

  /**
   * Get expense report by ID
   * GET /expense-reports/{reportId}
   */
  getExpenseReport: (reportId: string): Promise<AxiosResponse<ExpenseReport>> => {
    return api.get(`/expense-reports/${reportId}`);
  },

  /**
   * Update expense report
   * PUT /expense-reports/{reportId}
   */
  updateExpenseReport: (reportId: string, reportData: UpdateExpenseReportRequest): Promise<AxiosResponse<ExpenseReport>> => {
    return api.put(`/expense-reports/${reportId}`, reportData);
  },

  /**
   * Submit expense report for approval
   * PUT /expense-reports/{reportId}/submit
   */
  submitExpenseReport: (reportId: string): Promise<AxiosResponse<void>> => {
    return api.put(`/expense-reports/${reportId}/submit`);
  },

  /**
   * Get expense reports with filtering and pagination
   * GET /expense-reports
   */
  getExpenseReports: (filters: ExpenseReportFilters = {}): Promise<AxiosResponse<PageResponse<ExpenseReport>>> => {
    const params: any = {};
    
    if (filters.employeeId) params.employeeId = filters.employeeId;
    if (filters.status) params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.size !== undefined) params.size = filters.size;
    
    return api.get('/expense-reports', params);
  },

  /**
   * Delete expense report
   * DELETE /expense-reports/{reportId}
   */
  deleteExpenseReport: (reportId: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/expense-reports/${reportId}`);
  },

  /**
   * Search expense reports by title or purpose
   * GET /expense-reports/search
   */
  searchExpenseReports: (searchRequest: SearchRequest): Promise<AxiosResponse<PageResponse<ExpenseReport>>> => {
    const params: any = {
      searchTerm: searchRequest.searchTerm
    };
    
    if (searchRequest.page !== undefined) params.page = searchRequest.page;
    if (searchRequest.size !== undefined) params.size = searchRequest.size;
    
    return api.get('/expense-reports/search', params);
  },

  // ==================== EXPENSE LINE APIs ====================
  /**
   * Add expense line to a report
   * POST /expense-reports/{reportId}/lines
   */
  addExpenseLine: (reportId: string, lineData: CreateExpenseLineRequest): Promise<AxiosResponse<ExpenseLine>> => {
    return api.post(`/expense-reports/${reportId}/lines`, lineData);
  },

  /**
   * Update expense line
   * PUT /expense-lines/{lineId}
   */
  updateExpenseLine: (lineId: number, lineData: UpdateExpenseLineRequest): Promise<AxiosResponse<ExpenseLine>> => {
    return api.put(`/expense-lines/${lineId}`, lineData);
  },

  /**
   * Delete expense line
   * DELETE /expense-lines/{lineId}
   */
  deleteExpenseLine: (lineId: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/expense-lines/${lineId}`);
  },

  /**
   * Delete expense report
   * DELETE /expense-reports/{reportId}
   */
  deleteReport: (reportId: string): Promise<AxiosResponse<void>> => {
    return api.delete(`/expense-reports/${reportId}`);
  },

  /**
   * Get expense lines for a report
   * GET /expense-reports/{reportId}/lines
   */
  getExpenseLinesByReport: (reportId: string): Promise<AxiosResponse<ExpenseLine[]>> => {
    return api.get(`/expense-reports/${reportId}/lines`);
  },

  // ==================== DOCUMENT APIs ====================
  /**
   * Upload document for expense report
   * POST /api/v1/documents/reports/{reportId}
   */
  uploadReportDocument: (reportId: string, formData: FormData): Promise<AxiosResponse<ExpenseDocument>> => {
    return apiClient.post(`/api/v1/documents/reports/${reportId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload document for expense line
   * POST /api/v1/documents/lines/{lineId}
   */
  uploadLineDocument: (lineId: number, formData: FormData): Promise<AxiosResponse<ExpenseDocument>> => {
    return apiClient.post(`/api/v1/documents/lines/${lineId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get documents for a report
   * GET /api/v1/documents/reports/{reportId}
   */
  getDocumentsByReport: (reportId: string): Promise<AxiosResponse<ExpenseDocument[]>> => {
    return api.get(`/api/v1/documents/reports/${reportId}`);
  },

  /**
   * Get documents for an expense line
   * GET /api/v1/documents/lines/{lineId}
   */
  getDocumentsByExpenseLine: (lineId: number): Promise<AxiosResponse<ExpenseDocument[]>> => {
    return api.get(`/api/v1/documents/lines/${lineId}`);
  },

  /**
   * Delete document
   * DELETE /api/v1/documents/{documentId}
   */
  deleteDocument: (documentId: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/api/v1/documents/${documentId}`);
  },

  /**
   * Download document
   * GET /api/v1/documents/{documentId}/download
   */
  downloadDocument: (documentId: number): Promise<AxiosResponse<Blob>> => {
    return apiClient.get(`/api/v1/documents/${documentId}/download`, {
      responseType: 'blob',
    });
  },

  // ==================== CONFIGURATION APIs ====================
  /**
   * Get all expense types
   * GET /configuration/expense-types
   */
  getExpenseTypes: (): Promise<AxiosResponse<ExpenseType[]>> => {
    return api.get('/configuration/expense-types');
  },

  /**
   * Get expense type by ID
   * GET /configuration/expense-types/{id}
   */
  getExpenseType: (id: number): Promise<AxiosResponse<ExpenseType>> => {
    return api.get(`/configuration/expense-types/${id}`);
  },

  /**
   * Create expense type
   * POST /configuration/expense-types
   */
  createExpenseType: (typeData: any): Promise<AxiosResponse<ExpenseType>> => {
    return api.post('/configuration/expense-types', typeData);
  },

  /**
   * Update expense type
   * PUT /configuration/expense-types/{id}
   */
  updateExpenseType: (id: number, typeData: any): Promise<AxiosResponse<ExpenseType>> => {
    return api.put(`/configuration/expense-types/${id}`, typeData);
  },

  /**
   * Delete expense type
   * DELETE /configuration/expense-types/{id}
   */
  deleteExpenseType: (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/configuration/expense-types/${id}`);
  },

  /**
   * Get all expense templates
   * GET /configuration/expense-templates
   */
  getExpenseTemplates: (): Promise<AxiosResponse<ExpenseTemplate[]>> => {
    return api.get('/configuration/expense-templates');
  },

  /**
   * Create expense template
   * POST /configuration/expense-templates
   */
  createExpenseTemplate: (templateData: any): Promise<AxiosResponse<ExpenseTemplate>> => {
    return api.post('/configuration/expense-templates', templateData);
  },

  /**
   * Update expense template
   * PUT /configuration/expense-templates/{id}
   */
  updateExpenseTemplate: (id: number, templateData: any): Promise<AxiosResponse<ExpenseTemplate>> => {
    return api.put(`/configuration/expense-templates/${id}`, templateData);
  },

  /**
   * Delete expense template
   * DELETE /configuration/expense-templates/{id}
   */
  deleteExpenseTemplate: (id: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/configuration/expense-templates/${id}`);
  },

  /**
   * Get all currencies
   * GET /configuration/currencies
   */
  getCurrencies: (): Promise<AxiosResponse<Currency[]>> => {
    return api.get('/configuration/currencies');
  },

  /**
   * Get exchange rate
   * GET /configuration/exchange-rates
   */
  getExchangeRate: (request: ExchangeRateRequest): Promise<AxiosResponse<ExchangeRate>> => {
    const params: any = {
      fromCurrency: request.fromCurrency,
      toCurrency: request.toCurrency,
      date: request.date || new Date().toISOString().split('T')[0] // Default to today
    };
    
    return api.get('/configuration/exchange-rates', params);
  },

  // ==================== APPROVAL APIs ====================
  /**
   * Get pending approvals for an approver
   * GET /approvals?approverId={approverId}&page={page}&size={size}
   */
  getPendingApprovals: (approverId: string, page: number = 0, size: number = 10): Promise<AxiosResponse<PageResponse<ExpenseReport>>> => {
    return api.get('/approvals', { approverId, page, size });
  },

  /**
   * Get all pending approvals (without approver filter)
   * GET /approvals?page={page}&size={size}
   */
  getAllPendingApprovals: (page: number = 0, size: number = 10): Promise<AxiosResponse<PageResponse<ExpenseReport>>> => {
    return api.get('/approvals', { page, size });
  },

  /**
   * Approve expense report
   * PUT /approvals/{reportId}/approve
   */
  approveExpenseReport: (reportId: string, approvalData: ApprovalRequest): Promise<AxiosResponse<void>> => {
    return api.put(`/approvals/${reportId}/approve`, approvalData);
  },

  /**
   * Reject expense report
   * PUT /approvals/{reportId}/reject
   */
  rejectExpenseReport: (reportId: string, approvalData: ApprovalRequest): Promise<AxiosResponse<void>> => {
    return api.put(`/approvals/${reportId}/reject`, approvalData);
  },

  /**
   * Request additional information for expense report
   * PUT /approvals/{reportId}/request-info
   */
  requestAdditionalInfo: (reportId: string, requestData: ApprovalRequest): Promise<AxiosResponse<void>> => {
    return api.put(`/approvals/${reportId}/request-info`, requestData);
  },

  /**
   * Bulk approve multiple expense reports
   * POST /approvals/bulk-approve
   */
  bulkApproveReports: (bulkData: BulkApprovalRequest): Promise<AxiosResponse<{approvedCount: number}>> => {
    return api.post('/approvals/bulk-approve', bulkData);
  },

  /**
   * Get approval history for an approver
   * GET /approvals/history?approverId={approverId}&page={page}&size={size}
   */
  getApprovalHistory: (approverId: string, page: number = 0, size: number = 10): Promise<AxiosResponse<PageResponse<ExpenseReport>>> => {
    return api.get('/approvals/history', { approverId, page, size });
  },

  /**
   * Get approval statistics for an approver
   * GET /approvals/statistics?approverId={approverId}
   */
  getApprovalStatistics: (approverId: string): Promise<AxiosResponse<ApprovalStatistics>> => {
    return api.get('/approvals/statistics', { approverId });
  },

  /**
   * Check if user can approve a specific report
   * GET /approvals/{reportId}/can-approve?approverId={approverId}
   */
  canApproveReport: (reportId: string, approverId: string): Promise<AxiosResponse<boolean>> => {
    return api.get(`/approvals/${reportId}/can-approve`, { approverId });
  },

  /**
   * Check if report requires approval
   * GET /approvals/{reportId}/requires-approval
   */
  requiresApproval: (reportId: string): Promise<AxiosResponse<boolean>> => {
    return api.get(`/approvals/${reportId}/requires-approval`);
  },

  // ==================== UTILITY METHODS ====================
  /**
   * Health check endpoint
   * GET /health (if available) or fallback to expense types
   */
  healthCheck: (): Promise<AxiosResponse<any>> => {
    return api.get('/health').catch(() => {
      // Fallback to a lightweight endpoint
      return api.get('/configuration/expense-types', { size: 1 });
    });
  }
};

export default expenseService;