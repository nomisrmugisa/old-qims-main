import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import RegistrationDetails from './RegistrationDetails';

const Dashboard = ({ activeSection, setActiveSection }) => {
    console.log("🔍 DASHBOARD COMPONENT RENDERING - THIS SHOULD APPEAR EVERY TIME THE COMPONENT RENDERS");
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [trackedEntityInstanceId, setTrackedEntityInstanceId] = useState(null);
    const [showFacilityReviewDialog, setShowFacilityReviewDialog] = useState(false);

    const fetchTrackedEntityInstance = async () => {
        const credentials = localStorage.getItem('userCredentials');
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
            console.log('📡 === API CALL DETAILS ===');
            console.log('- HTTP Method: GET');
            console.log('- Base URL:', baseUrl);
            console.log('- Endpoint:', endpoint);
            console.log('- Parameters:');
            console.log('  • ou (Organization Unit):', userOrgUnitId);
            console.log('  • ouMode:', 'SELECTED');
            console.log('  • program:', 'EE8yeLVo6cN');
            console.log('  • fields:', 'trackedEntityInstance');
            console.log('  • paging:', 'false');
            console.log('- Full URL:', url);
            console.log('- Headers:');
            console.log('  • Authorization: Basic [credentials]');
            console.log('- Request started at:', new Date().toISOString());
            
            // Make the API call
            const startTime = performance.now();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            });
            const endTime = performance.now();
            
            // Log the response details
            console.log('📥 === API RESPONSE DETAILS ===');
            console.log('- Response received in:', Math.round(endTime - startTime), 'ms');
            console.log('- Response status:', response.status, response.statusText);
            console.log('- Response OK:', response.ok);
            console.log('- Response headers:');
            response.headers.forEach((value, name) => {
                console.log(`  • ${name}: ${value}`);
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('- Response data:', data);
            console.log('- Has trackedEntityInstances:', Boolean(data.trackedEntityInstances));
            console.log('- Number of instances:', data.trackedEntityInstances?.length || 0);

            if (data.trackedEntityInstances && data.trackedEntityInstances.length > 0) {
                const instance = data.trackedEntityInstances[0];
                console.log('- Found trackedEntityInstance:', instance.trackedEntityInstance);
                setTrackedEntityInstanceId(instance.trackedEntityInstance);
            } else {
                // Handle case where no tracked entity instance is found
                // This might indicate a fresh registration or an issue.
                // For now, set to null and allow the child components to handle
                console.log('- No tracked entity instances found - user needs to complete registration first');
                setTrackedEntityInstanceId(null);
                // Don't set showFacilityReviewDialog to true here, let the component handle it
            }
        } catch (error) {
            console.error("- Error fetching tracked entity instance:", error);
            console.error("- Error name:", error.name);
            console.error("- Error message:", error.message);
            console.error("- Error stack:", error.stack);
            setTrackedEntityInstanceId(null); // Ensure TEI is null on error
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

    useEffect(() => {
        console.log("🚀 DASHBOARD COMPONENT MOUNTED - THIS SHOULD ALWAYS APPEAR");
        console.log("=== DASHBOARD COMPONENT MOUNTED ===");
        
        // Check for temporary tracked entity instance ID from tab click
        const tempTrackedEntityInstanceId = localStorage.getItem('tempTrackedEntityInstanceId');
        if (tempTrackedEntityInstanceId) {
            console.log("📌 Found temporary trackedEntityInstanceId:", tempTrackedEntityInstanceId);
            console.log("- Using this instead of fetching");
            setTrackedEntityInstanceId(tempTrackedEntityInstanceId);
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
                const credentials = localStorage.getItem('userCredentials');
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

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="dashboard-section">
                        <h2>Welcome to Your Dashboard</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Active Inspections</h3>
                                <p className="stat-number">3</p>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Tasks</h3>
                                <p className="stat-number">5</p>
                            </div>
                            <div className="stat-card">
                                <h3>Completed Reports</h3>
                                <p className="stat-number">12</p>
                            </div>
                            <div className="stat-card">
                                <h3>Upcoming Deadlines</h3>
                                <p className="stat-number">2</p>
                            </div>
                        </div>
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
                        <h2>Facility Inspections</h2>
                        <div className="inspections-container">
                            <div className="inspections-actions">
                                <button className="action-button">New Inspection</button>
                                <button className="action-button">Schedule Inspection</button>
                                <button className="action-button">Download Report</button>
                            </div>
                            <div className="inspections-table-container">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Inspection Date</th>
                                            <th>Facility Name</th>
                                            <th>Inspector</th>
                                            <th>Status</th>
                                            <th>Findings</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>2024-03-20</td>
                                            <td>Central Clinic</td>
                                            <td>John Doe</td>
                                            <td><span className="status-badge completed">Completed</span></td>
                                            <td>Minor non-compliance</td>
                                            <td>
                                                <button className="btn-view">View</button>
                                                <button className="btn-edit">Edit</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>2024-03-22</td>
                                            <td>City Hospital</td>
                                            <td>Jane Smith</td>
                                            <td><span className="status-badge pending">Pending</span></td>
                                            <td>N/A</td>
                                            <td>
                                                <button className="btn-view">View</button>
                                                <button className="btn-edit">Edit</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>2024-03-25</td>
                                            <td>Rural Health Post</td>
                                            <td>Peter Jones</td>
                                            <td><span className="status-badge scheduled">Scheduled</span></td>
                                            <td>Pending</td>
                                            <td>
                                                <button className="btn-view">View</button>
                                                <button className="btn-cancel">Cancel</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveSection('registration')}
                        className={activeSection === 'registration' ? 'active' : ''}
                    >
                        Complete Registration
                    </button>
                    <button
                        onClick={() => setActiveSection('inspections')}
                        className={activeSection === 'inspections' ? 'active' : ''}
                    >
                        View Inspections
                    </button>
                    <button
                        onClick={() => setActiveSection('reports')}
                        className={activeSection === 'reports' ? 'active' : ''}
                    >
                        Reports
                    </button>
                    <button
                        onClick={() => setActiveSection('tasks')}
                        className={activeSection === 'tasks' ? 'active' : ''}
                    >
                        Tasks
                    </button>
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
        </div>
    );
};

export default Dashboard; 