/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import StorageService from './storage.service';
import { STORAGE_KEYS } from './constants';
import {eventBus, EVENTS } from '../events';
const svc_name = "user_service";
const UserService = {
    listAll: async () => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: "listUsers"});
        try {
            const response = await httpService.get('/users');

            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: "listUsers"});
        }
    },
    listGroups: async () => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: "listGroups"});
        try {
            const response = await httpService.get('/groups');
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: "listGroups"});
        }
    }
};

export default UserService;