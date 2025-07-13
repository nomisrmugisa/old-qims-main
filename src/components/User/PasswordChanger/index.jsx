/**
 * Created by fulle on 2025/07/12.
 */
// components/PasswordChanger.jsx
import React, { useState } from 'react';
import {
    Card,
    Form,
    Button,
    Spinner,
    Alert,
    ProgressBar
} from 'react-bootstrap';
import { Key, CheckCircle, ShieldLock } from 'react-bootstrap-icons';
import usePasswordChange from '../../../components/hooks/usePasswordChange';

const PasswordChanger = () => {
    const { changePassword, loading, error, success } = usePasswordChange();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // Calculate password strength
        if (name === 'newPassword') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;

        // Length check
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 15;

        // Character diversity
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[a-z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 15;

        setPasswordStrength(Math.min(strength, 100));
    };

    const getPasswordStrengthVariant = () => {
        if (passwordStrength >= 75) return 'success';
        if (passwordStrength >= 50) return 'info';
        if (passwordStrength >= 25) return 'warning';
        return 'danger';
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength >= 75) return 'Strong';
        if (passwordStrength >= 50) return 'Good';
        if (passwordStrength >= 25) return 'Weak';
        return 'Very Weak';
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        } else if (passwordStrength < 50) {
            newErrors.newPassword = 'Password is too weak';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        await changePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        });

        // Reset form on success
        if (success) {
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordStrength(0);
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-light">
                <h3 className="mb-0 d-flex align-items-center">
                    <Key className="me-2" /> Change Password
                </h3>
            </Card.Header>

            <Card.Body>
                {error && (
                    <Alert variant="danger" onClose={() => {}} dismissible>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" onClose={() => {}} dismissible>
                        <CheckCircle className="me-2" /> {success}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label>Current Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.currentPassword}
                            placeholder="Enter your current password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.currentPassword}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="mb-4">
                        <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.newPassword}
                            placeholder="Create a new password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.newPassword}
                        </Form.Control.Feedback>

                        {formData.newPassword && (
                            <div className="mt-2">
                                <div className="d-flex justify-content-between mb-1">
                                    <small>Password Strength:</small>
                                    <small>{getPasswordStrengthLabel()}</small>
                                </div>
                                <ProgressBar
                                    now={passwordStrength}
                                    variant={getPasswordStrengthVariant()}
                                    style={{ height: '6px' }}
                                />
                                <div className="mt-2">
                                    <small className="text-muted d-block">
                                        <ShieldLock className="me-1" /> Password must contain:
                                    </small>
                                    <div className="d-flex flex-wrap gap-3 mt-1">
                                        <small className={formData.newPassword.length >= 8 ? 'text-success' : 'text-muted'}>
                                            • At least 8 characters
                                        </small>
                                        <small className={/[A-Z]/.test(formData.newPassword) ? 'text-success' : 'text-muted'}>
                                            • Uppercase letter
                                        </small>
                                        <small className={/[0-9]/.test(formData.newPassword) ? 'text-success' : 'text-muted'}>
                                            • Number
                                        </small>
                                        <small className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'text-success' : 'text-muted'}>
                                            • Special character
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Label>Confirm New Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!errors.confirmPassword}
                            placeholder="Confirm your new password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                        </Form.Control.Feedback>
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
                                Updating...
                                </>
                            ) : 'Change Password'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>

            <Card.Footer className="bg-light">
                <div className="text-center small text-muted">
                    <ShieldLock className="me-1" />
                    For security reasons, password changes require re-authentication on all devices
                </div>
            </Card.Footer>
        </Card>
    );
};

export default PasswordChanger;