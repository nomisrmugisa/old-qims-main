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
import {FacilityService, UserService, StorageService} from '../../../../services';
import {DHIS2_PROGRAMS, USER_ROLES} from '../../../../services/constants';
import {extractDataElementValues, findIdByName, findNameById} from '../../../../utils/helpers';
import enrolmentApplicationData from '../../../../data/enrolmentApplicationData.json';

const EnrolmentApplicationReview = () => {
    // State management
    const [applications, setApplications] = useState([]);
    const [listUsers, setListUsers] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState('');
    const [removingApp, setRemovingApp] = useState(null);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('pending');

    const [primaryRoles, setPrimaryRoles] = useState(null);
    const [locumRoles, setLocumRoles] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [roleGroup, setRoleGroup] = useState('primary');
    const [selectedUserData, setSelectedUserData] = useState(null);

    const getFacilityPrimaryRoles = async() => {
        try {
            const response = await FacilityService.listPrimaryFacilityRoles();
            setPrimaryRoles(response);
        }
        catch(err) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: err.message || 'Operation failed. Please try again.',
                type: 'error'
            });
        }
        finally {

        }

    };
    const getFacilityLocumRoles = async() => {
        try {
            const response = await FacilityService.listLocumFacilityRoles();
            setLocumRoles(response);
        }
        catch(err) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: err.message || 'Operation failed. Please try again.',
                type: 'error'
            });
        }
        finally {

        }

    };



    const processApplicationList = async(data) => {
        if(!data)
            return [];

        /*return data.filter(function(item) {
            return typeof item.email !== "undefined";
        });*/
        return data;
    };

    const initApplicationList = async(data) => {
        data = await processApplicationList(data);
        setApplications(data);
        setFilteredApplications(data);
    };

    const getEnrolmentListApplications = async() => {
        setLoading(true);
        try {
            let response = await FacilityService.listEnrolmentRequest(page, filter);
            window.console.log("applicationLists", response);

            setPage(response.page);
            await initApplicationList(response.instances);
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

    const getUserInfo = (app) => {
        let _foundApp = app.dataValues.find(dv => dv.dataElement === DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS.USER_ID.id);
        if(listUsers && _foundApp)
            return listUsers.find(u => u.id === _foundApp.value);

        return null;
    };

    const checkUserRole = async(role_id) => {
        /*const response = await UserService.hasRole(role_id);
        window.console.log("checkUserRole", response);*/

        const data = await StorageService.getUserData();
        const found = data.userRoles.find(r => r.id === role_id);
        return typeof found !== "undefined" && found !== null;
    };

    const getUserName = (app) => {
        const d = getUserInfo(app);
        window.console.log("user data", d);
        /*for(let i=0;i<d.dataValues.length;i++)
            if(d.dataValues[i].dataElement === DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS.USER_NAME.id)
                return d.dataValues[i].value;

        return "Unknown";*/
        return d ? getDataElementValue(d.dataValues, DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS.USER_NAME.id) : "UNKNOWN";
    };

    const getUserEmail = (app) => {
        const d = getUserInfo(app);
        window.console.log("user data", d);
        /*for(let i=0;i<d.dataValues.length;i++)
         if(d.dataValues[i].dataElement === DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS.USER_NAME.id)
         return d.dataValues[i].value;

         return "Unknown";*/
        return d ? getDataElementValue(d.dataValues, DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS.EMAIL.id) : "UNKNOWN";
    };

    const getDataElementValue = (dataElements, key) => {
        for(let i=0;i<dataElements.length;i++)
            if(dataElements[i].dataElement === key)
                return dataElements[i].value;
        return "Unknown";
    };

    // Sample data - in a real app this would come from an API
    useEffect(() => {
        // Simulate API loading
        getEnrolmentListApplications();
        getFacilityPrimaryRoles();
        getFacilityLocumRoles();
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
            setFilteredApplications(applications.filter(app => {

                let _found = app.dataValues.find(dv => dv.dataElement === DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS.STATUS.id);
                return _found?.value.toLowerCase() === statusFilter.toLowerCase();
            }));
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
        //window.console.log(`date: ${dateString}`, new Date(dateString));
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle action buttons
    const handleAction = async (app, action) => {

        try {
            const requestProgramData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS;
            const selectedUserId = getDataElementValue(app.dataValues, requestProgramData.USER_ID.id);
            let data = await UserService.findById(selectedUserId);
            setSelectedUserData(data);
            window.console.log('selectedUser', selectedUserData);
            setSelectedApp(app);
            setActionType(action);
            setShowModal(true);
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

    };

    // Confirm action
    const confirmAction = async () => {
        if (selectedApp && actionType) {

            try {
                let response;
                let successMessageDiff;
                if(actionType === 'approve') {
                    successMessageDiff = "approved";
                    if(!selectedRole || !roleGroup || !selectedRoleId)
                        throw new Error("Please select assigned role.");




                    //Update Enrollment request


                    let found = selectedUserData.userRoles.find(r => r.id === selectedRoleId);
                    if(!found) {

                        let user_roles = selectedUserData.userRoles;
                        user_roles.push({id: selectedRoleId});

                        await UserService.updateUser(selectedUserData.id, {
                            userRoles: user_roles
                        });
                    }
                    else {
                        window.console.log(`user role found`, found);
                    }

                    response = await FacilityService.approveEnrolmentMap({
                        facilityId: selectedApp.orgUnit,
                        userId: selectedUserData.id,
                        type: roleGroup,
                        role: selectedRole,
                    });
                    window.console.log("approveEnrolmentMap", response);

                    response = await FacilityService.closeEnrollmentRequest({
                        id: selectedApp.event,
                        status: actionType,
                        notes: "",
                    });
                    window.console.log("closeEnrollmentRequest", response);


                }
                else if(actionType === 'reject') {
                    successMessageDiff = "rejected";
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
                        message: `Successfully ${successMessageDiff} application #${selectedApp.event}`,
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
    const getStatusBadge = (app) => {

        let _found = app.dataValues.find(dv => dv.dataElement === DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST.DATA_ELEMENTS.STATUS.id);
        let status = _found? _found.value.toLowerCase() : null;
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
                        {/*<div className="d-flex align-items-center">
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
                        </div>*/}
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
                                                    <h5 className="mb-0">{app.orgUnitName}</h5>

                                                    {getStatusBadge(app)}
                                                </div>
                                                <div className="text-muted small mt-1">
                                                    <span className="me-3"><Person className="me-1" /> {getUserName(app)}</span>
                                                    <span><Clock className="me-1" /> {formatDate(app.occurredAt)}</span>
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
                            <h5 className="mb-0">{selectedApp?.orgUnitName}</h5>
                            <h6 className="mb-1">#{selectedApp?.event}</h6>
                            <div className="text-muted small mt-1">
                                <Person className="me-1" /> {selectedApp?.userName} (ID: {selectedApp?.userId})
                            </div>
                        </div>
                    </div>

                    {actionType === 'approve' && (
                        <>
                        <div className="mb-3 mt-2">
                            <label className="form-label">What kind of role do you wish to assign to this user?</label>
                            <div className="btn-group btn-group-sm w-100 mb-2">
                                <Button
                                    variant={roleGroup === 'primary' ? 'primary' : 'outline-primary'}
                                    onClick={() => setRoleGroup('primary')}
                                >
                                    PRIMARY
                                </Button>
                                <Button
                                    variant={roleGroup === 'locum' ? 'primary' : 'outline-primary'}
                                    onClick={() => setRoleGroup('locum')}
                                >
                                    LOCUM
                                </Button>
                            </div>

                            <select
                                className="form-select"
                                /*value={selectedRole}*/
                                onChange={(e) => {
                                    let res = e.target.value.split("__");
                                    if(res && res.length === 2) {
                                        setSelectedRole(res[1]);
                                        setSelectedRoleId(res[0]);
                                    }
                                    //setSelectedRole(e.target.value);

                                }}
                                required
                            >
                                <option value="">Select a role</option>
                                {roleGroup === 'primary' && primaryRoles.map(role => (
                                    <option key={role.id} value={`${role.id}__${role.name}`}>
                                        {role.name}
                                    </option>
                                ))}
                                {roleGroup === 'locum' && locumRoles.map(role => (
                                    <option key={role.id} value={`${role.id}__${role.name}`}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        </>
                    )}

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