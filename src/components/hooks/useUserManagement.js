/**
 * Created by fulle on 2025/07/11.
 */
import { useState, useEffect, useCallback } from 'react';

const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 0
    });

    const fetchUsers = useCallback(async (page = 1, searchTerm = '') => {
        setLoading(true);
        setError(null);

        try {
            // Simulate API call with delay
            //await new Promise(resolve => setTimeout(resolve, 800));


            // In real app:
            // const response = await api.getUsers(page, pagination.pageSize, searchTerm);
            // setUsers(response.data);
            // setPagination(prev => ({
            //   ...prev,
            //   currentPage: page,
            //   totalPages: response.totalPages,
            //   totalItems: response.totalItems
            // }));

            // Mock data
            const mockUsers = Array.from({ length: 25 }, (_, i) => ({
                id: `user-${page}-${i}`,
                name: `User ${page}-${i} ${searchTerm ? `(${searchTerm})` : ''}`,
                email: `user${page}${i}@example.com`,
                role: ['admin', 'manager', 'inspector', 'auditor'][i % 4],
                status: i % 5 === 0 ? 'inactive' : 'active',
                phone: `+1 (555) 555-${i.toString().padStart(4, '0')}`,
                lastActive: i % 3 === 0 ? null : Date.now() - (i * 86400000),
                facilities: i % 3 === 0 ? [] : [`Facility ${i % 5}`]
            }));

            setUsers(mockUsers);
            setPagination(prev => ({
                ...prev,
                currentPage: page,
                totalPages: 3,
                totalItems: 25
            }));
        } catch (err) {
            setError('Failed to fetch users: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize]);

    useEffect(() => {
        fetchUsers(pagination.currentPage);
    }, [fetchUsers, pagination.currentPage]);

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleSearch = (term) => {
        fetchUsers(1, term);
    };

    const handleCreateUser = (userData) => {
        // In real app: API call to create user
        setUsers(prev => [{
            ...userData,
            id: `user-new-${Date.now()}`,
            lastActive: null
        }, ...prev]);
    };

    const handleUpdateUser = (userData) => {
        // In real app: API call to update user
        setUsers(prev => prev.map(user =>
            user.id === userData.id ? { ...user, ...userData } : user
        ));
    };

    const handleDeleteUser = (userId) => {
        // In real app: API call to delete user
        setUsers(prev => prev.filter(user => user.id !== userId));
    };

    return {
        users,
        loading,
        error,
        pagination,
        handlePageChange,
        handleSearch,
        handleCreateUser,
        handleUpdateUser,
        handleDeleteUser
    };
};

export default useUserManagement;