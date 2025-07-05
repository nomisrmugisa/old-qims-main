/**
 * Created by fulle on 2025/07/04.
 */
import axios from 'axios';
import { setupInterceptors } from './interceptors';
import StorageService from './storage.service';
import { STORAGE_KEYS } from './constants';

const httpService = axios.create({
    baseURL: `${import.meta.env.VITE_DHIS2_URL}/api`,
    timeout: parseInt(`${import.meta.env.REACT_APP_API_TIMEOUT}`) || 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Set initial auth token if exists
const token = StorageService.get(STORAGE_KEYS.AUTH_TOKEN);
if (token) {
    httpService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

export const setAuthToken = (token) => {
    if (token) {
        httpService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
        delete httpService.defaults.headers.common['Authorization'];
        StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
    }
};

export const clearAuth = () => {
    delete httpService.defaults.headers.common['Authorization'];
    StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
    StorageService.remove(STORAGE_KEYS.REFRESH_TOKEN);
    StorageService.remove(STORAGE_KEYS.USER_DATA);
};

export default httpService;