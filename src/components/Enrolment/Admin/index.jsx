/**
 * Created by fulle on 2025/07/10.
 */
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import FacilitySearchForm from '../../Facility/Search/Form';
import FacilitySearchResults from '../../Facility/Search/Results';
import UserSearch from '../../User/Search';
import {lookupFacilities, listAllUsers} from '../helpers';

const EnrolmentAdmin = () => {
    const [activeTab, setActiveTab] = useState('user');
    const [selectedUser, setSelectedUser] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);

    // Reset states when switching tabs
    useEffect(() => {
        setSelectedUser(null);
        setFacilities([]);
        setError('');
        setSuccess('');
        setShowOTP(false);
    }, [activeTab]);

    // API simulation functions
    const searchUsers = async (query) => {
        setIsLoading(true);
        try {
            // Simulate API call
            const results = await listAllUsers();
            window.console.log("user results");
            window.console.log(results);
            return [
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
                { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
            ];
        } catch (err) {
            setError('Failed to fetch users');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setFacilities([]);
        setSuccess(`Selected user: ${user.name}`);
    };

    const handleFacilitySearch = async (query) => {
        try {
            const results = await lookupFacilities(query);
            window.console.log("results");
            window.console.log(results);
            setFacilities(results);
        }
        catch(error) {

        }

    };

    const handleEnrolmentAction = async (facility) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (!selectedUser) {
                setError('No user selected');
                return;
            }
            setSuccess(`Enrolled ${selectedUser.name} in ${facility.name}`);
        } catch (err) {
            setError('Operation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <h4>Administrator Enrolment</h4>
            <p className="text-muted">
                Select a user and enrol them in a facility
            </p>

            <UserSearch
                onSearch={searchUsers}
                onSelect={handleUserSelect}
                placeholder="Search users by name or email"
            />

            {selectedUser && (
                <div className="alert alert-info mt-3">
                    <strong>Selected User:</strong> {selectedUser.name} ({selectedUser.email})
                </div>
            )}

            {selectedUser && (
                <div className="mt-3">
                    <FacilitySearchForm
                        onSearch={handleFacilitySearch}
                        placeholder="Search facilities for enrolment"
                    />
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <FacilitySearchResults
                items={facilities}
                onAction={(facility) => handleEnrolmentAction(facility)}
                actionText="Enrol User"
                isLoading={isLoading}
                disabled={!selectedUser}
            />
        </div>
    );
};

export default EnrolmentAdmin;