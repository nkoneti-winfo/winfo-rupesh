import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions = [],
  className = '' 
}) => {
  return (
    <div className={`page-header ${className}`}>
      {breadcrumbs.length > 0 && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}>
              {crumb.link && index < breadcrumbs.length - 1 ? (
                <a href={crumb.link} className="breadcrumb-link">
                  {crumb.label}
                </a>
              ) : (
                crumb.label
              )}
            </div>
          ))}
        </nav>
      )}
      
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      
      {actions.length > 0 && (
        <div className="page-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              className={action.className || 'btn btn-primary'}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.tooltip}
            >
              {action.icon && <i className={action.icon}></i>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;