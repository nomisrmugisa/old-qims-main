import React, { useState, useEffect, useCallback } from 'react';
import './EditFacilityOwnershipDialog.css'; // Use the correct CSS file
import ModalPortal from './ModalPortal';

const EditFacilityOwnershipDialog = ({ open, onClose, onUpdateSuccess, event }) => {
  const [programStageMetadata, setProgramStageMetadata] = useState(null);
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState({}); // { [dataElementId]: { uploading: bool, error: string|null } }
  const [selectedFileNames, setSelectedFileNames] = useState({}); // { [dataElementId]: fileName }
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isInScreeningGroup, setIsInScreeningGroup] = useState(false);

  // Fetch Program Stage Metadata for Facility Ownership
  const fetchProgramStageMetadata = useCallback(async () => {
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
      setErrorMessage("Authentication required.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/programStages/MuJubgTzJrY?fields=name,programStageSections[name,id,dataElements[displayFormName,id,valueType,compulsory,optionSet[id,displayName,options[id,displayName,code,sortOrder]]]]`,
        {
          headers: { Authorization: `Basic ${credentials}` },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }
      const metadata = await response.json();
      setProgramStageMetadata(metadata);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to check if the facility is already in the screening group
  const checkIfInScreeningGroup = useCallback(async () => {
    if (!event || !event.orgUnit) return;
    
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
      return;
    }
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnitGroups/nDAvPPtYHQP?fields=organisationUnits`,
        {
          headers: { Authorization: `Basic ${credentials}` },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch screening group: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the current facility is in the screening group
      const isInGroup = data.organisationUnits?.some(ou => ou.id === event.orgUnit);
      setIsInScreeningGroup(isInGroup);
    } catch {
      // Silently handle error - no need to show to user
    }
  }, [event]);

  // Initialize form data from event and fetch metadata
  useEffect(() => {
    if (open) {
      fetchProgramStageMetadata();
      checkIfInScreeningGroup();
      if (event && event.dataValues) {
        const initialData = {};
        event.dataValues.forEach(dv => {
          initialData[dv.dataElement] = dv.value;
        });
        setFormData(initialData);
      } else {
        setFormData({});
      }
      setIsSubmitting(false);
      setErrorMessage("");
    }
  }, [open, event, fetchProgramStageMetadata, checkIfInScreeningGroup]);

  // On dialog open, fetch file names for existing FILE_RESOURCE fields
  useEffect(() => {
    if (open && formData && programStageMetadata) {
      const fetchFileNames = async () => {
        const fileFields = [];
        programStageMetadata.programStageSections.forEach(section => {
          section.dataElements.forEach(de => {
            if (isFileValueType(de.valueType) && formData[de.id]) {
              fileFields.push({ dataElementId: de.id, fileResourceId: formData[de.id] });
            }
          });
        });
        const credentials = localStorage.getItem('userCredentials');
        const newFileNames = {};
        for (const field of fileFields) {
          try {
            const res = await fetch(`/api/fileResources/${field.fileResourceId}?fields=originalFilename`, {
              headers: { Authorization: `Basic ${credentials}` },
            });
            if (res.ok) {
              const data = await res.json();
              newFileNames[field.dataElementId] = data.originalFilename;
            }
          } catch { /* ignore file name fetch errors */ }
        }
        if (Object.keys(newFileNames).length > 0) {
          setSelectedFileNames(prev => ({ ...prev, ...newFileNames }));
        }
      };
      fetchFileNames();
    }
  }, [open, formData, programStageMetadata]);

  const handleInputChange = (dataElementId, value) => {
    setFormData(prev => ({ ...prev, [dataElementId]: value }));
  };

  // Helper to check if file is previewable (image or PDF)
  const isPreviewable = (fileName) => {
    if (!fileName) return false;
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'].includes(ext);
  };

  // Enhanced file input handler: upload immediately, store file name
  const handleFileUpload = async (de, file) => {
    if (!file) return;
    setFileUploadStatus(prev => ({ ...prev, [de.id]: { uploading: true, error: null } }));
    setSelectedFileNames(prev => ({ ...prev, [de.id]: file.name }));
    const credentials = localStorage.getItem('userCredentials');
    const fileData = new FormData();
    fileData.append('file', file);
    try {
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
      setFormData(prev => ({ ...prev, [de.id]: fileResourceId }));
      setFileUploadStatus(prev => ({ ...prev, [de.id]: { uploading: false, error: null } }));
    } catch (error) {
      setFileUploadStatus(prev => ({ ...prev, [de.id]: { uploading: false, error: error.message } }));
    }
  };

  // Preview handler for uploaded file
  const handlePreview = (fileResourceId, fileName) => {
    const ext = fileName ? fileName.split('.').pop().toLowerCase() : '';
    setPreviewType(ext);
    setPreviewUrl(`/api/fileResources/${fileResourceId}/data`);
  };

  // Close preview
  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const handleRemoveFile = (de) => {
    setFormData(prev => ({ ...prev, [de.id]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
      setErrorMessage("Authentication required.");
      setIsSubmitting(false);
      return;
    }
    try {
      // Get all data elements from compliance sections to exclude them
      const complianceDataElementIds = new Set();
      if (programStageMetadata) {
        programStageMetadata.programStageSections.forEach(section => {
          if (isComplianceSection(section)) {
            section.dataElements.forEach(de => {
              complianceDataElementIds.add(de.id);
            });
          }
        });
      }

      // Upload files first if any, excluding compliance fields
      const dataValues = await Promise.all(
        Object.entries(formData)
          .filter(([dataElement]) => !complianceDataElementIds.has(dataElement)) // Exclude compliance fields
          .map(async ([dataElement, value]) => {
            if (value instanceof File) {
              // Upload file and get fileResourceId
              const fileData = new FormData();
              fileData.append("file", value);
              const fileRes = await fetch("/api/fileResources", {
                method: "POST",
                headers: { Authorization: `Basic ${credentials}` },
                body: fileData,
              });
              if (!fileRes.ok) {
                const errorText = await fileRes.text();
                throw new Error(`File upload failed: ${fileRes.status} - ${errorText}`);
              }
              const responseJson = await fileRes.json();
              return { dataElement, value: responseJson.response.fileResource.id };
            } else {
              return { dataElement, value: value };
            }
          })
      );

      // Add back the original compliance field values from the event
      if (event && event.dataValues) {
        event.dataValues.forEach(dv => {
          if (complianceDataElementIds.has(dv.dataElement)) {
            dataValues.push({ dataElement: dv.dataElement, value: dv.value });
          }
        });
      }

      const orgUnitId = await getCurrentUserOrgUnit();
      const payload = {
        event: event.event,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        status: "COMPLETED",
        trackedEntityInstance: event.trackedEntityInstance,
        dataValues,
      };
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${event.event}`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${response.status} - ${errorText}`);
      }
      onUpdateSuccess && onUpdateSuccess();
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentUserOrgUnit = async () => {
    const credentials = localStorage.getItem('userCredentials');
    const response = await fetch("/api/me.json", {
      headers: { Authorization: `Basic ${credentials}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user information: ${response.status}`);
    }
    const userInfo = await response.json();
    return userInfo.organisationUnits[0].id;
  };

  const isFileValueType = (vt) => ['FILE_RESOURCE', 'FILE', 'fileResource'].includes(vt);
  
  // Helper to determine if a data element should be rendered as a dropdown
  const shouldRenderAsDropdown = (de) => {
    return de.optionSet && !isFileValueType(de.valueType) && de.valueType !== 'BOOLEAN' && de.valueType !== 'TRUE_ONLY';
  };

  // Helper to check if a section is the compliance section
  const isComplianceSection = (section) => {
    // Check for section name containing "compliance" (case insensitive)
    return section.name && section.name.toLowerCase().includes('compliance');
  };

  const renderFileInput = (de) => {
    const fileInputId = `file-input-${de.id}`;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {formData[de.id] ? (
          <>
            <a 
              href={`/api/fileResources/${formData[de.id]}/data`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="file-download-link"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ marginRight: '6px', fontSize: '1.2em' }}>📄</span>
              {selectedFileNames[de.id] || 'Download current file'}
            </a>
            {selectedFileNames[de.id] && isPreviewable(selectedFileNames[de.id]) && (
              <button 
                type="button" 
                className="btn btn-link" 
                style={{
                  color: '#1976d2',
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }} 
                onClick={() => handlePreview(formData[de.id], selectedFileNames[de.id])}
              >
                Preview
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-link text-danger" 
              style={{
                color: '#d32f2f',
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }} 
              onClick={() => handleRemoveFile(de)}
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <input
              id={fileInputId}
              type="file"
              style={{ display: 'none' }}
              onChange={e => handleFileUpload(de, e.target.files[0])}
              required={de.compulsory}
              disabled={fileUploadStatus[de.id]?.uploading}
            />
            <label 
              htmlFor={fileInputId} 
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: '#1976d2',
                color: 'white',
                borderRadius: '4px',
                cursor: fileUploadStatus[de.id]?.uploading ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                transition: 'background-color 0.2s ease',
                border: 'none',
                margin: 0
              }}
            >
              Choose File
            </label>
            {selectedFileNames[de.id] && (
              <span style={{
                marginLeft: 8, 
                fontStyle: 'italic', 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.9rem'
              }}>
                <span style={{ marginRight: '6px', fontSize: '1.1em' }}>📄</span>
                {selectedFileNames[de.id]}
              </span>
            )}
            {fileUploadStatus[de.id]?.uploading && (
              <span style={{
                marginLeft: 8,
                color: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.9rem'
              }}>
                <span style={{ marginRight: '6px' }}>⏳</span>
                Uploading...
              </span>
            )}
            {fileUploadStatus[de.id]?.error && (
              <span style={{
                marginLeft: 8, 
                color: '#d32f2f',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.9rem'
              }}>
                <span style={{ marginRight: '6px' }}>⚠️</span>
                {fileUploadStatus[de.id].error}
              </span>
            )}
          </>
        )}
        {/* Preview Modal */}
        {previewUrl && previewType && (
          <div style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh',
            background: 'rgba(0,0,0,0.8)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(3px)'
          }}>
            <div style={{ 
              background: 'white', 
              padding: 24, 
              borderRadius: 8, 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <button 
                onClick={closePreview} 
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  fontSize: 24, 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: '#666',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                &times;
              </button>
              <div style={{ marginTop: '10px' }}>
                {previewType === 'pdf' ? (
                  <iframe 
                    src={previewUrl} 
                    title="Preview" 
                    style={{ 
                      width: '80vw', 
                      height: '80vh', 
                      border: 'none',
                      borderRadius: '4px'
                    }} 
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '80vw', 
                      maxHeight: '80vh', 
                      display: 'block', 
                      margin: '0 auto',
                      borderRadius: '4px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }} 
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormBody = () => {
    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.1rem', color: '#666' }}>Loading form...</div>
    </div>;
    if (errorMessage) return <div style={{ 
      padding: '16px', 
      margin: '16px 0', 
      backgroundColor: '#fdeded', 
      color: '#d32f2f',
      borderRadius: '4px',
      border: '1px solid #f5c2c7'
    }}>{errorMessage}</div>;
    if (!programStageMetadata) return <div style={{ 
      padding: '16px', 
      margin: '16px 0', 
      backgroundColor: '#fff3cd', 
      color: '#856404',
      borderRadius: '4px',
      border: '1px solid #ffeeba'
    }}>Form metadata could not be loaded.</div>;
    return (
      <div className="dynamic-form-body">
        {programStageMetadata.programStageSections.map(section => (
          <div key={section.id} className="section-group" style={{
            marginBottom: '28px',
            padding: '0 0 16px 0',
            borderBottom: section !== programStageMetadata.programStageSections[programStageMetadata.programStageSections.length - 1] ? '1px solid #eee' : 'none'
          }}>
            {section.name && (
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#333',
                paddingBottom: '8px',
                borderBottom: '1px solid #eee'
              }}>
                {section.name}
                {isComplianceSection(section) && (
                  <span style={{ 
                    fontSize: '0.8em', 
                    fontWeight: 'normal', 
                    marginLeft: '10px', 
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    (Read Only)
                  </span>
                )}
              </h4>
            )}
            {section.dataElements.map(de => (
              <div key={de.id} className="form-group-dhis2" style={{
                marginBottom: '16px'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  {de.displayFormName}{de.compulsory && <span style={{color:'#d32f2f', marginLeft: '3px'}}>*</span>}
                </label>
                {isComplianceSection(section) ? (
                  // Render read-only fields for compliance section
                  isFileValueType(de.valueType) ? (
                    <div>
                      {formData[de.id] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <a 
                            href={`/api/fileResources/${formData[de.id]}/data`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="file-download-link"
                            style={{
                              color: '#1976d2',
                              textDecoration: 'none',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <span style={{ marginRight: '6px', fontSize: '1.2em' }}>📄</span>
                            {selectedFileNames[de.id] || 'Download file'}
                          </a>
                          {selectedFileNames[de.id] && isPreviewable(selectedFileNames[de.id]) && (
                            <button 
                              type="button" 
                              className="btn btn-link" 
                              style={{
                                marginLeft: 8,
                                color: '#1976d2',
                                background: 'none',
                                border: 'none',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textDecoration: 'underline'
                              }} 
                              onClick={() => handlePreview(formData[de.id], selectedFileNames[de.id])}
                            >
                              Preview
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ 
                          color: '#666', 
                          fontStyle: 'italic',
                          padding: '8px 0',
                          display: 'block'
                        }}>No file uploaded</span>
                      )}
                    </div>
                  ) : de.valueType === 'TRUE_ONLY' || de.valueType === 'BOOLEAN' ? (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={formData[de.id] === 'true'}
                        disabled={true}
                        style={{ 
                          marginRight: '8px', 
                          width: '18px', 
                          height: '18px',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        }}
                      />
                      <span style={{ fontSize: '0.95rem' }}>Yes</span>
                    </div>
                  ) : shouldRenderAsDropdown(de) ? (
                    <div style={{ 
                      padding: '10px 12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      color: '#333',
                      fontSize: '0.95rem'
                    }}>
                      {de.optionSet.options && 
                        de.optionSet.options.find(opt => opt.code === formData[de.id])?.displayName || 
                        <span style={{ color: '#666', fontStyle: 'italic' }}>Not selected</span>
                      }
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '10px 12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      color: '#333',
                      fontSize: '0.95rem'
                    }}>
                      {formData[de.id] || <span style={{ color: '#666', fontStyle: 'italic' }}>Not provided</span>}
                    </div>
                  )
                ) : (
                  // Normal editable fields for non-compliance sections
                  isFileValueType(de.valueType) ? (
                    renderFileInput(de)
                  ) : de.valueType === 'NUMBER' ? (
                    <input
                      type="number"
                      className="form-control"
                      value={formData[de.id] || ''}
                      onChange={e => handleInputChange(de.id, e.target.value)}
                      required={de.compulsory}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.95rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        transition: 'border-color 0.2s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : de.valueType === 'TRUE_ONLY' ? (
                    <div className="checkbox-wrapper" style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        id={`checkbox-${de.id}`}
                        checked={formData[de.id] === 'true'}
                        onChange={e => handleInputChange(de.id, e.target.checked ? 'true' : '')}
                        style={{ 
                          marginRight: '8px', 
                          width: '18px', 
                          height: '18px',
                          accentColor: '#1976d2'
                        }}
                      />
                      <label 
                        htmlFor={`checkbox-${de.id}`}
                        style={{ 
                          cursor: 'pointer', 
                          fontWeight: 'normal', 
                          margin: 0,
                          fontSize: '0.95rem'
                        }}
                      >
                        Yes
                      </label>
                    </div>
                  ) : de.valueType === 'BOOLEAN' ? (
                    <div className="checkbox-wrapper" style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        id={`checkbox-${de.id}`}
                        checked={formData[de.id] === 'true'}
                        onChange={e => handleInputChange(de.id, e.target.checked ? 'true' : 'false')}
                        style={{ 
                          marginRight: '8px', 
                          width: '18px', 
                          height: '18px',
                          accentColor: '#1976d2'
                        }}
                      />
                      <label 
                        htmlFor={`checkbox-${de.id}`}
                        style={{ 
                          cursor: 'pointer', 
                          fontWeight: 'normal', 
                          margin: 0,
                          fontSize: '0.95rem'
                        }}
                      >
                        Yes
                      </label>
                    </div>
                  ) : shouldRenderAsDropdown(de) ? (
                    <select
                      className="form-control"
                      value={formData[de.id] || ''}
                      onChange={e => handleInputChange(de.id, e.target.value)}
                      required={de.compulsory}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.95rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        transition: 'border-color 0.2s ease',
                        outline: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        appearance: 'auto',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select</option>
                      {de.optionSet.options && de.optionSet.options.map(opt => (
                        <option key={opt.id} value={opt.code}>{opt.displayName}</option>
                      ))}
                    </select>
                  ) : de.valueType === 'TEXT' || de.valueType === 'LONG_TEXT' ? (
                    <input
                      type="text"
                      className="form-control"
                      value={formData[de.id] || ''}
                      onChange={e => handleInputChange(de.id, e.target.value)}
                      required={de.compulsory}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.95rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        transition: 'border-color 0.2s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : de.valueType === 'DATE' ? (
                    <input
                      type="date"
                      className="form-control"
                      value={formData[de.id] || ''}
                      onChange={e => handleInputChange(de.id, e.target.value)}
                      required={de.compulsory}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.95rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        transition: 'border-color 0.2s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={formData[de.id] || ''}
                      onChange={e => handleInputChange(de.id, e.target.value)}
                      required={de.compulsory}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.95rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        transition: 'border-color 0.2s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Helper to check if all required fields are filled
  const isAllRequiredFieldsFilled = () => {
    if (!programStageMetadata) return false;
    for (const section of programStageMetadata.programStageSections) {
      for (const de of section.dataElements) {
        if (de.compulsory && !formData[de.id]) {
          return false;
        }
      }
    }
    return true;
  };

  // Helper to get facility org unit ID (assuming event.trackedEntityInstance or event.orgUnit)
  const facilityOrgUnitId = event?.orgUnit;

  // Handler for submit application for review
  const handleSubmitForReview = async () => {
    setSubmitInProgress(true);
    setSubmitError(null);
    try {
      // 1. Add facility to Screening org unit group
      const credentials = localStorage.getItem('userCredentials');
      const putRes = await fetch('/api/29/organisationUnitGroups/nDAvPPtYHQP?mergeMode=REPLACE', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          id: 'nDAvPPtYHQP',
          name: 'Screening Review',
          shortName: 'Screening Review',
          organisationUnits: [{ id: facilityOrgUnitId }],
        }),
      });
      if (!putRes.ok) throw new Error('Failed to add facility to Screening group');

      // 2. Send email to user
      await fetch('http://134.255.180.98:5002/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'qimsmohbots@gmail.com',
          subject: 'Application Received',
          message: 'Your Application Has Been Recieved, we will contact you soon',
        }),
      });

      // 3. Show success feedback
      setSubmitSuccess(true);
      // 4. Disable and toggle button
      setSubmitInProgress(false);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed');
      setSubmitInProgress(false);
    }
  };

  if (!open) return null;

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ 
        padding: '0', 
        maxWidth: '700px',
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        <div className="modal-header" style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8f9fa'
        }}>
          <h5 className="modal-title" style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: '500',
            color: '#333'
          }}>Edit Facility Ownership</h5>
          <button 
            type="button" 
            className="close-btn" 
            onClick={onClose} 
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              color: '#666',
              padding: '0 8px',
              lineHeight: 1
            }}
          >&times;</button>
        </div>
        <div className="modal-body" style={{ 
          position: 'relative', 
          padding: '24px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          <form onSubmit={handleSubmit} className="ownership-form">
            {renderFormBody()}
            <div className="button-container" style={{ 
              display: 'flex', 
              gap: 12, 
              justifyContent: 'flex-end',
              marginTop: '32px',
              padding: '16px 0',
              borderTop: '1px solid #e0e0e0',
              position: 'sticky',
              bottom: 0,
              background: 'white',
              zIndex: 10
            }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose} 
                disabled={isSubmitting}
                style={{ 
                  padding: '10px 24px', 
                  fontSize: '0.95rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: '#fff',
                  color: '#333',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isSubmitting || isLoading || isInScreeningGroup}
                style={{ 
                  padding: '10px 24px', 
                  fontSize: '0.95rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#1976d2',
                  color: 'white',
                  fontWeight: '500',
                  cursor: isSubmitting || isLoading || isInScreeningGroup ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || isLoading || isInScreeningGroup ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              {isInScreeningGroup && (
                <div style={{ 
                  color: '#ed6c02', 
                  marginLeft: 8, 
                  fontSize: '0.9em',
                  display: 'flex',
                  alignItems: 'center' 
                }}>
                  <span style={{ marginRight: '6px', fontSize: '1.2em' }}>⚠️</span>
                  This application has already been submitted for review
                </div>
              )}
              <button
                type="button"
                className="btn-primary"
                style={{
                  background: submitSuccess || isInScreeningGroup ? '#9e9e9e' : '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
                  cursor: submitSuccess || isInScreeningGroup || !isAllRequiredFieldsFilled() ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  opacity: isAllRequiredFieldsFilled() && !isInScreeningGroup && !submitSuccess ? 1 : 0.7,
                }}
                disabled={!isAllRequiredFieldsFilled() || submitInProgress || submitSuccess || isInScreeningGroup}
                onClick={handleSubmitForReview}
              >
                {submitSuccess ? 'Application Sent' : isInScreeningGroup ? 'Already Submitted' : submitInProgress ? 'Submitting...' : 'Submit Application for Review'}
              </button>
              {submitSuccess && (
                <div style={{ 
                  color: '#2e7d32', 
                  marginTop: 8, 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '6px', fontSize: '1.2em' }}>✓</span>
                  Application submitted successfully
                </div>
              )}
              {submitError && (
                <div style={{ 
                  color: '#d32f2f', 
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '6px', fontSize: '1.2em' }}>✕</span>
                  {submitError}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditFacilityOwnershipDialog; 