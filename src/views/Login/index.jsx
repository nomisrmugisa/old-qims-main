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
import LoginForm from '../../components/Forms/Email2FALogin';
//import LoginForm from '../../components/Forms/Login';

import './index.css';
import { AuthService, MFLApiService, StorageService } from '../../services';

const Login = () => {

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

                            <LoginForm />

                        </Card.Body>
                    </Card>
                </Col>


            </Row>
        </Container>
    );
};

export default Login;