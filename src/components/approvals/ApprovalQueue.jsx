import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import Loading from '../common/Loading';
import { expenseService } from '../../services/expenseService.ts';
import { handleApiError } from '../../services/api';
import './ApprovalQueue.css';

const ApprovalQueue = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [sortBy, setSortBy] = useState('Oldest Requests');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentApproval, setCurrentApproval] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);
  const [comments, setComments] = useState('');
  const [approverId, setApproverId] = useState('EMP002'); // Default approver ID for testing - using actual employee ID

  // Load approvals data
  useEffect(() => {
    const loadApprovals = async () => {
      setLoading(true);
      
      try {
        // Use the new approval API
        const response = await expenseService.getPendingApprovals(approverId, 0, 50);
        
        if (response.data && response.data.success) {
          // Handle the ApiResponse structure - data is nested under response.data.data
          const approvalsData = response.data.data?.content || [];
          
          setApprovals(Array.isArray(approvalsData) ? approvalsData : []);
        } else {
          setApprovals([]);
        }
      } catch (error) {
        console.error('Failed to load approvals:', error);
        const errorMessage = handleApiError(error, 'Failed to load approvals');
                  setApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    loadApprovals();
  }, [approverId]);

  // Handle approval selection
  const handleApprovalSelection = (reportId) => {
    setSelectedApprovals(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedApprovals.length === approvals.length) {
      setSelectedApprovals([]);
    } else {
      setSelectedApprovals(approvals.map(approval => approval.reportId));
    }
  };

  // Handle individual approval actions
  const handleApprovalAction = (approval, action) => {
    setCurrentApproval(approval);
    setApprovalAction(action);
    setComments('');
    setShowApprovalModal(true);
  };

  // Handle bulk approval
  const handleBulkApproval = async () => {
    if (selectedApprovals.length === 0) {
      alert('Please select at least one report to approve');
      return;
    }

    if (window.confirm(`Are you sure you want to approve ${selectedApprovals.length} report(s)?`)) {
      try {
        const bulkApprovalData = {
          reportIds: selectedApprovals,
          approverId: approverId,
          comments: 'Bulk approval'
        };

        await expenseService.bulkApproveReports(bulkApprovalData);
        
        setApprovals(prev => prev.filter(approval => !selectedApprovals.includes(approval.reportId)));
        setSelectedApprovals([]);
        alert(`${selectedApprovals.length} report(s) approved successfully`);
      } catch (error) {
        console.error('Bulk approval failed:', error);
        const errorMessage = handleApiError(error, 'Failed to process bulk approval');
        alert(`Failed to approve reports: ${errorMessage}`);
      }
    }
  };

  // Handle bulk rejection
  const handleBulkRejection = async () => {
    if (selectedApprovals.length === 0) {
      alert('Please select at least one report to reject');
      return;
    }

    const comments = prompt('Please provide a reason for rejection:');
    if (comments && comments.trim()) {
      try {
        // For bulk rejection, we'll process each report individually
        const rejectionPromises = selectedApprovals.map(reportId => 
          expenseService.rejectExpenseReport(reportId, {
            approverId: approverId,
            comments: comments.trim()
          })
        );

        await Promise.all(rejectionPromises);
        
        setApprovals(prev => prev.filter(approval => !selectedApprovals.includes(approval.reportId)));
        setSelectedApprovals([]);
        alert(`${selectedApprovals.length} report(s) rejected successfully`);
      } catch (error) {
        console.error('Bulk rejection failed:', error);
        const errorMessage = handleApiError(error, 'Failed to process bulk rejection');
        alert(`Failed to reject reports: ${errorMessage}`);
      }
    }
  };

  // Submit approval/rejection
  const handleSubmitApproval = async () => {
    if (!currentApproval || !approvalAction) return;

    try {
      const approvalData = {
        approverId: approverId,
        comments: comments.trim()
      };

      let response;
      if (approvalAction === 'approve') {
        response = await expenseService.approveExpenseReport(currentApproval.reportId, approvalData);
      } else if (approvalAction === 'reject') {
        response = await expenseService.rejectExpenseReport(currentApproval.reportId, approvalData);
      } else {
        response = await expenseService.requestAdditionalInfo(currentApproval.reportId, approvalData);
      }

      // Remove from approvals list
      setApprovals(prev => prev.filter(approval => approval.reportId !== currentApproval.reportId));
      
      const actionText = approvalAction === 'approve' ? 'approved' : 
                        approvalAction === 'reject' ? 'rejected' : 'updated';
      alert(`Report ${currentApproval.reportId} ${actionText} successfully`);
      
      setShowApprovalModal(false);
      setCurrentApproval(null);
      setApprovalAction(null);
      setComments('');
    } catch (error) {
      console.error('Approval action failed:', error);
      const errorMessage = handleApiError(error, 'Failed to process approval');
      alert(`Failed to process approval: ${errorMessage}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate days in queue
  const getDaysInQueue = (submittedAt) => {
    if (!submittedAt) return 0;
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now - submitted);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const pageActions = [
    {
      label: 'Approve',
      icon: 'fas fa-check',
      onClick: handleBulkApproval,
      className: 'btn btn-success',
      disabled: selectedApprovals.length === 0,
      tooltip: 'Approve Selected Reports'
    },
    {
      label: 'Reject',
      icon: 'fas fa-times',
      onClick: handleBulkRejection,
      className: 'btn btn-error',
      disabled: selectedApprovals.length === 0,
      tooltip: 'Reject Selected Reports'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', link: '/' },
    { label: 'Approvals' }
  ];

  if (loading) {
    return <Loading message="Loading pending approvals..." />;
  }

  return (
    <div className="approval-queue">


      <PageHeader
        title="Approvals"
        subtitle="Review and approve expense reports"
        breadcrumbs={breadcrumbs}
        actions={pageActions}
      />

      {/* Controls */}
      <div className="queue-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search..."
            className="form-control search-input"
          />
        </div>
        
        <div className="sort-section">
          <label>Sort By:</label>
          <select
            className="form-control sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Oldest Requests">Oldest Requests</option>
            <option value="Newest Requests">Newest Requests</option>
            <option value="Highest Amount">Highest Amount</option>
            <option value="Lowest Amount">Lowest Amount</option>
            <option value="Employee Name">Employee Name</option>
          </select>
        </div>
      </div>

      {/* Approvals List */}
      <div className="approvals-container">
        {approvals.length > 0 ? (
          <>
            <div className="approvals-header">
              <div className="bulk-select">
                <input
                  type="checkbox"
                  checked={selectedApprovals.length === approvals.length && approvals.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all approvals"
                />
                <span>Select All</span>
              </div>
              <div className="selected-count">
                {selectedApprovals.length > 0 && (
                  <span>{selectedApprovals.length} selected</span>
                )}
              </div>
            </div>

            <div className="approvals-list">
              {approvals.map((approval) => (
                <div
                  key={approval.reportId}
                  className={`approval-item ${selectedApprovals.includes(approval.reportId) ? 'selected' : ''}`}
                >
                  <div className="approval-select">
                    <input
                      type="checkbox"
                      checked={selectedApprovals.includes(approval.reportId)}
                      onChange={() => handleApprovalSelection(approval.reportId)}
                      aria-label={`Select approval ${approval.reportId}`}
                    />
                  </div>

                  <div className="approval-content">
                    <div className="approval-header">
                      <div className="employee-info">
                        <div className="employee-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">{approval.employeeName || 'Unknown Employee'}</div>
                          <div className="report-id">{approval.reportId}</div>
                        </div>
                      </div>
                      
                      <div className="approval-meta">
                        <div className="amount">
                          <span className="value">{approval.totalAmount ? approval.totalAmount.toFixed(2) : '0.00'}</span>
                          <span className="currency">{approval.reimbursementCurrency || 'USD'}</span>
                        </div>
                        <div className="submitted-date">{formatDate(approval.submittedAt)}</div>
                      </div>
                    </div>

                    <div className="approval-details">
                      <div className="purpose">
                        {approval.purpose || 'No purpose specified'}
                      </div>
                      <div className="queue-info">
                        <span className="days-in-queue">{getDaysInQueue(approval.submittedAt)} days in queue</span>
                        <span className="item-count">{approval.expenseLines ? approval.expenseLines.length : 0} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="approval-actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprovalAction(approval, 'approve')}
                      title="Approve"
                    >
                      <i className="fas fa-check"></i>
                      Approve
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleApprovalAction(approval, 'reject')}
                      title="Reject"
                    >
                      <i className="fas fa-times"></i>
                      Reject
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleApprovalAction(approval, 'request-info')}
                      title="Request Information"
                    >
                      <i className="fas fa-question"></i>
                      Request Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <i className="fas fa-check-circle fa-3x"></i>
            <h3>No Pending Approvals</h3>
            <p>All expense reports have been reviewed.</p>

          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && currentApproval && (
        <div className="modal-overlay">
          <div className="modal approval-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {approvalAction === 'approve' ? 'Approve' : 
                 approvalAction === 'reject' ? 'Reject' : 'Request Information for'} Expense Report
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowApprovalModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="approval-summary">
                <div className="report-info">
                  <strong>Report:</strong> {currentApproval.reportId}
                </div>
                <div className="employee-info">
                  <strong>Employee:</strong> {currentApproval.employeeName || 'Unknown Employee'}
                </div>
                <div className="amount-info">
                  <strong>Amount:</strong> {currentApproval.totalAmount ? currentApproval.totalAmount.toFixed(2) : '0.00'} {currentApproval.reimbursementCurrency || 'USD'}
                </div>
                <div className="purpose-info">
                  <strong>Purpose:</strong> {currentApproval.purpose || 'Not specified'}
                </div>
                <div className="date-info">
                  <strong>Submitted:</strong> {formatDate(currentApproval.submittedAt)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Comments {approvalAction === 'reject' ? '(Required)' : '(Optional)'}:
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    approvalAction === 'approve' 
                      ? 'Add any comments about the approval...'
                      : approvalAction === 'reject'
                      ? 'Please provide a reason for rejection...'
                      : 'Please specify what additional information is needed...'
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                className={`btn ${
                  approvalAction === 'approve' ? 'btn-success' : 
                  approvalAction === 'reject' ? 'btn-error' : 'btn-warning'
                }`}
                onClick={handleSubmitApproval}
                disabled={approvalAction === 'reject' && !comments.trim()}
              >
                <i className={`fas fa-${
                  approvalAction === 'approve' ? 'check' : 
                  approvalAction === 'reject' ? 'times' : 'question'
                }`}></i>
                {approvalAction === 'approve' ? 'Approve' : 
                 approvalAction === 'reject' ? 'Reject' : 'Request Info'} Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;