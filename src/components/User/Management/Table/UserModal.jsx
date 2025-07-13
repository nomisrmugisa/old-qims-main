/**
 * Created by fulle on 2025/07/11.
 */
import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
    Row,
    Col,
    Spinner,
    Alert
} from 'react-bootstrap';
import UserService from '../../../../services/user.service';

const UserModal = ({ user, show, onHide, mode, onSave }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');



    // Initialize form data
    useEffect(() => {
        const fetchUserGroups = async() => {
            const data = UserService.listGroups();
            window.console.log("groups***");
            window.console.log(data);
            window.console.log("groups------------");
        };

        fetchUserGroups();
        if (mode === 'create') {
            setFormData({
                name: '',
                email: '',
                role: 'inspector',
                status: 'active',
                phone: '',
                facilities: []
            });
        } else if (user) {
            setFormData({ ...user });
        }
    }, [user, mode, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSaving(true);
        setSaveError('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In real app: await api.saveUser(formData);
            onSave(formData);
            onHide();
        } catch (err) {
            setSaveError(err.message || 'Failed to save user');
        } finally {
            setIsSaving(false);
        }
    };

    const modalTitle = mode === 'create'
        ? 'Create New User'
        : mode === 'edit'
            ? 'Edit User'
            : 'User Details';

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            backdrop={isSaving ? 'static' : true}
        >
            <Modal.Header closeButton={!isSaving}>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {saveError && (
                        <Alert variant="danger" onClose={() => setSaveError('')} dismissible>
                            {saveError}
                        </Alert>
                    )}

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="name">
                                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    isInvalid={!!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="email">
                                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="role">
                                <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                    isInvalid={!!errors.role}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="manager">Facility Manager</option>
                                    <option value="inspector">Inspector</option>
                                    <option value="auditor">Auditor</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.role}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="status">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status || 'active'}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="phone">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    disabled={mode === 'view'}
                                />
                            </Form.Group>
                        </Col>

                        {mode !== 'create' && (
                            <Col md={6}>
                                <Form.Group controlId="lastActive">
                                    <Form.Label>Last Active</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.lastActive ?
                                            new Date(formData.lastActive).toLocaleString() :
                                            'Never'}
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                        )}
                    </Row>

                    {mode !== 'view' && (
                        <div className="mt-4">
                            <h5>Security</h5>
                            <hr className="mt-0" />

                            <Row>
                                <Col md={6}>
                                    <Form.Group controlId="password">
                                        <Form.Label>
                                            {mode === 'create' ? 'Create Password' : 'Reset Password'}
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            placeholder={mode === 'create' ? 'Required' : 'Leave blank to keep current'}
                                            onChange={handleChange}
                                        />
                                        <Form.Text className="text-muted">
                                            {mode === 'create'
                                                ? 'Minimum 8 characters with numbers and symbols'
                                                : 'Only enter if you want to change password'}
                                        </Form.Text>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group controlId="passwordConfirm">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="passwordConfirm"
                                            placeholder="Confirm password"
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={onHide}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>

                    {mode !== 'view' && (
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSaving}
                        >
                            {isSaving ? (
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
                            ) : (
                                mode === 'create' ? 'Create User' : 'Save Changes'
                            )}
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UserModal;