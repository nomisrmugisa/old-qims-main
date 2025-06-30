import React, { useState, useEffect, useRef } from 'react';
import './AddInspectionDialog.css';
import ModalPortal from './ModalPortal';

const AddInspectionDialog = ({ open, onClose, onSuccess, onAddSuccess, trackedEntityInstanceId, existingEvent, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    // Inspection Schedule Details
    inspectionDateTime: "",
    inspectionCode: "",
    
    // Inspection
    inspectionCoordinates: "",
    inspectionService: "",
    inspectionType: "",
    
    // ORGANISATION AND MANAGEMENT
    hasOrganisationalStructure: "",
    organisationalStructureComments: "",
    isDirectorMedicallyTrained: "",
    directorMedicallyTrainedComments: "",
    hasPoliciesForPatientAssessment: "",
    policiesForPatientAssessmentComments: "",
    hasPoliciesForPatientReferral: "",
    policiesForPatientReferralComments: "",
    hasPoliciesForPatientConsent: "",
    policiesForPatientConsentComments: "",
    
    // FACILITY: Environment
    hasWheelchairAccessibility: "",
    wheelchairAccessibilityComments: "",
    isFencedAndSecure: "",
    fencedAndSecureComments: "",
    hasAdequateParking: "",
    adequateParkingComments: "",
    isCleanAndNeat: "",
    cleanAndNeatComments: "",
    areSurfacesDustFree: "",
    surfacesDustFreeComments: "",
    hasAdequateLighting: "",
    adequateLightingComments: "",
    hasAirConditioning: "",
    airConditioningComments: "",
    hasEnoughVentilation: "",
    enoughVentilationComments: "",
    hasCleanableFlooring: "",
    cleanableFlooringComments: "",
    hasRestrictionSigns: "",
    restrictionSignsComments: "",
    hasDisabilityParking: "",
    disabilityParkingComments: "",
    hasDirectionalSignage: "",
    directionalSignageComments: "",
    hasBackupSystems: "",
    backupSystemsComments: "",
    
    // FACILITY: Reception/waiting area
    hasAdequateReceptionSpace: "",
    adequateReceptionSpaceComments: "",
    hasTelephone: "",
    telephoneComments: "",
    hasReceptionDesk: "",
    receptionDeskComments: "",
    isMannedAtAllTimes: "",
    mannedAtAllTimesComments: "",
    hasRegistrationSystem: "",
    registrationSystemComments: "",
    hasAdequateWaitingArea: "",
    adequateWaitingAreaComments: "",
    hasWasteBin: "",
    wasteBinComments: "",
    
    // Statutory Compliance
    applicationRequestType: "",
    facilityName: "",
    licenseHolderFirstName: "",
    licenseHolderSurname: "",
    bhpcRegistrationNumber: "",
    checkApplicationLetter: false,
    checkPrimaryQualification: false,
    checkRegistrationValid: false,
    
    // Inspectors Details
    inspectorFullname: ""
  });
  
  const [activeSection, setActiveSection] = useState("scheduleDetails");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [fieldUpdateStatus, setFieldUpdateStatus] = useState({});
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSettingInitialDateTime, setIsSettingInitialDateTime] = useState(false);
  const initializationAttempted = useRef(false);
  
  // Map of field names to their DHIS2 data element IDs
  const fieldToDataElementMap = {
    inspectionDateTime: "e4MmMJ3zrhK",
    inspectionCode: "wS6bfV1hrU0",
    inspectionCoordinates: "i9kOWg5uQTz",
    inspectionService: "y1VwuES8M22",
    inspectionType: "Pl4RdRtKErd",
    hasOrganisationalStructure: "WCys8b95Qrw",
    organisationalStructureComments: "teFycnNHffg",
    isDirectorMedicallyTrained: "IjNRqWzYbJV",
    directorMedicallyTrainedComments: "v4DWRidWHX9",
    hasPoliciesForPatientAssessment: "pCxcolinfQ0",
    policiesForPatientAssessmentComments: "FOW8R4nw0dk",
    hasPoliciesForPatientReferral: "D6yET9Rm3Ql",
    policiesForPatientReferralComments: "edNRtSgmfRp",
    hasPoliciesForPatientConsent: "qxWs7aK3qGZ",
    policiesForPatientConsentComments: "fFkxEotqKMr",
    hasWheelchairAccessibility: "wjLqyKpPclD",
    wheelchairAccessibilityComments: "LRbe4LXH2WL",
    isFencedAndSecure: "uiwrRhfPUX9",
    fencedAndSecureComments: "BO2pHqfNnqe",
    hasAdequateParking: "bWVuvn0rN0W",
    adequateParkingComments: "I6ufJBs2eOj",
    isCleanAndNeat: "mE0keb9FteW",
    cleanAndNeatComments: "AZYYyEXBPdq",
    areSurfacesDustFree: "B5nBVnHXJEI",
    surfacesDustFreeComments: "JXVYLrXU2Vf",
    hasAdequateLighting: "K3me4A3CyVO",
    adequateLightingComments: "VqYw0Gpvrz7",
    hasAirConditioning: "cZKJjxPFoww",
    airConditioningComments: "j78xuAxLOth",
    hasEnoughVentilation: "UVjFGL8YxgN",
    enoughVentilationComments: "fzh0jqLsAYY",
    hasCleanableFlooring: "RJpcV1quGsc",
    cleanableFlooringComments: "MJkboKCSgga",
    hasRestrictionSigns: "H7kdjWG5fJg",
    restrictionSignsComments: "eeRbQoKbcSb",
    hasDisabilityParking: "yHuVCptuYIz",
    disabilityParkingComments: "wVNQ7Zr0P93",
    hasDirectionalSignage: "TwRB3UCkOsj",
    directionalSignageComments: "gLmK1C8qN1l",
    hasBackupSystems: "kEMGyPm8YgH",
    backupSystemsComments: "BG25OkY21ax",
    hasAdequateReceptionSpace: "djiYFyxGWZg",
    adequateReceptionSpaceComments: "LEghzfULkDb",
    hasTelephone: "pn9KD7DP06F",
    telephoneComments: "UjVkPqvlOzU",
    hasReceptionDesk: "VVDIUCrOZhk",
    receptionDeskComments: "ugMMaTRPFPh",
    isMannedAtAllTimes: "YjmaVOE6X5z",
    mannedAtAllTimesComments: "eP8lVpOLrmy",
    hasRegistrationSystem: "SbZYLXje1tY",
    registrationSystemComments: "gWvs8M5mHAc",
    hasAdequateWaitingArea: "Ei1Yc8vwgWU",
    adequateWaitingAreaComments: "T6ttPAEWAXj",
    hasWasteBin: "GUHm0ghp9Tc",
    wasteBinComments: "ov9luioZOzD",
    applicationRequestType: "JSwAq5HRQa8",
    facilityName: "D707dj4Rpjz",
    licenseHolderFirstName: "HMk4LZ9ESOq",
    licenseHolderSurname: "ykwhsQQPVH0",
    bhpcRegistrationNumber: "SVzSsDiZMN5",
    checkApplicationLetter: "Bz0oYRvSypS",
    checkPrimaryQualification: "lOpMngOe2yY",
    checkRegistrationValid: "b8gm7x8JcLO",
    inspectorFullname: "VOjM6ArpORU"
  };
  
  // Function to generate a DHIS2-compatible UID
  const generateDHIS2UID = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    // First character must be a letter
    result += chars.charAt(Math.floor(Math.random() * 52)); // 52 letters (A-Z, a-z)
    // Remaining 10 characters can be letters or numbers
    for (let i = 1; i < 11; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  // Function to get the current user's organization unit
  const getCurrentUserOrgUnit = async () => {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me.json`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user information: ${response.status}`);
      }
      
      const userData = await response.json();
      
      // Check if the user has an organization unit
      if (!userData.organisationUnits || userData.organisationUnits.length === 0) {
        throw new Error("User has no associated organization units");
      }
      
      // Return the ID of the first organization unit (primary org unit)
      return userData.organisationUnits[0].id;
    } catch (error) {
      console.error("Error fetching user organization unit:", error);
      throw error;
    }
  };
  
  // Function to get the tracked entity instance ID for the current organization unit
  const getTrackedEntityInstanceId = async (orgUnitId) => {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required. Please log in again.");
    }
    
    try {
      // Use the API to fetch tracked entity instances for the given org unit and program
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances.json?ou=${orgUnitId}&fields=trackedEntityInstance&program=EE8yeLVo6cN`;
      console.log("Fetching tracked entity instances from:", url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tracked entity instances: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Tracked entity instances response:", data);
      
      // Check if any tracked entity instances were found
      if (!data.trackedEntityInstances || data.trackedEntityInstances.length === 0) {
        throw new Error("No tracked entity instances found for this organization unit and program");
      }
      
      // Return the ID of the first tracked entity instance
      return data.trackedEntityInstances[0].trackedEntityInstance;
    } catch (error) {
      console.error("Error fetching tracked entity instance ID:", error);
      throw error;
    }
  };

  // Get enrollment ID for the specific program from the tracked entity instance
  const getEnrollmentIdForProgram = async (teiId) => {
    const credentials = localStorage.getItem('userCredentials');
    
    if (!credentials) {
      throw new Error("Authentication required");
    }

    if (!teiId) {
      throw new Error("Tracked entity instance ID is required");
    }

    console.log("Fetching enrollment ID for TEI:", teiId, "and program: EE8yeLVo6cN");
    
    // Use the API endpoint you specified to get enrollments for this TEI
    const enrollmentUrl = `/api/trackedEntityInstances/${teiId}?fields=enrollments[program,enrollment]`;
    
    const enrollmentRes = await fetch(enrollmentUrl, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    
    if (!enrollmentRes.ok) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentRes.status}`);
    }
    
    const enrollmentData = await enrollmentRes.json();
    console.log("Enrollment API response:", enrollmentData);
    
    if (!enrollmentData.enrollments || enrollmentData.enrollments.length === 0) {
      throw new Error("No enrollments found for this tracked entity instance");
    }
    
    // Filter for the specific program (EE8yeLVo6cN)
    const programEnrollment = enrollmentData.enrollments.find(enrollment => 
      enrollment.program === "EE8yeLVo6cN"
    );
    
    if (!programEnrollment) {
      throw new Error("No enrollment found for program EE8yeLVo6cN");
    }
    
    console.log("Found enrollment for program:", programEnrollment);
    return programEnrollment.enrollment;
  };


  
  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingEvent && existingEvent.dataValues) {
      const getDataValue = (dataElementId) => {
        const dataValue = existingEvent.dataValues.find(dv => dv.dataElement === dataElementId);
        return dataValue ? dataValue.value : '';
      };

      const populatedFormData = {};
      Object.entries(fieldToDataElementMap).forEach(([fieldName, dataElementId]) => {
        let value = getDataValue(dataElementId);
        // Handle boolean fields (checkboxes)
        if (fieldName.startsWith('check')) {
          populatedFormData[fieldName] = value === 'true';
        } else {
          populatedFormData[fieldName] = value;
        }
      });

      setFormData(populatedFormData);
      setEventId(existingEvent.event);
      setIsInitializing(false);
      setIsSettingInitialDateTime(false);
    }
  }, [isEditMode, existingEvent, fieldToDataElementMap]);

  // Create the initial event when the component mounts (only for add mode)
  useEffect(() => {
    if (open && !isEditMode && !initializationAttempted.current) {
      // Start loading immediately when dialog opens
      setIsSettingInitialDateTime(true);
      initializationAttempted.current = true;
      createInitialEvent();
    }
    
    // Cleanup function
    return () => {
      // Reset state when component unmounts or closes
      if (!open) {
        setEventId(null);
        setFieldUpdateStatus({});
        setIsInitializing(false);
        setIsSettingInitialDateTime(false);
        initializationAttempted.current = false;
      }
    };
  }, [open, isEditMode]); // Add isEditMode to dependencies
  
  // Create the initial event
  const createInitialEvent = async () => {
    try {
      setIsInitializing(true);
      console.log("Creating initial inspection event...");
      
      const orgUnitId = await getCurrentUserOrgUnit();
      console.log("Retrieved organization unit ID:", orgUnitId);
      
      // Get the tracked entity instance ID from the API instead of props
      let teiId = trackedEntityInstanceId;
      if (!teiId) {
        try {
          teiId = await getTrackedEntityInstanceId(orgUnitId);
          console.log("Retrieved tracked entity instance ID:", teiId);
        } catch (error) {
          console.error("Could not fetch tracked entity instance ID:", error);
          setErrorMessage(`Could not fetch facility information: ${error.message}`);
          return;
        }
      }
      
      if (!orgUnitId || !teiId) {
        const missingItems = [];
        if (!orgUnitId) missingItems.push("organization unit ID");
        if (!teiId) missingItems.push("tracked entity instance ID");
        
        const errorMsg = `Authentication required: Missing ${missingItems.join(", ")}`;
        console.error(errorMsg);
        setErrorMessage(errorMsg);
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayDateTime = new Date().toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
      
      // Fetch the enrollment ID for the specific program instead of using localStorage or default
      const enrollmentId = await getEnrollmentIdForProgram(teiId);
      console.log("Retrieved enrollment ID:", enrollmentId);
      
      // Generate a DHIS2 UID for the event
      const generatedEventId = generateDHIS2UID();
      console.log("Generated event ID:", generatedEventId);
      
      // Using the exact payload structure with pre-generated event ID
      const payload = {
        events: [{
          event: generatedEventId,
          trackedEntityInstance: teiId,
          program: "EE8yeLVo6cN",
          programStage: "Eupjm3J0dt2", // Corrected program stage ID
          enrollment: enrollmentId,
          orgUnit: orgUnitId,
          notes: [],
          dataValues: [],
          status: "ACTIVE",
          eventDate: today
        }]
      };
      
      console.log("Creating event with payload:", payload);
      
      // Use the exact endpoint from the screenshot
      const eventRes = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${localStorage.getItem('userCredentials')}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (!eventRes.ok) {
        const errorText = await eventRes.text();
        console.error("Event creation API error:", {
          status: eventRes.status,
          statusText: eventRes.statusText,
          responseBody: errorText
        });
        throw new Error(`Event creation failed: ${eventRes.status} - ${errorText}`);
      }
      
      const responseData = await eventRes.json();
      console.log("Event creation response:", responseData);
      
      // Verify the event was created successfully
      if (responseData.response && responseData.response.status === 'ERROR') {
        throw new Error(`Event creation failed: ${responseData.response.message}`);
      }
      
      // Use the pre-generated event ID since we provided it in the payload
      const createdEventId = generatedEventId;
      console.log("Initial inspection event created with ID:", createdEventId);
      
      // Store the organization unit ID in localStorage for other components to use
      localStorage.setItem('userOrgUnitId', orgUnitId);
      
      // Set the event ID in state
      setEventId(createdEventId);

      // Update the form data with the initial datetime value
      setFormData(prevData => ({
        ...prevData,
        inspectionDateTime: todayDateTime
      }));

      // After creating the event, immediately update the inspection date field
      // Use the generated event ID directly instead of relying on state
      if (fieldToDataElementMap && fieldToDataElementMap.inspectionDateTime) {
        console.log("Updating initial inspection date field with event ID:", createdEventId);
        try {
          await submitFieldValueWithEventId('inspectionDateTime', todayDateTime, createdEventId);
          console.log("Initial date and time set successfully");
        } catch (error) {
          console.error("Error setting initial date and time:", error);
        } finally {
          setIsSettingInitialDateTime(false);
        }
      } else {
        // If no datetime field to update, stop loading
        setIsSettingInitialDateTime(false);
      }
      
      console.log("Form initialization completed successfully with event ID:", createdEventId);
    } catch (error) {
      console.error("Error creating initial event:", error);
      setErrorMessage(`Failed to initialize form: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Handle input change and immediate submission
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    
    // Determine the value based on input type
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Update local state
    setFormData((prevData) => ({
      ...prevData,
      [name]: inputValue,
    }));
    
    // Don't submit if we're still initializing or don't have an event ID yet
    if (isInitializing) {
      console.log("Form is still initializing, waiting to submit field:", name);
      return;
    }
    
    if (!eventId) {
      console.log("Event ID not yet available, waiting to submit field:", name);
      return;
    }
    
    // Set this field as updating
    setFieldUpdateStatus(prev => ({ ...prev, [name]: 'updating' }));
    
    try {
      await submitFieldValue(name, inputValue);
      // Mark field as successfully updated
      setFieldUpdateStatus(prev => ({ ...prev, [name]: 'success' }));
      
      // Clear success status after 2 seconds
      setTimeout(() => {
        setFieldUpdateStatus(prev => {
          const newStatus = { ...prev };
          if (newStatus[name] === 'success') {
            delete newStatus[name];
          }
          return newStatus;
        });
      }, 2000);
    } catch (error) {
      console.error(`Error updating field ${name}:`, error);
      // Mark field as failed
      setFieldUpdateStatus(prev => ({ ...prev, [name]: 'error' }));
    }
  };
  
     // Submit a single field value to DHIS2
   const submitFieldValue = async (fieldName, value) => {
     if (!eventId || eventId === 'null' || eventId === null) {
       console.error("Cannot submit field value - invalid event ID:", eventId);
       throw new Error("Event not properly initialized");
     }
     return submitFieldValueWithEventId(fieldName, value, eventId);
   };

   // Helper function to format datetime values for DHIS2
   const formatDateTimeForDHIS2 = (value, fieldName) => {
     // Handle boolean values (for checkboxes)
     if (typeof value === 'boolean') {
       return value.toString();
     }
     
     // For datetime fields, ensure proper format
     if (fieldName === 'inspectionDateTime' && value) {
       // If it's already in ISO format (from datetime-local input), use as is
       // If it's a date string, convert to datetime format
       if (value.includes('T')) {
         return value; // Already has time component
       } else {
         // Add default time if only date is provided
         return value + 'T00:00';
       }
     }
     return value;
   };

   // Submit a single field value to DHIS2 with specific event ID
   const submitFieldValueWithEventId = async (fieldName, value, targetEventId) => {
     const dataElementId = fieldToDataElementMap[fieldName];
     if (!dataElementId) {
       console.error("No data element ID found for field:", fieldName);
       return;
     }
     
     // Format the value appropriately for DHIS2
     const formattedValue = formatDateTimeForDHIS2(value, fieldName);
     
     const credentials = localStorage.getItem('userCredentials');
     
     if (!credentials) {
       throw new Error("Authentication required");
     }

     if (!targetEventId || targetEventId === 'null' || targetEventId === null) {
       console.error("Invalid event ID:", targetEventId);
       throw new Error("Valid event ID is required for field update");
     }
     
     // Use the DHIS2 API to update event data values
     // Need to send a complete event payload with dataValues array
     const url = `${import.meta.env.VITE_DHIS2_URL}/api/events/${targetEventId}.json`;
     console.log(`Updating field ${fieldName} (${dataElementId}) with value:`, value, `for event:`, targetEventId);
     
     // Get current event data to build the payload
     const eventResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/events/${targetEventId}.json`, {
       headers: {
         Authorization: `Basic ${credentials}`,
       },
     });
     
     if (!eventResponse.ok) {
       throw new Error(`Failed to fetch current event data: ${eventResponse.status}`);
     }
     
     const currentEvent = await eventResponse.json();
     
     // Find existing data value or create new one
     let dataValues = currentEvent.dataValues || [];
     const existingIndex = dataValues.findIndex(dv => dv.dataElement === dataElementId);
     
     if (existingIndex >= 0) {
       // Update existing data value
       dataValues[existingIndex] = {
         dataElement: dataElementId,
         value: formattedValue,
         providedElsewhere: false
       };
     } else {
       // Add new data value
       dataValues.push({
         dataElement: dataElementId,
         value: formattedValue,
         providedElsewhere: false
       });
     }
     
     // Build the complete event payload
     const eventPayload = {
       event: targetEventId,
       orgUnit: currentEvent.orgUnit,
       program: currentEvent.program,
       programStage: currentEvent.programStage,
       status: currentEvent.status || "ACTIVE",
       trackedEntityInstance: currentEvent.trackedEntityInstance,
       dataValues: dataValues
     };
     
     const response = await fetch(url, {
       method: "PUT",
       headers: {
         Authorization: `Basic ${credentials}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify(eventPayload),
     });
     
     if (!response.ok) {
       const errorText = await response.text();
       console.error("Field update API error:", {
         status: response.status,
         statusText: response.statusText,
         url: url,
         responseBody: errorText
       });
       throw new Error(`Field update failed: ${response.status} - ${errorText}`);
     }
     
     const responseData = await response.json();
     console.log(`Field ${fieldName} updated successfully:`, responseData);
     return responseData;
  };
  
  // Complete the form and close the dialog
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const credentials = localStorage.getItem('userCredentials');
      
      if (!credentials || !eventId) {
        throw new Error("Authentication required or event not created");
      }
      
      // Store the organization unit ID in localStorage for other components to use
      try {
        const orgUnitId = await getCurrentUserOrgUnit();
        localStorage.setItem('userOrgUnitId', orgUnitId);
      } catch (error) {
        console.warn("Could not update organization unit ID in localStorage:", error);
      }
      
      if (isEditMode) {
        // For edit mode, just update the event (don't complete it)
        console.log("Inspection updated successfully!");
        
        // Call success callback to reload data in parent
        if (typeof onSuccess === 'function') {
          onSuccess();
        } else if (typeof onAddSuccess === 'function') {
          onAddSuccess();
        }
        
        onClose(); // Close modal on successful update
      } else {
        // For add mode, mark the event as complete
        const completeUrl = `${import.meta.env.VITE_DHIS2_URL}/api/events/${eventId}/complete.json`;
        console.log("Completing inspection event:", eventId);
        const completeRes = await fetch(completeUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          }
        });
        
        if (!completeRes.ok) {
          const errorText = await completeRes.text();
          throw new Error(`Event completion failed: ${completeRes.status} - ${errorText}`);
        }
        
        console.log("Inspection completed successfully!");
        // Set inspection complete in localStorage
        localStorage.setItem('situationalAnalysisComplete', 'true');
        
        // Call success callback to reload data in parent
        // Support both onSuccess (from RegistrationDetails) and onAddSuccess (for backward compatibility)
        if (typeof onSuccess === 'function') {
          onSuccess();
        } else if (typeof onAddSuccess === 'function') {
          onAddSuccess();
        }
        
        onClose(); // Close modal on successful completion
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'completing'} inspection:`, error);
      setErrorMessage(`Failed to ${isEditMode ? 'update' : 'complete'} inspection: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get status indicator for a field
  const getFieldStatusIndicator = (fieldName) => {
    const status = fieldUpdateStatus[fieldName];
    if (!status) return null;
    
    switch (status) {
      case 'updating':
        return <span className="field-status updating">Saving...</span>;
      case 'success':
        return <span className="field-status success">✓</span>;
      case 'error':
        return <span className="field-status error">Failed to save</span>;
      default:
        return null;
    }
  };
  
  // Handle cancel action - refresh parent and close dialog
  const handleCancel = () => {
    console.log("AddInspectionDialog handleCancel called");
    console.log("- onSuccess exists:", typeof onSuccess === 'function');
    console.log("- onAddSuccess exists:", typeof onAddSuccess === 'function');
    console.log("- onClose exists:", typeof onClose === 'function');
    
    if (!isSubmitting) {
      // Refresh the parent table to reflect any real-time updates made during editing
      if (typeof onSuccess === 'function') {
        console.log("- Calling onSuccess to refresh table");
        onSuccess();
      } else if (typeof onAddSuccess === 'function') {
        console.log("- Calling onAddSuccess to refresh table");
        onAddSuccess();
      }
      
      // Call onClose to close the dialog
      if (typeof onClose === 'function') {
        console.log("- Calling onClose to close dialog");
        onClose();
      }
    }
  };
  
  const renderSection = () => {
    switch (activeSection) {
      case "scheduleDetails":
        return (
          <div className="form-section">
            <h6 className="section-title">Inspection Schedule Details</h6>
            <div className="form-group">
              <label>Inspection Date and Time:</label>
              <div className="input-with-status">
                <input
                  type="datetime-local"
                  name="inspectionDateTime"
                  value={formData.inspectionDateTime}
                  onChange={handleInputChange}
                  onBlur={handleInputChange} // Also trigger on blur for better UX
                  className="form-control"
                  required
                  disabled={isSettingInitialDateTime}
                />
                {isSettingInitialDateTime ? (
                  <span className="field-status updating">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div className="mini-spinner" style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #856404',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}></div>
                      Loading...
                    </div>
                  </span>
                ) : (
                  getFieldStatusIndicator('inspectionDateTime')
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Inspection Code:</label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="inspectionCode"
                  value={formData.inspectionCode}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  required
                />
                {getFieldStatusIndicator('inspectionCode')}
              </div>
            </div>
          </div>
        );
      
      case "statutoryCompliance":
        return (
          <div className="form-section">
            <h6 className="section-title">Statutory Compliance</h6>
            <div className="form-group">
              <label>Application Request Type:</label>
              <div className="input-with-status">
                <select
                  name="applicationRequestType"
                  value={formData.applicationRequestType}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Type</option>
                  <option value="New Application">New Application</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Amendment">Amendment</option>
                </select>
                {getFieldStatusIndicator('applicationRequestType')}
              </div>
            </div>
            <div className="form-group">
              <label>Facility Name:</label>
              <div className="input-with-status">
                <textarea
                  name="facilityName"
                  value={formData.facilityName}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('facilityName')}
              </div>
            </div>
            <div className="form-group">
              <label>License Holder First Name:</label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="licenseHolderFirstName"
                  value={formData.licenseHolderFirstName}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                />
                {getFieldStatusIndicator('licenseHolderFirstName')}
              </div>
            </div>
            <div className="form-group">
              <label>License Holder Surname:</label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="licenseHolderSurname"
                  value={formData.licenseHolderSurname}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                />
                {getFieldStatusIndicator('licenseHolderSurname')}
              </div>
            </div>
            <div className="form-group">
              <label>B.H.P.C Registration Number:</label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="bhpcRegistrationNumber"
                  value={formData.bhpcRegistrationNumber}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                />
                {getFieldStatusIndicator('bhpcRegistrationNumber')}
              </div>
            </div>
            
            <h6 className="section-title">Compliance Checks</h6>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkApplicationLetter"
                  name="checkApplicationLetter"
                  checked={formData.checkApplicationLetter}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                />
                <label htmlFor="checkApplicationLetter">Application Letter Checked</label>
                {getFieldStatusIndicator('checkApplicationLetter')}
              </div>
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkPrimaryQualification"
                  name="checkPrimaryQualification"
                  checked={formData.checkPrimaryQualification}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                />
                <label htmlFor="checkPrimaryQualification">Primary Qualification Checked</label>
                {getFieldStatusIndicator('checkPrimaryQualification')}
              </div>
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="checkRegistrationValid"
                  name="checkRegistrationValid"
                  checked={formData.checkRegistrationValid}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                />
                <label htmlFor="checkRegistrationValid">Registration Valid Checked</label>
                {getFieldStatusIndicator('checkRegistrationValid')}
              </div>
            </div>
          </div>
        );
      
      case "inspection":
        return (
          <div className="form-section">
            <h6 className="section-title">Inspection</h6>
            <div className="form-group">
              <label>Coordinates:</label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="inspectionCoordinates"
                  value={formData.inspectionCoordinates}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  placeholder="e.g. 24.6859, 25.9089"
                />
                {getFieldStatusIndicator('inspectionCoordinates')}
              </div>
            </div>
            <div className="form-group">
              <label>Service:</label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="inspectionService"
                  value={formData.inspectionService}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                />
                {getFieldStatusIndicator('inspectionService')}
              </div>
            </div>
            <div className="form-group">
              <label>Type:</label>
              <div className="input-with-status">
                <select
                  name="inspectionType"
                  value={formData.inspectionType}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Type</option>
                  <option value="Initial">Initial</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Routine">Routine</option>
                  <option value="Special">Special</option>
                </select>
                {getFieldStatusIndicator('inspectionType')}
              </div>
            </div>
          </div>
        );
      
      case "organization":
        return (
          <div className="form-section">
            <h6 className="section-title">Organisation and Management</h6>
            
            <div className="form-group">
              <label>Does the clinic have an organisational structure?</label>
              <div className="input-with-status">
                <select
                  name="hasOrganisationalStructure"
                  value={formData.hasOrganisationalStructure}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasOrganisationalStructure')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="organisationalStructureComments"
                  value={formData.organisationalStructureComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('organisationalStructureComments')}
              </div>
            </div>
            
            <div className="form-group">
              <label>Is the director a medically trained person?</label>
              <div className="input-with-status">
                <select
                  name="isDirectorMedicallyTrained"
                  value={formData.isDirectorMedicallyTrained}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('isDirectorMedicallyTrained')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="directorMedicallyTrainedComments"
                  value={formData.directorMedicallyTrainedComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('directorMedicallyTrainedComments')}
              </div>
            </div>
            
            <div className="form-group">
              <label>Does the clinic have policies and procedures for assessment of patients?</label>
              <div className="input-with-status">
                <select
                  name="hasPoliciesForPatientAssessment"
                  value={formData.hasPoliciesForPatientAssessment}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasPoliciesForPatientAssessment')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="policiesForPatientAssessmentComments"
                  value={formData.policiesForPatientAssessmentComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('policiesForPatientAssessmentComments')}
              </div>
            </div>
            
            <div className="form-group">
              <label>Does the clinic have policies and procedures for patient referral?</label>
              <div className="input-with-status">
                <select
                  name="hasPoliciesForPatientReferral"
                  value={formData.hasPoliciesForPatientReferral}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasPoliciesForPatientReferral')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="policiesForPatientReferralComments"
                  value={formData.policiesForPatientReferralComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('policiesForPatientReferralComments')}
              </div>
            </div>
            
            <div className="form-group">
              <label>Does the clinic have policies and procedures for patient consent?</label>
              <div className="input-with-status">
                <select
                  name="hasPoliciesForPatientConsent"
                  value={formData.hasPoliciesForPatientConsent}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasPoliciesForPatientConsent')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="policiesForPatientConsentComments"
                  value={formData.policiesForPatientConsentComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('policiesForPatientConsentComments')}
              </div>
            </div>
          </div>
        );
      
      case "environment":
        return (
          <div className="form-section">
            <h6 className="section-title">Facility: Environment</h6>
            
            <div className="form-group">
              <label>Does the facility have wheelchair accessibility?</label>
              <div className="input-with-status">
                <select
                  name="hasWheelchairAccessibility"
                  value={formData.hasWheelchairAccessibility}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasWheelchairAccessibility')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="wheelchairAccessibilityComments"
                  value={formData.wheelchairAccessibilityComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('wheelchairAccessibilityComments')}
              </div>
            </div>
            
            <div className="form-group">
              <label>Is it fenced, secure and easily accessible?</label>
              <div className="input-with-status">
                <select
                  name="isFencedAndSecure"
                  value={formData.isFencedAndSecure}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('isFencedAndSecure')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="fencedAndSecureComments"
                  value={formData.fencedAndSecureComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('fencedAndSecureComments')}
              </div>
            </div>
            
            <div className="form-group">
              <label>Is there adequate space for parking?</label>
              <div className="input-with-status">
                <select
                  name="hasAdequateParking"
                  value={formData.hasAdequateParking}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasAdequateParking')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="adequateParkingComments"
                  value={formData.adequateParkingComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('adequateParkingComments')}
              </div>
            </div>
          </div>
        );
      
      case "reception":
        return (
          <div className="form-section">
            <h6 className="section-title">Facility: Reception/waiting area</h6>
            
            <div className="form-group">
              <label>Does reception area have adequate space?</label>
              <div className="input-with-status">
                <select
                  name="hasAdequateReceptionSpace"
                  value={formData.hasAdequateReceptionSpace}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasAdequateReceptionSpace')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="adequateReceptionSpaceComments"
                  value={formData.adequateReceptionSpaceComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('adequateReceptionSpaceComments')}
              </div>
            </div>
            
            <div className="form-group">
              <label>Is the telephone/cell phone available?</label>
              <div className="input-with-status">
                <select
                  name="hasTelephone"
                  value={formData.hasTelephone}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {getFieldStatusIndicator('hasTelephone')}
              </div>
            </div>
            <div className="form-group">
              <label>Comments:</label>
              <div className="input-with-status">
                <textarea
                  name="telephoneComments"
                  value={formData.telephoneComments}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  rows="2"
                />
                {getFieldStatusIndicator('telephoneComments')}
              </div>
            </div>
          </div>
        );
      
      case "inspector":
        return (
          <div className="form-section">
            <h6 className="section-title">Inspector Details</h6>
            <div className="form-group">
              <label>Inspector's Full Name:</label>
              <div className="input-with-status">
                <input
                  type="text"
                  name="inspectorFullname"
                  value={formData.inspectorFullname}
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  className="form-control"
                  required
                />
                {getFieldStatusIndicator('inspectorFullname')}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const isFormValid = () => {
    // Basic validation - at minimum require inspection date/time and inspector name
    return formData.inspectionDateTime && formData.inspectorFullname;
  };
  
  return (
    <ModalPortal open={open} onClose={handleCancel}>
      <div className="modal-content" style={{ padding: '0', maxWidth: '1200px' }}>
        <div className="modal-header">
          <h5 className="modal-title">{isEditMode ? 'Edit Inspection' : 'Add Inspection'}</h5>
          <button 
            type="button" 
            className="close-btn" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {!eventId && !isEditMode && <div className="alert alert-info">Initializing form...</div>}
          {isSettingInitialDateTime && (
            <div className="loading-container" style={{ 
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                <div className="rotating-loader" style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #e9ecef',
                  borderTop: '3px solid #007bff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></div>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: '#495057'
                }}>
                  Initializing inspection form...
                </span>
              </div>
            </div>
          )}
          
          <div className="section-tabs">
            <button 
              className={`section-tab ${activeSection === "scheduleDetails" ? "active" : ""}`}
              onClick={() => setActiveSection("scheduleDetails")}
            >
              Schedule Details
            </button>
            <button 
              className={`section-tab ${activeSection === "statutoryCompliance" ? "active" : ""}`}
              onClick={() => setActiveSection("statutoryCompliance")}
            >
              Statutory Compliance
            </button>
            <button 
              className={`section-tab ${activeSection === "inspection" ? "active" : ""}`}
              onClick={() => setActiveSection("inspection")}
            >
              Inspection
            </button>
            <button 
              className={`section-tab ${activeSection === "organization" ? "active" : ""}`}
              onClick={() => setActiveSection("organization")}
            >
              Organization
            </button>
            <button 
              className={`section-tab ${activeSection === "environment" ? "active" : ""}`}
              onClick={() => setActiveSection("environment")}
            >
              Environment
            </button>
            <button 
              className={`section-tab ${activeSection === "reception" ? "active" : ""}`}
              onClick={() => setActiveSection("reception")}
            >
              Reception
            </button>
            <button 
              className={`section-tab ${activeSection === "inspector" ? "active" : ""}`}
              onClick={() => setActiveSection("inspector")}
            >
              Inspector
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="inspection-form">
            {renderSection()}
            
            <div className="button-container">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting || !isFormValid() || !eventId}
              >
                {isSubmitting ? (isEditMode ? "Updating..." : "Completing...") : (isEditMode ? "Update Inspection" : "Complete Inspection")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AddInspectionDialog; 