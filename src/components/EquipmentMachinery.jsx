import React, { useState, useEffect } from 'react';
import './EquipmentMachinery.css';
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Collapse from "@mui/material/Collapse";

// Mock data - replace with actual API call
const mockEquipmentData = [
  {
    id: 1,
    name: "X-Ray Machine",
    model: "Philips DigitalDiagnost C90",
    serialNumber: "XR-2023-78945",
    purchaseDate: "2022-05-15",
    lastMaintenance: "2023-09-10",
    nextMaintenance: "2024-03-10",
    status: "operational",
    type: "imaging"
  },
  {
    id: 2,
    name: "Ultrasound Scanner",
    model: "GE Voluson E10",
    serialNumber: "US-2021-45678",
    purchaseDate: "2021-03-22",
    lastMaintenance: "2023-08-05",
    nextMaintenance: "2024-02-05",
    status: "operational",
    type: "imaging"
  },
  {
    id: 3,
    name: "ECG Machine",
    model: "Schiller CARDIOVIT AT-102",
    serialNumber: "ECG-2020-12345",
    purchaseDate: "2020-11-30",
    lastMaintenance: "2023-07-20",
    nextMaintenance: "2024-01-20",
    status: "maintenance",
    type: "diagnostic"
  },
  {
    id: 4,
    name: "Defibrillator",
    model: "Zoll R Series",
    serialNumber: "DF-2022-13579",
    purchaseDate: "2022-01-20",
    lastMaintenance: "2023-09-25",
    nextMaintenance: "2024-03-25",
    status: "operational",
    type: "emergency"
  }
];

const EquipmentMachinery = ({ onAddEquipment }) => {
  const [expanded, setExpanded] = useState(false);
  const [equipmentItems, setEquipmentItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real application, this would be an API call
    setEquipmentItems(mockEquipmentData);
  }, []);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Filter equipment items based on status, type and search query
  const filteredEquipment = equipmentItems.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  // Get unique equipment types for filter dropdown
  const equipmentTypes = ['all', ...new Set(equipmentItems.map(item => item.type))];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDaysUntilMaintenance = (nextMaintenanceDate) => {
    const today = new Date();
    const nextDate = new Date(nextMaintenanceDate);
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="equipment-machinery-container">
      <div className="equipment-header">
        <h2>
          Equipment & Machinery
          <button 
            className="toggle-button"
            onClick={handleToggle}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>
          <button 
            className="add-button"
            onClick={onAddEquipment}
          >
            +
          </button>
        </h2>
      </div>

      <Collapse in={expanded}>
        <div className="equipment-details">
          <div className="equipment-filters">
            <TextField
              placeholder="Search equipment..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl size="small" className="filter-field">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" className="filter-field">
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {equipmentTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {filteredEquipment.length === 0 ? (
            <div className="no-equipment">
              <p>No equipment found matching your criteria.</p>
            </div>
          ) : (
            <div className="equipment-grid">
              {filteredEquipment.map(item => {
                const daysUntilMaintenance = calculateDaysUntilMaintenance(item.nextMaintenance);
                const maintenanceUrgency = 
                  daysUntilMaintenance <= 7 ? 'urgent' : 
                  daysUntilMaintenance <= 30 ? 'upcoming' : 
                  'normal';
                
                return (
                  <div className="equipment-card" key={item.id}>
                    <div className="card-header">
                      <h3>{item.name}</h3>
                      <span className={`status-badge ${item.status}`}>
                        {item.status === 'operational' ? 'Operational' : 'Maintenance'}
                      </span>
                    </div>
                    
                    <div className="card-body">
                      <div className="detail-row">
                        <span className="detail-label">Model:</span>
                        <span className="detail-value">{item.model}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Serial Number:</span>
                        <span className="detail-value">{item.serialNumber}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Last Maintenance:</span>
                        <span className="detail-value">{formatDate(item.lastMaintenance)}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Next Maintenance:</span>
                        <span className={`detail-value maintenance-${maintenanceUrgency}`}>
                          {formatDate(item.nextMaintenance)}
                          {maintenanceUrgency === 'urgent' && (
                            <span className="maintenance-alert">!</span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <button className="btn-secondary">View History</button>
                      <button className="btn-primary">
                        {item.status === 'operational' ? 'Schedule Maintenance' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Collapse>
      
      {/* This is the existing equipment table that's always shown */}
      {!expanded && (
        <div className="equipment-table-container">
          {/* The existing table will be rendered by the parent component */}
        </div>
      )}
    </div>
  );
};

export default EquipmentMachinery; 