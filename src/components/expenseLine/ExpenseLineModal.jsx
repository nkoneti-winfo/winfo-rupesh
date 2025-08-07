import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useExpenseTypes, useCurrencies } from '../../hooks/useExpenseTypes';
import DocumentUpload from '../documents/DocumentUpload';
import './ExpenseLineModal.css';

const ExpenseLineModal = ({ 
  reportId, 
  lineData = null, 
  onClose, 
  onSave 
}) => {
  const { expenseTypes, loading: typesLoading } = useExpenseTypes();
  const { currencies, loading: currenciesLoading, getExchangeRate } = useCurrencies();
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1.0000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [reimbursableAmount, setReimbursableAmount] = useState(0);
  const [documents, setDocuments] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      expenseDate: new Date().toISOString().split('T')[0],
      template: 'Expenses US1',
      expenseTypeId: '',
      expenseLocation: 'United States',
      originalAmount: '',
      originalCurrency: 'USD',
      numberOfDays: 1,
      dailyAmount: '',
      description: '',
      merchantName: '',
      projectNumber: '45623608',
      taxNumber: '1.0',
      expenditureOrganization: '',
      contractNumber: '',
      fundingSource: ''
    }
  });

  // Watch form values for calculations
  const originalAmount = watch('originalAmount');
  const originalCurrency = watch('originalCurrency');
  const expenseTypeId = watch('expenseTypeId');
  const numberOfDays = watch('numberOfDays');

  // Load line data for editing
  useEffect(() => {
    if (lineData) {
      reset({
        expenseDate: lineData.expenseDate || new Date().toISOString().split('T')[0],
        template: 'Expenses US1',
        expenseTypeId: lineData.expenseType?.id || '',
        expenseLocation: 'United States',
        originalAmount: lineData.originalAmount || '',
        originalCurrency: lineData.originalCurrency || 'USD',
        numberOfDays: 1,
        dailyAmount: lineData.originalAmount || '',
        description: lineData.description || '',
        merchantName: lineData.merchantVendor || '',
        projectNumber: lineData.projectCode || '45623608',
        taxNumber: '1.0',
        expenditureOrganization: '',
        contractNumber: '',
        fundingSource: ''
      });
      setReimbursableAmount(lineData.reimbursementAmount || 0);
    }
  }, [lineData, reset]);

  // Update selected expense type when type changes
  useEffect(() => {
    if (expenseTypeId && expenseTypes.length > 0) {
      const type = expenseTypes.find(t => t.expenseTypeId === parseInt(expenseTypeId));
      setSelectedExpenseType(type);
    }
  }, [expenseTypeId, expenseTypes]);

  // Calculate reimbursable amount when amount or currency changes
  useEffect(() => {
    const calculateReimbursableAmount = async () => {
      if (originalAmount && originalCurrency && !isNaN(parseFloat(originalAmount))) {
        setIsCalculating(true);
        try {
          const amount = parseFloat(originalAmount);
          if (originalCurrency === 'USD') {
            setExchangeRate(1.0000);
            setReimbursableAmount(amount);
          } else {
            const rateResponse = await getExchangeRate(originalCurrency, 'USD');
            const rate = rateResponse.data.exchangeRate;
            setExchangeRate(rate);
            setReimbursableAmount(amount * rate);
          }
        } catch (error) {
          console.error('Failed to get exchange rate:', error);
          setExchangeRate(1.0000);
          setReimbursableAmount(parseFloat(originalAmount) || 0);
        } finally {
          setIsCalculating(false);
        }
      } else {
        setReimbursableAmount(0);
        setExchangeRate(1.0000);
      }
    };

    // Debounce the calculation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      calculateReimbursableAmount();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [originalAmount, originalCurrency, getExchangeRate]);

  // Update daily amount when original amount or days change
  useEffect(() => {
    if (originalAmount && numberOfDays && numberOfDays > 0) {
      const dailyAmt = parseFloat(originalAmount) / parseInt(numberOfDays);
      setValue('dailyAmount', dailyAmt.toFixed(2));
    }
  }, [originalAmount, numberOfDays, setValue]);

  // Handle form submission
  const onSubmit = (data) => {
    // Validate required fields
    if (!data.expenseDate) {
      alert('Expense date is required');
      return;
    }
    if (!data.expenseTypeId) {
      alert('Expense type is required');
      return;
    }
    if (!data.description || data.description.trim() === '') {
      alert('Description is required');
      return;
    }
    if (!data.originalAmount || parseFloat(data.originalAmount) <= 0) {
      alert('Amount must be greater than zero');
      return;
    }
    if (!data.originalCurrency) {
      alert('Currency is required');
      return;
    }

    const lineData = {
      expenseDate: data.expenseDate,
      expenseTypeId: parseInt(data.expenseTypeId),
      expenseType: selectedExpenseType ? {
        id: selectedExpenseType.expenseTypeId,
        name: selectedExpenseType.typeName
      } : null,
      description: data.description.trim(),
      originalAmount: parseFloat(data.originalAmount),
      originalCurrency: data.originalCurrency.trim().toUpperCase(),
      exchangeRate: exchangeRate,
      reimbursementAmount: reimbursableAmount,
      reimbursementCurrency: 'USD',
      merchantVendor: data.merchantName ? data.merchantName.trim() : '',
      businessPurpose: data.description ? data.description.trim() : '',
      projectCode: data.projectNumber ? data.projectNumber.trim() : '',
      numberOfDays: data.numberOfDays ? parseInt(data.numberOfDays) : 1,
      documents: documents || []
    };

    onSave(lineData);
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      onClose();
    }
  };

  // Handle document changes
  const handleDocumentsChange = (newDocuments) => {
    setDocuments(newDocuments);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal expense-line-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {lineData ? 'Edit Expense Item' : 'Create Expense Item'}
          </h3>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)} className="expense-line-form">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label required">Date</label>
                  <input
                    type="date"
                    className={`form-control ${errors.expenseDate ? 'error' : ''}`}
                    {...register('expenseDate', { required: 'Date is required' })}
                  />
                  {errors.expenseDate && (
                    <div className="form-error">{errors.expenseDate.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Template</label>
                  <select
                    className={`form-control ${errors.template ? 'error' : ''}`}
                    {...register('template', { required: 'Template is required' })}
                  >
                    <option value="Expenses US1">Expenses US1</option>
                    <option value="Expenses UK1">Expenses UK1</option>
                    <option value="Expenses EU1">Expenses EU1</option>
                  </select>
                  {errors.template && (
                    <div className="form-error">{errors.template.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Type</label>
                  <select
                    className={`form-control ${errors.expenseTypeId ? 'error' : ''}`}
                    {...register('expenseTypeId', { required: 'Expense type is required' })}
                    disabled={typesLoading}
                  >
                    <option value="">Select expense type</option>
                    {expenseTypes.map(type => (
                      <option key={type.expenseTypeId} value={type.expenseTypeId}>
                        {type.typeName}
                      </option>
                    ))}
                  </select>
                  {errors.expenseTypeId && (
                    <div className="form-error">{errors.expenseTypeId.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Expense Location</label>
                  <select
                    className={`form-control ${errors.expenseLocation ? 'error' : ''}`}
                    {...register('expenseLocation', { required: 'Location is required' })}
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                  {errors.expenseLocation && (
                    <div className="form-error">{errors.expenseLocation.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Amount</label>
                  <div className="input-group">
                    <select
                      className="form-control currency-select"
                      {...register('originalCurrency')}
                      disabled={currenciesLoading}
                    >
                      {currenciesLoading ? (
                        <option value="">Loading currencies...</option>
                      ) : currencies && Array.isArray(currencies) && currencies.length > 0 ? (
                        currencies.map(currency => (
                          <option key={currency.currencyCode} value={currency.currencyCode}>
                            {currency.currencyCode}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                        </>
                      )}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${errors.originalAmount ? 'error' : ''}`}
                      placeholder="1000.00"
                      {...register('originalAmount', { 
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                      })}
                    />
                  </div>
                  {errors.originalAmount && (
                    <div className="form-error">{errors.originalAmount.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    {...register('numberOfDays')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    readOnly
                    {...register('dailyAmount')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reimbursable Amount</label>
                  <div className="reimbursable-display">
                    {isCalculating ? (
                      <span className="calculating">Calculating...</span>
                    ) : (
                      <span className="amount">
                        {reimbursableAmount.toFixed(2)} USD
                      </span>
                    )}
                    {exchangeRate !== 1.0000 && (
                      <div className="exchange-rate">
                        Exchange rate: {exchangeRate.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    {...register('description')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Merchant Name</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register('merchantName')}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-section">
                  <h4>Attachments</h4>
                  <DocumentUpload
                    reportId={reportId}
                    documents={documents}
                    onDocumentsChange={handleDocumentsChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Receipt Missing</label>
                  <div className="checkbox-group">
                    <input type="checkbox" id="receiptMissing" />
                    <label htmlFor="receiptMissing">Receipt missing</label>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Project Information</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Project Number</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        {...register('projectNumber')}
                      />
                      <button type="button" className="btn btn-link">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Task Number</label>
                    <select
                      className="form-control"
                      {...register('taxNumber')}
                    >
                      <option value="1.0">1.0</option>
                      <option value="2.0">2.0</option>
                      <option value="3.0">3.0</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expenditure Organization</label>
                    <select
                      className="form-control"
                      {...register('expenditureOrganization')}
                    >
                      <option value="">Select organization</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contract Number</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('contractNumber')}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Funding Source</label>
                    <input
                      type="text"
                      className="form-control"
                      {...register('fundingSource')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={() => {
              handleSubmit(onSubmit)();
              // Create another would not close modal
            }}
          >
            <i className="fas fa-plus"></i> Create Another
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit(onSubmit)}
          >
            <i className="fas fa-save"></i> Save and Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseLineModal;