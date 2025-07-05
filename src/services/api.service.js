/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';

const apiService = {
    // Auth endpoints
    /*auth: {
        login: (credentials) => httpService.post('/auth/login', credentials),
        logout: () => httpService.post('/auth/logout'),
        refreshToken: () => httpService.post('/auth/refresh'),
    },*/
    /*users: {
        getAll: (params = {}) => httpService.get('/users', { params }),
        getById: (id) => httpService.get(`/users/${id}`),
        create: (userData) => httpService.post('/users', userData),
        update: (id, userData) => httpService.put(`/users/${id}`, userData),
        delete: (id) => httpService.delete(`/users/${id}`),
    },*/
};

export default apiService;