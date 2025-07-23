/**
 * Created by fulle on 2025/07/08.
 */
// NotesForm.jsx
import { Form } from 'react-bootstrap';

const NotesForm = ({ notes, onNotesChange }) => (
    <Form.Group controlId="finalNotes">
        <Form.Label>Final Notes</Form.Label>
        <Form.Control
            as="textarea"
            rows={5}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Enter final comments"
            required
            className="mb-4"
        />
    </Form.Group>
);