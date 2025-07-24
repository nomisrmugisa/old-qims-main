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
import { OTPApiService, AuthService, UserService } from '../../services';


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
            const response = await OTPApiService.requestOtp({
                emails: [formData.email],
            });

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'OTP Sent',
                message: 'Verification code sent to your email',
                type: 'success'
            });
            setStep(2);
            
            // Scroll to top when moving to next step
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            window.console.log("RESPONSE---");
            window.console.log(response);
            window.console.log(response.code);
            window.console.log(response.data);
            window.console.log("***---");

        } catch (error) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: error.message,
                type: 'error'
            });
            // Scroll to top on error as well
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsSubmitting(true);
        try {

            let response = await OTPApiService.verifyOtp({
                email: formData.email,
                otp: formData.otp
            });
            window.console.log("otp verification", response);
            response = await AuthService.registrationDHISDev(formData);
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Registration Complete',
                message: 'Your account has been created successfully',
                type: 'success',
                options: {
                    willClose: () => {
                        // Scroll to top and redirect
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => {
                            window.location.href = '/main/login';
                        }, 500);
                    }
                }
            });
            
            window.console.log("RESPONSE---");
            window.console.log(response);
            window.console.log(response.code);
            window.console.log(response.data);
            window.console.log("***---");

        } catch (error) {
          console.error('Registration error:', error);

          // Check if it's a 409 conflict error
          if (error.httpStatusCode === 409 || error.status === 409) {
            // Handle 409 conflict - email already exists
            if (error.response?.errorReports) {
              const fieldErrors = {};

              error.response.errorReports.forEach(errorReport => {
                if (errorReport.errorProperty === 'username' && errorReport.errorCode === 'E4054') {
                  fieldErrors.email = 'This email address is already registered. Please use a different email or sign in instead.';
                }
              });

              // Set field errors
              setErrors(fieldErrors);
            } else {
              // Fallback for 409 without detailed error reports
              setErrors({
                email: 'This email address is already registered. Please use a different email or sign in instead.'
              });
            }

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
              title: 'Email Already Exists',
              message: 'This email is already registered. Please sign in or use a different email.',
              type: 'error'
            });
          } else if (error.status === 400 || error.code === 'ERR_BAD_REQUEST') {
            // Handle 400 Bad Request - likely Invalid OTP
            setErrors({
              otp: 'The verification code you entered is incorrect or has expired. Please check and try again.'
            });

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
              title: 'Invalid Verification Code',
              message: 'The verification code is incorrect or has expired. Please try again.',
              type: 'error'
            });
          } else if (error.error === 'Invalid OTP' || error.message === 'Invalid OTP') {
            // Handle Invalid OTP error (fallback)
            setErrors({
              otp: 'The verification code you entered is incorrect. Please check and try again.'
            });

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
              title: 'Invalid Verification Code',
              message: 'The verification code is incorrect. Please check and try again.',
              type: 'error'
            });
          } else {
            // Handle all other errors (keep your existing logic)
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
              title: 'Error',
              message: error.message || error.error || 'An unexpected error occurred.',
              type: 'error'
            });
          }

          // Scroll to top on error as well
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container fluid className="registration-container">
          <Row className="justify-content-center align-items-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={4}  className="form-column"> {/* Responsive column widths */}
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
                                {step === 1 && (
                                    <span>Already have an OTP? <a href="javascript:void(0);" onClick={() => setStep(2)}>Click here</a><br/></span>
                                    )}
                                {step === 2 && (
                                    <span>You do not have an OTP? <a href="javascript:void(0);" onClick={() => setStep(1)}>Request for an OTP here</a><br/></span>
                                    )}
                                <p className="text-muted">


                                    Already have an account? <a href="/main/login">Sign in</a>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Registration;