/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import StorageService from './storage.service';
import { setAuthToken } from './http.service';
import { STORAGE_KEYS } from './constants';
import {eventBus, EVENTS} from '../events';

const AuthService = {
    login: async (credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "login"});
        try {
            const response = await httpService.post('/auth/login', credentials);
            /*const { token, refreshToken, user } = response;

            // Store tokens and user data
            StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
            StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            StorageService.set(STORAGE_KEYS.USER_DATA, user);

            // Set auth header
            httpService.setAuthToken(token);

            return user;*/
            return response;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "login"});
        }
    },

    logout: async () => {
        try {
            await httpService.post('/auth/logout');
        } finally {
            httpService.clearAuth();
        }
    },

    forgotPassword: async (credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "forgotPassword"});
        try {
            const response = await httpService.post('/auth/forgot-password', credentials);
            window.console.log(response);
            return response;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "login"});
        }
    },
    resetPassword: async (credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "resetPassword"});
        try {
            const response = await httpService.post('/auth/reset-password', credentials);
            window.console.log(response);
            return response;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "resetPassword"});
        }
    },
    registerEmail: async (credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "registerEmail"});
        try {
            const response = await httpService.post('/auth/registration', credentials);
            window.console.log(response);
            return response;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "registerEmail"});
        }
    },
    registerComplete: async (credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "registerComplete"});
        try {
            const response = await httpService.post('/auth/forgot-password', credentials);
            window.console.log(response);
            return response;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "registerComplete"});
        }
    },

    me: async(credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "me"});
        const authorization_creds = btoa(`${credentials.username}:${credentials.password}`);

        window.console.log(credentials);
        try {
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout - Please check your internet connection and try again.')), 10000)
            );

            const responsePromise = httpService.get('/me', {
                headers: {
                    'Authorization': `Basic ${authorization_creds}`
                }
            });

            const response = await Promise.race([responsePromise, timeoutPromise]);

            setAuthToken(authorization_creds, 'Basic');
            window.console.log(response);
            /*const { token, refreshToken, user } = response;

            // Store tokens and user data
            StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
            StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            StorageService.set(STORAGE_KEYS.USER_DATA, user);

            // Set auth header
            httpService.setAuthToken(token);*/

            return response;
        } catch (error) {
            window.console.error('Auth error:', error);
            
            // Enhance error with more context
            let enhancedError = error;
            
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                let message = error.response.data?.message || error.message;
                
                switch (status) {
                    case 401:
                        message = 'Invalid username or password. Please check your credentials and try again.';
                        break;
                    case 403:
                        message = 'Access denied. Your account may be locked or you don\'t have permission to access this system.';
                        break;
                    case 404:
                        message = 'User service not found. Please contact support if this problem persists.';
                        break;
                    case 410:
                        message = 'Your account has expired. Please contact your administrator to renew your account.';
                        break;
                    case 423:
                        message = 'Two-factor authentication is required for your account. Please enable 2FA and try again.';
                        break;
                    case 429:
                        message = 'Too many login attempts. Please wait a few minutes before trying again.';
                        break;
                    case 500:
                        message = 'Server error. Our team has been notified. Please try again in a few minutes.';
                        break;
                    case 502:
                    case 503:
                    case 504:
                        message = 'Service temporarily unavailable. Please try again in a few minutes.';
                        break;
                }
                
                enhancedError.message = message;
                enhancedError.userFriendly = true;
            } else if (error.request) {
                // Network error
                if (error.message.includes('timeout')) {
                    enhancedError.message = 'Request timed out. Please check your internet connection and try again.';
                } else if (error.message.includes('Network Error')) {
                    enhancedError.message = 'Network error. Please check your internet connection and try again.';
                } else {
                    enhancedError.message = 'Unable to connect to the server. Please check your internet connection and try again.';
                }
                enhancedError.userFriendly = true;
            } else {
                // Other errors
                if (error.message.includes('timeout')) {
                    enhancedError.message = 'Request timed out. Please check your internet connection and try again.';
                } else if (error.message.includes('Failed to fetch')) {
                    enhancedError.message = 'Unable to connect to the server. Please check your internet connection and try again.';
                } else if (error.message.includes('CORS')) {
                    enhancedError.message = 'Cross-origin request blocked. Please contact support if this problem persists.';
                } else {
                    enhancedError.message = error.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.';
                }
                enhancedError.userFriendly = true;
            }
            
            // Ensure loading is hidden even on error
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "me"});
            throw enhancedError;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "me"});
        }
    },

    refreshToken: async (refreshToken) => {
        const response = await httpService.post('/auth/refresh', { refreshToken });
        return response;
    },

    getCurrentUser: () => {
        return StorageService.get(STORAGE_KEYS.USER_DATA);
    },
};

export default AuthService;