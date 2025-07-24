/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import {getAuthToken} from './http.service';
import StorageService from './storage.service';
import {eventBus, EVENTS } from '../events';
import {DHIS2_PROGRAMS, USER_ROLES} from './constants';

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

            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST;
            return await FacilityService.updateUserTrackerEvent({
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
                            { dataElement:programData.DATA_ELEMENTS.USER_NAME.id, value:userData.displayName}, //username
                            { dataElement:programData.DATA_ELEMENTS.EMAIL.id, value:userData.email}, //username
                        ]
                    }
                ]
            });
            /*const response = await httpService.post(`/40/tracker?async=false`, {
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
                                { dataElement:programData.DATA_ELEMENTS.USER_NAME.id, value:userData.displayName}, //username
                                { dataElement:programData.DATA_ELEMENTS.EMAIL.id, value:userData.email}, //username
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
            return response;*/
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

            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST;
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
    listAuthActiveEnrolment: async() => {
        const method = "listAuthActiveEnrolment";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            let userData = await StorageService.getUserData();
            window.console.log('userData', userData);
            let now = new Date();

            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_MAP;
            const response = await httpService.get(`/40/tracker/events.json?program=${programData.ID}&programStage=${programData.STAGE}&skipPaging=true&filter=${programData.DATA_ELEMENTS.USER_ID.id}:eq:${userData.id}&filter=${programData.DATA_ELEMENTS.STATUS.id}:eq:active&fields=*`,
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
    listEnrolmentRequest: async (page, filter) => {
        const method = "listEnrolmentRequest";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST;
            const response = await httpService.get(`/40/tracker/events.json?program=${programData.ID}&programStage=${programData.STAGE}&page=${page}&pageSize=20&filter=${programData.DATA_ELEMENTS.STATUS.id}:eq:${filter}&order=occurredAt:asc&fields=*`, {
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
    approveEnrolmentMap: async (data) => {
        const method = "enrolmentRequest";
        window.console.log(method, data);
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let userData = await StorageService.getUserData();
            window.console.log('userData', userData);
            let now = new Date();

            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_MAP;
            return await FacilityService.updateUserTrackerEvent({
                events:[
                    {
                        //status : "COMPLETED",
                        program : programData.ID,
                        programStage : programData.STAGE,
                        orgUnit: `${data.facilityId}`,
                        occurredAt: now.toISOString(),
                        dataValues:[
                            { dataElement : programData.DATA_ELEMENTS.USER_ID.id, value: data.userId}, //userId
                            { dataElement:programData.DATA_ELEMENTS.FACILITY_ID.id, value:data.facilityId}, //facilytId
                            { dataElement : programData.DATA_ELEMENTS.STATUS.id, value:"active"}, //status
                            { dataElement: programData.DATA_ELEMENTS.START_DATE.id, value:now.toISOString()}, //startDate
                            { dataElement: programData.DATA_ELEMENTS.END_DATE.id, value:null}, //endDate
                            { dataElement:programData.DATA_ELEMENTS.TYPE.id, value:data.type}, //type
                            { dataElement:programData.DATA_ELEMENTS.ROLE.id, value:data.role}, //role
                            { dataElement:programData.DATA_ELEMENTS.CREATED_BY.id, value:userData.id}, //createdBy
                            { dataElement:programData.DATA_ELEMENTS.UPDATED_BY.id, value:null}, //updatedBy
                        ]
                    }
                ]
            });
            /*const response = await httpService.post(`/40/tracker?async=false`, {
                    events:[
                        {
                            //status : "COMPLETED",
                            program : programData.ID,
                            programStage : programData.STAGE,
                            orgUnit: `${data.facilityId}`,
                            occurredAt: now.toISOString(),
                            dataValues:[
                                { dataElement : programData.DATA_ELEMENTS.USER_ID.id, value: data.userId}, //userId
                                { dataElement:programData.DATA_ELEMENTS.FACILITY_ID.id, value:data.facilityId}, //facilytId
                                { dataElement : programData.DATA_ELEMENTS.STATUS.id, value:"active"}, //status
                                { dataElement: programData.DATA_ELEMENTS.START_DATE.id, value:now.toISOString()}, //startDate
                                { dataElement: programData.DATA_ELEMENTS.END_DATE.id, value:null}, //endDate
                                { dataElement:programData.DATA_ELEMENTS.TYPE.id, value:data.type}, //type
                                { dataElement:programData.DATA_ELEMENTS.ROLE.id, value:data.role}, //role
                                { dataElement:programData.DATA_ELEMENTS.CREATED_BY.id, value:userData.id}, //createdBy
                                { dataElement:programData.DATA_ELEMENTS.UPDATED_BY.id, value:null}, //updatedBy
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
            return response;*/
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    approveEnrolmentRequest: async (data) => {
        const method = "enrolmentRequest";
        window.console.log(method, data);
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let userData = await StorageService.getUserData();
            window.console.log('userData', userData);
            let now = new Date();

            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST;
            return await FacilityService.updateUserTrackerEvent({
                events:[
                    {
                        //status : "COMPLETED",
                        program : programData.ID,
                        programStage : programData.STAGE,
                        orgUnit: `${data.facilityId}`,
                        occurredAt: now.toISOString(),
                        dataValues:[
                            { dataElement : programData.DATA_ELEMENTS.USER_ID.id, value: data.userId}, //userId
                            { dataElement:programData.DATA_ELEMENTS.FACILITY_ID.id, value:data.facilityId}, //facilytId
                            { dataElement : programData.DATA_ELEMENTS.STATUS.id, value:"active"}, //status
                            { dataElement: programData.DATA_ELEMENTS.START_DATE.id, value:now.toISOString()}, //startDate
                            { dataElement: programData.DATA_ELEMENTS.END_DATE.id, value:null}, //endDate
                            { dataElement:programData.DATA_ELEMENTS.TYPE.id, value:data.type}, //type
                            { dataElement:programData.DATA_ELEMENTS.ROLE.id, value:data.role}, //role
                            { dataElement:programData.DATA_ELEMENTS.CREATED_BY.id, value:userData.id}, //createdBy
                            { dataElement:programData.DATA_ELEMENTS.UPDATED_BY.id, value:null}, //updatedBy
                        ]
                    }
                ]
            });
            /*const response = await httpService.post(`/40/tracker?async=false`, {
                    events:[
                        {
                            //status : "COMPLETED",
                            program : programData.ID,
                            programStage : programData.STAGE,
                            orgUnit: `${data.facilityId}`,
                            occurredAt: now.toISOString(),
                            dataValues:[
                                { dataElement : programData.DATA_ELEMENTS.USER_ID.id, value: data.userId}, //userId
                                { dataElement:programData.DATA_ELEMENTS.FACILITY_ID.id, value:data.facilityId}, //facilytId
                                { dataElement : programData.DATA_ELEMENTS.STATUS.id, value:"active"}, //status
                                { dataElement: programData.DATA_ELEMENTS.START_DATE.id, value:now.toISOString()}, //startDate
                                { dataElement: programData.DATA_ELEMENTS.END_DATE.id, value:null}, //endDate
                                { dataElement:programData.DATA_ELEMENTS.TYPE.id, value:data.type}, //type
                                { dataElement:programData.DATA_ELEMENTS.ROLE.id, value:data.role}, //role
                                { dataElement:programData.DATA_ELEMENTS.CREATED_BY.id, value:userData.id}, //createdBy
                                { dataElement:programData.DATA_ELEMENTS.UPDATED_BY.id, value:null}, //updatedBy
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Basic ${token}`
                    }
                });
            return response;*/
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
    closeEnrollmentRequest: async(data) => {
        const method = "closeEnrollmentRequest";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            window.console.log(`${method} data:`, data);
            let now = new Date();
            let token = await getAuthToken('Basic');
            let userData = await StorageService.getUserData();
            const programData = DHIS2_PROGRAMS.FACILITY_USER_ENROLLMENT_REQUEST;
            const response = await httpService.patch(`/events/${data.id}`, {
                dataValues: [
                    {
                    dataElement: `${programData.DATA_ELEMENTS.STATUS.id}`,
                    value: `${data.status}`
                },
                    {
                        dataElement: `${programData.DATA_ELEMENTS.DECISION_BY.id}`,
                        value: userData.id
                    },
                    {
                        dataElement: `${programData.DATA_ELEMENTS.DECISION_NOTES.id}`,
                        value: `${data.notes}`
                    },
                    {
                        dataElement: `${programData.DATA_ELEMENTS.DECISION_AT.id}`,
                        value: now.toISOString()
                    },
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
    listPrimaryFacilityRoles: async() => {
        //return FacilityService.listRolesByGroup("ornmJtqA31K");
        const roles = USER_ROLES.FACILITY.PRIMARY;
        const method = "listPrimaryFacilityRoles";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            const rolesFilter = [roles.ADMIN.NAME, roles.CLERK.NAME];
            const response = await httpService.get(`userRoles?paging=false&filter=name:in:[${rolesFilter.join(',')}]&fields=id,name`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response.userRoles;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    listLocumFacilityRoles: async() => {
        //return FacilityService.listRolesByGroup("fqpZPUei0pN");
        const roles = USER_ROLES.FACILITY.LOCUM;
        const method = "listLocumFacilityRoles";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            const rolesFilter = [roles.CLERK.NAME];
            const response = await httpService.get(`userRoles?paging=false&filter=name:in:[${rolesFilter.join(',')}]&fields=id,name`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response.userRoles;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    listRolesByGroup: async(group_id) => {
        const method = "listRolesByGroup";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            const response = await httpService.get(`userRoles/${group_id}?fields=id,name`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response.users;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    listUserRoles: async() => {
        const method = "listUserRoles";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            const response = await httpService.get(`userRoles?paging=false&fields=id,name`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    getFacilityInfo: async(facility_id, fields) => {
        const method = "getFacilityInfo";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            if(!fields)
                fields = "*";
            const response = await httpService.get(`/organisationUnits/${facility_id}?fields=${fields}`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    getOrganisationUnitFilter: async() => {
        const method = "getOrganisationUnitFilter";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            const response = await httpService.get(`/organisationUnits.json?filter=level:eq:4&fields=id,displayName&paging=false`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    getTrackedEntityInstances: async(org_id, program_id) => {
        const method = "getTrackedEntityInstances";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            const response = await httpService.get(`trackedEntityInstances.json?ou=${org_id}&program=${program_id}&fields=trackedEntityInstance`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response.trackedEntityInstances;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    getAllOrganisationUnits: async() => {
        const method = "getAllOrganisationUnits";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            window.console.log("token", token);
            const response = await httpService.get(`organisationUnits?paging=false`, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            window.console.log(method, response);
            return response.trackedEntityInstances;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    updateUserTrackerEvent: async (form_data) => {
        const method = "updateUserTrackerEvent";
        window.console.log(method, form_data);
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            let token = await getAuthToken('Basic');
            const response = await httpService.post(`/40/tracker?async=false`, form_data,
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