import React, { useState, useEffect } from 'react';
import './RegistrationDetails.css'; // We'll create this CSS file next
import EditFacilityOwnershipDialog from './EditFacilityOwnershipDialog';
import AddEmployeeRegistrationDialog from './AddEmployeeRegistrationDialog';
import EditEmployeeRegistrationDialog from './EditEmployeeRegistrationDialog';
import AddServiceOfferingDialog from './AddServiceOfferingDialog';
import EditServiceOfferingDialog from './EditServiceOfferingDialog';
import AddInspectionDialog from './AddInspectionDialog';
import AddStatutoryComplianceDialog from './AddStatutoryComplianceDialog';
import AddEquipmentDialog from './AddEquipmentDialog';

import TrackerEventDetails from './TrackerEventDetails';
import { styled, Box, Typography, Divider, useTheme, Tooltip } from '@mui/material';
import CustomDateRangePicker from './CustomDateRangePicker';
import {StorageService} from '../services';
import { getCredentials } from '../utils/credentialHelper';
// import { useTheme } from '@mui/material/styles';

// Inside your component:


const RegistrationDetails = ({ trackedEntityInstanceId, showReviewDialog }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('completeApplication');
  const [events, setEvents] = useState([]);
  const [employeeEvents, setEmployeeEvents] = useState([]);
  const [serviceEvents, setServiceEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [openInspectionDialog, setOpenInspectionDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployeeEvent, setSelectedEmployeeEvent] = useState(null);
  const [showEditEmployeeDialog, setShowEditEmployeeDialog] = useState(false);
  const [selectedServiceEvent, setSelectedServiceEvent] = useState(null);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [completeApplicationStatus, setCompleteApplicationStatus] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [completeApplicationEvent, setCompleteApplicationEvent] = useState(null);
  
  // Situational Analysis state
  const [inspectionEvents, setInspectionEvents] = useState([]);
  const [isLoadingInspections, setIsLoadingInspections] = useState(true);
  const [selectedInspectionEvent, setSelectedInspectionEvent] = useState(null);
  const [showEditInspectionDialog, setShowEditInspectionDialog] = useState(false);
  
  // Equipment & Machinery state
  const [equipmentEvents, setEquipmentEvents] = useState([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [selectedEquipmentEvent, setSelectedEquipmentEvent] = useState(null);
  const [showEditEquipmentDialog, setShowEditEquipmentDialog] = useState(false);
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);

  // Statutory Compliance state
  const [statutoryComplianceEvents, setStatutoryComplianceEvents] = useState([]);
  const [isLoadingStatutoryCompliance, setIsLoadingStatutoryCompliance] = useState(true);
  const [openStatutoryComplianceDialog, setOpenStatutoryComplianceDialog] = useState(false);
  const [selectedStatutoryComplianceEvent, setSelectedStatutoryComplianceEvent] = useState(null);
  const [showEditStatutoryComplianceDialog, setShowEditStatutoryComplianceDialog] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState("Unknown"); // New state for overall status
  
  // Tab validation states
  const [tabValidationStates, setTabValidationStates] = useState({
    facilityOwnership: false,
    employeeRegistration: false,
    servicesOffered: false,
    statutoryCompliance: false,
    equipmentMachinery: false,
    inspectionSchedule: false
  });

  // Track if application has been submitted for review
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false);

  // Centralized function to get the current trackedEntityInstanceId
  const getCurrentTrackedEntityInstanceId = () => {
    // Priority order: props > localStorage > null
    const propId = trackedEntityInstanceId;
    const localStorageId = localStorage.getItem('tempTrackedEntityInstanceId');
    
    console.log("🔍 === GETTING TRACKED ENTITY INSTANCE ID ===");
    console.log("- Prop ID:", propId);
    console.log("- LocalStorage ID:", localStorageId);
    
    const finalId = propId || localStorageId;
    console.log("- Final ID:", finalId);
    
    return finalId;
  };

  // Listen for a custom event to set submission state (can be triggered from the review button)
  useEffect(() => {
    const handler = () => setIsApplicationSubmitted(true);
    window.addEventListener('applicationSubmitted', handler);
    return () => window.removeEventListener('applicationSubmitted', handler);
  }, []);

  const StepContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'nowrap', // Prevent wrapping of steps to new line
    justifyContent: 'space-between', // Distribute space evenly
    width: '100%', // Use full width
    overflow: 'hidden', // Hide overflow
  }));
  
  const Step = styled(Box)(({ theme, active, hasdata, disabled }) => ({
    display: 'flex',
    alignItems: 'flex-start', // Changed from center to align with first line when wrapped
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    maxWidth: '150px', // Constrain overall width of each step
    '& .step-number': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      borderRadius: '50%',
      backgroundColor: active 
        ? hasdata 
          ? theme.palette.success.main 
          : theme.palette.error.main
        : theme.palette.grey[300],
      color: active ? theme.palette.common.white : theme.palette.text.primary,
      marginRight: theme.spacing(1),
      fontSize: '0.75rem',
      fontWeight: 'bold',
      flexShrink: 0, // Prevent number from shrinking
      marginTop: '2px', // Align with first line of wrapped text
    },
    '& .step-title': {
      color: active 
        ? hasdata 
          ? theme.palette.success.main 
          : theme.palette.error.main
        : disabled ? theme.palette.text.disabled : theme.palette.text.primary,
      fontWeight: active ? 'bold' : 'normal',
      marginRight: theme.spacing(1),
      whiteSpace: 'normal', // Allow text to wrap
      wordBreak: 'break-word', // Break words if needed
      fontSize: '0.9rem', // Slightly smaller font
      lineHeight: 1.2, // Tighter line height for wrapped text
      textAlign: 'left', // Ensure text is left-aligned
    },
    '& .completion-indicator': {
      marginLeft: theme.spacing(1),
      fontSize: '0.9rem',
      fontWeight: 'bold',
      flexShrink: 0, // Prevent indicator from shrinking
    },
  }));
  
  const StyledDivider = styled(Box)(({ theme, disabled }) => ({
    width: '60px', // Reduced width to save horizontal space
    margin: '0 4px', // Reduced margin to save space
    alignSelf: 'center',
    opacity: disabled ? 0.6 : 1,
    flexShrink: 1, // Allow divider to shrink if needed
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&::after': {
      content: '"→"',
      fontSize: '20px',
      color: disabled ? theme.palette.grey[300] : theme.palette.divider,
      fontWeight: 'bold',
    }
  }));
  
  // Check localStorage for completeApplicationStatus on component mount and when tab changes
  useEffect(() => {
    const checkCompleteApplicationStatus = () => {
      try {
        const status = localStorage.getItem('completeApplicationFormStatus');
        if (status) {
          setCompleteApplicationStatus(JSON.parse(status));
        }
      } catch (error) {
        console.error("Error reading form status from localStorage:", error);
      }
    };
    
    checkCompleteApplicationStatus();
    
    // Set up an interval to check for status changes
    const intervalId = setInterval(checkCompleteApplicationStatus, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle form status change from TrackerEventDetails component
  const handleFormStatusChange = (isComplete) => {
    setCompleteApplicationStatus(isComplete);
  };

  // Handle successful application update - switch to facility ownership tab
  const handleApplicationUpdateSuccess = async () => {
    console.log("Application updated successfully - fetching facility ownership data before switching tab");
    await fetchFacilityOwnershipData();
    setActiveTab('facilityOwnership');
    setOpenAddDialog(true); // Automatically open the Add Facility Ownership dialog
  };

  // Function to validate facility ownership completion
  const validateFacilityOwnership = (facilityEvents) => {
    console.log("🔍 === FACILITY OWNERSHIP VALIDATION ===");
    console.log("- Events to validate:", facilityEvents?.length || 0);
    
    if (!facilityEvents || facilityEvents.length === 0) {
      console.log("- VALIDATION RESULT: FALSE (No records exist)");
      return false; // No records exist
    }

    // First, check if application is submitted
    const applicationSubmitted = facilityEvents.some(event => {
      if (!event.dataValues) return false;
      const dataValue = event.dataValues.find(dv => dv.dataElement === DATA_ELEMENTS.APPLICATION_SUBMITTED);
      return dataValue && dataValue.value === "true";
    });

    console.log("- Application Submitted:", applicationSubmitted);

    // If application is submitted, consider facility ownership complete
    if (applicationSubmitted) {
      console.log("- VALIDATION RESULT: TRUE (Application submitted)");
      return true;
    }

    // If application is not submitted, check for basic required fields
    const basicRequiredFields = [
      "HMk4LZ9ESOq", // firstName
      "ykwhsQQPVH0", // surname
      "zVmmto7HwOc", // citizen
      "vAHHXaW0Pna", // ownershipType
      "FLcrCfTNcQi", // idType
      "aUGSyyfbUVI"  // id
    ];

    console.log("- Basic required fields count:", basicRequiredFields.length);

    // Check if ANY record has the basic required fields filled
    const hasBasicData = facilityEvents.some(event => {
      if (!event.dataValues) {
        console.log(`- Event ${event.event}: No dataValues`);
        return false;
      }
      
      const missingFields = [];
      const hasBasicFields = basicRequiredFields.every(fieldId => {
        const dataValue = event.dataValues.find(dv => dv.dataElement === fieldId);
        const isValid = dataValue && dataValue.value && dataValue.value.trim() !== "";
        if (!isValid) {
          missingFields.push(fieldId);
        }
        return isValid;
      });
      
      console.log(`- Event ${event.event}: Has basic fields = ${hasBasicFields}, Missing fields:`, missingFields);
      return hasBasicFields;
    });
    
    console.log("- VALIDATION RESULT:", hasBasicData ? "TRUE (Has basic data)" : "FALSE (No basic data)");
    return hasBasicData;
  };

  // Function to validate employee registration completion
  const validateEmployeeRegistration = (employeeEvents) => {
    console.log("👥 === EMPLOYEE REGISTRATION VALIDATION ===");
    console.log("- Events to validate:", employeeEvents?.length || 0);
    
    if (!employeeEvents || employeeEvents.length === 0) {
      console.log("- VALIDATION RESULT: FALSE (No employee records exist)");
      return false; // No records exist
    }

    // Required fields for employee registration (based on AddEmployeeRegistrationDialog structure)
    const requiredFields = [
      "IIxbad41cH6", // firstName
      "VFTRgPnvSHV", // lastName
      "xcTxmEUy6g6", // bhpcNmcNumber
      "FClCncccLzw", // position
      "F3h1A96t3uL"  // contractType
    ];

    console.log("- Required employee fields count:", requiredFields.length);

    // Check if ALL employee records have all required fields filled
    const allEmployeeRecordsComplete = employeeEvents.every(event => {
      if (!event.dataValues) {
        console.log(`- Employee Event ${event.event}: No dataValues`);
        return false;
      }
      
      const missingFields = [];
      const hasAllFields = requiredFields.every(fieldId => {
        const dataValue = event.dataValues.find(dv => dv.dataElement === fieldId);
        const isValid = dataValue && dataValue.value && dataValue.value.trim() !== "";
        if (!isValid) {
          missingFields.push(fieldId);
        }
        return isValid;
      });
      
      console.log(`- Employee Event ${event.event}: Complete = ${hasAllFields}, Missing fields:`, missingFields);
      return hasAllFields;
    });
    
    console.log("- EMPLOYEE VALIDATION RESULT:", allEmployeeRecordsComplete ? "TRUE (ALL employee records complete)" : "FALSE (Some employee records incomplete)");
    return allEmployeeRecordsComplete;
  };

  // Function to validate services offered completion
  const validateServicesOffered = (serviceEvents) => {
    console.log("🏥 === SERVICES OFFERED VALIDATION ===");
    console.log("- Events to validate:", serviceEvents?.length || 0);
    
    if (!serviceEvents || serviceEvents.length === 0) {
      console.log("- VALIDATION RESULT: FALSE (No service records exist)");
      return false; // No records exist
    }

    // All available service data elements from AddServiceOfferingDialog
    const serviceDataElements = [
      "j57HXXX4Ijz", // coreEmergencyServices
      "ECjGkIq0Deq", // coreGeneralPracticeServices
      "aM41KiGDJAs", // coreTreatmentAndCare
      "flzyZUlf30v", // coreUrgentCare
      "SMvKa2EWeBO", // additionalHealthEducation
      "y9QSgKRoc6L", // specialisedMaternityAndReproductiveHealth
      "yZhlCTgamq0", // specialisedMentalHealthAndSubstanceAbuse
      "RCvjFJQUaPV", // specialisedRadiology
      "uxcdCPnaqWL", // specialisedRehabilitation
      "r76ODkNZv43", // supportAmbulatoryCare
      "E7OMKr09N0R", // supportDialysisCenters
      "GyQNkXpNraW", // supportHospices
      "OgpVvPxkLwf", // supportLabServices
      "rLC2CE79p7Q", // supportNursingHomes
      "w86r0XZCLCr", // supportOutpatientDepartment
      "m8Kl585eWSK", // supportPatientTransportation
      "yecnkdC7HtM", // supportPharmacy
      "i0QXYWMOUjy", // additionalCounseling
      "e48W7983nBs"  // additionalCommunityBased
    ];

    console.log("- Available service data elements count:", serviceDataElements.length);

    // Check if ALL service records have at least one service selected
    const allServiceRecordsComplete = serviceEvents.every(event => {
      if (!event.dataValues) {
        console.log(`- Service Event ${event.event}: No dataValues`);
        return false;
      }
      
      // Count how many services are selected (value = "true")
      const selectedServices = event.dataValues.filter(dv => {
        return serviceDataElements.includes(dv.dataElement) && dv.value === "true";
      });
      
      const hasServices = selectedServices.length > 0;
      console.log(`- Service Event ${event.event}: Has services = ${hasServices}, Selected services count: ${selectedServices.length}`);
      
      if (!hasServices) {
        console.log(`- Service Event ${event.event}: No services selected`);
      } else {
        console.log(`- Service Event ${event.event}: Selected services:`, selectedServices.map(s => s.dataElement));
      }
      
      return hasServices;
    });
    
    console.log("- SERVICES VALIDATION RESULT:", allServiceRecordsComplete ? "TRUE (ALL service records have at least one service)" : "FALSE (Some service records have no services selected)");
    return allServiceRecordsComplete;
  };

  // Function to validate statutory compliance completion
  const validateStatutoryCompliance = (complianceEvents) => {
    console.log("📋 === STATUTORY COMPLIANCE VALIDATION ===");
    console.log("- Events to validate:", complianceEvents?.length || 0);
    
    if (!complianceEvents || complianceEvents.length === 0) {
      console.log("- VALIDATION RESULT: FALSE (No compliance records exist)");
      return false; // No records exist
    }

    // Required document data elements from AddStatutoryComplianceDialog
    const requiredDocumentFields = [
      "fSGzyNOvsn3", // companyRegistrationDocuments
      "mooXtirlse9", // companyTaxRegistrationDocuments
      "Yv2HUJvSDKB", // facilityHealthRecognitionDocuments
      "aa4jP4GCtin"  // facilityCompanyLeaseAgreement
    ];

    console.log("- Required document fields count:", requiredDocumentFields.length);

    // Check if ALL compliance records have all required documents uploaded
    const allComplianceRecordsComplete = complianceEvents.every(event => {
      if (!event.dataValues) {
        console.log(`- Compliance Event ${event.event}: No dataValues`);
        return false;
      }
      
      const missingDocuments = [];
      const hasAllDocuments = requiredDocumentFields.every(fieldId => {
        const dataValue = event.dataValues.find(dv => dv.dataElement === fieldId);
        const isValid = dataValue && dataValue.value && dataValue.value.trim() !== "";
        if (!isValid) {
          missingDocuments.push(fieldId);
        }
        return isValid;
      });
      
      console.log(`- Compliance Event ${event.event}: Complete = ${hasAllDocuments}, Missing documents:`, missingDocuments);
      
      if (!hasAllDocuments) {
        console.log(`- Compliance Event ${event.event}: Missing ${missingDocuments.length} out of ${requiredDocumentFields.length} required documents`);
      } else {
        console.log(`- Compliance Event ${event.event}: All ${requiredDocumentFields.length} documents uploaded`);
      }
      
      return hasAllDocuments;
    });
    
    console.log("- STATUTORY COMPLIANCE VALIDATION RESULT:", allComplianceRecordsComplete ? "TRUE (ALL compliance records have all documents)" : "FALSE (Some compliance records have missing documents)");
    return allComplianceRecordsComplete;
  };

  // Function to validate equipment & machinery completion
  const validateEquipmentMachinery = (equipmentEvents) => {
    console.log("⚙️ === EQUIPMENT & MACHINERY VALIDATION ===");
    console.log("- Events to validate:", equipmentEvents?.length || 0);
    
    if (!equipmentEvents || equipmentEvents.length === 0) {
      console.log("- VALIDATION RESULT: FALSE (No equipment records exist)");
      return false; // No records exist
    }

    // Since equipment form uses dynamic fields from DHIS2 metadata, 
    // we validate that each record has at least some meaningful data
    const minRequiredFields = 3; // Minimum number of fields that should be filled
    
    console.log("- Minimum required fields per record:", minRequiredFields);

    // Check if ALL equipment records have sufficient data
    const allEquipmentRecordsComplete = equipmentEvents.every(event => {
      if (!event.dataValues) {
        console.log(`- Equipment Event ${event.event}: No dataValues`);
        return false;
      }
      
      // Count non-empty data values
      const filledFields = event.dataValues.filter(dv => {
        return dv.value && dv.value.trim() !== "" && dv.value !== "null" && dv.value !== "undefined";
      });
      
      const hasEnoughData = filledFields.length >= minRequiredFields;
      console.log(`- Equipment Event ${event.event}: Has enough data = ${hasEnoughData}, Filled fields count: ${filledFields.length}/${event.dataValues.length}`);
      
      if (!hasEnoughData) {
        console.log(`- Equipment Event ${event.event}: Insufficient data - only ${filledFields.length} fields filled, need at least ${minRequiredFields}`);
        console.log(`- Equipment Event ${event.event}: Filled fields:`, filledFields.map(f => `${f.dataElement}="${f.value}"`));
      } else {
        console.log(`- Equipment Event ${event.event}: Sufficient data with ${filledFields.length} filled fields`);
      }
      
      return hasEnoughData;
    });
    
    console.log("- EQUIPMENT VALIDATION RESULT:", allEquipmentRecordsComplete ? "TRUE (ALL equipment records have sufficient data)" : "FALSE (Some equipment records have insufficient data)");
    return allEquipmentRecordsComplete;
  };


  
  const hasTabData = (tabKey) => {
    switch (tabKey) {
      case 'completeApplication':
        return completeApplicationStatus; // Use the state variable to determine if all fields are filled
      case 'facilityOwnership':
        return tabValidationStates.facilityOwnership; // Use validation state that checks both record existence and field completeness
      case 'employeeRegistration':
        return tabValidationStates.employeeRegistration; // Use validation state that checks both record existence and field completeness
      case 'servicesOffered':
        return tabValidationStates.servicesOffered; // Use validation state that checks both record existence and service selection
      case 'statutoryCompliance':
        return tabValidationStates.statutoryCompliance; // Use validation state that checks both record existence and document completeness
      case 'equipmentMachinery':
        return tabValidationStates.equipmentMachinery; // Use validation state that checks both record existence and data completeness
      case 'inspectionSchedule':
        return inspectionEvents.length > 0;
      default:
        return false;
    }
  };
  
  // Helper function to check if facility ownership event has specific data value
  const hasFacilityOwnershipDataValue = (dataElementId, expectedValue = "true") => {
    if (!events || events.length === 0) {
      return false;
    }
    
    const facilityOwnershipEvents = events.filter(e => e.programStage === 'MuJubgTzJrY');
    if (facilityOwnershipEvents.length === 0) {
      return false;
    }
    
    return facilityOwnershipEvents.some(event => {
      if (!event.dataValues) return false;
      const dataValue = event.dataValues.find(dv => dv.dataElement === dataElementId);
      return dataValue && dataValue.value === expectedValue;
    });
  };

  // Constants for data element IDs to improve maintainability
  const DATA_ELEMENTS = {
    APPLICATION_SUBMITTED: "N3bVE3GRqdf",
    PASSED_MOH_SCREENING: "NMTFfpLaGAy", 
    COMPLIED_FOR_LICENSING: "SIq5ADQjCEM"
  };

  // Status configuration with better organization and color coding
  const STATUS_CONFIG = {
    COMPLETE_ADMIN_INFO: {
      text: "Complete Administrative Information Below",
      color: "#dc3545", // Red
      bgColor: "#f8d7da",
      borderColor: "#f5c6cb"
    },
    COMPLETE_FACILITY_OWNERSHIP: {
      text: "Complete Facility Ownership Details",
      color: "#dc3545", // Red
      bgColor: "#f8d7da",
      borderColor: "#f5c6cb"
    },
    SUBMIT_FOR_REVIEW: {
      text: "Under Facility Ownership Complete and submit Documents for review",
      color: "#ffc107", // Yellow
      bgColor: "#fff3cd",
      borderColor: "#ffeaa7"
    },
    UNDER_SCREENING_REVIEW: {
      text: "Documents Under Screening Review",
      color: "#17a2b8", // Blue
      bgColor: "#d1ecf1",
      borderColor: "#bee5eb"
    },
    UNDER_SCREENING_COMPLIANCE: {
      text: "Documents Under Screening Compliance",
      color: "#17a2b8", // Blue
      bgColor: "#d1ecf1",
      borderColor: "#bee5eb"
    },
    PERMISSION_GRANTED: {
      text: "You Have Permission to Establish, Complete Steps 3 to 6 with required Documents",
      color: "#28a745", // Green
      bgColor: "#d4edda",
      borderColor: "#c3e6cb"
    },
    COMPLETE_SELF_INSPECTION: {
      text: "Complete a Self Inspection",
      color: "#fd7e14", // Orange
      bgColor: "#ffe8d1",
      borderColor: "#ffd8a8"
    },
    SELECT_INSPECTION_DATE: {
      text: "Select a date for Inspection",
      color: "#6f42c1", // Purple
      bgColor: "#e2d9f3",
      borderColor: "#d1c7e5"
    }
  };



  // Enhanced status determination logic
  useEffect(() => {
    console.log("🔄 === ENHANCED STATUS LOGIC RUNNING ===");
    console.log("- completeApplicationStatus:", completeApplicationStatus);
    console.log("- tabValidationStates.facilityOwnership:", tabValidationStates.facilityOwnership);
    console.log("- events.length:", events?.length || 0);
    console.log("- events data:", events);
    
    try {
              // Step 1: Check if Admin User & Facility Details is complete
    if (!completeApplicationStatus) {
      console.log("📝 Setting status: Complete Administrative Information Below");
          setRegistrationStatus(STATUS_CONFIG.COMPLETE_ADMIN_INFO.text);
      return;
    }
    
        // Step 2: Check if Facility Ownership has data
    if (!tabValidationStates.facilityOwnership) {
      console.log("📝 Setting status: Complete Facility Ownership Details");
          setRegistrationStatus(STATUS_CONFIG.COMPLETE_FACILITY_OWNERSHIP.text);
      return;
    }
    
        // Step 3: Check if Application has been submitted
        if (!hasFacilityOwnershipDataValue(DATA_ELEMENTS.APPLICATION_SUBMITTED, "true")) {
          console.log("📝 Setting status: Submit for review");
          setRegistrationStatus(STATUS_CONFIG.SUBMIT_FOR_REVIEW.text);
      return;
    }
    
        // Step 4: Check MOH Screening status
        const passedMOH = hasFacilityOwnershipDataValue(DATA_ELEMENTS.PASSED_MOH_SCREENING, "true");
        const compliedLicensing = hasFacilityOwnershipDataValue(DATA_ELEMENTS.COMPLIED_FOR_LICENSING, "true");
        
        if (!passedMOH) {
          console.log("📝 Setting status: Under Screening Review");
          setRegistrationStatus(STATUS_CONFIG.UNDER_SCREENING_REVIEW.text);
      return;
    }
    
        if (!compliedLicensing) {
          console.log("📝 Setting status: Under Screening Compliance");
          setRegistrationStatus(STATUS_CONFIG.UNDER_SCREENING_COMPLIANCE.text);
      return;
    }
    
        // Step 5: Permission granted - check remaining steps
        if (passedMOH && compliedLicensing) {
          // Check if all required steps (3-5) are complete
          const stepsComplete = tabValidationStates.employeeRegistration && 
                               tabValidationStates.servicesOffered && 
                               tabValidationStates.statutoryCompliance && 
                               tabValidationStates.equipmentMachinery;
          
          if (!stepsComplete) {
            console.log("📝 Setting status: Permission Granted - Complete Steps 3-5");
            setRegistrationStatus(STATUS_CONFIG.PERMISSION_GRANTED.text);
      return;
    }
    
          // Step 6: Check inspection schedule
    if (!hasTabData('inspectionSchedule')) {
            console.log("📝 Setting status: Complete Self Inspection");
            setRegistrationStatus(STATUS_CONFIG.COMPLETE_SELF_INSPECTION.text);
      return;
    }
    
          // Step 7: All conditions met
          console.log("📝 Setting status: Select Inspection Date");
          setRegistrationStatus(STATUS_CONFIG.SELECT_INSPECTION_DATE.text);
          return;
        }
      
    } catch (error) {
      console.error("❌ Error in status determination:", error);
      setRegistrationStatus("Status determination error - please refresh");
    }
  }, [
    completeApplicationStatus,
    tabValidationStates,
    events,
    inspectionEvents
  ]);
  
  // Handle tab click with validation
  const handleTabClick = (tabKey) => {
    console.log("=== TAB CLICKED ===", tabKey);
    console.log("- completeApplicationStatus:", completeApplicationStatus);
    
    // If Complete Application is not complete and trying to access another tab, don't allow it
    if (!completeApplicationStatus && tabKey !== 'completeApplication') {
      console.log("- Tab click blocked - application not complete");
      return; // Don't change tabs
    }
    
    // Disable certain tabs unless application is submitted OR permission is granted
    const restrictedTabs = ['employeeRegistration', 'servicesOffered', 'statutoryCompliance', 'equipmentMachinery'];
    const hasPermissionToEstablish = hasFacilityOwnershipDataValue("NMTFfpLaGAy", "true");
    
    if (!isApplicationSubmitted && !hasPermissionToEstablish && restrictedTabs.includes(tabKey)) {
      console.log("- Tab click blocked - application not submitted for review and no permission granted");
      return;
    }
    
    console.log("- Setting active tab to:", tabKey);
    setActiveTab(tabKey);
    
    // Manually trigger fetch for equipment data when clicking on equipmentMachinery tab
    if (tabKey === 'equipmentMachinery') {
      console.log("- Manually triggering fetchEquipmentData for Equipment & Machinery tab");
      fetchEquipmentData();
    }
    
    // Manually trigger fetch for inspection data when clicking on inspectionSchedule tab
    if (tabKey === 'inspectionSchedule') {
      console.log("- Manually triggering fetchInspectionData for Situational Analysis tab");
      fetchInspectionData();
    }
    
    // Manually trigger fetch for facility ownership data when clicking on facilityOwnership tab
    if (tabKey === 'facilityOwnership') {
      console.log("🏢 === FACILITY OWNERSHIP TAB CLICKED ===");
      console.log("- Manually triggering fetchFacilityOwnershipData for Facility Ownership tab");
      console.log("- Current trackedEntityInstanceId:", trackedEntityInstanceId);
      
      // Always fetch fresh data from DHIS2 when Facility Ownership tab is clicked
      console.log("🔄 Force refreshing Facility Ownership data from DHIS2");
      fetchFacilityOwnershipData();
      
      // Directly fetch organization unit from API instead of localStorage
      const fetchOrgUnitAndTrackedEntity = async () => {
        try {
          const credentials = await StorageService.get('userCredentials');
          if (!credentials) {
            console.error('❌ No credentials found in localStorage');
            return;
          }
          
          console.log('📊 FETCHING ORGANIZATION UNIT DATA DIRECTLY');
          const orgUnitResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me?fields=organisationUnits[displayName,id]`, {
            headers: {
              'Authorization': `Basic ${credentials}`
            }
          });
          
          if (!orgUnitResponse.ok) {
            console.error('❌ Failed to fetch organization unit data:', orgUnitResponse.status);
            return;
          }
          
          const orgData = await orgUnitResponse.json();
          console.log('- Organization API Response:', orgData);
          
          if (!orgData.organisationUnits || orgData.organisationUnits.length === 0) {
            console.error('❌ No organization units found in response');
            return;
          }
          
          const orgUnitId = orgData.organisationUnits[0].id;
          const orgUnitName = orgData.organisationUnits[0].displayName;
          
          console.log('✅ ORGANIZATION UNIT DATA:');
          console.log('- Name:', orgUnitName);
          console.log('- ID:', orgUnitId);
          
          // Now fetch the trackedEntityInstanceId using this organization unit ID
          console.log('🔄 FETCHING TRACKED ENTITY INSTANCE WITH FRESH ORG UNIT ID');
          const teiUrl = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances?ou=${orgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=trackedEntityInstance&paging=false`;
          console.log('- API URL:', teiUrl);
          
          const teiResponse = await fetch(teiUrl, {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!teiResponse.ok) {
            console.error('❌ Failed to fetch tracked entity instance:', teiResponse.status);
            return;
          }
          
          const teiData = await teiResponse.json();
          console.log('- Tracked Entity API Response:', teiData);
          
          if (teiData.trackedEntityInstances && teiData.trackedEntityInstances.length > 0) {
            const teiId = teiData.trackedEntityInstances[0].trackedEntityInstance;
            console.log('✅ Found trackedEntityInstanceId:', teiId);
            
            // Store for future use
            localStorage.setItem('tempTrackedEntityInstanceId', teiId);
            
            // CRITICAL FIX: Force a refresh to use the new trackedEntityInstanceId
            // This is a workaround since we can't directly update the parent's prop
            console.log('🔄 FORCING PAGE REFRESH TO USE NEW TRACKED ENTITY INSTANCE ID');
            // window.location.reload(); // Removing this to avoid blank screen
            
            // Instead, update local state directly
            // setLocalTrackedEntityInstanceId removed
            
            // Now fetch the facility ownership data with this ID
            console.log('🔄 FETCHING FACILITY OWNERSHIP DATA WITH FRESH TEI ID');
            fetchFacilityOwnershipData(teiId, orgUnitId);
          } else {
            console.log('❌ No tracked entity instances found in response');
          }
        } catch (error) {
          console.error('❌ Error in fetchOrgUnitAndTrackedEntity:', error);
        }
      };
      
      // Execute the function
      fetchOrgUnitAndTrackedEntity();
    }
    
    // Manually trigger fetch for employee data when clicking on employeeRegistration tab
    if (tabKey === 'employeeRegistration') {
      console.log("👥 === EMPLOYEE REGISTRATION TAB CLICKED ===");
      console.log("- Manually triggering fetchEmployeeData for Employee Registration tab");
      console.log("- Current trackedEntityInstanceId:", trackedEntityInstanceId);
      fetchEmployeeData();
    }
    
    // Manually trigger fetch for services data when clicking on servicesOffered tab
    if (tabKey === 'servicesOffered') {
      console.log("🏥 === SERVICES OFFERED TAB CLICKED ===");
      console.log("- Manually triggering fetchServiceData for Services Offered tab");
      console.log("- Current trackedEntityInstanceId:", trackedEntityInstanceId);
      fetchServiceData();
    }
    
    // Manually trigger fetch for statutory compliance data when clicking on statutoryCompliance tab
    if (tabKey === 'statutoryCompliance') {
      console.log("📋 === STATUTORY COMPLIANCE TAB CLICKED ===");
      console.log("- Manually triggering fetchStatutoryComplianceData for Statutory Compliance tab");
      console.log("- Current trackedEntityInstanceId:", trackedEntityInstanceId);
      fetchStatutoryComplianceData();
    }
    
    // Manually trigger fetch for equipment data when clicking on equipmentMachinery tab
    if (tabKey === 'equipmentMachinery') {
      console.log("⚙️ === EQUIPMENT & MACHINERY TAB CLICKED ===");
      console.log("- Manually triggering fetchEquipmentData for Equipment & Machinery tab");
      console.log("- Current trackedEntityInstanceId:", trackedEntityInstanceId);
      fetchEquipmentData();
    }
  };



  const fetchFacilityOwnershipData = async (teiId, orgUnitId) => {
    console.log("🔄 === STARTING FACILITY OWNERSHIP DATA FETCH ===");
    console.log("- Timestamp:", new Date().toISOString());
    console.log("- Force refresh from DHIS2");
    
    // Use parameters if provided, otherwise use centralized function
    const effectiveTeiId = teiId || getCurrentTrackedEntityInstanceId();
    const effectiveOrgUnitId = orgUnitId || localStorage.getItem('userOrgUnitId');
    
    console.log("- Using trackedEntityInstanceId:", effectiveTeiId);
    console.log("- Using organizationUnitId:", effectiveOrgUnitId);
    
    if (!effectiveTeiId) {
      console.log("❌ No trackedEntityInstanceId provided, aborting fetch");
      setIsLoading(false);
      return;
    }
    
    const credentials = await StorageService.get('userCredentials');

    console.log("🔐 Auth & Config Check:");
    console.log("- Has credentials:", Boolean(credentials));
    console.log("- Has userOrgUnitId:", Boolean(effectiveOrgUnitId));
    console.log("- Has trackedEntityInstanceId:", Boolean(effectiveTeiId));
    console.log("- DHIS2 Base URL:", import.meta.env.VITE_DHIS2_URL);

    if (!credentials || !effectiveOrgUnitId || !effectiveTeiId) {
      console.log("❌ Missing required credentials/IDs, aborting fetch");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${effectiveTeiId}?ou=${effectiveOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]!programStage=MuJubgTzJrY&paging=false&_t=${timestamp}`;
      
      console.log("🚀 === FACILITY OWNERSHIP API REQUEST ===");
      console.log("- HTTP Method: GET");
      console.log("- Full URL:", url);
      console.log("- Cache-busting timestamp:", timestamp);
      console.log("- URL Parts:");
      console.log("  • Base:", `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/`);
      console.log("  • trackedEntityInstanceId:", effectiveTeiId);
      console.log("  • organizationUnitId (ou):", effectiveOrgUnitId);
      console.log("  • ouMode: SELECTED");
      console.log("  • programId: EE8yeLVo6cN");
      console.log("  • fields: enrollments[events]!programStage=MuJubgTzJrY");
      console.log("  • paging: false");
      console.log("  • cache-busting: _t=${timestamp}");
      console.log("- Headers:");
      console.log("  • Authorization: Basic [credentials]");
      console.log("  • Content-Type: application/json");
      console.log("  • Cache-Control: no-cache");

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 === FACILITY OWNERSHIP API RESPONSE ===");
      console.log("- Response status:", response.status);
      console.log("- Response headers:", Object.fromEntries(response.headers.entries()));
      console.log("- Response data:", data);

      console.log("📊 === FACILITY OWNERSHIP DATA PROCESSING ===");
      console.log("- Raw API Response:", data);
      console.log("- Enrollments found:", data.enrollments?.length || 0);
      
      // Process the events data
      let allEvents = [];
      if (data.enrollments && data.enrollments.length > 0) {
        data.enrollments.forEach((enrollment, index) => {
          console.log(`- Enrollment [${index}]:`, enrollment);
          if (enrollment.events && enrollment.events.length > 0) {
            console.log(`  • Events in Enrollment [${index}]:`, enrollment.events.length);
            allEvents = [...allEvents, ...enrollment.events];
          } else {
            console.log(`  • No events found in Enrollment [${index}]`);
          }
        });
      } else {
        console.log("❌ NO ENROLLMENTS FOUND");
      }
      
      console.log("- Total events processed:", allEvents.length);
      console.log("- Processed events:", allEvents);

      // Sort events by created date (newest first)
      allEvents.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      // Update state with the events data
      setEvents(allEvents);
      setIsLoading(false);
      
      // Update validation state after data is loaded
      const facilityOwnershipComplete = validateFacilityOwnership(allEvents);
      console.log("🔍 === VALIDATION RESULT ===");
      console.log("- Facility Ownership Complete:", facilityOwnershipComplete);
      
      setTabValidationStates(prev => ({
        ...prev,
        facilityOwnership: facilityOwnershipComplete
      }));
      
      // Store facility ownership status in localStorage for Header component access
      localStorage.setItem('facilityOwnershipComplete', JSON.stringify(facilityOwnershipComplete));
      
      // Dispatch event to refresh organization unit data
      const refreshOrgUnitEvent = new CustomEvent('refreshOrgUnitData');
      window.dispatchEvent(refreshOrgUnitEvent);
      
      console.log('✅ DISPATCHED refreshOrgUnitData EVENT');
      
      // Store events in localStorage for Dashboard component
      localStorage.setItem('facilityOwnershipEvents', JSON.stringify(allEvents));
      
      // Force status recalculation after data update
      console.log("🔄 Triggering status recalculation after data update");
      setTimeout(() => {
        const event = new CustomEvent('forceStatusRecalculation');
        window.dispatchEvent(event);
      }, 100);
      
    } catch (error) {
      console.error("❌ Error fetching facility ownership data:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setIsLoading(false);
      
      // Show user-friendly error message
      setRegistrationStatus("Error loading data - please refresh the page");
    }
  };

  // Check localStorage for completeApplicationStatus on component mount and when tab changes
  useEffect(() => {
    const checkCompleteApplicationStatus = () => {
      try {
        const status = localStorage.getItem('completeApplicationFormStatus');
        if (status) {
          setCompleteApplicationStatus(JSON.parse(status));
        }
      } catch (error) {
        console.error("Error reading form status from localStorage:", error);
      }
    };
    
    checkCompleteApplicationStatus();
    
    // Set up an interval to check for status changes
    const intervalId = setInterval(checkCompleteApplicationStatus, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Auto-navigate to View Inspections when both Complete Application and Facility Ownership are complete
  useEffect(() => {
    const checkAndNavigateToInspections = () => {
      try {
        const completeApplicationStatus = localStorage.getItem('completeApplicationFormStatus');
        const facilityOwnershipStatus = localStorage.getItem('facilityOwnershipComplete');
        
        const isCompleteApplicationDone = completeApplicationStatus === 'true';
        const isFacilityOwnershipDone = facilityOwnershipStatus === 'true';
        
        if (isCompleteApplicationDone && isFacilityOwnershipDone) {
          // Navigate to View Inspections tab
          const event = new CustomEvent('switchToTab', { detail: 'inspections' });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error("Error checking completion status for auto-navigation:", error);
      }
    };
    
    // Only check on component mount (login) and when facility ownership dialog closes
    checkAndNavigateToInspections();
  }, []);
  
  useEffect(() => {
    if (trackedEntityInstanceId) {
      fetchFacilityOwnershipData();
      fetchEmployeeData();
    }
  }, [trackedEntityInstanceId]);

  // Add event listener for force status recalculation
  useEffect(() => {
    const handleForceStatusRecalculation = () => {
      console.log("🔄 Force status recalculation triggered");
      // The status logic will automatically run due to the useEffect dependencies
    };

    window.addEventListener('forceStatusRecalculation', handleForceStatusRecalculation);
    
    return () => {
      window.removeEventListener('forceStatusRecalculation', handleForceStatusRecalculation);
    };
  }, []);

  // Add a new effect for fetching service data
  useEffect(() => {
    fetchServiceData();
  }, [trackedEntityInstanceId]);

  const fetchServiceData = async () => {
    console.log("🔄 === STARTING SERVICE DATA FETCH ===");
    console.log("- Timestamp:", new Date().toISOString());
    
    if (!trackedEntityInstanceId) {
      setIsLoadingServices(false);
      return;
    }

    const credentials = StorageService.get('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId) {
      setIsLoadingServices(false);
      return;
    }

    try {
      setIsLoadingServices(true);
      // Use the correct program stage ID for Services Offered
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]!programStage=uL262bA2IP3&paging=false`;
      
      console.log("Services Offered API Request:");
      console.log("- Full URL:", url);
      console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
      console.log("- organizationUnitId:", userOrgUnitId);
      console.log("- programId: EE8yeLVo6cN");
      console.log("- programStage: uL262bA2IP3");

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("Services Offered API Response:");
      console.log("- Response data:", data);
      console.log("- Has enrollments:", Boolean(data.enrollments));
      console.log("- Number of enrollments:", data.enrollments?.length || 0);
      
      let fetchedEvents = [];

      if (data.enrollments && data.enrollments.length > 0) {
        console.log("- Processing service enrollments...");
        data.enrollments.forEach((enrollment, index) => {
          console.log(`  - Service Enrollment #${index+1} ID:`, enrollment.enrollment);
          console.log(`  - Events in service enrollment #${index+1}:`, enrollment.events?.length || 0);
          if (enrollment.events && enrollment.events.length > 0) {
            console.log(`  - First service event programStage:`, enrollment.events[0].programStage);
            // Filter events to only include Services Offered program stage (uL262bA2IP3)
            const serviceOfferingEvents = enrollment.events.filter(event => event.programStage === "uL262bA2IP3");
            console.log(`  - Filtered service offering events (uL262bA2IP3):`, serviceOfferingEvents.length);
            fetchedEvents = fetchedEvents.concat(serviceOfferingEvents);
          }
        });
      }
      
      console.log("- Total service events extracted (uL262bA2IP3 only):", fetchedEvents.length);

      setServiceEvents(fetchedEvents);
      setIsLoadingServices(false);
      
      // Update services validation state after data is loaded
      setTabValidationStates(prev => ({
        ...prev,
        servicesOffered: validateServicesOffered(fetchedEvents)
      }));

    } catch (error) {
      console.error("Error fetching service data:", error);
      setIsLoadingServices(false);
    }
  };

  const handleRowClick = (event) => {
    setSelectedEvent(event);
    setShowEditDialog(true);
  };

  const handleEmployeeRowClick = (event) => {
    setSelectedEmployeeEvent(event);
    setShowEditEmployeeDialog(true);
  };

  const handleServiceRowClick = (event) => {
    setSelectedServiceEvent(event);
    setShowEditServiceDialog(true);
  };

  const handleInspectionRowClick = (event) => {
    setSelectedInspectionEvent(event);
    setShowEditInspectionDialog(true);
  };

  const handleAddEmployee = (e) => {
    console.log('Add employee button clicked');
    e.preventDefault();
    e.stopPropagation();
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    console.log('Closing employee dialog');
    setOpenEmployeeDialog(false);
  };

  const handleEmployeeAddSuccess = () => {
    console.log('Employee added successfully');
    setOpenEmployeeDialog(false);
    fetchEmployeeData();
  };

  const fetchEmployeeData = async () => {
    console.log("🔄 === STARTING EMPLOYEE DATA FETCH ===");
    console.log("- Timestamp:", new Date().toISOString());
    
    const currentTeiId = getCurrentTrackedEntityInstanceId();
    if (!currentTeiId) {
      console.log("❌ No trackedEntityInstanceId available for employee data fetch");
      setIsLoadingEmployees(false);
      return;
    }

    const credentials = StorageService.get('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId) {
      setIsLoadingEmployees(false);
      return;
    }

    try {
      setIsLoadingEmployees(true);
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${currentTeiId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]!programStage=xjhA4eEHyhw&paging=false`;
      
      // Log the endpoint and parameters for debugging
      console.log("Employee Registration API Request:");
      console.log("- Full URL:", url);
      console.log("- trackedEntityInstanceId:", currentTeiId);
      console.log("- organizationUnitId:", userOrgUnitId);
      console.log("- programId: EE8yeLVo6cN");
      console.log("- programStage: xjhA4eEHyhw");

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Log response structure for debugging
      console.log("Employee Registration API Response:");
      console.log("- Response data:", data);
      console.log("- Has enrollments:", Boolean(data.enrollments));
      console.log("- Number of enrollments:", data.enrollments?.length || 0);
      
      let fetchedEvents = [];

      if (data.enrollments && data.enrollments.length > 0) {
        console.log("- Processing employee enrollments...");
        data.enrollments.forEach((enrollment, index) => {
          console.log(`  - Employee Enrollment #${index+1} ID:`, enrollment.enrollment);
          console.log(`  - Events in employee enrollment #${index+1}:`, enrollment.events?.length || 0);
          if (enrollment.events && enrollment.events.length > 0) {
            console.log(`  - First employee event programStage:`, enrollment.events[0].programStage);
            // Filter events to only include Employee Registration program stage (xjhA4eEHyhw)
            const employeeRegistrationEvents = enrollment.events.filter(event => event.programStage === "xjhA4eEHyhw");
            console.log(`  - Filtered employee registration events (xjhA4eEHyhw):`, employeeRegistrationEvents.length);
            fetchedEvents = fetchedEvents.concat(employeeRegistrationEvents);
          }
        });
      }
      
      console.log("- Total employee events extracted (xjhA4eEHyhw only):", fetchedEvents.length);

      setEmployeeEvents(fetchedEvents);
      setIsLoadingEmployees(false);
      
      // Update employee validation state after data is loaded
      setTabValidationStates(prev => ({
        ...prev,
        employeeRegistration: validateEmployeeRegistration(fetchedEvents)
      }));

    } catch (error) {
      console.error("Error fetching employee data:", error);
      setIsLoadingEmployees(false);
    }
  };

  const fetchInspectionData = async () => {
    console.log("🔄 === STARTING INSPECTION DATA FETCH ===");
    console.log("- Timestamp:", new Date().toISOString());
    console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
    console.log("- userCredentials exists:", !!StorageService.get('userCredentials'));
    console.log("- userOrgUnitId:", localStorage.getItem('userOrgUnitId'));
    
    if (!trackedEntityInstanceId) {
      console.log("- EARLY RETURN: No trackedEntityInstanceId");
      setIsLoadingInspections(false);
      return;
    }

    const credentials = await StorageService.get('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId) {
      console.log("- EARLY RETURN: Missing credentials or userOrgUnitId");
      console.log("  - credentials:", !!credentials);
      console.log("  - userOrgUnitId:", !!userOrgUnitId);
      setIsLoadingInspections(false);
      return;
    }

    try {
      setIsLoadingInspections(true);
      // Use the correct program stage ID for Situational Analysis (Inspection)
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]&paging=false`;
      
      console.log("Situational Analysis API Request:");
      console.log("- Full URL:", url);
      console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
      console.log("- organizationUnitId:", userOrgUnitId);
      console.log("- programId: EE8yeLVo6cN");
      console.log("- programStage: Eupjm3J0dt2");

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("Situational Analysis API Response:");
      console.log("- Response data:", data);
      console.log("- Has enrollments:", Boolean(data.enrollments));
      console.log("- Number of enrollments:", data.enrollments?.length || 0);
      
      let fetchedEvents = [];

      if (data.enrollments && data.enrollments.length > 0) {
        console.log("- Processing inspection enrollments...");
        data.enrollments.forEach((enrollment, index) => {
          console.log(`  - Inspection Enrollment #${index+1} ID:`, enrollment.enrollment);
          console.log(`  - Events in inspection enrollment #${index+1}:`, enrollment.events?.length || 0);
          if (enrollment.events && enrollment.events.length > 0) {
            console.log(`  - First inspection event programStage:`, enrollment.events[0].programStage);
            // Filter events to only include Situational Analysis program stage (Eupjm3J0dt2)
            const inspectionEvents = enrollment.events.filter(event => event.programStage === "Eupjm3J0dt2");
            console.log(`  - Filtered inspection events (Eupjm3J0dt2):`, inspectionEvents.length);
            fetchedEvents = fetchedEvents.concat(inspectionEvents);
          }
        });
      }
      
      console.log("- Total inspection events extracted (Eupjm3J0dt2 only):", fetchedEvents.length);
      
      // Enhanced debugging - log the actual events
      if (fetchedEvents.length > 0) {
        console.log("- Sample inspection event:", fetchedEvents[0]);
        console.log("- All inspection events:", fetchedEvents);
      } else {
        console.log("- No inspection events found. Checking all events in enrollments:");
        if (data.enrollments && data.enrollments.length > 0) {
          data.enrollments.forEach((enrollment, index) => {
            if (enrollment.events && enrollment.events.length > 0) {
              enrollment.events.forEach((event, eventIndex) => {
                console.log(`    - Event ${eventIndex + 1} in enrollment ${index + 1}:`, {
                  event: event.event,
                  programStage: event.programStage,
                  status: event.status,
                  eventDate: event.eventDate
                });
              });
            }
          });
        }
      }

      setInspectionEvents(fetchedEvents);
      setIsLoadingInspections(false);

      // #3 Users inspection period
      console.log("#3 Users inspection period");
      if (fetchedEvents.length > 0) {
        fetchedEvents.forEach((event, idx) => {
          const facility = event.orgUnitName || event.facility || 'Unknown Facility';
          const inspector = event.inspector || (event.dataValues && event.dataValues.find(dv => dv.dataElement === 'inspector')?.value) || 'Unknown Inspector';
          const period = event.inspectionPeriod || { startDate: event.eventDate || event.dueDate, endDate: event.eventDate || event.dueDate };
          console.log(`Assignment #${idx + 1}:`);
          console.log(`  Facility: ${facility}`);
          console.log(`  Inspector: ${inspector}`);
          if (period && (period.startDate || period.endDate)) {
            console.log(`  Inspection Period: ${period.startDate || 'N/A'} to ${period.endDate || 'N/A'}`);
          } else {
            console.log('  Inspection Period: Not available');
          }
        });
      } else {
        console.log('No inspection assignments found.');
      }

    } catch (error) {
      console.error("Error fetching inspection data:", error);
      setIsLoadingInspections(false);
    }
  };

  const fetchEquipmentData = async () => {
    console.log("🔄 === STARTING EQUIPMENT DATA FETCH ===");
    console.log("- Timestamp:", new Date().toISOString());
    console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
    
    if (!trackedEntityInstanceId) {
      console.log("- EARLY RETURN: No trackedEntityInstanceId");
      setIsLoadingEquipment(false);
      return;
    }

    const credentials = await StorageService.get('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId) {
      console.log("- EARLY RETURN: Missing credentials or userOrgUnitId");
      setIsLoadingEquipment(false);
      return;
    }

    try {
      setIsLoadingEquipment(true);
      // Using the correct program stage ID for Equipment & Machinery
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]&paging=false`;
      
      console.log("Equipment API Request:");
      console.log("- Full URL:", url);
      console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
      console.log("- organizationUnitId:", userOrgUnitId);
      console.log("- programId: EE8yeLVo6cN");
      console.log("- programStage: chlbXjBiIup"); // Equipment & Machinery stage ID

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("Equipment API Response:");
      console.log("- Response data:", data);
      
      let fetchedEvents = [];

      if (data.enrollments && data.enrollments.length > 0) {
        console.log("- Processing equipment enrollments...");
        data.enrollments.forEach((enrollment, index) => {
          console.log(`  - Equipment Enrollment #${index+1} ID:`, enrollment.enrollment);
          if (enrollment.events && enrollment.events.length > 0) {
            // Filter events to only include Equipment & Machinery program stage (chlbXjBiIup)
            const equipmentEvents = enrollment.events.filter(event => event.programStage === "chlbXjBiIup");
            console.log(`  - Filtered equipment events (chlbXjBiIup):`, equipmentEvents.length);
            fetchedEvents = fetchedEvents.concat(equipmentEvents);
          }
        });
      }
      
      console.log("- Total equipment events extracted:", fetchedEvents.length);
      
      setEquipmentEvents(fetchedEvents);
      setIsLoadingEquipment(false);
      
      // Update equipment validation state after data is loaded
      setTabValidationStates(prev => ({
        ...prev,
        equipmentMachinery: validateEquipmentMachinery(fetchedEvents)
      }));

    } catch (error) {
      console.error("Error fetching equipment data:", error);
      setIsLoadingEquipment(false);
    }
  };

  // Add fetch function for service offerings
    // Add useEffect to fetch service data
  useEffect(() => {
    if (trackedEntityInstanceId) {
      fetchServiceData();
      fetchInspectionData();
      fetchStatutoryComplianceData();
    }
  }, [trackedEntityInstanceId]);
  
  // Add useEffect to check for and handle the automatic tab switching flag
  useEffect(() => {
    const checkSwitchToFacilityOwnership = () => {
      try {
        // Check for the original switch flag
        const switchFlag = localStorage.getItem('switchToFacilityOwnership');
        if (switchFlag === 'true' && completeApplicationStatus) {
          // Clear the flag first to avoid repeated triggering
          localStorage.removeItem('switchToFacilityOwnership');
          
          // Switch to the Facility Ownership tab
          setActiveTab('facilityOwnership');
          return; // Exit early if we've already switched tabs
        }
        
        // Check for the new autoSelectTab flag from TrackerEventDetails
        const autoSelectTab = localStorage.getItem('autoSelectTab');
        if (autoSelectTab) {
          // Clear the flag first to avoid repeated triggering
          localStorage.removeItem('autoSelectTab');
          
          console.log(`Auto-selecting tab: ${autoSelectTab}`);
          
          // Switch to the specified tab
          setActiveTab(autoSelectTab);
          
          // If switching to facility ownership tab, also fetch the data
          if (autoSelectTab === 'facilityOwnership') {
            console.log('Auto-fetching facility ownership data');
            fetchFacilityOwnershipData();
          }
        }
      } catch (error) {
        console.error("Error checking for tab switch flag:", error);
      }
    };
    
    // Check on component load and whenever completeApplicationStatus changes
    checkSwitchToFacilityOwnership();
    
    // Set up an interval to check for status changes
    const intervalId = setInterval(checkSwitchToFacilityOwnership, 1000);
    
    return () => clearInterval(intervalId);
  }, [completeApplicationStatus]);

  // Add event listeners for custom events from TrackerEventDetails
  useEffect(() => {
    const handleRefreshApplicationData = (event) => {
      console.log('Received refreshApplicationData event:', event.detail);
      
      // Refresh all data from localStorage and re-fetch from API
      try {
        // Clear any cached data
        setEvents([]);
        setEmployeeEvents([]);
        setServiceEvents([]);
        setInspectionEvents([]);
        setStatutoryComplianceEvents([]);
        setEquipmentEvents([]);
        
        // Re-fetch all data
        console.log('Refreshing all application data...');
        fetchFacilityOwnershipData();
        fetchEmployeeData();
        fetchServiceData();
        fetchInspectionData();
        fetchStatutoryComplianceData();
        fetchEquipmentData();
        
        // Also refresh the complete application status
        const checkCompleteApplicationStatus = () => {
          try {
            const status = localStorage.getItem('completeApplicationFormStatus');
            if (status) {
              setCompleteApplicationStatus(JSON.parse(status));
            }
          } catch (error) {
            console.error("Error reading form status from localStorage:", error);
          }
        };
        checkCompleteApplicationStatus();
        
      } catch (error) {
        console.error('Error refreshing application data:', error);
      }
    };

    const handleSwitchToTab = (event) => {
      console.log('Received switchToTab event:', event.detail);
      
      const { tab } = event.detail;
      if (tab) {
        console.log(`Switching to tab: ${tab}`);
        setActiveTab(tab);
        
        // If switching to facility ownership tab, also fetch the data
        if (tab === 'facilityOwnership') {
          console.log('Auto-fetching facility ownership data');
          fetchFacilityOwnershipData();
        }
      }
    };

    // Add event listeners
    window.addEventListener('refreshApplicationData', handleRefreshApplicationData);
    window.addEventListener('switchToTab', handleSwitchToTab);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('refreshApplicationData', handleRefreshApplicationData);
      window.removeEventListener('switchToTab', handleSwitchToTab);
    };
  }, []);

  const handleAddService = () => {
    setOpenServiceDialog(true);
  };

  const handleCloseServiceDialog = () => {
    console.log("Closing service dialog");
    setOpenServiceDialog(false);
  };

  const handleServiceAddSuccess = () => {
    console.log("Service added successfully");
    setOpenServiceDialog(false);
    fetchServiceData();
  };
  
  const handleAddInspection = () => {
    console.log("Opening inspection dialog...");
    setOpenInspectionDialog(true);
  };

  const handleCloseInspectionDialog = () => {
    console.log("Closing inspection dialog");
    setOpenInspectionDialog(false);
    // Also trigger a fetch when dialog closes, just in case
    console.log("Triggering fetchInspectionData after dialog close");
    fetchInspectionData();
  };

  const handleInspectionAddSuccess = () => {
    console.log("Inspection added successfully");
    setOpenInspectionDialog(false);
    fetchInspectionData();
  };

  // Statutory Compliance handlers
  const handleAddStatutoryCompliance = () => {
    console.log("Opening statutory compliance dialog...");
    setOpenStatutoryComplianceDialog(true);
  };

  const handleCloseStatutoryComplianceDialog = () => {
    console.log("Closing statutory compliance dialog");
    setOpenStatutoryComplianceDialog(false);
  };

  const handleStatutoryComplianceAddSuccess = () => {
    console.log("Statutory compliance record added successfully");
    setOpenStatutoryComplianceDialog(false);
    fetchStatutoryComplianceData();
  };

  const handleStatutoryComplianceRowClick = (event) => {
    setSelectedStatutoryComplianceEvent(event);
    setShowEditStatutoryComplianceDialog(true);
  };

  // Equipment & Machinery handlers
  const handleAddEquipment = () => {
    console.log("Equipment add button clicked");
    setOpenEquipmentDialog(true);
  };

  const handleCloseEquipmentDialog = () => {
    setOpenEquipmentDialog(false);
  };

  const handleEquipmentAddSuccess = () => {
    setOpenEquipmentDialog(false);
    fetchEquipmentData();
  };

  const handleEquipmentRowClick = (event) => {
    setSelectedEquipmentEvent(event);
    setShowEditEquipmentDialog(true);
  };



  // Fetch statutory compliance data
  const fetchStatutoryComplianceData = async () => {
    console.log("🔄 === STARTING STATUTORY COMPLIANCE DATA FETCH ===");
    console.log("- Timestamp:", new Date().toISOString());
    
    if (!trackedEntityInstanceId) {
      setIsLoadingStatutoryCompliance(false);
      return;
    }

    const credentials = await StorageService.get('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId) {
      setIsLoadingStatutoryCompliance(false);
      return;
    }

    try {
      setIsLoadingStatutoryCompliance(true);
      // Fetch all events and filter by program stage in JavaScript
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]&paging=false`;
      
      console.log("Statutory Compliance API Request:");
      console.log("- Full URL:", url);
      console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
      console.log("- organizationUnitId:", userOrgUnitId);
      console.log("- programId: EE8yeLVo6cN");
      console.log("- programStage: vyv7zncjCmV");

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("Statutory Compliance API Response:");
      console.log("- Response data:", data);
      console.log("- Has enrollments:", Boolean(data.enrollments));
      console.log("- Number of enrollments:", data.enrollments?.length || 0);
      
      let fetchedEvents = [];

      if (data.enrollments && data.enrollments.length > 0) {
        console.log("- Processing statutory compliance enrollments...");
        data.enrollments.forEach((enrollment, index) => {
          console.log(`  - Statutory Compliance Enrollment #${index+1} ID:`, enrollment.enrollment);
          console.log(`  - Events in statutory compliance enrollment #${index+1}:`, enrollment.events?.length || 0);
          if (enrollment.events && enrollment.events.length > 0) {
            console.log(`  - First statutory compliance event programStage:`, enrollment.events[0].programStage);
            // Filter events to only include Statutory Compliance program stage (vyv7zncjCmV)
            const complianceEvents = enrollment.events.filter(event => event.programStage === "vyv7zncjCmV");
            console.log(`  - Filtered statutory compliance events (vyv7zncjCmV):`, complianceEvents.length);
            fetchedEvents = fetchedEvents.concat(complianceEvents);
          }
        });
      }
      
      console.log("- Total statutory compliance events extracted (vyv7zncjCmV only):", fetchedEvents.length);

      setStatutoryComplianceEvents(fetchedEvents);
      setIsLoadingStatutoryCompliance(false);
      
      // Update statutory compliance validation state after data is loaded
      setTabValidationStates(prev => ({
        ...prev,
        statutoryCompliance: validateStatutoryCompliance(fetchedEvents)
      }));

    } catch (error) {
      console.error("Error fetching statutory compliance data:", error);
      setIsLoadingStatutoryCompliance(false);
    }
  };

  // Add state for facility ownership metadata
  const [facilityOwnershipMetadata, setFacilityOwnershipMetadata] = useState(null);

  // Fetch facility ownership program stage metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Get credentials using the helper with fallbacks
        const credentials = await getCredentials();
        
        if (!credentials) {
          console.error('❌ No credentials available for fetching metadata');
          setFacilityOwnershipMetadata(null);
          return;
        }
        
        console.log("🔐 Credentials available for metadata fetch:", !!credentials);
        
        const response = await fetch(
          `${import.meta.env.VITE_DHIS2_URL}/api/programStages/MuJubgTzJrY?fields=name,programStageSections[name,id,dataElements[displayFormName,id,valueType,compulsory]]`,
          {
            headers: { Authorization: `Basic ${credentials}` },
          }
        );

        if (!response.ok) {
          console.error('❌ Failed to fetch metadata:', response.status);
          throw new Error('Failed to fetch metadata');
        }
        
        const metadata = await response.json();
        setFacilityOwnershipMetadata(metadata);
      } catch (error) {
        console.error('❌ Error fetching metadata:', error);
        setFacilityOwnershipMetadata(null);
      }
    };
    fetchMetadata();
  }, []);

  // Add state for user info
  const [userInfo, setUserInfo] = useState({ id: '', organisationUnits: [] });

  // Fetch user info when Facility Ownership tab is active
  useEffect(() => {
    if (activeTab === 'facilityOwnership') {
      // Get credentials using the helper with fallbacks
      getCredentials().then(credentials => {
        if (credentials) {
          console.log('🔐 Fetching user info with credentials');
          fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me?fields=id,organisationUnits[id,displayName]`, {
            headers: { 'Authorization': `Basic ${credentials}` }
          })
            .then(res => {
              if (!res.ok) {
                console.error('❌ Failed to fetch user info:', res.status);
                throw new Error('Failed to fetch user info');
              }
              return res.json();
            })
            .then(data => setUserInfo({
              id: data.id,
              organisationUnits: data.organisationUnits || []
            }))
            .catch((error) => {
              console.error('❌ Error fetching user info:', error);
              setUserInfo({ id: 'Error', organisationUnits: [] });
            });
        } else {
          console.error('❌ No credentials available for fetching user info');
        }
      });
    }
  }, [activeTab]);

  // Add state for trackedEntityInstanceId fetched from API
  const [facilityOwnershipTeiId, setFacilityOwnershipTeiId] = useState(null);

  // Fetch trackedEntityInstanceId when Facility Ownership tab loads
  useEffect(() => {
    if (activeTab === 'facilityOwnership') {
      // Get credentials using the helper with fallbacks
      getCredentials().then(credentials => {
        if (credentials) {
          console.log('🔐 Fetching tracked entity instances with credentials');
          fetch(`${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances.json?ou=WP8ZE42FJCZ&program=EE8yeLVo6cN&fields=trackedEntityInstance`, {
            headers: { 'Authorization': `Basic ${credentials}` }
          })
            .then(res => {
              if (!res.ok) {
                console.error('❌ Failed to fetch tracked entity instances:', res.status);
                throw new Error('Failed to fetch tracked entity instances');
              }
              return res.json();
            })
            .then(data => {
              if (data.trackedEntityInstances && data.trackedEntityInstances.length > 0) {
                setFacilityOwnershipTeiId(data.trackedEntityInstances[0].trackedEntityInstance);
              } else {
                setFacilityOwnershipTeiId(null);
              }
            })
            .catch((error) => {
              console.error('❌ Error fetching tracked entity instances:', error);
              setFacilityOwnershipTeiId(null);
            });
        } else {
          console.error('❌ No credentials available for fetching tracked entity instances');
        }
      });
    }
  }, [activeTab]);

  // Prepare variables used globally in component and dialogs
  const effectiveTrackedEntityInstanceId = facilityOwnershipTeiId || trackedEntityInstanceId;
  const facilityOwnershipEvents = Array.isArray(events) ? events.filter(e => e.programStage === 'MuJubgTzJrY') : [];
  const facilityOwnershipEvent = facilityOwnershipEvents.length > 0 ? facilityOwnershipEvents[0] : undefined;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'completeApplication':
        return (
          <div className="tab-content">
            <div className="complete-application-details">
              {/* <h2>Admin User & Facility Details</h2> */}
              <TrackerEventDetails 
                onFormStatusChange={handleFormStatusChange}
                onUpdateSuccess={handleApplicationUpdateSuccess}
                onEventDataFetched={(eventData) => {
                  console.log('Event data fetched in Admin User & Facility Details:', eventData);
                  // Store the event data for use in other tabs
                  setCompleteApplicationEvent(eventData);
                }}
              />
            </div>
          </div>
        );
      case 'facilityOwnership':

        
        // Inside the Facility Ownership tab render logic, before any use of 'events':
        
        return (
          <div className="tab-content">
            <div className="facility-ownership-details">
              <h2 
                style={{
                  ...(facilityOwnershipEvents.length === 0 && {
                    animation: 'blink 1.5s infinite',
                    color: '#dc3545',
                    fontWeight: 'bold'
                  })
                }}
              >
                Facility Ownership
                <button 
                  className="add-icon" 
                  onClick={() => {
                    if (facilityOwnershipEvents.length === 0) setOpenAddDialog(true);
                  }}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    color: facilityOwnershipEvents.length === 0 ? '#dc3545' : '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 5px'
                  }}
                >
                  +
                </button>
              </h2>

              {/* Add global keyframes for blinking */}
              <style>
                {`
                  @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                  }
                `}
              </style>
              
              {isLoading ? (
                <p>Loading facility ownership data...</p>
              ) : facilityOwnershipEvents.length > 0 ? (
                <div
                  style={{
                    background: '#e2f0ff',
                    borderRadius: '8px',
                    padding: '24px',
                    margin: '24px 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    maxWidth: '340px',
                    minWidth: '220px',
                    fontSize: '0.98rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onClick={() => setOpenAddDialog(true)}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'}
                  title="Click to add or edit Facility Ownership event"
                >
                  <h3 style={{marginBottom: '12px', fontSize: '1.08rem'}}>Compliance Section (Read Only)</h3>
                  {facilityOwnershipMetadata && facilityOwnershipMetadata.programStageSections
                    ? facilityOwnershipMetadata.programStageSections.filter(section =>
                        section.name && section.name.toLowerCase().includes('compliance')
                      ).map(section => (
                        <div key={section.id} style={{marginBottom: '18px'}}>
                          <h4 style={{fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px'}}>{section.name}</h4>
                          {section.dataElements.map(de => {
                            const value = (facilityOwnershipEvents[0].dataValues || []).find(dv => dv.dataElement === de.id)?.value;
                            return (
                              <div key={de.id} style={{marginBottom: '10px'}}>
                                <strong>{de.displayFormName}:</strong> {value || <span style={{color:'#888', fontStyle:'italic'}}>Not provided</span>}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    : <p>Loading compliance section metadata...</p>}
                </div>
              ) : showReviewDialog && facilityOwnershipEvents.length === 0 ? (
                <div>
                  <div style={{ padding: '20px', backgroundColor: '#f8d7da', borderRadius: '5px', marginBottom: '20px' }}>
                    <h4 style={{ color: '#721c24', marginTop: 0 }}>Reloading Facility Ownership Data</h4>
                    <p style={{ color: '#721c24' }}>
                      We're refreshing your facility ownership information. Please wait a moment.
                    </p>
                    <button 
                      onClick={() => {
                        // Force a full data reload
                        fetchFacilityOwnershipData();
                        // Ensure we're on the correct tab
                        setActiveTab('facilityOwnership');
                      }} 
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      Retry Loading
                    </button>
                  </div>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                    Debug: isLoading={isLoading.toString()}, 
                    events.length={facilityOwnershipEvents.length}, 
                    trackedEntityInstanceId={trackedEntityInstanceId || 'null'}
                  </p>
                </div>
              ) : showReviewDialog && facilityOwnershipEvents.length === 0 ? (
                <p className="error-message">Error loading data. Please try again or contact support.</p>
              ) : facilityOwnershipEvents.length === 0 ? (
                <div>
                  <p>No facility ownership records found.</p>

                </div>
              ) : null}

            </div>
          </div>
        );
      case 'employeeRegistration':
        return (
          <div className="tab-content">
            <div className="employee-registration-details">
              <h2>
                Employee Registration Details 
                <button 
                  className="add-icon" 
                  onClick={handleAddEmployee}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 5px'
                  }}
                >
                  +
                </button>
              </h2>
              {isLoadingEmployees ? (
                <p>Loading employee data...</p>
              ) : employeeEvents.length === 0 ? (
                <p>No employee records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>BHPC/NMC Number</th>
                        <th>Position</th>
                        <th>Contract Type</th>
                        <th>Organization Unit</th>
                        <th>Program Stage ID</th>
                        <th>Event ID</th>
                        <th>Tracked Entity Instance ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeEvents.map((event, index) => {
                        const dataValues = event.dataValues || [];
                        const getFormattedValue = (dataElementId) => {
                          const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                          return dataValue ? dataValue.value : '';
                        };

                        return (
                          <tr 
                            key={event.event || index}
                            onClick={() => handleEmployeeRowClick(event)}
                            style={{ cursor: 'pointer' }}
                            className="hover-row"
                          >
                            <td>{getFormattedValue("IIxbad41cH6")}</td>
                            <td>{getFormattedValue("VFTRgPnvSHV")}</td>
                            <td>{getFormattedValue("xcTxmEUy6g6")}</td>
                            <td>{getFormattedValue("FClCncccLzw")}</td>
                            <td>{getFormattedValue("F3h1A96t3uL")}</td>
                            <td>{localStorage.getItem('userOrgUnitName')}</td>
                            <td>{event.programStage}</td>
                            <td>{event.event}</td>
                            <td>{event.trackedEntityInstance}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case 'servicesOffered':
        return (
          <div className="tab-content">
            <div className="services-offered-details">
              <h2>
                Services Offered Details 
                <button 
                  className="add-icon" 
                  onClick={handleAddService}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 5px'
                  }}
                >
                  +
                </button>
              </h2>
              {isLoadingServices ? (
                <p>Loading services data...</p>
              ) : serviceEvents.length === 0 ? (
                <p>No service offering records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Core Services</th>
                        <th>Specialised Services</th>
                        <th>Support Services</th>
                        <th>Additional Services</th>
                        <th>Program Stage ID</th>
                        <th>Event ID</th>
                        <th>Tracked Entity Instance ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceEvents.map((event, index) => {
                        const dataValues = event.dataValues || [];
                        const getFormattedValue = (dataElementId) => {
                          const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                          return dataValue ? dataValue.value : '';
                        };

                        // Helper function to check if service type is offered
                        const isServiceOffered = (dataElementId) => {
                          return getFormattedValue(dataElementId) === 'true';
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
                            onClick={() => handleServiceRowClick(event)}
                            style={{ cursor: 'pointer' }}
                            className="hover-row"
                          >
                            <td>{getFormattedValue("IR8eO63QKKe")}</td>
                            <td>{getFormattedValue("pRPw37nqZQ3")}</td>
                            <td>{coreServices || "None"}</td>
                            <td>{specialisedServices || "None"}</td>
                            <td>{supportServices || "None"}</td>
                            <td>{additionalServices || "None"}</td>
                            <td>{event.programStage}</td>
                            <td>{event.event}</td>
                            <td>{event.trackedEntityInstance}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case 'equipmentMachinery':
        return (
          <div className="tab-content">
            <div className="equipment-machinery-details">
              <h2>
                Equipment & Machinery 
                <button 
                  className="add-icon" 
                  onClick={handleAddEquipment}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 5px'
                  }}
                >
                  +
                </button>
              </h2>
              {isLoadingEquipment ? (
                <p>Loading equipment data...</p>
              ) : equipmentEvents.length === 0 ? (
                <p>No equipment records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Emergency Equipment</th>
                        <th>General Practice</th>
                        <th>Laboratory Services</th>
                        <th>Radiology</th>
                        <th>Pharmacy</th>
                        <th>Compliance Status</th>
                        <th>Program Stage ID</th>
                        <th>Event ID</th>
                        <th>Tracked Entity Instance ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentEvents.map((event, index) => {
                        const dataValues = event.dataValues || [];
                        const getFormattedValue = (dataElementId) => {
                          const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                          return dataValue ? dataValue.value : 'N/A';
                        };

                        // Helper function to format boolean values
                        const formatBoolean = (value) => {
                          if (value === 'true') return 'Yes';
                          if (value === 'false') return 'No';
                          return 'N/A';
                        };

                        // Aggregate emergency equipment
                        const emergencyEquipment = [
                          getFormattedValue("Ldkhcngpzm0") === 'true' ? "Defibrillator" : "",
                          getFormattedValue("Dpzjb4f4zie") === 'true' ? "Ambulance" : "",
                          getFormattedValue("iBa0EKW8Rs4") === 'true' ? "Oxygen Supply" : "",
                          getFormattedValue("BBk59Ex46rC") === 'true' ? "Resuscitation Beds" : "",
                        ].filter(Boolean).join(", ");

                        // Aggregate general practice equipment
                        const generalPracticeEquipment = [
                          getFormattedValue("mBr9e3ecOze") === 'true' ? "BP Machines" : "",
                          getFormattedValue("ftukRsNTA80") === 'true' ? "Examination Beds" : "",
                          getFormattedValue("yA7QpYbNo7s") === 'true' ? "Thermometers" : "",
                        ].filter(Boolean).join(", ");

                        // Aggregate laboratory equipment
                        const labEquipment = [
                          getFormattedValue("K2Wj7GjneQq") === 'true' ? "Analyzers" : "",
                          getFormattedValue("RzTeaeV0dKS") === 'true' ? "Centrifuge" : "",
                          getFormattedValue("tlh2pkI5qro") === 'true' ? "Fridges" : "",
                          getFormattedValue("H5zk9T4UZgr") === 'true' ? "Microscopes" : "",
                        ].filter(Boolean).join(", ");

                        // Aggregate radiology equipment
                        const radiologyEquipment = [
                          getFormattedValue("nh6jg8mhDpC") === 'true' ? "CT Scanner" : "",
                          getFormattedValue("BDdXSCIVk5J") === 'true' ? "MRI" : "",
                          getFormattedValue("SuvRvDmUtN6") === 'true' ? "PACS Systems" : "",
                          getFormattedValue("OR7j7sVr19a") === 'true' ? "X-Ray" : "",
                        ].filter(Boolean).join(", ");

                        // Aggregate pharmacy equipment
                        const pharmacyEquipment = [
                          getFormattedValue("bDw85eij2QA") === 'true' ? "Dispensing Counters" : "",
                          getFormattedValue("VCWdWq5cnqo") === 'true' ? "Inventory Software" : "",
                        ].filter(Boolean).join(", ");

                        return (
                          <tr 
                            key={event.event || index}
                            onClick={() => handleEquipmentRowClick(event)}
                            style={{ cursor: 'pointer' }}
                            className="hover-row"
                          >
                            <td>{emergencyEquipment || "None"}</td>
                            <td>{generalPracticeEquipment || "None"}</td>
                            <td>{labEquipment || "None"}</td>
                            <td>{radiologyEquipment || "None"}</td>
                            <td>{pharmacyEquipment || "None"}</td>
                            <td>{formatBoolean(getFormattedValue("SIq5ADQjCEM"))}</td>
                            <td>{event.programStage || 'N/A'}</td>
                            <td>{event.event || 'N/A'}</td>
                            <td>{event.trackedEntityInstance || 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case 'inspectionSchedule':
        return (
          <div className="tab-content">
            <div className="inspection-schedule-details">
              <h2>
                Situational Analysis 
                <button 
                  className="add-icon" 
                  onClick={handleAddInspection}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 5px'
                  }}
                >
                  +
                </button>
              </h2>
              {isLoadingInspections ? (
                <p>Loading inspection data...</p>
              ) : inspectionEvents.length === 0 ? (
                <div>
                  <p>No inspection records found.</p>
                  <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                    Debug: isLoadingInspections={isLoadingInspections.toString()}, 
                    inspectionEvents.length={inspectionEvents.length}, 
                    trackedEntityInstanceId={trackedEntityInstanceId || 'null'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date and Time</th>
                        <th>Inspection Code</th>
                        <th>Inspector</th>
                        <th>Type</th>
                        <th>Organization Structure</th>
                        <th>Patient Policies</th>
                        <th>Facility Environment</th>
                        <th>Program Stage ID</th>
                        <th>Event ID</th>
                        <th>Tracked Entity Instance ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectionEvents.map((event, index) => {
                        const dataValues = event.dataValues || [];
                        const getFormattedValue = (dataElementId) => {
                          const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                          return dataValue ? dataValue.value : 'N/A';
                        };

                        // Helper function to format date
                        const formatDate = (dateString) => {
                          if (!dateString) return 'N/A';
                          try {
                            return new Date(dateString).toLocaleDateString();
                          } catch {
                            return dateString;
                          }
                        };

                        // Helper function to format boolean values
                        const formatBoolean = (value) => {
                          if (value === 'true') return 'Yes';
                          if (value === 'false') return 'No';
                          return 'N/A';
                        };

                        // Aggregate policy compliance
                        const patientPolicies = [
                          getFormattedValue("pCxcolinfQ0"), // hasPoliciesForPatientAssessment
                          getFormattedValue("D6yET9Rm3Ql"), // hasPoliciesForPatientReferral
                          getFormattedValue("qxWs7aK3qGZ")  // hasPoliciesForPatientConsent
                        ];
                        const policiesCompliant = patientPolicies.filter(p => p === 'true').length;
                        const policiesStatus = policiesCompliant === 3 ? 'All Compliant' : 
                                             policiesCompliant > 0 ? `${policiesCompliant}/3 Compliant` : 'Not Compliant';

                        // Aggregate facility environment
                        const facilityChecks = [
                          getFormattedValue("wjLqyKpPclD"), // hasWheelchairAccessibility
                          getFormattedValue("uiwrRhfPUX9"), // isFencedAndSecure
                          getFormattedValue("bWVuvn0rN0W"), // hasAdequateParking
                          getFormattedValue("mE0keb9FteW"), // isCleanAndNeat
                          getFormattedValue("K3me4A3CyVO")  // hasAdequateLighting
                        ];
                        const facilityCompliant = facilityChecks.filter(f => f === 'true').length;
                        const facilityStatus = facilityCompliant >= 4 ? 'Compliant' : 
                                             facilityCompliant >= 2 ? 'Partial' : 'Non-Compliant';

                                                 return (
                           <tr 
                             key={event.event || index}
                             onClick={() => handleInspectionRowClick(event)}
                             style={{ cursor: 'pointer' }}
                             className="hover-row"
                           >
                             <td>{formatDate(getFormattedValue("e4MmMJ3zrhK"))}</td>
                             <td>{getFormattedValue("wS6bfV1hrU0")}</td>
                             <td>{getFormattedValue("VOjM6ArpORU")}</td>
                             <td>{getFormattedValue("Pl4RdRtKErd")}</td>
                             <td>{formatBoolean(getFormattedValue("WCys8b95Qrw"))}</td>
                             <td>{policiesStatus}</td>
                             <td>{facilityStatus}</td>
                             <td>{event.programStage || 'N/A'}</td>
                             <td>{event.event || 'N/A'}</td>
                             <td>{event.trackedEntityInstance || 'N/A'}</td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case 'statutoryCompliance':
        return (
          <div className="tab-content">
            <div className="statutory-compliance-details">
              <h2>
                Statutory Compliance Details 
                <button 
                  className="add-icon" 
                  onClick={handleAddStatutoryCompliance}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 5px'
                  }}
                >
                  +
                </button>
              </h2>
              {isLoadingStatutoryCompliance ? (
                <p>Loading statutory compliance data...</p>
              ) : statutoryComplianceEvents.length === 0 ? (
                <p>No statutory compliance records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Application Type</th>
                        <th>Facility Name</th>
                        <th>License Holder</th>
                        <th>Payment Number</th>
                        <th>Phone Number</th>
                        <th>Registration Status</th>
                        <th>Program Stage ID</th>
                        <th>Event ID</th>
                        <th>Tracked Entity Instance ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statutoryComplianceEvents.map((event, index) => {
                        const dataValues = event.dataValues || [];
                        const getFormattedValue = (dataElementId) => {
                          const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                          return dataValue ? dataValue.value : 'N/A';
                        };

                        // Helper function to format boolean values
                        const formatBoolean = (value) => {
                          if (value === 'true') return 'Yes';
                          if (value === 'false') return 'No';
                          return 'N/A';
                        };

                        // Build license holder name
                        const firstName = getFormattedValue("HMk4LZ9ESOq");
                        const surname = getFormattedValue("ykwhsQQPVH0");
                        const licenseHolderName = `${firstName} ${surname}`.trim() || 'N/A';

                        return (
                          <tr 
                            key={event.event || index}
                            onClick={() => handleStatutoryComplianceRowClick(event)}
                            style={{ cursor: 'pointer' }}
                            className="hover-row"
                          >
                            <td>{getFormattedValue("JSwAq5HRQa8")}</td>
                            <td>{getFormattedValue("D707dj4Rpjz")}</td>
                            <td>{licenseHolderName}</td>
                            <td>{getFormattedValue("LAHlCWh18bP")}</td>
                            <td>{getFormattedValue("SReqZgQk0RY")}</td>
                            <td>{formatBoolean(getFormattedValue("jV5Y8XOfkgb"))}</td>
                            <td>{event.programStage || 'N/A'}</td>
                            <td>{event.event || 'N/A'}</td>
                            <td>{event.trackedEntityInstance || 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Helper to determine if a tab should be disabled
  const isTabDisabled = (tabKey) => {
    const restrictedTabs = ['employeeRegistration', 'servicesOffered', 'statutoryCompliance', 'equipmentMachinery'];
    
    // Check if permission to establish is granted
    const hasPermissionToEstablish = hasFacilityOwnershipDataValue("NMTFfpLaGAy", "true");
    
    // If permission is granted, tabs 3-6 should not be disabled
    if (hasPermissionToEstablish && restrictedTabs.includes(tabKey)) {
      return false;
    }
    
    // Otherwise, apply the original logic
    if (restrictedTabs.includes(tabKey) && !isApplicationSubmitted) return true;
    return false;
  };

  // Calculate overall progress percentage
  const calculateProgress = () => {
    const totalSteps = 7;
    let completedSteps = 0;
    
    if (completeApplicationStatus) completedSteps++;
    if (tabValidationStates.facilityOwnership) completedSteps++;
    if (tabValidationStates.employeeRegistration) completedSteps++;
    if (tabValidationStates.servicesOffered) completedSteps++;
    if (tabValidationStates.statutoryCompliance) completedSteps++;
    if (tabValidationStates.equipmentMachinery) completedSteps++;
    if (hasTabData('inspectionSchedule')) completedSteps++;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Get next action required
  const getNextAction = () => {
    if (!completeApplicationStatus) {
      return "Complete the Admin User & Facility Details form";
    }
    if (!tabValidationStates.facilityOwnership) {
      return "Complete Facility Ownership information";
    }
    if (!hasFacilityOwnershipDataValue(DATA_ELEMENTS.APPLICATION_SUBMITTED, "true")) {
      return "Submit application for review";
    }
    if (!hasFacilityOwnershipDataValue(DATA_ELEMENTS.PASSED_MOH_SCREENING, "true")) {
      return "Wait for MOH screening review";
    }
    if (!hasFacilityOwnershipDataValue(DATA_ELEMENTS.COMPLIED_FOR_LICENSING, "true")) {
      return "Wait for licensing compliance review";
    }
    if (!tabValidationStates.employeeRegistration || !tabValidationStates.servicesOffered || 
        !tabValidationStates.statutoryCompliance || !tabValidationStates.equipmentMachinery) {
      return "Complete remaining registration steps (3-6)";
    }
    if (!hasTabData('inspectionSchedule')) {
      return "Complete self-inspection";
    }
    return "Select inspection date";
  };

  // Add a special effect to check for trackedEntityInstanceId in localStorage
  // This is a workaround for when the parent component's prop doesn't update
  // Note: localTrackedEntityInstanceId removed as it's no longer needed
  
  useEffect(() => {
    // Check if we have a trackedEntityInstanceId in localStorage
    const tempId = localStorage.getItem('tempTrackedEntityInstanceId');
    if (tempId && !trackedEntityInstanceId) {
      console.log("🔍 Using trackedEntityInstanceId from localStorage:", tempId);
      // setLocalTrackedEntityInstanceId removed
      
      // Also fetch facility ownership data with this ID
      const userOrgUnitId = localStorage.getItem('userOrgUnitId');
      if (userOrgUnitId) {
        console.log("🔄 Fetching facility ownership data with localStorage ID");
        fetchFacilityOwnershipData(tempId, userOrgUnitId);
      }
    } else {
      // If parent prop is available, use that instead
      // setLocalTrackedEntityInstanceId removed
    }
  }, [trackedEntityInstanceId]);
  
  // Check localStorage for completeApplicationStatus on component mount and when tab changes
  useEffect(() => {
    const checkCompleteApplicationStatus = () => {
      try {
        const status = localStorage.getItem('completeApplicationFormStatus');
        if (status) {
          setCompleteApplicationStatus(JSON.parse(status));
        }
      } catch (error) {
        console.error("Error reading form status from localStorage:", error);
      }
    };
    
    checkCompleteApplicationStatus();
    
    // Set up an interval to check for status changes
    const intervalId = setInterval(checkCompleteApplicationStatus, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activeTab === 'facilityOwnership' && events.length === 0) {
      setOpenAddDialog(true);
    }
  }, [activeTab, events.length]);

  // Automatic retry mechanism for facility ownership data
  useEffect(() => {
    const autoRetryFacilityOwnershipData = () => {
      // Only attempt retry if we're on the facility ownership tab and have no events
      if (activeTab === 'facilityOwnership' && events.length === 0 && !isLoading) {
        console.log('🔄 Automatically retrying facility ownership data fetch');
        fetchFacilityOwnershipData();
      }
    };

    // Try retry after a short delay
    const retryTimeout = setTimeout(autoRetryFacilityOwnershipData, 2000);

    return () => clearTimeout(retryTimeout);
  }, [activeTab, events.length, isLoading]);

  // Log events.length for debugging
  useEffect(() => {
    console.log('🔍 FACILITY OWNERSHIP EVENTS CHECK');
    console.log('- events.length:', events.length);
    console.log('- Should blink:', events.length === 0);
  }, [events.length]);

  // Log events details whenever events change
  useEffect(() => {
    console.group('🏥 FACILITY OWNERSHIP EVENTS DETAILS');
    console.log('Current Events:', events);
    console.log('Events Length:', events.length);
    
    // Additional detailed logging
    if (events.length > 0) {
      console.log('First Event Details:', events[0]);
      console.log('Event IDs:', events.map(event => event.event));
      console.log('Event Program Stages:', events.map(event => event.programStage));
    }
    
    console.groupEnd();
  }, [events]);

  useEffect(() => {
    console.log('[Debug Information]', {
      'trackedEntityInstanceId (prop)': trackedEntityInstanceId || 'null',
              // 'localTrackedEntityInstanceId removed
      // 'effectiveTrackedEntityInstanceId': effectiveTrackedEntityInstanceId || 'null', // Removed to fix ReferenceError
      'events.length': events.length,
      'isLoading': isLoading,
      'showReviewDialog': showReviewDialog,
      'localStorage TEI': localStorage.getItem('tempTrackedEntityInstanceId') || 'null',
    });
  }, [trackedEntityInstanceId, events.length, isLoading, showReviewDialog]); // Removed localTrackedEntityInstanceId and effectiveTrackedEntityInstanceId from dependencies

  return (
    <div className="registration-details-container">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 0, mr: 2, fontWeight: 'bold' }}>
              Registration Details
            </Typography>
            {(() => {
              // Find the status configuration based on current status text
              const currentStatusConfig = Object.values(STATUS_CONFIG).find(
                config => config.text === registrationStatus
              ) || STATUS_CONFIG.COMPLETE_ADMIN_INFO;
              
              return (
                <span 
                  className="status-indicator" 
                  style={{ 
                    backgroundColor: currentStatusConfig.bgColor,
                    color: currentStatusConfig.color,
                    border: `2px solid ${currentStatusConfig.borderColor}`,
                    padding: '10px 20px', 
                    borderRadius: '25px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              display: 'inline-block',
                    marginLeft: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📋 Status: {registrationStatus}
            </span>
              );
            })()}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            {/* Progress indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Progress: {calculateProgress()}%
              </Typography>
              <Box sx={{ 
                width: 100, 
                height: 8, 
                backgroundColor: '#e0e0e0', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  width: `${calculateProgress()}%`, 
                  height: '100%', 
                  backgroundColor: '#28a745',
                  transition: 'width 0.5s ease'
                }} />
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Next Action Card */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#495057' }}>
            🎯 Next Action Required:
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d' }}>
            {getNextAction()}
          </Typography>
        </Box>
        

        
        <StepContainer style={{ 
          justifyContent: hasFacilityOwnershipDataValue("NMTFfpLaGAy", "true") ? 'space-between' : 'flex-start' 
        }}>
          {(() => {
            const allSteps = [
              { number: 1, title: 'Admin User & Facility Details', key: 'completeApplication' },
              { number: 2, title: 'Facility Ownership', key: 'facilityOwnership' },
              { number: 3, title: 'Employee Registration', key: 'employeeRegistration' },
              { number: 4, title: 'Services Offered', key: 'servicesOffered' },
              { number: 5, title: 'Statutory Compliance', key: 'statutoryCompliance' },
              { number: 6, title: 'Equipment & Machinery', key: 'equipmentMachinery' },
              { number: 7, title: 'Inspection Schedule', key: 'inspectionSchedule' }
            ];
            
            // Check if "Passed MOH Screening" is true (status shows permission message)
            const hasPermissionToEstablish = hasFacilityOwnershipDataValue("NMTFfpLaGAy", "true");
            
            // Filter steps based on permission
            const visibleSteps = hasPermissionToEstablish 
              ? allSteps 
              : allSteps.slice(0, 2); // Only show first 2 steps if no permission
            
                        return visibleSteps.map((step, index) => {
              // Determine if the tab should be disabled
              const isDisabled = !completeApplicationStatus && step.key !== 'completeApplication';
              
              // Center the Facility Ownership tab when only 2 tabs are visible
              const shouldCenter = !hasPermissionToEstablish && step.key === 'facilityOwnership';
              
              // Make tabs 3-6 active and clickable when all tabs (3-7) are visible
              const isTab3To6 = step.number >= 3 && step.number <= 6;
              const shouldBeActive = hasPermissionToEstablish && isTab3To6;
              const shouldBeClickable = hasPermissionToEstablish && isTab3To6;
              
              // Override disabled state for tabs 3-6 when permission is granted
              const finalDisabled = shouldBeClickable ? false : (isDisabled || step.key === 'inspectionSchedule' || isTabDisabled(step.key));
              
              return (
                <React.Fragment key={step.number}>
                  <Tooltip
                    title={
                      step.key === 'inspectionSchedule'
                        ? "Situational Analysis available for Facilities that submitted Application Letters that have been accepted"
                        : shouldBeClickable
                          ? `Click to access ${step.title}`
                          : isTabDisabled(step.key)
                            ? "Submit Application For review under Facility Ownership"
                            : (isDisabled ? "Complete the Application details first" : "")
                    }
                    arrow
                    placement="top"
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginLeft: shouldCenter ? '25%' : '0',
                      marginRight: shouldCenter ? '25%' : '0'
                    }}>
                      <Step
                        active={activeTab === step.key || shouldBeActive}
                        hasdata={hasTabData(step.key)}
                        disabled={finalDisabled}
                        onClick={() => {
                          if (shouldBeClickable || (step.key !== 'inspectionSchedule' && !finalDisabled)) {
                            handleTabClick(step.key);
                          }
                        }}
                      >
                      <span className="step-number">{step.number}</span>
                      <Typography
                        variant="subtitle1"
                        className={`step-title${step.title === 'Situational Analysis' && !(isDisabled || step.key === 'inspectionSchedule') ? ' blink-orange' : ''}`}
                      >
                        {step.title}
                      </Typography>
                      <span
                        className="completion-indicator"
                        style={{
                          color: hasTabData(step.key)
                            ? theme.palette.success.main
                            : theme.palette.error.main
                        }}
                      >
                        {hasTabData(step.key) ? '✓' : '✗'}
                      </span>
                    </Step>
                  </div>
                </Tooltip>
                {index < (visibleSteps.length - 1) && <StyledDivider disabled={isDisabled} />}
              </React.Fragment>
            );
          });
        })()}
        </StepContainer>

        {renderTabContent()}
      </Box>

      {/* Add Facility Ownership Dialog - only render when openAddDialog is true */}
      {openAddDialog && (
        <EditFacilityOwnershipDialog
          open={openAddDialog}
          onClose={() => {
            setOpenAddDialog(false);
            fetchFacilityOwnershipData(effectiveTrackedEntityInstanceId);
          }}
          onAddSuccess={() => {
            setOpenAddDialog(false);
            fetchFacilityOwnershipData(effectiveTrackedEntityInstanceId);
          }}
          isEditMode={!!facilityOwnershipEvent}
          event={facilityOwnershipEvent}
          trackedEntityInstanceId={effectiveTrackedEntityInstanceId}
        />
      )}

      {/* Edit Facility Ownership Dialog - only render when showEditDialog is true */}
      {showEditDialog && selectedEvent && (
        <EditFacilityOwnershipDialog
          open={showEditDialog}
          onClose={() => {
            console.log("FacilityOwnershipDialog onClose called - reloading facility ownership data");
            setShowEditDialog(false);
            fetchFacilityOwnershipData(); // Always reload data when dialog closes
          }}
          onUpdateSuccess={() => {
            console.log("FacilityOwnershipDialog onUpdateSuccess called - reloading facility ownership data");
            setShowEditDialog(false);
            fetchFacilityOwnershipData();
          }}
          event={selectedEvent}
          isEditMode={true}
          // facilityName={facilityName}
        />
      )}

      {/* Add Employee Dialog - only render when openEmployeeDialog is true */}
      {openEmployeeDialog && (
        <AddEmployeeRegistrationDialog
          open={openEmployeeDialog}
          onClose={() => {
            console.log("AddEmployeeRegistrationDialog onClose called - reloading employee data");
            handleCloseEmployeeDialog();
            fetchEmployeeData(); // Always reload data when dialog closes
          }}
          onSuccess={handleEmployeeAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Employee Registration Dialog - only render when showEditEmployeeDialog is true */}
      {showEditEmployeeDialog && selectedEmployeeEvent && (
        <EditEmployeeRegistrationDialog
          open={showEditEmployeeDialog}
          onClose={() => {
            console.log("EditEmployeeRegistrationDialog onClose called - reloading employee data");
            setShowEditEmployeeDialog(false);
            fetchEmployeeData(); // Always reload data when dialog closes
          }}
          onSuccess={() => {
            console.log("EditEmployeeRegistrationDialog onSuccess called - reloading employee data");
            setShowEditEmployeeDialog(false);
            fetchEmployeeData();
          }}
          event={selectedEmployeeEvent}
        />
      )}

      {/* Add Service Offering Dialog - only render when openServiceDialog is true */}
      {openServiceDialog && (
        <AddServiceOfferingDialog
          open={openServiceDialog}
          onClose={() => {
            console.log("AddServiceOfferingDialog onClose called - reloading service data");
            handleCloseServiceDialog();
            fetchServiceData(); // Always reload data when dialog closes
          }}
          onSuccess={handleServiceAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Service Offering Dialog - only render when showEditServiceDialog is true */}
      {showEditServiceDialog && selectedServiceEvent && (
        <EditServiceOfferingDialog
          open={showEditServiceDialog}
          onClose={() => {
            console.log("EditServiceOfferingDialog onClose called - reloading service data");
            setShowEditServiceDialog(false);
            fetchServiceData(); // Always reload data when dialog closes
          }}
          onSuccess={() => {
            console.log("EditServiceOfferingDialog onSuccess called - reloading service data");
            setShowEditServiceDialog(false);
            fetchServiceData();
          }}
          event={selectedServiceEvent}
        />
      )}

      {/* Add Inspection Dialog - only render when openInspectionDialog is true */}
      {openInspectionDialog && (
        <AddInspectionDialog
          open={openInspectionDialog}
          onClose={() => {
            console.log("AddInspectionDialog onClose called - reloading inspection data");
            handleCloseInspectionDialog();
          }}
          onSuccess={handleInspectionAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Inspection Dialog - only render when showEditInspectionDialog is true */}
      {showEditInspectionDialog && selectedInspectionEvent && (
        <AddInspectionDialog
          open={showEditInspectionDialog}
          onClose={() => {
            console.log("EditInspectionDialog onClose called - reloading inspection data");
            setShowEditInspectionDialog(false);
            fetchInspectionData(); // Always reload data when dialog closes
          }}
          onSuccess={() => {
            console.log("EditInspectionDialog onSuccess called - reloading inspection data");
            setShowEditInspectionDialog(false);
            fetchInspectionData();
          }}
          existingEvent={selectedInspectionEvent}
          trackedEntityInstanceId={trackedEntityInstanceId}
          isEditMode={true}
        />
      )}

      {/* Add Statutory Compliance Dialog - only render when openStatutoryComplianceDialog is true */}
      {openStatutoryComplianceDialog && (
        <AddStatutoryComplianceDialog
          open={openStatutoryComplianceDialog}
          onClose={() => {
            console.log("AddStatutoryComplianceDialog onClose called - reloading statutory compliance data");
            handleCloseStatutoryComplianceDialog();
            fetchStatutoryComplianceData(); // Always reload data when dialog closes
          }}
          onSuccess={handleStatutoryComplianceAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Statutory Compliance Dialog - only render when showEditStatutoryComplianceDialog is true */}
      {showEditStatutoryComplianceDialog && selectedStatutoryComplianceEvent && (
        <AddStatutoryComplianceDialog
          open={showEditStatutoryComplianceDialog}
          onClose={() => {
            console.log("EditStatutoryComplianceDialog onClose called - reloading statutory compliance data");
            setShowEditStatutoryComplianceDialog(false);
            fetchStatutoryComplianceData(); // Always reload data when dialog closes
          }}
          onSuccess={() => {
            console.log("EditStatutoryComplianceDialog onSuccess called - reloading statutory compliance data");
            setShowEditStatutoryComplianceDialog(false);
            fetchStatutoryComplianceData();
          }}
          existingEvent={selectedStatutoryComplianceEvent}
          trackedEntityInstanceId={trackedEntityInstanceId}
          isEditMode={true}
        />
      )}

      {/* Add Equipment Dialog - only render when openEquipmentDialog is true */}
      {openEquipmentDialog && (
        <AddEquipmentDialog
          open={openEquipmentDialog}
          onClose={() => {
            console.log("AddEquipmentDialog onClose called - reloading equipment data");
            handleCloseEquipmentDialog();
            fetchEquipmentData(); // Always reload data when dialog closes
          }}
          onSuccess={handleEquipmentAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Equipment Dialog - only render when showEditEquipmentDialog is true */}
      {showEditEquipmentDialog && selectedEquipmentEvent && (
        <AddEquipmentDialog
          open={showEditEquipmentDialog}
          onClose={() => {
            console.log("EditEquipmentDialog onClose called - reloading equipment data");
            setShowEditEquipmentDialog(false);
            fetchEquipmentData(); // Always reload data when dialog closes
          }}
          onSuccess={() => {
            console.log("EditEquipmentDialog onSuccess called - reloading equipment data");
            setShowEditEquipmentDialog(false);
            fetchEquipmentData();
          }}
          existingEvent={selectedEquipmentEvent}
          trackedEntityInstanceId={trackedEntityInstanceId}
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default RegistrationDetails;
