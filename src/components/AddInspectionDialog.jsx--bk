import React, { useState, useEffect, useCallback } from 'react';
import './AddInspectionDialog.css';
import ModalPortal from './ModalPortal';
import Loading from './Loading'; // Reusable loading component
import Dhis2Input from './Dhis2Input'; // Import the new component
import {StorageService} from '../services';

const AddInspectionDialog = ({ open, onClose, onSuccess, trackedEntityInstanceId, existingEvent, isEditMode = false }) => {
  const [programStageMetadata, setProgramStageMetadata] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventId, setEventId] = useState(null);

  // Fetch Program Stage Metadata
  const fetchProgramStageMetadata = useCallback(async () => {
    const credentials = await StorageService.get('userCredentials');
    if (!credentials) {
      setErrorMessage("Authentication required.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/programStages/Eupjm3J0dt2?fields=name,programStageSections[name,id,dataElements[displayFormName,id,valueType,compulsory,optionSet[id,displayName,options[id,displayName,code,sortOrder]]]]`,
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

    const credentials = await StorageService.get('userCredentials');
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
        programStage: "Eupjm3J0dt2",
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
    if (isLoading) return <Loading message="Loading inspection form..." />;
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
          <h5 className="modal-title">Situational Analysis</h5>
          <button type="button" className="close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="inspection-layout-container">
            <div className="section-tabs-vertical">
              {programStageMetadata && programStageMetadata.programStageSections.map(section => {
                // Override display name for specific sections
                const getDisplayName = (sectionName) => {
                  if (sectionName === "Self Assessment Details") {
                    return "Date and Time";
                  }
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
                  {isSubmitting ? 'Submitting...' : 'Submit Self Assessment'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddInspectionDialog; 