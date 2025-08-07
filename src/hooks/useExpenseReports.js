import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services/expenseService.ts';
import { handleApiError } from '../services/api';

// Custom hook for managing expense reports
export const useExpenseReports = (params = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 1,
    number: 0,
    size: 10
  });

  // Fetch expense reports
  const fetchReports = useCallback(async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.getExpenseReports({ ...params, ...searchParams });
      
      // Handle backend ApiResponse<PageResponse<ExpenseReport>> structure
      if (response.data && response.data.success && response.data.data) {
        const pageData = response.data.data;
        
        if (pageData.content && Array.isArray(pageData.content)) {
          // Paginated response with proper structure
          setReports(pageData.content);
          setPagination(pageData.page || {
            totalElements: pageData.content.length,
            totalPages: 1,
            number: 0,
            size: 10,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
            numberOfElements: pageData.content.length
          });
        } else {
          setReports([]);
          setPagination({
            totalElements: 0,
            totalPages: 1,
            number: 0,
            size: 10,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
            numberOfElements: 0
          });
        }
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // Fallback for direct response structure
        setReports(response.data.content);
        setPagination(response.data.page || {
          totalElements: response.data.content.length,
          totalPages: 1,
          number: 0,
          size: 10,
          first: true,
          last: true,
          hasNext: false,
          hasPrevious: false,
          numberOfElements: response.data.content.length
        });
      } else {
        setReports([]);
        setPagination({
          totalElements: 0,
          totalPages: 1,
          number: 0,
          size: 10,
          first: true,
          last: true,
          hasNext: false,
          hasPrevious: false,
          numberOfElements: 0
        });
      }
    } catch (err) {
      console.error('Error fetching expense reports:', err);
      setError(handleApiError(err, 'Failed to fetch expense reports'));
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Create new expense report
  const createReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.createExpenseReport(reportData);
      
      // Handle backend ApiResponse<ExpenseReport> structure
      if (response.data && response.data.success && response.data.data) {
        const newReport = response.data.data;
        setReports(prev => [newReport, ...prev]);
        return { ...response, data: newReport };
      } else if (response.data) {
        // Fallback for direct response
        setReports(prev => [response.data, ...prev]);
        return response;
      }
      
      return response;
    } catch (err) {
      console.error('Error creating expense report:', err);
      setError(handleApiError(err, 'Failed to create expense report'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update expense report
  const updateReport = useCallback(async (reportId, reportData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.updateExpenseReport(reportId, reportData);
      
      // Handle backend ApiResponse<ExpenseReport> structure
      if (response.data && response.data.success && response.data.data) {
        const updatedReport = response.data.data;
        setReports(prev => prev.map(report => 
          report.reportId === reportId 
            ? { ...report, ...updatedReport }
            : report
        ));
        return { ...response, data: updatedReport };
      } else if (response.data) {
        // Fallback for direct response
        setReports(prev => prev.map(report => 
          report.reportId === reportId 
            ? { ...report, ...response.data }
            : report
        ));
        return response;
      }
      
      return response;
    } catch (err) {
      console.error('Error updating expense report:', err);
      setError(handleApiError(err, 'Failed to update expense report'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete expense report
  const deleteReport = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting expense report:', reportId);
      await expenseService.deleteReport(reportId);
      
      // Remove the report from local state
      setReports(prev => prev.filter(report => report.reportId !== reportId));
      
      console.log('✅ Expense report deleted successfully');
      return { data: { message: 'Expense report deleted successfully' } };
    } catch (err) {
      console.error('❌ Error deleting expense report:', err);
      setError(handleApiError(err, 'Failed to delete expense report'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete multiple expense reports
  const deleteMultipleReports = useCallback(async (reportIds) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting multiple expense reports:', reportIds);
      
      // Delete reports one by one
      const deletePromises = reportIds.map(reportId => 
        expenseService.deleteReport(reportId)
      );
      
      await Promise.all(deletePromises);
      
      // Remove the reports from local state
      setReports(prev => prev.filter(report => !reportIds.includes(report.reportId)));
      
      console.log('✅ Multiple expense reports deleted successfully');
      return { data: { message: `${reportIds.length} expense reports deleted successfully` } };
    } catch (err) {
      console.error('❌ Error deleting multiple expense reports:', err);
      setError(handleApiError(err, 'Failed to delete expense reports'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit expense report for approval
  const submitReport = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.submitExpenseReport(reportId);
      
      // Update the local state with the submitted report
      if (response.data) {
        setReports(prev => prev.map(report => 
          report.reportId === reportId 
            ? { ...report, ...response.data }
            : report
        ));
      }
      
      return response;
    } catch (err) {
      console.error('Error submitting expense report:', err);
      setError(handleApiError(err, 'Failed to submit expense report'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch - using empty deps to run only once
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    reports,
    loading,
    error,
    pagination,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    deleteMultipleReports,
    submitReport,
    refresh: fetchReports
  };
};

// Custom hook for managing a single expense report
export const useExpenseReport = (reportId) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.getExpenseReport(reportId);
      
      // Handle backend ApiResponse<ExpenseReport> structure
      if (response.data && response.data.success && response.data.data) {
        setReport(response.data.data);
      } else if (response.data) {
        // Fallback for direct response
        setReport(response.data);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error('Error fetching expense report:', err);
      setError(handleApiError(err, 'Failed to fetch expense report'));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    report,
    loading,
    error,
    refresh: fetchReport,
    setReport
  };
};