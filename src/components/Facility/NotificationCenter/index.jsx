/**
 * Created by fulle on 2025/07/11.
 */
import React, { useState, useEffect } from 'react';
import {
    Card,
    ListGroup,
    Button,
    Badge,
    Form
} from 'react-bootstrap';
import { Bell, Check2Circle } from 'react-bootstrap-icons';

const NotificationCenter = ({ notifications, onMarkRead }) => {
    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        return true;
    });

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Notifications</h3>
                <div className="d-flex">
                    <Form.Select
                        size="sm"
                        className="me-2"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Notifications</option>
                        <option value="unread">Unread Only</option>
                    </Form.Select>
                    <Button variant="outline-secondary" size="sm">
                        <Check2Circle className="me-1" /> Mark All Read
                    </Button>
                </div>
            </Card.Header>

            <Card.Body className="p-0">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <Bell size={48} className="mb-3" />
                        <h4>No notifications</h4>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    <ListGroup variant="flush">
                        {filteredNotifications.map(notification => (
                            <ListGroup.Item
                                key={notification.id}
                                className={!notification.read ? 'bg-light' : ''}
                            >
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h5 className="mb-1">{notification.title}</h5>
                                        <p className="mb-1">{notification.message}</p>
                                        <small className="text-muted">{notification.date}</small>
                                    </div>
                                    <div>
                                        {!notification.read && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => onMarkRead(notification.id)}
                                            >
                                                Mark Read
                                            </Button>
                                        )}
                                        {notification.read && (
                                            <Badge bg="secondary">Read</Badge>
                                        )}
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default NotificationCenter;