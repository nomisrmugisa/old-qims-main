/**
 * Created by fulle on 2025/07/10.
 */
import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

const FacilitySearchForm = ({ onSearch, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearch(searchTerm.trim());
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder={placeholder || "Search facilities..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Facility search"
                />
                <Button
                    variant="primary"
                    type="submit"
                    disabled={!searchTerm.trim()}
                >
                    Search
                </Button>
            </InputGroup>
        </Form>
    );
};

export default FacilitySearchForm;