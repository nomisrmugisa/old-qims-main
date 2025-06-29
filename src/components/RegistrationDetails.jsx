import React, { useState, useEffect } from 'react';
import './RegistrationDetails.css'; // We'll create this CSS file next
import AddFacilityOwnershipDialog from './AddFacilityOwnershipDialog';
import EditFacilityOwnershipDialog from './EditFacilityOwnershipDialog';
import AddEmployeeRegistrationDialog from './AddEmployeeRegistrationDialog';
import EditEmployeeRegistrationDialog from './EditEmployeeRegistrationDialog';
import AddServiceOfferingDialog from './AddServiceOfferingDialog';
import EditServiceOfferingDialog from './EditServiceOfferingDialog';
import AddInspectionDialog from './AddInspectionDialog';
import AddStatutoryComplianceDialog from './AddStatutoryComplianceDialog';

import TrackerEventDetails from './TrackerEventDetails';
import { styled, Box, Typography, Divider, useTheme, Tooltip } from '@mui/material';
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
  
  // Situational Analysis state
  const [inspectionEvents, setInspectionEvents] = useState([]);
  const [isLoadingInspections, setIsLoadingInspections] = useState(true);
  const [selectedInspectionEvent, setSelectedInspectionEvent] = useState(null);
  const [showEditInspectionDialog, setShowEditInspectionDialog] = useState(false);

  // Statutory Compliance state
  const [statutoryComplianceEvents, setStatutoryComplianceEvents] = useState([]);
  const [isLoadingStatutoryCompliance, setIsLoadingStatutoryCompliance] = useState(true);
  const [openStatutoryComplianceDialog, setOpenStatutoryComplianceDialog] = useState(false);
  const [selectedStatutoryComplianceEvent, setSelectedStatutoryComplianceEvent] = useState(null);
  const [showEditStatutoryComplianceDialog, setShowEditStatutoryComplianceDialog] = useState(false);

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
  
  const StyledDivider = styled(Divider)(({ theme, disabled }) => ({
    width: '60px', // Reduced width to save horizontal space
    borderBottomWidth: 2,
    borderColor: disabled ? theme.palette.grey[300] : theme.palette.divider,
    margin: '0 4px', // Reduced margin to save space
    alignSelf: 'center',
    opacity: disabled ? 0.6 : 1,
    flexShrink: 1, // Allow divider to shrink if needed
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
  
  const hasTabData = (tabKey) => {
    switch (tabKey) {
      case 'completeApplication':
        return completeApplicationStatus; // Use the state variable to determine if all fields are filled
      case 'facilityOwnership':
        return events.length > 0;
      case 'employeeRegistration':
        return employeeEvents.length > 0;
      case 'servicesOffered':
        return serviceEvents.length > 0;
      case 'inspectionSchedule':
        return inspectionEvents.length > 0;
      case 'statutoryCompliance':
        return statutoryComplianceEvents.length > 0;
      default:
        return false;
    }
  };
  
  // Handle tab click with validation
  const handleTabClick = (tabKey) => {
    console.log("=== TAB CLICKED ===", tabKey);
    console.log("- completeApplicationStatus:", completeApplicationStatus);
    
    // If Complete Application is not complete and trying to access another tab, don't allow it
    if (!completeApplicationStatus && tabKey !== 'completeApplication') {
      console.log("- Tab click blocked - application not complete");
      return; // Don't change tabs
    }
    
    console.log("- Setting active tab to:", tabKey);
    setActiveTab(tabKey);
    
    // Manually trigger fetch for inspection data when clicking on inspectionSchedule tab
    if (tabKey === 'inspectionSchedule') {
      console.log("- Manually triggering fetchInspectionData for Situational Analysis tab");
      fetchInspectionData();
    }
  };

  const fetchFacilityOwnershipData = async () => {
    if (!trackedEntityInstanceId) {
      setIsLoading(false);
      return;
    }
    const credentials = localStorage.getItem('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId || !trackedEntityInstanceId) {
      // Redirect to login or handle missing credentials/trackedEntityInstanceId
      // console.error("Missing credentials, Org Unit ID, or Tracked Entity Instance ID.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]!programStage=MuJubgTzJrY&paging=false`;
      
      // Log the endpoint and parameters for debugging
      console.log("Facility Ownership API Request:");
      console.log("- Full URL:", url);
      console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
      console.log("- organizationUnitId:", userOrgUnitId);
      console.log("- programId: EE8yeLVo6cN");
      console.log("- programStage: MuJubgTzJrY");

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
      console.log("Facility Ownership API Response:");
      console.log("- Response data:", data);
      console.log("- Has enrollments:", Boolean(data.enrollments));
      console.log("- Number of enrollments:", data.enrollments?.length || 0);
      
      let fetchedEvents = [];

      if (data.enrollments && data.enrollments.length > 0) {
        console.log("- Processing enrollments...");
        let targetStageEvents = 0;
        
        data.enrollments.forEach((enrollment, index) => {
          console.log(`  - Enrollment #${index+1} ID:`, enrollment.enrollment);
          console.log(`  - Events in enrollment #${index+1}:`, enrollment.events?.length || 0);
          
          if (enrollment.events && enrollment.events.length > 0) {
            console.log(`  - First event programStage:`, enrollment.events[0].programStage);
            
            // Count events with programStage MuJubgTzJrY
            const stageEvents = enrollment.events.filter(event => event.programStage === "MuJubgTzJrY");
            console.log(`  - Events with programStage MuJubgTzJrY in this enrollment:`, stageEvents.length);
            targetStageEvents += stageEvents.length;
          }
          
          fetchedEvents = fetchedEvents.concat(enrollment.events || []);
        });
        
        console.log("- Total events with programStage MuJubgTzJrY:", targetStageEvents);
      }
      
      console.log("- Total events extracted:", fetchedEvents.length);

      setEvents(fetchedEvents);
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
      // setShowReviewDialog(true); // This prop is now managed by Dashboard
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
  
  useEffect(() => {
    if (trackedEntityInstanceId) {
      fetchFacilityOwnershipData();
      fetchEmployeeData();
    }
  }, [trackedEntityInstanceId]);

  // Add a new effect for fetching service data
  useEffect(() => {
    fetchServiceData();
  }, [trackedEntityInstanceId]);

  const fetchServiceData = async () => {
    if (!trackedEntityInstanceId) {
      setIsLoadingServices(false);
      return;
    }

    const credentials = localStorage.getItem('userCredentials');
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
          }
          fetchedEvents = fetchedEvents.concat(enrollment.events || []);
        });
      }
      
      console.log("- Total service events extracted:", fetchedEvents.length);

      setServiceEvents(fetchedEvents);
      setIsLoadingServices(false);

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
    if (!trackedEntityInstanceId) {
      setIsLoadingEmployees(false);
      return;
    }

    const credentials = localStorage.getItem('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId) {
      setIsLoadingEmployees(false);
      return;
    }

    try {
      setIsLoadingEmployees(true);
      const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]!programStage=xjhA4eEHyhw&paging=false`;
      
      // Log the endpoint and parameters for debugging
      console.log("Employee Registration API Request:");
      console.log("- Full URL:", url);
      console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
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
          }
          fetchedEvents = fetchedEvents.concat(enrollment.events || []);
        });
      }
      
      console.log("- Total employee events extracted:", fetchedEvents.length);

      setEmployeeEvents(fetchedEvents);
      setIsLoadingEmployees(false);

    } catch (error) {
      console.error("Error fetching employee data:", error);
      setIsLoadingEmployees(false);
    }
  };

  const fetchInspectionData = async () => {
    console.log("=== DEBUGGING INSPECTION DATA FETCH ===");
    console.log("- trackedEntityInstanceId:", trackedEntityInstanceId);
    console.log("- userCredentials exists:", !!localStorage.getItem('userCredentials'));
    console.log("- userOrgUnitId:", localStorage.getItem('userOrgUnitId'));
    
    if (!trackedEntityInstanceId) {
      console.log("- EARLY RETURN: No trackedEntityInstanceId");
      setIsLoadingInspections(false);
      return;
    }

    const credentials = localStorage.getItem('userCredentials');
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

    } catch (error) {
      console.error("Error fetching inspection data:", error);
      setIsLoadingInspections(false);
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
        const switchFlag = localStorage.getItem('switchToFacilityOwnership');
        if (switchFlag === 'true' && completeApplicationStatus) {
          // Clear the flag first to avoid repeated triggering
          localStorage.removeItem('switchToFacilityOwnership');
          
          // Switch to the Facility Ownership tab
          setActiveTab('facilityOwnership');
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

  const handleAddService = () => {
    setOpenServiceDialog(true);
  };

  const handleCloseServiceDialog = () => {
    setOpenServiceDialog(false);
  };

  const handleServiceAddSuccess = () => {
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

  // Fetch statutory compliance data
  const fetchStatutoryComplianceData = async () => {
    if (!trackedEntityInstanceId) {
      setIsLoadingStatutoryCompliance(false);
      return;
    }

    const credentials = localStorage.getItem('userCredentials');
    const userOrgUnitId = localStorage.getItem('userOrgUnitId');

    if (!credentials || !userOrgUnitId) {
      setIsLoadingStatutoryCompliance(false);
      return;
    }

    try {
      setIsLoadingStatutoryCompliance(true);
      // Fetch all events and filter by program stage in JavaScript
      const url = `/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]&paging=false`;
      
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

    } catch (error) {
      console.error("Error fetching statutory compliance data:", error);
      setIsLoadingStatutoryCompliance(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'completeApplication':
        return (
          <div className="tab-content">
            <div className="complete-application-details">
              <h2>Complete Application Details</h2>
              <TrackerEventDetails onFormStatusChange={handleFormStatusChange} />
            </div>
          </div>
        );
      case 'facilityOwnership':
        return (
          <div className="tab-content">
            <div className="facility-ownership-details">
              <h2>Facility Ownership Details <span className="add-icon" onClick={() => setOpenAddDialog(true)}>+</span></h2>
              {isLoading ? (
                <p>Loading facility ownership data...</p>
              ) : showReviewDialog ? (
                <p className="error-message">Error loading data. Please try again or contact support.</p>
              ) : events.length === 0 ? (
                <p>No facility ownership records found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Organization Unit</th>
                        <th>First Name</th>
                        <th>Surname</th>
                        <th>Citizenship</th>
                        <th>Program Stage ID</th>
                        <th>Event ID</th>
                        <th>Tracked Entity Instance ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event, index) => {
                        const dataValues = event.dataValues || [];
                        const getFormattedValue = (dataElementId) => {
                          const dataValue = dataValues.find(dv => dv.dataElement === dataElementId);
                          return dataValue ? dataValue.value : '';
                        };

                        return (
                          <tr 
                            key={event.event || index}
                            onClick={() => handleRowClick(event)}
                            style={{ cursor: 'pointer' }}
                            className="hover-row"
                          >
                            <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                            <td>{localStorage.getItem('userOrgUnitName')}</td>
                            <td>{getFormattedValue("HMk4LZ9ESOq")}</td> {/* First Name */}
                            <td>{getFormattedValue("ykwhsQQPVH0")}</td> {/* Surname */}
                            <td>{getFormattedValue("zVmmto7HwOc")}</td> {/* Citizenship */}
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
                        <th>Event ID</th>
                        <th>Inspection Date</th>
                        <th>Inspection Code</th>
                        <th>Inspector</th>
                        <th>Type</th>
                        <th>Organization Structure</th>
                        <th>Patient Policies</th>
                        <th>Facility Environment</th>
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
                             <td>{event.event || 'N/A'}</td>
                             <td>{formatDate(getFormattedValue("e4MmMJ3zrhK"))}</td>
                             <td>{getFormattedValue("wS6bfV1hrU0")}</td>
                             <td>{getFormattedValue("VOjM6ArpORU")}</td>
                             <td>{getFormattedValue("Pl4RdRtKErd")}</td>
                             <td>{formatBoolean(getFormattedValue("WCys8b95Qrw"))}</td>
                             <td>{policiesStatus}</td>
                             <td>{facilityStatus}</td>
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
                        <th>Event ID</th>
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
                            <td>{event.event || 'N/A'}</td>
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

  return (
    <div className="registration-details-container">
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Registration Details
        </Typography>
        
        <StepContainer>
          {[
            { number: 1, title: 'Complete Application', key: 'completeApplication' },
            { number: 2, title: 'Facility Ownership', key: 'facilityOwnership' },
            { number: 3, title: 'Employee Registration', key: 'employeeRegistration' },
            { number: 4, title: 'Services Offered', key: 'servicesOffered' },
            { number: 5, title: 'Statutory Compliance', key: 'statutoryCompliance' },
            { number: 6, title: 'Situational Analysis', key: 'inspectionSchedule' }
          ].map((step, index) => {
            // Determine if the tab should be disabled
            const isDisabled = !completeApplicationStatus && step.key !== 'completeApplication';
            
            return (
              <React.Fragment key={step.number}>
                <Tooltip 
                  title={isDisabled ? "Complete the Application details first" : ""}
                  arrow
                  placement="top"
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Step 
                      active={activeTab === step.key}
                      hasdata={hasTabData(step.key)}
                      disabled={isDisabled}
                      onClick={() => handleTabClick(step.key)}
                    >
                      <span className="step-number">{step.number}</span>
                      <Typography variant="subtitle1" className="step-title">
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
                {index < 5 && <StyledDivider disabled={isDisabled} />}
              </React.Fragment>
            );
          })}
        </StepContainer>

        {renderTabContent()}
      </Box>

      {/* Add Facility Ownership Dialog - only render when openAddDialog is true */}
      {openAddDialog && (
        <AddFacilityOwnershipDialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          onSuccess={() => {
            setOpenAddDialog(false);
            fetchFacilityOwnershipData();
          }}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Facility Ownership Dialog - only render when showEditDialog is true */}
      {showEditDialog && selectedEvent && (
        <EditFacilityOwnershipDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false);
            fetchFacilityOwnershipData();
          }}
          event={selectedEvent}
        />
      )}

      {/* Add Employee Dialog - only render when openEmployeeDialog is true */}
      {openEmployeeDialog && (
        <AddEmployeeRegistrationDialog
          open={openEmployeeDialog}
          onClose={handleCloseEmployeeDialog}
          onSuccess={handleEmployeeAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Employee Registration Dialog - only render when showEditEmployeeDialog is true */}
      {showEditEmployeeDialog && selectedEmployeeEvent && (
        <EditEmployeeRegistrationDialog
          open={showEditEmployeeDialog}
          onClose={() => setShowEditEmployeeDialog(false)}
          onSuccess={() => {
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
          onClose={handleCloseServiceDialog}
          onSuccess={handleServiceAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Service Offering Dialog - only render when showEditServiceDialog is true */}
      {showEditServiceDialog && selectedServiceEvent && (
        <EditServiceOfferingDialog
          open={showEditServiceDialog}
          onClose={() => setShowEditServiceDialog(false)}
          onSuccess={() => {
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
          onClose={handleCloseInspectionDialog}
          onAddSuccess={handleInspectionAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Inspection Dialog - only render when showEditInspectionDialog is true */}
      {showEditInspectionDialog && selectedInspectionEvent && (
        <AddInspectionDialog
          open={showEditInspectionDialog}
          onClose={() => setShowEditInspectionDialog(false)}
          onSuccess={() => {
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
          onClose={handleCloseStatutoryComplianceDialog}
          onSuccess={handleStatutoryComplianceAddSuccess}
          trackedEntityInstanceId={trackedEntityInstanceId}
        />
      )}

      {/* Edit Statutory Compliance Dialog - only render when showEditStatutoryComplianceDialog is true */}
      {showEditStatutoryComplianceDialog && selectedStatutoryComplianceEvent && (
        <AddStatutoryComplianceDialog
          open={showEditStatutoryComplianceDialog}
          onClose={() => setShowEditStatutoryComplianceDialog(false)}
          onSuccess={() => {
            setShowEditStatutoryComplianceDialog(false);
            fetchStatutoryComplianceData();
          }}
          existingEvent={selectedStatutoryComplianceEvent}
          trackedEntityInstanceId={trackedEntityInstanceId}
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default RegistrationDetails;