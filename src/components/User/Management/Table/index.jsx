/**
 * Created by fulle on 2025/07/11.
 */
import React, { useState, useMemo } from 'react';
import {
    Table,
    Button,
    Badge,
    Form,
    Pagination,
    Spinner,
    OverlayTrigger,
    Tooltip,
    Card,
    InputGroup
} from 'react-bootstrap';
import {
    Pencil,
    Trash,
    Eye,
    PersonPlus,
    SortDown,
    SortUp,
    Search
} from 'react-bootstrap-icons';
import UserModal from './UserModal';
import ConfirmationModal from './ConfirmationModal';

const UserTable = ({
                       users,
                       loading,
                       totalPages,
                       currentPage,
                       onPageChange,
                       onSearch,
                       onDelete,
                       onUpdate,
                       onCreate
                   }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');

    // Handle sorting
    const sortedUsers = useMemo(() => {
        if (!users) return [];

        const sortableItems = [...users];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [users, sortConfig]);

    // Handle sorting UI
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    // Pagination items
    const paginationItems = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationItems.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => onPageChange(i)}
            >
                {i}
            </Pagination.Item>
        );
    }

    // Role badge colors
    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return 'primary';
            case 'manager': return 'info';
            case 'inspector': return 'success';
            case 'auditor': return 'warning';
            default: return 'secondary';
        }
    };

    // Status badge colors
    const getStatusBadge = (status) => {
        return status === 'active' ? 'success' : 'danger';
    };

    return (
        <div className="user-management-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>User Management</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        setSelectedUser(null);
                        setActionType('create');
                    }}
                >
                    <PersonPlus className="me-1" /> Add New User
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <div className="d-flex gap-2 flex-wrap">
                            <div className="flex-grow-1">
                                <InputGroup>
                                    <InputGroup.Text>
                                        <Search />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by name, email, or role..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        aria-label="Search users"
                                    />
                                    <Button variant="outline-primary" type="submit">
                                        Search
                                    </Button>
                                </InputGroup>
                            </div>

                            <div>
                                <Form.Select aria-label="Status filter">
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </Form.Select>
                            </div>

                            <div>
                                <Form.Select aria-label="Role filter">
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="inspector">Inspector</option>
                                    <option value="auditor">Auditor</option>
                                </Form.Select>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* User Table */}
            <Card className="shadow-sm">
                <div className="table-responsive">
                    <Table hover className="mb-0">
                        <thead>
                        <tr>
                            <th onClick={() => requestSort('name')} className="cursor-pointer">
                                <div className="d-flex align-items-center">
                                    Name
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'asc' ?
                                            <SortUp className="ms-1" /> :
                                            <SortDown className="ms-1" />
                                    )}
                                </div>
                            </th>
                            <th>Email</th>
                            <th onClick={() => requestSort('role')} className="cursor-pointer">
                                <div className="d-flex align-items-center">
                                    Role
                                    {sortConfig.key === 'role' && (
                                        sortConfig.direction === 'asc' ?
                                            <SortUp className="ms-1" /> :
                                            <SortDown className="ms-1" />
                                    )}
                                </div>
                            </th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">Loading users...</p>
                                </td>
                            </tr>
                        ) : sortedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-muted">
                                    <Search size={48} className="mb-3" />
                                    <h4>No users found</h4>
                                    <p>Try adjusting your search filters</p>
                                </td>
                            </tr>
                        ) : (
                            sortedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-2">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div>{user.name}</div>
                                                <small className="text-muted">ID: {user.id}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <Badge bg={getRoleBadge(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadge(user.status)}>
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {user.lastActive ?
                                            new Date(user.lastActive).toLocaleDateString() :
                                            'Never'}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>View Details</Tooltip>}
                                            >
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setActionType('view');
                                                    }}
                                                >
                                                    <Eye />
                                                </Button>
                                            </OverlayTrigger>

                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>Edit User</Tooltip>}
                                            >
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setActionType('edit');
                                                    }}
                                                >
                                                    <Pencil />
                                                </Button>
                                            </OverlayTrigger>

                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>Delete User</Tooltip>}
                                            >
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setActionType('delete');
                                                    }}
                                                >
                                                    <Trash />
                                                </Button>
                                            </OverlayTrigger>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </Table>
                </div>

                {/* Pagination */}
                {!loading && sortedUsers.length > 0 && (
                    <Card.Footer className="d-flex justify-content-between align-items-center">
                        <div className="text-muted">
                            Showing {sortedUsers.length} of {users.length} users on page {currentPage}
                        </div>

                        <Pagination className="mb-0">
                            <Pagination.First
                                disabled={currentPage === 1}
                                onClick={() => onPageChange(1)}
                            />
                            <Pagination.Prev
                                disabled={currentPage === 1}
                                onClick={() => onPageChange(currentPage - 1)}
                            />

                            {startPage > 1 && (
                                <Pagination.Ellipsis disabled />
                            )}

                            {paginationItems}

                            {endPage < totalPages && (
                                <Pagination.Ellipsis disabled />
                            )}

                            <Pagination.Next
                                disabled={currentPage === totalPages}
                                onClick={() => onPageChange(currentPage + 1)}
                            />
                            <Pagination.Last
                                disabled={currentPage === totalPages}
                                onClick={() => onPageChange(totalPages)}
                            />
                        </Pagination>
                    </Card.Footer>
                )}
            </Card>

            {/* Modals */}
            {actionType && ['view', 'edit', 'create'].includes(actionType) && (
                <UserModal
                    user={selectedUser}
                    show={actionType !== 'delete'}
                    onHide={() => setActionType(null)}
                    mode={actionType}
                    onSave={(userData) => {
                        if (actionType === 'create') {
                            onCreate(userData);
                        } else {
                            onUpdate(userData);
                        }
                        setActionType(null);
                    }}
                />
            )}

            {actionType === 'delete' && selectedUser && (
                <ConfirmationModal
                    show={actionType === 'delete'}
                    onHide={() => setActionType(null)}
                    onConfirm={() => {
                        onDelete(selectedUser.id);
                        setActionType(null);
                    }}
                    title="Confirm User Deletion"
                >
                    <p>
                        Are you sure you want to delete user <strong>{selectedUser.name}</strong>?
                    </p>
                    <p className="text-danger">
                        This action cannot be undone and will permanently remove all user data.
                    </p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default UserTable;