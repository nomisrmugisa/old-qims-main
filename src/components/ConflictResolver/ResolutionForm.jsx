/**
 * Created by fulle on 2025/07/07.
 */
import React, { useState } from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';

const ResolutionForm = ({
                            questionType,
                            options,
                            onResolve,
                            onOverride,
                            selectedAnswer
                        }) => {
    const [justification, setJustification] = useState('');
    const [overrideAnswer, setOverrideAnswer] = useState(
        questionType === 'multiple-choice' ? [] : ''
    );
    const [resolutionMode, setResolutionMode] = useState('select'); // 'select' or 'override'

    const handleSubmit = (e) => {
        e.preventDefault();

        if (resolutionMode === 'select') {
            onResolve({
                answer: selectedAnswer,
                justification,
                resolutionType: 'selected'
            });
        } else {
            onResolve({
                answer: overrideAnswer,
                justification,
                resolutionType: 'override'
            });
        }
    };

    const handleCheckboxChange = (option) => {
        setOverrideAnswer(prev =>
            prev.includes(option)
                ? prev.filter(item => item !== option)
                : [...prev, option]
        );
    };

    return (
        <Card className="border-top mt-4">
            <Card.Header className="bg-light">
                <h5 className="mb-0">Resolution Decision</h5>
            </Card.Header>

            <Card.Body>
                <div className="d-flex mb-3">
                    <Button
                        variant={resolutionMode === 'select' ? 'primary' : 'outline-primary'}
                        className="me-2"
                        onClick={() => setResolutionMode('select')}
                    >
                        <i className="bi bi-check-circle me-2"></i>
                        Select Existing Answer
                    </Button>
                    <Button
                        variant={resolutionMode === 'override' ? 'primary' : 'outline-primary'}
                        onClick={() => setResolutionMode('override')}
                    >
                        <i className="bi bi-pencil-square me-2"></i>
                        Override Answer
                    </Button>
                </div>

                {resolutionMode === 'override' && (
                    <div className="mb-4">
                        <h6>Override Answer</h6>

                        {questionType === 'single-choice' && (
                            <div className="d-flex flex-column gap-2">
                                {options.map(option => (
                                    <div key={option} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="overrideAnswer"
                                            id={`option-${option}`}
                                            checked={overrideAnswer === option}
                                            onChange={() => setOverrideAnswer(option)}
                                        />
                                        <label className="form-check-label" htmlFor={`option-${option}`}>
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {questionType === 'multiple-choice' && (
                            <div className="d-flex flex-column gap-2">
                                {options.map(option => (
                                    <div key={option} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`option-${option}`}
                                            checked={overrideAnswer.includes(option)}
                                            onChange={() => handleCheckboxChange(option)}
                                        />
                                        <label className="form-check-label" htmlFor={`option-${option}`}>
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {questionType === 'text' && (
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={overrideAnswer}
                                onChange={(e) => setOverrideAnswer(e.target.value)}
                                placeholder="Enter your answer..."
                            />
                        )}
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Justification <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Explain why you selected this answer..."
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            required
                        />
                        <Form.Text className="text-muted">
                            This explanation will be visible to all users in the audit trail.
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={!justification.trim()}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Resolve Conflict
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ResolutionForm;