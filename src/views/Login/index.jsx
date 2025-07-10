/**
 * Created by fulle on 2025/07/05.
 */
import React, { useState, useEffect } from 'react';
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

    const getFacilityList = () => {
        MFLApiService.allFacilities();
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

            const response = await AuthService.me({
                username: formData.email,
                password: formData.password
            });

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Login Successful',
                message: 'Welcome back!',
                type: 'success',
                options: {
                    willClose: () => navigate('/dashboard')
                }
            });
            window.console.log("RESPONSE---");
            window.console.log(response);
            StorageService.set(STORAGE_KEYS.USER_DATA, response);
            window.console.log("***---");

            /*const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store tokens and user data (implementation depends on your auth system)
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));

                eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                    title: 'Login Successful',
                    message: 'Welcome back!',
                    type: 'success',
                    options: {
                        willClose: () => navigate('/dashboard')
                    }
                });
            } else {
                throw new Error(data.message || 'Login failed');
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
                                    <Link to="/main/forgot-password" className="text-decoration-none">
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

                            <div className="text-center mt-4">
                                <Button onClick={getFacilityList}>Facility List</Button>
                                <p className="text-muted">
                                    Don't have an account? <Link to="/main/register" className="text-decoration-none">Sign up</Link>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>


            </Row>
        </Container>
    );
};

export default Login;