import React, { useState, useEffect } from 'react';
import './EditEmployeeRegistrationDialog.css';
import ModalPortal from './ModalPortal';

const EditEmployeeRegistrationDialog = ({ open, onClose, onSuccess, event }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bhpcNmcNumber: "",
    position: "",
    contractType: ""
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [fieldStates, setFieldStates] = useState({}); // Track individual field states (saving, saved, error)
  
  // Map of field names to their DHIS2 data element IDs
  const fieldToDataElementMap = {
    firstName: "IIxbad41cH6", // Employee First Name
    lastName: "VFTRgPnvSHV", // Employee Last Name
    bhpcNmcNumber: "xcTxmEUy6g6", // BHPC/NMC Number
    position: "FClCncccLzw", // Position
    contractType: "F3h1A96t3uL" // Officer Contract Type
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

  // Populate form with existing data when event changes
  useEffect(() => {
    if (event && event.dataValues) {
      const getDataValue = (dataElementId) => {
        const dataValue = event.dataValues.find(dv => dv.dataElement === dataElementId);
        return dataValue ? dataValue.value : '';
      };

      setFormData({
        firstName: getDataValue("IIxbad41cH6"), // Employee First Name
        lastName: getDataValue("VFTRgPnvSHV"), // Employee Last Name
        bhpcNmcNumber: getDataValue("xcTxmEUy6g6"), // BHPC/NMC Number
        position: getDataValue("FClCncccLzw"), // Position
        contractType: getDataValue("F3h1A96t3uL") // Officer Contract Type
      });
    }
  }, [event]);

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
      // Get current organization unit
      const orgUnitId = await getCurrentUserOrgUnit();

      // Use the exact API format for updating individual fields
      const payload = {
        event: event.event,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN", // Same program as Facility Ownership
        programStage: "xjhA4eEHyhw", // Employee Registration program stage
        status: "ACTIVE",
        trackedEntityInstance: event.trackedEntityInstance,
        dataValues: [
          {
            dataElement: dataElementId,
            value: value ? value.toString() : "",
            providedElsewhere: false
          }
        ]
      };

      console.log(`Updating field ${fieldName}:`, payload);

      // Use the PUT endpoint to update the event
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
    const { name, value } = e.target;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Update field in real-time with debounce
    debounceUpdateField(name, value);
  };

  // Handle blur event for immediate save
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    // Clear any pending debounced update
    const timeouts = {};
    if (timeouts[name]) {
      clearTimeout(timeouts[name]);
    }
    // Update immediately on blur
    updateSingleField(name, value);
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const credentials = localStorage.getItem('userCredentials');
      if (!credentials) {
        throw new Error("Authentication required. Please log in again.");
      }

      const orgUnitId = await getCurrentUserOrgUnit();

      // Prepare data values for Employee Registration program stage - only the 5 configured fields
      const dataValues = [
        { dataElement: "IIxbad41cH6", value: formData.firstName }, // Employee First Name
        { dataElement: "VFTRgPnvSHV", value: formData.lastName }, // Employee Last Name
        { dataElement: "xcTxmEUy6g6", value: formData.bhpcNmcNumber }, // BHPC/NMC Number
        { dataElement: "FClCncccLzw", value: formData.position }, // Position
        { dataElement: "F3h1A96t3uL", value: formData.contractType }, // Officer Contract Type
      ];

      const today = new Date().toISOString().split('T')[0];

      const payload = {
        event: event.event,
        eventDate: event.eventDate || today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN", // Same program as Facility Ownership
        programStage: "xjhA4eEHyhw", // Employee Registration program stage
        status: "COMPLETED",
        trackedEntityInstance: event.trackedEntityInstance,
        dataValues: dataValues,
      };

      console.log("Employee Registration Update Payload:", payload);

      const eventRes = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${event.event}`, {
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

      console.log("Employee registration updated successfully!");
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      
      onClose();

    } catch (error) {
      console.error("Error updating employee registration:", error);
      setErrorMessage(`Failed to update employee registration: ${error.message}`);
    }
  };

  const handleCancel = () => {
    console.log("EditEmployeeRegistrationDialog handleCancel called");
    console.log("- onSuccess exists:", typeof onSuccess === 'function');
    console.log("- onClose exists:", typeof onClose === 'function');
    
    // Refresh the parent table to reflect any real-time updates made during editing
    if (typeof onSuccess === 'function') {
      console.log("- Calling onSuccess to refresh table");
      onSuccess();
    }
    
    // Call onClose to close the dialog
    if (typeof onClose === 'function') {
      console.log("- Calling onClose to close dialog");
      onClose();
    }
  };

  // Check if we have any fields currently being saved
  const hasUnsavedChanges = Object.values(fieldStates).some(state => state.status === 'saving');

  return (
    <ModalPortal open={open} onClose={handleCancel}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Employee Registration</h5>
          <button 
            type="button" 
            className="close-btn" 
            onClick={handleCancel}
            disabled={hasUnsavedChanges}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          <form onSubmit={handleUpdateSubmit} className="employee-registration-form">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="form-control"
                required
                disabled={hasUnsavedChanges}
              />
              {getFieldStatusIndicator('firstName')}
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="form-control"
                required
                disabled={hasUnsavedChanges}
              />
              {getFieldStatusIndicator('lastName')}
            </div>
            <div className="form-group">
              <label>BHPC/NMC Number:</label>
              <input
                type="text"
                name="bhpcNmcNumber"
                value={formData.bhpcNmcNumber}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="form-control"
                required
                disabled={hasUnsavedChanges}
              />
              {getFieldStatusIndicator('bhpcNmcNumber')}
            </div>
            <div className="form-group">
              <label>Position:</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="form-control"
                required
                disabled={hasUnsavedChanges}
              >
                <option value="">Select Position</option>
                <option value="Head of Medical Services">Head of Medical Services</option>
                <option value="Medical/Dental Personnel: Dentist">Medical/Dental Personnel: Dentist</option>
                <option value="Facility Manager">Facility Manager</option>
                <option value="Nurse">Nurse</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Laboratory Technician">Laboratory Technician</option>
              </select>
              {getFieldStatusIndicator('position')}
            </div>
            <div className="form-group">
              <label>Contract Type:</label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="form-control"
                required
                disabled={hasUnsavedChanges}
              >
                <option value="">Select Contract Type</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contracted Staff">Contracted Staff</option>
              </select>
              {getFieldStatusIndicator('contractType')}
            </div>

            <div className="button-container">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={hasUnsavedChanges}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditEmployeeRegistrationDialog; 