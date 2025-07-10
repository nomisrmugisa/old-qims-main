/**
 * Created by fulle on 2025/07/10.
 */
import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';

const UserSearch = ({ onSearch, onSelect, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim()) {
                performSearch(searchTerm.trim());
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const performSearch = async (term) => {
        setIsLoading(true);
        try {
            const users = await onSearch(term);
            setResults(users);
        } catch (error) {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="user-search-container">
            <Form>
                <Form.Control
                    type="text"
                    placeholder={placeholder || "Search users..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="User search"
                />
            </Form>

            {isLoading && (
                <div className="text-center my-2">
                    <Spinner animation="border" size="sm" />
                </div>
            )}

            {results.length > 0 && (
                <ListGroup className="mt-2 shadow-sm">
                    {results.map(user => (
                        <ListGroup.Item
                            key={user.id}
                            action
                            onClick={() => onSelect(user)}
                            className="d-flex justify-content-between align-items-start"
                        >
                            <div>
                                <div>{user.name}</div>
                                <small className="text-muted">{user.email}</small>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default UserSearch;