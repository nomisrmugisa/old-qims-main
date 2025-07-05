/**
 * Created by fulle on 2025/07/05.
 */
// views/ResetPassword.jsx
import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { TextField } from '@mui/material';
import { eventBus, EVENTS } from '../../events';
import { validateEmail, validatePassword } from '../../utils/validators';
import { AuthService } from '../../services';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.otp) newErrors.otp = 'OTP is required';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await AuthService.resetPassword(formData);
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Success',
                message: 'Password reset successfully',
                type: 'success',
                options: {
                    willClose: () => window.location.href = '/main/'
                }
            });
            window.console.log("RESPONSE---");
            window.console.log(response);
            window.console.log(response.code);
            window.console.log(response.data);
            window.console.log("***---");
            /*const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                    title: 'Success',
                    message: 'Password reset successfully',
                    type: 'success',
                    options: {
                        willClose: () => window.location.href = '/login'
                    }
                });
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }*/
        } catch (error) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: error.message,
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100" style={{ maxWidth: '500px' }}>
                <Col>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Reset Password</h2>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        variant="outlined"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="OTP Code"
                                        name="otp"
                                        variant="outlined"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        error={!!errors.otp}
                                        helperText={errors.otp}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        name="password"
                                        variant="outlined"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        variant="outlined"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                    />
                                </Form.Group>
                                <Button
                                    className="w-100 cta-btn"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </Form>

                            <div className="text-center mt-3">
                                <a href="/main/">Back to Home</a>
                            </div>
                            <div className="text-center mt-3">
                                <a href="/main/forgot-password" class="font-12">I do not have a Reset One Time Password</a>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPassword;