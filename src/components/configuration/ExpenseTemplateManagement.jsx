import React, { useState } from 'react';
import PageHeader from '../common/PageHeader';
import Loading from '../common/Loading';
import { useExpenseTemplates, useExpenseTypes } from '../../hooks/useExpenseTypes';
import './ExpenseTemplateManagement.css';

const ExpenseTemplateManagement = () => {
  const { templates, loading: templatesLoading, createTemplate, updateTemplate, deleteTemplate } = useExpenseTemplates();
  const { expenseTypes, loading: typesLoading } = useExpenseTypes();
  

  const [activeTab, setActiveTab] = useState('templates');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateName: '',
    description: '',
    expenseType: '',
    category: '',
    isActive: true,
    isDefault: false,
    approvalWorkflow: 'Standard (Manager Approval)',
    fromDate: '',
    toDate: '',
    attachments: ''
  });

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle create new template
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      templateName: '',
      description: '',
      expenseType: '',
      category: '',
      isActive: true,
      isDefault: false,
      approvalWorkflow: 'Standard (Manager Approval)',
      fromDate: '',
      toDate: '',
      attachments: ''
    });
    setShowModal(true);
  };

  // Handle edit template
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.templateName,
      description: template.description,
      expenseType: '',
      category: '',
      isActive: template.isActive,
      isDefault: template.isDefault,
      approvalWorkflow: 'Standard (Manager Approval)',
      fromDate: '',
      toDate: '',
      attachments: ''
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const templateData = {
        templateName: formData.templateName,
        description: formData.description,
        isActive: formData.isActive,
        isDefault: formData.isDefault
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate.templateId, templateData);
        alert('Template updated successfully');
      } else {
        await createTemplate(templateData);
        alert('Template created successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving template:', error);
      const errorMessage = error?.message || 'Failed to save template. Please try again.';
      alert(errorMessage);
    }
  };

  // Handle delete template
  const handleDeleteTemplate = async (templateId, templateName) => {
    if (window.confirm(`Are you sure you want to delete "${templateName}"? This action cannot be undone.`)) {
      try {
        await deleteTemplate(templateId);
        alert('Template deleted successfully');
      } catch (error) {
        console.error('Error deleting template:', error);
        const errorMessage = error?.message || 'Failed to delete template. Please try again.';
        alert(errorMessage);
      }
    }
  };

  const pageActions = [
    {
      label: 'Create New Template',
      icon: 'fas fa-plus',
      onClick: handleCreateTemplate,
      className: 'btn btn-success',
      tooltip: 'Create New Expense Template'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', link: '/' },
    { label: 'Configuration' },
    { label: 'Expense Templates' }
  ];

  if (templatesLoading || typesLoading) {
    return <Loading message="Loading expense templates..." />;
  }

  // Safety check for templates
  if (!Array.isArray(templates)) {
    console.error('Templates is not an array:', templates);
    return (
      <div className="expense-template-management">
        <PageHeader
          title="Expense Report Template"
          subtitle="Manage expense report templates and configurations"
          breadcrumbs={breadcrumbs}
          actions={pageActions}
        />
        <div className="alert alert-danger">
          Error loading templates. Please refresh the page.
        </div>
      </div>
    );
  }

  // Safety check for expenseTypes
  if (!Array.isArray(expenseTypes)) {
    console.error('ExpenseTypes is not an array:', expenseTypes);
    return (
      <div className="expense-template-management">
        <PageHeader
          title="Expense Report Template"
          subtitle="Manage expense report templates and configurations"
          breadcrumbs={breadcrumbs}
          actions={pageActions}
        />
        <div className="alert alert-danger">
          Error loading expense types. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="expense-template-management">
      <PageHeader
        title="Expense Report Template"
        subtitle="Manage expense report templates and configurations"
        breadcrumbs={breadcrumbs}
        actions={pageActions}
      />

      {/* Navigation Tabs */}
      {/* <div className="template-tabs">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'types' ? 'active' : ''}`}
            onClick={() => handleTabChange('types')}
          >
            Expense Types
          </button>
          <button
            className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => handleTabChange('templates')}
          >
            Templates
          </button>
          <button
            className={`tab-button ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => handleTabChange('policies')}
          >
            Policies
          </button>
        </div>
      </div> */}

      {/* Templates Tab Content */}
      {/* {activeTab === 'templates' && ( */}
        <div className="templates-content">
          <div className="section-header">
            <h3>Expense Templates</h3>
            <button
              className="btn btn-primary"
              onClick={handleCreateTemplate}
            >
              Create New Template
            </button>
          </div>

          <div className="templates-table-container">
            {templatesLoading ? (
              <div className="text-center py-4">
                <Loading message="Loading templates..." />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Template Name</th>
                      <th>Expense Types</th>
                      <th>Active</th>
                      <th>Default</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr key={template.templateId}>
                        <td>
                          <div className="template-info">
                            <div className="template-name">{template.templateName}</div>
                            <div className="template-description">{template.description}</div>
                          </div>
                        </td>
                        <td>
                          <div className="expense-types-cell">
                            <span className="text-muted">Not configured</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-indicator ${template.isActive ? 'active' : 'inactive'}`}>
                            <i className={`fas fa-circle ${template.isActive ? 'text-success' : 'text-muted'}`}></i>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <span className={`default-indicator ${template.isDefault ? 'default' : 'not-default'}`}>
                            <i className={`fas fa-${template.isDefault ? 'star' : 'star-o'}`}></i>
                            {template.isDefault ? 'Default' : ''}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-link btn-sm"
                              onClick={() => handleEditTemplate(template)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-link btn-sm text-error"
                              onClick={() => handleDeleteTemplate(template.templateId, template.templateName)}
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
            )}
          </div>
        </div>
      {/* )} */}

      {/* Expense Types Tab Content */}
      {activeTab === 'types' && (
        <div className="types-content">
          <div className="section-header">
            <h3>Expense Types</h3>
            <button className="btn btn-primary">
              Add New Type
            </button>
          </div>

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
                        </span>
                      </td>
                      <td>
                        <span className={`receipt-indicator ${type.receiptRequired ? 'required' : 'optional'}`}>
                          <i className={`fas fa-${type.receiptRequired ? 'check' : 'times'}`}></i>
                        </span>
                      </td>
                      <td>
                        {type.dailyLimit ? `$${type.dailyLimit.toFixed(2)}/day` : '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-link btn-sm" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-link btn-sm text-error" title="Delete">
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
        </div>
      )}

      {/* Policies Tab Content */}
      {/* {activeTab === 'policies' && (
        <div className="policies-content">
          <div className="section-header">
            <h3>Expense Policies</h3>
            <button className="btn btn-primary">
              Create New Policy
            </button>
          </div>

          <div className="policies-placeholder">
            <i className="fas fa-clipboard-list fa-3x"></i>
            <h4>Policy Management</h4>
            <p>Configure expense policies and approval workflows</p>
            <button className="btn btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      )} */}

      {/* Create/Edit Template Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal template-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingTemplate ? 'Edit Expense Template' : 'Create New Expense Template'}
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
              <form onSubmit={handleSubmit} className="template-form">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label required">Name</label>
                      <input
                        type="text"
                        name="templateName"
                        value={formData.templateName}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="e.g., Business Travel Template"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expense Type</label>
                      <input
                        type="text"
                        name="expenseType"
                        value={formData.expenseType}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="e.g., Travel, Meals"
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
                        <option value="">e.g., Transportation</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Food">Food</option>
                        <option value="Travel">Travel</option>
                        <option value="Entertainment">Entertainment</option>
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
                        id="isDefault"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isDefault">Default Template</label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Approval Workflow</label>
                      <div className="radio-group">
                        <div className="radio-option">
                          <input
                            type="radio"
                            id="standard"
                            name="approvalWorkflow"
                            value="Standard (Manager Approval)"
                            checked={formData.approvalWorkflow === 'Standard (Manager Approval)'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="standard">Standard (Manager Approval)</label>
                        </div>
                        <div className="radio-option">
                          <input
                            type="radio"
                            id="strict"
                            name="approvalWorkflow"
                            value="Strict (Finance Review)"
                            checked={formData.approvalWorkflow === 'Strict (Finance Review)'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="strict">Strict (Finance Review)</label>
                        </div>
                        <div className="radio-option">
                          <input
                            type="radio"
                            id="flexible"
                            name="approvalWorkflow"
                            value="Flexible (Self-Approval below limit)"
                            checked={formData.approvalWorkflow === 'Flexible (Self-Approval below limit)'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="flexible">Flexible (Self-Approval below limit)</label>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">From Date</label>
                      <input
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">To Date</label>
                      <input
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Attachments</label>
                      <input
                        type="text"
                        name="attachments"
                        value={formData.attachments}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="e.g., 10000"
                      />
                    </div>
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

export default ExpenseTemplateManagement;