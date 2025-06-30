import React, { useState, useEffect, useCallback } from 'react';
import './AddInspectionDialog.css'; // Reuse the same CSS for consistency
import ModalPortal from './ModalPortal';
import Loading from './Loading';
import Dhis2Input from './Dhis2Input'; // Import the new component

const EditInspectionDialog = ({ open, onClose, onSuccess, event }) => {
  const [programStageMetadata, setProgramStageMetadata] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Program Stage Metadata
  const fetchProgramStageMetadata = useCallback(async () => {
    setIsLoading(true);
    const credentials = localStorage.getItem('userCredentials');
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
      
      if (metadata.programStageSections && metadata.programStageSections.length > 0) {
        setActiveSection(metadata.programStageSections[0].id);
      }
      
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Populate form with existing data when the dialog opens or event changes
  useEffect(() => {
    if (open) {
      fetchProgramStageMetadata();
      
      if (event && event.dataValues) {
        const initialData = {};
        event.dataValues.forEach(dv => {
          initialData[dv.dataElement] = dv.value;
        });
        setFormData(initialData);
      }
    }
  }, [open, event, fetchProgramStageMetadata]);
  
  const handleInputChange = (dataElementId, value) => {
    setFormData(prev => ({ ...prev, [dataElementId]: value }));
  };

  const handleUpdateSubmit = async (e) => {
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

      const dataValues = Object.entries(formData)
        .filter(([, value]) => value !== null && value !== '')
        .map(([dataElement, value]) => ({
          dataElement,
          value: value.toString(),
        }));

      const payload = {
        event: event.event,
        trackedEntityInstance: event.trackedEntityInstance,
        orgUnit: orgUnitId,
        program: "EE8yeLVo6cN",
        programStage: "Eupjm3J0dt2",
        status: "COMPLETED", // Keep status as completed or active based on workflow
        dataValues,
      };

      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${event.event}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${credentials}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
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
          <h5 className="modal-title">Edit: Situational Analysis</h5>
          <button type="button" className="close-btn" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="inspection-layout-container">
            <div className="section-tabs-vertical">
              {programStageMetadata && programStageMetadata.programStageSections.map(section => (
                <button
                  key={section.id}
                  className={`section-tab ${activeSection === section.id ? "active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.name}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="inspection-form">
              {renderFormBody()}
              
              <div className="button-container">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? 'Updating...' : 'Update Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditInspectionDialog; 