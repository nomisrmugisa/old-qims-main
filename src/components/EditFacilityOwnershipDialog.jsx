import React, { useState, useEffect, useCallback } from 'react';
import './EditFacilityOwnershipDialog.css'; // Use the correct CSS file
import ModalPortal from './ModalPortal';
import { FACILITY_TYPE_FIELD_ID, shouldShowDataElement, getFacilityTypeMapping, getOrderedDocumentIds } from '../utils/facilityTypeMapping';

// import NotificationPopUp from './NotificationPopUp';
import { showEmailNotificationModal } from './NotificationPopUp';

import TopLevelNotificationPortal from './TopLevelNotificationPortal';
import { StorageService } from '../services';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';


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
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [formValidation, setFormValidation] = useState({});

  const [showEmailAlert, setShowEmailAlert] = useState(false);

  console.log("🧠 Component mounted");


  const [emailStatus, setEmailStatus] = useState(null); // null, 'sending', 'sent', or 'failed'

  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [facilityTypeMapping, setFacilityTypeMapping] = useState({});
  const [orderedDocumentIds, setOrderedDocumentIds] = useState([]);

  // Load the mapping and ordered IDs when the component mounts
  useEffect(() => {
    const mapping = getFacilityTypeMapping();
    setFacilityTypeMapping(mapping);
    const orderedIds = getOrderedDocumentIds();
    setOrderedDocumentIds(orderedIds);
  }, []);

  useEffect(() => {
    console.log("DEBUG:", { open, showEmailConfirmation });
  }, [open, showEmailConfirmation]);
  

  // Fetch Program Stage Metadata for Facility Ownership
  const fetchProgramStageMetadata = useCallback(async () => {
    console.log("🛠 FACILITY OWNERSHIP: Starting to fetch program stage metadata...");

    let credentials = await StorageService.get('userCredentials');

    if (!credentials) {
      console.warn("⚠️ FACILITY OWNERSHIP: StorageService returned no credentials. Falling back to localStorage.");
      credentials = localStorage.getItem('userCredentials');
    }

    if (!credentials) {
      console.error("❌ FACILITY OWNERSHIP: No credentials found in either StorageService or localStorage");
      setErrorMessage("Authentication required. Please log in again.");
      setIsLoading(false);
      return;
    }

    console.log("✅ FACILITY OWNERSHIP: Credentials found, making API request...");

    try {
      const apiUrl = `${import.meta.env.VITE_DHIS2_URL}/api/programStages/MuJubgTzJrY?fields=name,programStageSections[name,id,dataElements[displayFormName,id,valueType,compulsory,optionSet[id,displayName,options[id,displayName,code,sortOrder]]]]`;
      console.log("🌐 FACILITY OWNERSHIP: API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Basic ${credentials}` },
      });

      console.log("📡 FACILITY OWNERSHIP: Response status:", response.status);
      console.log("📡 FACILITY OWNERSHIP: Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ FACILITY OWNERSHIP: API Error Response:", errorText);
        throw new Error(`Failed to fetch metadata: ${response.status} - ${response.statusText}`);
      }

      const metadata = await response.json();
      console.log("✅ FACILITY OWNERSHIP: Metadata received:", metadata);
      console.log("📋 FACILITY OWNERSHIP: Program stage sections:", metadata.programStageSections?.length || 0);

      setProgramStageMetadata(metadata);
      console.log("✅ FACILITY OWNERSHIP: Metadata set successfully");

    } catch (error) {
      console.error("❌ FACILITY OWNERSHIP: Fetch error:", error);
      setErrorMessage(`Failed to load form metadata: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log("🏁 FACILITY OWNERSHIP: Metadata fetch completed");
    }
  }, []);

  // Function to check if the facility is already in the screening group
  const checkIfInScreeningGroup = useCallback(async () => {
    if (!event || !event.orgUnit) return;

    const credentials = await StorageService.get('userCredentials');
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
    console.log("🔄 FACILITY OWNERSHIP: useEffect triggered, open =", open);

    async function repopulateLocalStorage() {
      // Example: Fetch user info and org unit as on page load
      try {
        // Fetch user credentials (assume already in memory or session)
        const userCredentials = sessionStorage.getItem('userCredentials') || await StorageService.get('userCredentials');
        if (userCredentials) await StorageService.set('userCredentials', userCredentials);

        // Fetch user org unit
        const credentials = userCredentials;
        if (credentials) {
          const meRes = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me.json`, {
            headers: { Authorization: `Basic ${credentials}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const orgUnitId = meData.organisationUnits?.[0]?.id;
            if (orgUnitId) localStorage.setItem('userOrgUnitId', orgUnitId);
          }
        }

        // Set trackedEntityInstanceId if available in session or props
        const tei = sessionStorage.getItem('trackedEntityInstanceId') || sessionStorage.getItem('tempTrackedEntityInstanceId');
        if (tei) localStorage.setItem('trackedEntityInstanceId', tei);
      } catch (err) {
        // Handle errors silently
      }
    }

    if (open) {
      document.body.style.overflow = 'hidden';

      // Don't clear all localStorage - preserve credentials and important data
      // localStorage.clear(); // This was clearing credentials needed for API calls!
      console.log("🚀 FACILITY OWNERSHIP: Dialog opened, initializing...");

      repopulateLocalStorage();
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
    } else {
      // Unfreeze background
      document.body.style.overflow = 'auto';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
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
        const credentials = await StorageService.get('userCredentials');
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
    const credentials = await StorageService.get('userCredentials');
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
    const { getCredentials } = await import('../utils/credentialHelper');
    const credentials = await getCredentials();
    if (!credentials) {
      setErrorMessage("Authentication required. Please log in again.");
      setIsSubmitting(false);
      return;
    }
    try {
      console.log("Form submission started", { isEditMode, hasEvent: !!event });

      const dataValues = [
        ...Object.entries(formData)
          .filter(([, value]) => value !== null && value !== '')
          .map(([dataElement, value]) => ({
            dataElement,
            value: value.toString(),
          }))
      ];

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

        const response = await fetch(`/api/events/${event.event}`, {
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
        }, 3000);
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

          const teiResponse = await fetch(`/api/trackedEntityInstances?ou=${orgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=trackedEntityInstance&paging=false`, {
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

        const response = await fetch(`/api/events`, {
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
        }, 3000);
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
    const { getCredentials } = await import('../utils/credentialHelper');
    const credentials = await getCredentials();
    if (!credentials) {
      console.error('❌ NO CREDENTIALS FOUND');
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
        url: `/api/me?fields=organisationUnits[id,name]`,
        method: fetchConfig.method,
        headers: Object.keys(fetchConfig.headers)
      });

      // Perform the fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      const response = await fetch(
        `/api/me?fields=organisationUnits[id,name]`,
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
      <div className="file-input-wrapper">
        <span>{de.displayFormName}{de.compulsory && <span style={{ color: '#d32f2f', marginLeft: '3px' }}>*</span>}</span>
        <div>
        {formData[de.id] ? (
          <>
              <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href={`/api/fileResources/${formData[de.id]}/data`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center'
              }}
            >
                  Download current file
            </a>
              <button
                type="button"
              style={{
                color: '#d32f2f',
                background: 'none',
                border: 'none',
                    padding: '0',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
              onClick={() => handleRemoveFile(de)}
            >
              Remove
            </button>
              </div>
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
                className="custom-file-upload"
            >
              Choose File
            </label>
            </>
                )}
              </div>
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

    const selectedFacilityType = formData[FACILITY_TYPE_FIELD_ID];
    
    // Check if we have any file upload fields
    const hasFileUploads = programStageMetadata.programStageSections.some(section => 
      section.dataElements.some(de => isFileValueType(de.valueType))
    );
    
    // Find the Licence Holder Details section
    const licenceHolderSection = programStageMetadata.programStageSections.find(
      section => section.name && section.name.includes("Licence Holder Details")
    );
    
    // Find the section that contains file uploads (this is the one showing at the top)
    const fileUploadSection = programStageMetadata.programStageSections.find(
      section => section.name && (
        section.name.includes("Letters") || 
        section.name.includes("Upload") || 
        section.name.includes("Document") ||
        section.dataElements.some(de => isFileValueType(de.valueType))
      )
    );
    
    // Get all other sections except the licence holder section and file upload section
    const otherSections = programStageMetadata.programStageSections.filter(
      section => section !== licenceHolderSection && section !== fileUploadSection
    );

    // Collect all file upload elements for the dedicated section
    const fileUploadElements = programStageMetadata.programStageSections.flatMap(section => 
      section.dataElements.filter(de => isFileValueType(de.valueType))
    );
    
    return (
      <div className="dynamic-form-body">
        {/* Render Licence Holder Details section first if it exists */}
        {licenceHolderSection && (
          <div key={licenceHolderSection.id} className="section-group">
            {licenceHolderSection.name && (
              <h4>
                {licenceHolderSection.name}
                {isComplianceSection(licenceHolderSection) && (
                  <span style={{
                    fontSize: '0.8em',
                    fontWeight: 'normal',
                    marginLeft: '10px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    (Read Only)
                  </span>
                )}
              </h4>
            )}
            {licenceHolderSection.dataElements
              .filter(de => !isFileValueType(de.valueType))
              .map(de => (
              shouldHideField(de) ? null : (
                <div key={de.id} className="form-group">
                  <label>
                    {de.displayFormName}{de.compulsory && <span style={{ color: '#d32f2f', marginLeft: '3px' }}>*</span>}
                  </label>
                  {isComplianceSection(licenceHolderSection) ? (
                    // Render read-only fields for compliance section
                    <div className="form-control-readonly">
                      {formData[de.id] || '-'}
                    </div>
                  ) : (
                    // Normal editable fields for non-compliance sections
                    de.valueType === 'NUMBER' ? (
                      <input
                        type="number"
                        className="form-control"
                        value={formData[de.id] || ''}
                        onChange={e => handleInputChange(de.id, e.target.value)}
                        required={true}
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
                          boxSizing: 'border-box',
                          height: '36px'
                        }}
                      >
                        <option value="">Select {de.displayFormName}</option>
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
                  {formValidation[de.id] && (
                    <div className="field-error">{formValidation[de.id]}</div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
        
        {/* Then render the Required Uploads section if there are any file uploads */}
        {fileUploadElements.length > 0 && (
          <div className="section-group">
            <h4>Required Uploads</h4>
            <div style={{ 
              padding: "10px 20px",
              display: "table",
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 10px"
            }}>
              {fileUploadElements.map(de => (
                <div key={de.id} style={{ display: "table-row" }}>
                  <div style={{ 
                    display: "table-cell", 
                    padding: "8px 0",
                    verticalAlign: "middle",
                    width: "70%",
                    textAlign: "left"
                  }}>
                    <span style={{
                      color: "#495057",
                      fontWeight: "500",
                      fontSize: "0.85rem",
                      lineHeight: "1.4",
                      wordWrap: "break-word",
                      whiteSpace: "normal"
                    }}>
                      {de.displayFormName}
                      {de.compulsory && <span style={{ color: '#d32f2f', marginLeft: '3px' }}>*</span>}
                    </span>
                  </div>
                  <div style={{ 
                    display: "table-cell", 
                    padding: "8px 0",
                    verticalAlign: "middle",
                    width: "30%",
                    textAlign: "right"
                  }}>
                        {formData[de.id] ? (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <a
                              href={`/api/fileResources/${formData[de.id]}/data`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#1976d2',
                                textDecoration: 'none',
                            fontWeight: '500'
                              }}
                            >
                          Download
                            </a>
                              <button
                                type="button"
                                style={{
                            color: '#d32f2f',
                                  background: 'none',
                                  border: 'none',
                            padding: '0',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  textDecoration: 'underline'
                                }}
                          onClick={() => handleRemoveFile(de)}
                              >
                          Remove
                              </button>
                          </div>
                        ) : (
                      <>
                        <input
                          id={`file-input-${de.id}`}
                          type="file"
                          style={{ display: 'none' }}
                          onChange={e => handleFileUpload(de, e.target.files[0])}
                          required={de.compulsory}
                          disabled={fileUploadStatus[de.id]?.uploading}
                        />
                        <label
                          htmlFor={`file-input-${de.id}`}
                          className="custom-file-upload"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                      </div>
                      </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Then render all other sections */}
        {otherSections.map(section => (
          <div key={section.id} className="section-group">
            {section.name && (
              <h4>
                {section.name}
                {isComplianceSection(section) && (
                  <span style={{
                    fontSize: '0.8em',
                    fontWeight: 'normal',
                    marginLeft: '10px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    (Read Only)
                  </span>
                )}
              </h4>
            )}
            {section.dataElements
              .filter(de => !isFileValueType(de.valueType))
              .map(de => (
              shouldHideField(de) ? null : (
                <div key={de.id} className="form-group">
                  <label>
                    {de.displayFormName}{de.compulsory && <span style={{ color: '#d32f2f', marginLeft: '3px' }}>*</span>}
                  </label>
                  {isComplianceSection(section) ? (
                    // Render read-only fields for compliance section
                    <div className="form-control-readonly">
                      {formData[de.id] || '-'}
                      </div>
                  ) : (
                    // Normal editable fields for non-compliance sections
                    de.valueType === 'NUMBER' ? (
                      <input
                        type="number"
                        className="form-control"
                        value={formData[de.id] || ''}
                        onChange={e => handleInputChange(de.id, e.target.value)}
                        required={true}
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
                        required={true}
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
                  {formValidation[de.id] && (
                    <div className="field-error">{formValidation[de.id]}</div>
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
      const credentials = await StorageService.get('userCredentials');
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
    // setEmailStatus(null);
    sessionStorage.removeItem('currentFacilityName');
    onClose();
  };

  // Actual submission after confirmation
  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    setSubmitInProgress(true);
    setSubmitError(null);
    setEmailStatus(null);
    try {
      // 1. Get facility name from sessionStorage
      const { getCredentials } = await import('../utils/credentialHelper');
      let credentials = await getCredentials();

      if (!credentials) {
        throw new Error('No credentials available. Please log in again.');
      }

      console.log('🔐 Using credentials for /api/me call:', !!credentials);
      const meRes = await fetch(`/api/me?fields=id,organisationUnits[id,displayName]`, {
        headers: { Authorization: `Basic ${credentials}` },
      });
      if (!meRes.ok) throw new Error('Failed to fetch user info from /api/me');
      const meData = await meRes.json();
      const orgUnit = (meData.organisationUnits && meData.organisationUnits[0]) || null;
      if (!orgUnit) throw new Error('No organisation unit found for user');
      const orgUnitId = orgUnit.id;
      const facilityName = orgUnit.displayName;
      // setFacilityOrgUnitId(orgUnitId); // This line is removed


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
          // setFacilityOrgUnitId(orgUnitId); // This line is removed
        } else {
          throw new Error('Could not find organization unit for the facility');
        }
      } else {
        throw new Error('Facility name is required');
      }

      // 3.1 Add facility to Screening org unit group

      // Use the same credentials we got earlier
      if (!credentials) {
        console.error("❌ FACILITY OWNERSHIP: No credentials available");
        setErrorMessage("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }

      const nextGroupId = 'nDAvPPtYHQP';
      const nextGroupName = 'Screening Review';

      // 3.2 First get the current group members
      const getResponse = await fetch(
        `/api/organisationUnitGroups/${nextGroupId}?fields=id,name,organisationUnits[id]`,
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
        `/api/organisationUnitGroups/${nextGroupId}`,
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

      // 4. Send email to user and reviewers
      setEmailStatus('sending');
      try {
        // 4.1 Get the current user's username from /api/me
        const meEmailRes = await fetch(`/api/me?fields=username`, {
          headers: { Authorization: `Basic ${credentials}` },
        });
        let userEmail = '';
        if (meEmailRes.ok) {
          const meEmailData = await meEmailRes.json();
          userEmail = meEmailData.username || '';
        }

        // 4.2 Fetch reviewer/official emails from DHIS2 user group
        const reviewersRes = await fetch(`/api/users?fields=email,userGroups[id]&filter=userGroups.id:eq:cxNjCzLB6tI&paging=false`, {
          headers: { Authorization: `Basic ${credentials}` },
        });
        let reviewerEmails = [];
        if (reviewersRes.ok) {
          const reviewersData = await reviewersRes.json();
          if (reviewersData.users && Array.isArray(reviewersData.users)) {
            reviewerEmails = reviewersData.users
              .map(u => u.email)

              .filter(email => email && email !== userEmail);
          }
        }

        // 4.3 Combine all emails (no duplicates)
        const emails = [userEmail, "qimsmohbots@gmail.com", ...reviewerEmails].filter((v, i, a) => v && a.indexOf(v) === i);

        // 4.4 Send POST to /email2/api/facility-reg-update
        const emailResponse = await fetch(`/email2/api/facility-reg-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emails }),
        });

        const result = await emailResponse.json().catch(() => ({})); // handle non-JSON

        console.log("📧 Email response status:", emailResponse.status);
        console.log("📧 Email response ok:", emailResponse.ok);
        console.log("📧 Email response body:", result);

        if (emailResponse.ok) {
          console.log("✅ Email sent successfully. Showing modal...");
          showEmailNotificationModal(); // ✅ TRIGGER MODAL directly
        }
        setEmailStatus('sent');

        setShowEmailConfirmation(true);

      } catch (emailErr) {
        console.error('Error sending email notification:', emailErr);
      }

      setShowEmailSent(true);
      console.log(`Email Sent Status:`, showEmailSent);

      // 5. Show success feedback
      setSubmitSuccess(true);
      // 6. Disable and toggle button
      setSubmitInProgress(false);
      // 7. Set isInScreeningGroup to true to disable Save Changes button
      setIsInScreeningGroup(true);
      // 8. Close the form after successful submission
      // setTimeout(() => {
      //   handleClose();
      // }, 5000); // Close after 2 seconds to allow user to see success message
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

  useEffect(() => {
    if (showEmailSent) {
      console.log("✅ Modal should now show because showEmailSent is true");
    }
  }, [showEmailSent]);


  return (
    <>

      
      {/* <ModalPortal open={open} onClose={handleClose}> */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            width: '1200px',          // increased width
            maxWidth: '98%',          // responsive fallback
            margin: 'auto',           // center horizontally
            minWidth: '300px',        // minimum width
          }
        }}
      >
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

        <div className="modal-content">
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

          <div className="modal-header">
            <h5 className="modal-title">{isEditMode ? 'Edit Facility Ownership' : 'Add Facility Ownership'}</h5>

            <button
              type="button"
              className="close-btn"
              onClick={handleClose}
              disabled={isSubmitting}
            >&times;</button>
          </div>
          <div className="modal-body" style={{
            position: 'relative',
            padding: '20px',
            maxHeight: '70vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            maxWidth: '100%',
            width: '100%'
          }}>
            <form onSubmit={handleSubmit} className="ownership-form">
              {errorMessage && (
                <div className={`alert ${errorMessage.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
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
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || isLoading}
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
                  className={`btn ${submitSuccess || isInScreeningGroup ? 'btn-secondary' : 'btn-primary'}`}
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

      </Dialog>
      {/* </ModalPortal> */}

      {showEmailSent && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '24px',
          backgroundColor: '#4caf50',
          color: 'white',
          borderRadius: '8px',
          zIndex: 15000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: '16px',
          fontWeight: 500,
        }}>
          ✅ Email notification sent.
        </div>,
        document.body
      )}

      

    </>
  );
};

export default EditFacilityOwnershipDialog; 
