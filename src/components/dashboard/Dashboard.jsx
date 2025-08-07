import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import Loading from '../common/Loading';
import ExpenseLineModal from '../expenseLine/ExpenseLineModal';
import { expenseService } from '../../services/expenseService.ts';
import { handleApiError } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [expenseItems, setExpenseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExpenseLineModal, setShowExpenseLineModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get current user's dashboard data
        // Using a default employee ID for now - in real app this would come from auth context
        const employeeId = 'EMP001';
        const response = await expenseService.getDashboard(employeeId);
        
        // Handle backend ApiResponse<DashboardSummary> structure
        if (response.data && response.data.success && response.data.data) {
          const dashboardData = response.data.data;
          setDashboardData(dashboardData);
          
          // Load expense lines from recent reports to populate the expense items table
          const allExpenseItems = [];
          if (dashboardData.recentReports) {
            for (const report of dashboardData.recentReports) {
              try {
                const linesResponse = await expenseService.getExpenseLinesByReport(report.reportId);
                if (linesResponse.data && linesResponse.data.success && linesResponse.data.data) {
                  const lines = linesResponse.data.data;
                  const reportItems = lines.map(line => ({
                    id: line.lineId,
                    reportId: report.reportId,
                    description: line.description,
                    amount: line.reimbursementAmount,
                    currency: line.reimbursementCurrency,
                    date: line.expenseDate,
                    type: line.expenseType?.name || 'Unknown',
                    merchant: line.merchantVendor || '-',
                    location: line.businessPurpose || '-',
                    hasAttachment: line.documents && line.documents.length > 0,
                    documents: line.documents
                  }));
                  allExpenseItems.push(...reportItems);
                }
              } catch (error) {
                console.warn(`Failed to load expense lines for report ${report.reportId}:`, error);
              }
            }
          }
          
          setExpenseItems(allExpenseItems);
        } else if (response.data) {
          // Fallback for direct response
          setDashboardData(response.data);
          setExpenseItems(response.data.expenseItems || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        const errorMessage = handleApiError(error, 'Failed to load dashboard data');
        // Set empty data on error
        setDashboardData({ 
          employeeId: 'EMP001',
          employeeName: 'Current User',
          totalExpenses: 0,
          pendingAmount: 0,
          approvedAmount: 0,
          recentReports: []
        });
        setExpenseItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle expense item selection
  const handleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === expenseItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(expenseItems.map(item => item.id));
    }
  };

  // Handle create report action
  const handleCreateReport = () => {
    navigate('/expense-reports/new');
  };

  // Handle create expense item - now properly opens modal
  const handleCreateExpenseItem = () => {
    setSelectedLine(null);
    setShowExpenseLineModal(true);
  };

  // Handle expense line save
  const handleExpenseLineSave = async (lineData) => {
    try {
      // For now, just close the modal and refresh the dashboard
      // In a real implementation, you would save the expense line to a report
      console.log('Saving expense line:', lineData);
      setShowExpenseLineModal(false);
      setSelectedLine(null);
      
      // Refresh dashboard data
      // You could reload the dashboard data here
      
    } catch (error) {
      console.error('Failed to save expense line:', error);
      alert('Failed to save expense line. Please try again.');
    }
  };

  // Filter expense items based on search
  const filteredExpenseItems = expenseItems.filter(item =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pageActions = [
    {
      label: 'Create Report',
      icon: 'fas fa-plus',
      onClick: handleCreateReport,
      className: 'btn btn-primary',
      tooltip: 'Create New Expense Report (Ctrl+N)'
    },
    {
      label: 'See All',
      onClick: () => navigate('/expense-reports'),
      className: 'btn btn-secondary',
      tooltip: 'View All Expense Reports'
    }
  ];

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <PageHeader
        title="Expenses Dashboard"
        subtitle="Manage your expense reports and track spending"
        actions={pageActions}
      />

      {/* Expense Reports Summary Cards */}
      <div className="dashboard-summary">
        <div className="row">
          {dashboardData?.recentReports?.slice(0, 5).map((report, index) => (
            <div key={report.reportId} className="col-md-6 col-lg-4 col-xl-3">
              <div className="expense-card">
                <div className="card-header">
                  <StatusBadge status={report.status} />
                  <div className="card-actions">
                    <button className="btn-icon" title="More options">
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="report-id">{report.reportId}</div>
                  <div className="report-title">{report.reportTitle || 'Untitled Report'}</div>
                  <div className="report-details">
                    {report.rejectedBy && (
                      <div className="text-muted">Rejected by {report.rejectedBy}</div>
                    )}
                    {report.requestedBy && (
                      <div className="text-muted">Information requested by {report.requestedBy}</div>
                    )}
                    {report.daysInQueue && (
                      <div className="text-muted">{report.daysInQueue} days in queue</div>
                    )}
                  </div>
                  <div className="report-amount">
                    <span className="amount">{report.totalAmount.toFixed(2)}</span>
                    <span className="currency">{report.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Expense Items Section */}
      <div className="expense-items-section">
        <div className="section-header">
          <h2 className="section-title">Recent Expense Items ({expenseItems.length})</h2>
          <div className="section-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search expense items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>

        <div className="expense-items-table-container">
          <div className="table-header">
            <div className="table-actions">
              <div className="actions-dropdown">
                <button className="btn btn-secondary dropdown-toggle">
                  <i className="fas fa-cog"></i> Actions
                </button>
              </div>
              <button 
                className="btn btn-success"
                onClick={handleCreateExpenseItem}
              >
                <i className="fas fa-plus"></i> Create Item
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredExpenseItems.length && filteredExpenseItems.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all items"
                    />
                  </th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Merchant</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Attachments</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenseItems.map((item) => (
                  <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelection(item.id)}
                        aria-label={`Select item ${item.id}`}
                      />
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <span className="expense-type">{item.type}</span>
                    </td>
                    <td>
                      <span className="amount">{item.amount.toFixed(2)}</span>
                      <span className="currency ml-1">{item.currency}</span>
                    </td>
                    <td>{item.merchant}</td>
                    <td>{item.location}</td>
                    <td>{item.description}</td>
                    <td>
                      {item.hasAttachment ? (
                        <span className="text-success">
                          <i className="fas fa-paperclip"></i> {item.documents?.length || 0}
                        </span>
                      ) : (
                        <button className="btn btn-link btn-sm text-primary">
                          <i className="fas fa-paperclip"></i> Add
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredExpenseItems.length === 0 && (
            <div className="table-empty">
              <div className="text-center text-muted p-4">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <p>No expense items found</p>
                {searchQuery && (
                  <p>Try adjusting your search terms</p>
                )}
                {!searchQuery && expenseItems.length === 0 && (
                  <p>No expense items have been created yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Line Modal */}
      {showExpenseLineModal && (
        <ExpenseLineModal
          reportId="new"
          lineData={selectedLine}
          onClose={() => {
            setShowExpenseLineModal(false);
            setSelectedLine(null);
          }}
          onSave={handleExpenseLineSave}
        />
      )}
    </div>
  );
};

export default Dashboard;