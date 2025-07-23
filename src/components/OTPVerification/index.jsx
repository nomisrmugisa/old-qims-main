/**
 * Created by fulle on 2025/07/10.
 */
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const OTPVerification = ({ show, onHide, onVerify, facility }) => {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp.trim()) {
            setError('Please enter OTP');
            return;
        }

        setIsVerifying(true);
        try {
            // Simulate verification
            await new Promise(resolve => setTimeout(resolve, 800));
            onVerify(otp);
        } catch (err) {
            setError('OTP verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>OTP Verification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {facility && (
                    <div className="mb-3">
                        <p>
                            An OTP has been sent to <strong>{facility.contact}</strong> for
                            enrolling at <strong>{facility.name}</strong>.
                        </p>
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="otpInput">
                        <Form.Label>Enter OTP</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            disabled={isVerifying}
                        />
                    </Form.Group>

                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                    <div className="d-grid mt-3">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isVerifying || !otp.trim()}
                        >
                            {isVerifying ? (
                                <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Verifying...
                                </>
                            ) : 'Verify & Enrol'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="link" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="link" onClick={() => alert('Resend OTP functionality would trigger here')}>
                    Resend OTP
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default OTPVerification;