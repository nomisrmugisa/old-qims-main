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
import { getCredentials } from '../../../../utils/credentialHelper';
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

// DHIS2 API service for fetching event data
const dhis2Service = {
    // Fetch existing event data using registration code
    getEventData: async (registrationCode) => {
        const credentials = await getCredentials();
        if (!credentials) {
            throw new Error('No credentials available');
        }

        const response = await fetch(`/api/events/${registrationCode}`, {
            headers: { Authorization: `Basic ${credentials}` },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // No existing data
            }
            throw new Error('Failed to fetch event data');
        }

        return await response.json();
    },

    // Map DHIS2 data to form structure
    mapDhis2DataToForm: (eventData) => {
        if (!eventData || !eventData.dataValues) {
            return null;
        }

        // Create a map of data element IDs to values
        const dataMap = {};
        eventData.dataValues.forEach(dv => {
            dataMap[dv.dataElement] = dv.value;
        });

        // Map to form structure based on "Admin User & Facility Details" field mappings
        const formData = {
            facility: {
                name: dataMap['PdtizqOqE6Q'] || '', // Name of Facility to be Registered
                location: {
                    district: { id: '', displayName: '' },
                    town: { id: '', displayName: '' },
                    ward: { id: '', displayName: '' }
                },
                type: ''
            },
            applicant: {
                firstName: dataMap['HMk4LZ9ESOq'] || '', // Name of the License Holder
                surname: dataMap['ykwhsQQPVH0'] || '', // Surname of License Holder
                email: dataMap['NVlLoMZbXIW'] || '', // Email
                licenseNumber: dataMap['SReqZgQk0RY'] || '', // License Number
                practiceNumber: dataMap['aMFg2iq9VIg'] || '', // Private Practice Number
                contactNumber: dataMap['SVzSsDiZMN5'] || '' // Contact Number
            },
            agreedToTerms: false
        };

        // Handle location mapping if available
        if (dataMap['VJzk8OdFJKA']) {
            // This would need to be expanded to map location ID to district/town/ward
            // For now, we'll leave it as is and let the user select
        }

        return formData;
    }
};

