import React, { useState, useEffect, useCallback, useRef } from 'react';
import { expenseService } from '../../services/expenseService.ts';
import './ApiStatusIndicator.css';

const ApiStatusIndicator = () => {
  const [status, setStatus] = useState('checking'); // 'online', 'offline', 'checking', 'error'
  const [lastChecked, setLastChecked] = useState(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef(null);

  const checkApiStatus = useCallback(async () => {
    try {
      setStatus('checking');
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Use the health check method from expense service
      await expenseService.healthCheck();
      
      setStatus('online');
      retryCountRef.current = 0;
      setLastChecked(new Date());
    } catch (error) {
      console.warn('API connectivity check failed:', error);
      setStatus('offline');
      retryCountRef.current += 1;
      setLastChecked(new Date());

      // Auto-retry with exponential backoff (max 3 retries)
      if (retryCountRef.current < 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000); // Max 10 seconds
        timeoutRef.current = setTimeout(() => {
          checkApiStatus();
        }, retryDelay);
      }
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkApiStatus();

    // Periodic health checks every 60 seconds (reduced frequency)
    const interval = setInterval(checkApiStatus, 60000);

    // Check when window regains focus
    const handleFocus = () => {
      // Only check if we're offline and haven't checked recently
      if (status === 'offline') {
        checkApiStatus();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Empty dependency array to prevent infinite loops

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return 'fas fa-check-circle';
      case 'offline':
        return 'fas fa-exclamation-triangle';
      case 'checking':
        return 'fas fa-spinner fa-spin';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'API Connected';
      case 'offline':
        return 'API Disconnected';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusClass = () => {
    return `api-status-indicator ${status}`;
  };

  const handleRetry = () => {
    retryCountRef.current = 0;
    checkApiStatus();
  };

  // Don't show indicator if API is online (to reduce UI clutter)
  if (status === 'online') {
    return null;
  }

  return (
    <div className={getStatusClass()}>
      <div className="status-content">
        <i className={getStatusIcon()}></i>
        <span className="status-text">{getStatusText()}</span>
        
        {status === 'offline' && (
          <button 
            className="retry-btn"
            onClick={handleRetry}
            title="Retry connection"
          >
            <i className="fas fa-refresh"></i>
          </button>
        )}
      </div>
      
      {lastChecked && (
        <div className="status-timestamp">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
      
      {status === 'offline' && (
        <div className="status-message">
          Please check your internet connection or contact support if the problem persists.
        </div>
      )}
    </div>
  );
};

export default ApiStatusIndicator;