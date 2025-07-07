/**
 * Created by fulle on 2025/07/07.
 */
import React from 'react';
import { Badge, ListGroup } from 'react-bootstrap';

const AnswerRenderer = ({ type, answer, options }) => {
    if (!answer) return <div className="text-muted">No answer provided</div>;

    switch (type) {
        case 'single-choice':
            return (
                <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                        <i className="bi bi-check-lg"></i>
                    </div>
                    <strong>{answer[0]}</strong>
                </div>
            );

        case 'multiple-choice':
            return (
                <ListGroup variant="flush">
                    {options.map(option => (
                        <ListGroup.Item key={option} className="d-flex align-items-center py-1 px-0 border-0">
                            <div className={`rounded-circle border me-2 ${answer.includes(option) ? 'bg-primary border-primary' : 'border-secondary'}`} style={{ width: '18px', height: '18px' }}>
                                {answer.includes(option) && <i className="bi bi-check text-white"></i>}
                            </div>
                            <span className={answer.includes(option) ? 'fw-bold' : 'text-muted'}>{option}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            );

        case 'text':
            return (
                <div className="border rounded p-3 bg-light">
                    {answer}
                </div>
            );

        default:
            return <div>{answer}</div>;
    }
};

export default AnswerRenderer;