const FacilityRegistrationInitiation = () => {
    const [user, setUser] = useState(null);
    const [registrationData, setRegistrationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getAuthUser = async() => {
        try {
            const fetchRegistrationStatus = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    // Get user from storage
                    const storedUser = await StorageService.getUserData();
                    if (!storedUser) {
                        setError('User not found. Please log in again.');
                        setLoading(false);
                        return;
                    }

                    setUser(storedUser);

                    // Try to fetch DHIS2 data first
                    try {
                        const credentials = await getCredentials();
                        if (credentials) {
                            // Fetch user data to get registration code
                            const meResponse = await fetch(`/api/me`, {
                                headers: { Authorization: `Basic ${credentials}` },
                            });

                            if (meResponse.ok) {
                                const userData = await meResponse.json();
                                const registrationCode = userData.twitter; // Registration code from twitter field

                                if (registrationCode) {
                                    console.log('Fetching DHIS2 data for registration code:', registrationCode);
                                    
                                    // Try to fetch existing event data from DHIS2
                                    const eventData = await dhis2Service.getEventData(registrationCode);
                                    
                                    if (eventData) {
                                        console.log('DHIS2 event data found:', eventData);
                                        
                                        // Map DHIS2 data to form structure
                                        const mappedFormData = dhis2Service.mapDhis2DataToForm(eventData);
                                        
                                        if (mappedFormData) {
                                            console.log('Mapped form data from DHIS2:', mappedFormData);
                                            
                                            // Set registration data with DHIS2 data
                                            setRegistrationData({
                                                exists: true,
                                                editable: true,
                                                data: {
                                                    id: registrationCode,
                                                    submittedAt: eventData.createdAt || new Date().toISOString(),
                                                    referenceNumber: `FAC-${new Date().getFullYear()}-${registrationCode.slice(-6)}`,
                                                    ...mappedFormData
                                                }
                                            });
                                            setLoading(false);
                                            return; // Exit early, don't use mock data
                                        }
                                    } else {
                                        console.log('No DHIS2 event data found for registration code:', registrationCode);
                                    }
                                } else {
                                    console.log('No registration code found in user data');
                                }
                            }
                        }
                    } catch (dhis2Error) {
                        console.log('DHIS2 data not available, falling back to mock data:', dhis2Error);
                        // Continue to mock data if DHIS2 fails
                    }

                    // Fallback to mock data if DHIS2 data is not available
                    const status = await mockRegistrationService.getRegistrationStatus(true);
                    setRegistrationData(status);
                } catch (error) {
                    console.error('Error fetching registration status:', error);
                    setError('Failed to load registration status. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            await fetchRegistrationStatus();
        } catch (error) {
            console.error('Error in getAuthUser:', error);
            setError('Failed to load user data. Please try again.');
        }
    };

    useEffect(() => {
        getAuthUser();
    }, []);

    const handleSubmitSuccess = (responseData) => {
        console.log('✅ Registration submitted successfully:', responseData);
        setRegistrationData({
            exists: true,
            editable: false,
            data: responseData
        });
        setIsSubmitting(false);
        
        // Show success message
        eventBus.emit(EVENTS.SHOW_NOTIFICATION, {
            type: 'success',
            message: 'Facility registration submitted successfully!'
        });
    };

    const handleSubmitFailure = (error) => {
        console.error('❌ Registration submission failed:', error);
        setIsSubmitting(false);
        setError('Failed to submit registration. Please try again.');
        
        eventBus.emit(EVENTS.SHOW_NOTIFICATION, {
            type: 'error',
            message: 'Failed to submit registration. Please try again.'
        });
    };

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Use mock service for now (can be extended to use DHIS2 later)
            const result = await mockRegistrationService.submitRegistration(formData);
            handleSubmitSuccess(result.data);
        } catch (error) {
            console.error('Error submitting form:', error);
            handleSubmitFailure(error);
        }
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading facility registration...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <div className="d-flex align-items-center">
                                <Building size={24} className="me-3" />
                                <div>
                                    <h4 className="mb-0">New Facility Registration</h4>
                                    <p className="mb-0 small">Complete your facility registration</p>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {registrationData?.exists && !isEditing ? (
                                <RegistrationSummary 
                                    user={user} 
                                    data={registrationData.data} 
                                    editable={registrationData.editable}
                                    onEdit={() => setIsEditing(true)}
                                />
                            ) : (
                                <FacilityRegistrationForm
                                    user={user}
                                    initialData={registrationData?.data}
                                    onSubmit={handleFormSubmit}
                                    isSubmitting={isSubmitting}
                                    onCancel={() => setIsEditing(false)}
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

const RegistrationSummary = ({ user, data, editable, onEdit }) => {
    return (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <CheckCircle size={32} className="text-success me-3" />
                <div>
                    <h3 className="mb-0">Registration Complete</h3>
                    <p className="text-muted mb-0">Your facility registration has been submitted</p>
                </div>
            </div>

            <Row className="g-3">
                <Col md={6}>
                    <Card className="h-100">
                        <Card.Header className="bg-light">
                            <div className="d-flex align-items-center">
                                <Building size={20} className="me-2" />
                                <strong>Facility Information</strong>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>Reference:</strong> {data.referenceNumber || 'N/A'}</p>
                            <p><strong>Submitted:</strong> {new Date(data.submittedAt || data.createdAt).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> 
                                <Badge bg="success" className="ms-2">Submitted</Badge>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="h-100">
                        <Card.Header className="bg-light">
                            <div className="d-flex align-items-center">
                                <Person size={20} className="me-2" />
                                <strong>Next Steps</strong>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <CheckCircle size={16} className="text-success me-2" />
                                    Registration submitted for review
                                </li>
                                <li className="mb-2">
                                    <Clock size={16} className="text-warning me-2" />
                                    Awaiting MOH screening
                                </li>
                                <li className="mb-2">
                                    <CardChecklist size={16} className="text-info me-2" />
                                    Complete remaining steps when approved
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {editable && (
                <div className="text-center mt-4">
                    <Button variant="outline-primary" onClick={onEdit}>
                        <PencilSquare size={16} className="me-2" />
                        Edit Registration
                    </Button>
                </div>
            )}
        </div>
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
                firstName: user?.firstName || '',
                surname: user?.surname || '',
                email: user?.email || ''
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
                firstName: user?.firstName || '', // Pre-filled with current user
                surname: user?.surname || '',   // Pre-filled with current user
                email: user?.email || '' // Pre-filled with current user
            }
        }));

        // Fetch initial districts
        fetchDistricts();
    }, [user]);

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

                const response = await FacilityService.getTownOrganisationUnits(districtId);
                window.console.log("got towns", response);
                setTowns(response);

                // If initial data exists, set the town
                if (initialData?.facility.location.town.id) {
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
                /*const data = await mockRegistrationService.getLocationData('wards', townId);
                setWards(data);*/

                const response = await FacilityService.getWardOrganisationUnits(townId);
                window.console.log("got wards", response);
                setWards(response);

                // If initial data exists, set the ward
                if (initialData?.facility.location.ward.id) {
                    setFormData(prev => ({
                        ...prev,
                        facility: {
                            ...prev.facility,
                            location: {
                                ...prev.facility.location,
                                ward: wards.find(w => w.id === initialData.facility.location.ward.id) || { id: '', displayName: '' }
                            }
                        }
                    }));
                }
            } catch (err) {
                setError('Failed to load wards. Please try again.');
            } finally {
                setLoading(prev => ({ ...prev, wards: false }));
            }
        } else {
            setWards([]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newData = { ...prev };
            const keys = name.split('.');
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = fieldValue;
            return newData;
        });
    };

    const validateStep = () => {
        switch (currentStep) {
            case 1:
                return formData.facility.name && 
                       formData.facility.location.district.id && 
                       formData.facility.location.town.id;
            case 2:
                return formData.applicant.firstName && 
                       formData.applicant.surname && 
                       formData.applicant.email &&
                       formData.applicant.licenseNumber &&
                       formData.applicant.practiceNumber;
            case 3:
                return formData.agreedToTerms;
            default:
                return false;
        }
    };

    const handleNextStep = () => {
        setStepValidated(true);
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            setStepValidated(false);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setStepValidated(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);

        if (validateStep()) {
            try {
                await onSubmit(formData);
            } catch (error) {
                setError('Failed to submit form. Please try again.');
            }
        }
    };

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
                                type="text"
                                placeholder="Select town first"
                                disabled
                            />
                        )}
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );

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

            <Row className="g-3 text-start">
                <Col md={6}>
                    <Form.Group controlId="firstName" className="mb-4">
                        <Form.Label className="fw-small small text-muted">First Name</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter first name"
                            name="applicant.firstName"
                            value={formData.applicant.firstName}
                            onChange={handleChange}
                            isInvalid={stepValidated && !formData.applicant.firstName}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide your first name
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="surname" className="mb-4">
                        <Form.Label className="fw-small small text-muted">Surname</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter surname"
                            name="applicant.surname"
                            value={formData.applicant.surname}
                            onChange={handleChange}
                            isInvalid={stepValidated && !formData.applicant.surname}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide your surname
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group controlId="email" className="mb-4">
                        <Form.Label className="fw-small small text-muted">Email Address</Form.Label>
                        <Form.Control
                            required
                            type="email"
                            placeholder="Enter email address"
                            name="applicant.email"
                            value={formData.applicant.email}
                            onChange={handleChange}
                            isInvalid={stepValidated && !formData.applicant.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid email address
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="licenseNumber" className="mb-4">
                        <Form.Label className="fw-small small text-muted">License Number</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter license number"
                            name="applicant.licenseNumber"
                            value={formData.applicant.licenseNumber}
                            onChange={handleChange}
                            isInvalid={stepValidated && !formData.applicant.licenseNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide your license number
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="practiceNumber" className="mb-4">
                        <Form.Label className="fw-small small text-muted">Practice Number</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter practice number"
                            name="applicant.practiceNumber"
                            value={formData.applicant.practiceNumber}
                            onChange={handleChange}
                            isInvalid={stepValidated && !formData.applicant.practiceNumber}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide your practice number
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group controlId="contactNumber" className="mb-4">
                        <Form.Label className="fw-small small text-muted">Contact Number</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="Enter contact number"
                            name="applicant.contactNumber"
                            value={formData.applicant.contactNumber}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );

    const renderStep3 = () => (
        <div className="fade-in">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-primary rounded-circle p-2 me-3">
                    <CardChecklist size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="mb-0">Review & Submit</h3>
                    <p className="text-muted mb-0">Review your information and submit your registration</p>
                </div>
            </div>

            <Row className="g-3">
                <Col md={6}>
                    <Card className="h-100">
                        <Card.Header className="bg-light">
                            <div className="d-flex align-items-center">
                                <Building size={20} className="me-2" />
                                <strong>Facility Information</strong>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>Name:</strong> {formData.facility.name}</p>
                            <p><strong>District:</strong> {formData.facility.location.district.displayName}</p>
                            <p><strong>Town/Village:</strong> {formData.facility.location.town.displayName}</p>
                            {formData.facility.location.ward.displayName && (
                                <p><strong>Ward:</strong> {formData.facility.location.ward.displayName}</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="h-100">
                        <Card.Header className="bg-light">
                            <div className="d-flex align-items-center">
                                <Person size={20} className="me-2" />
                                <strong>Applicant Information</strong>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <p><strong>Name:</strong> {formData.applicant.firstName} {formData.applicant.surname}</p>
                            <p><strong>Email:</strong> {formData.applicant.email}</p>
                            <p><strong>License:</strong> {formData.applicant.licenseNumber}</p>
                            <p><strong>Practice:</strong> {formData.applicant.practiceNumber}</p>
                            {formData.applicant.contactNumber && (
                                <p><strong>Contact:</strong> {formData.applicant.contactNumber}</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="mt-4">
                <Form.Check
                    type="checkbox"
                    id="agreedToTerms"
                    label="I agree to the terms and conditions of facility registration"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    name="agreedToTerms"
                    isInvalid={stepValidated && !formData.agreedToTerms}
                />
                <Form.Control.Feedback type="invalid">
                    You must agree to the terms and conditions
                </Form.Control.Feedback>
            </div>
        </div>
    );

    const renderStepper = () => (
        <div className="stepper mb-4">
            <div className="d-flex justify-content-between">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-title">Facility</span>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-title">Applicant</span>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-title">Review</span>
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            {renderStepper()}
            
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="d-flex justify-content-between mt-4">
                <Button
                    variant="outline-secondary"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    <ArrowLeft size={16} className="me-2" />
                    Cancel Registration
                </Button>

                <div>
                    {currentStep > 1 && (
                        <Button
                            variant="outline-primary"
                            onClick={handlePrevStep}
                            disabled={isSubmitting}
                            className="me-2"
                        >
                            <ArrowLeft size={16} className="me-2" />
                            Previous
                        </Button>
                    )}

                    {currentStep < 3 ? (
                        <Button
                            variant="primary"
                            onClick={handleNextStep}
                            disabled={isSubmitting}
                        >
                            Next Step
                            <ArrowRight size={16} className="ms-2" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            variant="success"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner size="sm" animation="border" className="me-2" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} className="me-2" />
                                    Submit Registration
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default FacilityRegistrationInitiation;