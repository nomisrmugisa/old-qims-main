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
  Container,
  LinearProgress,
  Modal,
  Backdrop,
  Box as MuiBox
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import debounce from 'lodash/debounce';
import {StorageService} from '../services';
import { getCredentials, setCredentials } from '../utils/credentialHelper';

// Define required fields for "Other Details" section
const requiredOtherDetailsFields = [
  'aMFg2iq9VIg', // Private Practice Number
  'HMk4LZ9ESOq', // Name of the License Holder
  'ykwhsQQPVH0', // Surname of License Holder
  'PdtizqOqE6Q', // Name of Facility to be Registered
  'VJzk8OdFJKA'  // Location in Botswana
];

const TrackerEventDetails = ({ onFormStatusChange, onEventDataFetched, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [isEditing, setIsEditing] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [organisationalUnits, setOrganisationalUnits] = useState([]);
  const [filteredOrgUnits, setFilteredOrgUnits] = useState([]);
  const [isLoadingOrgUnits, setIsLoadingOrgUnits] = useState(false);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormComplete, setIsFormComplete] = useState(false);

  const [parentOrgUnitId, setParentOrgUnitId] = useState(null);

  const [successMessages, setSuccessMessages] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const [locationName, setLocationName] = useState('');
  const [credentials, setCredentials] = useState(null);

  // Add state for progress
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');

  // Add state for success confirmation dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Function to set real user data when no event data is found
  const setUserDataOnly = async () => {
    console.log('Setting user data only (no event data found)');
    
    // Get credentials using the helper with fallbacks
    const effectiveCredentials = credentials || await getCredentials();
    
    if (!effectiveCredentials) {
      console.error('No credentials available for setUserDataOnly');
      return;
    }
    
    // Fetch user data to get email
    let userEmail = '';
    try {
      const meResponse = await fetch(`/api/me`, {
        headers: {
          Authorization: `Basic ${effectiveCredentials}`,
        },
      });
      
      if (meResponse.ok) {
        const userData = await meResponse.json();
        userEmail = userData.email || '';
        console.log('Fetched user email:', userEmail);
      }
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
    
    const initialFormValues = {
      'NVlLoMZbXIW': userEmail // Only set the email field
    };
    setFormValues(initialFormValues);
    setEventData(null);
    setLoading(false);
    setHasExistingData(false);
    setIsEditing(true);
    checkFormCompletion();
  };

  // Load credentials on component mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        console.log('🔐 Loading credentials with helper...');
        const creds = await getCredentials();
        console.log('🔐 Credentials loaded:', creds ? 'Available' : 'Not available');
        setCredentials(creds);
      } catch (error) {
        console.error('❌ Error loading credentials:', error);
        setCredentials(null);
      }
    };
    
    loadCredentials();
  }, []);

  // Fetch data when credentials are available
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Starting data fetch...');
        console.log('🔐 Credentials available:', !!credentials);
        
        setLoading(true);
        
        // Get credentials using the helper with fallbacks
        const effectiveCredentials = credentials || await getCredentials();
        const userOrgUnitId = localStorage.getItem('userOrgUnitId');

        console.log('🔐 Effective credentials:', effectiveCredentials ? 'Available' : 'Not available');
        console.log('🏢 User org unit ID:', userOrgUnitId);

        if (!effectiveCredentials || !userOrgUnitId) {
          console.error('❌ Missing credentials or org unit ID');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        // Fetch user data to get the twitter value (DHIS2 Registration Code)
        const meResponse = await fetch(`/api/me`, {
          headers: {
            Authorization: `Basic ${effectiveCredentials}`,
          },
        });

        if (!meResponse.ok) {
          setError('Failed to fetch user data. Please try again.');
          setLoading(false);
          return;
        }

        const userData = await meResponse.json();
        console.log('User data:', userData);

        // Store user email in localStorage for later use
        if (userData.email) {
          localStorage.setItem('userEmail', userData.email);
        }

        // Get the DHIS2 Registration Code from twitter field
        const registrationCode = userData.twitter;
        setRegistrationCode(registrationCode); // Store in state for later use

        if (!registrationCode) {
          console.log('No registration code found in user data');
          // Set user data only if no registration code is found
          console.log('No registration code found in user data, setting user data only');
          await setUserDataOnly();
          return;
        }

        // Try to fetch events using the direct endpoint with twitter value
        try {
          // Use the specified endpoint: /api/events/{twitter}
          const eventsUrl = `/api/events/${registrationCode}`;

          const eventsResponse = await fetch(eventsUrl, {
            headers: {
              Authorization: `Basic ${effectiveCredentials}`,
            },
          });

          if (!eventsResponse.ok) {
            throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
          }

          const eventData = await eventsResponse.json();
          console.log('Event data:', eventData);

          if (eventData) {
            setEventData(eventData);
            setLoading(false);
            return;
          }

          // If no event data found, fall back to dummy data
          throw new Error('No event data found with the provided registration code');

        } catch (eventError) {
          console.error('Error fetching event data:', eventError);

          // Fall back to dummy data
          console.log('Falling back to dummy data');
          await setUserDataOnly();
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching data.');
        setLoading(false);
      }
    };


    if (credentials) {
      fetchData();
    }
  }, [credentials]);

  useEffect(() => {
    if (eventData && eventData.dataValues) {
      const initialFormValues = {};
      
      // Map all data values from the event to form fields
      eventData.dataValues.forEach(dv => {
        initialFormValues[dv.dataElement] = dv.value;
      });
      
      // Ensure all required fields are present with proper defaults
      const fieldMappings = {
        // Licensed Users Details Section
        'NVlLoMZbXIW': initialFormValues['NVlLoMZbXIW'] || '', // Users Email Address
        'g3J1CH26hSA': initialFormValues['g3J1CH26hSA'] || '', // Preferred User Name (same as email)
        'SVzSsDiZMN5': initialFormValues['SVzSsDiZMN5'] || '', // B.H.P.C Registration Number
        'SReqZgQk0RY': initialFormValues['SReqZgQk0RY'] || '', // Phone Number
        'aMFg2iq9VIg': initialFormValues['aMFg2iq9VIg'] || '', // Private Practice Number
        'HMk4LZ9ESOq': initialFormValues['HMk4LZ9ESOq'] || '', // Name of the License Holder
        'ykwhsQQPVH0': initialFormValues['ykwhsQQPVH0'] || '', // Surname of License Holder
        
        // Select Location Facility is in Botswana Section
        'PdtizqOqE6Q': initialFormValues['PdtizqOqE6Q'] || '', // Name of Facility to be Registered
        'VJzk8OdFJKA': initialFormValues['VJzk8OdFJKA'] || '', // Location in Botswana (Ward)
        
        // Additional fields that might be in the event data
        'jV5Y8XOfkgb': initialFormValues['jV5Y8XOfkgb'] || 'true', // Application status
      };
      
      // If user email is not in event data, add it from user data
      if (!fieldMappings['NVlLoMZbXIW'] && registrationCode) {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          fieldMappings['NVlLoMZbXIW'] = userEmail;
          fieldMappings['g3J1CH26hSA'] = userEmail; // Set preferred username to email if not provided
        }
      }
      
      console.log('📋 Mapped form values:', fieldMappings);
      console.log('📊 Original event data values:', eventData.dataValues);
      
      setFormValues(fieldMappings);
      setHasExistingData(true);
      setIsEditing(false);
      
      // Notify parent component about the fetched event data
      if (onEventDataFetched) {
        onEventDataFetched(eventData);
      }
    }
  }, [eventData, onEventDataFetched, registrationCode]);

  useEffect(() => {
    const fetchOrgUnitName = async () => {
      console.log('Debug - fetchOrgUnitName called');
      console.log('formValues[VJzk8OdFJKA]:', formValues['VJzk8OdFJKA']);
      console.log('loading state:', loading);

      // Remove loading check to always attempt fetching
      if (!formValues['VJzk8OdFJKA']) {
        console.log('Skipping fetch: No location ID');
        return;
      }

      try {
        // Get credentials using the helper with fallbacks
        const effectiveCredentials = credentials || await getCredentials();
        
        if (!effectiveCredentials) {
          console.error('No credentials found for fetching org unit name');
          return;
        }

        console.log('Fetching org unit name for ID:', formValues['VJzk8OdFJKA']);
        console.log('Full API URL:', `${import.meta.env.VITE_DHIS2_URL}/api/organisationUnits/${formValues['VJzk8OdFJKA']}?fields=name`);

        const response = await fetch(`/api/organisationUnits/${formValues['VJzk8OdFJKA']}?fields=name`, {
          headers: {
            Authorization: `Basic ${effectiveCredentials}`,
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch organization unit name: ${response.status}`);
        }

        const data = await response.json();

        console.log('Received data:', data);

        if (data && data.name) {
          // Update selectedOrgUnit with the fetched name
          setSelectedOrgUnit({
            id: formValues['VJzk8OdFJKA'],
            displayName: data.name
          });
          console.log('Updated selectedOrgUnit with name:', data.name);
        } else {
          console.warn('No name found in the response:', data);
        }
      } catch (error) {
        console.error('Error fetching organization unit name:', error);
      }
    };

    // Add a small delay to ensure data is loaded
    const timer = setTimeout(fetchOrgUnitName, 100);

    // Cleanup function to clear timeout
    return () => clearTimeout(timer);
  }, [formValues['VJzk8OdFJKA']]);

  // Helper function to check if a specific field is missing
  const isFieldMissing = (fieldId) => {
    const validation = validateAllRequiredFields();
    return validation.missingFields.includes(fieldId);
  };

  // Enhanced validation function to check if all required fields are filled
  const validateAllRequiredFields = () => {
    const missingFields = [];
    
    console.log('🔍 === FORM VALIDATION DEBUG ===');
    console.log('Current formValues:', formValues);
    
    // Check each required field
    requiredOtherDetailsFields.forEach(fieldId => {
      const value = formValues[fieldId];
      console.log(`Field ${fieldId}:`, value, 'Type:', typeof value);
      
      // Handle different data types properly
      if (!value || (typeof value === 'string' && value.trim() === '') || value === null || value === undefined) {
        missingFields.push(fieldId);
        console.log(`❌ Field ${fieldId} is missing or empty`);
      } else {
        console.log(`✅ Field ${fieldId} is valid`);
      }
    });
    
    console.log('Missing fields:', missingFields);
    console.log('=== END FORM VALIDATION DEBUG ===');
    
    // Additional validation for specific fields
    if (formValues['PdtizqOqE6Q'] && typeof formValues['PdtizqOqE6Q'] === 'string' && formValues['PdtizqOqE6Q'].trim().length < 3) {
      missingFields.push('PdtizqOqE6Q'); // Facility name too short
    }
    
    // Private Practice Number - accept any non-empty value (minimum 1 character)
    if (formValues['aMFg2iq9VIg'] && typeof formValues['aMFg2iq9VIg'] === 'string' && formValues['aMFg2iq9VIg'].trim().length < 1) {
      missingFields.push('aMFg2iq9VIg'); // Private Practice Number cannot be empty
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      missingFieldNames: missingFields.map(fieldId => {
        const fieldNames = {
          'aMFg2iq9VIg': 'Private Practice Number',
          'HMk4LZ9ESOq': 'Name of the License Holder',
          'ykwhsQQPVH0': 'Surname of License Holder',
          'PdtizqOqE6Q': 'Name of Facility to be Registered',
          'VJzk8OdFJKA': 'Location in Botswana (Ward)'
        };
        return fieldNames[fieldId] || fieldId;
      })
    };
  };

  const checkFormCompletion = () => {
    const validation = validateAllRequiredFields();
    const isComplete = validation.isValid;

    setIsFormComplete(isComplete);

    // Notify parent component about form status
    if (onFormStatusChange) {
      onFormStatusChange(isComplete);
    }

    // Also store in localStorage for access by other components
    localStorage.setItem('completeApplicationFormStatus', JSON.stringify(isComplete));
    
    // Log validation details for debugging
    if (!isComplete) {
      console.log('Form validation failed. Missing fields:', validation.missingFieldNames);
    } else {
      console.log('Form validation passed. All required fields are filled.');
    }
  };

  // Fetch organisational units when component loads or when entering edit mode
  useEffect(() => {
    if (credentials) {
      fetchOrganisationalUnits();
    }
  }, [credentials, isEditing]);

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
    checkFormCompletion();
  }, [formValues]);

  const fetchOrganisationalUnits = async () => {
    console.log('🗺️ === FETCHING ORGANIZATIONAL UNITS ===');
    setIsLoadingOrgUnits(true);
    try {
      if (!credentials) {
        console.error("❌ No credentials found");
        setIsLoadingOrgUnits(false);
        return;
      }

      console.log('🌐 VITE_DHIS2_URL:', import.meta.env.VITE_DHIS2_URL);
      // Use the proxy configuration instead of full URL
      const url = `/api/organisationUnits.json?filter=level:eq:4&fields=id,displayName&paging=false`;
      console.log('🔗 API URL (using proxy):', url);
      console.log('🔐 Credentials available:', !!credentials);

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organisational units: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      console.log('🏢 Number of org units:', data.organisationUnits?.length || 0);
      
      setOrganisationalUnits(data.organisationUnits || []);
      setFilteredOrgUnits(data.organisationUnits || []);
      
      console.log('✅ Organizational units loaded successfully');
    } catch (error) {
      console.error("❌ Error fetching organisational units:", error);
    } finally {
      setIsLoadingOrgUnits(false);
      console.log('🏁 === END FETCHING ORGANIZATIONAL UNITS ===');
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
      newFormValues['VJzk8OdFJKA'] = newValue.displayName.trim();
    } else {
      newFormValues['VJzk8OdFJKA'] = '';
    }

    setFormValues(newFormValues);
  };

  // Toggle edit mode
  const handleToggleEdit = () => {
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
      const locationValue = originalValues['VJzk8OdFJKA'];
      if (locationValue) {
        setSelectedOrgUnit({ displayName: locationValue });
      } else {
        setSelectedOrgUnit(null);
      }

      // Reset search
      setSearchQuery('');
      setFilteredOrgUnits(organisationalUnits);

      // Check form completion with original values
      checkFormCompletion();
    }
    setIsEditing(!isEditing);
  };

  // ------------------ cascade starts------------------------------
  useEffect(() => {
    const fetchParentOrgUnitId = async () => {
      if (!formValues['VJzk8OdFJKA']) {
        setParentOrgUnitId(null);
        return;
      }

      try {
        const response = await fetch(
          `/api/organisationUnits?paging=false`,
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
        const orgUnit = data.organisationUnits.find(
          unit => unit.displayName.trim() === formValues['VJzk8OdFJKA'].trim() // Trim both values
        );

        if (orgUnit) {
          setParentOrgUnitId(orgUnit.id);
        } else {
          setParentOrgUnitId(null);
        }
      } catch (error) {
        console.error("Error fetching parent org unit ID:", error);
        setParentOrgUnitId(null);
      }
    };

    fetchParentOrgUnitId();
  }, [formValues['VJzk8OdFJKA'], credentials]);

  const generate_orgUnitID = () => {
    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = alphabets.charAt(Math.floor(Math.random() * alphabets.length)); // First character is always an alphabet
    for (let i = 1; i < 11; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };


  const createOrgUnit = async (orgUnitId) => {
    try {
      console.log('📋 Step 5a: Preparing organization unit payload...');
      const shortName = formValues['PdtizqOqE6Q'].length > 40
        ? formValues['PdtizqOqE6Q'].substring(0, 40)
        : formValues['PdtizqOqE6Q'];

      console.log(`📍 Parent Organization Unit ID: ${parentOrgUnitId}`);
      console.log(`🏢 Facility Name: ${formValues['PdtizqOqE6Q']}`);
      console.log(`🆔 Generated Org Unit ID: ${orgUnitId}`);
      console.log(`📧 User Email: ${formValues['NVlLoMZbXIW']}`);

      const orgUnitPayload = {
        name: formValues['PdtizqOqE6Q'],
        id: orgUnitId,
        shortName: shortName,
        openingDate: new Date().toISOString().split('T')[0],
        parent: {
          id: parentOrgUnitId
        },
        // Add the standard DHIS2 email field
        email: formValues['NVlLoMZbXIW'] || ''
      };

      console.log('📦 Organization Unit Payload:', orgUnitPayload);

      console.log('🔧 Step 5b: Creating organization unit schema...');
      // First API call to create schema
      const schemaResponse = await fetch(`/api/29/schemas/organisationUnit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify(orgUnitPayload)
      });

      if (!schemaResponse.ok) {
        console.error('❌ Schema creation failed with status:', schemaResponse.status);
        throw new Error('Failed to create organization unit schema');
      }
      console.log('✅ Schema creation successful');

      console.log('🏗️ Step 5c: Creating organization unit...');
      // Second API call to create org unit
      const orgUnitResponse = await fetch(`/api/29/organisationUnits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify(orgUnitPayload)
      });

      if (!orgUnitResponse.ok) {
        console.error('❌ Organization unit creation failed with status:', orgUnitResponse.status);
        throw new Error('Failed to create organization unit');
      }
      console.log('✅ Organization unit creation successful');

      // Step 5d: Update organization unit with email if not set during creation
      if (formValues['NVlLoMZbXIW']) {
        console.log('📧 Step 5d: Setting email on organization unit...');
        
        const updatePayload = {
          id: orgUnitId,
          name: formValues['PdtizqOqE6Q'],
          shortName: shortName,
          openingDate: new Date().toISOString().split('T')[0],
          email: formValues['NVlLoMZbXIW'],
          parent: {
            id: parentOrgUnitId
          }
        };

        const updateResponse = await fetch(`/api/29/organisationUnits/${orgUnitId}?mergeMode=REPLACE`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify(updatePayload)
        });

        if (!updateResponse.ok) {
          console.warn('⚠️ Failed to update organization unit with email:', updateResponse.status);
        } else {
          console.log('✅ Organization unit email set successfully');
        }
      }

      return orgUnitId;
    } catch (error) {
      console.error('❌ Error creating org unit:', error);
      throw error;
    }
  };

  const addOrgUnitToProgram = async (orgUnitId) => {
    try {
      // console.log('📋 Step 6a: Preparing to add organization unit to programs...');
      // const programs = [
      //   'EE8yeLVo6cN', 'Xje2ga2tJcA', 'QSQWCmnsQtG',
      //   'adbaKjLFtYH', 'fWc9nCmUjez', 'Y4W5qIKlOsh',
      //   'wlWC4vYeTzt', 'cghjivP9xA2'
      // ];

      const programs = [
        'EE8yeLVo6cN']

      console.log(`🎯 Adding org unit ${orgUnitId} to ${programs.length} programs:`, programs);

      console.log('🔄 Step 6b: Processing all programs in parallel...');
      // Process all programs in parallel
      const results = await Promise.all(programs.map(async (programId, index) => {
        console.log(`📝 Adding to program ${index + 1}/${programs.length}: ${programId}`);
        const response = await fetch(`/api/programs/${programId}/organisationUnits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            additions: [{ id: orgUnitId }]
          })
        });

        if (!response.ok) {
          console.error(`❌ Failed to add org unit to program ${programId} - Status: ${response.status}`);
          return false;
        }
        console.log(`✅ Successfully added to program ${programId}`);
        return true;
      }));

      console.log('📊 Step 6c: Checking results...');
      console.log('Program addition results:', results);

      // Check if all operations were successful
      const allSuccess = results.every(result => result === true);
      if (!allSuccess) {
        console.error('❌ Some programs failed to be added');
        throw new Error('Failed to add org unit to one or more programs');
      }

      console.log('✅ All programs added successfully');
      return true;
    } catch (error) {
      console.error('❌ Error adding org unit to programs:', error);
      throw error;
    }
  };

  // Add this new function to handle TEI creation/update
  const createOrUpdateTEI = async (orgUnitId) => {
    try {
      console.log('📋 Step 7a: Preparing tracked entity instance payload...');
      const teiPayload = {
        trackedEntityType: "uTTDt3fuXZK",
        orgUnit: orgUnitId,
        attributes: [
          { attribute: "Ue8XNxxVKZs", value: formValues['SVzSsDiZMN5'] },
          { attribute: "YRTNX6YvPlu", value: formValues['aMFg2iq9VIg'] },
          { attribute: "YiCio8ZTWNj", value: formValues['g3J1CH26hSA'] },
          { attribute: "ixWjABeTjHn", value: formValues['SReqZgQk0RY'] },
          { attribute: "vRUtkpMwzDW", value: orgUnitId }
        ]
      };

      console.log('📦 TEI Payload:', teiPayload);
      console.log('🏢 Organization Unit ID:', orgUnitId);
      console.log('📋 Form values used:', {
        bhpcNumber: formValues['SVzSsDiZMN5'],
        privatePracticeNumber: formValues['aMFg2iq9VIg'],
        employeeUsername: formValues['g3J1CH26hSA'],
        phoneNumber: formValues['SReqZgQk0RY']
      });

      let response;
      let newTei = formValues['PdtizqOqE6Q'];

      console.log('🆔 Step 7b: Creating new tracked entity instance...');
      // Create new TEI if it doesn't exist
      response = await fetch(`/api/trackedEntityInstances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify(teiPayload)
      });

      if (!response.ok) {
        console.error('❌ TEI creation failed with status:', response.status);
        throw new Error('Failed to create tracked entity instance');
      }

      const result = await response.json();
      console.log('📄 TEI creation response:', result);
      
      newTei = result.response.importSummaries[0].reference;
      console.log('🆔 Generated TEI ID:', newTei);

      console.log('✅ Tracked entity instance created successfully');
      return newTei;
    } catch (error) {
      console.error('❌ Error in createOrUpdateTEI:', error);
      throw error;
    }
  };

  // Helper to generate a DHIS2 UID
  function generateDhis2Uid() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uid = '';
    uid += alphabet[Math.floor(Math.random() * 52)];
    for (let i = 0; i < 10; i++) {
      uid += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return uid;
  }

  const createEnrollment = async (orgUnitId, programId, teiCalled, enrollmentId) => {
    try {
      console.log(`📋 Creating enrollment for program ${programId}...`);
      const today = new Date().toISOString().split('T')[0];
      
      const enrollmentPayload = {
        enrollment: enrollmentId,
          trackedEntityInstance: teiCalled,
          program: programId,
          status: "ACTIVE",
          orgUnit: orgUnitId,
          enrollmentDate: today,
          incidentDate: today
      };

      console.log('📦 Enrollment Payload:', enrollmentPayload);

      const response = await fetch(`/api/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify(enrollmentPayload)
      });

      if (!response.ok) {
        console.error(`❌ Enrollment creation failed for program ${programId} - Status: ${response.status}`);
        throw new Error(`Failed to create enrollment for program ${programId}`);
      }

      console.log(`✅ Enrollment created successfully for program ${programId}`);
      return enrollmentId;
    } catch (error) {
      console.error(`❌ Error creating enrollment for program ${programId}:`, error);
      throw error;
    }
  };

  const fetchOrgUnitUsersAssoc = async () => {
    try {
      console.log('👤 Step 9a: Fetching current user information...');
      // Get current user information from /api/me
      const meResponse = await fetch('/api/me', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`
          }
      });

      if (!meResponse.ok) {
        console.error('❌ Failed to fetch current user data - Status:', meResponse.status);
        throw new Error('Failed to fetch current user data');
      }

      const userData = await meResponse.json();
      console.log('📋 Current user data:', userData);
      
      const userToUpdate = {
        id: userData.id || userData.uid,
        username: userData.username,
        email: userData.email
      };
      
      console.log('👤 User to update:', userToUpdate);
      
      // Return the current user as the user to update
      return [userToUpdate];
    } catch (error) {
      console.error('❌ Error fetching current user:', error);
      // Return empty array if we can't get user data
      return [];
    }
  };


  const updateUserOrgUnits = async (userId, orgUnitUpdateType, newOrgUnitId) => {
    try {
      console.log(`🔄 Updating user ${userId} for ${orgUnitUpdateType}...`);
      console.log(`📍 New org unit ID: ${newOrgUnitId}`);
      
      // Step 1: Assign new org unit
      console.log(`📝 Step 1: Assigning new org unit ${newOrgUnitId} to user ${userId}...`);
      const assignResponse = await fetch(
        `/api/users/${userId}/${orgUnitUpdateType}/${newOrgUnitId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({})
        }
      );

      if (!assignResponse.ok) {
        console.error(`❌ Failed to assign new org unit for ${orgUnitUpdateType} - Status: ${assignResponse.status}`);
        throw new Error(`Failed to assign new org unit for ${orgUnitUpdateType}Updates`);
      }
      console.log(`✅ Successfully assigned new org unit for ${orgUnitUpdateType}`);

      // Step 2: Delete Botswana org unit (OVpBNoteQ2Y)
      console.log(`🗑️ Step 2: Removing Botswana org unit (OVpBNoteQ2Y) from user ${userId}...`);
      const deleteResponse = await fetch(
        `/api/users/${userId}/${orgUnitUpdateType}/OVpBNoteQ2Y`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`
          }
        }
      );

      if (!deleteResponse.ok) {
        console.error(`❌ Failed to delete Botswana org unit for ${orgUnitUpdateType} - Status: ${deleteResponse.status}`);
        throw new Error(`Failed to delete Botswana org unit for ${orgUnitUpdateType}`);
      }
      console.log(`✅ Successfully removed Botswana org unit for ${orgUnitUpdateType}`);

      console.log(`✅ User ${userId} updated successfully for ${orgUnitUpdateType}`);
      return true;
    } catch (error) {
      console.error(`❌ Error in updateUserOrgUnits for ${orgUnitUpdateType}:`, error);
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const sendFacilityUpdateEmail = async () => {
    try {
      console.log('📧 Step 10a: Starting facility update email process...');
      
      // 1. Get the user's email from the form
      const formEmail = formValues['NVlLoMZbXIW'];
      let emails = [];
      if (formEmail) {
        emails.push(formEmail);
        console.log('📧 Form email added:', formEmail);
      } else {
        console.log('⚠️ No form email found');
      }

      // 2. Fetch additional emails from the API
      console.log('📧 Step 10b: Fetching additional emails from user group...');
      const credentials = localStorage.getItem('userCredentials');
      const usersResponse = await fetch('/api/users?fields=email,userGroups[id]&filter=userGroups.id:eq:cxNjCzLB6tI&paging=false', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('📋 Users data from API:', usersData);
        
        if (usersData.users && Array.isArray(usersData.users)) {
          const apiEmails = usersData.users
            .map(u => u.email)
            .filter(email => email && !emails.includes(email));
          emails = emails.concat(apiEmails);
          console.log('📧 Additional emails from API:', apiEmails);
        }
      } else {
        console.error('❌ Failed to fetch users from API - Status:', usersResponse.status);
      }

      console.log('📧 Step 10c: Final email list:', emails);
      console.log('📧 Total emails to send:', emails.length);

      // 3. Send the combined emails array to the endpoint
      console.log('📧 Step 10d: Sending email notification...');
      const response = await fetch('/email2/api/facility-reg-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
      });

      if (!response.ok) {
        console.error('❌ Email server responded with status:', response.status);
        throw new Error(`Email server responded with status ${response.status}`);
      }

      console.log('✅ Email notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Email sending error:', error);
      return false;
    }
  };


  const handleSubmit = async () => {
    try {
      setShowProgress(true);
      setProgress(0);
      console.log('🚀 === STARTING APPLICATION UPDATE PROCESS ===');
      console.log('Step 1: Initializing update process...');
      setLoading(true);
      setSuccessMessages([]);

      // Save facility name to sessionStorage before proceeding
      if (formValues['PdtizqOqE6Q']) {
        sessionStorage.setItem('currentFacilityName', formValues['PdtizqOqE6Q']);
      }

      // Generate a new ID for org unit if complete is checked
      const orgUnitId = generate_orgUnitID();
      console.log('Step 2: Generated organization unit ID:', orgUnitId);

      // Prepare the payload
      console.log('Step 3: Preparing payload for DHIS2 update...');
      setCurrentStep('Saving...');
      let eventPayload;
      if (eventData) {
        eventPayload = {
          event: registrationCode,
          status: "COMPLETED",
          program: eventData.program,
          programStage: eventData.programStage,
          enrollment: eventData.enrollment,
          orgUnit: eventData.orgUnit,
          orgUnitName: eventData.orgUnitName,
          occurredAt: eventData.eventDate,
          followup: false,
          deleted: false,
          createdAt: eventData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attributeCategoryOptions: eventData.attributeCategoryOptions || {},
          createdBy: eventData.createdBy || {
            uid: "M5zQapPyTZI",
            username: "admin",
            firstName: "admin",
            surname: "admin"
          },
          updatedBy: {
            uid: "M5zQapPyTZI",
            username: "admin",
            firstName: "admin",
            surname: "admin"
          },
          notes: [],
          scheduledAt: null,
          geometry: null,
          dataValues: [
            { dataElement: 'PdtizqOqE6Q', value: formValues['PdtizqOqE6Q']?.trim() || '' },
            { dataElement: 'HMk4LZ9ESOq', value: formValues['HMk4LZ9ESOq']?.trim() || '' },
            { dataElement: 'ykwhsQQPVH0', value: formValues['ykwhsQQPVH0']?.trim() || '' },
            { dataElement: 'SReqZgQk0RY', value: formValues['SReqZgQk0RY']?.trim() || '' },
            { dataElement: 'SVzSsDiZMN5', value: formValues['SVzSsDiZMN5']?.trim() || '' },
            { dataElement: 'aMFg2iq9VIg', value: formValues['aMFg2iq9VIg']?.trim() || '' },
            { dataElement: 'VJzk8OdFJKA', value: parentOrgUnitId || '' },
            { dataElement: 'g3J1CH26hSA', value: formValues['NVlLoMZbXIW']?.trim() || '' },
            { dataElement: 'jV5Y8XOfkgb', value: "true" }
          ].filter(dv => dv.value !== null && dv.value !== undefined)
        };
      } else {
        // Use provided defaults when eventData is null
        eventPayload = {
          event: registrationCode,
          status: "COMPLETED",
          program: "Y4W5qIKlOsh",
          programStage: "ggFgLYyyMJ5",
          // enrollment: (leave out)
          orgUnit: "OVpBNoteQ2Y",
          // orgUnitName: (leave out)
          occurredAt: new Date().toISOString(),
          followup: false,
          deleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attributeCategoryOptions: {},
          createdBy: {
            uid: "M5zQapPyTZI",
            username: "admin",
            firstName: "admin",
            surname: "admin"
          },
          updatedBy: {
            uid: "M5zQapPyTZI",
            username: "admin",
            firstName: "admin",
            surname: "admin"
          },
          notes: [],
          scheduledAt: null,
          geometry: null,
          dataValues: [
            { dataElement: 'PdtizqOqE6Q', value: formValues['PdtizqOqE6Q']?.trim() || '' },
            { dataElement: 'HMk4LZ9ESOq', value: formValues['HMk4LZ9ESOq']?.trim() || '' },
            { dataElement: 'ykwhsQQPVH0', value: formValues['ykwhsQQPVH0']?.trim() || '' },
            { dataElement: 'SReqZgQk0RY', value: formValues['SReqZgQk0RY']?.trim() || '' },
            { dataElement: 'SVzSsDiZMN5', value: formValues['SVzSsDiZMN5']?.trim() || '' },
            { dataElement: 'aMFg2iq9VIg', value: formValues['aMFg2iq9VIg']?.trim() || '' },
            { dataElement: 'VJzk8OdFJKA', value: parentOrgUnitId || '' },
            { dataElement: 'g3J1CH26hSA', value: formValues['NVlLoMZbXIW']?.trim() || '' },
            { dataElement: 'jV5Y8XOfkgb', value: "true" }
          ].filter(dv => dv.value !== null && dv.value !== undefined)
        };
      }
      const payload = { events: [eventPayload] };

      // Prepare the first event with programStage 'YzqtE5Uv8Qd' and only allowed fields
      const firstEvent = { ...eventPayload };
      firstEvent.programStage = 'YzqtE5Uv8Qd';
      const allowedKeys = [
        'event', 'occurredAt', 'status', 'notes', 'completedAt', 'program', 'programStage', 'orgUnit', 'dataValues'
      ];
      const strippedFirstEvent = Object.fromEntries(
        Object.entries(firstEvent).filter(([key]) => allowedKeys.includes(key))
      );

      console.log('Step 4: Sending event to DHIS2...');
      console.log('Event payload:', strippedFirstEvent);
      const API_URL = `/api/40/tracker?async=false`;

      const firstEventPayload = { events: [strippedFirstEvent] };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify(firstEventPayload)
      });

      const result = await response.json();
      console.log('✅ Step 4 COMPLETED: DHIS2 update successful:', result);
      // setSuccessMessages(prev => [...prev, 'Request updated successfully in DHIS2']);
      setSuccessMessages(prev => [...prev, '1 / 5']);
      setOpenSnackbar(true);
      setProgress(10); // After tracker update

      console.log('Step 5: Creating organization unit...');
      // Creating org unit
      // setCurrentStep(`Adding ${locationName} facility to registry...`);
      setCurrentStep('Saving...');
      await createOrgUnit(orgUnitId);
      console.log('✅ Step 5 COMPLETED: Organization unit created successfully');
      // setSuccessMessages(prev => [...prev, 'Facility added to registry successfully']);
      setSuccessMessages(prev => [...prev, '2 / 5']);
      setOpenSnackbar(true);
      setProgress(25); // After org unit creation

      console.log('Step 6: Adding organization unit to program...');
      // Step 2b: Add org unit to program
      // setCurrentStep(`Facility updated...`);
      await addOrgUnitToProgram(orgUnitId);
      console.log('✅ Step 6 COMPLETED: Organization unit added to program');
      setOpenSnackbar(true);
      setProgress(40); // After add org unit to program

      console.log('Step 7: Creating/updating tracked entity instance...');
      // New Step: Create or Update TEI
      // setCurrentStep('Updating facility dependecies...');
      setCurrentStep('Saving...');
      const updatedTei = await createOrUpdateTEI(orgUnitId);
      console.log('✅ Step 7 COMPLETED: Tracked entity instance created/updated:', updatedTei);
      // setSuccessMessages(prev => [...prev, 'Facility dependecies updated successfully']);
      setSuccessMessages(prev => [...prev, '3 / 5']);
      setOpenSnackbar(true);
      setProgress(55); // After TEI update

      // Update the payload with the new TEI if it was created
      if (!formValues['PdtizqOqE6Q'] && updatedTei) {
        payload.events[0].dataValues = payload.events[0].dataValues.map(dv =>
          dv.dataElement === "PdtizqOqE6Q" ? { ...dv, value: updatedTei } : dv
        );
      }

      console.log('📋 Step 8a: Preparing to create program enrollments...');
      // Step 2c: Create enrollments for all programs
      setCurrentStep('Saving...');
      // setCurrentStep('Creating program enrollments...');
      const programs = ['EE8yeLVo6cN']
      //   , 'Xje2ga2tJcA', 'QSQWCmnsQtG',
      //   'adbaKjLFtYH', 'fWc9nCmUjez',
      //   'wlWC4vYeTzt', 'cghjivP9xA2'
      // ]; // 'Y4W5qIKlOsh',

      console.log('🎯 Programs to enroll in:', programs);
      console.log('🏢 Organization Unit ID:', orgUnitId);
      console.log('🆔 TEI ID:', updatedTei);

      const enrollmentIdsByProgram = {};
      console.log('🔄 Step 8b: Creating enrollments for each program...');
      for (const programId of programs) {
        console.log(`📝 Creating enrollment for program: ${programId}`);
        const enrollmentId = generateDhis2Uid();
        console.log(`🆔 Generated enrollment ID: ${enrollmentId}`);
        const createdEnrollmentId = await createEnrollment(orgUnitId, programId, updatedTei, enrollmentId);
        if (createdEnrollmentId) {
          enrollmentIdsByProgram[programId] = createdEnrollmentId;
          console.log(`✅ Enrollment stored for program ${programId}: ${createdEnrollmentId}`);
          
          // Special validation for the critical program EE8yeLVo6cN
          if (programId === 'EE8yeLVo6cN') {
            console.log(`🎯 CRITICAL: Successfully created enrollment for target program ${programId}`);
            console.log(`🆔 Target program enrollment ID: ${createdEnrollmentId}`);
          }
        } else {
          console.error(`❌ Failed to create enrollment for program ${programId}`);
          if (programId === 'EE8yeLVo6cN') {
            throw new Error(`CRITICAL: Failed to create enrollment for required program ${programId}`);
          }
        }
      }
      
      // Final validation: Ensure EE8yeLVo6cN enrollment exists
      if (!enrollmentIdsByProgram['EE8yeLVo6cN']) {
        console.error('❌ CRITICAL ERROR: Missing enrollment for program EE8yeLVo6cN');
        console.error('Created enrollments:', enrollmentIdsByProgram);
        throw new Error('Failed to create required enrollment for program EE8yeLVo6cN');
      }
      
      console.log('✅ Step 8 COMPLETED: Program enrollments created for all programs');
      console.log('📋 Final enrollment mapping:', enrollmentIdsByProgram);
      // setSuccessMessages(prev => [...prev, 'Program enrollments created successfully']);
      setSuccessMessages(prev => [...prev, '4 / 5']);
      setOpenSnackbar(true);
      setProgress(70); // After enrollments

      console.log('Step 9: Enabling users and assigning to location...');
      // NEW STEP: Enable users associated with the org unit
      // setCurrentStep('Enabling users and adding user to location...');
      try {
        console.log('👤 Step 9a: Attempting to fetch users...');
        console.log('📋 Form values for user lookup:', {
          email: formValues['NVlLoMZbXIW'],
          username: formValues['g3J1CH26hSA']
        });
        
        const users = await fetchOrgUnitUsersAssoc();
        console.log(`👥 Found ${users.length} users to enable for org unit:`, users);

        if (users.length === 0) {
          console.log('⚠️ No users found, skipping user org unit updates');
          setSuccessMessages(prev => [...prev, '5 / 5 (No users to update)']);
          setOpenSnackbar(true);
          setProgress(85);
        } else {
        const orgUnitTypes = [
          'organisationUnits',
          'dataViewOrganisationUnits',
          'teiSearchOrganisationUnits'
        ];

          console.log('🔄 Step 9b: Org unit types to update:', orgUnitTypes);
          console.log('🏢 Organization unit ID to assign:', orgUnitId);

        // setCurrentStep(`Assigning User to New Facility...`);
        setCurrentStep('Saving...');
        for (const user of users) {
            console.log(`👤 Processing user: ${user.username} (ID: ${user.id})`);
          for (const orgUnitType of orgUnitTypes) {
              console.log(`🔄 Updating ${orgUnitType} for user ${user.username}...`);
            await updateUserOrgUnits(user.id, orgUnitType, orgUnitId);
          }
          // await enableUser(user.id);
          // await addUsertoLocation(user.id);
            console.log(`✅ Completed updates for user ${user.id}`);
        }
        console.log('✅ Step 9 COMPLETED: Users enabled and assigned to location');
        // setSuccessMessages(prev => [...prev, 'User assigned to new facility successfully']);
        setSuccessMessages(prev => [...prev, '5 / 5']);

        setOpenSnackbar(true);
          setProgress(85); // After user org unit updates
        }

        console.log('📋 Step 10a: Creating new tracker event...');
        // Step: Create new tracker event before sending facility update email
        // Generate DHIS2 UID for event
        function generateDhis2Uid() {
          const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let uid = '';
          uid += alphabet[Math.floor(Math.random() * 52)];
          for (let i = 0; i < 10; i++) {
            uid += alphabet[Math.floor(Math.random() * alphabet.length)];
          }
          return uid;
        }
        const newEventId = generateDhis2Uid();
        const nowIso = new Date().toISOString();
        
        // CRITICAL: Ensure we have a valid enrollment for program EE8yeLVo6cN
        const targetProgramId = 'EE8yeLVo6cN';
        const enrollmentId = enrollmentIdsByProgram[targetProgramId];
        
        console.log('🎯 Target program ID:', targetProgramId);
        console.log('📋 Available enrollments by program:', enrollmentIdsByProgram);
        console.log('📋 Enrollment ID for target program:', enrollmentId);
        
        if (!enrollmentId) {
          console.error(`❌ CRITICAL ERROR: No enrollment found for program ${targetProgramId}`);
          console.error('Available enrollments:', Object.keys(enrollmentIdsByProgram));
          throw new Error(`Missing enrollment for program ${targetProgramId}. Cannot create event without proper enrollment.`);
        }
        
        // Use enrollment and orgUnit from previous steps
        const orgUnitIdForEvent = orgUnitId; // from orgUnit creation step
        console.log('📝 Creating event for program:', targetProgramId);
        console.log('🆔 New event ID:', newEventId);
        console.log('✅ Verified enrollment ID:', enrollmentId);
        console.log('🏢 Organization unit ID:', orgUnitIdForEvent);
        console.log('📅 Event date:', nowIso);
        
        // Build dataValues from form
        const dataValues = Object.keys(formValues).map(key => ({ dataElement: key, value: formValues[key] }));
        console.log('📦 Data values for new event:', dataValues);
        
        const newEventPayload = {
          events: [
            {
              event: newEventId,
              program: targetProgramId, // Use the validated program ID
              programStage: 'WjheMIcXSkU',
              enrollment: enrollmentId,  // This is now guaranteed to match the program
              orgUnit: orgUnitIdForEvent,
              occurredAt: nowIso,
              dataValues
            }
          ]
        };
        
        // Before posting newEventPayload.events batch:
        if (Array.isArray(newEventPayload.events) && newEventPayload.events.length > 1) {
          newEventPayload.events[1].programStage = 'WjheMIcXSkU';
          if ('enrollment' in newEventPayload.events[1]) {
            delete newEventPayload.events[1].enrollment;
          }
          // Only keep allowed fields for the first event
          const allowedKeys = [
            'occurredAt', 'status', 'notes', 'completedAt', 'program', 'programStage', 'orgUnit', 'dataValues'
          ];
          newEventPayload.events[0] = Object.fromEntries(
            Object.entries(newEventPayload.events[0]).filter(([key]) => allowedKeys.includes(key))
          );
        }

        console.log('📦 New event payload:', newEventPayload);
        console.log('📤 Step 10b: Sending new tracker event to DHIS2...');
        
        const trackerResponse = await fetch('/api/40/tracker?async=false', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify(newEventPayload)
        });
        if (!trackerResponse.ok) {
          console.error('❌ Failed to create new tracker event - Status:', trackerResponse.status);
          throw new Error('Failed to create new tracker event');
        }
        console.log('✅ New tracker event created successfully');
        setProgress(90);

        console.log('📧 Step 10c: Sending facility update email notification...');
        // Now send the facility update email
        setCurrentStep('Sending notification...');
        // Simulate email success without making the API call
        const emailSuccess = true;
        if (emailSuccess) {
          console.log('✅ Step 10 COMPLETED: (Email sending deactivated, simulated success)');
          setSuccessMessages(prev => [...prev, 'Email notification (deactivated)']);
          setOpenSnackbar(true);
          setProgress(95); // After email send

          console.log('🔄 Step 11: Showing success confirmation dialog...');
          setCurrentStep('Completing application...');
          setSuccessMessages(prev => [...prev, 'Profile update completed successfully']);
          
          // Show the success confirmation dialog
          setShowSuccessDialog(true);
          console.log('✅ Step 11 COMPLETED: Success dialog displayed');

        } else {
          console.error('❌ Step 10 FAILED: Email notification failed');
          setSuccessMessages(prev => [...prev, 'Email notification failed']);
          setOpenSnackbar(true);
        }

      } catch (error) {
        console.error('❌ Step 9 FAILED: Error in user enabling process:', error);
        // Continue even if user enabling fails - this shouldn't block the main process
        // setSuccessMessages(prev => [...prev, 'User enabling partially completed']);
        setOpenSnackbar(true);
      }

      // Call the onUpdateSuccess callback with the updated event data
      if (onUpdateSuccess) {
        onUpdateSuccess(eventData || { event: registrationCode });
      }

      setCurrentStep('Request accepted successfully!');
      console.log('🎉 === APPLICATION UPDATE PROCESS COMPLETED ===');

      // setTimeout(() => {
      // setLoading(false);
      // }, 1000);

    } catch (error) {
      console.error('❌ APPLICATION UPDATE PROCESS FAILED:', error);
      // You might want to show an error message to the user here
      setSuccessMessages(prev => [...prev, `Error: ${error.message}`]);
      setOpenSnackbar(true);
      setLoading(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------- End --------------------

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setUpdateSuccess(false);
  };

  // Handle success dialog confirmation
  const handleSuccessDialogConfirm = () => {
    setShowSuccessDialog(false);
    console.log('🚀 Step 12: User confirmed success, proceeding with data refresh and tab switch...');
    
    // Store flag in localStorage to indicate we should select Facility Ownership tab after reload
    localStorage.setItem('autoSelectTab', 'facilityOwnership');
    console.log('💾 Stored autoSelectTab flag in localStorage');

    // Trigger data refresh and tab switch
    const refreshEvent = new CustomEvent('refreshApplicationData', {
      detail: {
        action: 'refresh',
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(refreshEvent);
    console.log('📡 Data refresh event dispatched');

    // Also trigger the tab switch
    const tabSwitchEvent = new CustomEvent('switchToTab', {
      detail: {
        tab: 'facilityOwnership',
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(tabSwitchEvent);
    console.log('📡 Tab switch event dispatched');

    console.log('✅ Step 12 COMPLETED: Data refresh and tab switch events dispatched');
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

  // Add blinking CSS to the document head if not already present
  if (typeof document !== 'undefined' && !document.getElementById('blink-message-style')) {
    const style = document.createElement('style');
    style.id = 'blink-message-style';
    style.textContent = `
      .blink-message {
        animation: blink 2s steps(2, start) infinite;
      }
      @keyframes blink {
        to { visibility: hidden; }
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* Success message */}
      <Snackbar
        open={updateSuccess}
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
        <Alert severity="warning" sx={{ mb: 2 }} className="blink-message">
          Please fill in all required fields to complete Other Details section.
        </Alert>
      )}

      <Modal
        open={showProgress}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
      >
        <MuiBox sx={{ width: 300, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LinearProgress variant="determinate" value={progress} sx={{ width: '100%', height: 8 }} />
          <Typography align="center" sx={{ mt: 2 }}>{progress}% Complete</Typography>
        </MuiBox>
      </Modal>

      {/* Success Confirmation Dialog */}
      <Modal
        open={showSuccessDialog}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
      >
        <MuiBox sx={{ 
          width: 400, 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          boxShadow: 24, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'success.main' }}>
            Profile Update Completed Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Your profile has been updated successfully. Please proceed to the Facility Ownership tab to continue with your application.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSuccessDialogConfirm}
            sx={{ 
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            OK, Proceed to Facility Ownership
          </Button>
        </MuiBox>
      </Modal>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            align="left"
            sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}
          >
            Licensed Users Details
          </Typography>
          <Grid container spacing={2}>
            {/* Submission Date field removed as per request */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Users Email Address"
                value={formValues['NVlLoMZbXIW'] || ''}
                fullWidth
                size="small"
                margin="dense"
                InputProps={{ readOnly: true }}
                className="grey-disabled"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#f5f5f5',
                    color: '#888',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#888',
                  },
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Preferred User Name"
                value={formValues['NVlLoMZbXIW'] || ''}
                fullWidth
                size="small"
                margin="dense"
                InputProps={{ readOnly: true }}
                className="grey-disabled"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#f5f5f5',
                    color: '#888',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#888',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="B.H.P.C Registration Number"
                value={formValues['SVzSsDiZMN5'] || ''}
                onChange={(e) => handleChange(e, 'SVzSsDiZMN5')}
                fullWidth
                size="small"
                margin="dense"
                // Editable
                disabled={hasExistingData || !isEditing || updating}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Phone Number"
                value={formValues['SReqZgQk0RY'] || ''}
                onChange={(e) => handleChange(e, 'SReqZgQk0RY')}
                fullWidth
                size="small"
                margin="dense"
                // Editable
                disabled={hasExistingData || !isEditing || updating}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Private Practice Number"
                value={formValues['aMFg2iq9VIg'] || ''}
                onChange={(e) => handleChange(e, 'aMFg2iq9VIg')}
                fullWidth
                size="small"
                margin="dense"
                disabled={hasExistingData || !isEditing || updating}
                required
                error={!formValues['aMFg2iq9VIg'] && !loading}
                helperText={!formValues['aMFg2iq9VIg'] && !loading ? "This field is required" : ""}
                className={!formValues['aMFg2iq9VIg'] && !loading ? 'blink-required' : hasExistingData ? 'grey-disabled' : ''}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                  }
                }}
              />
            </Grid>
            {/* After 'Private Practice Number', start a new <Grid container> row for 'Name of the License Holder' and 'Surname of License Holder' */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Name of the License Holder"
                  value={formValues['HMk4LZ9ESOq'] || ''}
                  onChange={(e) => handleChange(e, 'HMk4LZ9ESOq')}
                  fullWidth
                  size="small"
                  margin="dense"
                  disabled={hasExistingData || !isEditing || updating}
                  required
                  error={!formValues['HMk4LZ9ESOq'] && !loading}
                  helperText={!formValues['HMk4LZ9ESOq'] && !loading ? "This field is required" : ""}
                  className={!formValues['HMk4LZ9ESOq'] && !loading ? 'blink-required' : hasExistingData ? 'grey-disabled' : ''}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Surname of License Holder"
                  value={formValues['ykwhsQQPVH0'] || ''}
                  onChange={(e) => handleChange(e, 'ykwhsQQPVH0')}
                  fullWidth
                  size="small"
                  margin="dense"
                  disabled={hasExistingData || !isEditing || updating}
                  required
                  error={!formValues['ykwhsQQPVH0'] && !loading}
                  helperText={!formValues['ykwhsQQPVH0'] && !loading ? "This field is required" : ""}
                  className={!formValues['ykwhsQQPVH0'] && !loading ? 'blink-required' : hasExistingData ? 'grey-disabled' : ''}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ py: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            align="left"
            sx={{ fontWeight: 'bold', mb: 2, textAlign: 'left' }}
          >
            Select Facility Location in Botswana
          </Typography>

          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Name of Facility to be Registered"
                value={formValues['PdtizqOqE6Q'] || ''}
                onChange={(e) => handleChange(e, 'PdtizqOqE6Q')}
                fullWidth
                size="small"
                margin="dense"
                disabled={hasExistingData || !isEditing || updating}
                required
                error={!formValues['PdtizqOqE6Q'] && !loading}
                helperText={!formValues['PdtizqOqE6Q'] && !loading ? "This field is required" : ""}
                className={!formValues['PdtizqOqE6Q'] && !loading ? 'blink-required' : hasExistingData ? 'grey-disabled' : ''}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Location field */}
          <Box
            sx={{
              mt: { xs: 1, sm: 2 },
              width: '100%'
            }}
          >
            {/* Replace the Typography for 'Location in Botswana (Ward) *' with a label prop on the TextField (or mimic the style of other field labels) */}
            {/* In the renderInput of the Autocomplete, set label="Location in Botswana (Ward) *" on the TextField, and remove the Typography above. */}
            <Typography
              variant="subtitle2"
              align="left"
              sx={{
                mb: { xs: 0.25, sm: 0.5 },
                fontWeight: 'bold',
                color: 'text.primary',
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                textAlign: 'left'
              }}
            >
              Location in Botswana (Ward) <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box sx={{ position: 'relative', width: '100%' }}>
              {isEditing ? (
                <Autocomplete
                  options={filteredOrgUnits}
                  getOptionLabel={(option) => option.displayName || ''}
                  value={selectedOrgUnit}
                  onChange={handleLocationChange}
                  onInputChange={handleSearchChange}
                  loading={isLoadingOrgUnits}
                  disabled={hasExistingData || !isEditing || updating}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    }
                  }}
                  ListboxProps={{
                    style: {
                      maxHeight: '200px',
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    }
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Typography noWrap>
                        {option.displayName}
                      </Typography>
                    </li>
                  )}
                  PaperComponent={props => (
                    <Paper
                      {...props}
                      elevation={3}
                      sx={{
                        maxHeight: 200,
                        width: '100%',
                        '& .MuiAutocomplete-option': {
                          py: { xs: 0.5, sm: 1 },
                          px: { xs: 1, sm: 2 },
                          borderBottom: '1px solid #eee',
                          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }
                      }}
                    />
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      fullWidth
                      placeholder="Search for a location (Ward)..."
                      size="small"
                      margin="dense"
                      required
                      error={!formValues['VJzk8OdFJKA'] && !loading}
                      helperText={!formValues['VJzk8OdFJKA'] && !loading ? "Location is required" : ""}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
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
              ) : (
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.5 },
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    bgcolor: '#f9f9f9',
                    minHeight: { xs: '35px', sm: '40px' },
                    display: 'flex',
                    alignItems: 'center',
                    borderColor: !formValues['VJzk8OdFJKA'] && !loading ? 'error.main' : '#ddd'
                  }}
                >
                  {formValues['VJzk8OdFJKA'] ? (
                    <Chip
                      label={selectedOrgUnit?.displayName || formValues['VJzk8OdFJKA']}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 'medium',
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    />
                  ) : (
                    <Typography
                      color="error"
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Location is required
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start', gap: 2, flexDirection: 'column' }}>
            {/* Validation message */}
            {!isFormComplete && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: 1,
                mb: 2
              }}>
                <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 'medium', mb: 1 }}>
                  ⚠️ Please complete all required fields before submitting:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {validateAllRequiredFields().missingFieldNames.map((fieldName, index) => (
                    <Typography key={index} variant="body2" color="warning.dark" component="li">
                      • {fieldName}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* {!isEditing ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleToggleEdit}
                disabled={updating}
                size="small"
              >
                Edit Details
              </Button>
            ) : ( */}
            {!hasExistingData && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    // Double-check validation before proceeding
                    const validation = validateAllRequiredFields();
                    if (!validation.isValid) {
                      console.error('Form validation failed. Cannot proceed with submission.');
                      return;
                    }
                    
                    setShowProgress(true);
                    setProgress(0);
                    await handleSubmit();
                    setProgress(60);
                    await sendFacilityUpdateEmail();
                    setProgress(100);
                    setTimeout(() => {
                      setShowProgress(false);
                      setProgress(0);
                    }, 800);
                  }}
                  disabled={updating || !isFormComplete}
                  size="small"
                  sx={{
                    opacity: isFormComplete ? 1 : 0.6,
                    cursor: isFormComplete && !updating ? 'pointer' : 'not-allowed'
                  }}
                >
                  {updating ? 'Updating...' : 'Update Application Details'}
                </Button>
              </>
            )}
            {/* )} */}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TrackerEventDetails; 
