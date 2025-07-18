/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import StorageService from './storage.service';
import {getAuthToken} from './http.service';
import {eventBus, EVENTS } from '../events';
const svc_name = "user_service";
const UserService = {
    listAll: async (page, pageSize) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: "listUsers"});
        let token = await getAuthToken('Basic');
        let _url = `/users`;
        let hasPage = false;
        if(page && page > 0) {
            hasPage = true;
            if(!pageSize || pageSize <=0 || pageSize > 50)
                pageSize = 50;

            _url += `?page=${page}&pageSize=${pageSize}`;
        }
        window.console.log(_url);
        try {
            const response = await httpService.get(_url, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });

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
        let token = await getAuthToken('Basic');
        try {
            const response = await httpService.get('/userGroups', {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: "listGroups"});
        }
    },
    searchUsers: async(query) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: "searchUsers"});
        let token = await getAuthToken('Basic');

        try {
            const response = await httpService.get(`/userLookup?query=${query}`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            if(response.users && response.users.length>0)
                return response.users;
            return [];

        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: "searchUsers"});
        }
    },
    listGroupUsers: async (groupId) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: "listGroupUsers"});
        let token = await getAuthToken('Basic');
        try {
            const response = await httpService.get(`/users?filter=userGroups.id:eq:${groupId}&fields=id,email,displayName`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log("listGroupUsers***");
            window.console.log(response);
            window.console.log("---***");
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: "listGroupUsers"});
        }
    },
    searchGroupUsers: async (groupId) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: "searchGroupUsers"});
        let token = await getAuthToken('Basic');
        try {
            const response = await httpService.get(`/users?filter=userGroups.id=${groupId}`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log("listGroupUsers***");
            window.console.log(response);
            window.console.log("---***");
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: "searchGroupUsers"});
        }
    },
    deleteOldSettings: async() => {
        const method = "enrolmentRequest";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});

        try {

            let token = await getAuthToken('Basic');
            let userData = await StorageService.getUserData();
            const response = await httpService.delete(`/40/userSettings/keyDbLocale?user=${userData.id}`,
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });

            return response.response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    getFacilities: async() => {
        const method = "getFacilities";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});

        try {

            let token = await getAuthToken('Basic');
            let userData = await StorageService.getUserData();
            const response = await httpService.get(`/users/${userData.id}?fields=userRoles,organisationUnits`,
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });

            return response.organisationUnits;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    }
};

export default UserService;