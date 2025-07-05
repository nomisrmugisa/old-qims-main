/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import StorageService from './storage.service';
import { STORAGE_KEYS } from './constants';
import {eventBus, EVENTS } from '../events';

const AuthService = {
    login: async (credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "login"});
        try {
            const response = await httpService.post('/auth/login', credentials);
            const { token, refreshToken, user } = response;

            // Store tokens and user data
            StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
            StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            StorageService.set(STORAGE_KEYS.USER_DATA, user);

            // Set auth header
            httpService.setAuthToken(token);

            return user;
        } catch (error) {
            throw error;
        }
        finally {
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
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "login"});
        }
    },
    resetPassword: async (credentials) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "resetPassword"});
        try {
            const response = await httpService.post('/auth/reset-password', credentials);
            window.console.log(response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "resetPassword"});
        }
    },

    me: async(credentials, headers={}) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "auth_service", method: "me"});
        try {
            const response = await httpService.post('/api/me', credentials, {
                headers
            });


            const { token, refreshToken, user } = response;

            // Store tokens and user data
            StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
            StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            StorageService.set(STORAGE_KEYS.USER_DATA, user);

            // Set auth header
            httpService.setAuthToken(token);

            return user;
        } catch (error) {
            throw error;
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