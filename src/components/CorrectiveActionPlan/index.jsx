/**
 * Created by fulle on 2025/07/08.
 */
import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import ActionForm from './ActionForm';
import ActionList from './ActionList';
import ActionSummary from './ActionSummary';

const CorrectiveActionPlan = ({ resolvedForm }) => {
    const [actions, setActions] = useState([]);
    const [editingAction, setEditingAction] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'summary'

    const handleAddAction = (action) => {
        if (editingAction) {
            // Update existing action
            setActions(prev =>
                prev.map(a => a.id === action.id ? { ...action, updatedAt: new Date().toISOString() } : a)
            );
            setEditingAction(null);
        } else {
            // Add new action
            setActions(prev => [...prev, {
                ...action,
                createdAt: new Date().toISOString()
            }]);
        }
        setShowForm(false);
    };

    const handleEditAction = (action) => {
        setEditingAction(action);
        setShowForm(true);
    };

    const handleDeleteAction = (id) => {
        setActions(prev => prev.filter(action => action.id !== id));
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingAction(null);
    };

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1>Corrective Action Plan</h1>
                            <p className="lead text-muted">
                                Address issues identified in: {resolvedForm.title}
                            </p>
                        </div>
                        <div>
                            <Button variant="outline-primary" className="me-2">
                                <i className="bi bi-download me-1"></i> Export Plan
                            </Button>
                        </div>
                    </div>

                    <Card className="mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <Badge bg="info" className="me-2">
                                        Resolved Form
                                    </Badge>
                                    <span className="text-muted">
                    ID: {resolvedForm.id} | Resolved by: {resolvedForm.resolvedBy} |
                    Date: {new Date(resolvedForm.resolvedAt).toLocaleDateString()}
                  </span>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={viewMode === 'summary' ? 'primary' : 'outline-primary'}
                                        size="sm"
                                        onClick={() => setViewMode('summary')}
                                    >
                                        <i className="bi bi-bar-chart me-1"></i> Summary
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <i className="bi bi-list-ul me-1"></i> List View
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    {showForm ? (
                        <ActionForm
                            action={editingAction}
                            questions={resolvedForm.questions}
                            onSubmit={handleAddAction}
                            onCancel={handleCancelForm}
                        />
                    ) : (
                        <div className="d-flex justify-content-end mb-4">
                            <Button
                                variant="success"
                                onClick={() => {
                                    setEditingAction(null);
                                    setShowForm(true);
                                }}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Add Corrective Action
                            </Button>
                        </div>
                    )}

                    {viewMode === 'summary' ? (
                        <ActionSummary actions={actions} />
                    ) : (
                        <ActionList
                            actions={actions}
                            onEdit={handleEditAction}
                            onDelete={handleDeleteAction}
                        />
                    )}

                    {actions.length > 0 && (
                        <div className="mt-4 d-flex justify-content-between">
                            <div>
                                <Button variant="outline-primary" className="me-2">
                                    <i className="bi bi-printer me-1"></i> Print Plan
                                </Button>
                                <Button variant="outline-success">
                                    <i className="bi bi-check-circle me-1"></i> Finalize Plan
                                </Button>
                            </div>
                            <div className="text-muted">
                                {actions.length} actions created •
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CorrectiveActionPlan;