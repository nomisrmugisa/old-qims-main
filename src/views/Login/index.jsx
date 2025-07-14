/**
 * Created by fulle on 2025/07/05.
 */
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { eventBus, EVENTS } from '../../events';
import loginIllustration from '../../assets/logo.png'; // Add your image

import './index.css';
import { AuthService, MFLApiService, StorageService } from '../../services';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Login request timed out. Please check your internet connection and try again.')), 15000)
            );

            const loginPromise = AuthService.me({
                username: formData.email,
                password: formData.password
            });

            const response = await Promise.race([loginPromise, timeoutPromise]);

            window.console.log("RESPONSE---");
            window.console.log(response);
            await StorageService.setUserData(response);
            window.console.log("***---");

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Login Successful',
                message: 'Welcome back!',
                type: 'success',
                options: {
                    willClose: () => navigate('/dashboard')
                }
            });

        } catch (error) {
            window.console.error('Login error:', error);
            
            let errorMessage = '';
            let errorTitle = 'Login Failed';
            
            // Handle specific error types
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                switch (status) {
                    case 400:
                        errorMessage = 'Invalid request. Please check your email and password format.';
                        break;
                    case 401:
                        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                        break;
                    case 403:
                        errorMessage = 'Access denied. Your account may be locked or you don\'t have permission to access this system.';
                        break;
                    case 404:
                        errorMessage = 'Login service not found. Please contact support if this problem persists.';
                        break;
                    case 410:
                        errorMessage = 'Your account has expired. Please contact your administrator to renew your account.';
                        break;
                    case 423:
                        errorMessage = 'Two-factor authentication is required for your account. Please enable 2FA and try again.';
                        break;
                    case 429:
                        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Our team has been notified. Please try again in a few minutes.';
                        break;
                    case 502:
                    case 503:
                    case 504:
                        errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
                        break;
                    default:
                        errorMessage = `Login failed (${status}). Please try again or contact support if the problem persists.`;
                }
            } else if (error.request) {
                // Network error
                if (error.message.includes('timeout')) {
                    errorMessage = 'Request timed out. Please check your internet connection and try again.';
                } else if (error.message.includes('Network Error')) {
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                } else {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
                }
            } else {
                // Other errors
                if (error.message.includes('timeout')) {
                    errorMessage = 'Request timed out. Please check your internet connection and try again.';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
                } else if (error.message.includes('CORS')) {
                    errorMessage = 'Cross-origin request blocked. Please contact support if this problem persists.';
                } else {
                    errorMessage = error.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.';
                }
            }
            
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: errorTitle,
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container fluid className="login-container">
            <Row className="h-100">

                {/* Illustration Column - Hidden on mobile, visible on lg+ */}
                <Col lg={6} className="d-none d-lg-flex illustration-column align-items-center justify-content-center">
                    <div className="text-center p-5">
                        <img
                            src={loginIllustration}
                            alt="Login"
                            className="img-fluid mb-4"
                            style={{ maxHeight: '400px' }}
                        />
                        <h3>Welcome Back</h3>
                        <p className="text-muted">
                            Sign in to access your personalized dashboard
                        </p>
                        <ul className="text-start mt-4">
                            <li>Track your progress</li>
                            <li>Access saved content</li>
                            <li>Continue where you left off</li>
                        </ul>
                    </div>
                </Col>

                {/* Form Column - Full width on mobile, half on larger screens */}
                <Col xs={12} lg={6} className="form-column d-flex align-items-center justify-content-center">
                    <Card className="login-card">
                        <Card.Body>
                            <div className="text-center mb-4">
                                <h2>Welcome Back</h2>
                                <p className="text-muted">Sign in to your account</p>
                            </div>

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
                                        autoFocus
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        variant="outlined"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3 d-flex align-items-center">
                                    <Form.Check
                                        type="checkbox"
                                        id="rememberMe"
                                        label="Remember me"
                                        className="me-2"
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end mb-3">
                                    <Link to="/forgot-password" className="text-decoration-none">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </Form>

                        </Card.Body>
                    </Card>
                </Col>


            </Row>
        </Container>
    );
};

export default Login;