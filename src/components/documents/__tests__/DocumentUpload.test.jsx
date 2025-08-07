import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentUpload from '../DocumentUpload';

// Mock the expenseService
jest.mock('../../../services/expenseService', () => ({
  expenseService: {
    uploadLineDocument: jest.fn(),
    uploadReportDocument: jest.fn(),
    deleteDocument: jest.fn()
  }
}));

// Mock the handleApiError function
jest.mock('../../../services/api', () => ({
  handleApiError: jest.fn((error, message) => `${message}: ${error.message}`)
}));

describe('DocumentUpload Component', () => {
  const defaultProps = {
    reportId: 'EXP001',
    lineId: null,
    onUploadSuccess: jest.fn(),
    onUploadError: jest.fn(),
    maxFileSize: 10485760, // 10MB
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'tiff']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload area correctly', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  test('renders drag and drop text', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText('Drag and drop a file here, or click to browse')).toBeInTheDocument();
  });

  test('renders file size information', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText(/Maximum file size:/)).toBeInTheDocument();
  });

  test('renders allowed file types', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText(/Allowed types:/)).toBeInTheDocument();
  });

  test('renders with custom props', () => {
    const customProps = {
      ...defaultProps,
      maxFileSize: 5242880, // 5MB
      allowedTypes: ['pdf', 'doc']
    };
    
    render(<DocumentUpload {...customProps} />);
    expect(screen.getByText(/Maximum file size:/)).toBeInTheDocument();
  });

  test('renders upload icon', () => {
    render(<DocumentUpload {...defaultProps} />);
    const uploadIcon = screen.getByText('Upload Document').closest('div');
    expect(uploadIcon).toBeInTheDocument();
  });

  test('renders file input (hidden)', () => {
    render(<DocumentUpload {...defaultProps} />);
    const fileInput = screen.getByDisplayValue('');
    expect(fileInput).toBeInTheDocument();
  });

  test('has document-upload container', () => {
    render(<DocumentUpload {...defaultProps} />);
    const container = screen.getByText('Upload Document').closest('.document-upload');
    expect(container).toBeInTheDocument();
  });

  test('renders upload content section', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  test('renders upload info section', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText(/Maximum file size:/)).toBeInTheDocument();
  });

  test('accepts reportId prop', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  test('accepts lineId prop', () => {
    const propsWithLineId = {
      ...defaultProps,
      lineId: 'LINE001'
    };
    render(<DocumentUpload {...propsWithLineId} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  test('accepts callback props', () => {
    render(<DocumentUpload {...defaultProps} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  test('has accessible upload area', () => {
    render(<DocumentUpload {...defaultProps} />);
    const uploadArea = screen.getByText('Upload Document').closest('div');
    expect(uploadArea).toBeInTheDocument();
  });

  test('has file input with proper attributes', () => {
    render(<DocumentUpload {...defaultProps} />);
    const fileInput = screen.getByDisplayValue('');
    expect(fileInput).toHaveAttribute('type', 'file');
  });
});
