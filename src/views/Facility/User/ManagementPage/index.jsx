/**
 * Created by fulle on 2025/07/11.
 */
// pages/UserManagementPage.jsx
import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import UserTable from '../../../../components/User/Management/Table';
import useUserManagement from '../../../../components/hooks/useUserManagement';

const FacilityUserManagementPage = () => {
    const {
        users,
        loading,
        error,
        pagination,
        handlePageChange,
        handleSearch,
        handleCreateUser,
        handleUpdateUser,
        handleDeleteUser
    } = useUserManagement();

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>User Management</h1>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <UserTable
                users={users}
                loading={loading}
                totalPages={pagination.totalPages}
                currentPage={pagination.currentPage}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                onDelete={handleDeleteUser}
                onUpdate={handleUpdateUser}
                onCreate={handleCreateUser}
            />

            <div className="mt-4 text-center text-muted small">
                <p>
                    Showing {users.length} of {pagination.totalItems} users •
                    Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <p className="mb-0">
                    Only administrators can manage user accounts and permissions
                </p>
            </div>
        </Container>
    );
};

export default FacilityUserManagementPage;