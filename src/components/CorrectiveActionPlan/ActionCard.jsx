/**
 * Created by fulle on 2025/07/08.
 */
import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { format } from 'date-fns';

const ActionCard = ({ action, onEdit, onDelete }) => {
    const getStatusVariant = () => {
        if (action.completed) return "success";
        if (new Date(action.deadline) < new Date()) return "danger";
        return "primary";
    };

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="mb-0">{action.title}</h5>
                    {action.linkedQuestionId && (
                        <Badge bg="info" className="ms-2">
                            Linked to Q{action.linkedQuestionId.split('q')[1]}
                        </Badge>
                    )}
                </div>
                <Badge bg={getStatusVariant()} pill>
                    {action.completed ? "Completed" :
                        new Date(action.deadline) < new Date() ? "Overdue" : "Pending"}
                </Badge>
            </Card.Header>

            <Card.Body>
                <div className="mb-2">
                    <p className="mb-0">{action.description}</p>
                </div>

                <div className="d-flex justify-content-between text-muted small">
                    <div>
                        <strong>Deadline:</strong> {format(new Date(action.deadline), 'MMM dd, yyyy')}
                    </div>
                    <div>
                        <strong>Assigned to:</strong> {action.assignedTo || "Unassigned"}
                    </div>
                </div>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-end bg-white">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(action)}
                >
                    <i className="bi bi-pencil"></i> Edit
                </Button>
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(action.id)}
                >
                    <i className="bi bi-trash"></i> Delete
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default ActionCard;