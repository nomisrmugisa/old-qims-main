/**
 * Created by fulle on 2025/07/05.
 */
import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { TextField } from '@mui/material';
import { eventBus, EVENTS } from '../../events';
import { validateEmail } from '../../utils/validators';
import { AuthService } from '../../services';

const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};

        if (!email) validationErrors.email = 'Email is required';
        else if (!validateEmail(email)) validationErrors.email = 'Invalid email format';

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        window.console.log("submitting reset password");
        try {
            // Replace with your actual API call
            const response = await AuthService.forgotPassword({
                email: email
            });
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Success',
                message: 'Password reset OTP sent to your email',
                type: 'success'
            });
            setEmail('');
            window.console.log("RESPONSE---");
            window.console.log(response);
            window.console.log("***---");

        } catch (error) {
            if (error?.response?.status === 401) {
                eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                    title: 'Authentication Failed',
                    message: 'Your session has expired. Please log in again.',
                    type: 'error'
                });
            } else {
                eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                    title: 'Error',
                    message: error.message || 'Failed to send reset instructions',
                    type: 'error'
                });
            }
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
                            <h2 className="text-center mb-4">Forgot Password</h2>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        variant="outlined"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="w-100 cta-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send One Time Password'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                <a href="/main/">Back to Home</a>
                            </div>
                            <div className="text-center mt-3">
                                <a href="/main/reset-password" class="font-12">I already have a Reset One Time Password</a>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

};

export default ForgotPassword;