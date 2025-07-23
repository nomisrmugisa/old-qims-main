/**
 * Created by fulle on 2025/07/07.
 */
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import ConflictResolver from '../../components/ConflictResolver';
import conflictData from '../../data/conflictData.json';

const ConflictResolutionPage = () => {
    const [questions, setQuestions] = useState(conflictData);
    const [resolvedCount, setResolvedCount] = useState(0);

    const handleResolve = (resolvedQuestion) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === resolvedQuestion.id ? resolvedQuestion : q
            )
        );
        setResolvedCount(prev => prev + 1);
    };

    const unresolvedQuestions = questions.filter(q => !q.resolution);
    const progress = Math.round((resolvedCount / questions.length) * 100);

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1>Conflict Resolution</h1>
                            <p className="lead text-muted">
                                Review and resolve conflicting answers for form submissions
                            </p>
                        </div>
                        <Button variant="outline-primary">
                            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
                        </Button>
                    </div>

                    <Card className="mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="mb-0">Resolution Progress</h5>
                                    <p className="text-muted mb-0">
                                        {resolvedCount} of {questions.length} questions resolved
                                    </p>
                                </div>
                                <Badge bg="info" pill>
                                    {progress}% Complete
                                </Badge>
                            </div>

                            <ProgressBar
                                now={progress}
                                variant={progress === 100 ? "success" : "primary"}
                                className="mb-3"
                                style={{ height: '10px' }}
                            />

                            <div className="d-flex justify-content-end">
                                <Button variant="success" disabled={unresolvedQuestions.length > 0}>
                                    <i className="bi bi-check-circle me-1"></i>
                                    Finalize Resolution
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className="alert alert-info d-flex align-items-center">
                        <i className="bi bi-info-circle me-2 fs-4"></i>
                        <div>
                            <strong>Review Instructions:</strong> Review each question with conflicting answers.
                            Select the correct answer or override with a new answer, then provide justification
                            for your decision.
                        </div>
                    </div>

                    {questions.map(question => (
                        <ConflictResolver
                            key={question.id}
                            question={question}
                            onResolve={handleResolve}
                        />
                    ))}
                </Col>
            </Row>
        </Container>
    );
};

export default ConflictResolutionPage;