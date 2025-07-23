import React, { useState, useEffect } from 'react';
import './AddStatutoryComplianceDialog.css';
import ModalPortal from './ModalPortal';
import {StorageService} from '../services';

const AddStatutoryComplianceDialog = ({ open, onClose, onSuccess, onAddSuccess, trackedEntityInstanceId, existingEvent, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    companyRegistrationDocuments: null,
    companyTaxRegistrationDocuments: null,
    facilityHealthRecognitionDocuments: null,
    facilityCompanyLeaseAgreement: null
  });
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Map of field names to their DHIS2 data element IDs
  const fieldToDataElementMap = {
    companyRegistrationDocuments: "fSGzyNOvsn3",
    companyTaxRegistrationDocuments: "mooXtirlse9",
    facilityHealthRecognitionDocuments: "Yv2HUJvSDKB",
    facilityCompanyLeaseAgreement: "aa4jP4GCtin"
  };

  // Field display names for better UX
  const fieldDisplayNames = {
    companyRegistrationDocuments: "Company Registration Documents",
    companyTaxRegistrationDocuments: "Company Tax Registration Documents",
    facilityHealthRecognitionDocuments: "Facility / Company Health Recognition Documents (affiliations etc)",
    facilityCompanyLeaseAgreement: "Facility / Company Lease Agreement"
  };

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingEvent && existingEvent.dataValues) {
      const getDataValue = (dataElementId) => {
        const dataValue = existingEvent.dataValues.find(dv => dv.dataElement === dataElementId);
        return dataValue ? dataValue.value : '';
      };

      const existingFiles = {};
      Object.entries(fieldToDataElementMap).forEach(([fieldName, dataElementId]) => {
        const fileId = getDataValue(dataElementId);
        if (fileId) {
          existingFiles[fieldName] = fileId;
        }
      });

      setUploadedFiles(existingFiles);
    }
  }, [isEditMode, existingEvent]);
  
  const handleInputChange = (e) => {
    const { name, files } = e.target;
    
    if (files && files[0]) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    }
  };
  
  // Function to get the current user's organization unit
  const getCurrentUserOrgUnit = async () => {
    const credentials = await StorageService.get('userCredentials');
    
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

  // Get enrollment ID for the specific program from the tracked entity instance
  const getEnrollmentIdForProgram = async (teiId, programId = "EE8yeLVo6cN") => {
    const credentials = await StorageService.get('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required");
    }

    if (!teiId) {
      throw new Error("Tracked entity instance ID is required");
    }

    console.log(`Fetching enrollment ID for TEI: ${teiId} and program: ${programId}`);
    
    const enrollmentUrl = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${teiId}?fields=enrollments[program,enrollment]`;
    
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

  // Upload file to DHIS2 and get the file resource ID
  const uploadFileAndGetId = async (file) => {
    if (!file) return null;
    
    const credentials = await StorageService.get('userCredentials');
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
      console.log("File upload response:", responseJson);
      return responseJson.response.fileResource.id;
    } catch (error) {
      console.error("Error uploading file:", file.name, error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const credentials = await StorageService.get('userCredentials');
      
      if (!credentials) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      const orgUnitId = await getCurrentUserOrgUnit();
      
      // Get the enrollment ID for this TEI and program
      const enrollmentId = await getEnrollmentIdForProgram(trackedEntityInstanceId || existingEvent?.trackedEntityInstance);
      console.log("Retrieved enrollment ID:", enrollmentId);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Upload files and build data values array
      const dataValues = [];
      
      for (const [fieldName, file] of Object.entries(formData)) {
        const dataElementId = fieldToDataElementMap[fieldName];
        
        if (dataElementId) {
          let fileResourceId = null;
          
          // If there's a new file, upload it
          if (file) {
            console.log(`Uploading ${fieldName}:`, file.name);
            fileResourceId = await uploadFileAndGetId(file);
          } 
          // If in edit mode and no new file, preserve existing file ID
          else if (isEditMode && uploadedFiles[fieldName]) {
            fileResourceId = uploadedFiles[fieldName];
          }
          
          // Only add to dataValues if we have a file resource ID
          if (fileResourceId) {
            dataValues.push({
              dataElement: dataElementId,
              value: fileResourceId
            });
          }
        }
      }
      
      if (isEditMode) {
        // Update existing event
        const payload = {
          event: existingEvent.event,
          orgUnit: orgUnitId,
          program: "EE8yeLVo6cN",
          programStage: "vyv7zncjCmV",
          enrollment: enrollmentId,
          status: "COMPLETED",
          trackedEntityInstance: existingEvent.trackedEntityInstance,
          dataValues: dataValues
        };
        
        console.log("Statutory Compliance Update Payload:", payload);
        
        const eventRes = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${existingEvent.event}`, {
          method: "PUT",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        if (!eventRes.ok) {
          const errorText = await eventRes.text();
          throw new Error(`Event update failed: ${eventRes.status} - ${errorText}`);
        }
        
        console.log("Statutory compliance documents updated successfully!");
      } else {
        // Create new event
        const payload = {
          trackedEntityInstance: trackedEntityInstanceId,
          eventDate: today,
          orgUnit: orgUnitId,
          program: "EE8yeLVo6cN",
          programStage: "vyv7zncjCmV", // Statutory Compliance program stage
          enrollment: enrollmentId,
          status: "COMPLETED",
          dataValues: dataValues
        };
        
        console.log("Statutory Compliance Payload:", payload);
        
        const eventRes = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events`, {
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
        
        console.log("Statutory compliance documents added successfully!");
      }
      
      // Call success callback to reload data in parent
      if (typeof onSuccess === 'function') {
        onSuccess();
      } else if (typeof onAddSuccess === 'function') {
        onAddSuccess();
      }
      
      onClose(); // Close modal on successful operation
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} statutory compliance documents:`, error);
      setErrorMessage(`Failed to ${isEditMode ? 'update' : 'add'} statutory compliance documents: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = () => {
    // At least one document should be uploaded or already exist
    const hasNewFiles = Object.values(formData).some(file => file !== null);
    const hasExistingFiles = Object.keys(uploadedFiles).length > 0;
    return hasNewFiles || (isEditMode && hasExistingFiles);
  };
  
  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '800px' }}>
        <div className="modal-header">
          <h5 className="modal-title">{isEditMode ? 'Edit Statutory Compliance Documents' : 'Add Statutory Compliance Documents'}</h5>
          <button 
            type="button" 
            className="close-btn" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleSubmit} className="statutory-compliance-form">
            
            <h6 className="section-title">Required Documents</h6>
            <p className="section-description">Please upload the following company/facility documents:</p>
            
            {Object.entries(fieldToDataElementMap).map(([fieldName, dataElementId]) => (
              <div key={fieldName} className="form-group document-upload-group">
                <label>{fieldDisplayNames[fieldName]}</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    name={fieldName}
                    id={fieldName}
                    onChange={handleInputChange}
                    className="form-control-file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    disabled={isSubmitting}
                  />
                  <label htmlFor={fieldName} className="custom-file-upload">
                    Choose File
                  </label>
                  <span className="file-name">
                    {formData[fieldName] ? formData[fieldName].name : 
                     uploadedFiles[fieldName] ? 'Document already uploaded' : 
                     'No file chosen'}
                  </span>
                </div>
                {uploadedFiles[fieldName] && !formData[fieldName] && (
                  <small className="text-success">✓ Document previously uploaded</small>
                )}
              </div>
            ))}
            
            <div className="button-container">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? `${isEditMode ? 'Updating' : 'Uploading'} Documents...` : 
                 `${isEditMode ? 'Update' : 'Upload'} Documents`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddStatutoryComplianceDialog; 