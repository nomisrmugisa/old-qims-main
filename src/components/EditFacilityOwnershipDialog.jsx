import React, { useState, useEffect } from 'react';
import './EditFacilityOwnershipDialog.css'; // Use the correct CSS file
import ModalPortal from './ModalPortal';

const EditFacilityOwnershipDialog = ({ open, onClose, onUpdateSuccess, event }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    citizen: "",
    ownershipType: "",
    idType: "",
    id: "",
    copyOfIdPassport: null,
    professionalReference1: null,
    professionalReference2: null,
    qualificationCertificates: null,
    validRecentPermit: null,
    workPermitWaiver: null,
    existingFiles: {}
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldStates, setFieldStates] = useState({}); // Track individual field states (saving, saved, error)

  // Map of field names to their DHIS2 data element IDs
  const fieldToDataElementMap = {
    firstName: "HMk4LZ9ESOq",
    surname: "ykwhsQQPVH0",
    citizen: "zVmmto7HwOc",
    ownershipType: "vAHHXaW0Pna",
    idType: "FLcrCfTNcQi",
    id: "aUGSyyfbUVI",
    copyOfIdPassport: "KRj1TOR5cVM",
    professionalReference1: "yP49GKSQxPl",
    professionalReference2: "lC217zTgC6C",
    qualificationCertificates: "pelCBFPIFY1",
    validRecentPermit: "cUObXSGtCuD",
    workPermitWaiver: "g9jXH9LJyxU"
  };

  const fileFieldNames = [
    'copyOfIdPassport',
    'professionalReference1',
    'professionalReference2',
    'qualificationCertificates',
    'validRecentPermit',
    'workPermitWaiver'
  ];

  // Prevent scrolling on the main body when the modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [open]);

  useEffect(() => {
    if (event) {
      const dataValues = event.dataValues || [];
      const getValue = (dataElementId) => {
        const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
        return dataValue ? dataValue.value : "";
      };

      const initialFormData = {
        firstName: getValue("HMk4LZ9ESOq"),
        surname: getValue("ykwhsQQPVH0"),
        citizen: getValue("zVmmto7HwOc"),
        ownershipType: getValue("vAHHXaW0Pna"),
        idType: getValue("FLcrCfTNcQi"),
        id: getValue("aUGSyyfbUVI"),
      };
      
      const existingFiles = {};
      fileFieldNames.forEach(fieldName => {
        const dataElementId = fieldToDataElementMap[fieldName];
        const fileId = getValue(dataElementId);
        if (fileId) {
          existingFiles[fieldName] = fileId;
        }
        initialFormData[fieldName] = null; // Always init file inputs to null
      });

      setFormData(initialFormData);
      setUploadedFiles(existingFiles);
    }
  }, [event, open]);

  // Function to update individual field value in real-time
  const updateSingleField = async (fieldName, value) => {
    const dataElementId = fieldToDataElementMap[fieldName];
    if (!dataElementId || !event) return;

    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
      setFieldStates(prev => ({
        ...prev,
        [fieldName]: { status: 'error', message: 'Authentication required' }
      }));
      return;
    }

    // Set field as saving
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: { status: 'saving' }
    }));

    try {
      let finalValue = value;
      
      // If the field is a file field and there's a file to upload
      if (fileFieldNames.includes(fieldName) && value instanceof File) {
        finalValue = await uploadFileAndGetId(value);

        // After successful upload, update the uploadedFiles state
        if (finalValue) {
          setUploadedFiles(prev => ({ ...prev, [fieldName]: finalValue }));
        }
      }

      const orgUnitId = await getCurrentUserOrgUnit();

      const payload = {
        event: event.event,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        status: "ACTIVE", // Using ACTIVE to allow further edits
        trackedEntityInstance: event.trackedEntityInstance,
        dataValues: [
          {
            dataElement: dataElementId,
            value: finalValue ? finalValue.toString() : "",
          }
        ]
      };

      console.log(`Updating field ${fieldName}:`, payload);

      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${event.event}/${dataElementId}`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed with response:", errorText);
        throw new Error(`Failed to update ${fieldName}: ${response.status}`);
      }

      // Set field as saved
      setFieldStates(prev => ({
        ...prev,
        [fieldName]: { status: 'saved' }
      }));

      // Clear saved status after 2 seconds
      setTimeout(() => {
        setFieldStates(prev => ({
          ...prev,
          [fieldName]: { status: 'idle' }
        }));
      }, 2000);

    } catch (error) {
      console.error(`Error updating field ${fieldName}:`, error);
      setFieldStates(prev => ({
        ...prev,
        [fieldName]: { status: 'error', message: error.message }
      }));
    }
  };

  // Debounced field update for text inputs
  const debounceUpdateField = (() => {
    const timeouts = {};
    return (fieldName, value) => {
      if (timeouts[fieldName]) {
        clearTimeout(timeouts[fieldName]);
      }
      timeouts[fieldName] = setTimeout(() => {
        updateSingleField(fieldName, value);
      }, 1000); // 1 second delay
    };
  })();

  // If dialog is not open, don't render anything
  if (!open) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    const newValue = type === 'file' ? files[0] : value;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Update field in real-time
    if (type === 'file') {
      // For files, update immediately
      updateSingleField(name, newValue);
    } else {
      // For text inputs, debounce the update
      debounceUpdateField(name, newValue);
    }
  };

  const uploadFileAndGetId = async (file) => {
    if (!file) return null;
    const credentials = localStorage.getItem('userCredentials');
    const fileData = new FormData();
    fileData.append("file", file);
    
    try {
      const fileRes = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/fileResources`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: fileData,
      });

      if (!fileRes.ok) {
        const errorText = await fileRes.text();
        throw new Error(`File upload failed: ${fileRes.status} - ${errorText}`);
      }
      const responseJson = await fileRes.json();
      return responseJson.response.fileResource.id;
    } catch (error) {
      console.error("Error uploading file:", file.name, error);
      throw error;
    }
  };

  // Function to get field status indicator
  const getFieldStatusIndicator = (fieldName) => {
    const state = fieldStates[fieldName];
    if (!state || state.status === 'idle') return null;

    switch (state.status) {
      case 'saving':
        return <span className="field-status saving">💾 Saving...</span>;
      case 'saved':
        return <span className="field-status saved">✅ Saved</span>;
      case 'error':
        return <span className="field-status error">❌ Error: {state.message}</span>;
      default:
        return null;
    }
  };

  // Function to get the current user's organization unit
  const getCurrentUserOrgUnit = async () => {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me.json`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user information: ${response.status}`);
      }
      
      const userData = await response.json();
      
      if (!userData.organisationUnits || userData.organisationUnits.length === 0) {
        throw new Error("User has no associated organization units");
      }
      
      return userData.organisationUnits[0].id;
    } catch (error) {
      console.error("Error fetching user organization unit:", error);
      throw error;
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const credentials = localStorage.getItem('userCredentials');

    if (!credentials) {
      setErrorMessage("Authentication required. Please log in again.");
      return;
    }

    try {
      // Get the current user's organization unit
      const orgUnitId = await getCurrentUserOrgUnit();

      // Upload files individually and track their IDs
      const fileMapping = {};
      
      if (formData.copyOfIdPassport) {
        fileMapping.copyOfIdPassport = await uploadFileAndGetId(formData.copyOfIdPassport);
      }
      if (formData.professionalReference1) {
        fileMapping.professionalReference1 = await uploadFileAndGetId(formData.professionalReference1);
      }
      if (formData.professionalReference2) {
        fileMapping.professionalReference2 = await uploadFileAndGetId(formData.professionalReference2);
      }
      if (formData.qualificationCertificates) {
        fileMapping.qualificationCertificates = await uploadFileAndGetId(formData.qualificationCertificates);
      }
      if (formData.validRecentPermit) {
        fileMapping.validRecentPermit = await uploadFileAndGetId(formData.validRecentPermit);
      }
      if (formData.workPermitWaiver) {
        fileMapping.workPermitWaiver = await uploadFileAndGetId(formData.workPermitWaiver);
      }

      const today = new Date().toISOString().split('T')[0];
      const dataValues = [
        { dataElement: "HMk4LZ9ESOq", value: formData.firstName },
        { dataElement: "ykwhsQQPVH0", value: formData.surname },
        { dataElement: "zVmmto7HwOc", value: formData.citizen },
        { dataElement: "aUGSyyfbUVI", value: formData.id },
        { dataElement: "FLcrCfTNcQi", value: formData.idType },
        { dataElement: "vAHHXaW0Pna", value: formData.ownershipType },
      ];

      // Add file references - use new uploads or preserve existing ones
      const fileDataElements = {
        copyOfIdPassport: "KRj1TOR5cVM",
        professionalReference1: "yP49GKSQxPl",
        professionalReference2: "lC217zTgC6C",
        qualificationCertificates: "pelCBFPIFY1",
        validRecentPermit: "cUObXSGtCuD",
        workPermitWaiver: "g9jXH9LJyxU"
      };

      Object.entries(fileDataElements).forEach(([fieldName, dataElementId]) => {
        let fileId = null;
        
        // Use newly uploaded file ID if available
        if (fileMapping[fieldName]) {
          fileId = fileMapping[fieldName];
        } 
        // Otherwise preserve existing file reference
        else if (formData.existingFiles && formData.existingFiles[fieldName]) {
          fileId = formData.existingFiles[fieldName];
        }
        
        if (fileId) {
          dataValues.push({ dataElement: dataElementId, value: fileId });
        }
      });

      const payload = {
        event: event.event,
        eventDate: event.eventDate || today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        status: "COMPLETED",
        trackedEntityInstance: event.trackedEntityInstance,
        dataValues: dataValues,
      };

      console.log("Update payload:", payload);

      const eventRes = await fetch(`/api/events/${event.event}`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!eventRes.ok) {
        const errorText = await eventRes.text();
        console.error("Update failed with response:", errorText);
        throw new Error(`Event update failed: ${eventRes.status} - ${errorText}`);
      }

      console.log("Facility ownership updated successfully!");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating facility ownership:", error);
      setErrorMessage(`Failed to update facility ownership: ${error.message}`);
    }
  };

  // Handle cancel button - refresh table and close
  const handleCancel = () => {
    console.log("EditFacilityOwnershipDialog handleCancel called");
    console.log("- onUpdateSuccess exists:", typeof onUpdateSuccess === 'function');
    console.log("- onClose exists:", typeof onClose === 'function');
    
    // Refresh the parent table to reflect any real-time updates made during editing
    if (typeof onUpdateSuccess === 'function') {
      console.log("- Calling onUpdateSuccess to refresh table");
      onUpdateSuccess();
    }
    
    // Call onClose to close the dialog
    if (typeof onClose === 'function') {
      console.log("- Calling onClose to close dialog");
      onClose();
    }
  };

  return (
    <ModalPortal open={open} onClose={handleCancel}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit Facility Ownership</h5>
          <button type="button" className="close-btn" onClick={handleCancel}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-control" required onBlur={(e) => updateSingleField('firstName', e.target.value)} />
              {getFieldStatusIndicator('firstName')}
            </div>
            <div className="form-group">
              <label>Surname:</label>
              <input type="text" name="surname" value={formData.surname} onChange={handleInputChange} className="form-control" required onBlur={(e) => updateSingleField('surname', e.target.value)} />
              {getFieldStatusIndicator('surname')}
            </div>
            <div className="form-group">
              <label>Citizen:</label>
              <input type="text" name="citizen" value={formData.citizen} onChange={handleInputChange} className="form-control" required onBlur={(e) => updateSingleField('citizen', e.target.value)} />
              {getFieldStatusIndicator('citizen')}
            </div>
            <div className="form-group">
              <label>Ownership Type:</label>
              <select name="ownershipType" value={formData.ownershipType} onChange={handleInputChange} className="form-control" required onBlur={(e) => updateSingleField('ownershipType', e.target.value)}>
                <option value="">Select Ownership Type</option>
                <option value="State Owned">State Owned</option>
                <option value="Private Owned">Private Owned</option>
              </select>
              {getFieldStatusIndicator('ownershipType')}
            </div>
            <div className="form-group">
              <label>ID Type:</label>
              <input type="text" name="idType" value={formData.idType} onChange={handleInputChange} className="form-control" required onBlur={(e) => updateSingleField('idType', e.target.value)} />
              {getFieldStatusIndicator('idType')}
            </div>
            <div className="form-group">
              <label>ID:</label>
              <input type="text" name="id" value={formData.id} onChange={handleInputChange} className="form-control" required onBlur={(e) => updateSingleField('id', e.target.value)} />
              {getFieldStatusIndicator('id')}
            </div>

            {/* File Inputs */}
            {fileFieldNames.map(fieldName => (
              <div key={fieldName} className="form-group document-upload-group">
                <label>{fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    name={fieldName}
                    id={fieldName}
                    onChange={handleInputChange}
                    className="form-control-file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor={fieldName} className="custom-file-upload">Choose File</label>
                  <span className="file-name">
                    {formData[fieldName] ? formData[fieldName].name : 
                     uploadedFiles[fieldName] ? 'Document already uploaded' : 
                     'No file chosen'}
                  </span>
                </div>
                {uploadedFiles[fieldName] && !formData[fieldName] && (
                  <small className="text-success">✓ Document previously uploaded</small>
                )}
                {getFieldStatusIndicator(fieldName)}
              </div>
            ))}

            <button type="button" className="btn btn-secondary cancel-btn" onClick={handleCancel}>Close</button>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditFacilityOwnershipDialog; 