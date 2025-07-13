/**
 * Created by fulle on 2025/07/10.
 */
import React from 'react';
import { ListGroup, Button, Card, Spinner } from 'react-bootstrap';

const FacilitySearchResults = ({ items, onAction, actionText, isLoading, disabled }) => {
    if (isLoading) {
        return (
            <div className="text-center my-4">
                <Spinner animation="border" />
                <p className="mt-2">Searching...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <Card className="mt-3">
                <Card.Body className="text-center text-muted py-4">
                    No facilities found. Try a search.
                </Card.Body>
            </Card>
        );
    }

    return (
        <ListGroup className="mt-3">
            {items.map(facility => {

                const {
                    facilityName,
                    newFacilityCode,
                    oldFacilityCode,
                    owner,
                    lng,
                    lat,
                    telephone,
                    operationalStatus,
                    facilityStatus
                } = facility;

                const isPublished = facilityStatus === 'PUBLISHED';
                const isOperational = facilityStatus === 'PUBLISHED';
                const operationalColor = isOperational ? 'success' : 'danger';
                const statusColor = isPublished ? 'success' : 'danger';
                return (
                    <ListGroup.Item key={newFacilityCode}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-2">{facilityName} - <span className="badge bg-info">{newFacilityCode}</span></h5>
                                <div className="d-flex mb-1">
                                    <span className={`badge bg-${statusColor} me-2`}>{facilityStatus}</span>
                                    <span className={`badge bg-${operationalColor} me-2`}>{operationalStatus}</span>
                                </div>
                                <div className="d-flex mb-1">
                                    <span className="text-muted me-2">Ownership</span>
                                    <span>{owner}</span>
                                </div>
                                <div className="d-flex mb-1">
                                    <span className="text-muted me-2">Contact</span>
                                    <span>{telephone}</span>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => onAction(facility)}
                                disabled={disabled || !isOperational || !isPublished || false}
                            >
                                {actionText}
                            </Button>
                        </div>
                    </ListGroup.Item>
                );
            })}
        </ListGroup>
    );
};

export default FacilitySearchResults;