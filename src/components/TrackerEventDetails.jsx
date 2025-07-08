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

const TrackerEventDetails = ({ onFormStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [isEditing, setIsEditing] = useState(false);
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
  const credentials = localStorage.getItem('userCredentials');

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
        const meResponse = await fetch('/api/me', {
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
          const eventsUrl = `/api/events/${registrationCode}`;

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
              eventData.dataValues.forEach(dv => {
                initialFormValues[dv.dataElement] = dv.value;
              });
            }
            setFormValues(initialFormValues);

            // If there's a location value, set the selected org unit
            const locationValue = initialFormValues['VJzk8OdFJKA'];
            if (locationValue) {
              setSelectedOrgUnit({ displayName: locationValue });
            }

            // Check if all required fields are filled
            checkFormCompletion(initialFormValues);

            setLoading(false);
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

  const fetchOrganisationalUnits = async () => {
    setIsLoadingOrgUnits(true);
    try {
      const credentials = localStorage.getItem('userCredentials');
      if (!credentials) {
        console.error("No credentials found");
        setIsLoadingOrgUnits(false);
        return;
      }

      const response = await fetch(
        "/api/organisationUnits.json?filter=level:eq:4&fields=id,displayName&paging=false",
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
    } catch (error) {
      console.error("Error fetching organisational units:", error);
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
      checkFormCompletion(originalValues);
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
          "/api/organisationUnits?paging=false",
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
      const shortName = formValues['PdtizqOqE6Q'].length > 40
        ? formValues['PdtizqOqE6Q'].substring(0, 40)
        : formValues['PdtizqOqE6Q'];

      console.log(`PARENT ID: ${parentOrgUnitId}`)

      const orgUnitPayload = {
        name: formValues['PdtizqOqE6Q'],
        id: orgUnitId,
        shortName: shortName,
        openingDate: new Date().toISOString(),
        parent: {
          id: parentOrgUnitId
        }
      };

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
        throw new Error('Failed to create organization unit schema');
      }

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
        throw new Error('Failed to create organization unit');
      }

      return orgUnitId;
    } catch (error) {
      console.error('Error creating org unit:', error);
      throw error;
    }
  };

  const addOrgUnitToProgram = async (orgUnitId) => {
    try {
      const programs = [
        'EE8yeLVo6cN', 'Xje2ga2tJcA', 'QSQWCmnsQtG',
        'adbaKjLFtYH', 'fWc9nCmUjez', 'Y4W5qIKlOsh',
        'wlWC4vYeTzt', 'cghjivP9xA2'
      ];

      // Process all programs in parallel
      const results = await Promise.all(programs.map(async (programId) => {
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
          console.error(`Failed to add org unit to program ${programId}`);
          return false;
        }
        return true;
      }));

      // Check if all operations were successful
      const allSuccess = results.every(result => result === true);
      if (!allSuccess) {
        throw new Error('Failed to add org unit to one or more programs');
      }

      return true;
    } catch (error) {
      console.error('Error adding org unit to programs:', error);
      throw error;
    }
  };

  // Add this new function to handle TEI creation/update
  const createOrUpdateTEI = async (orgUnitId) => {
    try {
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

      let response;
      let newTei = formValues['PdtizqOqE6Q'];

      // if (!formValues['PdtizqOqE6Q']) {
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
        throw new Error('Failed to create tracked entity instance');
      }

      const result = await response.json();
      newTei = result.response.importSummaries[0].reference;

      // Update formData with the new TEI
      // setFormData(prev => ({ ...prev, tei: newTei }));
      // } else {
      //   // Update existing TEI
      //   response = await fetch(`/api/trackedEntityInstances/$newTei`, {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Basic ${credentials}`
      //     },
      //     body: JSON.stringify(teiPayload)
      //   });

      //   if (!response.ok) {
      //     throw new Error('Failed to update tracked entity instance');
      //   }
      // }

      return newTei;
    } catch (error) {
      console.error('Error in createOrUpdateTEI:', error);
      throw error;
    }
  };

  const createEnrollment = async (orgUnitId, programId, teiCalled) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify({
          trackedEntityInstance: teiCalled,
          program: programId,
          status: "ACTIVE",
          orgUnit: orgUnitId,
          enrollmentDate: today,
          incidentDate: today
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create enrollment for program ${programId}`);
      }

      return true;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  };

  const fetchOrgUnitUsersAssoc = async () => {
    try {
      const empUserName = formValues['g3J1CH26hSA'];
      const response = await fetch(
        `/api/users?filter=username:eq:${empUserName}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users for org unit');
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error fetching org unit users:', error);
      throw error;
    }
  };


  const updateUserOrgUnits = async (userId, orgUnitUpdateType, newOrgUnitId) => {
    try {
      // Step 1: Assign new org unit
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
        throw new Error(`Failed to assign new org unit for ${orgUnitUpdateType}Updates`);
      }

      // Step 2: Delete Botswana org unit (OVpBNoteQ2Y)
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
        throw new Error(`Failed to delete Botswana org unit for ${orgUnitUpdateType}`);
      }

      return true;
    } catch (error) {
      console.error(`Error in updateUserOrgUnits for ${orgUnitUpdateType}:`, error);
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const sendFacilityUpdateEmail = async () => {
    try {
      const response = await fetch('https://qimsdev.5am.co.bw/email2/api/facility-reg-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: "qimsmohbots@gmail.com",

        })
      });

      if (!response.ok) {
        throw new Error(`Email server responded with status ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  };


  const handleSubmit = async () => {
    try {
      console.log('🚀 === STARTING APPLICATION UPDATE PROCESS ===');
      console.log('Step 1: Initializing update process...');
      setLoading(true);
      setSuccessMessages([]);

      // Generate a new ID for org unit if complete is checked
      const orgUnitId = generate_orgUnitID();
      console.log('Step 2: Generated organization unit ID:', orgUnitId);

      // Prepare the payload
      console.log('Step 3: Preparing payload for DHIS2 update...');
      setCurrentStep('Saving...');
      const payload = {
        events: [{
          event: eventData.event, // Use eventData instead of request
          status: "COMPLETED", // We're completing the process, so hardcode COMPLETED
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
            { dataElement: 'PdtizqOqE6Q', value: formValues['PdtizqOqE6Q']?.trim() || '' }, // facilityName
            { dataElement: 'HMk4LZ9ESOq', value: formValues['HMk4LZ9ESOq']?.trim() || '' }, // firstName
            { dataElement: 'ykwhsQQPVH0', value: formValues['ykwhsQQPVH0']?.trim() || '' }, // surname
            // { dataElement: 'NVlLoMZbXIW', value: formValues['NVlLoMZbXIW'] || '' }, // email
            { dataElement: 'SReqZgQk0RY', value: formValues['SReqZgQk0RY']?.trim() || '' }, // phoneNumber
            // { dataElement: 'dRkX5jmHEIM', value: formValues['dRkX5jmHEIM'] || '' }, // physicalAddress
            // { dataElement: 'p7y0vqpP0W2', value: formValues['p7y0vqpP0W2'] || '' }, // correspondenceAddress
            { dataElement: 'SVzSsDiZMN5', value: formValues['SVzSsDiZMN5']?.trim() || '' }, // bhpcNumber
            { dataElement: 'aMFg2iq9VIg', value: formValues['aMFg2iq9VIg']?.trim() || '' }, // privatePracticeNumber
            { dataElement: 'VJzk8OdFJKA', value: parentOrgUnitId || '' }, // location
            // { dataElement: "PdtizqOqE6Q", value: formValues['PdtizqOqE6Q'] || '' }, // tei
            { dataElement: "g3J1CH26hSA", value: formValues['g3J1CH26hSA']?.trim() || '' }, // employeeUsername
            { dataElement: "jV5Y8XOfkgb", value: "true" },
            // Add any checklist items if needed
            // { dataElement: 'Bz0oYRvSypS', value: "true" },
            // ... other checklist items
          ].filter(dv => dv.value !== null && dv.value !== undefined)
        }]
      };

      console.log('Step 4: Sending update request to DHIS2...');
      // Send the request
      // setCurrentStep('Accepting request ...');
      setCurrentStep('Saving...');
      const API_URL = `/api/40/tracker?async=false&importStrategy=UPDATE`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify(payload)
      });

      // const contentType = response.headers.get('content-type');
      // if (!response.ok || !contentType?.includes('application/json')) {
      //     const raw = await response.text(); // Get raw response
      //     console.error('Unexpected response:', raw);
      //     throw new Error('Server did not return JSON. Check API URL and authentication.');
      // }

      const result = await response.json();
      console.log('✅ Step 4 COMPLETED: DHIS2 update successful:', result);
      // setSuccessMessages(prev => [...prev, 'Request updated successfully in DHIS2']);
      setSuccessMessages(prev => [...prev, '1 / 5']);
      setOpenSnackbar(true);

      console.log('Step 5: Creating organization unit...');
      // Creating org unit
      // setCurrentStep(`Adding ${locationName} facility to registry...`);
      setCurrentStep('Saving...');
      await createOrgUnit(orgUnitId);
      console.log('✅ Step 5 COMPLETED: Organization unit created successfully');
      // setSuccessMessages(prev => [...prev, 'Facility added to registry successfully']);
      setSuccessMessages(prev => [...prev, '2 / 5']);
      setOpenSnackbar(true);

      console.log('Step 6: Adding organization unit to program...');
      // Step 2b: Add org unit to program
      // setCurrentStep(`Facility updated...`);
      await addOrgUnitToProgram(orgUnitId);
      console.log('✅ Step 6 COMPLETED: Organization unit added to program');

      console.log('Step 7: Creating/updating tracked entity instance...');
      // New Step: Create or Update TEI
      // setCurrentStep('Updating facility dependecies...');
      setCurrentStep('Saving...');
      const updatedTei = await createOrUpdateTEI(orgUnitId);
      console.log('✅ Step 7 COMPLETED: Tracked entity instance created/updated:', updatedTei);
      // setSuccessMessages(prev => [...prev, 'Facility dependecies updated successfully']);
      setSuccessMessages(prev => [...prev, '3 / 5']);
      setOpenSnackbar(true);

      // Update the payload with the new TEI if it was created
      if (!formValues['PdtizqOqE6Q'] && updatedTei) {
        payload.events[0].dataValues = payload.events[0].dataValues.map(dv =>
          dv.dataElement === "PdtizqOqE6Q" ? { ...dv, value: updatedTei } : dv
        );
      }

      console.log('Step 8: Creating program enrollments...');
      // Step 2c: Create enrollments for all programs
      setCurrentStep('Saving...');
      // setCurrentStep('Creating program enrollments...');
      const programs = [
        'EE8yeLVo6cN', 'Xje2ga2tJcA', 'QSQWCmnsQtG',
        'adbaKjLFtYH', 'fWc9nCmUjez',
        'wlWC4vYeTzt', 'cghjivP9xA2'
      ]; // 'Y4W5qIKlOsh',

      for (const programId of programs) {
        await createEnrollment(orgUnitId, programId, updatedTei);
      }
      console.log('✅ Step 8 COMPLETED: Program enrollments created for all programs');
      // setSuccessMessages(prev => [...prev, 'Program enrollments created successfully']);
      setSuccessMessages(prev => [...prev, '4 / 5']);
      setOpenSnackbar(true);

      console.log('Step 9: Enabling users and assigning to location...');
      // NEW STEP: Enable users associated with the org unit
      // setCurrentStep('Enabling users and adding user to location...');
      try {
        const users = await fetchOrgUnitUsersAssoc();
        console.log(`Found ${users.length} users to enable for org unit`);

        const orgUnitTypes = [
          'organisationUnits',
          'dataViewOrganisationUnits',
          'teiSearchOrganisationUnits'
        ];

        // setCurrentStep(`Assigning User to New Facility...`);
        setCurrentStep('Saving...');
        for (const user of users) {
          for (const orgUnitType of orgUnitTypes) {
            await updateUserOrgUnits(user.id, orgUnitType, orgUnitId);
          }
          // await enableUser(user.id);
          // await addUsertoLocation(user.id);
          console.log(`Enabled user ${user.id}`);
        }
        console.log('✅ Step 9 COMPLETED: Users enabled and assigned to location');
        // setSuccessMessages(prev => [...prev, 'User assigned to new facility successfully']);
        setSuccessMessages(prev => [...prev, '5 / 5']);

        setOpenSnackbar(true);
        
        console.log('Step 10: Sending email notification...');
        // Step 10: Email sending is deactivated, but we simulate success for downstream logic
        setCurrentStep('Sending notification...');
        // Simulate email success without making the API call
        const emailSuccess = true;
        if (emailSuccess) {
          console.log('✅ Step 10 COMPLETED: (Email sending deactivated, simulated success)');
          setSuccessMessages(prev => [...prev, 'Email notification (deactivated)']);
          setOpenSnackbar(true);
          
          console.log('Step 11: Reloading data and switching to Facility Ownership tab...');
          // Step 11: Reload data and switch to Facility Ownership tab (only after simulated email success)
          setCurrentStep('Completing application...');
          setSuccessMessages(prev => [...prev, 'Reloading and switching to Facility Ownership']);
          
          // Store flag in localStorage to indicate we should select Facility Ownership tab after reload
          localStorage.setItem('autoSelectTab', 'facilityOwnership');
          
          // Add a short delay before reloading to ensure user sees the success message
          setTimeout(() => {
            console.log('🚀 EXECUTING Step 11: Triggering data refresh and tab switch...');
            // Instead of reloading the page, trigger a data refresh from localStorage
            // This will cause the parent component to re-fetch all data
            const refreshEvent = new CustomEvent('refreshApplicationData', {
              detail: { 
                action: 'refresh',
                timestamp: new Date().toISOString()
              }
            });
            window.dispatchEvent(refreshEvent);
            
            // Also trigger the tab switch
            const tabSwitchEvent = new CustomEvent('switchToTab', {
              detail: { 
                tab: 'facilityOwnership',
                timestamp: new Date().toISOString()
              }
            });
            window.dispatchEvent(tabSwitchEvent);
            
            console.log('✅ Step 11 COMPLETED: Data refresh and tab switch events dispatched');
          }, 1500);
          
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

      // Call the onSave callback with the updated data
      onSave({
        ...formData,
        checklist,
        comments
      });

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
                      label={formValues['VJzk8OdFJKA']}
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
                  onClick={async () => {
                    // First execute handleSubmit
                    await handleSubmit();

                    // Then send email
                    setCurrentStep('Sending notification...');
                    try {
                      const emailSuccess = await sendFacilityUpdateEmail();
                      if (emailSuccess) {
                        setSuccessMessages(prev => [...prev, 'Notification email sent']);
                        setOpenSnackbar(true);
                        
                        // Add a short delay before reloading to ensure user sees the success message
                        setTimeout(() => {
                          // Store a flag in localStorage to indicate we should select the Facility Ownership tab after reload
                          localStorage.setItem('autoSelectTab', 'facilityOwnership');
                          
                          // Reload the page
                          window.location.reload();
                        }, 1500);
                      }
                    } catch (emailError) {
                      console.error('Email sending failed:', emailError);
                      setSuccessMessages(prev => [...prev, 'Email notification failed']);
                      setOpenSnackbar(true);
                    }
                  }}
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