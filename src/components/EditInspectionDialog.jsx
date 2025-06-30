import React, { useState, useEffect } from 'react';
import './AddInspectionDialog.css'; // Reuse the same CSS
import ModalPortal from './ModalPortal';

const EditInspectionDialog = ({ open, onClose, onSuccess, event }) => {
  const [formValues, setFormValues] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Map of field names to their DHIS2 data element IDs (key fields only)
  const fieldToDataElementMap = {
    inspectionDateTime: "e4MmMJ3zrhK",
    inspectionCode: "wS6bfV1hrU0",
    inspectionType: "Pl4RdRtKErd",
    hasOrganisationalStructure: "WCys8b95Qrw",
    hasPoliciesForPatientAssessment: "pCxcolinfQ0",
    hasPoliciesForPatientReferral: "D6yET9Rm3Ql",
    hasPoliciesForPatientConsent: "qxWs7aK3qGZ",
    hasWheelchairAccessibility: "wjLqyKpPclD",
    isFencedAndSecure: "uiwrRhfPUX9",
    hasAdequateParking: "bWVuvn0rN0W",
    isCleanAndNeat: "mE0keb9FteW",
    hasAdequateLighting: "K3me4A3CyVO",
    inspectorFullname: "VOjM6ArpORU"
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

      const initialFormValues = {};
      Object.entries(fieldToDataElementMap).forEach(([fieldName, dataElementId]) => {
        initialFormValues[fieldName] = getDataValue(dataElementId);
      });

      setFormValues(initialFormValues);
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
    const { name, value, type, checked } = e.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
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

      // Create data values array based on form data
      const dataValues = [];
      
      Object.entries(formValues).forEach(([fieldName, value]) => {
        const dataElementId = fieldToDataElementMap[fieldName];
        if (dataElementId && value !== undefined && value !== '') {
          dataValues.push({
            dataElement: dataElementId,
            value: typeof value === 'boolean' ? value.toString() : value.toString(),
            providedElsewhere: false
          });
        }
      });

      const payload = {
        event: event.event,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "Eupjm3J0dt2",
        status: "VISITED",
        trackedEntityInstance: event.trackedEntityInstance,
        dataValues: dataValues,
      };

      console.log("Inspection Update Payload:", payload);

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

      console.log("Inspection updated successfully!");
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      
      onClose();

    } catch (error) {
      console.error("Error updating inspection:", error);
      setErrorMessage(`Failed to update inspection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("EditInspectionDialog handleCancel called");
    console.log("- onSuccess exists:", typeof onSuccess === 'function');
    console.log("- onClose exists:", typeof onClose === 'function');
    
    if (!isLoading) {
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
    }
  };

  return (
    <ModalPortal open={open} onClose={handleCancel}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '800px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Inspection Details</h5>
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
          <form onSubmit={handleUpdateSubmit}>
            
            <div className="form-group">
              <label>Inspection Date & Time</label>
              <input
                type="datetime-local"
                name="inspectionDateTime"
                value={formValues.inspectionDateTime || ''}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Inspection Code</label>
              <input
                type="text"
                name="inspectionCode"
                value={formValues.inspectionCode || ''}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Inspection Type</label>
              <select
                name="inspectionType"
                value={formValues.inspectionType || ''}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value="">Select...</option>
                <option value="Initial">Initial</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Routine">Routine</option>
                <option value="Complaint">Complaint</option>
              </select>
            </div>

            <div className="form-group">
              <label>Inspector Full Name</label>
              <input
                type="text"
                name="inspectorFullname"
                value={formValues.inspectorFullname || ''}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <h6>Organizational Structure</h6>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasOrganisationalStructure"
                  checked={formValues.hasOrganisationalStructure === 'true' || formValues.hasOrganisationalStructure === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Has Organizational Structure
              </label>
            </div>

            <h6>Patient Policies</h6>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasPoliciesForPatientAssessment"
                  checked={formValues.hasPoliciesForPatientAssessment === 'true' || formValues.hasPoliciesForPatientAssessment === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Has Policies for Patient Assessment
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasPoliciesForPatientReferral"
                  checked={formValues.hasPoliciesForPatientReferral === 'true' || formValues.hasPoliciesForPatientReferral === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Has Policies for Patient Referral
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasPoliciesForPatientConsent"
                  checked={formValues.hasPoliciesForPatientConsent === 'true' || formValues.hasPoliciesForPatientConsent === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Has Policies for Patient Consent
              </label>
            </div>

            <h6>Facility Environment</h6>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasWheelchairAccessibility"
                  checked={formValues.hasWheelchairAccessibility === 'true' || formValues.hasWheelchairAccessibility === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Has Wheelchair Accessibility
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isFencedAndSecure"
                  checked={formValues.isFencedAndSecure === 'true' || formValues.isFencedAndSecure === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Is Fenced and Secure
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasAdequateParking"
                  checked={formValues.hasAdequateParking === 'true' || formValues.hasAdequateParking === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Has Adequate Parking
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isCleanAndNeat"
                  checked={formValues.isCleanAndNeat === 'true' || formValues.isCleanAndNeat === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Is Clean and Neat
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasAdequateLighting"
                  checked={formValues.hasAdequateLighting === 'true' || formValues.hasAdequateLighting === true}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Has Adequate Lighting
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Updating...' : 'Update Inspection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditInspectionDialog; 