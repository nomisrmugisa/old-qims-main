/**
 * Created by fulle on 2025/07/12.
 */
import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Button,
    Spinner,
    Alert,
    Row,
    Col,
    Image
} from 'react-bootstrap';
import { Person, CheckCircle, Camera } from 'react-bootstrap-icons';
import useUserProfile from '../../../components/hooks/useUserProfile';

const ProfileEditor = () => {
    const { profile, loading, error, updateProfile } = useUserProfile();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Initialize form with profile data
    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                jobTitle: profile.jobTitle || '',
                department: profile.department || '',
                bio: profile.bio || ''
            });
            setAvatarPreview(profile.avatar || null);
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Client-side preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Add to formData for submission
            setFormData(prev => ({ ...prev, avatar: file }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await updateProfile(formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            // Error is handled in useUserProfile hook
        }
    };

    if (loading && !profile) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading your profile...</p>
            </div>
        );
    }

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-light">
                <h3 className="mb-0 d-flex align-items-center">
                    <Person className="me-2" /> Edit Profile
                </h3>
            </Card.Header>

            <Card.Body>
                {error && (
                    <Alert variant="danger" onClose={() => {}} dismissible>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                        <CheckCircle className="me-2" /> {success}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                        <Col md={3} className="text-center">
                            <div className="position-relative mb-3">
                                <Image
                                    src={avatarPreview || '/default-avatar.jpg'}
                                    roundedCircle
                                    fluid
                                    className="border"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    alt="Profile"
                                />
                                <Form.Label
                                    htmlFor="avatar-upload"
                                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 cursor-pointer"
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <Camera />
                                    <Form.Control
                                        type="file"
                                        id="avatar-upload"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </Form.Label>
                            </div>
                            <small className="text-muted">
                                JPG, PNG or GIF (Max 2MB)
                            </small>
                        </Col>

                        <Col md={9}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName || ''}
                                            onChange={handleChange}
                                            isInvalid={!!errors.firstName}
                                            placeholder="Enter your first name"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.firstName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName || ''}
                                            onChange={handleChange}
                                            isInvalid={!!errors.lastName}
                                            placeholder="Enter your last name"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.lastName}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleChange}
                                            isInvalid={!!errors.email}
                                            placeholder="your.email@example.com"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            isInvalid={!!errors.phone}
                                            placeholder="+1 (555) 555-5555"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.phone}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Job Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="jobTitle"
                                            value={formData.jobTitle || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Health Inspector"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Department</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="department"
                                            value={formData.department || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Quality Assurance"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="bio"
                            value={formData.bio || ''}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            maxLength={200}
                        />
                        <Form.Text className="text-muted">
                            {200 - (formData.bio?.length || 0)} characters remaining
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Saving...
                                </>
                            ) : 'Save Profile Changes'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ProfileEditor;