/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import {getAuthToken} from './http.service';
import StorageService from './storage.service';
import {eventBus, EVENTS } from '../events';
import {DHIS2_PROGRAMS} from './constants';

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
            let now = new Date();

            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT;
            const response = await httpService.post(`/40/tracker?async=false`, {
                    events:[
                        {
                            status : "COMPLETED",
                            program : programData.ID,
                            programStage : programData.STAGE,
                            orgUnit: `${data.id}`,
                            occurredAt: now.toISOString(),
                            dataValues:[
                                { dataElement : programData.DATA_ELEMENTS.USER_ID.id, value:`${userData.id}`}, //userId
                                { dataElement : programData.DATA_ELEMENTS.STATUS.id, value:"pending"}, //status
                                { dataElement: programData.DATA_ELEMENTS.CREATED_AT.id, value:now.toISOString()}, //creationDate
                                { dataElement: programData.DATA_ELEMENTS.DECISION_AT.id, value:null}, //decisionDate
                                { dataElement:programData.DATA_ELEMENTS.FACILITY_ID.id, value:`${data.id}`}, //faciliytId
                                { dataElement:programData.DATA_ELEMENTS.DECISION_NOTES.id, value:null}, //decisionNotes
                                { dataElement:programData.DATA_ELEMENTS.DECISION_BY.id, value:null}, //decisionBy
                            ]
                        }
                    ]
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
    listAuthPendingEnrolmentRequest: async() => {
        const method = "listAuthPendingEnrolmentRequest";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            let userData = await StorageService.getUserData();
            window.console.log('userData', userData);
            let now = new Date();

            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT;
            const response = await httpService.get(`/40/tracker/events.json?program=${programData.ID}&programStage=${programData.STAGE}&skipPaging=true&filter=${programData.DATA_ELEMENTS.USER_ID.id}:eq:${userData.id}&filter=${programData.DATA_ELEMENTS.STATUS.id}:eq:pending&fields=*`,
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
            return response.instances;
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
            const response = await httpService.get(`/users?filter=userRoles.id:eq:${import.meta.env.VITE_FACILITY_USER_TYPE_ENROLMENT_REQUEST}&fields=id,email,displayName,username,organisationUnits[id,name]&paging=false`, {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
            window.console.log(response);
            return response.users;
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