import React, { useState, useEffect, useCallback } from 'react';
import './AddFacilityOwnershipDialog.css'; // We'll create this CSS file next
import ModalPortal from './ModalPortal';

const AddFacilityOwnershipDialog = ({ open, onClose, onSuccess, onAddSuccess, trackedEntityInstanceId }) => {
  const [programStageMetadata, setProgramStageMetadata] = useState(null);
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState({}); // { [dataElementId]: { uploading: bool, error: string|null } }

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

  // Fetch metadata and reset form when dialog opens
  useEffect(() => {
    if (open) {
      fetchProgramStageMetadata();
      setFormData({});
      setIsSubmitting(false);
      setErrorMessage("");
    }
  }, [open, fetchProgramStageMetadata]);

  const handleInputChange = (dataElementId, value) => {
    setFormData(prev => ({ ...prev, [dataElementId]: value }));
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
      const orgUnitId = await getCurrentUserOrgUnit();
      const today = new Date().toISOString().split('T')[0];
      const dataValues = Object.entries(formData)
        .filter(([, value]) => value !== null && value !== '')
        .map(([dataElement, value]) => ({
          dataElement,
          value: value.toString(),
        }));
      const payload = {
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        status: "COMPLETED",
        dataValues,
        trackedEntityInstance: trackedEntityInstanceId,
        eventDate: today
      };
      const response = await fetch("/api/events", {
        method: "POST",
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
      onSuccess && onSuccess();
      onAddSuccess && onAddSuccess();
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

  // Enhanced file input handler: upload immediately
  const handleFileUpload = async (de, file) => {
    if (!file) return;
    setFileUploadStatus(prev => ({ ...prev, [de.id]: { uploading: true, error: null } }));
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

  // Remove file from formData
  const handleRemoveFile = (de) => {
    setFormData(prev => ({ ...prev, [de.id]: undefined }));
  };

  // Helper for file input rendering
  const isFileValueType = (vt) => ['FILE_RESOURCE', 'FILE', 'fileResource'].includes(vt);
  const renderFileInput = (de) => (
    <div>
      {formData[de.id] ? (
        <>
          <a href={`/api/fileResources/${formData[de.id]}/data`} target="_blank" rel="noopener noreferrer">Download current file</a>
          <button type="button" className="btn btn-link text-danger" style={{marginLeft: 8}} onClick={() => handleRemoveFile(de)}>Remove</button>
        </>
      ) : (
        <>
          <input
            type="file"
            style={{ border: '2px solid red', background: 'white' }}
            onChange={e => handleFileUpload(de, e.target.files[0])}
            required={de.compulsory}
            disabled={fileUploadStatus[de.id]?.uploading}
          />
          {fileUploadStatus[de.id]?.uploading && <span style={{marginLeft: 8}}>Uploading...</span>}
          {fileUploadStatus[de.id]?.error && <span style={{marginLeft: 8, color: 'red'}}>{fileUploadStatus[de.id].error}</span>}
        </>
      )}
    </div>
  );

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
                <label>{de.displayFormName} <span style={{fontSize: '0.85em', color: '#888'}}>({de.valueType})</span>{de.compulsory && <span style={{color:'red'}}>*</span>}</label>
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
          <h5 className="modal-title">Facility Ownership</h5>
          <button type="button" className="close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="ownership-form">
            {renderFormBody()}
            <div className="button-container">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Submitting...' : 'Submit Facility Ownership'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddFacilityOwnershipDialog;