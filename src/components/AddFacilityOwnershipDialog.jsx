import React, { useState, useEffect } from 'react';
import './AddFacilityOwnershipDialog.css'; // We'll create this CSS file next
import ModalPortal from './ModalPortal';

const AddFacilityOwnershipDialog = ({ open, onClose, onSuccess, onAddSuccess, trackedEntityInstanceId }) => {
  const [newFormData, setNewFormData] = useState({
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
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldStates, setFieldStates] = useState({}); // Track individual field states
  const [currentEventId, setCurrentEventId] = useState(null); // Track created event for real-time updates
  
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
  
  // Prevent scrolling on the main body when the modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [open]);

  // Create initial event when form opens (if we have required data)
  useEffect(() => {
    if (open && !currentEventId && trackedEntityInstanceId) {
      createInitialEvent();
    }
  }, [open, trackedEntityInstanceId, currentEventId]);

  // Function to create initial event for real-time updates
  const createInitialEvent = async () => {
    try {
      const credentials = localStorage.getItem('userCredentials');
      if (!credentials) return;

      const orgUnitId = await getCurrentUserOrgUnit();
      const enrollmentId = await getEnrollmentIdForProgram(trackedEntityInstanceId);
      const today = new Date().toISOString().split('T')[0];

      const payload = {
        eventDate: today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY",
        enrollment: enrollmentId,
        status: "ACTIVE", // Start as ACTIVE, will be COMPLETED when form is filled
        trackedEntityInstance: trackedEntityInstanceId,
        dataValues: []
      };

      const eventRes = await fetch("/api/events", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (eventRes.ok) {
        const eventResponse = await eventRes.json();
        const eventId = eventResponse.response?.reference || eventResponse.eventUid || eventResponse.uid;
        setCurrentEventId(eventId);
        console.log("Initial event created:", eventId);
      }
    } catch (error) {
      console.error("Error creating initial event:", error);
    }
  };

  // Function to update individual field value in real-time
  const updateSingleField = async (fieldName, value) => {
    const dataElementId = fieldToDataElementMap[fieldName];
    if (!dataElementId || !currentEventId) return;

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
      // For file fields, we need to upload the file first
      let finalValue = value;
      if (fieldName.includes('File') || fieldName.includes('Reference') || fieldName.includes('Permit') || fieldName.includes('Passport') || fieldName.includes('Certificates') || fieldName.includes('Waiver')) {
        if (value && value instanceof File) {
          finalValue = await uploadFileAndGetId(value);
        } else {
          finalValue = null;
        }
      }

      // Get current organization unit
      const orgUnitId = await getCurrentUserOrgUnit();

      // Use the exact API template from api-archives
      const payload = {
        event: currentEventId,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "MuJubgTzJrY", // Facility Ownership program stage
        status: "ACTIVE",
        trackedEntityInstance: trackedEntityInstanceId,
        dataValues: [
          {
            dataElement: dataElementId,
            value: finalValue ? finalValue.toString() : "",
            providedElsewhere: false
          }
        ]
      };

      console.log(`Updating field ${fieldName}:`, payload);

      // Use the specific endpoint from api-archives template
      const response = await fetch(`/api/events/${currentEventId}/${dataElementId}`, {
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    const newValue = type === 'file' ? files[0] : value;
    
    setNewFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Update field in real-time if we have an event
    if (currentEventId) {
      if (type === 'file') {
        // For files, update immediately
        updateSingleField(name, newValue);
      } else {
        // For text inputs, debounce the update
        debounceUpdateField(name, newValue);
      }
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

  // Note: We let DHIS2 generate UIDs on the server side

  // Function to get the current user's organization unit
  const getCurrentUserOrgUnit = async () => {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    try {
      const response = await fetch("/api/me.json", {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user information: ${response.status}`);
      }
      
      const userData = await response.json();
      
      // Check if the user has an organization unit
      if (!userData.organisationUnits || userData.organisationUnits.length === 0) {
        throw new Error("User has no associated organization units");
      }
      
      // Return the ID of the first organization unit (primary org unit)
      return userData.organisationUnits[0].id;
    } catch (error) {
      console.error("Error fetching user organization unit:", error);
      throw error;
    }
  };
  
  // Function to get the tracked entity instance ID for the current organization unit
  const getTrackedEntityInstanceId = async (orgUnitId) => {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    try {
      // Use the API to fetch tracked entity instances for the given org unit and program
      const url = `/api/trackedEntityInstances.json?ou=${orgUnitId}&fields=trackedEntityInstance&program=EE8yeLVo6cN`;
      console.log("Fetching tracked entity instances from:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tracked entity instances: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Tracked entity instances response:", data);
      
      // Check if any tracked entity instances were found
      if (!data.trackedEntityInstances || data.trackedEntityInstances.length === 0) {
        throw new Error("No tracked entity instances found for this organization unit and program");
      }
      
      // Return the ID of the first tracked entity instance
      return data.trackedEntityInstances[0].trackedEntityInstance;
    } catch (error) {
      console.error("Error fetching tracked entity instance ID:", error);
      throw error;
    }
  };

  // Get enrollment ID for the specific program from the tracked entity instance
  const getEnrollmentIdForProgram = async (teiId, programId = "EE8yeLVo6cN") => {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required");
    }

    if (!teiId) {
      throw new Error("Tracked entity instance ID is required");
    }

    console.log(`Fetching enrollment ID for TEI: ${teiId} and program: ${programId}`);
    
    const enrollmentUrl = `/api/trackedEntityInstances/${teiId}?fields=enrollments[program,enrollment]`;
    
    const enrollmentRes = await fetch(enrollmentUrl, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    
    if (!enrollmentRes.ok) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentRes.status}`);
    }
    
    const enrollmentData = await enrollmentRes.json();
    console.log("Enrollment API response:", enrollmentData);
    
    if (!enrollmentData.enrollments || enrollmentData.enrollments.length === 0) {
      throw new Error("No enrollments found for this tracked entity instance");
    }
    
    // Filter for the specific program
    const programEnrollment = enrollmentData.enrollments.find(enrollment => 
      enrollment.program === programId
    );
    
    if (!programEnrollment) {
      throw new Error(`No enrollment found for program ${programId}`);
    }
    
    console.log("Found enrollment for program:", programEnrollment);
    return programEnrollment.enrollment;
  };
  
  // Function to upload file and get file resource ID
  const uploadFileAndGetId = async (file) => {
    if (!file) return null;
    const credentials = localStorage.getItem('userCredentials');
    const fileData = new FormData();
    fileData.append("file", file);
    
    try {
      const fileRes = await fetch("/api/fileResources", {
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
      throw error; // Re-throw to be caught by handleAddSubmit
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 === ADD BUTTON CLICKED ===");
    console.log("- Event object:", e);
    console.log("- Form data:", newFormData);
    console.log("- Is form valid:", isFormValid);
    
    setErrorMessage(""); // Clear previous errors
    setIsLoading(true);
    
    const credentials = localStorage.getItem('userCredentials');
    console.log("- Has credentials:", !!credentials);

    if (!credentials) {
      setErrorMessage("Authentication required. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      // Get the organization unit ID from the API instead of localStorage
      const orgUnitId = await getCurrentUserOrgUnit();
      console.log("Retrieved organization unit ID:", orgUnitId);
      
      // Get the tracked entity instance ID from the API instead of props
      let teiId = trackedEntityInstanceId;
      if (!teiId) {
        try {
          teiId = await getTrackedEntityInstanceId(orgUnitId);
          console.log("Retrieved tracked entity instance ID:", teiId);
        } catch (error) {
          console.error("Could not fetch tracked entity instance ID:", error);
          setErrorMessage(`Could not fetch facility information: ${error.message}`);
          return;
        }
      }
      
      // 1. Upload all files in parallel
      const [ 
        copyOfIdPassportId,
        professionalReference1Id,
        professionalReference2Id,
        qualificationCertificatesId,
        validRecentPermitId,
        workPermitWaiverId,
      ] = await Promise.all([
        uploadFileAndGetId(newFormData.copyOfIdPassport),
        uploadFileAndGetId(newFormData.professionalReference1),
        uploadFileAndGetId(newFormData.professionalReference2),
        uploadFileAndGetId(newFormData.qualificationCertificates),
        uploadFileAndGetId(newFormData.validRecentPermit),
        uploadFileAndGetId(newFormData.workPermitWaiver),
      ]);

      // We'll let DHIS2 generate the event ID
      const today = new Date().toISOString().split('T')[0];
      
      // Get the enrollment ID for this TEI and program
      const enrollmentId = await getEnrollmentIdForProgram(teiId);
      console.log("Retrieved enrollment ID:", enrollmentId);

      // Build data values array, only including non-empty values
      const dataValues = [];
      
      // Add required text fields
      if (newFormData.firstName) dataValues.push({ dataElement: "HMk4LZ9ESOq", value: newFormData.firstName });
      if (newFormData.surname) dataValues.push({ dataElement: "ykwhsQQPVH0", value: newFormData.surname });
      if (newFormData.citizen) dataValues.push({ dataElement: "zVmmto7HwOc", value: newFormData.citizen });
      if (newFormData.id) dataValues.push({ dataElement: "aUGSyyfbUVI", value: newFormData.id });
      if (newFormData.idType) dataValues.push({ dataElement: "FLcrCfTNcQi", value: newFormData.idType });
      if (newFormData.ownershipType) dataValues.push({ dataElement: "vAHHXaW0Pna", value: newFormData.ownershipType });
      
      // Add file references if they exist
      if (copyOfIdPassportId) dataValues.push({ dataElement: "KRj1TOR5cVM", value: copyOfIdPassportId });
      if (professionalReference1Id) dataValues.push({ dataElement: "yP49GKSQxPl", value: professionalReference1Id });
      if (professionalReference2Id) dataValues.push({ dataElement: "lC217zTgC6C", value: professionalReference2Id });
      if (qualificationCertificatesId) dataValues.push({ dataElement: "pelCBFPIFY1", value: qualificationCertificatesId });
      if (validRecentPermitId) dataValues.push({ dataElement: "cUObXSGtCuD", value: validRecentPermitId });
      if (workPermitWaiverId) dataValues.push({ dataElement: "g9jXH9LJyxU", value: workPermitWaiverId });

      // Create the payload following DHIS2 standard format for single event
      const payload = {
          eventDate: today,
          orgUnit: orgUnitId,
          program: "EE8yeLVo6cN",
          programStage: "MuJubgTzJrY",
          enrollment: enrollmentId,
        status: "COMPLETED",
          trackedEntityInstance: teiId,
        dataValues: dataValues
      };

      console.log("🌐 === ABOUT TO MAKE POST REQUEST ===");
      console.log("- Endpoint: POST /api/events");
      console.log("- Payload:", payload);
      console.log("- Headers:", {
        Authorization: `Basic ${credentials.substring(0, 10)}...`,
        "Content-Type": "application/json"
      });

      const eventRes = await fetch("/api/events", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      console.log("📡 === POST REQUEST COMPLETED ===");
      console.log("- Response status:", eventRes.status);
      console.log("- Response ok:", eventRes.ok);

      if (!eventRes.ok) {
        const errorText = await eventRes.text();
        console.error("Event creation failed with response:", errorText);
        throw new Error(`Event creation failed: ${eventRes.status} - ${errorText}`);
      }

      const eventResponse = await eventRes.json();
      console.log("Event created successfully:", eventResponse);
      
      // Store the organization unit ID in localStorage for other components to use
      localStorage.setItem('userOrgUnitId', orgUnitId);
      
      // Call success callback to reload data in parent
      // Support both onSuccess (from RegistrationDetails) and onAddSuccess (for backward compatibility)
      if (typeof onSuccess === 'function') {
        onSuccess();
      } else if (typeof onAddSuccess === 'function') {
        onAddSuccess();
      }
      
      onClose(); // Close modal on successful addition

    } catch (error) {
      console.error("Error creating new facility ownership:", error);
      setErrorMessage(`Failed to add facility ownership: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = (
    newFormData.firstName &&
    newFormData.surname &&
    newFormData.citizen &&
    newFormData.ownershipType &&
    newFormData.idType &&
    newFormData.id
  );
  
  console.log("📋 === FORM VALIDATION STATUS ===");
  console.log("- firstName:", newFormData.firstName);
  console.log("- surname:", newFormData.surname);
  console.log("- citizen:", newFormData.citizen);
  console.log("- ownershipType:", newFormData.ownershipType);
  console.log("- idType:", newFormData.idType);
  console.log("- id:", newFormData.id);
  console.log("- isFormValid:", isFormValid);

  // Handle cancel button - refresh table and close
  const handleCancel = () => {
    console.log("AddFacilityOwnershipDialog handleCancel called");
    console.log("- onSuccess exists:", typeof onSuccess === 'function');
    console.log("- onAddSuccess exists:", typeof onAddSuccess === 'function');
    console.log("- onClose exists:", typeof onClose === 'function');
    
    // Refresh the parent table to reflect any real-time updates made during adding
    if (typeof onSuccess === 'function') {
      console.log("- Calling onSuccess to refresh table");
      onSuccess();
    } else if (typeof onAddSuccess === 'function') {
      console.log("- Calling onAddSuccess to refresh table");
      onAddSuccess();
    }
    
    // Call onClose to close the dialog
    if (typeof onClose === 'function') {
      console.log("- Calling onClose to close dialog");
      onClose();
    }
  };

  return (
    <ModalPortal open={open} onClose={handleCancel}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Add New Facility Ownership</h5>
          <button type="button" className="close-btn" onClick={handleCancel}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleAddSubmit} className="facility-ownership-form">
            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="firstName" value={newFormData.firstName} onChange={handleInputChange} className="form-control" required />
              {getFieldStatusIndicator('firstName')}
            </div>
            <div className="form-group">
              <label>Surname:</label>
              <input type="text" name="surname" value={newFormData.surname} onChange={handleInputChange} className="form-control" required />
              {getFieldStatusIndicator('surname')}
            </div>
            <div className="form-group">
              <label>Citizen:</label>
              <input type="text" name="citizen" value={newFormData.citizen} onChange={handleInputChange} className="form-control" required />
              {getFieldStatusIndicator('citizen')}
            </div>
            <div className="form-group">
              <label>Ownership Type:</label>
              <select name="ownershipType" value={newFormData.ownershipType} onChange={handleInputChange} className="form-control" required>
                <option value="">Select Ownership Type</option>
                <option value="State Owned">State Owned</option>
                <option value="Private Owned">Private Owned</option>
              </select>
              {getFieldStatusIndicator('ownershipType')}
            </div>
            <div className="form-group">
              <label>ID Type:</label>
              <input type="text" name="idType" value={newFormData.idType} onChange={handleInputChange} className="form-control" required />
              {getFieldStatusIndicator('idType')}
            </div>
            <div className="form-group">
              <label>ID:</label>
              <input type="text" name="id" value={newFormData.id} onChange={handleInputChange} className="form-control" required />
              {getFieldStatusIndicator('id')}
            </div>

            {/* File Inputs */}
            <div className="form-group">
              <label>Copy of ID/Passport:</label>
              <div className="file-input-wrapper">
                <input type="file" name="copyOfIdPassport" id="copyOfIdPassport" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="copyOfIdPassport" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.copyOfIdPassport ? newFormData.copyOfIdPassport.name : 'No file chosen'}</span>
              </div>
              {getFieldStatusIndicator('copyOfIdPassport')}
            </div>
            <div className="form-group">
              <label>Professional Reference 1:</label>
              <div className="file-input-wrapper">
                <input type="file" name="professionalReference1" id="professionalReference1" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="professionalReference1" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.professionalReference1 ? newFormData.professionalReference1.name : 'No file chosen'}</span>
              </div>
              {getFieldStatusIndicator('professionalReference1')}
            </div>
            <div className="form-group">
              <label>Professional Reference 2:</label>
              <div className="file-input-wrapper">
                <input type="file" name="professionalReference2" id="professionalReference2" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="professionalReference2" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.professionalReference2 ? newFormData.professionalReference2.name : 'No file chosen'}</span>
              </div>
              {getFieldStatusIndicator('professionalReference2')}
            </div>
            <div className="form-group">
              <label>Qualification Certificates:</label>
              <div className="file-input-wrapper">
                <input type="file" name="qualificationCertificates" id="qualificationCertificates" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="qualificationCertificates" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.qualificationCertificates ? newFormData.qualificationCertificates.name : 'No file chosen'}</span>
              </div>
              {getFieldStatusIndicator('qualificationCertificates')}
            </div>
            <div className="form-group">
              <label>Valid Recent Permit:</label>
              <div className="file-input-wrapper">
                <input type="file" name="validRecentPermit" id="validRecentPermit" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="validRecentPermit" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.validRecentPermit ? newFormData.validRecentPermit.name : 'No file chosen'}</span>
              </div>
              {getFieldStatusIndicator('validRecentPermit')}
            </div>
            <div className="form-group">
              <label>Work Permit Waiver:</label>
              <div className="file-input-wrapper">
                <input type="file" name="workPermitWaiver" id="workPermitWaiver" onChange={handleInputChange} className="form-control-file" />
                <label htmlFor="workPermitWaiver" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.workPermitWaiver ? newFormData.workPermitWaiver.name : 'No file chosen'}</span>
              </div>
              {getFieldStatusIndicator('workPermitWaiver')}
            </div>

            <div className="button-container">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddFacilityOwnershipDialog;