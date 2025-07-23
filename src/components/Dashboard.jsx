import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import RegistrationDetails from './RegistrationDetails';
import {Button, Card, Col, Row} from "react-bootstrap";
import {Building, ClipboardCheck, PlusCircle, House, FileEarmarkText, ListCheck, Gear, Person} from "react-bootstrap-icons";
import UserTable from './User/Management/Table';
import useUserManagement from './hooks/useUserManagement';
import UserRoleManagement from './User/Management/UserRoleManagement';
import UserGroupManagement from './User/Management/UserGroupManagement';
import EnrolmentApplicationReview from "./Enrolment/Application/Review";
import {StorageService} from '../services';
import { Link, useNavigate } from 'react-router-dom';
import { safeFetch, showErrorMessage, logAPICall, logAPIResponse, API_ERROR_CODES } from '../utils/apiErrorHandler';
import { Snackbar, Alert } from '@mui/material';

const Dashboard = ({ activeSection, setActiveSection, trackedEntityInstanceId }) => {
    console.log("🔍 DASHBOARD COMPONENT RENDERING - THIS SHOULD APPEAR EVERY TIME THE COMPONENT RENDERS");
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [showFacilityReviewDialog, setShowFacilityReviewDialog] = useState(false);
    const [_facilityOwnershipComplete, setFacilityOwnershipComplete] = useState(false);
    const [inspectionEvents, setInspectionEvents] = useState([]);
    const [isLoadingInspections, setIsLoadingInspections] = useState(false);
    const [activeUserTab, setActiveUserTab] = useState('enrolment_applications');


    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
    
    // User management state
    const {
        users,
        loading: usersLoading,
        error: usersError,
        pagination,
        handlePageChange,
        handleSearch,
        handleCreateUser,
        handleUpdateUser,
        handleDeleteUser
    } = useUserManagement();

    const fetchTrackedEntityInstance = async () => {
        const credentials = await StorageService.get('userCredentials');
        const userOrgUnitId = localStorage.getItem('userOrgUnitId');
        const userOrgUnitName = localStorage.getItem('userOrgUnitName');

        console.log('=== FETCH TRACKED ENTITY INSTANCE ===');
        console.log('- userOrgUnitId:', userOrgUnitId);
        console.log('- userOrgUnitName:', userOrgUnitName);
        console.log('- credentials available:', !!credentials);
        console.log('- DHIS2 URL:', import.meta.env.VITE_DHIS2_URL);
        
        if (!userOrgUnitId) {
            console.error('❌ CRITICAL ERROR: No organization unit ID available');
            console.error('- This is likely why the trackedEntityInstance fetch is failing');
            console.error('- Check if the Header component is correctly setting userOrgUnitId in localStorage');
            setDashboardLoading(false);
            return;
        }

        if (!credentials) {
            // Redirect to login if credentials are missing
            // This should ideally be handled by a global authentication context
            console.error('Credentials missing. Redirecting to login.');
            // window.location.href = "/authentication/sign-in/basic"; 
            return;
        }

        try {
            // Construct the API URL
            const baseUrl = import.meta.env.VITE_DHIS2_URL;
            const endpoint = '/api/trackedEntityInstances';
            const params = new URLSearchParams({
                ou: userOrgUnitId,
                ouMode: 'SELECTED',
                program: 'EE8yeLVo6cN',
                fields: 'trackedEntityInstance',
                paging: 'false'
            });
            const url = `${baseUrl}${endpoint}?${params.toString()}`;
            
            // Log the API call details
            logAPICall('GET', url, {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }, 'Dashboard.fetchTrackedEntityInstance');
            
            // Make the API call with error handling
            const response = await safeFetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            }, 'Dashboard.fetchTrackedEntityInstance');

            const data = await response.json();
            logAPIResponse(response, data, 'Dashboard.fetchTrackedEntityInstance');
            
            console.log('- Response data:', data);
            console.log('- Has trackedEntityInstances:', Boolean(data.trackedEntityInstances));
            console.log('- Number of instances:', data.trackedEntityInstances?.length || 0);

            if (data.trackedEntityInstances && data.trackedEntityInstances.length > 0) {
                const instance = data.trackedEntityInstances[0];
                console.log('- Found trackedEntityInstance:', instance.trackedEntityInstance);
                // setTrackedEntityInstanceId(instance.trackedEntityInstance); // This line is removed
            } else {
                // Handle case where no tracked entity instance is found
                // This might indicate a fresh registration or an issue.
                // For now, set to null and allow the child components to handle
                console.log('- No tracked entity instances found - user needs to complete registration first');
                // setTrackedEntityInstanceId(null); // This line is removed
                // Don't set showFacilityReviewDialog to true here, let the component handle it
            }
        } catch (error) {
            console.error("- Error fetching tracked entity instance:", error);
            
            // Handle specific error types
            if (error.code === API_ERROR_CODES.UNAUTHORIZED) {
                // Unauthorized errors are handled by the error handler utility
                // No need to show additional error messages
                return;
            }
            
            // Show user-friendly error message
            const errorMessage = showErrorMessage(error, 'Dashboard.fetchTrackedEntityInstance');
            setError(errorMessage);
            setShowErrorSnackbar(true);
            
            // Only set showFacilityReviewDialog to true for actual errors, not for missing data
            if (error.message !== "No tracked entity instances found") {
                setShowFacilityReviewDialog(true);
            }
        } finally {
            console.log('=== FETCH TRACKED ENTITY INSTANCE COMPLETED ===');
            setDashboardLoading(false);
        }
    };

    // Monitor localStorage for changes to situationalAnalysisComplete
    useEffect(() => {
        const checkSituationalAnalysisStatus = () => {
            // Removed console.log to prevent console spam
            // setSituationalAnalysisComplete(status); // This line is removed
        };
        
        // Check immediately
        checkSituationalAnalysisStatus();
        
        // Set up interval to check periodically
        const intervalId = setInterval(checkSituationalAnalysisStatus, 1000);
        
        return () => clearInterval(intervalId);
    }, []);

    // Monitor localStorage for changes to facilityOwnershipComplete
    useEffect(() => {
        const checkFacilityOwnershipStatus = () => {
            const status = localStorage.getItem('facilityOwnershipComplete') === 'true';
            setFacilityOwnershipComplete(status);
        };
        
        // Check immediately
        checkFacilityOwnershipStatus();
        
        // Set up interval to check periodically
        const intervalId = setInterval(checkFacilityOwnershipStatus, 1000);
        
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        console.log("🚀 DASHBOARD COMPONENT MOUNTED - THIS SHOULD ALWAYS APPEAR");
        console.log("=== DASHBOARD COMPONENT MOUNTED ===");
        
        // Check for temporary tracked entity instance ID from tab click
        const tempTrackedEntityInstanceId = localStorage.getItem('tempTrackedEntityInstanceId');
        if (tempTrackedEntityInstanceId) {
            console.log("📌 Found temporary trackedEntityInstanceId:", tempTrackedEntityInstanceId);
            console.log("- Using this instead of fetching");
            // setTrackedEntityInstanceId(tempTrackedEntityInstanceId); // This line is removed
            // Clear the temporary ID so we don't use it again unnecessarily
            localStorage.removeItem('tempTrackedEntityInstanceId');
            setDashboardLoading(false);
            return; // Skip the regular fetch
        }
        
        // Log organization unit information
        const userOrgUnitId = localStorage.getItem('userOrgUnitId');
        const userOrgUnitName = localStorage.getItem('userOrgUnitName');
        console.log("- Organization Unit ID:", userOrgUnitId);
        console.log("- Organization Unit Name:", userOrgUnitName);
        
        console.log("- Calling fetchTrackedEntityInstance");
        console.log("- This will make a GET request to:");
        console.log(`- ${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=trackedEntityInstance&paging=false`);
        
        // Test if the API is accessible at all
        const testApiAccess = async () => {
            try {
                const credentials = await StorageService.get('userCredentials');
                const userOrgUnitId = localStorage.getItem('userOrgUnitId');
                
                if (!credentials || !userOrgUnitId) {
                    console.error('❌ TEST API: Missing credentials or userOrgUnitId');
                    return;
                }
                
                console.log('🧪 TESTING API ACCESS');
                console.log('- userOrgUnitId:', userOrgUnitId);
                console.log('- DHIS2 URL:', import.meta.env.VITE_DHIS2_URL);
                
                const testUrl = `${import.meta.env.VITE_DHIS2_URL}/api/me`;
                console.log('- Test URL:', testUrl);
                
                const response = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                    }
                });
                
                console.log('- Test API Response Status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('- Test API Response Data:', data);
                    console.log('✅ API IS ACCESSIBLE');
                } else {
                    console.error('❌ API IS NOT ACCESSIBLE');
                }
            } catch (error) {
                console.error('❌ ERROR TESTING API:', error);
            }
        };
        
        testApiAccess();
        fetchTrackedEntityInstance();
    }, []);

    useEffect(() => {
        if (activeSection === 'inspections') {
            fetchInspectionEvents();
        }
        // eslint-disable-next-line
    }, [activeSection, trackedEntityInstanceId]);

    const fetchInspectionEvents = async () => {
        setIsLoadingInspections(true);
        const credentials = await StorageService.get('userCredentials');
        const userOrgUnitId = localStorage.getItem('userOrgUnitId');
        if (!trackedEntityInstanceId || !credentials || !userOrgUnitId) {
            setInspectionEvents([]);
            setIsLoadingInspections(false);
            return;
        }
        try {
            const url = `${import.meta.env.VITE_DHIS2_URL}/api/trackedEntityInstances/${trackedEntityInstanceId}?ou=${userOrgUnitId}&ouMode=SELECTED&program=EE8yeLVo6cN&fields=enrollments[events]&paging=false`;
            const response = await fetch(url, {
                headers: { Authorization: `Basic ${credentials}` },
            });
            if (!response.ok) throw new Error('Failed to fetch inspection events');
            const data = await response.json();
            let fetchedEvents = [];
            if (data.enrollments && data.enrollments.length > 0) {
                data.enrollments.forEach(enrollment => {
                    if (enrollment.events && enrollment.events.length > 0) {
                        // Only include events from the inspection program stage
                        const inspectionEvents = enrollment.events.filter(event => event.programStage === 'Eupjm3J0dt2');
                        fetchedEvents = fetchedEvents.concat(inspectionEvents);
                    }
                });
            }
            setInspectionEvents(fetchedEvents);
        } catch {
            setInspectionEvents([]);
        } finally {
            setIsLoadingInspections(false);
        }
    };

    // Listen for auto-navigation to inspections tab
    useEffect(() => {
        const handleSwitchToTab = (event) => {
            console.log('Received switchToTab event:', event.detail);
            
            if (event.detail === 'inspections') {
                setActiveSection('inspections');
            }
        };

        window.addEventListener('switchToTab', handleSwitchToTab);
        
        return () => {
            window.removeEventListener('switchToTab', handleSwitchToTab);
        };
    }, []);

    // Add global styles for blinking
    // Removed unused blinkStyles variable

  // Removed unused state
  // const [hasFacilityOwnershipEvents, setHasFacilityOwnershipEvents] = useState(false);

  // Removed unused effect for checking facility ownership events

    // const renderContent = () => {
    //     switch (activeSection) {
    //         case 'overview':
    //             return (
    //                 <div className="dashboard-section">
    //                     <h2>Facility Dashboard</h2>
    //                     <Card className="mb-4">
    //                         <Card.Body>
    //                             <Row className="g-4">
    //                                 <Col md={6}>
    //                                     <Card className="h-100 shadow-sm">
    //                                         <Card.Body className="text-center py-5">
    //                                             <Building size={48} className="text-primary mb-3" />
    //                                             <Card.Title>Register New Facility</Card.Title>
    //                                             <Card.Text className="text-muted mb-4">
    //                                                 Start the registration process for a new healthcare facility
    //                                             </Card.Text>
    //                                             <Button variant="primary" onClick={() => setActiveSection('registration')}>
    //                                                 Begin Registration
    //                                             </Button>
    //                                         </Card.Body>
    //                                     </Card>
    //                                 </Col>

    //                                 <Col md={6}>
    //                                     <Card className="h-100 shadow-sm">
    //                                         <Card.Body className="text-center py-5">
    //                                             <ClipboardCheck size={48} className="text-success mb-3" />
    //                                             <Card.Title>Enrol with a Facility</Card.Title>
    //                                             <Card.Text className="text-muted mb-4">
    //                                                 Enrol with an existing facility
    //                                             </Card.Text>
    //                                             <Button
    //                                                 variant="outline-primary"
    //                                                 onClick={() => navigate('/facility/user/enrolment/application')}
    //                                             >
    //                                                 <PlusCircle className="me-1" /> Enroll in New Facility
    //                                             </Button>
    //                                         </Card.Body>
    //                                     </Card>
    //                                 </Col>

    //                                 <Col md={6}>
    //                                     <Card className="h-100 shadow-sm">
    //                                         <Card.Body className="text-center py-5">
    //                                             <ClipboardCheck size={48} className="text-success mb-3" />
    //                                             <Card.Title>Renew Facility License</Card.Title>
    //                                             <Card.Text className="text-muted mb-4">
    //                                                 Renew the license for an existing healthcare facility
    //                                             </Card.Text>
    //                                             <Button variant="success">Start Renewal</Button>
    //                                         </Card.Body>
    //                                     </Card>
    //                                 </Col>

    //                             </Row>
    //                         </Card.Body>
    //                     </Card>
    //                     {/*<div className="stats-grid">*/}
    //                     {/*    <div className="stat-card">*/}
    //                     {/*        <h3>Active Inspections</h3>*/}
    //                     {/*        <p className="stat-number">3</p>*/}
    //                     {/*    </div>*/}
    //                     {/*    <div className="stat-card">*/}
    //                     {/*        <h3>Pending Tasks</h3>*/}
    //                     {/*        <p className="stat-number">5</p>*/}
    //                     {/*    </div>*/}
    //                     {/*    <div className="stat-card">*/}
    //                     {/*        <h3>Completed Reports</h3>*/}
    //                     {/*        <p className="stat-number">12</p>*/}
    //                     {/*    </div>*/}
    //                     {/*    <div className="stat-card">*/}
    //                     {/*        <h3>Upcoming Deadlines</h3>*/}
    //                     {/*        <p className="stat-number">2</p>*/}
    //                     {/*    </div>*/}
    //                     {/*</div>*/}
    //                 </div>
    //             );
    //         case 'registration':
    //             return (
    //                 <div className="dashboard-section">
    //                     <RegistrationDetails 
    //                         trackedEntityInstanceId={trackedEntityInstanceId} 
    //                         showReviewDialog={showFacilityReviewDialog}
    //                     />
    //                 </div>
    //             );

    //         case 'users':
    //             return (
    //                 <div className="dashboard-section">
    //                     <div className="mb-4 d-flex gap-2 border-bottom pb-2">
    //                         <Button
    //                             variant={activeUserTab === 'enrolment_applications' ? 'primary' : 'light'}
    //                             className={activeUserTab === 'enrolment_applications' ? '' : 'text-primary'}
    //                             onClick={() => setActiveUserTab('enrolment_applications')}
    //                         >
    //                             Enrolment Application
    //                         </Button>
    //                         <Button
    //                             variant={activeUserTab === 'users' ? 'primary' : 'light'}
    //                             className={activeUserTab === 'users' ? '' : 'text-primary'}
    //                             onClick={() => setActiveUserTab('users')}
    //                         >
    //                             Users
    //                         </Button>
    //                         <Button
    //                             variant={activeUserTab === 'roles' ? 'primary' : 'light'}
    //                             className={activeUserTab === 'roles' ? '' : 'text-primary'}
    //                             onClick={() => setActiveUserTab('roles')}
    //                         >
    //                             User role
    //                         </Button>
    //                         <Button
    //                             variant={activeUserTab === 'groups' ? 'primary' : 'light'}
    //                             className={activeUserTab === 'groups' ? '' : 'text-primary'}
    //                             onClick={() => setActiveUserTab('groups')}
    //                         >
    //                             User group
    //                         </Button>
    //                     </div>


    //                     {activeUserTab === 'enrolment_applications' && (
    //                         <>
    //                         <EnrolmentApplicationReview />
    //                         </>
    //                     )}

    //                     {activeUserTab === 'users' && (
    //                         <>
    //                             <h2>Facility User Management</h2>
    //                             {usersError && (
    //                                 <div className="alert alert-danger mb-4">
    //                                     {usersError}
    //                                 </div>
    //                             )}
    //                             <UserTable
    //                                 users={users}
    //                                 loading={usersLoading}
    //                                 totalPages={pagination.totalPages}
    //                                 currentPage={pagination.currentPage}
    //                                 onPageChange={handlePageChange}
    //                                 onSearch={handleSearch}
    //                                 onDelete={handleDeleteUser}
    //                                 onUpdate={handleUpdateUser}
    //                                 onCreate={handleCreateUser}
    //                             />
    //                         </>
    //                     )}
    //                     {activeUserTab === 'roles' && (
    //                         <>
    //                             <h2>User Role Management</h2>
    //                             <UserRoleManagement />
    //                         </>
    //                     )}
    //                     {activeUserTab === 'groups' && (
    //                         <>
    //                             <h2>User Group Management</h2>
    //                             <UserGroupManagement />
    //                         </>
    //                     )}
    //                 </div>
    //             );
    //         case 'reports':
    //             return (
    //                 <div className="dashboard-section">
    //                     <h2>Recent Reports</h2>
    //                     <div className="reports-list">
    //                         <div className="report-item">
    //                             <h4>Monthly Inspection Report</h4>
    //                             <p>Last updated: 2024-03-15</p>
    //                         </div>
    //                         <div className="report-item">
    //                             <h4>Safety Compliance Review</h4>
    //                             <p>Last updated: 2024-03-10</p>
    //                         </div>
    //                     </div>
    //                 </div>
    //             );
    //         case 'tasks':
    //             return (
    //                 <div className="dashboard-section">
    //                     <h2>Pending Tasks</h2>
    //                     <div className="tasks-list">
    //                         <div className="task-item">
    //                             <h4>Complete Facility Inspection</h4>
    //                             <p>Due: 2024-03-25</p>
    //                         </div>
    //                         <div className="task-item">
    //                             <h4>Update Safety Protocols</h4>
    //                             <p>Due: 2024-03-28</p>
    //                         </div>
    //                     </div>
    //                 </div>
    //             );
    //         case 'inspections':
    //             return (
    //                 <div className="dashboard-section">
    //                     <h2>View Inspection Results</h2>
    //                     {isLoadingInspections ? (
    //                         <p>Loading inspection results...</p>
    //                     ) : inspectionEvents.length === 0 ? (
    //                         <p>No inspection results found for this facility.</p>
    //                     ) : (
    //                         <div className="inspections-table-container">
    //                             <table className="table table-striped table-hover">
    //                                 <thead>
    //                                     <tr>
    //                                         <th>Inspection Date</th>
    //                                         <th>Status</th>
    //                                         <th>Inspector</th>
    //                                         <th>Findings</th>
    //                                     </tr>
    //                                 </thead>
    //                                 <tbody>
    //                                     {inspectionEvents.map((event, idx) => {
    //                                         const getValue = (id) => (event.dataValues || []).find(dv => dv.dataElement === id)?.value || '';
    //                                         return (
    //                                             <tr key={event.event || idx}>
    //                                                 <td>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}</td>
    //                                                 <td>{event.status || 'N/A'}</td>
    //                                                 <td>{getValue('inspector') || 'N/A'}</td>
    //                                                 <td>{getValue('findings') || 'N/A'}</td>
    //                                             </tr>
    //                                         );
    //                                     })}
    //                                 </tbody>
    //                             </table>
    //                         </div>
    //                     )}
    //                 </div>
    //             );

            
            
    //         default:
    //             return null;
    //     }
    // };
    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="dashboard-section">
                        <h2>Facility Dashboard</h2>
                        <Card className="mb-4">
                            <Card.Body>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body className="text-center py-5">
                                                <Building size={48} className="text-primary mb-3" />
                                                <Card.Title>Register New Facility</Card.Title>
                                                <Card.Text className="text-muted mb-4">
                                                    Start the registration process for a new healthcare facility
                                                </Card.Text>
                                                <Button variant="primary" onClick={() => setActiveSection('registration')}>
                                                    Begin Registration
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
    
                                    <Col md={6}>
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body className="text-center py-5">
                                                <ClipboardCheck size={48} className="text-success mb-3" />
                                                <Card.Title>Enrol with a Facility</Card.Title>
                                                <Card.Text className="text-muted mb-4">
                                                    Enrol with an existing facility
                                                </Card.Text>
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => navigate('/facility/user/enrolment/application')}
                                                >
                                                    <PlusCircle className="me-1" /> Enroll in New Facility
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
    
                                    <Col md={6}>
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body className="text-center py-5">
                                                <ClipboardCheck size={48} className="text-success mb-3" />
                                                <Card.Title>Renew Facility License</Card.Title>
                                                <Card.Text className="text-muted mb-4">
                                                    Renew the license for an existing healthcare facility
                                                </Card.Text>
                                                <Button variant="success">Start Renewal</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
    
                                    <Col md={6}>
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body className="text-center py-5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#0d6efd" className="bi bi-credit-card mb-3" viewBox="0 0 16 16">
                                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
                                                    <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
                                                </svg>
                                                <Card.Title>Payments</Card.Title>
                                                <Card.Text className="text-muted mb-4">
                                                    Manage facility payments and subscriptions
                                                </Card.Text>
                                                <div className="payment-options d-flex justify-content-around mb-3">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" height="30" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" height="30" />
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="VISA" height="20" />
                                                    <span className="badge bg-primary">Mobile Money</span>
                                                </div>
                                                <Button variant="info" onClick={() => setActiveSection('payments')}>
                                                    View Payment Options
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </div>
                );
            case 'registration':
                return (
                    <div className="dashboard-section">
                        <RegistrationDetails 
                            trackedEntityInstanceId={trackedEntityInstanceId} 
                            showReviewDialog={showFacilityReviewDialog}
                        />
                    </div>
                );
    
            case 'users':
                return (
                    <div className="dashboard-section">
                        <div className="mb-4 d-flex gap-2 border-bottom pb-2">
                            <Button
                                variant={activeUserTab === 'enrolment_applications' ? 'primary' : 'light'}
                                className={activeUserTab === 'enrolment_applications' ? '' : 'text-primary'}
                                onClick={() => setActiveUserTab('enrolment_applications')}
                            >
                                Enrolment Application
                            </Button>
                            <Button
                                variant={activeUserTab === 'users' ? 'primary' : 'light'}
                                className={activeUserTab === 'users' ? '' : 'text-primary'}
                                onClick={() => setActiveUserTab('users')}
                            >
                                Users
                            </Button>
                            <Button
                                variant={activeUserTab === 'roles' ? 'primary' : 'light'}
                                className={activeUserTab === 'roles' ? '' : 'text-primary'}
                                onClick={() => setActiveUserTab('roles')}
                            >
                                User role
                            </Button>
                            <Button
                                variant={activeUserTab === 'groups' ? 'primary' : 'light'}
                                className={activeUserTab === 'groups' ? '' : 'text-primary'}
                                onClick={() => setActiveUserTab('groups')}
                            >
                                User group
                            </Button>
                        </div>
    
                        {activeUserTab === 'enrolment_applications' && (
                            <>
                            <EnrolmentApplicationReview />
                            </>
                        )}
    
                        {activeUserTab === 'users' && (
                            <>
                                <h2>Facility User Management</h2>
                                {usersError && (
                                    <div className="alert alert-danger mb-4">
                                        {usersError}
                                    </div>
                                )}
                                <UserTable
                                    users={users}
                                    loading={usersLoading}
                                    totalPages={pagination.totalPages}
                                    currentPage={pagination.currentPage}
                                    onPageChange={handlePageChange}
                                    onSearch={handleSearch}
                                    onDelete={handleDeleteUser}
                                    onUpdate={handleUpdateUser}
                                    onCreate={handleCreateUser}
                                />
                            </>
                        )}
                        {activeUserTab === 'roles' && (
                            <>
                                <h2>User Role Management</h2>
                                <UserRoleManagement />
                            </>
                        )}
                        {activeUserTab === 'groups' && (
                            <>
                                <h2>User Group Management</h2>
                                <UserGroupManagement />
                            </>
                        )}
                    </div>
                );
            case 'reports':
                return (
                    <div className="dashboard-section">
                        <h2>Recent Reports</h2>
                        <div className="reports-list">
                            <div className="report-item">
                                <h4>Monthly Inspection Report</h4>
                                <p>Last updated: 2024-03-15</p>
                            </div>
                            <div className="report-item">
                                <h4>Safety Compliance Review</h4>
                                <p>Last updated: 2024-03-10</p>
                            </div>
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                    <div className="dashboard-section">
                        <h2>Pending Tasks</h2>
                        <div className="tasks-list">
                            <div className="task-item">
                                <h4>Complete Facility Inspection</h4>
                                <p>Due: 2024-03-25</p>
                            </div>
                            <div className="task-item">
                                <h4>Update Safety Protocols</h4>
                                <p>Due: 2024-03-28</p>
                            </div>
                        </div>
                    </div>
                );
            case 'inspections':
                return (
                    <div className="dashboard-section">
                        <h2>View Inspection Results</h2>
                        {isLoadingInspections ? (
                            <p>Loading inspection results...</p>
                        ) : inspectionEvents.length === 0 ? (
                            <p>No inspection results found for this facility.</p>
                        ) : (
                            <div className="inspections-table-container">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Inspection Date</th>
                                            <th>Status</th>
                                            <th>Inspector</th>
                                            <th>Findings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inspectionEvents.map((event, idx) => {
                                            const getValue = (id) => (event.dataValues || []).find(dv => dv.dataElement === id)?.value || '';
                                            return (
                                                <tr key={event.event || idx}>
                                                    <td>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td>{event.status || 'N/A'}</td>
                                                    <td>{getValue('inspector') || 'N/A'}</td>
                                                    <td>{getValue('findings') || 'N/A'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'payments':
                return (
                    <div className="dashboard-section">
                        <h2>Payment Management</h2>
                        <Card className="mb-4">
                            <Card.Body>
                                <h4 className="mb-4">Payment Methods</h4>
                                <Row className="g-3 mb-4">
                                    <Col md={3}>
                                        <Card className="h-100 text-center p-3">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="img-fluid mb-2" style={{height: '30px'}} />
                                            <Button variant="outline-primary" size="sm">
                                                Select Stripe
                                            </Button>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="h-100 text-center p-3">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="img-fluid mb-2" style={{height: '30px'}} />
                                            <Button variant="outline-primary" size="sm">
                                                Select PayPal
                                            </Button>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="h-100 text-center p-3">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="VISA" className="img-fluid mb-2" style={{height: '20px'}} />
                                            <div className="mt-2"></div>
                                            <Button variant="outline-primary" size="sm">
                                                Select Bank
                                            </Button>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="h-100 text-center p-3">
                                            <div className="mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" className="bi bi-phone" viewBox="0 0 16 16">
                                                    <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                                    <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                                                </svg>
                                            </div>
                                            <Button variant="outline-primary" size="sm">
                                                Mobile Money
                                            </Button>
                                        </Card>
                                    </Col>
                                </Row>
    
                                <h4 className="mb-3">Payment History</h4>
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Amount (BWP)</th>
                                                <th>Method</th>
                                                <th>Status</th>
                                                <th>Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>2023-11-15</td>
                                                <td>Facility Registration</td>
                                                <td>500.00</td>
                                                <td>Mobile Money</td>
                                                <td><span className="badge bg-success">Completed</span></td>
                                                <td><Button variant="link" size="sm">Download</Button></td>
                                            </tr>
                                            <tr>
                                                <td>2023-08-22</td>
                                                <td>License Renewal</td>
                                                <td>1200.00</td>
                                                <td>Bank Transfer</td>
                                                <td><span className="badge bg-success">Completed</span></td>
                                                <td><Button variant="link" size="sm">Download</Button></td>
                                            </tr>
                                            <tr>
                                                <td>2023-05-10</td>
                                                <td>Inspection Fee</td>
                                                <td>750.00</td>
                                                <td>Stripe</td>
                                                <td><span className="badge bg-warning text-dark">Pending</span></td>
                                                <td><Button variant="link" size="sm" disabled>N/A</Button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
            </div>
            <div className="dashboard-main">
                <div className="dashboard-sidebar">
                    <div className="dashboard-sidebar-header">
                        Navigation
                    </div>
                    <button
                        onClick={() => setActiveSection('overview')}
                        className={activeSection === 'overview' ? 'active' : ''}
                    >
                        <House size={18} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveSection('registration')}
                        className={activeSection === 'registration' ? 'active' : ''}
                    >
                        <Building size={18} />
                        Registration & Permission to Establish
                    </button>

                    <button
                        onClick={() => setActiveSection('users')}
                        className={activeSection === 'users' ? 'active' : ''}
                    >
                        <Person size={18} />
                        Users
                    </button>
                    <button
                        onClick={() => setActiveSection('inspections')}
                        className={`${activeSection === 'inspections' ? 'active' : ''} disabled`}
                        disabled
                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        <ClipboardCheck size={18} />
                        View Inspection Results
                    </button>
                    <button
                        onClick={() => setActiveSection('reports')}
                        className={`${activeSection === 'reports' ? 'active' : ''} disabled`}
                        disabled
                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        <FileEarmarkText size={18} />
                        Reports
                    </button>
                    <button
                        onClick={() => setActiveSection('tasks')}
                        className={`${activeSection === 'tasks' ? 'active' : ''} disabled`}
                        disabled
                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                        <ListCheck size={18} />
                        Tasks
                    </button>

                    <Button
                        variant={activeUserTab === 'payments' ? 'primary' : 'light'}
                        className={activeUserTab === 'payments' ? '' : 'text-primary'}
                        onClick={() => setActiveUserTab('payments')}
                    >
                        Payment Methods
                    </Button>



                </div>
                <div className="dashboard-content">
                    {dashboardLoading ? (
                        <div className="dashboard-loading-container">
                            <img src="https://i.stack.imgur.com/hzk6C.gif" alt="Loading..." className="dashboard-loading-gif" />
                            <p>Loading Dashboard...</p>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>
            </div>
            
            {/* Error Snackbar */}
            <Snackbar
                open={showErrorSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowErrorSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setShowErrorSnackbar(false)} 
                    severity="error" 
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Dashboard; 