import axios from 'axios';
import httpService from './http.service';
import StorageService from './storage.service';
import AuthService from './auth.service';
import { STORAGE_KEYS, API_STATUS, API_ERRORS } from './constants';

let isRefreshing = false;
let failedQueue = [];

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

            if (error.response?.status === API_STATUS.UNAUTHORIZED && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(() => {
                        return httpService(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = StorageService.get(STORAGE_KEYS.REFRESH_TOKEN);
                    const { token } = await AuthService.refreshToken(refreshToken);

                    setAuthToken(token);
                    processQueue(null, token);
                    return httpService(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    clearAuth();
                    window.location.href = '/main/'; // Redirect to login
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
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

            return Promise.reject(error);
        }
    );
};