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
    FACILITY_USER_ENROLLMENT_REQUEST: {
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
            },
            EMAIL: {
                name:"email",
                valueType:"TEXT",
                id:"L6MhX4UjNKW"
            },
            USER_NAME: {
                name:"user_Name",
                valueType:"TEXT",
                id:"aLOZaXP4uV2"
            }
        }
    },
    FACILITY_USER_ENROLLMENT_MAP: {
        ID: "b7wdiBqcml5",
        STAGE: "hczvoscj8Ce",
        DATA_ELEMENTS: {
            USER_ID: {
                name: "userID",
                valueType:"TEXT",
                id: "Ly5Wp4v7tbp"
            },
            FACILITY_ID: {
                name: "FacilityID",
                valueType : "TEXT",
                id: "qgcKF3pW70W"
            },
            STATUS: {
                name: "tr2_status",
                valueType: "TEXT",
                id: "WmnMQhFIaMu"
            },
            START_DATE: {
                name: "tr2_startDate",
                valueType: "DATETIME",
                id: "DHlHYmst611"
            },
            END_DATE: {
                name: "tr2_endDate",
                valueType: "DATETIME",
                id: "pbnBBNz7BxB"
            },
            TYPE: {
                name: "tr2_type",
                valueType: "TEXT",
                id: "F2W3oTai8tN"
            },
            ROLE: {
                name: "tr2_role",
                valueType: "TEXT",
                id: "AIVeYq3PoI1"
            },
            CREATED_BY: {
                name:"tr2_createdBy",
                valueType:"TEXT",
                id: "uJCFQsE2Z4W"
            },
            UPDATED_BY: {
                name:"tr2_updated By",
                valueType:"TEXT",
                id: "ZRsQcDKeUEn"
            },
        }
    }

};

/*const dataElements = {"events":[
    {
        "occurredAt":"2025-07-22",
        "notes":[],
        "program":"b7wdiBqcml5",
        "programStage":"hczvoscj8Ce",
        "orgUnit":"OVpBNoteQ2Y",
        "dataValues":[
            {"dataElement":"uJCFQsE2Z4W","value":"tr2_createdBy"},
            {"dataElement":"pbnBBNz7BxB","value":"tr2_endDate"},
            {"dataElement":"AIVeYq3PoI1","value":"tr2_role"},
            {"dataElement":"DHlHYmst611","value":"tr2_startDate"},
            {"dataElement":"WmnMQhFIaMu","value":"tr2_status"},
            {"dataElement":"F2W3oTai8tN","value":"tr2_type"},
            {"dataElement":"ZRsQcDKeUEn","value":"tr2_updated By"}]}]};*/

export const USER_ROLES = {
    FACILITY: {
        PRIMARY: {
            ADMIN: {
                ID: "spPuhn7WExc",
                NAME: "facility_admin"
            },
            CLERK: {
                ID: "spPuhn7WExc",
                NAME: "facility_clerk"
            }
        },
        LOCUM: {
            CLERK: {
                ID: "fqpZPUei0pN",
                NAME: "locum_clerk"
            }
        }
    }
};

