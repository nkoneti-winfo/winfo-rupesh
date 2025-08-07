import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <header className="header">
      <Link to="/" className="header-brand">
        <i className="fas fa-receipt"></i>
        Winfo Pulse
      </Link>
      
      <div className="header-controls">
        <form className="header-search" onSubmit={handleSearchSubmit}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search"
          />
        </form>
        
        <div className="header-actions">
          <button className="header-icon" title="Global Search (Ctrl+F)" aria-label="Global Search">
            <i className="fas fa-search"></i>
          </button>
          <button className="header-icon" title="Notifications" aria-label="Notifications">
            <i className="fas fa-bell"></i>
          </button>
          <button className="header-icon" title="Help (F1)" aria-label="Help">
            <i className="fas fa-question-circle"></i>
          </button>
          <button className="header-icon" title="Settings" aria-label="Settings">
            <i className="fas fa-cog"></i>
          </button>
          
          <div className="user-menu">
            <div className="user-avatar" title="User Menu">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;