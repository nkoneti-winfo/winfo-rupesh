import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services/expenseService.ts';
import { handleApiError } from '../services/api';

// Custom hook for managing expense types
export const useExpenseTypes = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenseTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.getExpenseTypes();
      
      // Handle backend ApiResponse<ExpenseType[]> structure
      if (response.data && response.data.success && response.data.data) {
        setExpenseTypes(response.data.data || []);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        setExpenseTypes(response.data);
      } else {
        setExpenseTypes([]);
      }
    } catch (err) {
      console.error('Error fetching expense types:', err);
      setError(handleApiError(err, 'Failed to fetch expense types'));
      setExpenseTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createExpenseType = useCallback(async (typeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.createExpenseType(typeData);
      
      // Add the new type to local state
      if (response.data && response.data.success && response.data.data) {
        setExpenseTypes(prev => [...prev, response.data.data]);
      } else if (response.data) {
        setExpenseTypes(prev => [...prev, response.data]);
      }
      
      return response;
    } catch (err) {
      console.error('Error creating expense type:', err);
      setError(handleApiError(err, 'Failed to create expense type'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExpenseType = useCallback(async (typeId, typeData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.updateExpenseType(typeId, typeData);
      
      // Update the local state
      if (response.data && response.data.success && response.data.data) {
        setExpenseTypes(prev => prev.map(type => 
          type.expenseTypeId === typeId 
            ? { ...type, ...response.data.data }
            : type
        ));
      } else if (response.data) {
        setExpenseTypes(prev => prev.map(type => 
          type.expenseTypeId === typeId 
            ? { ...type, ...response.data }
            : type
        ));
      }
      
      return response;
    } catch (err) {
      console.error('Error updating expense type:', err);
      setError(handleApiError(err, 'Failed to update expense type'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExpenseType = useCallback(async (typeId) => {
    setLoading(true);
    setError(null);
    
    try {
      await expenseService.deleteExpenseType(typeId);
      
      // Remove from local state
      setExpenseTypes(prev => prev.filter(type => type.expenseTypeId !== typeId));
      
      return { data: { message: 'Expense type deleted successfully' } };
    } catch (err) {
      console.error('Error deleting expense type:', err);
      setError(handleApiError(err, 'Failed to delete expense type'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenseTypes();
  }, [fetchExpenseTypes]);

  return {
    expenseTypes,
    loading,
    error,
    fetchExpenseTypes,
    createExpenseType,
    updateExpenseType,
    deleteExpenseType,
    refresh: fetchExpenseTypes
  };
};

// Custom hook for managing expense templates
export const useExpenseTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.getExpenseTemplates();
      // Handle backend ApiResponse<ExpenseTemplate[]> structure
      if (response.data && response.data.success && response.data.data) {
        setTemplates(response.data.data || []);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        setTemplates(response.data);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error fetching expense templates:', err);
      setError(handleApiError(err, 'Failed to fetch expense templates'));
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (templateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.createExpenseTemplate(templateData);

      
      // Add the new template to local state
      if (response.data && response.data.success && response.data.data) {
        setTemplates(prev => [...prev, response.data.data]);
      } else if (response.data) {
        setTemplates(prev => [...prev, response.data]);
      }
      
      return response;
    } catch (err) {
      console.error('Error creating template:', err);
      setError(handleApiError(err, 'Failed to create template'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (templateId, templateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.updateExpenseTemplate(templateId, templateData);

      
      // Update the local state
      if (response.data && response.data.success && response.data.data) {
        setTemplates(prev => prev.map(template => 
          template.templateId === templateId 
            ? { ...template, ...response.data.data }
            : template
        ));
      } else if (response.data) {
        setTemplates(prev => prev.map(template => 
          template.templateId === templateId 
            ? { ...template, ...response.data }
            : template
        ));
      }
      
      return response;
    } catch (err) {
      console.error('Error updating template:', err);
      setError(handleApiError(err, 'Failed to update template'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId) => {
    setLoading(true);
    setError(null);
    
    try {
      await expenseService.deleteExpenseTemplate(templateId);

      
      // Remove from local state
      setTemplates(prev => prev.filter(template => template.templateId !== templateId));
      
      return { data: { message: 'Template deleted successfully' } };
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(handleApiError(err, 'Failed to delete template'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: fetchTemplates
  };
};

// Custom hook for currencies and exchange rates
export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseService.getCurrencies();
      
      // Handle backend ApiResponse<Currency[]> structure
      if (response.data && response.data.success && response.data.data) {
        setCurrencies(Array.isArray(response.data.data) ? response.data.data : []);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        setCurrencies(response.data);
      } else {
        console.warn('Unexpected currencies response format:', response);
        setCurrencies([]);
      }
    } catch (err) {
      console.error('Error fetching currencies:', err);
      setError(handleApiError(err, 'Failed to fetch currencies'));
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getExchangeRate = useCallback(async (fromCurrency, toCurrency, date) => {
    try {
      const response = await expenseService.getExchangeRate(fromCurrency, toCurrency, date);
      return response;
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      throw new Error(handleApiError(err, 'Failed to fetch exchange rate'));
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  return {
    currencies,
    loading,
    error,
    fetchCurrencies,
    getExchangeRate,
    refresh: fetchCurrencies
  };
};