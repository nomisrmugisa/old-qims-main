/**
 * Created by fulle on 2025/07/16.
 */
import React, { useState, useEffect } from 'react';
import {
    Container,
    Card,
    ListGroup,
    Button,
    Spinner,
    Modal,
    Badge,
    Pagination
} from 'react-bootstrap';
import {
    Person,
    Building,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    ArrowRight
} from 'react-bootstrap-icons';
import { eventBus, EVENTS } from '../../../../events';
import {FacilityService} from '../../../../services';
import enrolmentApplicationData from '../../../../data/enrolmentApplicationData.json';

const EnrolmentApplicationReview = () => {
    // State management
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState('');
    const [removingApp, setRemovingApp] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');



    const processApplicationList = async(data) => {
        if(!data)
            return [];

        return data.filter(function(item) {
            return typeof item.email !== "undefined";
        });
    };

    const initApplicationList = async(data) => {
        data = await processApplicationList(data);
        setApplications(data);
        setFilteredApplications(data);
    };

    const getEnrolmentListApplications = async() => {
        setLoading(true);
        try {
            const response = await FacilityService.listEnrolmentRequest();
            window.console.log("applicationLists", response);
            await initApplicationList(response);
        }
        catch(err) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: err.message || 'Operation failed. Please try again.',
                type: 'error'
            });
        }
        finally {

            setLoading(false);
        }
    };

    // Sample data - in a real app this would come from an API
    useEffect(() => {
        // Simulate API loading
        getEnrolmentListApplications();
        /*setTimeout(() => {
            setApplications(enrolmentApplicationData);
            setFilteredApplications(enrolmentApplicationData);
            setLoading(false);
        }, 1000);*/
    }, []);

    // Filter applications by status
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredApplications(applications);
        } else {
            setFilteredApplications(applications.filter(app => app.status === statusFilter));
        }
        setCurrentPage(1);
    }, [statusFilter, applications]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle action buttons
    const handleAction = (app, action) => {
        setSelectedApp(app);
        setActionType(action);
        setShowModal(true);
    };

    // Confirm action
    const confirmAction = async () => {
        if (selectedApp && actionType) {

            try {
                let response;
                if(actionType === 'approve') {
                    response = await FacilityService.approveEnrolmentRequest(app);

                }
                else if(actionType === 'reject') {
                    response = await FacilityService.rejectEnrolmentRequest(app);
                }
                window.console.log(`${actionType}: response: `, response);
                // Set the app to removing state for animation
                setRemovingApp(selectedApp.id);

                // Simulate API call
                setTimeout(() => {
                    // Remove application from the list
                    setApplications(prev => prev.filter(app => app.id !== selectedApp.id));
                    setRemovingApp(null);
                    setShowModal(false);

                    eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                        title: 'Success',
                        message: `Successfully submitted`,
                        type: 'success'
                    });
                }, 500);
            }
            catch(error) {
                eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                    title: 'Error',
                    message: error.message || 'Operation failed. Please try again.',
                    type: 'error'
                });
            }
            finally {

            }

        }
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedApp(null);
    };

    // Status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge bg="warning" className="ms-2">Pending</Badge>;
            case 'approved':
                return <Badge bg="success" className="ms-2">Approved</Badge>;
            case 'rejected':
                return <Badge bg="danger" className="ms-2">Rejected</Badge>;
            default:
                return <Badge bg="info" className="ms-2">Pending</Badge>;
        }
    };

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Facility Enrollment Applications</h3>
                        <div className="d-flex align-items-center">
                            <span className="me-2">Filter:</span>
                            <select
                                className="form-select w-auto"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Applications</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">Loading applications...</p>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="mb-3">
                                <CheckCircle size={48} className="text-success" />
                            </div>
                            <h4>No applications found</h4>
                            <p className="text-muted">All applications have been processed</p>
                        </div>
                    ) : (
                        <>
                        <ListGroup variant="flush">
                            {currentApplications.map((app) => (
                                <>
                                <ListGroup.Item
                                    key={app.id}
                                    className={`py-3 px-4 ${removingApp === app.id ? 'slide-out' : ''}`}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                                                <Building size={24} />
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <h5 className="mb-0">{app.organisationUnits[0].name}</h5>

                                                    {getStatusBadge(app.status)}
                                                </div>
                                                <div className="text-muted small mt-1">
                                                    {app.username !== app.email && (
                                                        <div className="mb-2">
                                                            <h6 className="mb-1">#{app.username}</h6>
                                                        </div>
                                                    )}
                                                    <span className="me-3"><Person className="me-1" /> {app.email}</span>
                                                    <span><Clock className="me-1" /> {formatDate(app.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                variant="outline-success"
                                                className="me-2"
                                                size="sm"
                                                onClick={() => handleAction(app, 'approve')}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleAction(app, 'reject')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                                {/*<ListGroup.Item
                                    key={app.id}
                                    className={`py-3 px-4 ${removingApp === app.id ? 'slide-out' : ''}`}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                                                <Building size={24} />
                                            </div>
                                            <div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <h5 className="mb-0">{app.facilityName}</h5>

                                                    {getStatusBadge(app.status)}
                                                </div>
                                                <div className="text-muted small mt-1">
                                                    <div className="mb-2">
                                                        <h6 className="mb-1">#{app.id}</h6>
                                                    </div>
                                                    <span className="me-3"><Person className="me-1" /> {app.userName} (ID: {app.userId})</span>
                                                    <span><Clock className="me-1" /> {formatDate(app.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                variant="outline-success"
                                                className="me-2"
                                                size="sm"
                                                onClick={() => handleAction(app, 'approve')}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleAction(app, 'reject')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </ListGroup.Item>*/}
                                </>
                            ))}
                        </ListGroup>

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <Pagination>
                                    <Pagination.Prev
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    >
                                        <ArrowLeft size={16} />
                                    </Pagination.Prev>

                                    {[...Array(totalPages).keys()].map(num => (
                                        <Pagination.Item
                                            key={num + 1}
                                            active={num + 1 === currentPage}
                                            onClick={() => setCurrentPage(num + 1)}
                                        >
                                            {num + 1}
                                        </Pagination.Item>
                                    ))}

                                    <Pagination.Next
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    >
                                        <ArrowRight size={16} />
                                    </Pagination.Next>
                                </Pagination>
                            </div>
                        )}
                        </>
                    )}
                </Card.Body>

                <Card.Footer className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Showing {Math.min(indexOfFirstItem + 1, filteredApplications.length)} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} applications
                        </div>
                        <div>
                            <Badge bg="light" text="dark" className="me-2">
                                Pending: {applications.filter(app => app.status === 'pending').length}
                            </Badge>
                            <Badge bg="light" text="dark">
                                Processed: {applications.filter(app => app.status !== 'pending').length}
                            </Badge>
                        </div>
                    </div>
                </Card.Footer>
            </Card>

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex mb-3">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                            <Building size={24} />
                        </div>
                        <div>
                            <h5 className="mb-0">#{selectedApp?.id} - {selectedApp?.facilityName}</h5>
                            <div className="text-muted small mt-1">
                                <Person className="me-1" /> {selectedApp?.userName} (ID: {selectedApp?.userId})
                            </div>
                        </div>
                    </div>

                    <p>
                        Are you sure you want to <strong className={actionType === 'approve' ? 'text-success' : 'text-danger'}>
                        {actionType === 'approve' ? 'approve' : 'reject'}</strong> this application?
                    </p>

                    <div className="alert alert-warning mb-0">
                        This action cannot be undone. The application will be removed from the list.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button
                        variant={actionType === 'approve' ? 'success' : 'danger'}
                        onClick={confirmAction}
                    >
                        {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default EnrolmentApplicationReview;