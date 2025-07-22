/**
 * Created by fulle on 2025/07/11.
 */
import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Tab,
    Tabs,
    Badge,
    ListGroup
} from 'react-bootstrap';
import {
    PlusCircle,
    ClipboardCheck,
    Bell,
    Person,
    Key,
    Building
} from 'react-bootstrap-icons';
import DashboardLayout from '../../../Layouts/Dashboard';
import FacilityCard from '../../../Facility/Card';
import NotificationCenter from '../../NotificationCenter';
import EnrolmentBasic from '../../../Enrolment/Basic';
import ProfileEditor from '../../../User/ProfileEditor';
import PasswordChanger from '../../../User/PasswordChanger';
import StorageService from '../../../../services/storage.service';
import UserService from '../../../../services/user.service';

/** Add this to the top or in a relevant CSS file:
.overview-card {
  transition: box-shadow 0.2s, background 0.2s, transform 0.2s;
  cursor: pointer;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 1.5rem;
  padding: 0.5rem 0.5rem;
}
.overview-card:hover {
  background: #f0f6ff;
  box-shadow: 0 4px 16px rgba(25,119,204,0.12);
  transform: translateY(-2px) scale(0.97);
}
*/

const FacilityUserDashboard = () => {
    const [facilities, setFacilities] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const getUserData = async() => {
        const userData = await StorageService.getUserData();
    };

    const loadUserList = async() => {
        const data = await UserService.listFacilityUsers();
        window.console.log("loadFacilityUserList", data);
    };

    // Load initial data
    useEffect(() => {
        // Simulate API calls
        const loadData = async () => {
            // Load facilities
            const facilitiesData = [
                {
                    id: 1,
                    name: 'Main Hospital',
                    address: '123 Medical Dr, City',
                    contactName: 'Dr. Sarah Johnson',
                    contactEmail: 's.johnson@hospital.org',
                    assignedDate: '2023-01-15',
                    inspections: [
                        { id: 1, date: '2023-06-15', type: 'Routine', status: 'scheduled' },
                        { id: 2, date: '2023-09-22', type: 'Compliance', status: 'pending' }
                    ]
                },
                {
                    id: 2,
                    name: 'Downtown Clinic',
                    address: '456 Health St, City',
                    contactName: 'Nurse Mark Williams',
                    contactEmail: 'markw@clinic.org',
                    assignedDate: '2023-03-10',
                    inspections: [
                        { id: 3, date: '2023-07-05', type: 'Emergency', status: 'scheduled' }
                    ]
                }
            ];
            setFacilities(facilitiesData);

            // Load notifications
            const notificationsData = [
                { id: 1, title: 'Self Assessment Scheduled', message: 'Main Hospital self assessment scheduled for June 15', date: '2 hours ago', read: false },
                { id: 2, title: 'License Renewal', message: 'Your license renewal is due in 30 days', date: '1 day ago', read: false },
                { id: 3, title: 'New Facility', message: 'You have been assigned to Northside Medical', date: '3 days ago', read: true }
            ];
            setNotifications(notificationsData);
            setUnreadCount(notificationsData.filter(n => !n.read).length);
        };


        loadData();
        loadUserList();
    }, []);

    const handleFacilityUpdate = (updatedFacility) => {
        setFacilities(facilities.map(f =>
            f.id === updatedFacility.id ? updatedFacility : f
        ));
    };

    const markNotificationRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(unreadCount - 1);
    };

    return (
        <DashboardLayout>
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                id="dashboard-tabs"
                className="mb-4"
            >
                <Tab eventKey="overview" title={
                    <span>
            <ClipboardCheck className="me-1" /> Overview
          </span>
                }>
                    <Card className="mb-4">
                        <Card.Body>
                            <Row className="g-4">
                                <Col md={6}>
                                    <Card className="overview-card">
                                        <Card.Body className="text-center py-5">
                                            <Building size={48} className="text-primary mb-3" />
                                            <Card.Title>Register New Facility</Card.Title>
                                            <Card.Text className="text-muted mb-4">
                                                Start the registration process for a new healthcare facility
                                            </Card.Text>
                                            <Button variant="primary">Begin Registration</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card className="overview-card">
                                        <Card.Body className="text-center py-5">
                                            <ClipboardCheck size={48} className="text-success mb-3" />
                                            <Card.Title>Enrol with a Facility</Card.Title>
                                            <Card.Text className="text-muted mb-4">
                                                Enrol with an existing facility
                                            </Card.Text>
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => setActiveTab('enrolment')}
                                            >
                                                <PlusCircle className="me-1" /> Enroll in New Facility
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col md={6}>
                                    <Card className="overview-card">
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

                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>


                <Tab eventKey="facilities" title={
                    <span>
            <Building className="me-1" /> Facilities
          </span>
                }>


                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Your Assigned Facilities</h2>
                        <Button variant="primary" size="sm">
                            <PlusCircle className="me-1" /> View All
                        </Button>
                    </div>

                    <Row xs={1} md={2} lg={3} className="g-4">
                        {facilities.map(facility => (
                            <Col key={facility.id}>
                                <FacilityCard
                                    facility={facility}
                                    onUpdate={handleFacilityUpdate}
                                />
                            </Col>
                        ))}

                        {facilities.length < 3 && (
                            <Col>
                                <Card className="h-100 text-center bg-light">
                                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                        <div className="text-muted mb-3">You have capacity for {3 - facilities.length} more facilities</div>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => setActiveTab('enrolment')}
                                        >
                                            <PlusCircle className="me-1" /> Enroll in New Facility
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Tab>

                <Tab eventKey="notifications" title={
                    <span>
            <Bell className="me-1" /> Notifications
                        {unreadCount > 0 && (
                            <Badge bg="danger" className="ms-1">{unreadCount}</Badge>
                        )}
          </span>
                }>
                    <NotificationCenter
                        notifications={notifications}
                        onMarkRead={markNotificationRead}
                    />
                </Tab>

                <Tab eventKey="profile" title={
                    <span>
            <Person className="me-1" /> Profile
          </span>
                }>
                    <ProfileEditor />
                </Tab>

                <Tab eventKey="password" title={
                    <span>
            <Key className="me-1" /> Password
          </span>
                }>
                    <PasswordChanger />
                </Tab>



                <Tab eventKey="enrolment" title={
                    <span>
            <PlusCircle className="me-1" /> Enrolment
          </span>
                }>
                    <EnrolmentBasic />
                </Tab>
            </Tabs>
        </DashboardLayout>
    );
};

export default FacilityUserDashboard;