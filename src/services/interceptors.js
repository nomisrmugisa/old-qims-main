import axios from 'axios';
import httpService from './http.service';
import StorageService from './storage.service';
import AuthService from './auth.service';
import { STORAGE_KEYS, API_STATUS, API_ERRORS } from './constants';
import { eventBus, EVENTS } from '../events';

let isRefreshing = false;
let failedQueue = [];

// Add this at the top
const SKIP_REFRESH_ENDPOINTS = [
    '/auth/login',
    '/auth/forgotPassword',
    '/auth/resetPassword'
];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

export const setupInterceptors = (instance, temporaryHeaders) => {
    // Request interceptor
    instance.interceptors.request.use(
        (config) => {
            // Add timestamp to avoid caching
            if (config.method === 'get') {
                config.params = {
                    ...config.params,
                    _t: Date.now(),
                };
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Update your interceptor to include temporary headers
    instance.interceptors.request.use(
        (config) => {
            return {
                ...config,
                headers: {
                    ...config.headers,
                    ...temporaryHeaders
                }
            };
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
        (response) => {
            return response.data;
        },
        async (error) => {
            const originalRequest = error.config;
            window.console.log("Error Log");
            window.console.log(error);

            const creds = await StorageService.get('userCredentials');

            let isAuthenticated = false;
            if(creds)
                isAuthenticated = true;

            if (error.response?.status === API_STATUS.UNAUTHORIZED &&
            !originalRequest._retry &&
            (isAuthenticated && !SKIP_REFRESH_ENDPOINTS.some(endpoint => originalRequest.url.includes(endpoint)))) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        eventBus.emit(EVENTS.LOADING_HIDE, { source: "interceptor 1"});
                        failedQueue.push({ resolve, reject });
                    }).then(() => {
                        eventBus.emit(EVENTS.LOADING_HIDE, { source: "interceptor 2"});
                        return httpService(originalRequest);
                    }).catch(err => {
                        eventBus.emit(EVENTS.LOADING_HIDE, { source: "interceptor 3"});
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = await StorageService.get(STORAGE_KEYS.REFRESH_TOKEN);
                    const { token } = await AuthService.refreshToken(refreshToken);

                    await setAuthToken(token);
                    processQueue(null, token);
                    return httpService(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    AuthService.clearAuth();
                    window.location.href = '/main/'; // Redirect to login
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                    eventBus.emit(EVENTS.LOADING_HIDE, { source: "interceptor 4"});
                }
            }
            window.console.log("error");
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
            else if(error.request && error.request.responseText) {
                window.console.log(error.request.responseText);
                const {message} = JSON.parse(error.request.responseText);
                if(message)
                    error.message = message;
            }
            else if(error.response.data && error.response.data.error) {
                window.console.log("got message 1", error.response);
                error.message = error.response.data.error;
            }

            return Promise.reject(error);
        }
    );
};