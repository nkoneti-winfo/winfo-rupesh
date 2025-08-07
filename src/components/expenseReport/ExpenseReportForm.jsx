import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import PageHeader from '../common/PageHeader';
import Loading from '../common/Loading';
import ExpenseLineModal from '../expenseLine/ExpenseLineModal';
import DocumentUpload from '../documents/DocumentUpload';
import { useExpenseReport, useExpenseReports } from '../../hooks/useExpenseReports';
import { useExpenseTemplates } from '../../hooks/useExpenseTypes';
import { useReportExpenseLines } from '../../hooks/useExpenseLines';
import './ExpenseReportForm.css';

const ExpenseReportForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { createReport, updateReport, deleteReport, submitReport } = useExpenseReports();
  const { report, loading: reportLoading, setReport } = useExpenseReport(mode === 'edit' ? reportId : null);
  const { templates, loading: templatesLoading } = useExpenseTemplates();
  
  const [showExpenseLineModal, setShowExpenseLineModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportDocuments, setReportDocuments] = useState([]);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [isSaved, setIsSaved] = useState(mode === 'edit');
  const [savedReportId, setSavedReportId] = useState(reportId);

  // Use expense lines hook for proper API integration - after savedReportId is declared
  const {
    expenseLines,
    loading: linesLoading,
    error: linesError,
    addLine,
    updateExpenseLine,
    deleteExpenseLine,
    setExpenseLines,
    refresh: refreshLines
  } = useReportExpenseLines(savedReportId || reportId);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      reportTitle: '',
      purpose: '',
      dateFrom: '',
      dateTo: '',
      templateId: '',
      paymentMethod: 'Electronic'
    }
  });

  // Watch form values for calculations
  const paymentMethod = watch('paymentMethod');

  // Load form data when report is loaded (edit mode)
  useEffect(() => {
    if (mode === 'edit' && report) {
      console.log('📝 Loading form data for edit mode:', report);
      reset({
        reportTitle: report.reportTitle || '',
        purpose: report.purpose || '',
        dateFrom: report.dateFrom || '',
        dateTo: report.dateTo || '',
        templateId: report.templateId || '',
        paymentMethod: 'Electronic'
      });
    }
  }, [mode, report, reset]);

  // Calculate total amount from actual expense lines
  const calculateTotal = () => {
    if (!expenseLines || expenseLines.length === 0) return 0;
    return expenseLines.reduce((total, line) => total + (line.reimbursementAmount || 0), 0);
  };

  // Check if report can be submitted
  const canSubmitReport = () => {
    return isSaved && expenseLines && expenseLines.length > 0;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare data for backend based on DTO structure
      const requestData = {
        employeeId: 'EMP001', // Default employee ID - in real app would come from auth context
        reportTitle: data.reportTitle || data.purpose || 'Expense Report',
        purpose: data.purpose,
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        templateId: data.templateId || null
      };

      if (mode === 'create' && !isSaved) {
        const response = await createReport(requestData);
        alert('Expense report created successfully');
        setIsSaved(true);
        const newReportId = response.data.reportId;
        setSavedReportId(newReportId);
        // Update report state with the created report
        setReport(response.data);
        // Clear expense lines as this is a new report
        setExpenseLines([]);
      } else {
        const targetReportId = savedReportId || reportId;
        const updateData = {
          reportTitle: requestData.reportTitle,
          purpose: requestData.purpose,
          dateFrom: requestData.dateFrom,
          dateTo: requestData.dateTo,
          templateId: requestData.templateId
        };
        console.log('💾 Updating expense report:', targetReportId, updateData);
        await updateReport(targetReportId, updateData);
        console.log('✅ Expense report updated successfully');
        alert('Expense report updated successfully!');
        setIsSaved(true);
        
        // Optionally navigate back to list after successful update
        if (window.confirm('Report updated successfully! Would you like to go back to the reports list?')) {
          navigate('/expense-reports');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save expense report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save and submit actions
  const handleSave = () => {
    handleSubmit(onSubmit)();
  };

  const handleSubmitForApproval = async () => {
    try {
      // First save the form
      await handleSubmit(onSubmit)();
      
      // Check if report has expense lines
      if (!expenseLines || expenseLines.length === 0) {
        alert('Please add at least one expense line before submitting for approval.');
        return;
      }
      
      // Then submit for approval using the backend API
      const targetReportId = savedReportId || reportId;
      if (targetReportId) {
        await submitReport(targetReportId);
        alert('Report submitted for approval successfully');
        // Navigate back to reports list after successful submission
        navigate('/expense-reports');
      } else {
        alert('Please save the report first before submitting for approval');
      }
    } catch (error) {
      console.error('Error submitting for approval:', error);
      
      // Provide more specific error messages
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes('expense lines')) {
          alert('Please add at least one expense line before submitting for approval.');
        } else if (errorMessage.includes('DRAFT status')) {
          alert('Report must be in draft status to submit for approval.');
        } else {
          alert(`Failed to submit report for approval: ${errorMessage}`);
        }
      } else {
        alert('Failed to submit report for approval. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/expense-reports');
    }
  };

  // Handle edit action - redirect to edit page
  const handleEditReport = () => {
    const targetReportId = savedReportId || reportId;
    navigate(`/expense-reports/${targetReportId}/edit`);
  };

  // Handle delete action - delete and redirect to list
  const handleDeleteReport = async () => {
    if (window.confirm('Are you sure you want to delete this expense report? This action cannot be undone.')) {
      try {
        const targetReportId = savedReportId || reportId;
        console.log('🗑️ Deleting expense report:', targetReportId);
        await deleteReport(targetReportId);
        console.log('✅ Expense report deleted successfully');
        alert('Expense report deleted successfully');
        navigate('/expense-reports');
      } catch (error) {
        console.error('❌ Error deleting report:', error);
        let errorMessage = 'Failed to delete expense report. Please try again.';
        
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  // Handle expense line operations with proper API integration
  const handleAddExpenseLine = () => {
    // Check if report is saved
    const currentReportId = savedReportId || reportId;
    if (!currentReportId || currentReportId === 'new') {
      alert('Please save the expense report first before adding expense items.');
      return;
    }
    setSelectedLine(null);
    setShowExpenseLineModal(true);
  };

  const handleEditExpenseLine = (line) => {
    setSelectedLine(line);
    setShowExpenseLineModal(true);
  };

  const handleDeleteExpenseLine = async (lineId) => {
    if (window.confirm('Are you sure you want to delete this expense line?')) {
      try {
        console.log('🗑️ Deleting expense line:', lineId);
        await deleteExpenseLine(lineId);
        console.log('✅ Expense line deleted successfully');
        alert('Expense line deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting expense line:', error);
        let errorMessage = 'Failed to delete expense line. Please try again.';
        
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleExpenseLineSave = async (lineData) => {
    try {
      setIsSubmitting(true);
      
      if (selectedLine) {
        // Update existing line
        await updateExpenseLine(selectedLine.lineId, lineData);
        alert('Expense line updated successfully');
      } else {
        // Add new line
        const currentReportId = savedReportId || reportId;
        if (!currentReportId || currentReportId === 'new') {
          alert('Please save the expense report first before adding expense items.');
          return;
        }
        await addLine(lineData);
        alert('Expense line added successfully');
      }
      
      setShowExpenseLineModal(false);
      setSelectedLine(null);
    } catch (error) {
      console.error('Error saving expense line:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to save expense line. Please try again.';
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };



  const breadcrumbs = [
    { label: 'Dashboard', link: '/' },
    { label: 'Expense Reports', link: '/expense-reports' },
    { label: mode === 'create' ? 'Create Report' : 'Edit Report' }
  ];

  if (reportLoading || templatesLoading) {
    return <Loading message="Loading expense report..." />;
  }

  // Show error if there's an issue with expense lines
  if (linesError) {
    console.warn('Expense lines error:', linesError);
  }

  return (
    <div className="expense-report-form">
      <PageHeader
        title={mode === 'create' ? 'Create Expense Report' : `Edit Expense Report: ${reportId}`}
        breadcrumbs={breadcrumbs}
      />

      <div className="expense-report-container">
        {/* Header Actions Bar */}
        <div className="report-actions-bar">
          <div className="actions-left">
            <h2 className="report-title">
              <i className={`fas ${mode === 'edit' ? 'fa-edit' : 'fa-file-invoice-dollar'}`}></i>
              {mode === 'create' 
                ? (isSaved ? `Expense Report: ${savedReportId}` : 'Create Expense Report')
                : `Edit Expense Report: ${reportId}`
              }
              {mode === 'edit' && (
                <span className="edit-mode-indicator">
                  <i className="fas fa-pencil-alt"></i> Edit Mode
                </span>
              )}
            </h2>
          </div>
          <div className="actions-right">
            {mode === 'edit' ? (
              // Show save/submit/cancel buttons for edit mode
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> 
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitForApproval}
                  disabled={isSubmitting || !canSubmitReport()}
                  title={!canSubmitReport() ? "Please add at least one expense line before submitting" : ""}
                >
                  <i className="fas fa-paper-plane"></i> Submit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleDeleteReport}
                  title="Delete Report"
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </>
            ) : !isSaved ? (
              // Show save/submit/cancel buttons when not saved (create mode)
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-save"></i> Save
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitForApproval}
                  disabled={isSubmitting || !canSubmitReport()}
                  title={!canSubmitReport() ? "Please save the report and add at least one expense line before submitting" : ""}
                >
                  <i className="fas fa-paper-plane"></i> Submit
                </button>
              </>
            ) : (
              // Show save/submit/cancel buttons when saved (create mode) - user can still edit
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> 
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitForApproval}
                  disabled={isSubmitting || !canSubmitReport()}
                  title={!canSubmitReport() ? "Please add at least one expense line before submitting" : ""}
                >
                  <i className="fas fa-paper-plane"></i> Submit
                </button>
              </>
            )}
          </div>
        </div>

        <div className="report-form-layout">
          {/* Main Form Content */}
          <div className="form-main-content">
            <form onSubmit={handleSubmit(onSubmit)} className="expense-form">
              {/* Report Details Card */}
              <div className="form-card">
                <div className="card-header">
                  <h3><i className="fas fa-info-circle"></i> Report Details</h3>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label required">Purpose</label>
                      <input
                        type="text"
                        className={`form-control ${errors.purpose ? 'error' : ''}`}
                        placeholder="Enter purpose (e.g., TRAVEL)"
                        {...register('purpose', { required: 'Purpose is required' })}
                      />
                      {errors.purpose && (
                        <div className="form-error">{errors.purpose.message}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Report Description</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Optional description"
                        {...register('reportTitle')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">From Date</label>
                      <input
                        type="date"
                        className="form-control"
                        {...register('dateFrom')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">To Date</label>
                      <input
                        type="date"
                        className="form-control"
                        {...register('dateTo')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments Card */}
              <div className="form-card">
                <div className="card-header">
                  <h3><i className="fas fa-paperclip"></i> Attachments</h3>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowDocumentUpload(true)}
                  >
                    <i className="fas fa-plus"></i> Add Files
                  </button>
                </div>
                <div className="card-body">
                  {reportDocuments.length > 0 ? (
                    <div className="attachments-grid">
                      {reportDocuments.map((doc) => (
                        <div key={doc.documentId} className="attachment-card">
                          <div className="attachment-icon">
                            <i className="fas fa-file-pdf"></i>
                          </div>
                          <div className="attachment-info">
                            <div className="attachment-name">{doc.documentName}</div>
                            <div className="attachment-size">{(doc.documentSize / 1024).toFixed(1)} KB</div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-link btn-sm remove-attachment"
                            onClick={() => setReportDocuments(prev => 
                              prev.filter(d => d.documentId !== doc.documentId)
                            )}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-attachments">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>No attachments added yet</p>
                      <small>Click "Add Files" to upload receipts and supporting documents</small>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="form-sidebar">
            <div className="summary-card">
              <div className="card-header">
                <h3><i className="fas fa-calculator"></i> Report Summary</h3>
              </div>
              <div className="card-body">
                <div className="summary-item">
                  <label>Payment Method</label>
                  <select
                    className="form-control"
                    {...register('paymentMethod')}
                  >
                    <option value="Electronic">Electronic</option>
                    <option value="Check">Check</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-item">
                  <span className="summary-label">Employee Pays You</span>
                  <span className="summary-value">0.00 USD</span>
                </div>

                <div className="summary-divider"></div>

                <div className="total-summary">
                  <div className="total-label">Total Amount</div>
                  <div className="total-value">
                    <span className="amount">{calculateTotal().toFixed(2)}</span>
                    <span className="currency">USD</span>
                  </div>
                </div>

                <div className="summary-actions">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-block"
                    onClick={handleAddExpenseLine}
                  >
                    <i className="fas fa-plus"></i> Add Expense Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Items Section */}
        <div className="expense-items-card">
          <div className="card-header">
            <h3><i className="fas fa-list"></i> Expense Items ({expenseLines?.length || 0})</h3>
            <div className="header-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddExpenseLine}
              >
                <i className="fas fa-plus"></i> Add Item
              </button>
              <button type="button" className="btn btn-secondary btn-sm">
                <i className="fas fa-folder-open"></i> Add Existing
              </button>
            </div>
          </div>
          
          {/* Submission Status Indicator */}
          {isSaved && (
            <div className="submission-status">
              {expenseLines && expenseLines.length > 0 ? (
                <div className="status-ready">
                  <i className="fas fa-check-circle"></i>
                  <span>Ready for submission</span>
                </div>
              ) : (
                <div className="status-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Add at least one expense item to submit</span>
                </div>
              )}
            </div>
          )}

          <div className="card-body">
            {linesLoading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading expense items...</span>
              </div>
            ) : expenseLines && expenseLines.length > 0 ? (
              <div className="expense-items-grid">
                {expenseLines.map((line) => (
                  <div key={line.lineId} className="expense-item-card">
                    <div className="item-header">
                      <div className="item-type">
                        <i className="fas fa-receipt"></i>
                        {line.expenseType?.name || 'Expense'}
                      </div>
                      <div className="item-amount">
                        <span className="amount">{line.reimbursementAmount?.toFixed(2)}</span>
                        <span className="currency">{line.reimbursementCurrency}</span>
                      </div>
                    </div>
                    
                    <div className="item-details">
                      <div className="item-date">
                        <i className="fas fa-calendar"></i>
                        {line.expenseDate}
                      </div>
                      {line.merchantVendor && (
                        <div className="item-merchant">
                          <i className="fas fa-store"></i>
                          {line.merchantVendor}
                        </div>
                      )}
                      {line.description && (
                        <div className="item-description">
                          {line.description}
                        </div>
                      )}
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        className="btn btn-link btn-sm"
                        onClick={() => handleEditExpenseLine(line)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-error"
                        onClick={() => handleDeleteExpenseLine(line.lineId)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-expense-items">
                <div className="empty-state">
                  <i className="fas fa-receipt fa-3x"></i>
                  <h4>No Expense Items</h4>
                  <p>Start by adding your first expense item to this report.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddExpenseLine}
                  >
                    <i className="fas fa-plus"></i> Add First Expense Item
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expense Line Modal */}
      {showExpenseLineModal && (
        <ExpenseLineModal
          reportId={savedReportId || reportId || 'new'}
          lineData={selectedLine}
          onClose={() => {
            setShowExpenseLineModal(false);
            setSelectedLine(null);
          }}
          onSave={handleExpenseLineSave}
        />
      )}

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Upload Documents</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowDocumentUpload(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <DocumentUpload
                reportId={reportId || 'new'}
                documents={reportDocuments}
                onDocumentsChange={setReportDocuments}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowDocumentUpload(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseReportForm;