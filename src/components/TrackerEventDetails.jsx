import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  TextField,
  Card,
  CardContent,
  Button,
  Alert,
  Snackbar,
  Autocomplete,
  Paper,
  Chip,
  Container
} from '@mui/material';
import debounce from 'lodash/debounce';

// Define required fields for "Other Details" section
const requiredOtherDetailsFields = [
  'aMFg2iq9VIg', // Private Practice Number
  'HMk4LZ9ESOq', // Name of the License Holder
  'ykwhsQQPVH0', // Surname of License Holder
  'PdtizqOqE6Q', // Name of Facility to be Registered
  'VJzk8OdFJKA'  // Location in Botswana
];

const TrackerEventDetails = ({ onFormStatusChange, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFailureMessage, setShowFailureMessage] = useState(false);
  const [organisationalUnits, setOrganisationalUnits] = useState([]);
  const [filteredOrgUnits, setFilteredOrgUnits] = useState([]);
  const [isLoadingOrgUnits, setIsLoadingOrgUnits] = useState(false);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);



  const [locationName, setLocationName] = useState('');
  const credentials = localStorage.getItem('userCredentials');

  // Function to set dummy data for development/testing
  const setDummyData = () => {
    console.log('Setting dummy data');
    // Set minimal dummy data
    const dummyData = {
      dataValues: [
        { dataElement: 'HMk4LZ9ESOq', value: 'John' },
        { dataElement: 'ykwhsQQPVH0', value: 'Doe' },
        { dataElement: 'PdtizqOqE6Q', value: 'Test Facility' },
        { dataElement: 'VJzk8OdFJKA', value: 'DUMMY_LOCATION_ID' }
      ]
    };
    
    setEventData(dummyData);
    
    const dummyFormValues = {};
    dummyData.dataValues.forEach(dv => {
      dummyFormValues[dv.dataElement] = dv.value;
    });
    
    setFormValues(dummyFormValues);
    setLocationName('Test Location');
    setLoading(false);
    
    // Check form completion with dummy values
    checkFormCompletion(dummyFormValues);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const credentials = localStorage.getItem('userCredentials');
        const userOrgUnitId = localStorage.getItem('userOrgUnitId');

        if (!credentials || !userOrgUnitId) {
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        // Fetch user data to get the twitter value (DHIS2 Registration Code)
        const meResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me`, {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        });

        if (!meResponse.ok) {
          setError('Failed to fetch user data. Please try again.');
          setLoading(false);
          return;
        }

        const userData = await meResponse.json();
        console.log('User data:', userData);

        // Get the DHIS2 Registration Code from twitter field
        const registrationCode = userData.twitter;

        if (!registrationCode) {
          console.log('No registration code found in user data');
          // Fall back to dummy data if no registration code is found
          setDummyData();
          return;
        }

        // Try to fetch events using the direct endpoint with twitter value
        try {
          // Use the specified endpoint: /api/events/{twitter}
          const eventsUrl = `${import.meta.env.VITE_DHIS2_URL}/api/events/${registrationCode}`;

          const eventsResponse = await fetch(eventsUrl, {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          });

          if (!eventsResponse.ok) {
            throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
          }

          const eventData = await eventsResponse.json();
          console.log('Event data:', eventData);

          if (eventData) {
            setEventData(eventData);

            // Initialize form values
            const initialFormValues = {};
            if (eventData.dataValues) {
              console.log("Processing event data values...");
              eventData.dataValues.forEach(dv => {
                initialFormValues[dv.dataElement] = dv.value;
                console.log(`Data element ${dv.dataElement}: ${dv.value}`);
              });
            }
            console.log("Initial form values:", initialFormValues);
            setFormValues(initialFormValues);

            // If there's a location value, set the selected org unit
            const locationValue = initialFormValues['VJzk8OdFJKA'];
            console.log("Location value (VJzk8OdFJKA):", locationValue);
            
            if (locationValue) {
              console.log("Setting selected org unit with displayName:", locationValue);
              setSelectedOrgUnit({ displayName: locationValue });
            } else {
              console.log("No location value found in initial data");
            }

            // Check if all required fields are filled
            checkFormCompletion(initialFormValues);

            setLoading(false);
            console.log("Data loading completed");
            return;
          }

          // If no event data found, fall back to dummy data
          throw new Error('No event data found with the provided registration code');

        } catch (eventError) {
          console.error('Error fetching event data:', eventError);

          // Fall back to dummy data
          console.log('Falling back to dummy data');
          setDummyData();
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching data.');
        setLoading(false);
      }
    };


    fetchData();
  }, []);

  // Check if all required fields are filled
  const checkFormCompletion = (values) => {
    const isComplete = requiredOtherDetailsFields.every(field => {
      return values[field] && values[field].trim() !== '';
    });

    setIsFormComplete(isComplete);

    // Notify parent component about form status
    if (onFormStatusChange) {
      onFormStatusChange(isComplete);
    }

    // Also store in localStorage for access by other components
    localStorage.setItem('completeApplicationFormStatus', JSON.stringify(isComplete));
  };

  // Fetch organisational units when entering edit mode
  useEffect(() => {
    if (isEditing) {
      fetchOrganisationalUnits();
    }
  }, [isEditing]);

  // Monitor parentOrgUnitId changes
  useEffect(() => {
    // Removed debug logs for cleaner console
  }, []);

  // Update filtered org units when organizational units change or search query changes
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setFilteredOrgUnits(organisationalUnits);
    }
  }, [organisationalUnits]);

  // Check form completion whenever form values change
  useEffect(() => {
    checkFormCompletion(formValues);
  }, [formValues]);

  // Fetch organization unit name when location is available
  useEffect(() => {
    const fetchOrgUnitName = async () => {
      if (!formValues['VJzk8OdFJKA'] || !credentials) {
        return;
      }
      
      try {
        const apiUrl = `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnits/${formValues['VJzk8OdFJKA']}?fields=name`;
        
        const response = await fetch(
          apiUrl,
          {
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch organisation unit name");
        }

        const data = await response.json();
        
        if (data && data.name) {
          setLocationName(data.name);
          
          // We don't need to update formValues with the name anymore
          // as we're now keeping the ID in formValues
          // and storing the displayName separately in locationName
        }
      } catch (error) {
        console.error("Error fetching organization unit name:", error);
      }
    };

    fetchOrgUnitName();
  }, []);

  const fetchOrganisationalUnits = async () => {
    setIsLoadingOrgUnits(true);
    try {
      const credentials = localStorage.getItem('userCredentials');
      if (!credentials) {
        console.error("No credentials found");
        setIsLoadingOrgUnits(false);
        return [];
      }

      const response = await fetch(
        `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnits.json?filter=level:eq:4&fields=id,displayName&paging=false`,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch organisational units");
      }
      const data = await response.json();
      setOrganisationalUnits(data.organisationUnits);
      setFilteredOrgUnits(data.organisationUnits);
      return data.organisationUnits;
    } catch (error) {
      console.error("Error fetching organisational units:", error);
      return [];
    } finally {
      setIsLoadingOrgUnits(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      const filtered = organisationalUnits.filter((unit) =>
        unit.displayName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOrgUnits(filtered);
    }, 300),
    [organisationalUnits]
  );

  // Handle search input change
  const handleSearchChange = (event, value) => {
    setSearchQuery(value || '');
    debouncedSearch(value || '');
  };

  // Helper function to get data value from data element ID
  const getDataValue = (dataElementId) => {
    if (!eventData || !eventData.dataValues) return 'N/A';

    const dataValue = eventData.dataValues.find(dv => dv.dataElement === dataElementId);
    return dataValue ? dataValue.value : 'N/A';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Handle form field changes
  const handleChange = (e, dataElementId) => {
    const newFormValues = {
      ...formValues,
      [dataElementId]: typeof e.target.value === 'string' ? e.target.value.trim() : e.target.value
    };
    setFormValues(newFormValues);
  };

  // Handle location change
  const handleLocationChange = (event, newValue) => {
    setSelectedOrgUnit(newValue);
    const newFormValues = { ...formValues };

    if (newValue) {
      // Store the organization unit ID in VJzk8OdFJKA field
      newFormValues['VJzk8OdFJKA'] = newValue.id;
      
      // Also update locationName with the display name for rendering
      setLocationName(newValue.displayName);
    } else {
      newFormValues['VJzk8OdFJKA'] = '';
      setLocationName('');
    }

    setFormValues(newFormValues);
  };

  // Toggle edit mode
  const handleToggleEdit = async () => {
    if (isEditing) {
      // Reset form values to original data when canceling
      const originalValues = {};
      if (eventData && eventData.dataValues) {
        eventData.dataValues.forEach(dv => {
          originalValues[dv.dataElement] = dv.value;
        });
      }
      setFormValues(originalValues);

      // Reset selected org unit 
      setSelectedOrgUnit(null); 

      // Reset search
      setSearchQuery('');
      setFilteredOrgUnits(organisationalUnits);

      // Check form completion with original values
      checkFormCompletion(originalValues);
    } else {
      // Always fetch fresh org units when entering edit mode
      const fetchedOrgUnits = await fetchOrganisationalUnits();
      
      // After fetching organizational units, try to match the current ID
      if (formValues['VJzk8OdFJKA']) {
        const matchingOrgUnit = fetchedOrgUnits.find(unit => unit.id === formValues['VJzk8OdFJKA']);
        if (matchingOrgUnit) {
          // If found in our list, use it
          setSelectedOrgUnit(matchingOrgUnit);
        } else {
          // If we can't find it in the list but we have a name, create a synthetic option
          setSelectedOrgUnit({ 
            id: formValues['VJzk8OdFJKA'],
            displayName: locationName || formValues['VJzk8OdFJKA']
          });
          
          // If locationName is empty but we have an ID, try to fetch the name directly
          if (!locationName && formValues['VJzk8OdFJKA']) {
            const credentials = localStorage.getItem('userCredentials');
            try {
              const response = await fetch(
                `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnits/${formValues['VJzk8OdFJKA']}?fields=name`,
                {
                  headers: {
                    Authorization: `Basic ${credentials}`,
                  },
                }
              );
              
              if (response.ok) {
                const data = await response.json();
                if (data && data.name) {
                  setLocationName(data.name);
                  setSelectedOrgUnit(prev => ({
                    ...prev,
                    displayName: data.name
                  }));
                }
              }
            } catch (err) {
              console.error("Error fetching org unit name:", err);
            }
          }
        }
      }
    }
    setIsEditing(!isEditing);
  };





  const handleSubmit = async () => {
    setUpdating(true);
    setUpdateError("");

    try {
      const credentials = localStorage.getItem('userCredentials');
      if (!credentials) {
        throw new Error("Authentication required. Please log in again.");
      }

      if (!eventData || !eventData.event) {
        throw new Error("No event data available for update.");
      }

      // Build updated dataValues array - include ALL existing data values to preserve data
      const dataValues = [];
      
      // First, add all existing dataValues to preserve non-editable fields
      if (eventData.dataValues) {
        eventData.dataValues.forEach(existingDv => {
          dataValues.push({
            dataElement: existingDv.dataElement,
            value: existingDv.value
          });
        });
      }
      
      // Then update/add the editable fields
      const editableFields = {
        "aMFg2iq9VIg": formValues['aMFg2iq9VIg'] || "", // Private Practice Number
        "HMk4LZ9ESOq": formValues['HMk4LZ9ESOq'] || "", // License Holder First Name
        "ykwhsQQPVH0": formValues['ykwhsQQPVH0'] || "", // License Holder Surname
        "PdtizqOqE6Q": formValues['PdtizqOqE6Q'] || "", // Facility Name
        "VJzk8OdFJKA": formValues['VJzk8OdFJKA'] || ""  // Location
      };
      
      // Update existing fields or add new ones
      Object.entries(editableFields).forEach(([dataElement, value]) => {
        const existingIndex = dataValues.findIndex(dv => dv.dataElement === dataElement);
        if (existingIndex >= 0) {
          // Update existing field
          dataValues[existingIndex].value = value;
        } else if (value.trim() !== "") {
          // Add new field if it has a value
          dataValues.push({ dataElement, value });
        }
      });

      // Prepare update payload - preserve existing event structure
      const payload = {
        event: eventData.event,
        eventDate: eventData.eventDate || new Date().toISOString().split('T')[0],
        orgUnit: eventData.orgUnit,
        program: eventData.program,
        programStage: eventData.programStage,
        enrollment: eventData.enrollment,
        trackedEntityInstance: eventData.trackedEntityInstance,
        status: eventData.status || "COMPLETED",
        dataValues: dataValues
      };

      console.log("Updating application details with payload:", payload);

      // Send PUT request to update the event
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${eventData.event}`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", errorText);
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Update response:", responseData);

      // Show success message and exit edit mode
      setUpdateSuccess(true);
      setIsEditing(false);
      console.log("Application details updated successfully!");

      // Show custom success message before switching tabs
      setShowSuccessMessage(true);
      
      // Wait for 2 seconds to show the message, then call parent callback
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Call the onUpdateSuccess callback to notify parent component
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      }, 2000);

      // Update the local eventData with new values to reflect changes immediately
      const updatedEventData = { ...eventData };
      if (updatedEventData.dataValues) {
        // Update existing dataValues or add new ones
        dataValues.forEach(newDv => {
          const existingIndex = updatedEventData.dataValues.findIndex(dv => dv.dataElement === newDv.dataElement);
          if (existingIndex >= 0) {
            updatedEventData.dataValues[existingIndex].value = newDv.value;
          } else {
            updatedEventData.dataValues.push(newDv);
          }
        });
      } else {
        updatedEventData.dataValues = dataValues;
      }
      setEventData(updatedEventData);

    } catch (error) {
      console.error("Error updating application details:", error);
      setUpdateError(`Failed to update application details: ${error.message}`);
      
      // Show custom failure message
      setShowFailureMessage(true);
      
      // Hide failure message after 4 seconds
      setTimeout(() => {
        setShowFailureMessage(false);
      }, 4000);
    } finally {
      setUpdating(false);
    }
  };

  // ------------------- End --------------------

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setUpdateSuccess(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">Error: {error}</Typography>
        <Typography variant="body2" mt={1}>
          Please ensure you have completed the application process and have a valid DHIS2 Registration Code.
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* Custom Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          zIndex: 999999,
          top: '20px !important'
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            minWidth: '400px',
            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.4)',
            border: '2px solid #2e7d32',
            background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
          }}
          icon={<span style={{ fontSize: '1.5rem' }}>✅</span>}
        >
          🎉 Other details submitted successfully! 🎉
        </Alert>
      </Snackbar>

      {/* Custom Failure Message */}
      <Snackbar
        open={showFailureMessage}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          zIndex: 999999,
          top: '20px !important'
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            minWidth: '400px',
            boxShadow: '0 8px 32px rgba(211, 47, 47, 0.4)',
            border: '2px solid #d32f2f',
            background: 'linear-gradient(45deg, #f44336, #ef5350)'
          }}
          icon={<span style={{ fontSize: '1.5rem' }}>❌</span>}
        >
          ⚠️ Failure, Contact Admin ⚠️
        </Alert>
      </Snackbar>

      {/* Original Success message (still needed for other updates) */}
      <Snackbar
        open={updateSuccess && !showSuccessMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Application details updated successfully!
        </Alert>
      </Snackbar>

      {/* Error message */}
      {updateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateError}
        </Alert>
      )}

      {/* Form completion status indicator */}
      {!isFormComplete && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please fill in all required fields to complete this section.
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            Complete Application: Preliminary Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Submission Date"
                value={formatDate(eventData?.eventDate)}
                fullWidth
                size="small"
                margin="dense"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Employee User Name"
                value={getDataValue('g3J1CH26hSA')}
                fullWidth
                size="small"
                margin="dense"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="B.H.P.C Registration Number"
                value={getDataValue('SVzSsDiZMN5')}
                fullWidth
                size="small"
                margin="dense"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Phone Number"
                value={getDataValue('SReqZgQk0RY')}
                fullWidth
                size="small"
                margin="dense"
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            Other Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Private Practice Number"
                value={formValues['aMFg2iq9VIg'] || ''}
                onChange={(e) => handleChange(e, 'aMFg2iq9VIg')}
                fullWidth
                size="small"
                margin="dense"
                disabled={!isEditing || updating}
                required
                error={!formValues['aMFg2iq9VIg'] && !loading}
                helperText={!formValues['aMFg2iq9VIg'] && !loading ? "This field is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name of the License Holder"
                value={formValues['HMk4LZ9ESOq'] || ''}
                onChange={(e) => handleChange(e, 'HMk4LZ9ESOq')}
                fullWidth
                size="small"
                margin="dense"
                disabled={!isEditing || updating}
                required
                error={!formValues['HMk4LZ9ESOq'] && !loading}
                helperText={!formValues['HMk4LZ9ESOq'] && !loading ? "This field is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Surname of License Holder"
                value={formValues['ykwhsQQPVH0'] || ''}
                onChange={(e) => handleChange(e, 'ykwhsQQPVH0')}
                fullWidth
                size="small"
                margin="dense"
                disabled={!isEditing || updating}
                required
                error={!formValues['ykwhsQQPVH0'] && !loading}
                helperText={!formValues['ykwhsQQPVH0'] && !loading ? "This field is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name of Facility to be Registered"
                value={formValues['PdtizqOqE6Q'] || ''}
                onChange={(e) => handleChange(e, 'PdtizqOqE6Q')}
                fullWidth
                size="small"
                margin="dense"
                disabled={!isEditing || updating}
                required
                error={!formValues['PdtizqOqE6Q'] && !loading}
                helperText={!formValues['PdtizqOqE6Q'] && !loading ? "This field is required" : ""}
              />
            </Grid>
          </Grid>

          {/* Location field */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.primary' }}>
              Location in Botswana <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box sx={{ position: 'relative' }}>
              {isEditing ? (
                <>
                  <Autocomplete
                    options={filteredOrgUnits}
                    getOptionLabel={(option) => option.displayName || ''}
                    value={selectedOrgUnit}
                    onChange={handleLocationChange}
                    onInputChange={handleSearchChange}
                    loading={isLoadingOrgUnits}
                    disabled={updating}
                    fullWidth
                    size="small"
                    ListboxProps={{
                      style: { maxHeight: '200px' }
                    }}
                    PaperComponent={props => (
                      <Paper
                        {...props}
                        elevation={3}
                        sx={{
                          maxHeight: 200,
                          width: '100%',
                          '& .MuiAutocomplete-option': {
                            py: 1,
                            px: 2,
                            borderBottom: '1px solid #eee',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white'
                            }
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Typography noWrap>
                          {option.displayName}
                        </Typography>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        fullWidth
                        placeholder="Search for a location..."
                        size="small"
                        margin="dense"
                        required
                        error={!formValues['VJzk8OdFJKA'] && !loading}
                        helperText={!formValues['VJzk8OdFJKA'] && !loading ? "Location is required" : ""}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused': {
                              borderColor: 'primary.main',
                              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                            }
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingOrgUnits ? <CircularProgress color="primary" size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                  {filteredOrgUnits.length > 0 && searchQuery && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: 'text.secondary'
                      }}
                    >
                      {filteredOrgUnits.length} location{filteredOrgUnits.length !== 1 ? 's' : ''} found
                    </Typography>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    p: 1.5,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    bgcolor: '#f9f9f9',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    borderColor: !formValues['VJzk8OdFJKA'] && !loading ? 'error.main' : '#ddd'
                  }}
                >
                  {formValues['VJzk8OdFJKA'] ? (
                    <Chip
                      label={locationName || formValues['VJzk8OdFJKA']}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  ) : (
                    <Typography color="error" variant="body2">Location is required</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleToggleEdit}
                disabled={updating}
                size="small"
              >
                Edit Details
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleToggleEdit}
                  disabled={updating}
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={updating}
                  size="small"
                >
                  {updating ? 'Updating...' : 'Update Application Details'}
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TrackerEventDetails; 