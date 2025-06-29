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
  
  // Prevent scrolling on the main body when the modal is open
  useEffect(() => {
    if (open) {
      // Disable scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
      
      // Re-enable scrolling when component is unmounted or closed
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [open]);

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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setNewFormData((prevData) => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    setIsLoading(true);
    
    const credentials = localStorage.getItem('userCredentials');

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

      // Create the payload following DHIS2 standard format
      const payload = {
        events: [{
          eventDate: today,
          orgUnit: orgUnitId,
          program: "EE8yeLVo6cN",
          programStage: "MuJubgTzJrY",
          enrollment: enrollmentId,
          status: "ACTIVE",
          trackedEntityInstance: teiId,
          dataValues: [
            { dataElement: "HMk4LZ9ESOq", value: newFormData.firstName },
            { dataElement: "ykwhsQQPVH0", value: newFormData.surname },
            { dataElement: "zVmmto7HwOc", value: newFormData.citizen },
            { dataElement: "aUGSyyfbUVI", value: newFormData.id },
            { dataElement: "FLcrCfTNcQi", value: newFormData.idType },
            { dataElement: "vAHHXaW0Pna", value: newFormData.ownershipType },
            // Add file references if they exist
            ...(copyOfIdPassportId ? [{ dataElement: "KRj1TOR5cVM", value: copyOfIdPassportId }] : []),
            ...(professionalReference1Id ? [{ dataElement: "yP49GKSQxPl", value: professionalReference1Id }] : []),
            ...(professionalReference2Id ? [{ dataElement: "lC217zTgC6C", value: professionalReference2Id }] : []),
            ...(qualificationCertificatesId ? [{ dataElement: "pelCBFPIFY1", value: qualificationCertificatesId }] : []),
            ...(validRecentPermitId ? [{ dataElement: "cUObXSGtCuD", value: validRecentPermitId }] : []),
            ...(workPermitWaiverId ? [{ dataElement: "g9jXH9LJyxU", value: workPermitWaiverId }] : []),
          ]
        }]
      };

      console.log("Event creation payload:", payload);

      const eventRes = await fetch("/api/events.json", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!eventRes.ok) {
        const errorText = await eventRes.text();
        throw new Error(`Event creation failed: ${eventRes.status} - ${errorText}`);
      }

      console.log("Event created successfully!");
      
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
    newFormData.id &&
    newFormData.copyOfIdPassport && newFormData.copyOfIdPassport.size > 0 &&
    newFormData.professionalReference1 && newFormData.professionalReference1.size > 0 &&
    newFormData.professionalReference2 && newFormData.professionalReference2.size > 0 &&
    newFormData.qualificationCertificates && newFormData.qualificationCertificates.size > 0 &&
    newFormData.validRecentPermit && newFormData.validRecentPermit.size > 0 &&
    newFormData.workPermitWaiver && newFormData.workPermitWaiver.size > 0
  );

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Add New Facility Ownership</h5>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleAddSubmit} className="facility-ownership-form">
            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="firstName" value={newFormData.firstName} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Surname:</label>
              <input type="text" name="surname" value={newFormData.surname} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Citizen:</label>
              <input type="text" name="citizen" value={newFormData.citizen} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Ownership Type:</label>
              <select name="ownershipType" value={newFormData.ownershipType} onChange={handleInputChange} className="form-control" required>
                <option value="">Select Ownership Type</option>
                <option value="State Owned">State Owned</option>
                <option value="Private Owned">Private Owned</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Type:</label>
              <input type="text" name="idType" value={newFormData.idType} onChange={handleInputChange} className="form-control" required />
            </div>
            <div className="form-group">
              <label>ID:</label>
              <input type="text" name="id" value={newFormData.id} onChange={handleInputChange} className="form-control" required />
            </div>

            {/* File Inputs */}
            <div className="form-group">
              <label>Copy of ID/Passport:</label>
              <div className="file-input-wrapper">
                <input type="file" name="copyOfIdPassport" id="copyOfIdPassport" onChange={handleInputChange} className="form-control-file" required />
                <label htmlFor="copyOfIdPassport" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.copyOfIdPassport ? newFormData.copyOfIdPassport.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Professional Reference 1:</label>
              <div className="file-input-wrapper">
                <input type="file" name="professionalReference1" id="professionalReference1" onChange={handleInputChange} className="form-control-file" required />
                <label htmlFor="professionalReference1" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.professionalReference1 ? newFormData.professionalReference1.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Professional Reference 2:</label>
              <div className="file-input-wrapper">
                <input type="file" name="professionalReference2" id="professionalReference2" onChange={handleInputChange} className="form-control-file" required />
                <label htmlFor="professionalReference2" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.professionalReference2 ? newFormData.professionalReference2.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Qualification Certificates:</label>
              <div className="file-input-wrapper">
                <input type="file" name="qualificationCertificates" id="qualificationCertificates" onChange={handleInputChange} className="form-control-file" required />
                <label htmlFor="qualificationCertificates" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.qualificationCertificates ? newFormData.qualificationCertificates.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Valid Recent Permit:</label>
              <div className="file-input-wrapper">
                <input type="file" name="validRecentPermit" id="validRecentPermit" onChange={handleInputChange} className="form-control-file" required />
                <label htmlFor="validRecentPermit" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.validRecentPermit ? newFormData.validRecentPermit.name : 'No file chosen'}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Work Permit Waiver:</label>
              <div className="file-input-wrapper">
                <input type="file" name="workPermitWaiver" id="workPermitWaiver" onChange={handleInputChange} className="form-control-file" required />
                <label htmlFor="workPermitWaiver" className="custom-file-upload">Choose File</label>
                <span className="file-name">{newFormData.workPermitWaiver ? newFormData.workPermitWaiver.name : 'No file chosen'}</span>
              </div>
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
                onClick={onClose}
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