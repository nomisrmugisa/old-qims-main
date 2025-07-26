import React, { useState } from 'react';
import './ExpandableStatutoryCompliance.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';

const ExpandableStatutoryCompliance = ({ 
  onAddStatutoryCompliance, 
  statutoryComplianceEvents = [], 
  isLoading = false,
  statutoryComplianceMetadata = null,
  onStatutoryComplianceRowClick = () => {}
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Process compliance data
  const processComplianceData = () => {
    if (!statutoryComplianceEvents || statutoryComplianceEvents.length === 0 || !statutoryComplianceMetadata) {
      return [];
    }
    
    // Get the most recent event (assuming it's the first one)
    const latestEvent = statutoryComplianceEvents[0];
    const dataValues = latestEvent?.dataValues || [];
    
    // Create a map of data elements from metadata
    const dataElements = {};
    if (statutoryComplianceMetadata.programStageSections) {
      statutoryComplianceMetadata.programStageSections.forEach(section => {
        section.dataElements.forEach(de => {
          dataElements[de.id] = {
            name: de.displayFormName,
            valueType: de.valueType
          };
        });
      });
    }
    
    // Create compliance categories based on the data
    return Object.entries(dataElements).map(([id, details]) => {
      const dataValue = dataValues.find(dv => dv.dataElement === id);
      let status = 'none';
      
      if (details.valueType === 'BOOLEAN' || details.valueType === 'TRUE_ONLY') {
        status = dataValue && dataValue.value === 'true' ? 'yes' : 'no';
      } else if (details.valueType === 'FILE_RESOURCE') {
        status = dataValue && dataValue.value ? 'yes' : 'none';
      }
      
      return {
        id,
        name: details.name,
        status
      };
    });
  };

  // Get compliance categories
  const complianceCategories = processComplianceData();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="expandable-compliance-container loading">
        <p>Loading statutory compliance data...</p>
      </div>
    );
  }

  return (
    <div className="expandable-compliance-container">
      <div className="compliance-header">
        <h3 className="compliance-title">
          Statutory Compliance
          <button 
            className="toggle-button"
            onClick={handleToggle}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>
          <button 
            className="add-button"
            onClick={onAddStatutoryCompliance}
            aria-label="Add statutory compliance"
          >
            <AddIcon />
          </button>
        </h3>
      </div>

      {expanded ? (
        <div className="compliance-detailed-view">
          {statutoryComplianceEvents.length === 0 ? (
            <div className="no-compliance">
              <p>No statutory compliance records found.</p>
            </div>
          ) : (
            <div className="modern-table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    {statutoryComplianceMetadata && statutoryComplianceMetadata.programStageSections && 
                      statutoryComplianceMetadata.programStageSections.flatMap(section =>
                        section.dataElements.map(de => (
                          <th key={de.id}>{de.displayFormName}</th>
                        ))
                      )
                    }
                  </tr>
                </thead>
                <tbody>
                  {statutoryComplianceEvents.map((event, index) => {
                    const dataValues = event.dataValues || [];
                    
                    // Helper function to format values with modern badges
                    const formatValueWithBadge = (value, valueType) => {
                      if (valueType === 'FILE_RESOURCE') {
                        if (value) return '<span class="modern-status-badge success">Submitted</span>';
                        return '<span class="modern-status-badge neutral">None</span>';
                      }
                      if (valueType === 'BOOLEAN' || valueType === 'TRUE_ONLY') {
                        if (value === 'true') return '<span class="modern-status-badge success">Yes</span>';
                        if (value === 'false') return '<span class="modern-status-badge danger">No</span>';
                        return '<span class="modern-status-badge neutral">None</span>';
                      }
                      return value || 'None';
                    };

                    return (
                      <tr key={event.event || index} onClick={() => onStatutoryComplianceRowClick(event)}>
                        {statutoryComplianceMetadata && statutoryComplianceMetadata.programStageSections && 
                          statutoryComplianceMetadata.programStageSections.flatMap(section =>
                            section.dataElements.map(de => {
                              const value = dataValues.find(dv => dv.dataElement === de.id)?.value;
                              const formattedValue = formatValueWithBadge(value, de.valueType);
                              
                              if (de.valueType === 'FILE_RESOURCE' || de.valueType === 'BOOLEAN' || de.valueType === 'TRUE_ONLY') {
                                return <td key={de.id} dangerouslySetInnerHTML={{ __html: formattedValue }}></td>;
                              }
                              return <td key={de.id}>{formattedValue}</td>;
                            })
                          )
                        }
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="compliance-summary-view">
          {statutoryComplianceEvents.length === 0 ? (
            <div className="no-compliance">
              <p>No statutory compliance records found.</p>
            </div>
          ) : (
            <div className="compliance-categories">
              {complianceCategories.slice(0, 8).map(category => (
                <div 
                  className="category-item" 
                  key={category.id}
                  onClick={() => onStatutoryComplianceRowClick(statutoryComplianceEvents[0])}
                >
                  <div className="category-name">{category.name}</div>
                  <div className={`category-status ${category.status}`}>
                    {category.status === 'yes' ? 'COMPLIANT' : category.status === 'no' ? 'NON-COMPLIANT' : 'NOT SPECIFIED'}
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

export default ExpandableStatutoryCompliance; 