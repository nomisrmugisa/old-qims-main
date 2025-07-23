/**
 * Created by fulle on 2025/07/10.
 */
import React from 'react';
import { ListGroup, Button, Card, Spinner } from 'react-bootstrap';

const SearchResults = ({ items, onAction, actionText, isLoading, disabled }) => {
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
            {items.map(facility => (
                <ListGroup.Item key={facility.id}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1">{facility.name}</h5>
                            <p className="mb-1 text-muted">{facility.address}</p>
                            <small>Contact: {facility.contact}</small>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => onAction(facility)}
                            disabled={disabled || false}
                        >
                            {actionText}
                        </Button>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default SearchResults;