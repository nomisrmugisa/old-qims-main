/**
 * Created by fulle on 2025/07/12.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Form,
    Button,
    Spinner,
    Alert,
    ProgressBar,
    Row,
    Col,
    InputGroup,
    FormControl
} from 'react-bootstrap';
import {
    Key,
    CheckCircle,
    ShieldLock,
    Eye,
    EyeSlash,
    XCircle
} from 'react-bootstrap-icons';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import usePasswordChange from '../../../components/hooks/usePasswordChange';
import { eventBus, EVENTS } from '../../../events';
import zxcvbn from 'zxcvbn'; // Password strength estimator

const PasswordChanger = () => {
    const { changePassword, loading, error, success } = usePasswordChange();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: ''
    });
    const [touched, setTouched] = useState({
        newPassword: false,
        confirmPassword: false
    });

    // Password visibility toggle
    const togglePasswordVisibility = (field) => {
        setTouched(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Calculate password strength with debouncing
    const calculatePasswordStrength = useCallback((password) => {
        if (!password) {
            setPasswordStrength({ score: 0, feedback: '' });
            return;
        }

        const result = zxcvbn(password);
        setPasswordStrength({
            score: result.score,
            feedback: result.feedback.suggestions[0] || ''
        });
    }, []);

    // Debounced password strength calculation
    useEffect(() => {
        if (!formData.newPassword) return;

        const timer = setTimeout(() => {
            calculatePasswordStrength(formData.newPassword);
        }, 300);

        return () => clearTimeout(timer);
    }, [formData.newPassword, calculatePasswordStrength]);

    const getPasswordStrengthVariant = () => {
        switch (passwordStrength.score) {
            case 4: return 'success';
            case 3: return 'info';
            case 2: return 'warning';
            default: return 'danger';
        }
    };

    const getPasswordStrengthLabel = () => {
        switch (passwordStrength.score) {
            case 4: return 'Very Strong';
            case 3: return 'Strong';
            case 2: return 'Medium';
            case 1: return 'Weak';
            default: return 'Very Weak';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else {
            if (formData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            } else if (passwordStrength.score < 2) {
                newErrors.newPassword = 'Password is too weak';
            }

            // Common password check
            if (passwordStrength.score === 0) {
                newErrors.newPassword = 'Password is too common, choose a stronger one';
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Current and new password should be different
        if (formData.currentPassword && formData.newPassword &&
            formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'New password must be different from current password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        //eventBus.emit(EVENTS.LOADING_SHOW, { source: "Password Changer", method: "handleSubmit"});
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
            setPasswordStrength({ score: 0, feedback: '' });
        }
        //eventBus.emit(EVENTS.LOADING_HIDE, { source: "Password Changer", method: "handleSubmit"});
    };

    const handleReset = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordStrength({ score: 0, feedback: '' });
        setErrors({});
    };

    return (
        <Row className="w-100" style={{ maxWidth: '500px' }}>
            <Col>
                <Card className="shadow-sm">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                        <h3 className="mb-0 d-flex align-items-center">
                            <Key className="me-2" /> Change Password
                        </h3>
                        <Button
                            variant="link"
                            onClick={handleReset}
                            disabled={loading}
                            aria-label="Reset form"
                        >
                            <XCircle size={20} />
                        </Button>
                    </Card.Header>

                    <Card.Body>
                        {error && (
                            <Alert variant="danger" dismissible>
                                <strong>Error:</strong> {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert variant="success" dismissible>
                                <CheckCircle className="me-2" />
                                <strong>Success!</strong> {success}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            {/* Current Password */}
                            <div className="mb-4">
                                <Form.Group className="mb-3">

                                    <TextField
                                        fullWidth
                                        label="Current Password *"
                                        variant="outlined"
                                        type={touched.currentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, currentPassword: e.target.value }));
                                            if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: null }));
                                        }}
                                        isInvalid={!!errors.currentPassword}
                                        placeholder="Enter your current password"
                                        autoComplete="current-password"
                                        aria-describedby="currentPasswordHelp"


                                        error={!!errors.currentPassword}
                                        helperText={errors.currentPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => togglePasswordVisibility('currentPassword')}
                                                        edge="end"
                                                    >
                                                        {touched.currentPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.currentPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Text id="currentPasswordHelp" muted>
                                    Must match your current login password
                                </Form.Text>
                            </div>

                            {/* New Password */}
                            <div className="mb-4">
                                <Form.Group className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="New Password*"
                                        variant="outlined"
                                        type={touched.newPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                                            if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: null }));
                                        }}
                                        isInvalid={!!errors.newPassword}
                                        placeholder="Create a strong password"
                                        autoComplete="new-password"
                                        aria-describedby="passwordStrengthHelp"
                                        error={!!errors.newPassword}
                                        helperText={errors.newPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => togglePasswordVisibility('newPassword')}
                                                        edge="end"
                                                    >
                                                        {touched.newPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />


                                    <Form.Control.Feedback type="invalid">
                                        {errors.newPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <div className="mt-2">
                                    <div className="d-flex justify-content-between mb-1">
                                        <small>Password Strength: {getPasswordStrengthLabel()}</small>
                                        <small>{formData.newPassword.length} characters</small>
                                    </div>
                                    <ProgressBar
                                        now={passwordStrength.score * 25} // Convert 0-4 scale to 0-100
                                        variant={getPasswordStrengthVariant()}
                                        style={{ height: '6px' }}
                                    />

                                    {passwordStrength.feedback && (
                                        <div className="mt-2 text-small text-warning">
                                            <ShieldLock className="me-1" />
                                            {passwordStrength.feedback}
                                        </div>
                                    )}

                                    <div className="mt-2">
                                        <small className="text-muted d-block">
                                            Password must contain:
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
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-4">
                                <Form.Group className="mb-3">






                                    <TextField
                                        fullWidth
                                        label="Confirm New Password *"
                                        variant="outlined"
                                        type={touched.confirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
                                        }}
                                        isInvalid={!!errors.confirmPassword}
                                        placeholder="Confirm your new password"
                                        autoComplete="confirm-password"
                                        aria-describedby="confirmPasswordStrengthHelp"
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => togglePasswordVisibility('confirmPassword')}
                                                        edge="end"
                                                    >
                                                        {touched.confirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />


                                    <Form.Control.Feedback type="invalid">
                                        {errors.confirmPassword}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>

                            <div className="d-flex justify-content-between">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleReset}
                                    disabled={loading}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={loading || formData.newPassword !== formData.confirmPassword}
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
                            For security reasons:
                            <ul className="mb-0 mt-1">
                                <li>Password changes require re-authentication on all devices</li>
                                <li>Passwords must be changed every 90 days</li>
                                <li>Cannot reuse last 5 passwords</li>
                            </ul>
                        </div>
                    </Card.Footer>
                </Card>
            </Col>
        </Row>
    );
};

export default PasswordChanger;