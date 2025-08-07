import React, { useState, useRef } from 'react';
import { expenseService } from '../../services/expenseService.ts';
import { handleApiError } from '../../services/api';
import './DocumentUpload.css';

const DocumentUpload = ({ 
  reportId, 
  lineId, 
  onUploadSuccess, 
  onUploadError, 
  maxFileSize = 10485760, // 10MB default
  allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'tiff']
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file size
    if (file.size > maxFileSize) {
      const errorMessage = `File size exceeds maximum allowed size of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
      onUploadError?.(errorMessage);
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      const errorMessage = `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
      onUploadError?.(errorMessage);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', `Uploaded ${file.name}`);

      let response;
      if (lineId) {
        // Upload to expense line
        response = await expenseService.uploadLineDocument(lineId, formData);
      } else if (reportId) {
        // Upload to expense report
        response = await expenseService.uploadReportDocument(reportId, formData);
      } else {
        throw new Error('No reportId or lineId provided');
      }

      if (response.data && response.data.success) {
        onUploadSuccess?.(response.data.data);
        setUploadProgress(100);
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Document upload failed:', error);
      const errorMessage = handleApiError(error, 'Failed to upload document');
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="document-upload">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedTypes.map(type => `.${type}`).join(',')}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          {isUploading ? (
            <div className="upload-progress">
              <div className="progress-circle">
                <div className="progress-bar" style={{ transform: `rotate(${uploadProgress * 3.6}deg)` }}></div>
                <div className="progress-text">{uploadProgress}%</div>
              </div>
              <p>Uploading document...</p>
            </div>
          ) : (
            <>
              <div className="upload-icon">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <h4>Upload Document</h4>
              <p>Drag and drop a file here, or click to browse</p>
              <div className="upload-info">
                <span>Maximum file size: {formatFileSize(maxFileSize)}</span>
                <span>Allowed types: {allowedTypes.join(', ')}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="upload-status">
          <div className="status-bar">
            <div 
              className="status-progress" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;