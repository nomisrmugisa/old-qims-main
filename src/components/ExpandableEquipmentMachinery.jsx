import React, { useState } from 'react';
import './ExpandableEquipmentMachinery.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';

const ExpandableEquipmentMachinery = ({ 
  onAddEquipment, 
  equipmentEvents = [], 
  isLoading = false,
  onEquipmentRowClick = () => {}
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Process equipment data from DHIS2
  const processEquipmentData = () => {
    if (!equipmentEvents || equipmentEvents.length === 0) return [];
    
    // Get the most recent event (assuming it's the first one)
    const latestEvent = equipmentEvents[0];
    const dataValues = latestEvent?.dataValues || [];
    
    // Map of data element IDs to their display names
    const dataElementMap = {
      "Ldkhcngpzm0": "DEFIBRILLATOR",
      "Dpzjb4f4zie": "AMBULANCE",
      "iBa0EKW8Rs4": "OXYGEN SUPPLY",
      "BBk59Ex46rC": "RESUSCITATION BEDS",
      "mBr9e3ecOze": "BP MACHINES",
      "ftukRsNTA80": "EXAMINATION BEDS",
      "yA7QpYbNo7s": "THERMOMETERS",
      "K2Wj7GjneQq": "ANALYZERS",
      "RzTeaeV0dKS": "CENTRIFUGE",
      "tlh2pkI5qro": "FRIDGES",
      "H5zk9T4UZgr": "MICROSCOPES",
      "nh6jg8mhDpC": "CT SCANNER",
      "BDdXSCIVk5J": "MRI",
      "SuvRvDmUtN6": "PACS SYSTEMS",
      "OR7j7sVr19a": "X-RAY",
      "bDw85eij2QA": "DISPENSING COUNTERS",
      "VCWdWq5cnqo": "INVENTORY SOFTWARE",
      "SIq5ADQjCEM": "COMPLIANCE STATUS"
    };
    
    // Create equipment categories based on the data
    return Object.entries(dataElementMap).map(([id, name]) => {
      const dataValue = dataValues.find(dv => dv.dataElement === id);
      const status = dataValue && dataValue.value === 'true' ? 'yes' : 'no';
      
      return {
        id,
        name,
        status
      };
    });
  };

  // Get equipment categories - use real data if available, otherwise use empty array
  const equipmentCategories = processEquipmentData();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="expandable-equipment-container loading">
        <p>Loading equipment data...</p>
      </div>
    );
  }

  return (
    <div className="expandable-equipment-container">
      <div className="equipment-header">
        <h3 className="equipment-title">
          Equipment & Machinery
          <button 
            className="toggle-button"
            onClick={handleToggle}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>
          <button 
            className="add-button"
            onClick={onAddEquipment}
            aria-label="Add equipment"
          >
            <AddIcon />
          </button>
        </h3>
      </div>

      {expanded ? (
        <div className="equipment-detailed-view">
          {equipmentEvents.length === 0 ? (
            <div className="no-equipment">
              <p>No equipment records found.</p>
            </div>
          ) : (
            <div className="modern-table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Defibrillator</th>
                    <th>Ambulance</th>
                    <th>Oxygen Supply</th>
                    <th>Resuscitation Beds</th>
                    <th>BP Machines</th>
                    <th>Examination Beds</th>
                    <th>Thermometers</th>
                    <th>Analyzers</th>
                    <th>Centrifuge</th>
                    <th>Fridges</th>
                    <th>Microscopes</th>
                    <th>CT Scanner</th>
                    <th>MRI</th>
                    <th>PACS Systems</th>
                    <th>X-Ray</th>
                    <th>Dispensing Counters</th>
                    <th>Inventory Software</th>
                    <th>Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentEvents.map((event, index) => {
                    const dataValues = event.dataValues || [];
                    const getFormattedValue = (dataElementId) => {
                      const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                      return dataValue ? dataValue.value : 'None';
                    };

                    // Helper function to format boolean values with modern badges
                    const formatBooleanWithBadge = (value) => {
                      if (value === 'true') return '<span class="modern-status-badge success">Yes</span>';
                      if (value === 'false') return '<span class="modern-status-badge danger">No</span>';
                      return '<span class="modern-status-badge neutral">None</span>';
                    };

                    return (
                      <tr 
                        key={event.event || index}
                        onClick={() => onEquipmentRowClick(event)}
                      >
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("Ldkhcngpzm0")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("Dpzjb4f4zie")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("iBa0EKW8Rs4")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("BBk59Ex46rC")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("mBr9e3ecOze")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("ftukRsNTA80")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("yA7QpYbNo7s")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("K2Wj7GjneQq")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("RzTeaeV0dKS")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("tlh2pkI5qro")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("H5zk9T4UZgr")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("nh6jg8mhDpC")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("BDdXSCIVk5J")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("SuvRvDmUtN6")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("OR7j7sVr19a")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("bDw85eij2QA")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("VCWdWq5cnqo")) }}></td>
                        <td dangerouslySetInnerHTML={{ __html: formatBooleanWithBadge(getFormattedValue("SIq5ADQjCEM")) }}></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="equipment-summary-view">
          {equipmentEvents.length === 0 ? (
            <div className="no-equipment">
              <p>No equipment records found.</p>
            </div>
          ) : (
            <div className="equipment-categories">
              {equipmentCategories.slice(0, 12).map(category => (
                <div 
                  className="category-item" 
                  key={category.id}
                  onClick={() => onEquipmentRowClick(equipmentEvents[0])}
                >
                  <div className="category-name">{category.name}</div>
                  <div className={`category-status ${category.status}`}>
                    {category.status === 'yes' ? 'AVAILABLE' : 'NOT AVAILABLE'}
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

export default ExpandableEquipmentMachinery; 