import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all components to avoid any dependencies
jest.mock('./components/common/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

jest.mock('./components/common/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('./components/dashboard/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock('./components/expenseReport/ExpenseReportList', () => {
  return function MockExpenseReportList() {
    return <div data-testid="expense-report-list">Expense Report List</div>;
  };
});

jest.mock('./components/approvals/ApprovalQueue', () => {
  return function MockApprovalQueue() {
    return <div data-testid="approval-queue">Approval Queue</div>;
  };
});

jest.mock('./components/configuration/ExpenseTypeManagement', () => {
  return function MockExpenseTypeManagement() {
    return <div data-testid="expense-type-management">Expense Type Management</div>;
  };
});

jest.mock('./components/configuration/ExpenseTemplateManagement', () => {
  return function MockExpenseTemplateManagement() {
    return <div data-testid="expense-template-management">Expense Template Management</div>;
  };
});

// Mock all services
jest.mock('./services/expenseService', () => ({
  expenseService: {
    getDashboard: jest.fn(),
    getExpenseReports: jest.fn(),
    getExpenseLines: jest.fn()
  }
}));

jest.mock('./services/api', () => ({
  handleApiError: jest.fn()
}));

describe('App Component', () => {
  test('renders app without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('renders main layout structure', () => {
    render(<App />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
