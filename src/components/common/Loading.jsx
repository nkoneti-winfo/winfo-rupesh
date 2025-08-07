import React from 'react';

const Loading = ({ 
  size = 'md', 
  overlay = false, 
  message = 'Loading...', 
  className = '' 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'loading-sm';
      case 'lg':
        return 'loading-lg';
      default:
        return '';
    }
  };

  const LoadingSpinner = () => (
    <div className={`loading ${getSizeClass()} ${className}`} aria-label={message}></div>
  );

  const LoadingContent = () => (
    <div className="text-center">
      <LoadingSpinner />
      {message && <div className="mt-1 text-muted">{message}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default Loading;