import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import Loading from '../common/Loading';
import { useExpenseReports } from '../../hooks/useExpenseReports';
import './ExpenseReportList.css';

const ExpenseReportList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReports, setSelectedReports] = useState([]);
  const [filterType, setFilterType] = useState('Expense Reports');
  const [sortBy, setSortBy] = useState('Basic');
  const [savedSearch, setSavedSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('Last 6 Months');
  
  // Use the hook with empty dependency to prevent infinite loops
  const { 
    reports, 
    loading, 
    error, 
    pagination, 
    fetchReports, 
    deleteReport, 
    deleteMultipleReports 
  } = useExpenseReports({});

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    fetchReports({ search: searchQuery });
  };

  // Handle report selection
  const handleReportSelection = (reportId) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    const safeReports = Array.isArray(reports) ? reports : [];
    if (selectedReports.length === safeReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(safeReports.map(report => report?.reportId).filter(Boolean));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report');
      return;
    }

    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedReports.length} report(s)?`)) {
            console.log('🗑️ Deleting reports:', selectedReports);
            await deleteMultipleReports(selectedReports);
            setSelectedReports([]); // Clear selection after delete
            alert(`${selectedReports.length} report(s) deleted successfully`);
          }
          break;
        case 'submit':
          if (window.confirm(`Are you sure you want to submit ${selectedReports.length} report(s) for approval?`)) {
            console.log('📤 Submitting reports:', selectedReports);
            // TODO: Implement bulk submit when API is available
            alert('Bulk submit functionality coming soon');
          }
          break;
        case 'edit':
          if (selectedReports.length === 1) {
            navigate(`/expense-reports/${selectedReports[0]}/edit`);
          } else {
            alert('Please select only one report to edit');
          }
          break;
        case 'view':
          if (selectedReports.length === 1) {
            navigate(`/expense-reports/${selectedReports[0]}`);
          } else {
            alert('Please select only one report to view');
          }
          break;
        default:
          console.log('Bulk action:', action, selectedReports);
      }
    } catch (error) {
      console.error('❌ Error in bulk action:', error);
      alert(`Error: ${error.message || 'An error occurred'}`);
    }
  };

  // Handle create report
  const handleCreateReport = () => {
    navigate('/expense-reports/new');
  };

  // Filter reports based on search query (ensure reports is always an array)
  const safeReports = Array.isArray(reports) ? reports : [];
  const filteredReports = safeReports.filter(report =>
    report?.reportId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report?.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report?.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageActions = [
    {
      label: 'Create Report',
      icon: 'fas fa-plus',
      onClick: handleCreateReport,
      className: 'btn btn-success',
      tooltip: 'Create New Expense Report (Ctrl+N)'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', link: '/' },
    { label: 'Manage Expense Reports' }
  ];

  if (loading) {
    return <Loading message="Loading expense reports..." />;
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>Error Loading Reports</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => fetchReports()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="expense-report-list">
      <PageHeader
        title="Manage Expense Reports"
        subtitle="View and manage all your expense reports"
        breadcrumbs={breadcrumbs}
        actions={pageActions}
      />

      {/* Search and Filters */}
      <div className="list-controls">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search expense reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control search-input"
              />
              <button type="submit" className="btn btn-primary search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

          <div className="filter-controls">
            <select
              className="form-control filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Expense Reports">Expense Reports</option>
              <option value="Cash Advances">Cash Advances</option>
              <option value="All Types">All Types</option>
            </select>

            <select
              className="form-control filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Basic">Basic</option>
              <option value="Date">Date</option>
              <option value="Amount">Amount</option>
              <option value="Status">Status</option>
            </select>

            <select
              className="form-control filter-select"
              value={savedSearch}
              onChange={(e) => setSavedSearch(e.target.value)}
            >
              <option value="">Saved Search</option>
              <option value="pending">Pending Reports</option>
              <option value="approved">Approved Reports</option>
              <option value="rejected">Rejected Reports</option>
            </select>

            <select
              className="form-control filter-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last Month">Last Month</option>
              <option value="Last Year">Last Year</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="bulk-actions">
            <button
              className="btn btn-secondary"
              onClick={() => handleBulkAction('edit')}
              disabled={selectedReports.length === 0}
            >
              <i className="fas fa-edit"></i> Edit
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleBulkAction('view')}
              disabled={selectedReports.length === 0}
            >
              <i className="fas fa-eye"></i> View
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleBulkAction('delete')}
              disabled={selectedReports.length === 0}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateReport}
            >
              <i className="fas fa-plus"></i> Create Report
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="reports-table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all reports"
                  />
                </th>
                <th>Report Number</th>
                <th>Date</th>
                <th>Report Status</th>
                <th>Report Total</th>
                <th>Purpose</th>
                <th>Reimbursable Amount</th>
                <th>Payment Date</th>
                {/* <th>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.reportId}
                  className={selectedReports.includes(report.reportId) ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.reportId)}
                      onChange={() => handleReportSelection(report.reportId)}
                      aria-label={`Select report ${report.reportId}`}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/expense-reports/${report.reportId}`}
                      className="report-link"
                    >
                      {report.reportId}
                    </Link>
                  </td>
                  <td>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <StatusBadge status={report.status} />
                  </td>
                  <td>
                    <span className="amount">
                      {report.totalAmount ? report.totalAmount.toFixed(2) : '0.00'} {report.reimbursementCurrency || 'USD'}
                    </span>
                  </td>
                  <td className="purpose-cell">
                    <span title={report.purpose}>
                      {report.purpose || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="amount">
                      {report.reimbursementCurrency || 'USD'} {report.totalAmount ? report.totalAmount.toFixed(2) : '0.00'}
                    </span>
                  </td>
                  <td>{report.approvedAt ? new Date(report.approvedAt).toLocaleDateString() : '-'}</td>
                  {/* <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/expense-reports/${report.reportId}`)}
                        title="View Report"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/expense-reports/${report.reportId}/edit`)}
                        title="Edit Report"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete report ${report.reportId}?`)) {
                            try {
                              await deleteReport(report.reportId);
                              alert('Report deleted successfully');
                            } catch (error) {
                              alert(`Error deleting report: ${error.message}`);
                            }
                          }
                        }}
                        title="Delete Report"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <i className="fas fa-file-invoice-dollar fa-3x"></i>
              <h3>No Expense Reports Found</h3>
              {searchQuery ? (
                <p>No reports match your search criteria. Try adjusting your search terms.</p>
              ) : (
                <p>You haven't created any expense reports yet.</p>
              )}
              <button
                className="btn btn-primary"
                onClick={handleCreateReport}
              >
                <i className="fas fa-plus"></i> Create Your First Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {((pagination.number) * pagination.size) + 1} to{' '}
            {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of{' '}
            {pagination.totalElements} reports
          </div>
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={pagination.number === 0}
              onClick={() => fetchReports({ page: pagination.number - 1 })}
            >
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span className="page-info">
              Page {pagination.number + 1} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={pagination.number >= pagination.totalPages - 1}
              onClick={() => fetchReports({ page: pagination.number + 1 })}
            >
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="summary-footer">
        <div className="summary-item">
          <i className="fas fa-info-circle text-primary"></i>
          <span>Currency Processing Summary</span>
        </div>
        <div className="summary-item">
          <i className="fas fa-clock text-warning"></i>
          <span>Reimbursements processed as per employee Work location</span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReportList;