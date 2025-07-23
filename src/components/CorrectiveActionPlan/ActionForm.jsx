/**
 * Created by fulle on 2025/07/08.
 */
import React from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

const ActionForm = ({
                        action,
                        questions,
                        onSubmit,
                        onCancel
                    }) => {
    const [formData, setFormData] = React.useState(action || {
            id: '',
            title: '',
            description: '',
            deadline: '',
            linkedQuestionId: '',
            assignedTo: '',
            completed: false
        });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: formData.id || `action-${Date.now()}`
        });
    };

    return (
        <Card className="mb-4 border-primary">
            <Card.Header className="bg-primary text-white">
                <h5 className="mb- text-white">
                    {action ? "Edit Corrective Action" : "Add New Corrective Action"}
                </h5>
            </Card.Header>

            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Action Title *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter action title"
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Deadline *</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the corrective action..."
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Link to Question</Form.Label>
                                <Form.Select
                                    name="linkedQuestionId"
                                    value={formData.linkedQuestionId}
                                    onChange={handleChange}
                                >
                                    <option value="">None</option>
                                    {questions.map(question => (
                                        <option key={question.id} value={question.id}>
                                            Q{question.id.split('q')[1]}: {question.text.substring(0, 40)}...
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Optional: Link this action to a specific question
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Assigned To</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    placeholder="Assign to team member"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {action && (
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Mark as completed"
                                name="completed"
                                checked={formData.completed}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    completed: e.target.checked
                                }))}
                            />
                        </Form.Group>
                    )}

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="outline-secondary"
                            className="me-2"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {action ? "Update Action" : "Add Action"}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ActionForm;