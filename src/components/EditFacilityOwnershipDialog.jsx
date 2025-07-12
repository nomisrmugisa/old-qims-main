import React, { useState, useEffect, useCallback } from 'react';
import './EditFacilityOwnershipDialog.css'; // Use the correct CSS file
import ModalPortal from './ModalPortal';

const EditFacilityOwnershipDialog = ({ 
  open, 
  onClose, 
  onUpdateSuccess, 
  onAddSuccess, 
  event, 
  trackedEntityInstanceId, 
  isEditMode = true,
  // facilityName
}) => {
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [facilityOrgUnitId, setFacilityOrgUnitId] = useState(null);

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
      
      // Only check screening group in edit mode
      if (isEditMode && event) {
      checkIfInScreeningGroup();
      } else {
        setIsInScreeningGroup(false);
      }
      
      // Initialize form data from event if in edit mode
      if (isEditMode && event && event.dataValues) {
        const initialData = {};
        event.dataValues.forEach(dv => {
          initialData[dv.dataElement] = dv.value;
        });
        setFormData(initialData);
      } else {
        // Reset form data in add mode
        setFormData({});
      }
      
      setIsSubmitting(false);
      setErrorMessage("");
      setSubmitSuccess(false);
      setSubmitError(null);
      
      // Log for debugging
      console.log("Dialog initialized with:", { 
        isEditMode, 
        hasEvent: !!event,
        trackedEntityInstanceId 
      });
    }
  }, [open, event, fetchProgramStageMetadata, checkIfInScreeningGroup, isEditMode, trackedEntityInstanceId]);

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
      console.log("Form submission started", { isEditMode, hasEvent: !!event });
      
      const dataValues = Object.entries(formData)
        .filter(([, value]) => value !== null && value !== '')
        .map(([dataElement, value]) => ({
          dataElement,
          value: value.toString(),
        }));
      
      console.log(`Prepared ${dataValues.length} data values for submission`);

      if (isEditMode && event) {
        // Edit mode - update existing event
        console.log("Update mode - Event data:", { 
          eventId: event.event,
          orgUnit: event.orgUnit,
          program: event.program || "EE8yeLVo6cN",
          programStage: event.programStage || "MuJubgTzJrY"
        });
        
        const payload = {
          event: event.event,
          orgUnit: event.orgUnit,
          program: event.program || "EE8yeLVo6cN",
          programStage: event.programStage || "MuJubgTzJrY",
          status: "COMPLETED",
          dataValues,
        };
        
        console.log("Sending PUT request to update event:", payload);
        
        const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${event.event}`, {
          method: "PUT",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        console.log("Update response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Update failed:", { status: response.status, error: errorText });
          throw new Error(`Update failed: ${response.status} - ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log("Update successful:", responseData);
        
        // Call the success callback
        onUpdateSuccess && onUpdateSuccess();
        
        // Show success message
        setErrorMessage("Changes saved successfully!");
        
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Add mode - create new event
        // Get the organization unit ID from the current user
        const orgUnitId = await getCurrentUserOrgUnit();
        const today = new Date().toISOString().split('T')[0];
        
        console.log("Add mode - Using organization unit:", orgUnitId);
        
        // Use the provided trackedEntityInstanceId or fetch it if not available
        let effectiveTrackedEntityInstanceId = trackedEntityInstanceId;
        
        if (!effectiveTrackedEntityInstanceId) {
          // Fetch trackedEntityInstanceId if not provided
          console.log("No trackedEntityInstanceId provided, fetching from API");
          
          const teiResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances?ou=${orgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=trackedEntityInstance&paging=false`, {
                headers: { Authorization: `Basic ${credentials}` },
          });
          
          if (!teiResponse.ok) {
            console.error("Failed to fetch tracked entity instance:", teiResponse.status);
            throw new Error(`Failed to fetch tracked entity instance: ${teiResponse.status}`);
          }
          
          const teiData = await teiResponse.json();
          console.log("Tracked entity response:", teiData);
          
          if (teiData.trackedEntityInstances && teiData.trackedEntityInstances.length > 0) {
            effectiveTrackedEntityInstanceId = teiData.trackedEntityInstances[0].trackedEntityInstance;
            console.log("Found trackedEntityInstanceId:", effectiveTrackedEntityInstanceId);
            } else {
            console.error("No tracked entity instances found");
            throw new Error("No tracked entity instance found for this organization unit.");
          }
        } else {
          console.log("Using provided trackedEntityInstanceId:", effectiveTrackedEntityInstanceId);
        }
        
      const payload = {
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        status: "COMPLETED",
        dataValues,
          trackedEntityInstance: effectiveTrackedEntityInstanceId,
          eventDate: today
        };
        
        console.log("Sending POST request to create event:", payload);
        
        const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events`, {
          method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
        
        console.log("Create response status:", response.status);
        
      if (!response.ok) {
        const errorText = await response.text();
          console.error("Create failed:", { status: response.status, error: errorText });
        throw new Error(`Submission failed: ${response.status} - ${errorText}`);
      }
        
        const responseData = await response.json();
        console.log("Create successful:", responseData);
        
        // Call the success callback
        onAddSuccess && onAddSuccess();
        
        // Show success message
        setErrorMessage("Record added successfully!");
        
        // Close dialog after a short delay to show success message
        setTimeout(() => {
      onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new handler for combined save and submit
  const handleSaveAndSubmit = async () => {
    // Show confirmation dialog first
    setShowConfirmDialog(true);
  };

  // Helper function to get the current user's organization unit ID
  const getCurrentUserOrgUnit = async () => {
    // Comprehensive logging of method entry
    console.group('🏥 GET CURRENT USER ORGANIZATION UNIT');
    console.log('Timestamp:', new Date().toISOString());

    // Check credentials
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
      console.error('❌ NO CREDENTIALS FOUND IN LOCALSTORAGE');
      console.groupEnd();
      throw new Error('No user credentials available');
    }

    try {
      // Detailed fetch configuration
      const fetchConfig = {
        method: 'GET',
        headers: { 
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      };

      console.log('🔍 Fetch Configuration:', {
        url: `${import.meta.env.VITE_DHIS2_URL}/api/me?fields=organisationUnits[id,name]`,
        method: fetchConfig.method,
        headers: Object.keys(fetchConfig.headers)
      });

      // Perform the fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      const response = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/me?fields=organisationUnits[id,name]`, 
        {
          ...fetchConfig,
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      // Check response status
      if (!response.ok) {
        console.error('❌ FETCH FAILED', {
          status: response.status,
          statusText: response.statusText
        });
        
        // Try to get error details
        const errorText = await response.text();
        console.error('Error Response Body:', errorText);
        
        throw new Error(`Failed to fetch user information: ${response.status} - ${response.statusText}`);
      }

      // Parse response
      const userInfo = await response.json();
      console.log('✅ User Info Received:', userInfo);

      // Validate organization units
      if (!userInfo.organisationUnits || userInfo.organisationUnits.length === 0) {
        console.error('❌ NO ORGANIZATION UNITS FOUND');
        console.log('Full User Info:', JSON.stringify(userInfo, null, 2));
        throw new Error('No organization units associated with this user');
      }

      // Log all organization units
      console.log('🏢 ORGANIZATION UNITS:');
      userInfo.organisationUnits.forEach((ou, index) => {
        console.log(`[${index}] ID: ${ou.id}, Name: ${ou.name}`);
      });

      // Additional context logging
      console.log('🔑 Context Information:', {
        dhis2Url: import.meta.env.VITE_DHIS2_URL,
        totalOrgUnits: userInfo.organisationUnits.length
      });

      console.groupEnd();

      // Return the first organization unit's ID
      return userInfo.organisationUnits[0].id;
    } catch (error) {
      console.error('❌ CRITICAL ERROR in getCurrentUserOrgUnit:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      console.groupEnd();
      
      // Rethrow with additional context
      throw new Error(`Organization Unit Retrieval Failed: ${error.message}`);
    }
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

  // Helper to check if a section is the special circumstances section
  const isSpecialCircumstancesSection = (section) => {
    // Check for section name containing "special circumstances" (case insensitive)
    return section.name && section.name.toLowerCase().includes('special circumstances');
  };

  // Function to check if ID Type is Omang
  const isIdTypeOmang = () => {
    const idTypeValue = formData['FLcrCfTNcQi']; // ID Type field
    return idTypeValue === 'Omang' || idTypeValue === 'omang';
  };

  // Function to check if field should be hidden based on ID Type
  const shouldHideField = (de) => {
    if (isIdTypeOmang()) {
      // Hide permit fields when ID Type is Omang
      const permitFields = ['cUObXSGtCuD', 'g9jXH9LJyxU']; // Copy of Resident Permit, Work Permit / Waiver
      return permitFields.includes(de.id);
    }
    return false;
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
              shouldHideField(de) ? null : (
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
              )
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
      // Exclude fields in Compliance sections and Special Circumstances sections
      if (isComplianceSection(section) || isSpecialCircumstancesSection(section)) {
        continue;
      }
      
      for (const de of section.dataElements) {
        // Skip hidden fields (permit fields when ID Type is Omang)
        if (shouldHideField(de)) {
          continue;
        }
        
        // Check ALL fields in required sections, not just those marked as compulsory
        const value = formData[de.id];
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
    }
    return true;
  };

  // Helper to get facility org unit ID (assuming event.trackedEntityInstance or event.orgUnit)
  // const facilityOrgUnitId = event?.orgUnit;

  // Function to fetch org unit ID by name
  const fetchOrgUnitIdByName = async (name) => {
    try {
      const credentials = localStorage.getItem('userCredentials');
      if (!credentials || !name) return null;
      
      const encodedName = encodeURIComponent(name);
      const response = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnits?paging=false&filter=displayName:ilike:${encodedName}`,
        {
          headers: { Authorization: `Basic ${credentials}` },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch organization unit');
      
      const data = await response.json();
      return data.organisationUnits?.[0]?.id || null;
    } catch (error) {
      console.error('Error fetching org unit ID:', error);
      return null;
    }
  };

  const handleClose = () => {
    sessionStorage.removeItem('currentFacilityName');
    onClose();
  };
  
  // Actual submission after confirmation
  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    setSubmitInProgress(true);
    setSubmitError(null);
    try {
      // 1. Get facility name from sessionStorage
      const facilityName = sessionStorage.getItem('currentFacilityName');
      if (!facilityName) {
        throw new Error('Facility name not found');
      }

      // 2. Get org unit ID
      const orgUnitId = await fetchOrgUnitIdByName(facilityName);
      if (!orgUnitId) {
        throw new Error('Could not find organization unit for the facility');
      }
      setFacilityOrgUnitId(orgUnitId);


      // 1.1 Set "Application Submitted" to true before saving
      if (programStageMetadata && programStageMetadata.programStageSections) {
        const complianceSection = programStageMetadata.programStageSections.find(section => 
          section.name && section.name.toLowerCase().includes('compliance')
        );
        if (complianceSection) {
          const applicationSubmittedDE = complianceSection.dataElements.find(de => 
            de.displayFormName && de.displayFormName.toLowerCase().includes('application submitted')
          );
          if (applicationSubmittedDE) {
            setFormData(prev => ({
              ...prev,
              [applicationSubmittedDE.id]: 'true'
            }));
          }
        }
      }
      
      // 2. Save the record first (this will create or update the event)
      await handleSubmit(new Event('submit'));

      // 3. Get the facility org unit ID from the facility name
      if (facilityName) {
        const orgUnitId = await fetchOrgUnitIdByName(facilityName);
        if (orgUnitId) {
          setFacilityOrgUnitId(orgUnitId);
        } else {
          throw new Error('Could not find organization unit for the facility');
        }
      } else {
        throw new Error('Facility name is required');
      }
      
      // 3.1 Add facility to Screening org unit group
      const credentials = localStorage.getItem('userCredentials');
      const nextGroupId = 'nDAvPPtYHQP';
      const nextGroupName = 'Screening Review';
      
      // 3.2 First get the current group members
      const getResponse = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnitGroups/${nextGroupId}?fields=id,name,organisationUnits[id]`,
        {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      if (!getResponse.ok) {
        throw new Error('Failed to fetch current group members');
      }

      const groupData = await getResponse.json();

      // 3.3 Check if facility is already in group
      const isAlreadyMember = groupData.organisationUnits?.some(ou => ou.id === orgUnitId) || false;

      if (isAlreadyMember) {
        console.log('Facility is already in the target group');
        setErrorMessage(`Facility already in ${nextGroupName} stage`);
      }

      // 3.4 Prepare updated organisationUnits array
      const updatedOrgUnits = [
        ...(groupData.organisationUnits || []),
        { id: orgUnitId }
      ];

      // 3.4 Update the group with all facilities
      const groupResponse = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnitGroups/${nextGroupId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: nextGroupId,
            name: nextGroupName,
            shortName: nextGroupName,
            organisationUnits: updatedOrgUnits
          })
        }
      );

      if (!groupResponse.ok) {
        throw new Error(`Failed to add facility to ${nextGroupName} group`);
      }

      console.log(`Facility successfully added to ${nextGroupName} group`);

      // 4. Send email to user
      const emailResponse = await fetch('https://qimsdev.5am.co.bw/email2/api/facility-reg-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'qimsmohbots@gmail.com',
          subject: 'Application Received',
          message: 'Your Application Has Been Received, we will contact you soon',
        }),
      });
      
      if (!emailResponse.ok) {
        console.error('Failed to send email notification, but continuing with submission');
      }

      // 5. Show success feedback
      setSubmitSuccess(true);
      // 6. Disable and toggle button
      setSubmitInProgress(false);
      // 7. Set isInScreeningGroup to true to disable Save Changes button
      setIsInScreeningGroup(true);
      // 8. Close the form after successful submission
      setTimeout(() => {
        handleClose();
      }, 2000); // Close after 2 seconds to allow user to see success message
    } catch (err) {
      setSubmitError(err.message || 'Save or submission failed');
      setSubmitInProgress(false);
    }
  };

  // Cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
  };

  if (!open) return null;

  // Debug check for isEditMode
  if (isEditMode === undefined) {
    console.error("isEditMode prop is undefined in EditFacilityOwnershipDialog");
  }

  return (
    <ModalPortal open={open} onClose={handleClose}>
      {/* Loading overlay during submission */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10002,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            minWidth: '300px'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '500',
              marginBottom: '20px',
              color: '#333'
            }}>
              {isEditMode ? 'Updating Facility Ownership...' : 'Adding Facility Ownership...'}
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e0e0e0',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1976d2',
                animation: 'loading-bar 1.5s ease-in-out infinite'
              }} />
            </div>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              Please wait while we process your request...
            </div>
          </div>
        </div>
      )}

      <div className="modal-content" style={{ 
        padding: '0', 
        maxWidth: '700px',
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10001
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '400px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid #eee',
                paddingBottom: '16px'
              }}>
                <span style={{ 
                  fontSize: '24px', 
                  color: '#f57c00',
                  marginRight: '8px'
                }}>⚠️</span>
                <h3 style={{ 
                  margin: 0, 
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>Confirm Submission</h3>
              </div>
              
              <p style={{ 
                margin: '0 0 8px 0',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#555'
              }}>
                You are about to submit this application for review. Once submitted:
              </p>
              
              <ul style={{
                margin: '0 0 16px 0',
                paddingLeft: '20px',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#555'
              }}>
                <li>You will not be able to make further edits to this information</li>
                <li>Your application will be sent for official review</li>
                <li>You will receive confirmation via email</li>
              </ul>
              
              <p style={{ 
                margin: '0 0 16px 0',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Are you sure you want to proceed?
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                borderTop: '1px solid #eee',
                paddingTop: '16px'
              }}>
                <button 
                  onClick={handleCancelConfirmation}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#555',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmedSubmit}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#2e7d32',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)'
                  }}
                >
                  Yes, Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

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
          }}>{isEditMode ? 'Edit Facility Ownership' : 'Add Facility Ownership'}</h5>
          <button 
            type="button" 
            className="close-btn" 
            onClick={handleClose} 
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
            {errorMessage && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '20px',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: errorMessage.includes('successfully') ? '#e8f5e9' : '#ffebee',
                color: errorMessage.includes('successfully') ? '#2e7d32' : '#c62828',
                border: `1px solid ${errorMessage.includes('successfully') ? '#a5d6a7' : '#ef9a9a'}`,
                display: 'flex',
                alignItems: 'center',
              }}>
                <span style={{ 
                  marginRight: '8px', 
                  fontSize: '18px' 
                }}>
                  {errorMessage.includes('successfully') ? '✓' : '⚠️'}
                </span>
                {errorMessage}
              </div>
            )}
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
                onClick={handleClose} 
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
                disabled={isSubmitting || isLoading}
                style={{ 
                  padding: '10px 24px', 
                  fontSize: '0.95rem',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#1976d2',
                  color: 'white',
                  fontWeight: '500',
                  cursor: isSubmitting || isLoading ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || isLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
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
                onClick={handleSaveAndSubmit}
              >
                {submitSuccess ? 'Application Sent' : isInScreeningGroup ? 'Already Submitted' : submitInProgress ? 'Submitting...' : 'Save & Submit Application'}
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