import React, { useState } from 'react';
import PageHeader from '../common/PageHeader';
import Loading from '../common/Loading';
import { useExpenseTypes } from '../../hooks/useExpenseTypes';
import './ExpenseTypeManagement.css';

const ExpenseTypeManagement = () => {
  const { expenseTypes, loading, createExpenseType, updateExpenseType, deleteExpenseType } = useExpenseTypes();
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    typeName: '',
    description: '',
    category: '',
    isActive: true,
    receiptRequired: false,
    approvalRequired: true,
    dailyLimit: '',
    monthlyLimit: '',
    annualLimit: '',
    glAccountCode: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle create new expense type
  const handleCreateType = () => {
    setEditingType(null);
    setFormData({
      typeName: '',
      description: '',
      category: '',
      isActive: true,
      receiptRequired: false,
      approvalRequired: true,
      dailyLimit: '',
      monthlyLimit: '',
      annualLimit: '',
      glAccountCode: ''
    });
    setShowModal(true);
  };

  // Handle edit expense type
  const handleEditType = (type) => {
    setEditingType(type);
    setFormData({
      typeName: type.typeName,
      description: type.description,
      category: type.category,
      isActive: type.isActive,
      receiptRequired: type.receiptRequired,
      approvalRequired: type.approvalRequired,
      dailyLimit: type.dailyLimit || '',
      monthlyLimit: type.monthlyLimit || '',
      annualLimit: type.annualLimit || '',
      glAccountCode: type.glAccountCode || ''
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingType) {
        await updateExpenseType(editingType.expenseTypeId, formData);
        alert('Expense type updated successfully');
      } else {
        await createExpenseType(formData);
        alert('Expense type created successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving expense type:', error);
      alert('Failed to save expense type. Please try again.');
    }
  };

  // Handle delete expense type
  const handleDeleteType = async (typeId, typeName) => {
    if (window.confirm(`Are you sure you want to delete "${typeName}"? This action cannot be undone.`)) {
      try {
        await deleteExpenseType(typeId);
        alert('Expense type deleted successfully');
      } catch (error) {
        console.error('Error deleting expense type:', error);
        alert('Failed to delete expense type. Please try again.');
      }
    }
  };

  const pageActions = [
    {
      label: 'Add New Type',
      icon: 'fas fa-plus',
      onClick: handleCreateType,
      className: 'btn btn-success',
      tooltip: 'Add New Expense Type'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', link: '/' },
    { label: 'Configuration' },
    { label: 'Expense Types' }
  ];

  if (loading) {
    return <Loading message="Loading expense types..." />;
  }

  return (
    <div className="expense-type-management">
      <PageHeader
        title="Expense Types"
        subtitle="Manage expense type configurations and settings"
        breadcrumbs={breadcrumbs}
        actions={pageActions}
      />

      {/* Expense Types Table */}
      <div className="types-table-container">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Active</th>
                <th>Receipt Req.</th>
                <th>Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenseTypes.map((type) => (
                <tr key={type.expenseTypeId}>
                  <td>
                    <div className="type-info">
                      <div className="type-name">{type.typeName}</div>
                      <div className="type-category">{type.category}</div>
                    </div>
                  </td>
                  <td>
                    <div className="description-cell" title={type.description}>
                      {type.description}
                    </div>
                  </td>
                  <td>
                    <span className={`status-indicator ${type.isActive ? 'active' : 'inactive'}`}>
                      <i className={`fas fa-circle ${type.isActive ? 'text-success' : 'text-muted'}`}></i>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`receipt-indicator ${type.receiptRequired ? 'required' : 'optional'}`}>
                      <i className={`fas fa-${type.receiptRequired ? 'check' : 'times'}`}></i>
                      {type.receiptRequired ? 'Required' : 'Optional'}
                    </span>
                  </td>
                  <td>
                    {type.dailyLimit ? `$${type.dailyLimit.toFixed(2)}/day` : 'No limit'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-link btn-sm"
                        onClick={() => handleEditType(type)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-link btn-sm text-error"
                        onClick={() => handleDeleteType(type.expenseTypeId, type.typeName)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal expense-type-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingType ? 'Edit Expense Type' : 'Add New Expense Type'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit} className="expense-type-form">
                <div className="form-section">
                  <h4>Configure Type</h4>
                  
                  <div className="form-group">
                    <label className="form-label required">Name</label>
                    <input
                      type="text"
                      name="typeName"
                      value={formData.typeName}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., Travel, Meals"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                      placeholder="Brief description of the expense type"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="">Select category</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Food">Food</option>
                      <option value="Office">Office</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Travel">Travel</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isActive">Active</label>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="receiptRequired"
                      name="receiptRequired"
                      checked={formData.receiptRequired}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="receiptRequired">Receipt Required</label>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="approvalRequired"
                      name="approvalRequired"
                      checked={formData.approvalRequired}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="approvalRequired">Approval Required</label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Daily Limit ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="dailyLimit"
                      value={formData.dailyLimit}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="0.00"
                    />
                    <div className="form-help">Leave empty for no limit</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Limit ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="monthlyLimit"
                      value={formData.monthlyLimit}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="0.00"
                    />
                    <div className="form-help">Leave empty for no limit</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Annual Limit ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="annualLimit"
                      value={formData.annualLimit}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="0.00"
                    />
                    <div className="form-help">Leave empty for no limit</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">GL Account Code</label>
                    <input
                      type="text"
                      name="glAccountCode"
                      value={formData.glAccountCode}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., 5001"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                <i className="fas fa-save"></i>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTypeManagement;