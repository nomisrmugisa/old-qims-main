import React, { useState, useEffect } from 'react';
import './styles.css';
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

const EquipmentMachineryDetailed = ({ isOpen, onToggle }) => {
  const [equipmentItems, setEquipmentItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real application, this would be an API call
    setEquipmentItems(mockEquipmentData);
  }, []);

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
    <div>
      <div className="equipment-header-container">
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#333',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { color: '#4776E6' }
          }}
          onClick={onToggle}
        >
          Equipment & Machinery
          <IconButton 
            size="small" 
            sx={{ ml: 1, color: '#4776E6' }}
            onClick={onToggle}
          >
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <IconButton
            size="small"
            sx={{ 
              ml: 1, 
              bgcolor: '#4776E6', 
              color: 'white',
              '&:hover': { bgcolor: '#3d68d8' }
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Typography>
      </div>

      <Collapse in={isOpen}>
        <Box sx={{ mt: 2, mb: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              placeholder="Search equipment..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: '200px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: '150px' }}>
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
            
            <FormControl size="small" sx={{ minWidth: '150px' }}>
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
          </Box>

          {filteredEquipment.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Typography variant="body1" color="text.secondary">
                No equipment found matching your criteria.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredEquipment.map(item => {
                const daysUntilMaintenance = calculateDaysUntilMaintenance(item.nextMaintenance);
                const maintenanceUrgency = 
                  daysUntilMaintenance <= 7 ? 'urgent' : 
                  daysUntilMaintenance <= 30 ? 'upcoming' : 
                  'normal';
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #eee',
                        bgcolor: '#f8f9fa'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Chip 
                          label={item.status === 'operational' ? 'Operational' : 'Maintenance'} 
                          size="small"
                          sx={{ 
                            bgcolor: item.status === 'operational' ? '#e3f6e4' : '#fff3e0',
                            color: item.status === 'operational' ? '#2e7d32' : '#e65100',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            borderRadius: '12px'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ p: 2, flexGrow: 1 }}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Model
                          </Typography>
                          <Typography variant="body1">
                            {item.model}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Serial Number
                          </Typography>
                          <Typography variant="body1">
                            {item.serialNumber}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Last Maintenance
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(item.lastMaintenance)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Next Maintenance
                          </Typography>
                          <Typography 
                            variant="body1"
                            sx={{ 
                              color: maintenanceUrgency === 'urgent' ? '#d32f2f' : 
                                    maintenanceUrgency === 'upcoming' ? '#f57c00' : 'inherit',
                              fontWeight: maintenanceUrgency === 'urgent' ? 600 : 
                                        maintenanceUrgency === 'upcoming' ? 500 : 'inherit',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {formatDate(item.nextMaintenance)}
                            {maintenanceUrgency === 'urgent' && (
                              <Box 
                                component="span" 
                                sx={{ 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  ml: 1,
                                  width: 18,
                                  height: 18,
                                  bgcolor: '#d32f2f',
                                  color: 'white',
                                  borderRadius: '50%',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                !
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1,
                        bgcolor: '#fafafa'
                      }}>
                        <Button size="small" sx={{ textTransform: 'none' }}>
                          View History
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small" 
                          sx={{ textTransform: 'none' }}
                        >
                          {item.status === 'operational' ? 'Schedule Maintenance' : 'Update Status'}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Collapse>
    </div>
  );
};

// Main component that integrates with the existing UI
const EquipmentMachinery = () => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="equipment-machinery-container">
      <EquipmentMachineryDetailed isOpen={expanded} onToggle={handleToggle} />
    </div>
  );
};

export default EquipmentMachinery; 