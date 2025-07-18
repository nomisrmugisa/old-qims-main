/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import {getAuthToken} from './http.service';
import StorageService from './storage.service';
import {eventBus, EVENTS } from '../events';
const svc_name = "inspection_service";
const FacilityService = {
    enrolmentRequest: async (data) => {
        const method = "enrolmentRequest";
        window.console.log(method, data);
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            let userData = await StorageService.getUserData();
            window.console.log('userData', userData);
            const response = await httpService.put(`/40/users/${userData.id}`, {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                surname: userData.surname,
                username: userData.username,
                organisationUnits: [{id: `${data.id}`}],
                dataViewOrganisationUnits: [{id: `${data.id}`}],
                teiSearchOrganisationUnits: [{id: `${data.id}`}],
                userRoles: [{id: `${import.meta.env.VITE_FACILITY_USER_TYPE_ENROLMENT_REQUEST}`}],
                    },
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
    listEnrolmentRequest: async (data) => {
        const method = "listEnrolmentRequest";
        window.console.log(method, data);
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            const response = await httpService.get(`/users?filter=userRoles.id:eq:${import.meta.env.VITE_FACILITY_USER_TYPE_ENROLMENT_REQUEST}&fields=id,email,organisationUnits[id,name]&paging=false`, {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
            window.console.log(response);
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
    findByMFLCodes: async(data) => {
        const method = "findByMFLCodes";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {

            window.console.log("facility data", data);
            if((!data.oldFacilityCode && !data.newFacilityCode) || !data.facilityName)
                throw new Error("Invalid MFL Facility data provided");
            const finalCode = `${data.newFacilityCode}/${data.oldFacilityCode}`;
            let token = await getAuthToken('Basic');
            const response = await httpService.get(`organisationUnits?filter=description:eq:${finalCode}&fields=id,name,description&paging=false`,
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
    },
    addToMFLDistrict: async(data) => {
        const method = "addToMFLDistrict";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});

        try {
            let now = new Date();
            if((!data.oldFacilityCode && !data.newFacilityCode) || !data.facilityName)
                throw new Error("Invalid MFL Facility data provided");
            const finalCode = `${data.newFacilityCode}/${data.oldFacilityCode}`;
            let token = await getAuthToken('Basic');
            const response = await httpService.post('/29/organisationUnits', {
                name: data.facilityName,
                shortName: data.facilityName,
                code: data.newFacilityCode,
                openingDate: now.toISOString(),
                description: finalCode,
                address: data.facilityName,
                parent: {
                    id: `${import.meta.env.VITE_MFL_FACILITY_PARENT_KEY}`
                }

                },
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
            if(response.httpStatusCode !== 201)
                throw new Error('An error occurred, please try again later. If it keeps on happening, contact system administrators.');

            return response.response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },


};

export default FacilityService;