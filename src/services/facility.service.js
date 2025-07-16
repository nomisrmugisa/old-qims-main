/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import {getAuthToken} from './http.service';
import {eventBus, EVENTS } from '../events';
const svc_name = "inspection_service";
const FacilityService = {
    enrolmentRequest: async (data) => {
        const method = "enrolmentRequest";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            const response = await httpService.post('/dataStore/inspection/2025', data,
                {
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
    approveEnrolmentRequest: async (data) => {
        const method = "enrolmentRequest";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            const response = await httpService.post('/dataStore/inspection/2025', data,
                {
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
    rejectEnrolmentRequest: async (data) => {
        const method = "enrolmentRequest";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            const response = await httpService.post('/dataStore/inspection/2025', data,
                {
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

export default FacilityService;