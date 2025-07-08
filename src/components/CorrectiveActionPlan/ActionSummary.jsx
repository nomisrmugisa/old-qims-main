/**
 * Created by fulle on 2025/07/08.
 */
import React from 'react';
import { ProgressBar, Card } from 'react-bootstrap';

const ActionSummary = ({ actions }) => {
    const completedCount = actions.filter(a => a.completed).length;
    const overdueCount = actions.filter(a =>
        !a.completed && new Date(a.deadline) < new Date()
    ).length;
    const pendingCount = actions.filter(a =>
        !a.completed && new Date(a.deadline) >= new Date()
    ).length;

    const completionPercentage = actions.length > 0
        ? Math.round((completedCount / actions.length) * 100)
        : 0;

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
                <h5 className="mb-0">Action Plan Summary</h5>
            </Card.Header>

            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h2 className="mb-0">{completionPercentage}%</h2>
                        <p className="text-muted mb-0">Complete</p>
                    </div>

                    <div className="text-end">
                        <div className="d-flex justify-content-end gap-4">
                            <div>
                                <h4 className="mb-0">{completedCount}</h4>
                                <small className="text-muted">Completed</small>
                            </div>
                            <div>
                                <h4 className="mb-0">{pendingCount}</h4>
                                <small className="text-muted">Pending</small>
                            </div>
                            <div>
                                <h4 className="mb-0 text-danger">{overdueCount}</h4>
                                <small className="text-muted">Overdue</small>
                            </div>
                        </div>
                    </div>
                </div>

                <ProgressBar
                    className="mb-4"
                    now={completionPercentage}
                    variant="success"
                    label={`${completionPercentage}%`}
                    style={{ height: '20px' }}
                />

                <div className="row">
                    <div className="col-md-4">
                        <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                                <i className="bi bi-calendar-check fs-1 text-primary mb-2"></i>
                                <h5>Upcoming Deadlines</h5>
                                {actions.filter(a => !a.completed && new Date(a.deadline) >= new Date())
                                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                                    .slice(0, 3)
                                    .map(action => (
                                        <div key={action.id} className="py-2 border-top">
                                            <div className="fw-bold">{action.title}</div>
                                            <small className="text-muted">
                                                Due: {new Date(action.deadline).toLocaleDateString()}
                                            </small>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                                <i className="bi bi-exclamation-triangle fs-1 text-danger mb-2"></i>
                                <h5>Overdue Actions</h5>
                                {overdueCount === 0 ? (
                                    <p className="text-success mt-3">No overdue actions</p>
                                ) : (
                                    actions.filter(a => !a.completed && new Date(a.deadline) < new Date())
                                        .slice(0, 3)
                                        .map(action => (
                                            <div key={action.id} className="py-2 border-top">
                                                <div className="fw-bold">{action.title}</div>
                                                <small className="text-danger">
                                                    Overdue since: {new Date(action.deadline).toLocaleDateString()}
                                                </small>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                                <i className="bi bi-check-circle fs-1 text-success mb-2"></i>
                                <h5>Recently Completed</h5>
                                {completedCount === 0 ? (
                                    <p className="text-muted mt-3">No completed actions yet</p>
                                ) : (
                                    actions.filter(a => a.completed)
                                        .sort((a, b) => new Date(b.updatedAt || b.deadline) - new Date(a.updatedAt || a.deadline))
                                        .slice(0, 3)
                                        .map(action => (
                                            <div key={action.id} className="py-2 border-top">
                                                <div className="fw-bold">{action.title}</div>
                                                <small className="text-muted">
                                                    Completed: {new Date(action.updatedAt || action.deadline).toLocaleDateString()}
                                                </small>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ActionSummary;