/**
 * Created by fulle on 2025/07/24.
 */
import React, { useState, useEffect } from 'react';
import {
    Card,
    Container,
    Row,
    Col,
    Badge,
    Spinner,
    Alert,
    Button,
    Form,
    FormCheck,
} from 'react-bootstrap';
import {
    Building,
    Person,
    CheckCircle,
    PencilSquare,
    Clock,
    GeoAlt,
    Telephone,
    CardChecklist,
    XCircle,
    ArrowRight,
    ArrowLeft
} from 'react-bootstrap-icons';
import {FacilityService, StorageService} from '../../../../services';
import { eventBus, EVENTS } from '../../../../events';
import './index.css';

// Mock API service - replace with real API calls in production
const mockRegistrationService = {
    getRegistrationStatus: (status) => {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {

                if (status) {
                    resolve({
                        exists: true,
                        editable: Math.random() > 0.5, // 50% chance editable
                        data: {
                            id: 'reg-12345',
                            submittedAt: new Date().toISOString(),
                            referenceNumber: 'FAC-2023-12345',
                            facility: {
                                name: 'City Health Clinic',
                                location: {
                                    district: { id: 'd1', name: 'Johannesburg' },
                                    town: { id: 't1', name: 'Sandton' },
                                    ward: { id: 'w1', name: 'Ward 123' }
                                },
                                type: 'Private Clinic'
                            },
                            applicant: {
                                firstName: 'John',
                                surname: 'Doe',
                                email: 'john.doe@example.com',
                                licenseNumber: 'BHPC-12345',
                                practiceNumber: 'PPN-67890',
                                contactNumber: '0712345678'
                            }
                        }
                    });
                } else {
                    resolve({ exists: false, editable: true });
                }
            }, 1000);
        });
    },

    submitRegistration: (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        ...data,
                        id: 'reg-' + Math.floor(Math.random() * 10000),
                        submittedAt: new Date().toISOString(),
                        referenceNumber: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
                        editable: false
                    }
                });
            }, 1500);
        });
    },

    updateRegistration: (id, data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: {
                        ...data,
                        id,
                        submittedAt: new Date().toISOString(),
                        editable: false
                    }
                });
            }, 1500);
        });
    },

    getLocationData: (type, parentId) => {
        // Mock location data
        const districts = [
            { id: 'd1', name: 'Johannesburg' },
            { id: 'd2', name: 'Tshwane' },
            { id: 'd3', name: 'Cape Town' },
            { id: 'd4', name: 'eThekwini' }
        ];

        const towns = {
            d1: [
                { id: 't1', name: 'Sandton' },
                { id: 't2', name: 'Randburg' },
                { id: 't3', name: 'Roodepoort' }
            ],
            d2: [
                { id: 't4', name: 'Pretoria Central' },
                { id: 't5', name: 'Centurion' }
            ],
            d3: [
                { id: 't6', name: 'City Bowl' },
                { id: 't7', name: 'Atlantic Seaboard' }
            ],
            d4: [
                { id: 't8', name: 'Durban Central' },
                { id: 't9', name: 'Umhlanga' }
            ]
        };

        const wards = {
            t1: [
                { id: 'w1', name: 'Ward 101' },
                { id: 'w2', name: 'Ward 102' }
            ],
            t2: [
                { id: 'w3', name: 'Ward 103' }
            ],
            t4: [
                { id: 'w4', name: 'Ward 201' }
            ],
            t6: [
                { id: 'w5', name: 'Ward 301' }
            ],
            t8: [
                { id: 'w6', name: 'Ward 401' }
            ]
        };

        return new Promise((resolve) => {
            setTimeout(() => {
                if (type === 'districts') {
                    resolve(districts);
                } else if (type === 'towns') {
                    resolve(towns[parentId] || []);
                } else if (type === 'wards') {
                    resolve(wards[parentId] || []);
                }
            }, 500);
        });
    }
};
const FacilityRegistrationInitiation = () => {
    const [registrationStatus, setRegistrationStatus] = useState({
        loading: true,
        exists: false,
        editable: false,
        data: null,
        error: null
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userData, setUserData] = useState(null);

    const getAuthUser = async() => {
        const data = await StorageService.getUserData();
        setUserData(data);
    };
    // Fetch registration status on component mount
    useEffect(() => {
        const fetchRegistrationStatus = async () => {
            try {
                await getAuthUser();
                const response = await mockRegistrationService.getRegistrationStatus();

                setRegistrationStatus({
                    loading: false,
                    exists: response.exists,
                    editable: response.editable,
                    data: response.data || null,
                    error: null
                });

                // If registration exists and is editable, allow editing
                if (response.exists && response.editable) {
                    setIsEditing(true);
                } else if (!response.exists) {
                    // If no registration exists, show empty form
                    setIsEditing(true);
                }
            } catch (error) {
                setRegistrationStatus({
                    loading: false,
                    exists: false,
                    editable: false,
                    data: null,
                    error: error.message || 'Failed to load registration data'
                });
            }
        };

        fetchRegistrationStatus();
    }, []);

    const handleSubmitSuccess = (responseData) => {
        setRegistrationStatus({
            loading: false,
            exists: true,
            editable: responseData.editable,
            data: responseData,
            error: null
        });

        setIsEditing(false);

        eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
            title: 'Success',
            message: registrationStatus.exists
                ? 'Registration updated successfully'
                : 'Registration submitted successfully',
            type: 'success'
        });
    };

    const handleSubmitFailure = (error) => {
        eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
            title: 'Submission Failed',
            message: error.message || 'Please try again later',
            type: 'error'
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            setIsSubmitting(true);

            let response;
            if (registrationStatus.exists) {
                response = await mockRegistrationService.updateRegistration(
                    registrationStatus.data.id,
                    formData
                );
            } else {
                response = await mockRegistrationService.submitRegistration(formData);
            }

            if (response.success) {
                handleSubmitSuccess(response.data);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            handleSubmitFailure(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (registrationStatus.loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <span className="ms-3">Checking registration status...</span>
            </Container>
        );
    }

    if (registrationStatus.error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <div className="d-flex align-items-center">
                        <XCircle size={24} className="me-2" />
                        <h4 className="mb-0">Error Loading Registration</h4>
                    </div>
                    <p className="mt-3">{registrationStatus.error}</p>
                    <Button
                        variant="outline-danger"
                        onClick={() => window.location.reload()}
                        className="mt-2"
                    >
                        Retry
                    </Button>
                </Alert>
            </Container>
        );
    }

    // Show read-only view if registration exists and is not being edited
    if (registrationStatus.exists && !isEditing) {
        return (
            <RegistrationSummary
                user={userData}
                data={registrationStatus.data}
                editable={registrationStatus.editable}
                onEdit={() => setIsEditing(true)}
            />
        );
    }

    // Show form in edit mode
    return (
        <FacilityRegistrationForm
            user={userData}
            initialData={registrationStatus.exists ? registrationStatus.data : null}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setIsEditing(false)}
        />
    );
};

// Read-only summary component
const RegistrationSummary = ({ user, data, editable, onEdit }) => {
    return (
        <Container className="py-4">
            <Card className="shadow-sm border-success">
                <Card.Header className="bg-success text-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">Facility Registration Submitted</h2>
                            <p className="mb-0">Your registration has been received and is being processed</p>
                        </div>
                        <Badge bg="light" text="success" className="fs-6 py-2">
                            <CheckCircle className="me-1" /> Submitted
                        </Badge>
                    </div>
                </Card.Header>

                <Card.Body>
                    <div className="mb-4">
                        <h3 className="d-flex align-items-center mb-4">
                            <Building className="me-2 text-muted" size={24} />
                            <span>Facility Information</span>
                        </h3>

                        <Row className="mb-3 text-start">
                            <Col md={3} className="text-muted">Facility Name</Col>
                            <Col md={9} className="fw-medium">{data.facility.name}</Col>
                        </Row>

                        <Row className="mb-3 text-start">
                            <Col md={3} className="text-muted">Location</Col>
                            <Col md={9} className="fw-medium">
                                {data.facility.location.district.displayName}, {data.facility.location.town.displayName}
                                {data.facility.location.ward && `, ${data.facility.location.ward.displayName}`}
                            </Col>
                        </Row>

                        {/*<Row className="mb-3 text-start">
                            <Col md={3} className="text-muted">Type</Col>
                            <Col md={9} className="fw-medium">{data.facility.type}</Col>
                        </Row>*/}
                    </div>

                    <div className="mb-4 pt-3 border-top">
                        <h3 className="d-flex align-items-center mb-4">
                            <Person className="me-2 text-muted" size={24} />
                            <span>Applicant Information</span>
                        </h3>

                        <Row className="mb-3 text-start">
                            <Col md={3} className="text-muted">Name</Col>
                            <Col md={9} className="fw-medium">
                                {user.firstName} {user.surname}
                            </Col>
                        </Row>

                        <Row className="mb-3 text-start">
                            <Col md={3} className="text-muted">Email</Col>
                            <Col md={9} className="fw-medium">{user.email}</Col>
                        </Row>

                        <Row className="mb-3 text-start">
                            <Col md={3} className="text-muted">Contact Number</Col>
                            <Col md={9} className="fw-medium">
                                <Telephone className="me-2 text-muted" size={16} />
                                {data.applicant.contactNumber}
                            </Col>
                        </Row>

                        <Row className="mb-3 text-start">
                            <Col md={3} className="text-muted">License Number</Col>
                            <Col md={9} className="fw-medium">
                                <CardChecklist className="me-2 text-muted" size={16} />
                                {data.applicant.licenseNumber}
                            </Col>
                        </Row>

                        {data.applicant.practiceNumber && (
                            <Row className="mb-3 text-start">
                                <Col md={3} className="text-muted">Practice Number</Col>
                                <Col md={9} className="fw-medium">{data.applicant.practiceNumber}</Col>
                            </Row>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-top text-start">
                        <Row>
                            <Col md={3} className="text-muted">Submitted On</Col>
                            <Col md={9} className="d-flex align-items-center">
                                <Clock className="me-2 text-muted" size={16} />
                                <span className="fw-medium">
                  {new Date(data.submittedAt).toLocaleString()}
                </span>
                            </Col>
                        </Row>

                        {data.referenceNumber && (
                            <Row className="mt-2">
                                <Col md={3} className="text-muted">Reference Number</Col>
                                <Col md={9} className="fw-medium text-primary">
                                    {data.referenceNumber}
                                </Col>
                            </Row>
                        )}
                    </div>
                </Card.Body>

                <Card.Footer className={`${editable ? 'bg-light' : 'bg-white'} py-3`}>
                    {editable ? (
                        <div className="d-flex justify-content-between align-items-center">
                            <p className="mb-0 text-muted">
                                <small>
                                    You can update your registration information before it's approved.
                                </small>
                            </p>
                            <Button
                                variant="outline-primary"
                                onClick={onEdit}
                            >
                                <PencilSquare className="me-1" /> Edit Registration
                            </Button>
                        </div>
                    ) : (
                        <p className="mb-0 text-muted">
                            <small>
                                Your registration is currently being reviewed. You'll be notified once your
                                facility has been approved. Contact support if you need to update your information.
                            </small>
                        </p>
                    )}
                </Card.Footer>
            </Card>
        </Container>
    );
};


const FacilityRegistrationForm = ({
                                      user,
                                      initialData,
                                      onSubmit,
                                      isSubmitting,
                                      onCancel
                                  }) => {
    const [formData, setFormData] = useState(
        initialData || {
            facility: {
                name: '',
                location: {
                    district: { id: '', displayName: '' },
                    town: { id: '', displayName: '' },
                    ward: { id: '', displayName: '' }
                },
                type: ''
            },
            applicant: {
                licenseNumber: '',
                practiceNumber: '',
                contactNumber: '',
                firstName: user.firstName,
                surname: user.surname,
                email: user.email
            },
            agreedToTerms: false
        }
    );

    const [districts, setDistricts] = useState([]);
    const [towns, setTowns] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState({
        districts: false,
        towns: false,
        wards: false
    });
    const [error, setError] = useState(null);
    const [validated, setValidated] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [stepValidated, setStepValidated] = useState(false);

    // Initialize with user data
    useEffect(() => {
        // In a real app, this would come from authentication context
        setFormData(prev => ({
            ...prev,
            applicant: {
                ...prev.applicant,
                firstName: user.firstName, // Pre-filled with current user
                surname: user.surname,   // Pre-filled with current user
                email: user.email // Pre-filled with current user
            }
        }));

        // Fetch initial districts
        fetchDistricts();
    }, []);

    // Fetch districts
    const fetchDistricts = async () => {
        setLoading(prev => ({ ...prev, districts: true }));
        setError(null);

        try {
            const response = await FacilityService.getDistrictOrganisationUnits();
            window.console.log("got districts", response);
            setDistricts(response);

            // If initial data exists, set the district
            if (initialData?.facility.location.district.id) {
                handleDistrictChange(initialData.facility.location.district.id);
            }
        } catch (err) {
            setError('Failed to load districts. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, districts: false }));
        }
    };

    // Handle district change
    const handleDistrictChange = async (districtId) => {
        setFormData(prev => ({
            ...prev,
            facility: {
                ...prev.facility,
                location: {
                    district: districts.find(d => d.id === districtId) || { id: '', displayName: '' },
                    town: { id: '', displayName: '' },
                    ward: { id: '', displayName: '' }
                }
            }
        }));

        if (districtId) {
            setLoading(prev => ({ ...prev, towns: true }));
            try {

                /*const data = await mockRegistrationService.getLocationData('towns', districtId);
                setTowns(data);*/
                const response = await FacilityService.getOrganisationUnitsByParentId(districtId);
                setTowns(response);

                setWards([]);

                // If initial data exists, set the town
                if (initialData?.facility.location.town.id && data.some(t => t.id === initialData.facility.location.town.id)) {
                    handleTownChange(initialData.facility.location.town.id);
                }
            } catch (err) {
                setError('Failed to load towns. Please try again.');
            } finally {
                setLoading(prev => ({ ...prev, towns: false }));
            }
        } else {
            setTowns([]);
            setWards([]);
        }
    };

    // Handle town change
    const handleTownChange = async (townId) => {
        setFormData(prev => ({
            ...prev,
            facility: {
                ...prev.facility,
                location: {
                    ...prev.facility.location,
                    town: towns.find(t => t.id === townId) || { id: '', displayName: '' },
                    ward: { id: '', displayName: '' }
                }
            }
        }));

        if (townId) {
            setLoading(prev => ({ ...prev, wards: true }));
            try {
                const response = await FacilityService.getOrganisationUnitsByParentId(townId);
                setWards(response);
                /*const data = await mockRegistrationService.getLocationData('wards', townId);
                setWards(data);*/

                // If initial data exists, set the ward
                if (initialData?.facility.location.ward.id && data.some(w => w.id === initialData.facility.location.ward.id)) {
                    setFormData(prev => ({
                        ...prev,
                        facility: {
                            ...prev.facility,
                            location: {
                                ...prev.facility.location,
                                ward: data.find(w => w.id === initialData.facility.location.ward.id) || { id: '', displayName: '' }
                            }
                        }
                    }));
                }
            } catch (err) {
                setError('Failed to load wards. Some locations may not have wards.');
            } finally {
                setLoading(prev => ({ ...prev, wards: false }));
            }
        } else {
            setWards([]);
        }
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const [section, field] = name.split('.');

        if (section === 'agreedToTerms') {
            setFormData(prev => ({ ...prev, [section]: checked }));
        } else {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        }
    };

    // Validate current step
    const validateStep = () => {
        switch (currentStep) {
            case 1:
                return formData.facility.name &&
                    formData.facility.location.district.id &&
                    formData.facility.location.town.id;
            case 2:
                return formData.applicant.licenseNumber &&
                    formData.applicant.contactNumber;
            case 3:
                return formData.agreedToTerms;
            default:
                return false;
        }
    };

    // Handle step navigation
    const handleNextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            setStepValidated(false);
        } else {
            setStepValidated(true);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agreedToTerms) {
            setStepValidated(true);
            return;
        }

        onSubmit(formData);
    };

    // Step 1: Facility Information
    const renderStep1 = () => (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary rounded-circle p-2 me-3">
                    <Building size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="mb-0">Facility Information</h3>
                    <p className="text-muted mb-0">Provide details about your healthcare facility</p>
                </div>
            </div>

            <Row className="g-3 text-start">
                <Col md={12}>
                    <Form.Group controlId="facilityName" className="mb-4">
                        <Form.Label className="fw-small small text-muted">Facility Name</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter facility name"
                            name="facility.name"
                            value={formData.facility.name}
                            onChange={handleChange}
                            isInvalid={stepValidated && !formData.facility.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a facility name
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {/* District Selector */}
                <Col md={4}>
                    <Form.Group controlId="district" className="mb-4">
                        <Form.Label className="fw-small small text-muted">District</Form.Label>
                        <Form.Select
                            required
                            value={formData.facility.location.district.id}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            disabled={loading.districts}
                            isInvalid={stepValidated && !formData.facility.location.district.id}
                        >
                            <option value="">Select District</option>
                            {districts.map(district => (
                                <option key={district.id} value={district.id}>
                                    {district.displayName}
                                </option>
                            ))}
                        </Form.Select>
                        {loading.districts && (
                            <div className="mt-2">
                                <Spinner size="sm" animation="border" /> Loading districts...
                            </div>
                        )}
                        <Form.Control.Feedback type="invalid">
                            Please select a district
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {/* Town/Village Selector */}
                <Col md={4}>
                    <Form.Group controlId="town" className="mb-4">
                        <Form.Label className="fw-small small text-muted">Town/Village</Form.Label>
                        <Form.Select
                            required
                            disabled={!formData.facility.location.district.id || loading.towns}
                            value={formData.facility.location.town.id}
                            onChange={(e) => handleTownChange(e.target.value)}
                            isInvalid={stepValidated && !formData.facility.location.town.id}
                        >
                            <option value="">Select Town/Village</option>
                            {towns.map(town => (
                                <option key={town.id} value={town.id}>
                                    {town.displayName}
                                </option>
                            ))}
                        </Form.Select>
                        {loading.towns && (
                            <div className="mt-2">
                                <Spinner size="sm" animation="border" /> Loading towns...
                            </div>
                        )}
                        <Form.Control.Feedback type="invalid">
                            Please select a town/village
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {/* Ward Selector */}
                <Col md={4}>
                    <Form.Group controlId="ward" className="mb-4">
                        <Form.Label className="fw-small small text-muted">Ward (Optional)</Form.Label>
                        {wards.length > 0 ? (
                            <>
                            <Form.Select
                                disabled={!formData.facility.location.town.id || loading.wards}
                                value={formData.facility.location.ward.id}
                                onChange={(e) => {
                                    const wardId = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        facility: {
                                            ...prev.facility,
                                            location: {
                                                ...prev.facility.location,
                                                ward: wards.find(w => w.id === wardId) || { id: '', displayName: '' }
                                            }
                                        }
                                    }));
                                }}
                            >
                                <option value="">Select Ward</option>
                                {wards.map(ward => (
                                    <option key={ward.id} value={ward.id}>
                                        {ward.displayName}
                                    </option>
                                ))}
                            </Form.Select>
                            {loading.wards && (
                                <div className="mt-2">
                                    <Spinner size="sm" animation="border" /> Loading wards...
                                </div>
                            )}
                            </>
                        ) : (
                            <Form.Control
                                plaintext
                                readOnly
                                value={formData.facility.location.town.id ? "No wards available" : "Select town first"}
                            />
                        )}
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );

    // Step 2: Applicant Information
    const renderStep2 = () => (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary rounded-circle p-2 me-3">
                    <Person size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="mb-0">Applicant Information</h3>
                    <p className="text-muted mb-0">Provide your professional details</p>
                </div>
            </div>

            <div className="p-4 rounded mb-4 text-start">
                <h5 className="mb-3">Your Information</h5>
                <Row>
                    <Col md={6}>
                        <div className="mb-3">
                            <p className="mb-1 text-muted small">First Name</p>
                            <p className="mb-0 fw-medium">{formData.applicant.firstName}</p>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="mb-3">
                            <p className="mb-1 text-muted small">Surname</p>
                            <p className="mb-0 fw-medium">{formData.applicant.surname}</p>
                        </div>
                    </Col>
                    <Col md={12}>
                        <div className="mb-3">
                            <p className="mb-1 text-muted small">Email</p>
                            <p className="mb-0 fw-medium">{formData.applicant.email}</p>
                        </div>
                    </Col>
                </Row>
            </div>

            <Row className="g-3 text-start pt-3 border-top">
                <Col md={6}>
                    <Form.Group controlId="licenseNumber" className="mb-4">
                        <Form.Label className="fw-medium">BHPC/NMBC License Number</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter license number"
                            name="applicant.licenseNumber"
                            value={formData.applicant.licenseNumber}
                            onChange={handleChange}
                            pattern="[A-Za-z0-9]{6,12}"
                            isInvalid={stepValidated && !formData.applicant.licenseNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter a valid license number
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Format: 6-12 alphanumeric characters
                        </Form.Text>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="practiceNumber" className="mb-4">
                        <Form.Label className="fw-medium">Private Practice Number (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter practice number"
                            name="applicant.practiceNumber"
                            value={formData.applicant.practiceNumber}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="contactNumber" className="mb-4">
                        <Form.Label className="fw-medium">Contact Number</Form.Label>
                        <Form.Control
                            required
                            type="tel"
                            placeholder="e.g., 71234567"
                            name="applicant.contactNumber"
                            value={formData.applicant.contactNumber}
                            onChange={handleChange}
                            pattern="^(\+?2677|7)[1-9][0-9]{6}$"
                            isInvalid={stepValidated && !formData.applicant.contactNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please enter a valid phone number
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Botswana format: 71234567 or +26771234567
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );

    // Step 3: Review and Declaration
    const renderStep3 = () => (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary rounded-circle p-2 me-3">
                    <CardChecklist size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="mb-0">Review & Declaration</h3>
                    <p className="text-muted mb-0">Confirm your information and agree to terms</p>
                </div>
            </div>

            <div className="border rounded p-4 mb-4 text-start">
                <h5 className="border-bottom pb-2 mb-3">Facility Information</h5>

                <Row className="mb-2 text-start">
                    <Col md={3} className="text-muted">Name</Col>
                    <Col md={9} className="fw-medium">{formData.facility.name}</Col>
                </Row>

                <Row className="mb-2 text-start">
                    <Col md={3} className="text-muted">Location</Col>
                    <Col md={9} className="fw-medium">
                        {formData.facility.location.district.displayName}, {formData.facility.location.town.displayName}
                        {formData.facility.location.ward.id && `, ${formData.facility.location.ward.displayName}`}
                    </Col>
                </Row>
            </div>

            <div className="border rounded p-4 mb-4 text-start border-top">
                <h5 className="border-bottom pb-2 mb-3">Applicant Information</h5>

                <Row className="mb-2">
                    <Col md={3} className="text-muted">Name</Col>
                    <Col md={9} className="fw-medium">
                        {formData.applicant.firstName} {formData.applicant.surname}
                    </Col>
                </Row>

                <Row className="mb-2">
                    <Col md={3} className="text-muted">Email</Col>
                    <Col md={9} className="fw-medium">{formData.applicant.email}</Col>
                </Row>

                <Row className="mb-2">
                    <Col md={3} className="text-muted">Contact</Col>
                    <Col md={9} className="fw-medium">
                        <Telephone className="me-2 text-muted" size={16} />
                        {formData.applicant.contactNumber}
                    </Col>
                </Row>

                <Row className="mb-2">
                    <Col md={3} className="text-muted">License</Col>
                    <Col md={9} className="fw-medium">
                        <CardChecklist className="me-2 text-muted" size={16} />
                        {formData.applicant.licenseNumber}
                    </Col>
                </Row>

                {formData.applicant.practiceNumber && (
                    <Row className="mb-2">
                        <Col md={3} className="text-muted">Practice #</Col>
                        <Col md={9} className="fw-medium">{formData.applicant.practiceNumber}</Col>
                    </Row>
                )}
            </div>

            <Form.Group controlId="agreement" className="mb-4 text-start">
                <FormCheck
                    required
                    type="checkbox"
                    label={
                        <span>
              I declare that the information provided is accurate and complete to the best of my knowledge.
              I understand that false information may lead to rejection of my application.
            </span>
                    }
                    checked={formData.agreedToTerms}
                    onChange={(e) =>
                        setFormData(prev => ({
                            ...prev,
                            agreedToTerms: e.target.checked
                        }))
                    }
                    isInvalid={stepValidated && !formData.agreedToTerms}
                />
                <Form.Control.Feedback type="invalid">
                    You must agree to the declaration
                </Form.Control.Feedback>
            </Form.Group>
        </div>
    );

    // Progress Stepper
    const renderStepper = () => (
        <div className="stepper mb-5">
            <div className="stepper-progress">
                <div
                    className="stepper-progress-bar"
                    style={{ width: `${(currentStep - 1) * 50}%` }}
                ></div>
            </div>
            <div className="stepper-items">
                {[1, 2, 3].map(step => (
                    <div
                        key={step}
                        className={`stepper-item ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                    >
                        <div className="stepper-icon">
                            {currentStep > step ? <CheckCircle size={20} /> : step}
                        </div>
                        <div className="stepper-label">
                            {step === 1 && 'Facility'}
                            {step === 2 && 'Applicant'}
                            {step === 3 && 'Review'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white py-3">
                    <h2 className="mb-0">
                        {initialData ? 'Update Facility Registration' : 'New Facility Registration'}
                    </h2>
                </Card.Header>

                <Card.Body>
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <Form noValidate onSubmit={handleSubmit}>
                        {renderStepper()}

                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}

                        <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                            <div>
                                {currentStep > 1 && (
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handlePrevStep}
                                        disabled={isSubmitting}
                                    >
                                        Previous
                                    </Button>
                                )}
                            </div>

                            <div>
                                {currentStep < 3 ? (
                                    <Button
                                        variant="primary"
                                        onClick={handleNextStep}
                                        disabled={isSubmitting}
                                    >
                                        Next Step <ArrowRight className="ms-1" size={16} />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="success"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            {initialData ? 'Updating...' : 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                            <CheckCircle className="me-2" />
                                            {initialData ? 'Update Registration' : 'Submit Registration'}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="d-flex justify-content-center mt-3">
                            <Button
                                variant="link"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="text-danger"
                            >
                                Cancel Registration
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

/*// Editable form component
const FacilityRegistrationForm = ({
                                      initialData,
                                      onSubmit,
                                      isSubmitting,
                                      onCancel
                                  }) => {
    const [formData, setFormData] = useState(
        initialData || {
            facility: {
                name: '',
                location: {
                    district: { id: '', name: '' },
                    town: { id: '', name: '' },
                    ward: { id: '', name: '' }
                },
                type: ''
            },
            applicant: {
                licenseNumber: '',
                practiceNumber: '',
                contactNumber: '',
                firstName: '',
                surname: '',
                email: ''
            },
            agreedToTerms: false
        }
    );

    const [districts, setDistricts] = useState([]);
    const [towns, setTowns] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState({
        districts: false,
        towns: false,
        wards: false
    });
    const [error, setError] = useState(null);
    const [validated, setValidated] = useState(false);

    // Initialize with user data
    useEffect(() => {
        // In a real app, this would come from authentication context
        setFormData(prev => ({
            ...prev,
            applicant: {
                ...prev.applicant,
                firstName: 'John', // Pre-filled with current user
                surname: 'Doe',   // Pre-filled with current user
                email: 'john.doe@example.com' // Pre-filled with current user
            }
        }));

        // Fetch initial districts
        fetchDistricts();
    }, []);

    // Fetch districts
    const fetchDistricts = async () => {
        setLoading(prev => ({ ...prev, districts: true }));
        setError(null);

        try {
            const data = await mockRegistrationService.getLocationData('districts');
            setDistricts(data);

            // If initial data exists, set the district
            if (initialData?.facility.location.district.id) {
                handleDistrictChange(initialData.facility.location.district.id);
            }
        } catch (err) {
            setError('Failed to load districts. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, districts: false }));
        }
    };

    // Handle district change
    const handleDistrictChange = async (districtId) => {
        setFormData(prev => ({
            ...prev,
            facility: {
                ...prev.facility,
                location: {
                    district: districts.find(d => d.id === districtId) || { id: '', name: '' },
                    town: { id: '', name: '' },
                    ward: { id: '', name: '' }
                }
            }
        }));

        if (districtId) {
            setLoading(prev => ({ ...prev, towns: true }));
            try {
                const data = await mockRegistrationService.getLocationData('towns', districtId);
                setTowns(data);
                setWards([]);

                // If initial data exists, set the town
                if (initialData?.facility.location.town.id && data.some(t => t.id === initialData.facility.location.town.id)) {
                    handleTownChange(initialData.facility.location.town.id);
                }
            } catch (err) {
                setError('Failed to load towns. Please try again.');
            } finally {
                setLoading(prev => ({ ...prev, towns: false }));
            }
        } else {
            setTowns([]);
            setWards([]);
        }
    };

    // Handle town change
    const handleTownChange = async (townId) => {
        setFormData(prev => ({
            ...prev,
            facility: {
                ...prev.facility,
                location: {
                    ...prev.facility.location,
                    town: towns.find(t => t.id === townId) || { id: '', name: '' },
                    ward: { id: '', name: '' }
                }
            }
        }));

        if (townId) {
            setLoading(prev => ({ ...prev, wards: true }));
            try {
                const data = await mockRegistrationService.getLocationData('wards', townId);
                setWards(data);

                // If initial data exists, set the ward
                if (initialData?.facility.location.ward.id && data.some(w => w.id === initialData.facility.location.ward.id)) {
                    setFormData(prev => ({
                        ...prev,
                        facility: {
                            ...prev.facility,
                            location: {
                                ...prev.facility.location,
                                ward: data.find(w => w.id === initialData.facility.location.ward.id) || { id: '', name: '' }
                            }
                        }
                    }));
                }
            } catch (err) {
                setError('Failed to load wards. Some locations may not have wards.');
            } finally {
                setLoading(prev => ({ ...prev, wards: false }));
            }
        } else {
            setWards([]);
        }
    };

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const [section, field] = name.split('.');

        if (section === 'agreedToTerms') {
            setFormData(prev => ({ ...prev, [section]: checked }));
        } else {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        onSubmit(formData);
    };

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white py-3">
                    <h2 className="mb-0">
                        {initialData ? 'Update Facility Registration' : 'New Facility Registration'}
                    </h2>
                </Card.Header>

                <Card.Body>
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        {/!* Facility Information Section *!/}
                        <section className="mb-5">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary rounded-circle p-2 me-3">
                                    <Building size={24} className="text-white" />
                                </div>
                                <h3 className="mb-0">Facility Information</h3>
                            </div>

                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group controlId="facilityName">
                                        <Form.Label>Facility Name</Form.Label>
                                        <Form.Control
                                            required
                                            type="text"
                                            placeholder="Enter facility name"
                                            name="facility.name"
                                            value={formData.facility.name}
                                            onChange={handleChange}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a facility name
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/!* District Selector *!/}
                                <Col md={4}>
                                    <Form.Group controlId="district">
                                        <Form.Label>District</Form.Label>
                                        <Form.Select
                                            required
                                            value={formData.facility.location.district.id}
                                            onChange={(e) => handleDistrictChange(e.target.value)}
                                            disabled={loading.districts}
                                        >
                                            <option value="">Select District</option>
                                            {districts.map(district => (
                                                <option key={district.id} value={district.id}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {loading.districts && (
                                            <div className="mt-2">
                                                <Spinner size="sm" animation="border" /> Loading districts...
                                            </div>
                                        )}
                                        <Form.Control.Feedback type="invalid">
                                            Please select a district
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/!* Town/Village Selector *!/}
                                <Col md={4}>
                                    <Form.Group controlId="town">
                                        <Form.Label>Town/Village</Form.Label>
                                        <Form.Select
                                            required
                                            disabled={!formData.facility.location.district.id || loading.towns}
                                            value={formData.facility.location.town.id}
                                            onChange={(e) => handleTownChange(e.target.value)}
                                        >
                                            <option value="">Select Town/Village</option>
                                            {towns.map(town => (
                                                <option key={town.id} value={town.id}>
                                                    {town.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {loading.towns && (
                                            <div className="mt-2">
                                                <Spinner size="sm" animation="border" /> Loading towns...
                                            </div>
                                        )}
                                        <Form.Control.Feedback type="invalid">
                                            Please select a town/village
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/!* Ward Selector *!/}
                                <Col md={4}>
                                    <Form.Group controlId="ward">
                                        <Form.Label>Ward (Optional)</Form.Label>
                                        {wards.length > 0 ? (
                                            <>
                                            <Form.Select
                                                disabled={!formData.facility.location.town.id || loading.wards}
                                                value={formData.facility.location.ward.id}
                                                onChange={(e) => {
                                                    const wardId = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        facility: {
                                                            ...prev.facility,
                                                            location: {
                                                                ...prev.facility.location,
                                                                ward: wards.find(w => w.id === wardId) || { id: '', name: '' }
                                                            }
                                                        }
                                                    }));
                                                }}
                                            >
                                                <option value="">Select Ward</option>
                                                {wards.map(ward => (
                                                    <option key={ward.id} value={ward.id}>
                                                        {ward.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {loading.wards && (
                                                <div className="mt-2">
                                                    <Spinner size="sm" animation="border" /> Loading wards...
                                                </div>
                                            )}
                                            </>
                                        ) : (
                                            <Form.Control
                                                plaintext
                                                readOnly
                                                value={formData.facility.location.town.id ? "No wards available" : "Select town first"}
                                            />
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </section>

                        {/!* Applicant Information Section *!/}
                        <section className="mb-4">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary rounded-circle p-2 me-3">
                                    <Person size={24} className="text-white" />
                                </div>
                                <h3 className="mb-0">Applicant Information</h3>
                            </div>

                            <Row className="g-3 mb-4">
                                <Col md={4}>
                                    <Form.Group controlId="firstName">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            plaintext
                                            readOnly
                                            value={formData.applicant.firstName}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group controlId="surname">
                                        <Form.Label>Surname</Form.Label>
                                        <Form.Control
                                            plaintext
                                            readOnly
                                            value={formData.applicant.surname}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group controlId="email">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            plaintext
                                            readOnly
                                            value={formData.applicant.email}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group controlId="licenseNumber">
                                        <Form.Label>BHPC/NMBC License Number</Form.Label>
                                        <Form.Control
                                            required
                                            type="text"
                                            placeholder="Enter license number"
                                            name="applicant.licenseNumber"
                                            value={formData.applicant.licenseNumber}
                                            onChange={handleChange}
                                            pattern="[A-Za-z0-9]{6,12}"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please enter a valid license number (6-12 alphanumeric characters)
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group controlId="practiceNumber">
                                        <Form.Label>Private Practice Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter practice number"
                                            name="applicant.practiceNumber"
                                            value={formData.applicant.practiceNumber}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Form.Group controlId="contactNumber">
                                        <Form.Label>Contact Number</Form.Label>
                                        <Form.Control
                                            required
                                            type="tel"
                                            placeholder="e.g., 0712345678"
                                            name="applicant.contactNumber"
                                            value={formData.applicant.contactNumber}
                                            onChange={handleChange}
                                            pattern="^(\+?27|0)[6-8][0-9]{8}$"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please enter a valid South African phone number
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Format: 0712345678 or +27712345678
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </section>

                        {/!* Declaration Section *!/}
                        <section className="mb-4">
                            <Form.Group controlId="agreement">
                                <FormCheck
                                    required
                                    type="checkbox"
                                    label={
                                        <span>
                      I declare that the information provided is accurate and complete to the best of my knowledge.
                      I understand that false information may lead to rejection of my application.
                    </span>
                                    }
                                    checked={formData.agreedToTerms}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            agreedToTerms: e.target.checked
                                        }))
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    You must agree to the declaration
                                </Form.Control.Feedback>
                            </Form.Group>
                        </section>

                        <div className="d-flex justify-content-end mt-4">
                            <Button
                                variant="outline-secondary"
                                className="me-3"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    {initialData ? 'Updating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    <>
                                    <CheckCircle className="me-2" />
                                    {initialData ? 'Update Registration' : 'Submit Registration'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};*/

export default FacilityRegistrationInitiation;