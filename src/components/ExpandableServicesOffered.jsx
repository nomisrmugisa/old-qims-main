import React, { useState } from 'react';
import './ExpandableServicesOffered.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';

const ExpandableServicesOffered = ({ 
  onAddService, 
  serviceEvents = [], 
  isLoading = false,
  onServiceRowClick = () => {}
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Process service data
  const processServiceData = () => {
    if (!serviceEvents || serviceEvents.length === 0) return [];
    
    // Get the most recent event (assuming it's the first one)
    const latestEvent = serviceEvents[0];
    const dataValues = latestEvent?.dataValues || [];
    
    // Map of service IDs to their display names
    const serviceMap = {
      // Core Services
      "j57HXXX4Ijz": "Emergency",
      "ECjGkIq0Deq": "General Practice",
      "aM41KiGDJAs": "Treatment & Care",
      "flzyZUlf30v": "Urgent Care",
      
      // Specialised Services
      "y9QSgKRoc6L": "Maternity & Reproductive",
      "yZhlCTgamq0": "Mental Health",
      "RCvjFJQUaPV": "Radiology",
      "uxcdCPnaqWL": "Rehabilitation",
      
      // Support Services
      "r76ODkNZv43": "Ambulatory Care",
      "E7OMKr09N0R": "Dialysis",
      "GyQNkXpNraW": "Hospices",
      "OgpVvPxkLwf": "Lab Services",
      "rLC2CE79p7Q": "Nursing Homes",
      "w86r0XZCLCr": "Outpatient",
      "m8Kl585eWSK": "Transportation",
      "yecnkdC7HtM": "Pharmacy",
      
      // Additional Services
      "SMvKa2EWeBO": "Health Education",
      "i0QXYWMOUjy": "Counseling",
      "e48W7983nBs": "Community-Based"
    };
    
    // Create service categories based on the data
    return Object.entries(serviceMap).map(([id, name]) => {
      const dataValue = dataValues.find(dv => dv.dataElement === id);
      const status = dataValue && dataValue.value === 'true' ? 'yes' : 'no';
      
      return {
        id,
        name,
        status
      };
    });
  };

  // Get service categories
  const serviceCategories = processServiceData();

  if (isLoading) {
    return (
      <div className="expandable-services-container loading">
        <p>Loading services data...</p>
      </div>
    );
  }

  return (
    <div className="expandable-services-container">
      <div className="services-header">
        <h3 className="services-title">
          Service Portfolio
          <button 
            className="toggle-button"
            onClick={handleToggle}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>
          <button 
            className="add-button"
            onClick={onAddService}
            aria-label="Add service"
          >
            <AddIcon />
          </button>
        </h3>
      </div>

      {expanded ? (
        <div className="services-detailed-view">
          {serviceEvents.length === 0 ? (
            <div className="no-services">
              <p>No service offering records found.</p>
            </div>
          ) : (
            <div className="modern-table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Core Services</th>
                    <th>Specialised Services</th>
                    <th>Support Services</th>
                    <th>Additional Services</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceEvents.map((event, index) => {
                    const dataValues = event.dataValues || [];
                    const getFormattedValue = (dataElementId) => {
                      const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                      return dataValue ? dataValue.value : 'None';
                    };

                    // Helper function to check if service type is offered
                    const isServiceOffered = (dataElementId) => {
                      return getFormattedValue(dataElementId) === 'true';
                    };

                    // Helper function to format boolean values with modern badges
                    const formatBooleanWithBadge = (value) => {
                      if (value === 'true') return '<span class="modern-status-badge success">Yes</span>';
                      if (value === 'false') return '<span class="modern-status-badge danger">No</span>';
                      return '<span class="modern-status-badge neutral">None</span>';
                    };

                    // Aggregate services by category
                    const coreServices = [
                      isServiceOffered("j57HXXX4Ijz") ? "Emergency" : "",
                      isServiceOffered("ECjGkIq0Deq") ? "General Practice" : "",
                      isServiceOffered("aM41KiGDJAs") ? "Treatment & Care" : "",
                      isServiceOffered("flzyZUlf30v") ? "Urgent Care" : "",
                    ].filter(Boolean).join(", ");
                    
                    const specialisedServices = [
                      isServiceOffered("y9QSgKRoc6L") ? "Maternity & Reproductive" : "",
                      isServiceOffered("yZhlCTgamq0") ? "Mental Health" : "",
                      isServiceOffered("RCvjFJQUaPV") ? "Radiology" : "",
                      isServiceOffered("uxcdCPnaqWL") ? "Rehabilitation" : "",
                    ].filter(Boolean).join(", ");
                    
                    const supportServices = [
                      isServiceOffered("r76ODkNZv43") ? "Ambulatory Care" : "",
                      isServiceOffered("E7OMKr09N0R") ? "Dialysis" : "",
                      isServiceOffered("GyQNkXpNraW") ? "Hospices" : "",
                      isServiceOffered("OgpVvPxkLwf") ? "Lab Services" : "",
                      isServiceOffered("rLC2CE79p7Q") ? "Nursing Homes" : "",
                      isServiceOffered("w86r0XZCLCr") ? "Outpatient" : "",
                      isServiceOffered("m8Kl585eWSK") ? "Transportation" : "",
                      isServiceOffered("yecnkdC7HtM") ? "Pharmacy" : "",
                    ].filter(Boolean).join(", ");
                    
                    const additionalServices = [
                      isServiceOffered("SMvKa2EWeBO") ? "Health Education" : "",
                      isServiceOffered("i0QXYWMOUjy") ? "Counseling" : "",
                      isServiceOffered("e48W7983nBs") ? "Community-Based" : "",
                    ].filter(Boolean).join(", ");

                    return (
                      <tr 
                        key={event.event || index}
                        onClick={() => onServiceRowClick(event)}
                      >
                        <td>{coreServices || "None"}</td>
                        <td>{specialisedServices || "None"}</td>
                        <td>{supportServices || "None"}</td>
                        <td>{additionalServices || "None"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="services-summary-view">
          {serviceEvents.length === 0 ? (
            <div className="no-services">
              <p>No service offering records found.</p>
            </div>
          ) : (
            <div className="service-categories">
              {serviceCategories.slice(0, 8).map(category => (
                <div 
                  className="category-item" 
                  key={category.id}
                  onClick={() => onServiceRowClick(serviceEvents[0])}
                >
                  <div className="category-name">{category.name}</div>
                  <div className={`category-status ${category.status}`}>
                    {category.status === 'yes' ? 'OFFERED' : 'NOT OFFERED'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpandableServicesOffered; 