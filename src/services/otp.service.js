/**
 * Created by fulle on 2025/07/07.
 */
import axios from 'axios';
import {eventBus, EVENTS } from '../events';
import { API_ERRORS } from './constants';

const otpService = axios.create({
    baseURL: `${import.meta.env.VITE_OTP_SERVICE_URL}`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
otpService.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        window.console.log("Error Log");
        window.console.log(error);

        window.console.log(`${svc_name} error`);
        window.console.log(error);
        window.console.log("----");

        // Handle other errors
        if (!error.response) {
            error.response = {
                status: 0,
                data: {
                    message: 'Network Error',
                    code: API_ERRORS.NETWORK_ERROR,
                },
            };
        }

        return Promise.reject(error);
    }
);
const svc_name = "OTP_service";

const OTPApiService = {
    requestOtp: async (data) => {
        const method = "requestOtp";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            const response = await otpService.post(`/request-otp`, data);
            window.console.log(response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    verifyOtp: async (data) => {
        const method = "verifyOtp";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            const response = await otpService.post(`/verify-otp`, data);
            window.console.log(response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
};

export default OTPApiService;
