import React, { useState, useEffect } from 'react';
import './Dhis2Input.css';
import { StorageService } from '../services';

const Dhis2Input = ({ dataElement, value, onChange }) => {
  const { id, displayFormName, valueType, compulsory, optionSet } = dataElement;
  const [internalValue, setInternalValue] = useState(value || '');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('');
  
  // File upload states
  const [fileUploadStatus, setFileUploadStatus] = useState({ uploading: false, error: null });
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    if (valueType === 'DATETIME' && value) {
      const [date = '', time = ''] = value.split('T');
      setDatePart(date);
      setTimePart(time.substring(0, 5)); // HH:mm
    }
    setInternalValue(value);
  }, [value, valueType]);

  const handleDateTimeChange = (part, val) => {
    let newDate = datePart;
    let newTime = timePart;

    if (part === 'date') {
      newDate = val;
      setDatePart(val);
    } else {
      newTime = val;
      setTimePart(val);
    }

    if (newDate) {
      onChange(id, `${newDate}T${newTime || '00:00'}`);
    } else {
      onChange(id, ''); // Clear value if date is cleared
    }
  };

  // File upload handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setFileUploadStatus({ uploading: true, error: null });
    setSelectedFileName(file.name);
    
    try {
      const credentials = await StorageService.get('userCredentials');
      if (!credentials) {
        throw new Error('Authentication required');
      }

      const fileData = new FormData();
      fileData.append('file', file);
      
      const response = await fetch('/api/fileResources', {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}` },
        body: fileData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed: ${response.status} - ${errorText}`);
      }
      
      const responseJson = await response.json();
      const fileResourceId = responseJson.response.fileResource.id;
      
      onChange(id, fileResourceId);
      setFileUploadStatus({ uploading: false, error: null });
    } catch (error) {
      setFileUploadStatus({ uploading: false, error: error.message });
      setSelectedFileName('');
    }
  };

  // File preview handler
  const handlePreview = () => {
    if (internalValue) {
      window.open(`/api/fileResources/${internalValue}/data`, '_blank');
    }
  };

  // File removal handler
  const handleRemoveFile = () => {
    onChange(id, '');
    setSelectedFileName('');
    setFileUploadStatus({ uploading: false, error: null });
  };

  // Check if file is previewable
  const isPreviewable = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(ext);
  };

  const renderInput = () => {
    // Handle FILE_RESOURCE value type
    if (valueType === 'FILE_RESOURCE') {
      const fileInputId = `file-input-${id}`;
      
      return (
        <div className="dhis2-file-upload-container">
          {internalValue ? (
            // File is uploaded - show download/preview options
            <div className="dhis2-file-actions">
              <a 
                href={`/api/fileResources/${internalValue}/data`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="dhis2-file-download-link"
              >
                <span className="file-icon">📄</span>
                {selectedFileName || 'Download current file'}
              </a>
              {selectedFileName && isPreviewable(selectedFileName) && (
                <button 
                  type="button" 
                  className="dhis2-file-preview-btn"
                  onClick={handlePreview}
                >
                  Preview
                </button>
              )}
              <button 
                type="button" 
                className="dhis2-file-remove-btn"
                onClick={handleRemoveFile}
              >
                Remove
              </button>
            </div>
          ) : (
            // No file uploaded - show upload interface
            <div className="dhis2-file-upload-interface">
              <input
                id={fileInputId}
                type="file"
                className="dhis2-file-input"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                required={compulsory}
                disabled={fileUploadStatus.uploading}
              />
              <label 
                htmlFor={fileInputId} 
                className={`dhis2-file-upload-label ${fileUploadStatus.uploading ? 'uploading' : ''}`}
              >
                Choose File
              </label>
              {selectedFileName && (
                <span className="dhis2-file-name">
                  <span className="file-icon">📄</span>
                  {selectedFileName}
                </span>
              )}
              {fileUploadStatus.uploading && (
                <div className="dhis2-file-upload-status">
                  <span className="upload-spinner">⏳</span>
                  Uploading...
                </div>
              )}
              {fileUploadStatus.error && (
                <div className="dhis2-file-upload-error">
                  ❌ {fileUploadStatus.error}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Prioritize rendering as a dropdown if an optionSet exists
    if (optionSet && optionSet.options && optionSet.options.length > 0) {
      return (
        <select value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input">
          <option value="">{displayFormName}</option>
          {optionSet.options.sort((a,b) => a.sortOrder - b.sortOrder).map(option => (
            <option key={option.id} value={option.code}>{option.displayName}</option>
          ))}
        </select>
      );
    }

    // Fallback to valueType if no optionSet is present
    switch (valueType) {
      case 'TEXT':
      case 'LONG_TEXT':
        return <textarea placeholder={displayFormName} value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;
      
      case 'NUMBER':
      case 'INTEGER':
      case 'INTEGER_POSITIVE':
      case 'INTEGER_NEGATIVE':
      case 'INTEGER_ZERO_OR_POSITIVE':
        return <input type="number" placeholder={displayFormName} value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;
      
      case 'BOOLEAN':
      case 'TRUE_ONLY':
        return (
          <div className="dhis2-checkbox-group">
            <label>
              <input type="checkbox" checked={internalValue === 'true'} onChange={(e) => onChange(id, e.target.checked.toString())} required={compulsory} />
              {displayFormName}
            </label>
          </div>
        );
        
      case 'DATE':
        return <input type="date" value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;

      case 'DATETIME':
        return (
          <div className="dhis2-datetime-container">
            <input
              type="date"
              value={datePart}
              onChange={(e) => handleDateTimeChange('date', e.target.value)}
              required={compulsory}
              className="dhis2-input date-part"
              placeholder="YYYY-MM-DD"
            />
            <input
              type="time"
              value={timePart}
              onChange={(e) => handleDateTimeChange('time', e.target.value)}
              className="dhis2-input time-part"
              placeholder="HH:MM"
            />
          </div>
        );
      
      default:
        // Generic text input for any other unhandled types
        return <input type="text" placeholder={displayFormName} value={internalValue} onChange={(e) => onChange(id, e.target.value)} required={compulsory} className="dhis2-input" />;
    }
  };

  return <div className="dhis2-input-container">{renderInput()}</div>;
};

export default Dhis2Input; 