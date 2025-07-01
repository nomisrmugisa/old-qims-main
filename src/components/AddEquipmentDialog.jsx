import React, { useState, useEffect, useCallback } from 'react';
import './AddInspectionDialog.css'; // Reuse the existing inspection dialog styles
import ModalPortal from './ModalPortal';
import Loading from './Loading';
import Dhis2Input from './Dhis2Input';

const AddEquipmentDialog = ({ open, onClose, onSuccess, trackedEntityInstanceId, existingEvent, isEditMode = false }) => {
  const [programStageMetadata, setProgramStageMetadata] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventId, setEventId] = useState(null);

  // Fetch Program Stage Metadata for Equipment & Machinery
  const fetchProgramStageMetadata = useCallback(async () => {
    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
      setErrorMessage("Authentication required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/programStages/chlbXjBiIup?fields=name,programStageSections[name,id,dataElements[displayFormName,id,valueType,compulsory,optionSet[id,displayName,options[id,displayName,code,sortOrder]]]]`,
        {
          headers: { Authorization: `Basic ${credentials}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status}`);
      }

      const metadata = await response.json();
      setProgramStageMetadata(metadata);
      
      // Set the first section as active by default
      if (metadata.programStageSections && metadata.programStageSections.length > 0) {
        setActiveSection(metadata.programStageSections[0].id);
      }
      
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initialize form or load existing data
  useEffect(() => {
    if (open) {
      fetchProgramStageMetadata();
      
      if (isEditMode && existingEvent) {
        setEventId(existingEvent.event);
        const initialData = {};
        if (existingEvent.dataValues) {
          existingEvent.dataValues.forEach(dv => {
            initialData[dv.dataElement] = dv.value;
          });
        }
        setFormData(initialData);
        setIsLoading(false);
      } else if (!isEditMode) {
        setFormData({});
        setIsLoading(false);
      }
    }
  }, [open, isEditMode, existingEvent, fetchProgramStageMetadata]);
  
  const handleInputChange = (dataElementId, value) => {
    setFormData(prev => ({ ...prev, [dataElementId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const credentials = localStorage.getItem('userCredentials');
    if (!credentials) {
      setErrorMessage("Authentication required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const orgUnitId = (await (await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me.json`, { headers: { Authorization: `Basic ${credentials}` }})).json()).organisationUnits[0].id;
      const today = new Date().toISOString().split('T')[0];

      const dataValues = Object.entries(formData)
        .filter(([, value]) => value !== null && value !== '')
        .map(([dataElement, value]) => ({
          dataElement,
          value: value.toString(),
        }));

      let payload = {
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "chlbXjBiIup", // Equipment & Machinery program stage
        status: "COMPLETED",
        dataValues,
      };

      let response;
      if (isEditMode) {
        payload = { ...payload, event: eventId, trackedEntityInstance: existingEvent.trackedEntityInstance };
        response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Basic ${credentials}` },
          body: JSON.stringify(payload),
        });
      } else {
        payload = { ...payload, trackedEntityInstance: trackedEntityInstanceId, eventDate: today };
        response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Basic ${credentials}` },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${response.status} - ${errorText}`);
      }
      
      onSuccess();
      onClose();

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormBody = () => {
    if (isLoading) return <Loading message="Loading equipment form..." />;
    if (errorMessage) return <div className="alert alert-danger">{errorMessage}</div>;
    if (!programStageMetadata) return <div className="alert alert-warning">Form metadata could not be loaded.</div>;

    const currentSectionData = programStageMetadata.programStageSections.find(s => s.id === activeSection);

    return (
      <div className="dynamic-form-body">
        {currentSectionData && currentSectionData.dataElements.map(de => (
          <div key={de.id} className="form-group-dhis2">
            <Dhis2Input
              dataElement={de}
              value={formData[de.id] || ''}
              onChange={handleInputChange}
            />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <ModalPortal open={open} onClose={onClose}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '900px' }}>
        <div className="modal-header">
          <h5 className="modal-title">{isEditMode ? 'Edit: Equipment & Machinery' : 'Equipment & Machinery'}</h5>
          <button type="button" className="close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="inspection-layout-container">
            <div className="section-tabs-vertical">
              {programStageMetadata && programStageMetadata.programStageSections.map(section => {
                // Override display name for specific sections if needed
                const getDisplayName = (sectionName) => {
                  return sectionName;
                };
                
                return (
                  <button
                    key={section.id}
                    className={`section-tab ${activeSection === section.id ? "active" : ""}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {getDisplayName(section.name)}
                  </button>
                );
              })}
            </div>
            
            <form onSubmit={handleSubmit} className="inspection-form">
              {renderFormBody()}
              
              <div className="button-container">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? 'Submitting...' : isEditMode ? 'Update Equipment' : 'Submit Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddEquipmentDialog; 