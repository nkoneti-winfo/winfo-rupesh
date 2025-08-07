import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import StatusBadge from '../common/StatusBadge';
import Loading from '../common/Loading';
import { useExpenseReport } from '../../hooks/useExpenseReports';
import './ExpenseReportDetail.css';

const ExpenseReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { report, loading, error } = useExpenseReport(reportId);

  const handleEdit = () => {
    console.log('✏️ Navigating to edit report:', reportId);
    navigate(`/expense-reports/${reportId}/edit`);
  };

  const handleBack = () => {
    navigate('/expense-reports');
  };

  const pageActions = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      onClick: handleEdit,
      className: 'btn btn-primary',
      tooltip: 'Edit Report'
    },
    {
      label: 'Back to List',
      icon: 'fas fa-arrow-left',
      onClick: handleBack,
      className: 'btn btn-secondary',
      tooltip: 'Back to Reports List'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', link: '/' },
    { label: 'Expense Reports', link: '/expense-reports' },
    { label: `Report ${reportId}` }
  ];

  if (loading) {
    return <Loading message="Loading expense report..." />;
  }

  if (error || !report) {
    return (
      <div className="error-state">
        <h3>Report Not Found</h3>
        <p>The expense report you're looking for could not be found.</p>
        <button className="btn btn-primary" onClick={handleBack}>
          Back to Reports
        </button>
      </div>
    );
  }

  // Calculate total amount from expense lines if not available
  const totalAmount = report.totalAmount || 
    (report.expenseLines ? report.expenseLines.reduce((sum, line) => 
      sum + (line.reimbursementAmount || 0), 0) : 0);

  return (
    <div className="expense-report-detail">
      <PageHeader
        title={`Expense Report: ${reportId}`}
        subtitle={report.reportTitle || 'Expense Report Details'}
        breadcrumbs={breadcrumbs}
        actions={pageActions}
      />

      <div className="report-content">
        {/* Report Summary */}
        <div className="report-summary">
          <div className="row">
            <div className="col-md-8">
              <div className="info-card">
              <h3>Report Information</h3>
              <div className="info-grid">
                  <div className="info-item">
                    <label>Report ID:</label>
                    <span>{report.reportId}</span>
                  </div>
                  <div className="info-item">
                    <label>Employee:</label>
                    <span>{report.employeeName || report.employeeId}</span>
                  </div>
                <div className="info-item">
                  <label>Purpose:</label>
                  <span>{report.purpose || 'No purpose specified'}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <StatusBadge status={report.status} />
                </div>
                <div className="info-item">
                  <label>Date Range:</label>
                  <span>{report.dateFrom} to {report.dateTo}</span>
                </div>
                <div className="info-item">
                    <label>Created:</label>
                    <span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {report.submittedAt && (
                    <div className="info-item">
                      <label>Submitted:</label>
                      <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {report.approvedAt && (
                    <div className="info-item">
                      <label>Approved:</label>
                      <span>{new Date(report.approvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {report.approverName && (
                    <div className="info-item">
                      <label>Approved By:</label>
                      <span>{report.approverName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="amount-summary-card">
                <h3>Total Amount</h3>
                <div className="total-display">
                  <span className="amount">{totalAmount.toFixed(2)}</span>
                  <span className="currency">{report.reimbursementCurrency || 'USD'}</span>
                </div>
                <div className="amount-breakdown">
                  <div className="breakdown-item">
                    <span className="label">Expense Items:</span>
                    <span className="value">{report.expenseLines?.length || 0}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="label">Documents:</span>
                    <span className="value">{report.documents?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Lines */}
        <div className="expense-lines-section">
          <div className="section-header">
          <h3>Expense Items ({report.expenseLines?.length || 0})</h3>
            <button className="btn btn-primary btn-sm">
              <i className="fas fa-plus"></i> Add Item
            </button>
          </div>
          
          {report.expenseLines && report.expenseLines.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Merchant</th>
                    <th>Description</th>
                    <th>Attachments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expenseLines.map((line) => (
                    <tr key={line.lineId}>
                      <td>{line.expenseDate}</td>
                      <td>
                        <span className="expense-type">
                          {line.expenseType?.name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="amount">
                          {line.reimbursementAmount?.toFixed(2) || '0.00'} {line.reimbursementCurrency || 'USD'}
                        </span>
                      </td>
                      <td>{line.merchantVendor || '-'}</td>
                      <td className="description-cell">
                        <span title={line.description}>
                          {line.description || '-'}
                        </span>
                      </td>
                      <td>
                        {line.documents && line.documents.length > 0 ? (
                          <span className="attachment-count">
                            {line.documents.length} file(s)
                          </span>
                        ) : (
                        <button className="btn btn-link btn-sm">
                            <i className="fas fa-paperclip"></i> Add
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-outline-primary" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Delete">
                            <i className="fas fa-trash"></i>
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <div className="no-data-content">
                <i className="fas fa-receipt fa-3x"></i>
                <h4>No Expense Items</h4>
                <p>This report doesn't have any expense items yet.</p>
                <button className="btn btn-primary">
                  <i className="fas fa-plus"></i> Add First Item
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        {report.documents && report.documents.length > 0 && (
          <div className="documents-section">
            <div className="section-header">
            <h3>Documents ({report.documents.length})</h3>
              <button className="btn btn-primary btn-sm">
                <i className="fas fa-upload"></i> Upload Document
              </button>
            </div>
            <div className="documents-list">
              {report.documents.map((doc) => (
                <div key={doc.documentId} className="document-item">
                  <div className="document-icon">
                    <i className="fas fa-file"></i>
                  </div>
                  <div className="document-info">
                    <div className="document-name">{doc.documentName}</div>
                    <div className="document-meta">
                      {doc.documentType} • {(doc.documentSize / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <div className="document-actions">
                    <button className="btn btn-link btn-sm">
                      <i className="fas fa-download"></i> Download
                    </button>
                    <button className="btn btn-link btn-sm text-danger">
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseReportDetail;