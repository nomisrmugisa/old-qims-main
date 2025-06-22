import React, { useState, useEffect } from 'react';
import './AddServiceOfferingDialog.css'; // Reuse the same CSS
import ModalPortal from './ModalPortal';

const EditServiceOfferingDialog = ({ open, onClose, onSuccess, event }) => {
  const [formData, setFormData] = useState({
    coreEmergencyServices: false,
    coreGeneralPracticeServices: false,
    coreTreatmentAndCare: false,
    coreUrgentCare: false,
    additionalHealthEducation: false,
    specialisedMaternityAndReproductiveHealth: false,
    specialisedMentalHealthAndSubstanceAbuse: false,
    specialisedRadiology: false,
    specialisedRehabilitation: false,
    supportAmbulatoryCare: false,
    supportDialysisCenters: false,
    supportHospices: false,
    supportLabServices: false,
    supportNursingHomes: false,
    supportOutpatientDepartment: false,
    supportPatientTransportation: false,
    supportPharmacy: false,
    additionalCounseling: false,
    additionalCommunityBased: false
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
        return dataValue ? dataValue.value === 'true' : false;
      };

      setFormData({
        coreEmergencyServices: getDataValue("j57HXXX4Ijz"),
        coreGeneralPracticeServices: getDataValue("ECjGkIq0Deq"),
        coreTreatmentAndCare: getDataValue("aM41KiGDJAs"),
        coreUrgentCare: getDataValue("flzyZUlf30v"),
        additionalHealthEducation: getDataValue("SMvKa2EWeBO"),
        specialisedMaternityAndReproductiveHealth: getDataValue("y9QSgKRoc6L"),
        specialisedMentalHealthAndSubstanceAbuse: getDataValue("yZhlCTgamq0"),
        specialisedRadiology: getDataValue("RCvjFJQUaPV"),
        specialisedRehabilitation: getDataValue("uxcdCPnaqWL"),
        supportAmbulatoryCare: getDataValue("r76ODkNZv43"),
        supportDialysisCenters: getDataValue("E7OMKr09N0R"),
        supportHospices: getDataValue("GyQNkXpNraW"),
        supportLabServices: getDataValue("OgpVvPxkLwf"),
        supportNursingHomes: getDataValue("rLC2CE79p7Q"),
        supportOutpatientDepartment: getDataValue("w86r0XZCLCr"),
        supportPatientTransportation: getDataValue("m8Kl585eWSK"),
        supportPharmacy: getDataValue("yecnkdC7HtM"),
        additionalCounseling: getDataValue("i0QXYWMOUjy"),
        additionalCommunityBased: getDataValue("e48W7983nBs")
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

  const handleInputChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
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

      const today = new Date().toISOString().split('T')[0];

      // Create data values array based on form data
      const dataValues = [];
      
      // Add boolean/checkbox values only if they are true
      if (formData.coreEmergencyServices) dataValues.push({ dataElement: "j57HXXX4Ijz", value: "true" });
      if (formData.coreGeneralPracticeServices) dataValues.push({ dataElement: "ECjGkIq0Deq", value: "true" });
      if (formData.coreTreatmentAndCare) dataValues.push({ dataElement: "aM41KiGDJAs", value: "true" });
      if (formData.coreUrgentCare) dataValues.push({ dataElement: "flzyZUlf30v", value: "true" });
      if (formData.additionalHealthEducation) dataValues.push({ dataElement: "SMvKa2EWeBO", value: "true" });
      if (formData.specialisedMaternityAndReproductiveHealth) dataValues.push({ dataElement: "y9QSgKRoc6L", value: "true" });
      if (formData.specialisedMentalHealthAndSubstanceAbuse) dataValues.push({ dataElement: "yZhlCTgamq0", value: "true" });
      if (formData.specialisedRadiology) dataValues.push({ dataElement: "RCvjFJQUaPV", value: "true" });
      if (formData.specialisedRehabilitation) dataValues.push({ dataElement: "uxcdCPnaqWL", value: "true" });
      if (formData.supportAmbulatoryCare) dataValues.push({ dataElement: "r76ODkNZv43", value: "true" });
      if (formData.supportDialysisCenters) dataValues.push({ dataElement: "E7OMKr09N0R", value: "true" });
      if (formData.supportHospices) dataValues.push({ dataElement: "GyQNkXpNraW", value: "true" });
      if (formData.supportLabServices) dataValues.push({ dataElement: "OgpVvPxkLwf", value: "true" });
      if (formData.supportNursingHomes) dataValues.push({ dataElement: "rLC2CE79p7Q", value: "true" });
      if (formData.supportOutpatientDepartment) dataValues.push({ dataElement: "w86r0XZCLCr", value: "true" });
      if (formData.supportPatientTransportation) dataValues.push({ dataElement: "m8Kl585eWSK", value: "true" });
      if (formData.supportPharmacy) dataValues.push({ dataElement: "yecnkdC7HtM", value: "true" });
      if (formData.additionalCounseling) dataValues.push({ dataElement: "i0QXYWMOUjy", value: "true" });
      if (formData.additionalCommunityBased) dataValues.push({ dataElement: "e48W7983nBs", value: "true" });

      const payload = {
        event: event.event,
        eventDate: today,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN", // Same program as Facility Ownership
        programStage: "uL262bA2IP3", // Services Offered program stage
        status: "COMPLETED",
        dataValues: dataValues,
      };

      console.log("Services Offered Update Payload:", payload);

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
        throw new Error(`Event update failed: ${eventRes.status} - ${errorText}`);
      }

      console.log("Services offered updated successfully!");
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      
      onClose();

    } catch (error) {
      console.error("Error updating services offered:", error);
      setErrorMessage(`Failed to update services offered: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Form is always valid since all fields are optional checkboxes
  const isFormValid = true;

  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Services Offered</h5>
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
          <form onSubmit={handleUpdateSubmit} className="service-offering-form">
            <h6 className="service-category">Core Services</h6>
            <div className="services-grid">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="coreEmergencyServices-edit"
                  name="coreEmergencyServices"
                  checked={formData.coreEmergencyServices}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="coreEmergencyServices-edit">Core Emergency Services</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="coreGeneralPracticeServices-edit"
                  name="coreGeneralPracticeServices"
                  checked={formData.coreGeneralPracticeServices}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="coreGeneralPracticeServices-edit">Core General Practice Services</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="coreTreatmentAndCare-edit"
                  name="coreTreatmentAndCare"
                  checked={formData.coreTreatmentAndCare}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="coreTreatmentAndCare-edit">Core Treatment and Care</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="coreUrgentCare-edit"
                  name="coreUrgentCare"
                  checked={formData.coreUrgentCare}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="coreUrgentCare-edit">Core Urgent Care</label>
              </div>
            </div>
            
            <h6 className="service-category">Specialised Services</h6>
            <div className="services-grid">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="specialisedMaternityAndReproductiveHealth-edit"
                  name="specialisedMaternityAndReproductiveHealth"
                  checked={formData.specialisedMaternityAndReproductiveHealth}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="specialisedMaternityAndReproductiveHealth-edit">Maternity & Reproductive Health</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="specialisedMentalHealthAndSubstanceAbuse-edit"
                  name="specialisedMentalHealthAndSubstanceAbuse"
                  checked={formData.specialisedMentalHealthAndSubstanceAbuse}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="specialisedMentalHealthAndSubstanceAbuse-edit">Mental Health & Substance Abuse</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="specialisedRadiology-edit"
                  name="specialisedRadiology"
                  checked={formData.specialisedRadiology}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="specialisedRadiology-edit">Radiology</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="specialisedRehabilitation-edit"
                  name="specialisedRehabilitation"
                  checked={formData.specialisedRehabilitation}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="specialisedRehabilitation-edit">Rehabilitation</label>
              </div>
            </div>
            
            <h6 className="service-category">Support Services</h6>
            <div className="services-grid">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportAmbulatoryCare-edit"
                  name="supportAmbulatoryCare"
                  checked={formData.supportAmbulatoryCare}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportAmbulatoryCare-edit">Ambulatory Care</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportDialysisCenters-edit"
                  name="supportDialysisCenters"
                  checked={formData.supportDialysisCenters}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportDialysisCenters-edit">Dialysis Centers</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportHospices-edit"
                  name="supportHospices"
                  checked={formData.supportHospices}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportHospices-edit">Hospices</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportLabServices-edit"
                  name="supportLabServices"
                  checked={formData.supportLabServices}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportLabServices-edit">Lab Services</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportNursingHomes-edit"
                  name="supportNursingHomes"
                  checked={formData.supportNursingHomes}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportNursingHomes-edit">Nursing Homes</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportOutpatientDepartment-edit"
                  name="supportOutpatientDepartment"
                  checked={formData.supportOutpatientDepartment}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportOutpatientDepartment-edit">Outpatient Department</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportPatientTransportation-edit"
                  name="supportPatientTransportation"
                  checked={formData.supportPatientTransportation}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportPatientTransportation-edit">Patient Transportation</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="supportPharmacy-edit"
                  name="supportPharmacy"
                  checked={formData.supportPharmacy}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="supportPharmacy-edit">Pharmacy</label>
              </div>
            </div>
            
            <h6 className="service-category">Additional Services</h6>
            <div className="services-grid">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="additionalHealthEducation-edit"
                  name="additionalHealthEducation"
                  checked={formData.additionalHealthEducation}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="additionalHealthEducation-edit">Health Education</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="additionalCounseling-edit"
                  name="additionalCounseling"
                  checked={formData.additionalCounseling}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="additionalCounseling-edit">Counseling</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="additionalCommunityBased-edit"
                  name="additionalCommunityBased"
                  checked={formData.additionalCommunityBased}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="additionalCommunityBased-edit">Community-Based Services</label>
              </div>
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
                {isLoading ? "Updating..." : "Update Services"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditServiceOfferingDialog; 