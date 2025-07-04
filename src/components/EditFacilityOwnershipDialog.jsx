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

  // Initialize form data from event and fetch metadata
  useEffect(() => {
    if (open) {
      fetchProgramStageMetadata();
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
  }, [open, event, fetchProgramStageMetadata]);

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
      // Upload files first if any
      const dataValues = await Promise.all(Object.entries(formData).map(async ([dataElement, value]) => {
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
      }));
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
  const renderFileInput = (de) => {
    const fileInputId = `file-input-${de.id}`;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {formData[de.id] ? (
          <>
            <a href={`/api/fileResources/${formData[de.id]}/data`} target="_blank" rel="noopener noreferrer" className="file-download-link">Download current file</a>
            {selectedFileNames[de.id] && isPreviewable(selectedFileNames[de.id]) && (
              <button type="button" className="btn btn-link" style={{marginLeft: 8}} onClick={() => handlePreview(formData[de.id], selectedFileNames[de.id])}>Preview</button>
            )}
            <button type="button" className="btn btn-link text-danger" style={{marginLeft: 8}} onClick={() => handleRemoveFile(de)}>Remove</button>
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
            <label htmlFor={fileInputId} style={{
              display: 'inline-block',
              padding: '8px 18px',
              background: '#1976d2',
              color: 'white',
              borderRadius: '4px',
              cursor: fileUploadStatus[de.id]?.uploading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: '1em',
              boxShadow: '0 2px 6px rgba(25, 118, 210, 0.08)'
            }}>
              Choose File
            </label>
            {selectedFileNames[de.id] && (
              <span style={{marginLeft: 8, fontStyle: 'italic', color: '#333'}}>{selectedFileNames[de.id]}</span>
            )}
            {fileUploadStatus[de.id]?.uploading && <span style={{marginLeft: 8}}>Uploading...</span>}
            {fileUploadStatus[de.id]?.error && <span style={{marginLeft: 8, color: 'red'}}>{fileUploadStatus[de.id].error}</span>}
          </>
        )}
        {/* Preview Modal */}
        {previewUrl && previewType && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
              <button onClick={closePreview} style={{ position: 'absolute', top: 8, right: 8, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
              {previewType === 'pdf' ? (
                <iframe src={previewUrl} title="Preview" style={{ width: '80vw', height: '80vh', border: 'none' }} />
              ) : (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: '80vw', maxHeight: '80vh', display: 'block', margin: '0 auto' }} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormBody = () => {
    if (isLoading) return <div>Loading form...</div>;
    if (errorMessage) return <div className="alert alert-danger">{errorMessage}</div>;
    if (!programStageMetadata) return <div className="alert alert-warning">Form metadata could not be loaded.</div>;
    return (
      <div className="dynamic-form-body">
        {programStageMetadata.programStageSections.map(section => (
          <div key={section.id} className="section-group">
            {section.name && <h4>{section.name}</h4>}
            {section.dataElements.map(de => (
              <div key={de.id} className="form-group-dhis2">
                <label>{de.displayFormName}{de.compulsory && <span style={{color:'red'}}>*</span>}</label>
                {isFileValueType(de.valueType) ? (
                  renderFileInput(de)
                ) : de.valueType === 'TEXT' || de.valueType === 'LONG_TEXT' ? (
                  <input
                    type="text"
                    className="form-control"
                    value={formData[de.id] || ''}
                    onChange={e => handleInputChange(de.id, e.target.value)}
                    required={de.compulsory}
                  />
                ) : de.valueType === 'DATE' ? (
                  <input
                    type="date"
                    className="form-control"
                    value={formData[de.id] || ''}
                    onChange={e => handleInputChange(de.id, e.target.value)}
                    required={de.compulsory}
                  />
                ) : de.valueType === 'NUMBER' ? (
                  <input
                    type="number"
                    className="form-control"
                    value={formData[de.id] || ''}
                    onChange={e => handleInputChange(de.id, e.target.value)}
                    required={de.compulsory}
                  />
                ) : de.valueType === 'TRUE_ONLY' || de.valueType === 'BOOLEAN' ? (
                  <select
                    className="form-control"
                    value={formData[de.id] || ''}
                    onChange={e => handleInputChange(de.id, e.target.value)}
                    required={de.compulsory}
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : de.optionSet ? (
                  <select
                    className="form-control"
                    value={formData[de.id] || ''}
                    onChange={e => handleInputChange(de.id, e.target.value)}
                    required={de.compulsory}
                  >
                    <option value="">Select</option>
                    {de.optionSet.options.map(opt => (
                      <option key={opt.id} value={opt.code}>{opt.displayName}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={formData[de.id] || ''}
                    onChange={e => handleInputChange(de.id, e.target.value)}
                    required={de.compulsory}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (!open) return null;

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '900px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Facility Ownership</h5>
          <button type="button" className="close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>
        <div className="modal-body" style={{ position: 'relative', paddingBottom: '80px' }}>
          <form onSubmit={handleSubmit} className="ownership-form">
            {renderFormBody()}
            <div className="button-container" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}
                style={{ padding: '10px 24px', fontSize: '1em', borderRadius: 6 }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting || isLoading}
                style={{ padding: '10px 24px', fontSize: '1em', borderRadius: 6 }}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 24px',
                  fontSize: '1em',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => alert('Submit Application for Review clicked!')}
              >
                Submit Application for Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditFacilityOwnershipDialog; 