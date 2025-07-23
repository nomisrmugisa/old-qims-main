/**
 * Created by fulle on 2025/07/12.
 */
// hooks/usePasswordChange.js
import { useState } from 'react';
import {AuthService} from '../../services';
import {eventBus, EVENTS } from '../../events';

const usePasswordChange = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const changePassword = async (passwords) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await AuthService.changePassword({
                oldPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            window.console.log(response);
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Password Changed',
                message: 'Your password was successfully changed. You will be logged out and need to login again.',
                type: 'success',
                options: {
                    willClose: () => {
                        AuthService.clearAuth();
                        window.location.href = '/main/login';
                    }
                }
            });
            setSuccess('Password changed successfully!');
        } catch (error) {
            window.console.log("password change error: ", error);
            setError(error.message || 'Failed to change password');
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Password Change Failed',
                message: error.message || "We were unable to update your password, please try again later.",
                type: 'error'
            });
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