/**
 * Created by fulle on 2025/07/11.
 */
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({
                               show,
                               onHide,
                               onConfirm,
                               title,
                               children,
                               confirmText = 'Confirm',
                               cancelText = 'Cancel',
                               variant = 'danger'
                           }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    {cancelText}
                </Button>
                <Button variant={variant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;