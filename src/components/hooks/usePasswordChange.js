/**
 * Created by fulle on 2025/07/12.
 */
// hooks/usePasswordChange.js
import { useState } from 'react';

const usePasswordChange = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const changePassword = async (passwords) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In real app: await api.changePassword(passwords);

            // Validate current password in simulation
            if (passwords.currentPassword !== 'currentPassword123') {
                throw new Error('Current password is incorrect');
            }

            setSuccess('Password changed successfully!');
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return {
        changePassword,
        loading,
        error,
        success
    };
};

export default usePasswordChange;