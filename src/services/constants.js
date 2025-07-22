/**
 * Created by fulle on 2025/07/04.
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
    USER_KEY: 'userKey',
    KEY_2STEP: `${import.meta.env.VITE_KEY_2STEP_AUTH}`
};

export const API_STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
};

export const API_ERRORS = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
};

export const DHIS2_PROGRAMS = {
    FACILITY_USER_ENROLLMENT: {
        ID: "Rbpj3c4Z5gj",
        STAGE: "uI6CH7aLkJl",
        DATA_ELEMENTS: {
            USER_ID: {
                name: "userID",
                valueType:"TEXT",
                id: "Ly5Wp4v7tbp"
            },
            STATUS: {
                name: "status",
                valueType: "TEXT",
                id: "kmNf5PqkDpP"
            },
            CREATED_AT: {
                name: "creationDate",
                valueType: "DATETIME",
                id: "W08dn4g4UG1"
            },
            DECISION_AT: {
                name: "decisionDate",
                valueType: "DATETIME",
                id: "qbM8RhjugxF"
            },
            FACILITY_ID: {
                name: "FacilityID",
                valueType : "TEXT",
                id: "qgcKF3pW70W"
            },
            DECISION_NOTES: {
                name: "decisionNotes",
                valueType: "LONG_TEXT",
                id: "ldxLbCoIvC1"
            },
            DECISION_BY: {
                name:"decisionBy (user ID)",
                valueType:"TEXT",
                id: "F1wZzkHuNes"
            }
        }
    }

};