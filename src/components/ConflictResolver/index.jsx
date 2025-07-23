/**
 * Created by fulle on 2025/07/07.
 */
import React, { useState } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import AnswerCard from './AnswerCard';
import ResolutionForm from './ResolutionForm';

const ConflictResolver = ({ question, onResolve }) => {
    const [selectedAnswerId, setSelectedAnswerId] = useState(null);
    const [isResolved, setIsResolved] = useState(false);

    // Check if all answers are the same
    const allAnswersSame = question.submissions.every(
        (sub, i, arr) => JSON.stringify(sub.answer) === JSON.stringify(arr[0].answer)
    );

    const handleResolve = (resolution) => {
        const resolvedQuestion = {
            ...question,
            resolution: {
                ...resolution,
                resolvedBy: "Reviewer Name", // Would come from auth context
                resolvedAt: new Date().toISOString()
            }
        };

        onResolve(resolvedQuestion);
        setIsResolved(true);
    };

    if (isResolved) {
        return (
            <Card className="mb-4 shadow-sm border-success">
                <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <h5 className="mb-0">{question.questionText}</h5>
                    <Badge bg="success" pill>
                        <i className="bi bi-check-circle me-1"></i> Resolved
                    </Badge>
                </Card.Header>
                <Card.Body className="text-center py-4">
                    <div className="text-success mb-3">
                        <i className="bi bi-check-circle-fill fs-1"></i>
                    </div>
                    <h5>Conflict Resolved</h5>
                    <p className="text-muted">
                        This question has been resolved and marked as complete
                    </p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <div>
                    <h5 className="mb-0">{question.questionText}</h5>
                    <div className="text-muted small mt-1">
                        <span>ID: {question.id}</span>
                        <span className="mx-2">•</span>
                        <span>Type: {question.type}</span>
                    </div>
                </div>
                <Badge bg={allAnswersSame ? "success" : "danger"} pill>
                    {allAnswersSame ? "Consistent" : "Conflict"}
                </Badge>
            </Card.Header>

            <Card.Body>
                <h6 className="mb-3">Submissions:</h6>
                <Row className="g-4">
                    {question.submissions.map(submission => (
                        <Col key={submission.id} md={6} lg={4}>
                            <AnswerCard
                                submission={submission}
                                questionType={question.type}
                                options={question.options}
                                isSelected={selectedAnswerId === submission.id}
                                onSelect={() => setSelectedAnswerId(submission.id)}
                            />
                        </Col>
                    ))}
                </Row>

                <ResolutionForm
                    questionType={question.type}
                    options={question.options}
                    onResolve={handleResolve}
                    selectedAnswer={
                        question.submissions.find(sub => sub.id === selectedAnswerId)?.answer
                    }
                />
            </Card.Body>
        </Card>
    );
};

export default ConflictResolver;