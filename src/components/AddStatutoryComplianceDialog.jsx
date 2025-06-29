import React, { useState, useEffect } from 'react';
import './AddStatutoryComplianceDialog.css';
import ModalPortal from './ModalPortal';

const AddStatutoryComplianceDialog = ({ open, onClose, onSuccess, onAddSuccess, trackedEntityInstanceId, existingEvent, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    applicationRequestType: "",
    paymentNumber: "",
    type: "",
    facilityName: "",
    licenseHolderFirstName: "",
    licenseHolderSurname: "",
    physicalAddress: "",
    phoneNumber: "",
    emailAddress: "",
    bhpcRegistrationNumber: "",
    correspondenceAddress: "",
    privatesPracticeNumber: "",
    
    // Files
    requestLetter: null,
    attachments: null,
    
    // Application Details
    applicationPages: "",
    locationInBotswana: "",
    
    // Compliance Checks
    checkApplicationLetter: false,
    checkPostBasicQualification: false,
    checkPracticeValid: false,
    checkPrimaryQualification: false,
    checkRegistrationValid: false,
    qualifiesForLogs: false,
    
    // Comments and Additional Info
    logsComments: "",
    requestForRegistrationAccepted: false,
    teiOfLicenseHolder: "",
    employeeUserName: ""
  });
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map of field names to their DHIS2 data element IDs
  const fieldToDataElementMap = {
    applicationRequestType: "JSwAq5HRQa8",
    paymentNumber: "LAHlCWh18bP",
    type: "oVOArpnxVd1",
    facilityName: "D707dj4Rpjz",
    licenseHolderFirstName: "HMk4LZ9ESOq",
    licenseHolderSurname: "ykwhsQQPVH0",
    physicalAddress: "dRkX5jmHEIM",
    phoneNumber: "SReqZgQk0RY",
    emailAddress: "NVlLoMZbXIW",
    bhpcRegistrationNumber: "SVzSsDiZMN5",
    correspondenceAddress: "p7y0vqpP0W2",
    privatesPracticeNumber: "aMFg2iq9VIg",
    requestLetter: "lKon9xsRktH",
    attachments: "gMh3ZYRnTlb",
    applicationPages: "z7nj0Ci7iy8",
    locationInBotswana: "VJzk8OdFJKA",
    checkApplicationLetter: "Bz0oYRvSypS",
    checkPostBasicQualification: "fD7DQkmT1im",
    checkPracticeValid: "XcWt8b12E85",
    checkPrimaryQualification: "lOpMngOe2yY",
    checkRegistrationValid: "b8gm7x8JcLO",
    qualifiesForLogs: "kP7rQwnufiY",
    logsComments: "p5kq4anYRdT",
    requestForRegistrationAccepted: "jV5Y8XOfkgb",
    teiOfLicenseHolder: "PdtizqOqE6Q",
    employeeUserName: "g3J1CH26hSA"
  };

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingEvent && existingEvent.dataValues) {
      const getDataValue = (dataElementId) => {
        const dataValue = existingEvent.dataValues.find(dv => dv.dataElement === dataElementId);
        return dataValue ? dataValue.value : '';
      };

      const populatedFormData = {};
      Object.entries(fieldToDataElementMap).forEach(([fieldName, dataElementId]) => {
        let value = getDataValue(dataElementId);
        // Handle boolean fields
        if (fieldName.startsWith('check') || fieldName === 'qualifiesForLogs' || fieldName === 'requestForRegistrationAccepted') {
          populatedFormData[fieldName] = value === 'true';
        } else {
          populatedFormData[fieldName] = value;
        }
      });

      setFormData(populatedFormData);
    }
  }, [isEditMode, existingEvent, fieldToDataElementMap]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0] || null,
      }));
    } else if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const credentials = localStorage.getItem('userCredentials');
      
      if (!credentials) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      const orgUnitId = await getCurrentUserOrgUnit();
      
      // Get the enrollment ID for this TEI and program
      const enrollmentId = await getEnrollmentIdForProgram(trackedEntityInstanceId || existingEvent?.trackedEntityInstance);
      console.log("Retrieved enrollment ID:", enrollmentId);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Build data values array
      const dataValues = [];
      
      Object.entries(formData).forEach(([fieldName, value]) => {
        const dataElementId = fieldToDataElementMap[fieldName];
        if (dataElementId && value !== null && value !== "" && value !== false) {
          // Handle different value types
          let formattedValue = value;
          if (typeof value === 'boolean') {
            formattedValue = value.toString();
          } else if (fieldName === 'requestLetter' || fieldName === 'attachments') {
            // For file resources, we would need to upload the file first
            // For now, we'll skip file uploads or handle them as text placeholders
            if (value && value.name) {
              formattedValue = value.name;
            } else {
              return; // Skip if no file
            }
          }
          
          dataValues.push({
            dataElement: dataElementId,
            value: formattedValue.toString()
          });
        }
      });
      
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
        
        const eventRes = await fetch(`/api/events/${existingEvent.event}`, {
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
        
        console.log("Statutory compliance record updated successfully!");
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
        
        const eventRes = await fetch("/api/events", {
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
        
        console.log("Statutory compliance record added successfully!");
      }
      
      // Call success callback to reload data in parent
      if (typeof onSuccess === 'function') {
        onSuccess();
      } else if (typeof onAddSuccess === 'function') {
        onAddSuccess();
      }
      
      onClose(); // Close modal on successful operation
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} statutory compliance record:`, error);
      setErrorMessage(`Failed to ${isEditMode ? 'update' : 'add'} statutory compliance record: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = () => {
    // At minimum require facility name and license holder information
    return formData.facilityName && formData.licenseHolderFirstName && formData.licenseHolderSurname;
  };
  
  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">{isEditMode ? 'Edit Statutory Compliance Record' : 'Add Statutory Compliance Record'}</h5>
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
            
            {/* Application Details Section */}
            <h6 className="section-title">Application Details</h6>
            <div className="form-group">
              <label>Application Request Type</label>
              <select
                name="applicationRequestType"
                value={formData.applicationRequestType}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              >
                <option value="">Select Request Type</option>
                <option value="New Facility Application">New Facility Application</option>
                <option value="Renewal">Renewal</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Payment Number</label>
              <input
                type="number"
                name="paymentNumber"
                value={formData.paymentNumber}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Application Pages</label>
              <input
                type="text"
                name="applicationPages"
                value={formData.applicationPages}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>

            {/* Facility Information Section */}
            <h6 className="section-title">Facility Information</h6>
            <div className="form-group">
              <label>Facility Name *</label>
              <textarea
                name="facilityName"
                value={formData.facilityName}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Physical Address</label>
              <input
                type="text"
                name="physicalAddress"
                value={formData.physicalAddress}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Correspondence Address (Town/Village)</label>
              <input
                type="text"
                name="correspondenceAddress"
                value={formData.correspondenceAddress}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Location in Botswana</label>
              <input
                type="text"
                name="locationInBotswana"
                value={formData.locationInBotswana}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
                placeholder="Organization Unit ID"
              />
            </div>

            {/* License Holder Information Section */}
            <h6 className="section-title">License Holder Information</h6>
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="licenseHolderFirstName"
                value={formData.licenseHolderFirstName}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Surname *</label>
              <input
                type="text"
                name="licenseHolderSurname"
                value={formData.licenseHolderSurname}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label>B.H.P.C Registration Number</label>
              <input
                type="text"
                name="bhpcRegistrationNumber"
                value={formData.bhpcRegistrationNumber}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Private Practice Number</label>
              <input
                type="text"
                name="privatesPracticeNumber"
                value={formData.privatesPracticeNumber}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>

            {/* Document Uploads Section */}
            <h6 className="section-title">Document Uploads</h6>
            <div className="form-group">
              <label>Request Letter</label>
              <input
                type="file"
                name="requestLetter"
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx"
              />
            </div>
            
            <div className="form-group">
              <label>Attachments</label>
              <input
                type="file"
                name="attachments"
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>

            {/* Compliance Checks Section */}
            <h6 className="section-title">Compliance Checks</h6>
            <div className="checkbox-grid">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkApplicationLetter"
                  name="checkApplicationLetter"
                  checked={formData.checkApplicationLetter}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="checkApplicationLetter">Check Application Letter</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkPostBasicQualification"
                  name="checkPostBasicQualification"
                  checked={formData.checkPostBasicQualification}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="checkPostBasicQualification">Check Post Basic Qualification</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkPracticeValid"
                  name="checkPracticeValid"
                  checked={formData.checkPracticeValid}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="checkPracticeValid">Check Practice Valid</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkPrimaryQualification"
                  name="checkPrimaryQualification"
                  checked={formData.checkPrimaryQualification}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="checkPrimaryQualification">Check Primary Qualification</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkRegistrationValid"
                  name="checkRegistrationValid"
                  checked={formData.checkRegistrationValid}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="checkRegistrationValid">Check Registration Valid</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="qualifiesForLogs"
                  name="qualifiesForLogs"
                  checked={formData.qualifiesForLogs}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="qualifiesForLogs">Qualifies for Letter of Good Standing?</label>
              </div>
            </div>

            {/* Additional Information Section */}
            <h6 className="section-title">Additional Information</h6>
            <div className="form-group">
              <label>LOGS Comments</label>
              <textarea
                name="logsComments"
                value={formData.logsComments}
                onChange={handleInputChange}
                className="form-control"
                rows="4"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>TEI of the License Holder</label>
              <input
                type="text"
                name="teiOfLicenseHolder"
                value={formData.teiOfLicenseHolder}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label>Employee User Name</label>
              <input
                type="text"
                name="employeeUserName"
                value={formData.employeeUserName}
                onChange={handleInputChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="requestForRegistrationAccepted"
                name="requestForRegistrationAccepted"
                checked={formData.requestForRegistrationAccepted}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <label htmlFor="requestForRegistrationAccepted">Request for Registration of the License Holder: Accepted</label>
            </div>
            
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
                {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Record" : "Add Record")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddStatutoryComplianceDialog; 