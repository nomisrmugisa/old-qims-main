/**
 * Created by fulle on 2025/07/08.
 */
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Alert, Row, Col, ProgressBar } from 'react-bootstrap';
import SignaturePad from '../../components/SignaturePad';
import ActionBar from '../../components/ActionBar';

const InspectionFinalReportPage = () => {
    const [notes, setNotes] = useState('');
    const [signature, setSignature] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [formTouched, setFormTouched] = useState(false);

    // Calculate completion percentage
    useEffect(() => {
        let completion = 0;
        if (notes.trim().length > 10) completion += 50;
        if (signature) completion += 50;
        setProgress(completion);
    }, [notes, signature]);

    const validateForm = () => {
        if (!notes.trim()) {
            setError('Final notes are required');
            return false;
        }

        if (notes.trim().length < 20) {
            setError('Notes must be at least 20 characters');
            return false;
        }

        if (!signature) {
            setError('Signature is required');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSuccess('');

        try {
            // Simulate API submission with progress
            const simulateUpload = () => {
                return new Promise((resolve) => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        setProgress(100 * (progress / 100));
                        if (progress >= 100) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 200);
                });
            };

            await simulateUpload();

            // In real app: await api.submitFinalNotes({ notes, signature });
            setSuccess('Submission completed successfully!');
            setFormTouched(false);

            // Reset form after success
            setTimeout(() => {
                setNotes('');
                setSignature(null);
                setSuccess('');
                setIsSubmitting(false);
                setProgress(0);
            }, 3000);

        } catch (err) {
            setError('Submission failed: ' + err.message);
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (formTouched && !window.confirm('Are you sure? All changes will be lost.')) {
            return;
        }
        // Navigation logic would go here
        console.log('Navigation cancelled');
    };

    const handleReset = () => {
        if (window.confirm('Reset all fields?')) {
            setNotes('');
            setSignature(null);
            setError('');
            setFormTouched(false);
        }
    };

    const handleInputChange = (e) => {
        setNotes(e.target.value);
        setFormTouched(true);
    };

    return (

    <Container className="py-4">
        <Card className="shadow-sm">
            <Card.Header className="bg-light">
                <h2 className="mb-0">Inspection Final Notes Submission</h2>
                <p className="text-muted mb-0">
                    Complete your case documentation with final notes and signature
                </p>
            </Card.Header>

            <Card.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <div className="mb-4">
                    <h5>Completion Progress</h5>
                    <ProgressBar
                        now={progress}
                        label={`${progress}%`}
                        visuallyHidden
                        animated
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <small>0%</small>
                        <small>50%</small>
                        <small>100%</small>
                    </div>
                </div>

                <Row>
                    <Col md={7}>
                        <Form.Group controlId="finalNotes" className="mb-4">
                            <Form.Label>
                                <strong>Final Notes</strong>
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                value={notes}
                                onChange={handleInputChange}
                                placeholder="Enter detailed final notes..."
                                required
                                disabled={isSubmitting}
                                aria-describedby="notesHelp"
                            />
                            <Form.Text id="notesHelp" muted>
                                Minimum 20 characters. Include all relevant observations and conclusions.
                            </Form.Text>
                        </Form.Group>
                    </Col>

                    <Col md={5}>
                        <Form.Group controlId="signatureSection">
                            <Form.Label>
                                <strong>Signature</strong>
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <SignaturePad
                                onSave={setSignature}
                                signatureData={signature}
                            />
                            <Form.Text muted>
                                Draw your signature above and click "Save Signature"
                            </Form.Text>
                        </Form.Group>

                        {signature && (
                            <div className="mt-4">
                                <h6>Signature Preview</h6>
                                <img
                                    src={signature}
                                    alt="Signature preview"
                                    className="img-thumbnail"
                                    style={{ maxWidth: '200px' }}
                                />
                            </div>
                        )}
                    </Col>
                </Row>
            </Card.Body>

            <Card.Footer className="bg-light">
                <ActionBar
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onReset={handleReset}
                    isSubmitting={isSubmitting}
                    disableSubmit={progress < 100 || isSubmitting}
                />
            </Card.Footer>
        </Card>

        {/* Audit trail section */}
        <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-light">
                <h5 className="mb-0">Submission Audit Trail</h5>
            </Card.Header>
            <Card.Body>
                <div className="text-muted">
                    {signature ? (
                        <ul>
                            <li>Draft started: {new Date().toLocaleString()}</li>
                            <li>Last signature saved: {new Date().toLocaleTimeString()}</li>
                            <li>Progress: {progress}% complete</li>
                        </ul>
                    ) : (
                        <p>No audit data available. Start drafting to begin tracking.</p>
                    )}
                </div>
            </Card.Body>
        </Card>
    </Container>
    );
};

export default InspectionFinalReportPage;