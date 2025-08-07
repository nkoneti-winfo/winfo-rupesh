import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';

// Mock the expenseService
jest.mock('../../../services/expenseService', () => ({
  expenseService: {
    getDashboard: jest.fn(),
    getExpenseLinesByReport: jest.fn(),
    createExpenseReport: jest.fn(),
    createExpenseLine: jest.fn()
  }
}));

// Mock the handleApiError function
jest.mock('../../../services/api', () => ({
  handleApiError: jest.fn((error, message) => `${message}: ${error.message}`)
}));

// Mock the PageHeader component
jest.mock('../../common/PageHeader', () => {
  return function MockPageHeader({ title, subtitle, children }) {
    return (
      <div data-testid="page-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </div>
    );
  };
});

// Mock StatusBadge component
jest.mock('../../common/StatusBadge', () => {
  return function MockStatusBadge({ status }) {
    return <span data-testid="status-badge">{status}</span>;
  };
});

// Mock Loading component
jest.mock('../../common/Loading', () => {
  return function MockLoading({ message }) {
    return <div data-testid="loading">{message || 'Loading...'}</div>;
  };
});

// Mock ExpenseLineModal component
jest.mock('../../expenseLine/ExpenseLineModal', () => {
  return function MockExpenseLineModal({ onClose, onSave }) {
    return (
      <div data-testid="expense-line-modal">
        <span>Expense Line Modal</span>
      </div>
    );
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard component', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
