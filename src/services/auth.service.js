/**
 * Created by fulle on 2025/07/04.
 */
import httpService from './http.service';
import StorageService from './storage.service';
import { getAuthToken, setAuthToken, clearAuth } from './http.service';
import { STORAGE_KEYS } from './constants';
import {eventBus, EVENTS} from '../events';

const svc_name = "auth_service";

// Function to generate a valid DHIS2 standard UID
const generateDhis2Uid = () => {
    // DHIS2 UIDs are 11 characters
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uid = '';

    // First character should be a letter (DHIS2 convention)
    uid += alphabet[Math.floor(Math.random() * 52)]; // Only letters for first char

    // Generate the remaining 10 characters (can be letters or numbers)
    for (let i = 0; i < 10; i++) {
        uid += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return uid;
};

const generateAuthToken = (username, password) => {
    return btoa(`${username}:${password}`);
};

const AuthService = {
    login: async (credentials) => {
        const method = "login";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            const response = await httpService.post('/auth/login', credentials);
            /*const { token, refreshToken, user } = response;

            // Store tokens and user data
            StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
            StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            StorageService.set(STORAGE_KEYS.USER_DATA, user);

            // Set auth header
            httpService.setAuthToken(token);

            return user;*/
            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },

    logout: async () => {
        /*try {
            await httpService.post('/auth/logout');
        } catch(error) {
            window.console.log("logout", error);
            httpService.clearAuth();
        }*/
        return await clearAuth();
    },
    clearAuth: async() => {
        return clearAuth();
    },
    forgotPassword: async (credentials) => {
        const method = "forgotPassword";
        delete httpService.defaults.headers.common['Authorization'];
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            const response = await httpService.post('/auth/forgotPassword', credentials, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            window.console.log(response);
            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            let message = 'Request failed';

            // Extract error message from response
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.message) {
                message = error.message;
            }

            // Create proper error object
            const serviceError = new Error(message);
            serviceError.details = error.response?.data;

            window.console.error(`${method} error:`, serviceError);
            throw serviceError;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    resetPassword: async (credentials) => {
        const method = "resetPassword";
        delete httpService.defaults.headers.common['Authorization'];
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            await clearAuth();
            const response = await httpService.post('/auth/resetPassword', credentials, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            window.console.log(response);
            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    registerEmail: async (credentials) => {
        const method = "resetPassword";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            const response = await httpService.post('/auth/registration', credentials);
            window.console.log(response);
            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    registerComplete: async (credentials) => {
        const method = "registerComplete";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        try {
            const response = await httpService.post('/auth/registration', credentials);
            window.console.log(response);
            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        } finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },

    me: async(credentials) => {
        const method = "me";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        const authorization_creds = generateAuthToken(credentials.username, credentials.password);

        window.console.log(credentials);
        try {
            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const responsePromise = await httpService.get('/me', {
                headers: {
                    'Authorization': `Basic ${authorization_creds}`
                }
            });

            const response = await Promise.race([responsePromise, timeoutPromise]);

            setAuthToken(authorization_creds, 'Basic');
            // Set credentials using helper for consistency
            await import('../utils/credentialHelper').then(module => 
              module.setCredentials(authorization_creds)
            );
            window.console.log(response);
            /*const { token, refreshToken, user } = response;

            // Store tokens and user data
            StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
            StorageService.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            StorageService.set(STORAGE_KEYS.USER_DATA, user);

            // Set auth header
            httpService.setAuthToken(token);*/

            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            // Ensure loading is hidden even on error - NOT NEEDED WHEN USING FINALLY
            //eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "me"});
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "me"});
        }
    },
    requestOtp: async(data) => {
        const method = "requestOtp";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        window.console.log(data);
        try {
            const response = httpService.post(`email2/api/send-otp`, data);

            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },

    refreshToken: async (refreshToken) => {
        const response = await httpService.post('/auth/refresh', { refreshToken });
        return response;
    },

    me2Step: async(credentials) => {
        const method = "me2StepEmailOtp";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});

        window.console.log(credentials);
        try {
            if(!credentials || !credentials.username || !credentials.password)
                throw new Error('Access Denied');

            const authorization_creds = generateAuthToken(credentials.username,credentials.password);
            await StorageService.set(STORAGE_KEYS.KEY_2STEP, credentials);
            const response = await httpService.get('/me', {
                headers: {
                    'Authorization': `Basic ${authorization_creds}`
                }
            });

            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    getCurrentUser: () => {
        return StorageService.get(STORAGE_KEYS.USER_DATA);
    },
    registrationDHISDev: async (data) => {
        const method = "me";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        const authorization_creds = 'YWRtaW46NUFtNTM4MDgwNTNA';

        try {

            const response = await httpService.post('/40/users', {
                email: data.email,
                username: data.email,
                password: data.password,
                surname: data.email,
                firstName: data.email,
                userRoles: [{ id: "aOxLneGCVvO" }],
                organisationUnits: [{ id: "OVpBNoteQ2Y" }],
                twitter: generateDhis2Uid()

            }, {
                headers: {
                    'Authorization': `Basic ${authorization_creds}`
                }
            });

            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: method});
        }
    },
    fetchOrganisationUnit: async() => {
        const method = "fetchOrganisationUnit";
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        let token = await getAuthToken('Basic');
        window.console.log(token);
        try {

            const response = await httpService.get('/me?fields=organisationUnits[displayName]', {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });
            return  response;
        } catch (error) {
            window.console.error(`${method} error:`, error);
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    changePassword: async(data) => {
        const method = "changePassword";
        const token = await getAuthToken('Basic');
        eventBus.emit(EVENTS.LOADING_SHOW, { source: svc_name, method: method});
        window.console.log(data);
        try {

            const response = await httpService.put('/me/changePassword', data, {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });

            window.console.log(response);
            return response;
        } catch (error) {
            window.console.error(`${method} error:`, error);

            // Ensure loading is hidden even on error - NOT NEEDED WHEN USING FINALLY
            //eventBus.emit(EVENTS.LOADING_HIDE, { source: "auth_service", method: "me"});
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: svc_name, method: method});
        }
    },
    verify2StepCredentials: async (username, password) => {
        const credentials = await StorageService.get(STORAGE_KEYS.KEY_2STEP);
        if(credentials.username !== username || credentials.password !== password)
            return false;

        return true;
    },
    clear2StepCredentials: async() => {
        return await StorageService.remove(STORAGE_KEYS.KEY_2STEP);
    },
    success2StepAuth: async() => {
        const credentials = await StorageService.get(STORAGE_KEYS.KEY_2STEP);
        const authorization_creds = generateAuthToken(credentials.username, credentials.password);
        setAuthToken(authorization_creds, 'Basic');
        // Set credentials using helper for consistency
        await import('../utils/credentialHelper').then(module => 
          module.setCredentials(authorization_creds)
        );
        return await StorageService.remove(STORAGE_KEYS.KEY_2STEP);
    }
};

export default AuthService;