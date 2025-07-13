/**
 * Created by fulle on 2025/07/05.
 */
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { eventBus, EVENTS } from '../../events';

const AlertNotification = () => {
    useEffect(() => {
        const showAlert = (payload) => {
            Swal.fire({
                title: payload.title || 'Notification',
                text: payload.message,
                icon: payload.type || 'info',
                confirmButtonText: 'OK',
                confirmButtonColor: "#1977cc",
                ...payload.options
            });
        };

        eventBus.on(EVENTS.NOTIFICATION_SHOW, showAlert);
        return () => eventBus.off(EVENTS.NOTIFICATION_SHOW, showAlert);
    }, []);

    return null;
};

export default AlertNotification;