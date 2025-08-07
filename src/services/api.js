import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 401:
          console.error('Unauthorized - redirecting to login');
          // Handle authentication error
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden:', data);
          break;
        case 404:
          console.error('Not Found:', data);
          break;
        case 422:
          console.error('Validation Error:', data);
          break;
        case 500:
          console.error('Internal Server Error:', data);
          break;
        default:
          console.error(`HTTP Error ${status}:`, data);
      }
      
      // Return formatted error
      return Promise.reject({
        status,
        message: data?.message || error.message,
        details: data?.details || [],
        timestamp: data?.timestamp
      });
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        details: []
      });
    } else {
      // Other error
      console.error('Request Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message,
        details: []
      });
    }
  }
);

// Generic API methods
export const api = {
  // GET request
  get: (url, params = {}) => {
    return apiClient.get(url, { params });
  },

  // POST request
  post: (url, data = {}) => {
    return apiClient.post(url, data);
  },

  // PUT request
  put: (url, data = {}) => {
    return apiClient.put(url, data);
  },

  // PATCH request
  patch: (url, data = {}) => {
    return apiClient.patch(url, data);
  },

  // DELETE request
  delete: (url) => {
    return apiClient.delete(url);
  },

  // File upload request
  uploadFile: (url, file, onUploadProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
  },

  // Download file request
  downloadFile: (url, filename) => {
    return apiClient.get(url, {
      responseType: 'blob',
    }).then(response => {
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }
};

// Utility functions for handling API responses
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
};

export const handleValidationErrors = (error) => {
  if (error?.details && Array.isArray(error.details)) {
    return error.details.reduce((acc, detail) => {
      if (detail.field) {
        acc[detail.field] = detail.message;
      }
      return acc;
    }, {});
  }
  
  return {};
};

export default apiClient;