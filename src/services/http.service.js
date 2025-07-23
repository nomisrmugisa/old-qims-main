/**
 * Created by fulle on 2025/07/04.
 */
import axios from 'axios';
import { setupInterceptors } from './interceptors';
import StorageService from './storage.service';
import { STORAGE_KEYS } from './constants';

const httpService = axios.create({
    baseURL: `${import.meta.env.VITE_DHIS2_URL}/api`,
    timeout: parseInt(`${import.meta.env.VITE_API_TIMEOUT}`) || 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Validate environment variables
if (!import.meta.env.VITE_DHIS2_URL) {
    console.error('VITE_DHIS2_URL environment variable is not set. API calls may fail.');
}

// Set initial auth token if exists
const token = StorageService.get(STORAGE_KEYS.AUTH_TOKEN);
if (token) {
    httpService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
else {
    let auth_key = StorageService.get(STORAGE_KEYS.USER_KEY);
    if(auth_key) {
        httpService.defaults.headers.common['Authorization'] = `Basic ${token}`;
    }
}

let temporaryHeaders = {};

export const addTemporaryHeaders = (headers) => {
    temporaryHeaders = { ...temporaryHeaders, ...headers };
};

export const removeTemporaryHeader = (headerName) => {
    const { [headerName]: _, ...rest } = temporaryHeaders;
    temporaryHeaders = rest;
};

export const clearTemporaryHeaders = () => {
    temporaryHeaders = {};
};

// Setup interceptors
setupInterceptors(httpService, temporaryHeaders);

export const setAuthToken = (token, type) => {

    let key = STORAGE_KEYS.USER_KEY;
    if(!type) {
        type = "Bearer";
        key = STORAGE_KEYS.AUTH_TOKEN;
    }

    if (token) {
        httpService.defaults.headers.common['Authorization'] = `${type} ${token}`;
        StorageService.set(key, token);
    } else {
        delete httpService.defaults.headers.common['Authorization'];
        StorageService.remove(key);
    }
};

export const getAuthToken = (type) => {
    let key = (!type)? STORAGE_KEYS.AUTH_TOKEN: STORAGE_KEYS.USER_KEY;
    return StorageService.get(key);
};

export const clearAuth = () => {
    delete httpService.defaults.headers.common['Authorization'];
    StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
    StorageService.remove(STORAGE_KEYS.USER_KEY);
    StorageService.remove(STORAGE_KEYS.REFRESH_TOKEN);
    StorageService.remove(STORAGE_KEYS.USER_DATA);
};

export default httpService;