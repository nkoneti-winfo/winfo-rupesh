import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services/expenseService.ts';
import { handleApiError } from '../services/api';

/**
 * Custom hook for managing expense lines
 * Provides CRUD operations for expense line items within reports
 */
export const useExpenseLines = () => {
  const [expenseLines, setExpenseLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add expense line to a report
   */
  const addExpenseLine = useCallback(async (reportId, lineData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!lineData.expenseDate) {
        throw new Error('Expense date is required');
      }
      if (!lineData.expenseTypeId) {
        throw new Error('Expense type is required');
      }
      if (!lineData.description || lineData.description.trim() === '') {
        throw new Error('Description is required');
      }
      if (!lineData.originalAmount || lineData.originalAmount <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      if (!lineData.originalCurrency) {
        throw new Error('Currency is required');
      }

      // Prepare data according to backend DTO structure with proper data types
      const requestData = {
        expenseDate: lineData.expenseDate, // Should be in YYYY-MM-DD format
        expenseTypeId: parseInt(lineData.expenseTypeId), // Ensure it's a number
        description: lineData.description.trim(),
        originalAmount: parseFloat(lineData.originalAmount), // Ensure it's a number
        originalCurrency: lineData.originalCurrency.trim().toUpperCase(),
        merchantVendor: lineData.merchantVendor ? lineData.merchantVendor.trim() : null,
        businessPurpose: lineData.businessPurpose ? lineData.businessPurpose.trim() : (lineData.description ? lineData.description.trim() : null),
        projectCode: lineData.projectCode ? lineData.projectCode.trim() : null
      };

      console.log('Sending expense line data to backend:', requestData);
      const response = await expenseService.addExpenseLine(reportId, requestData);
      console.log('Backend response:', response);
      
      // Handle backend ApiResponse<ExpenseLine> structure
      let newLine;
      if (response.data && response.data.success && response.data.data) {
        newLine = response.data.data;
      } else if (response.data) {
        newLine = response.data;
      }

      // Add to local state if we have the new line
      if (newLine) {
        setExpenseLines(prev => [...prev, newLine]);
      }
      
      return response;
    } catch (err) {
      console.error('Error adding expense line:', err);
      setError(handleApiError(err, 'Failed to add expense line'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update expense line
   */
  const updateExpenseLine = useCallback(async (lineId, lineData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields for update
      if (lineData.expenseDate && lineData.expenseTypeId && lineData.description && lineData.originalAmount && lineData.originalCurrency) {
        if (lineData.description.trim() === '') {
          throw new Error('Description cannot be empty');
        }
        if (lineData.originalAmount <= 0) {
          throw new Error('Amount must be greater than zero');
        }
      }

      // Prepare data according to backend DTO structure with proper data types
      const requestData = {
        expenseDate: lineData.expenseDate,
        expenseTypeId: lineData.expenseTypeId ? parseInt(lineData.expenseTypeId) : undefined,
        description: lineData.description ? lineData.description.trim() : undefined,
        originalAmount: lineData.originalAmount ? parseFloat(lineData.originalAmount) : undefined,
        originalCurrency: lineData.originalCurrency ? lineData.originalCurrency.trim().toUpperCase() : undefined,
        merchantVendor: lineData.merchantVendor ? lineData.merchantVendor.trim() : undefined,
        businessPurpose: lineData.businessPurpose ? lineData.businessPurpose.trim() : (lineData.description ? lineData.description.trim() : undefined),
        projectCode: lineData.projectCode ? lineData.projectCode.trim() : undefined
      };

      // Remove undefined values to avoid sending null/undefined to backend
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === undefined) {
          delete requestData[key];
        }
      });

      console.log('Updating expense line with data:', requestData);
      const response = await expenseService.updateExpenseLine(lineId, requestData);
      console.log('Update response:', response);
      
      // Handle backend ApiResponse<ExpenseLine> structure
      let updatedLine;
      if (response.data && response.data.success && response.data.data) {
        updatedLine = response.data.data;
      } else if (response.data) {
        updatedLine = response.data;
      }

      // Update local state
      if (updatedLine) {
        setExpenseLines(prev => prev.map(line => 
          line.lineId === lineId 
            ? { ...line, ...updatedLine }
            : line
        ));
      }
      
      return response;
    } catch (err) {
      console.error('Error updating expense line:', err);
      setError(handleApiError(err, 'Failed to update expense line'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete expense line
   */
  const deleteExpenseLine = useCallback(async (lineId) => {
    setLoading(true);
    setError(null);
    
    try {
      await expenseService.deleteExpenseLine(lineId);
      
      // Remove from local state
      setExpenseLines(prev => prev.filter(line => line.lineId !== lineId));
      
      return { data: { message: 'Expense line deleted successfully' } };
    } catch (err) {
      console.error('Error deleting expense line:', err);
      setError(handleApiError(err, 'Failed to delete expense line'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get expense lines for a specific report
   */
  const fetchExpenseLinesByReport = useCallback(async (reportId) => {
    if (!reportId || reportId === 'new') {
      setExpenseLines([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.getExpenseLinesByReport?.(reportId);
      
      // Handle backend ApiResponse<ExpenseLine[]> structure
      if (response?.data && response.data.success && response.data.data) {
        setExpenseLines(response.data.data || []);
      } else if (response?.data && Array.isArray(response.data)) {
        setExpenseLines(response.data);
      } else {
        setExpenseLines([]);
      }
    } catch (err) {
      console.error('Error fetching expense lines:', err);
      setError(handleApiError(err, 'Failed to fetch expense lines'));
      setExpenseLines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear expense lines from local state
   */
  const clearExpenseLines = useCallback(() => {
    setExpenseLines([]);
    setError(null);
  }, []);

  return {
    expenseLines,
    loading,
    error,
    addExpenseLine,
    updateExpenseLine,
    deleteExpenseLine,
    fetchExpenseLinesByReport,
    clearExpenseLines,
    // Helper methods
    setExpenseLines,
    refresh: fetchExpenseLinesByReport
  };
};

/**
 * Custom hook for managing expense lines for a specific report
 */
export const useReportExpenseLines = (reportId) => {
  const {
    expenseLines,
    loading,
    error,
    addExpenseLine,
    updateExpenseLine,
    deleteExpenseLine,
    fetchExpenseLinesByReport,
    clearExpenseLines,
    setExpenseLines
  } = useExpenseLines();

  // Fetch expense lines when reportId changes
  useEffect(() => {
    if (reportId && reportId !== 'new') {
      fetchExpenseLinesByReport(reportId);
    } else {
      clearExpenseLines();
    }
  }, [reportId, fetchExpenseLinesByReport, clearExpenseLines]);

  // Wrapper functions that automatically include reportId
  const addLine = useCallback(async (lineData) => {
    if (!reportId || reportId === 'new') {
      throw new Error('Cannot add expense line: Report must be saved first');
    }
    return addExpenseLine(reportId, lineData);
  }, [reportId, addExpenseLine]);

  return {
    expenseLines,
    loading,
    error,
    addLine,
    updateExpenseLine,
    deleteExpenseLine,
    refresh: () => fetchExpenseLinesByReport(reportId),
    // Helper methods for local state management
    setExpenseLines,
    clearExpenseLines
  };
};

export default useExpenseLines;