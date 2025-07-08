/**
 * Created by fulle on 2025/07/08.
 */
import React from 'react';
import ActionCard from './ActionCard';

const ActionList = ({ actions, onEdit, onDelete }) => {
    if (actions.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-clipboard-check fs-1 text-muted"></i>
                <h4 className="mt-3">No Corrective Actions</h4>
                <p className="text-muted">
                    Add corrective actions to address issues identified in the form
                </p>
            </div>
        );
    }

    return (
        <div className="action-list">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Corrective Actions ({actions.length})</h4>
                <div className="text-muted small">
                    {actions.filter(a => a.completed).length} completed •
                    {actions.filter(a => !a.completed && new Date(a.deadline) < new Date()).length} overdue
                </div>
            </div>

            <div className="action-cards">
                {actions.map(action => (
                    <ActionCard
                        key={action.id}
                        action={action}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActionList;