/**
 * Created by fulle on 2025/07/23.
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import {UserService} from '../../../services';
import { eventBus, EVENTS } from '../../../events';

const UserProfileModal = ({ show, onHide, currentUser }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        surname: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {

            setFormData({
                firstName: currentUser.firstName !== currentUser.email ? currentUser.firstName : '',
                surname: currentUser.surname !== currentUser.email ? currentUser.surname : ''
            });
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await UserService.updateProfile(formData);
            onHide(true); // Pass success indicator
            // Show success notification
        } catch (error) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: error.message || 'Operation failed. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={() => onHide(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Update Profile</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Surname</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.surname}
                            onChange={(e) => setFormData({...formData, surname: e.target.value})}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => onHide(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UserProfileModal;