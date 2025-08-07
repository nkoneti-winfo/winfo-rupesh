// Application Configuration
export const appConfig = {
  // API Configuration
  api: {
    // Enable/disable API health monitoring
    enableHealthCheck: false, // Set to true to enable API status monitoring
    healthCheckInterval: 60000, // 60 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second base delay
  },
  
  // Feature flags
  features: {
    showApiStatus: true, // Show API status indicator
    enableErrorBoundary: true, // Enable error boundaries
    enableLogging: true, // Enable API request logging
  },
  
  // Default settings
  defaults: {
    employeeId: 'EMP001', // Default employee ID for development
    pagination: {
      defaultPageSize: 10,
      maxPageSize: 100
    }
  }
};

export default appConfig;