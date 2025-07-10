/**
 * Created by fulle on 2025/07/11.
 */
import React, { useState } from 'react';
import {
    Card,
    Button,
    Badge,
    ListGroup,
    Modal,
    Form
} from 'react-bootstrap';
import {
    Pencil,
    CalendarEvent,
    CheckCircle
} from 'react-bootstrap-icons';

const FacilityCard = ({ facility, onUpdate }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({ ...facility });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onUpdate(formData);
        setShowEditModal(false);
    };

    return (
        <>
        <Card className="h-100 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">{facility.name}</Card.Title>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                >
                    <Pencil size={14} />
                </Button>
            </Card.Header>
            <Card.Body>
                <div className="mb-3">
                    <div className="text-muted small">Address</div>
                    <div>{facility.address}</div>
                </div>

                <div className="mb-3">
                    <div className="text-muted small">Contact</div>
                    <div>{facility.contactName} • {facility.contactEmail}</div>
                </div>

                <div className="mb-3">
                    <div className="text-muted small d-flex align-items-center">
                        <CalendarEvent className="me-1" /> Upcoming Inspections
                    </div>
                    <ListGroup variant="flush">
                        {facility.inspections.map((inspection, idx) => (
                            <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div>{inspection.date}</div>
                                    <small className="text-muted">{inspection.type}</small>
                                </div>
                                <Badge bg={inspection.status === 'scheduled' ? 'primary' : 'warning'}>
                                    {inspection.status}
                                </Badge>
                            </ListGroup.Item>
                        ))}

                        {facility.inspections.length === 0 && (
                            <ListGroup.Item className="text-muted">
                                No upcoming inspections
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </div>

                <div className="d-flex justify-content-between">
                    <Badge bg="success" className="d-flex align-items-center">
                        <CheckCircle className="me-1" /> Active
                    </Badge>
                    <small className="text-muted">Assigned since: {facility.assignedDate}</small>
                </div>
            </Card.Body>
        </Card>

        {/* Edit Facility Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Update {facility.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Facility Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Contact Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Contact Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default FacilityCard;