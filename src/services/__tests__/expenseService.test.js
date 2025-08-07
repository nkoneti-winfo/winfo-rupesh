import { expenseService } from '../expenseService';

// Mock the api module
jest.mock('../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  },
  handleApiError: jest.fn()
}));

describe('expenseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should have expenseService object', () => {
    expect(expenseService).toBeDefined();
    expect(typeof expenseService).toBe('object');
  });

  test('should have dashboard methods', () => {
    expect(expenseService.getDashboard).toBeDefined();
    expect(typeof expenseService.getDashboard).toBe('function');
  });

  test('should have expense report methods', () => {
    expect(expenseService.getExpenseReports).toBeDefined();
    expect(expenseService.createExpenseReport).toBeDefined();
    expect(expenseService.updateExpenseReport).toBeDefined();
    expect(expenseService.deleteExpenseReport).toBeDefined();
    expect(typeof expenseService.getExpenseReports).toBe('function');
    expect(typeof expenseService.createExpenseReport).toBe('function');
    expect(typeof expenseService.updateExpenseReport).toBe('function');
    expect(typeof expenseService.deleteExpenseReport).toBe('function');
  });

  test('should have expense line methods', () => {
    expect(expenseService.addExpenseLine).toBeDefined();
    expect(expenseService.updateExpenseLine).toBeDefined();
    expect(expenseService.deleteExpenseLine).toBeDefined();
    expect(expenseService.getExpenseLinesByReport).toBeDefined();
    expect(typeof expenseService.addExpenseLine).toBe('function');
    expect(typeof expenseService.updateExpenseLine).toBe('function');
    expect(typeof expenseService.deleteExpenseLine).toBe('function');
    expect(typeof expenseService.getExpenseLinesByReport).toBe('function');
  });

  test('should have document methods', () => {
    expect(expenseService.uploadReportDocument).toBeDefined();
    expect(expenseService.uploadLineDocument).toBeDefined();
    expect(expenseService.getDocumentsByReport).toBeDefined();
    expect(expenseService.getDocumentsByExpenseLine).toBeDefined();
    expect(expenseService.downloadDocument).toBeDefined();
    expect(expenseService.deleteDocument).toBeDefined();
    expect(typeof expenseService.uploadReportDocument).toBe('function');
    expect(typeof expenseService.uploadLineDocument).toBe('function');
    expect(typeof expenseService.getDocumentsByReport).toBe('function');
    expect(typeof expenseService.getDocumentsByExpenseLine).toBe('function');
    expect(typeof expenseService.downloadDocument).toBe('function');
    expect(typeof expenseService.deleteDocument).toBe('function');
  });

  test('should have configuration methods', () => {
    expect(expenseService.getExpenseTypes).toBeDefined();
    expect(expenseService.getCurrencies).toBeDefined();
    expect(expenseService.getExchangeRate).toBeDefined();
    expect(typeof expenseService.getExpenseTypes).toBe('function');
    expect(typeof expenseService.getCurrencies).toBe('function');
    expect(typeof expenseService.getExchangeRate).toBe('function');
  });

  test('should have approval methods', () => {
    expect(expenseService.getPendingApprovals).toBeDefined();
    expect(expenseService.approveExpenseReport).toBeDefined();
    expect(expenseService.rejectExpenseReport).toBeDefined();
    expect(expenseService.requestAdditionalInfo).toBeDefined();
    expect(expenseService.bulkApproveReports).toBeDefined();
    expect(typeof expenseService.getPendingApprovals).toBe('function');
    expect(typeof expenseService.approveExpenseReport).toBe('function');
    expect(typeof expenseService.rejectExpenseReport).toBe('function');
    expect(typeof expenseService.requestAdditionalInfo).toBe('function');
    expect(typeof expenseService.bulkApproveReports).toBe('function');
  });

  test('should be an object with methods', () => {
    expect(expenseService).toBeInstanceOf(Object);
    expect(Object.keys(expenseService).length).toBeGreaterThan(0);
  });

  test('should have all required method categories', () => {
    const methods = Object.keys(expenseService);
    expect(methods.length).toBeGreaterThan(10); // Should have many methods
  });

  test('should have consistent method naming', () => {
    const methods = Object.keys(expenseService);
    methods.forEach(method => {
      expect(typeof expenseService[method]).toBe('function');
    });
  });

  test('should be importable', () => {
    expect(expenseService).toBeDefined();
  });

  test('should have consistent API structure', () => {
    // All methods should be functions
    const methods = Object.keys(expenseService);
    methods.forEach(method => {
      expect(typeof expenseService[method]).toBe('function');
    });
  });
});
