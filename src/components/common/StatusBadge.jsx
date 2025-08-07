import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'badge-draft';
      case 'pending':
      case 'submitted':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      case 'information requested':
      case 'info requested':
        return 'badge-information-requested';
      default:
        return 'badge-draft';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Draft';
    
    // Convert to proper case
    return status
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span className={`badge ${getStatusClass(status)} ${className}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;