export const FACILITY_OWNERSHIP_REGISTRATION_FORM_MAP = {
    form: {
        name:"Facility Ownership Details",
        programStageSections:[
            {
                name:"Licence Holder Details or Lead medical professional",
                dataElements:[
                    {
                        valueType:"TEXT",
                        optionSet:{
                            options:[
                                {
                                    code:"State Owned",
                                    sortOrder:1,
                                    displayName:"State Owned",
                                    id:"eZKEYzgcTj4"
                                },
                                {
                                    code:"Private Owned",
                                    sortOrder:2,
                                    displayName:"Private Owned",
                                    id:"AlIhlD6Rhch"
                                },
                                {
                                    code:"Mission Owned",
                                    sortOrder:3,
                                    displayName:"Mission Owned",
                                    id:"ee9JS4TfUsG"
                                }
                            ],
                            displayName:"Type of ownership",
                            id:"aHbl9da00ti"
                        },
                        displayFormName:"Type of ownership",
                        id:"vAHHXaW0Pna"
                    },
                    {
                        valueType:"TEXT",
                        optionSet:{
                            options:[
                                {
                                    code:"INDIVIDUAL PRIVATE PRACTICE",
                                    sortOrder:1,
                                    displayName:"INDIVIDUAL PRIVATE PRACTICE",
                                    id:"MAPNPNhNQ6y",
                                    requiredDataElements: [
                                        "uP51La6owLL", "NO7wjA7T9uy", "T93on56IQbF",
                                        "NO7wjA7T9uy", "yP49GKSQxPl","lC217zTgC6C"
                                    ]
                                },
                                // {
                                //     code:"NURSE-LED PRIVATE PRACTICE",
                                //     sortOrder:2,
                                //     displayName:"NURSE-LED PRIVATE PRACTICE",
                                //     id:"B77zhrjsjx8",
                                //     requiredDataElements: [
                                //         "NO7wjA7T9uy", "uP51La6owLL", "NO7wjA7T9uy",
                                //         "yP49GKSQxPl","lC217zTgC6C"
                                //     ]
                                // },
                                {
                                    code:"OUTREACH PRACTICE",
                                    sortOrder:3,
                                    displayName:"OUTREACH PRACTICE",
                                    id:"E5OTVGL6c0N",
                                    requiredDataElements: [
                                        "uP51La6owLL", "NO7wjA7T9uy", "Wbh1nd3fQlo",
                                        "NO7wjA7T9uy", "yP49GKSQxPl","lC217zTgC6C"
                                    ]
                                },
                                {
                                    code:"MULTIPLE LICENCE(S)",
                                    sortOrder:4,
                                    displayName:"MULTIPLE LICENCE(S)",
                                    id:"cYPljuRUihD",
                                    requiredDataElements: [
                                        "uP51La6owLL", "NO7wjA7T9uy", "T93on56IQbF", "Wbh1nd3fQlo",
                                        "NO7wjA7T9uy", "yP49GKSQxPl","lC217zTgC6C"
                                    ]
                                },
                                {
                                    code:"GROUP PRACTICE",
                                    sortOrder:5,
                                    displayName:"GROUP PRACTICE",
                                    id:"xExorzZ1vje",
                                    requiredDataElements: [
                                        "uP51La6owLL", "T93on56IQbF"
                                    ]
                                },
                                {
                                    code:"F. EMS",
                                    sortOrder:6,
                                    displayName:"F. EMS",
                                    id:"KombhBTeGbd",
                                    requiredDataElements: [

                                    ]
                                },
                                {
                                    code:"PRIVATE HOSPITAL, NURSING HOMES and STEP-DOWN FACILITIES",
                                    sortOrder:7,
                                    displayName:"PRIVATE HOSPITAL, NURSING HOMES and STEP-DOWN FACILITIES",
                                    id:"hHY7QW5BSdC",
                                    requiredDataElements: [

                                    ]
                                },
                                {
                                    code:"NOT-FOR-PROFIT AND WORKPLACE",
                                    sortOrder:8,
                                    displayName:"NOT-FOR-PROFIT AND WORKPLACE",
                                    id:"Adnb93Q5SzY",
                                    requiredDataElements: [

                                    ]
                                }
                            ],
                            displayName:"Type of Facility License",
                            id:"oyaGNqlLjvX"
                        },
                        displayFormName:"Type of Facility",
                        id:"L3XSi86lGBP"
                    },
                    {
                        valueType:"TEXT",
                        displayFormName:"Surname",
                        id:"ykwhsQQPVH0"
                    },
                    {
                        valueType:"TEXT",
                        displayFormName:"First Name",
                        id:"HMk4LZ9ESOq"
                    },
                    {
                        valueType:"TEXT",
                        optionSet:{
                            options:[
                                {
                                    code:"Motswana",
                                    sortOrder:1,
                                    displayName:"Motswana",
                                    id:"IjFoC4IawvF"
                                },
                                {
                                    code:"Non-Citizen",
                                    sortOrder:2,
                                    displayName:"Non-Citizen",
                                    id:"llHkNOdkhsG"
                                }
                            ],
                            displayName:"Citizenship",
                            id:"IskgMQziwdn"
                        },
                        displayFormName:"Citizenship",
                        id:"zVmmto7HwOc"
                    },
                    {
                        valueType:"TEXT",
                        optionSet:{
                            options:[
                                {
                                    code:"Passport",
                                    sortOrder:1,
                                    displayName:"Passport",
                                    id:"oIK3jnuLwgC"
                                },
                                {
                                    code:"Omang",
                                    sortOrder:2,
                                    displayName:"Omang",
                                    id:"Fl4uIazzxuz"
                                }
                            ],
                            displayName:"ID Type",
                            id:"SZ8jimilSO4"
                        },
                        displayFormName:"ID Type",
                        id:"FLcrCfTNcQi"
                    },
                    {
                        valueType:"TEXT",
                        displayFormName:"ID",
                        id:"aUGSyyfbUVI"
                    },
                    {
                        valueType:"TEXT",
                        displayFormName:"PASSPORT No.",
                        id:"v7XIOI2kXFd"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Copy of ID / Passport",
                        id:"KRj1TOR5cVM"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Copy of Resident Permit",
                        id:"cUObXSGtCuD"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Work Permit / Waver",
                        id:"g9jXH9LJyxU"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Qualification Certificates",
                        id:"pelCBFPIFY1"
                    },
                    {
                        valueType:"TEXT",
                        optionSet:{
                            options:[
                                // {
                                //     code:"NMCB practicing licence",
                                //     sortOrder:1,
                                //     displayName:"NMCB practicing licence",
                                //     id:"y8HzYzIhkYW"
                                // },
                                {
                                    code:"BHPC certificate",
                                    sortOrder:2,
                                    displayName:"BHPC certificate",
                                    id:"AAZPTPI9tqp"
                                }
                            ],
                            displayName: "Type of health profession license",
                            id:"z4traZ7bw2K"
                        },
                        displayFormName:"Type of health profession license",
                        id:"K3nP8CUkNYi"
                    },
                    // {
                    //     valueType:"FILE_RESOURCE",
                    //     displayFormName:"Certified copy of current NMCB practicing licence",
                    //     id:"uP51La6owLL"
                    // },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Certified copy of BHPC blue card",
                        id:"T93on56IQbF"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Professional reference1",
                        id:"yP49GKSQxPl"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Professional reference2",
                        id:"lC217zTgC6C"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Confidential reference from head of institution where applicant is/was currently employed.",
                        id:"NO7wjA7T9uy"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Any other pertinent document",
                        id:"KIophtKLS2U"
                    }
                ],
                id:"Ld4CaGrILFP"
            },
            {
                name:"Building Facility Details: Uploads",
                dataElements:[
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Buildings (drawings)",
                        id:"TwsdfdV7quX"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Architectural sketches/plans including alterations before and after in case of existing structures",
                        id:"cfPdHbFkPOA"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Intent to lease",
                        id:"Wbh1nd3fQlo"
                    }
                ],
                id:"yyicYtQ2F20"
            },
            {
                name:"Special Circumstances",
                dataElements:[
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Special circumstances - Radiographers ",
                        id:"ow8gGqHozjU"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Special circumstances - Applications for out-reach services ",
                        id:"HR8BEjSx1jE"
                    },
                    {
                        valueType:"FILE_RESOURCE",
                        displayFormName:"Special circumstances - Applications for permissions to engage a practitioner in an existing practice ",
                        id:"g7GDrJ4FFPS"
                    }
                ],
                id:"r9PIFKQkOrx"
            },
            {
                name:"Compliance",
                dataElements:[
                    {
                        valueType:"TRUE_ONLY",
                        displayFormName:"Application Submitted",
                        id:"N3bVE3GRqdf"
                    },
                    {
                        valueType:"BOOLEAN",
                        displayFormName:"Passed MOH Screening",
                        id:"NMTFfpLaGAy"
                    },
                    {
                        valueType:"BOOLEAN",
                        displayFormName:"Complied for Licensing",
                        id:"SIq5ADQjCEM"
                    },
                    {
                        valueType:"DATETIME",
                        displayFormName:"Date of Compliance",
                        id:"qUPuhqpvCwV"
                    }
                ],
                id:"UAYnCl0qku8"
            }
        ]
    },
    required_map: {

    }
};

export const BW_ORGANISATION_UNIT_ID = `${import.meta.env.VITE_FACILITY_BW_ORG_UNIT_ID}`;

export const FACILITY_REGISTRATION_FORM = {
    REQUIRED_FIELDS: [
        {
            name: "Private Practice Number",
            id: 'aMFg2iq9VIg', // Private Practice Number
        },
        {
            name: "Name of the License Holder",
            id: 'HMk4LZ9ESOq', // Name of the License Holder
        },
        {
            name: "Surname of License Holder",
            id: 'ykwhsQQPVH0', // Surname of License Holder
        },
        {
            name: "Name of Facility to be Registered",
            id: 'PdtizqOqE6Q', // Name of Facility to be Registered
        },
        {
            name: "Location in Botswana",
            id: 'VJzk8OdFJKA'  // Location in Botswana
        },

    ]
}