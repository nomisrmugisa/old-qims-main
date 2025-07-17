import React, { useState, useEffect } from 'react';
import './AddEmployeeRegistrationDialog.css';
import ModalPortal from './ModalPortal';
import {StorageService} from '../services';

const AddEmployeeRegistrationDialog = ({ open, onClose, onSuccess, onAddSuccess, trackedEntityInstanceId }) => {
  const [newFormData, setNewFormData] = useState({
    firstName: "",
    lastName: "",
    bhpcNmcNumber: "",
    position: "",
    contractType: ""
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

  // Function to get the current user's organization unit
  const getCurrentUserOrgUnit = async () => {
    const credentials = await StorageService.get('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    try {
      const response = await fetch(`/api/me.json`, {
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setNewFormData((prevData) => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };



  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const credentials = await StorageService.get('userCredentials');
      if (!credentials) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Get current user's organization unit
      const orgUnitId = await getCurrentUserOrgUnit();
      
      // Store the organization unit ID in localStorage for other components to use
      localStorage.setItem('userOrgUnitId', orgUnitId);

      // Get the enrollment ID for this TEI and program
      const enrollmentId = await getEnrollmentIdForProgram(trackedEntityInstanceId);
      console.log("Retrieved enrollment ID:", enrollmentId);

      // Prepare data values for Employee Registration program stage - only the 5 configured fields
      const dataValues = [
        { dataElement: "IIxbad41cH6", value: newFormData.firstName }, // Employee First Name
        { dataElement: "VFTRgPnvSHV", value: newFormData.lastName }, // Employee Last Name
        { dataElement: "xcTxmEUy6g6", value: newFormData.bhpcNmcNumber }, // BHPC/NMC Number
        { dataElement: "FClCncccLzw", value: newFormData.position }, // Position
        { dataElement: "F3h1A96t3uL", value: newFormData.contractType }, // Officer Contract Type
      ];

      const today = new Date().toISOString().split('T')[0];

      const payload = {
        trackedEntityInstance: trackedEntityInstanceId,
        eventDate: today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN", // Same program as Facility Ownership
        programStage: "xjhA4eEHyhw", // Employee Registration program stage
        enrollment: enrollmentId,
        status: "COMPLETED",
        dataValues: dataValues,
      };

      console.log("Employee Registration Payload:", payload);

      const eventRes = await fetch(`/api/events`, {
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

      console.log("Employee registration event created successfully!");
      
      // Call success callback to reload data in parent
      // Support both onSuccess (from RegistrationDetails) and onAddSuccess (for backward compatibility)
      if (typeof onSuccess === 'function') {
        onSuccess();
      } else if (typeof onAddSuccess === 'function') {
        onAddSuccess();
      }
      
      onClose(); // Close modal on successful addition

    } catch (error) {
      console.error("Error creating new employee registration:", error);
      setErrorMessage(`Failed to add employee registration: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const isFormValid = (
    newFormData.firstName &&
    newFormData.lastName &&
    newFormData.bhpcNmcNumber &&
    newFormData.position &&
    newFormData.contractType
  );

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Add New Employee Registration</h5>
          <button 
            type="button" 
            className="close-btn" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleAddSubmit} className="employee-registration-form">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={newFormData.firstName}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={newFormData.lastName}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>BHPC/NMC Number:</label>
              <input
                type="text"
                name="bhpcNmcNumber"
                value={newFormData.bhpcNmcNumber}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Position:</label>
              <select
                name="position"
                value={newFormData.position}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={isLoading}
              >
                <option value="">Select Position</option>
                <option value="Head of Medical Services">Head of Medical Services</option>
                <option value="Medical/Dental Personnel: Dentist">Medical/Dental Personnel: Dentist</option>
                <option value="Facility Manager">Facility Manager</option>
                <option value="Nurse">Nurse</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Laboratory Technician">Laboratory Technician</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contract Type:</label>
              <select
                name="contractType"
                value={newFormData.contractType}
                onChange={handleInputChange}
                className="form-control"
                required
                disabled={isLoading}
              >
                <option value="">Select Contract Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contracted Staff">Contracted Staff</option>
              </select>
            </div>

            <div className="button-container">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddEmployeeRegistrationDialog; 