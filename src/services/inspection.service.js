/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
//import StorageService from './storage.service';
//import { STORAGE_KEYS } from './constants';
import {getAuthToken} from './http.service';
import {eventBus, EVENTS } from '../events';
const svc_name = "inspection_service";
const InspectionService = {
    schedule: async () => {
        const method = "schedule";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        let token = await getAuthToken('Basic');
        let _url = `/users`;
        try {
            const response = await httpService.get('/dataStore/inspection/2025', {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },

};

export default InspectionService;