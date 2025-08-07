import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' || path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      section: 'Dashboard',
      items: [
        { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Expenses Dashboard' }
      ]
    },
    {
      section: 'Expense Reports',
      items: [
        { path: '/expense-reports', icon: 'fas fa-file-invoice-dollar', label: 'Expense Reports' },
        { path: '/expense-reports/new', icon: 'fas fa-plus-circle', label: 'Create Report' }
      ]
    },
    {
      section: 'Approvals',
      items: [
        { path: '/approvals', icon: 'fas fa-check-circle', label: 'Approvals' }
      ]
    },
    {
      section: 'Configuration',
      items: [
        { path: '/configuration/templates', icon: 'fas fa-clipboard-list', label: 'Expense Templates' },
        { path: '/configuration/types', icon: 'fas fa-tags', label: 'Expense Types' }
      ]
    }
  ];

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <nav className="sidebar-nav">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <i className={item.icon}></i>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;