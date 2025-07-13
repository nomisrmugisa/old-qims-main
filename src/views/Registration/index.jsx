/**
 * Created by fulle on 2025/07/05.
 */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { TextField } from '@mui/material';
import { eventBus, EVENTS } from '../../events';
import { validateEmail, validatePassword } from '../../utils/validators';
import registrationIllustration from '../../assets/MOH-logo-bots.png';
import './index.css';
import { AuthService, UserService } from '../../services';


const listUserGroups = async () => {
    try {
        const data = await UserService.listGroups();
        window.console.log("lookup result");
        window.console.log(data);
        /*if(data && data.length > 0 && data[0].newFacilityCode)
         return data;
         else
         return [];*/
        return data;
    } catch (err) {
        console.error('User Groups fetch error:', err);
        throw ('Failed to load user groups. Please try again later.');
    } finally {

    }
};

const Registration = () => {
    const [step, setStep] = useState(1);
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
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.otp) newErrors.otp = 'OTP is required';
        else if (formData.otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';

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

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!validateStep1()) return;

        setIsSubmitting(true);
        try {

            const response = await AuthService.registerEmail({
                email: formData.email,
                username: formData.email,
                password: formData.password,
                otp: formData.otp
            });

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'OTP Sent',
                message: 'Verification code sent to your email',
                type: 'success'
            });
            setStep(2);
            window.console.log("RESPONSE---");
            window.console.log(response);
            window.console.log(response.code);
            window.console.log(response.data);
            window.console.log("***---");

            /*const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();

            if (response.ok) {
                eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                    title: 'OTP Sent',
                    message: 'Verification code sent to your email',
                    type: 'success'
                });
                setStep(2);
            } else {
                throw new Error(data.message || 'Failed to send OTP');
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

    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsSubmitting(true);
        try {

            const response = await AuthService.registerComplete(formData);
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Registration Complete',
                message: 'Your account has been created successfully',
                type: 'success',
                options: {
                    willClose: () => window.location.href = '/login'
                }
            });
            window.console.log("RESPONSE---");
            window.console.log(response);
            window.console.log(response.code);
            window.console.log(response.data);
            window.console.log("***---");

            /*const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                    title: 'Registration Complete',
                    message: 'Your account has been created successfully',
                    type: 'success',
                    options: {
                        willClose: () => window.location.href = '/dashboard'
                    }
                });
            } else {
                throw new Error(data.message || 'Registration failed');
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
        <Container fluid className="registration-container">
            <Row className="h-100">
                {/* Form Column - Full width on mobile, half on larger screens */}
                <Col xs={12} lg={6} className="form-column d-flex align-items-center justify-content-center">
                    <Card className="registration-card">
                        <Card.Body>
                            <div className="text-center mb-4">
                                <h2>Create Your Account</h2>
                                <p className="text-muted">
                                    {step === 1 ? 'Start by entering your email' : 'Complete your registration'}
                                </p>
                            </div>

                            {step === 1 ? (
                                <Form onSubmit={handleSendOTP}>
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
                                            autoFocus
                                        />
                                    </Form.Group>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 mt-3"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                                    </Button>
                                </Form>
                            ) : (
                                <Form onSubmit={handleCompleteRegistration}>
                                    <Form.Group className="mb-3">
                                        <TextField
                                            fullWidth
                                            label="Verification Code (OTP)"
                                            name="otp"
                                            variant="outlined"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            error={!!errors.otp}
                                            helperText={errors.otp}
                                            autoFocus
                                            inputProps={{ maxLength: 6 }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <TextField
                                            fullWidth
                                            label="Password"
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
                                    <div className="d-flex justify-content-between mt-4">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setStep(1)}
                                            disabled={isSubmitting}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Registering...' : 'Complete Registration'}
                                        </Button>
                                    </div>
                                </Form>
                            )}

                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    Already have an account? <a href="/main/login">Sign in</a>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Illustration Column - Hidden on mobile, visible on lg+ */}
                <Col lg={6} className="d-none d-lg-flex illustration-column align-items-center justify-content-center">
                    <div className="text-center p-5">
                        <img
                            src={registrationIllustration}
                            alt="Registration"
                            className="img-fluid mb-4"
                            style={{ maxHeight: '400px' }}
                        />
                        <h3>Join Our Community</h3>
                        <p className="text-muted">
                            Create your account to get started with all our features
                        </p>
                        <ul className="text-start mt-4">
                            <li>Access to premium content</li>
                            <li>Personalized recommendations</li>
                            <li>24/7 customer support</li>
                        </ul>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Registration;