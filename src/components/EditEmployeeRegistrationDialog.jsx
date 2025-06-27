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
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };



  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

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
        eventDate: today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN", // Same program as Facility Ownership
        programStage: "xjhA4eEHyhw", // Employee Registration program stage
        status: "COMPLETED",
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
    formData.firstName &&
    formData.lastName &&
    formData.bhpcNmcNumber &&
    formData.position &&
    formData.contractType
  );

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Employee Registration</h5>
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
          <form onSubmit={handleUpdateSubmit} className="employee-registration-form">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
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
                value={formData.lastName}
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
                value={formData.bhpcNmcNumber}
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
                value={formData.position}
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
                value={formData.contractType}
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
                {isLoading ? "Updating..." : "Update Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditEmployeeRegistrationDialog; 