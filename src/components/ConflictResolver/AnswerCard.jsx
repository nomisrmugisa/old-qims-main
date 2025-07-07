/**
 * Created by fulle on 2025/07/07.
 */
import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import AnswerRenderer from './AnswerRenderer';

const AnswerCard = ({
                        submission,
                        questionType,
                        options,
                        isSelected,
                        onSelect
                    }) => {
    return (
        <Card
            className={`h-100 cursor-pointer transition-all ${isSelected ? 'border-primary shadow-sm' : ''}`}
            onClick={onSelect}
        >
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                    <span className="fw-bold">{submission.userName}</span>
                    <span className="text-muted ms-2">({submission.userRole})</span>
                </div>
                <div>
                    {isSelected && (
                        <Badge bg="primary" pill>
                            <i className="bi bi-check me-1"></i>Selected
                        </Badge>
                    )}
                </div>
            </Card.Header>

            <Card.Body>
                <div className="mb-2">
                    <strong>Answer:</strong>
                    <div className="mt-2">
                        <AnswerRenderer
                            type={questionType}
                            answer={submission.answer}
                            options={options}
                        />
                    </div>
                </div>

                <div className="text-muted small">
                    <i className="bi bi-clock me-1"></i>
                    {new Date(submission.timestamp).toLocaleString()}
                </div>
            </Card.Body>
        </Card>
    );
};

export default AnswerCard;